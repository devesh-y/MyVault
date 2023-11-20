import {useNavigate, useParams} from "react-router-dom";
import {collection, getDocs, setDoc, doc} from "firebase/firestore";
import {database, fireStorage} from "../utils/firebaseconf.ts";
import {useEffect, useMemo, useRef} from "react";
import {User} from "firebase/auth"
import React,{useCallback, useState} from "react";
import {GetCookie} from "../utils/get_set_cookies.ts";
import {useDispatch, useSelector} from "react-redux";
import {setUserInfo} from "../ReduxStore/slice.ts";
import {StoreType} from "../ReduxStore/store.ts";
import {SHA256} from "crypto-js";
import {ref, uploadBytes} from "firebase/storage";
import {FileDocs} from "./FileDocs.tsx";
import {FolderDocs} from "./FolderDocs.tsx"
import {Flex,Button,Dialog,TextField} from "@radix-ui/themes"
export type generalDir ={
	name:string,
	timestamp?:Date,
	id?:string,
	access_id?:string,
	extension?:string
}

export const Documents=()=>{
	const navigate=useNavigate();
	const {dir_path}=useParams();
	const [Files,setFiles]=useState(new Array<generalDir>());
	const [Folders,setFolders]=useState(new Array<generalDir>());
	const UserInfo=useSelector((store:StoreType)=>store.slice1.UserInfo)
	const dispatch=useDispatch();
	const myFileInput=useRef<HTMLInputElement>(null)
	//retrieve docs
	const RetrieveDocs=useCallback( ()=>{
		if(UserInfo!=""){
			const {email}:User=JSON.parse(UserInfo)
			const tempfiles=new Array<generalDir>()
			const tempfolders=new Array<generalDir>()
			let finalpath=email!;
			const pathArray=dir_path!.split('/');
			pathArray.forEach((value,index,pathArray)=>{
				finalpath+="/"+value;
				if(index<pathArray.length-1)
				{
					finalpath+="/folders";
				}
			})
			getDocs(collection(database,finalpath+"/folders")).then((response)=>{
				response.forEach((doc)=>{
					tempfolders.push({name:doc.data().name,id:doc.id})
				})
				setFolders(tempfolders);
			})
			getDocs(collection(database,finalpath+"/files")).then((response)=>{
				response.forEach((doc)=>{
					tempfiles.push({name:doc.data().name,id:doc.id,access_id:doc.data().access_id,extension:doc.data().extension})
				})
				setFiles(tempfiles);
			})

		}
	},[UserInfo, dir_path]);

	//get cookie
	const response=useMemo(()=>{
		return GetCookie();
	},[])
	//page routing if cookie not available
	useEffect(()=>{
		
		if(!response){
			navigate('/login',{replace:true});
		}
		else{
			if(UserInfo==""){
				dispatch(setUserInfo(response));
			}
			else if(dir_path!.substring(0,4)=="root"){
				RetrieveDocs();
			}
			else{
				navigate("/wrong_page",{replace:true});
			}
		}

	},[RetrieveDocs, UserInfo, dir_path, dispatch, navigate, response])

	const upload_files=useCallback(async()=>{
		if(myFileInput.current?.files){
			const {email}:User=JSON.parse(UserInfo)
			let finalpath=email!;
			const pathArray=dir_path!.split('/');
			pathArray.forEach((value,index,pathArray)=>{
				finalpath+="/"+value;
				if(index<pathArray.length-1)
				{
					finalpath+="/folders";
				}
			})
			
			const fileList=myFileInput.current.files;
			const tempFiles:generalDir[]=[];
			for(const file of fileList){
				const filename=file.name;
				const arr=filename.split('.');
				const fileExt=arr[arr.length-1];
				const CurrDateTime=(new Date().getTime()).toString();
				const uniqueId=SHA256(CurrDateTime+email).toString();
				const filePath=uniqueId+"."+fileExt;
				const storeRef=ref(fireStorage,filePath);
				try
				{
					await uploadBytes(storeRef,file);
					console.log("uploaded")

					await setDoc(doc(database,finalpath+"/files",CurrDateTime),{name:filename,access_id:uniqueId,extension:fileExt});
					await setDoc(doc(database,"access_files_db",uniqueId),{host_email:email,allowed_users:[],extension:fileExt})
					tempFiles.push({name:filename,id:CurrDateTime});
				}
				catch(err){
					return new Promise((_resolve,reject)=>{
						reject("error in uploading files");
					})

				}
			}
			setFiles([...Files,...tempFiles]);
			return new Promise((resolve)=>{
				resolve("all files uploaded")
			})

		}
	},[Files, UserInfo, dir_path])

	// drag-n-drop
	const DropEventFunc=useCallback((e:React.DragEvent<HTMLDivElement>)=>{
		e.preventDefault();
		e.currentTarget.style.backgroundColor="white";
		if(e.dataTransfer?.files){
			myFileInput.current!.files=e.dataTransfer.files;
			upload_files().then((message) =>console.log(message) ).catch((err)=>console.log(err));
		}
	},[upload_files])


	const [newFolderName,setNewFolderName]=useState("");
	const createNewFolderfunc=useCallback(()=>{
		const {email}:User=JSON.parse(UserInfo)
		let finalpath=email!;
		const pathArray=dir_path!.split('/');
		pathArray.forEach((value,index,pathArray)=>{
			finalpath+="/"+value;
			if(index<pathArray.length-1)
			{
				finalpath+="/folders";
			}
		})
		const CurrDateTime=(new Date().getTime()).toString();
		if(newFolderName!=""){
			setDoc(doc(database,finalpath+"/folders",CurrDateTime),{name:newFolderName}).then(()=>{
				console.log("folder created successfully");
				setFolders([...Folders,{name:newFolderName,id:CurrDateTime}]);
				setNewFolderName("");
			}).catch(()=>{
				console.log("error in folder creation");
			})
		}
	},[Folders, UserInfo, dir_path, newFolderName]);

	return <div id={"documents-page"} onDragOver={(e)=> {
		e.preventDefault();
		e.currentTarget.style.backgroundColor = "#c0d1ef"
	}} onDragLeave={(e)=> {
		e.preventDefault();
		e.currentTarget.style.backgroundColor = "white"
	}} onDropCapture={(e)=>DropEventFunc(e)}>

		<Flex gap="3">

			<Dialog.Root>
				<Dialog.Trigger>
					<Button color="crimson" variant="soft">
						New Folder
					</Button>
				</Dialog.Trigger>

				<Dialog.Content style={{ maxWidth: 450 }}>
					<Dialog.Title>New Folder</Dialog.Title>
					<TextField.Input value={newFolderName} onChange={(e)=>setNewFolderName(e.currentTarget.value)}/>
					<Flex gap="3" mt="4" justify="end">
						<Dialog.Close>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</Dialog.Close>
						<Dialog.Close>
							<Button onClick={createNewFolderfunc}>Save</Button>
						</Dialog.Close>
					</Flex>
				</Dialog.Content>
			</Dialog.Root>
			<Button color="orange" variant="soft" onClick={()=>myFileInput.current!.click()}>
				Upload File
			</Button>
		</Flex>

		<input type={"file"} ref={myFileInput} hidden onChange={upload_files} multiple/>

		{Folders.length>0?<p style={{margin:"10px 0px",fontWeight:700}}>Folders</p>:<></>}
		<div id={"documents-folders"}>
			{
				Folders.map((value,index)=>{
					return <FolderDocs key={index} folder_info={value} RetrieveDocs={RetrieveDocs}/>
				})
			}
		</div>
		{Files.length>0?<p style={{margin:"10px 0px",fontWeight:700}}>Files</p>:<></>}
		<div id={"documents-files"}>
			{
				Files.map((value,index)=>{
					return <FileDocs key={index} file_info={value} RetrieveDocs={RetrieveDocs} />
				})
			}
		</div>
	</div>
}