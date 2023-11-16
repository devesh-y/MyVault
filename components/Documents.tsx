import {useNavigate, useParams} from "react-router-dom";
import {collection, getDocs, setDoc, doc, updateDoc} from "firebase/firestore";
import {database, fireStorage} from "../utils/firebaseconf.ts";
import {useEffect, useRef} from "react";
import {User} from "firebase/auth"
import React,{useCallback, useMemo, useState} from "react";
import {GetCookie} from "../utils/get_set_cookies.ts";
import {useDispatch, useSelector} from "react-redux";
import {setUserInfo} from "../ReduxStore/slice.ts";
import {StoreType} from "../ReduxStore/store.ts";
import {BsThreeDotsVertical} from "react-icons/bs"
import {ref, uploadBytes,getDownloadURL} from "firebase/storage";
import {Context_Menu} from "./Content_Menu.tsx";
import {Dialog,Button,Flex,TextField} from "@radix-ui/themes"
export type generalDir ={
	name:string,
	db_url?:string,
	timestamp?:Date,
	id?:string,
}
export type PromtCont={
	title:string,
	topic:string,
	info:string
}
export const Documents=()=>{
	const [ContextMenuContent,SetContextContent]=useState([false,0,0,"",{name:""}]); //visible, x,y,type,dirinfo
	const navigate=useNavigate();
	const {dir_path}=useParams();
	const [Files,setFiles]=useState(new Array<generalDir>());
	const [Folders,setFolders]=useState(new Array<generalDir>());
	const UserInfo=useSelector((store:StoreType)=>store.slice1.UserInfo)
	const dispatch=useDispatch();
	const myFileInput=useRef<HTMLInputElement>(null)
	const ContextRef=useRef<HTMLDivElement>(null);
	const ShowPromt=useRef<HTMLButtonElement>(null);
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
					tempfiles.push({name:doc.data().name,db_url:doc.data().db_url,id:doc.id})
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
			dispatch(setUserInfo(response))
			RetrieveDocs();
		}

	},[RetrieveDocs, UserInfo, dispatch, navigate, response])

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
			const tempfiles:generalDir[]=[];
			for(const file of fileList){
				const filename=file.name;
				const its_id=(new Date().getTime()).toString();
				const filePath=email!+"/"+dir_path!+"/"+its_id;
				const storeRef=ref(fireStorage,filePath);
				try
				{
					const snapshot=await uploadBytes(storeRef,file);
					console.log("uploaded")
					const url=await getDownloadURL(snapshot.ref);
					await setDoc(doc(database,finalpath+"/files",its_id),{name:filename,db_url:url});
					tempfiles.push({name:filename,db_url:url,id:its_id});
				}
				catch(err){
					return new Promise((_resolve,reject)=>{
						reject("error in uploading files");
					})

				}
			}
			setFiles([...Files,...tempfiles]);
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

	const ShowContextMenu=useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>,type:string,value:generalDir)=>{
		e.preventDefault();
		e.stopPropagation();
		SetContextContent([true,(e.clientX-4),(e.clientY-4),type,value]);
	},[])

	const openFile=useCallback((value:generalDir)=>{
		const a=document.createElement("a");
		a.download=value.name;
		a.href=value.db_url!;
		a.target="_blank";
		a.click();
	},[])
	
	const openFolder=useCallback((value:generalDir)=>{
		let finalpath=dir_path!;
		finalpath+="/";
		finalpath+=value.id;
		finalpath=encodeURIComponent(finalpath);
		navigate("/"+finalpath);
	},[dir_path, navigate])
	const [PromtContent,SetPromtContent]=useState({title:"",topic:"",info:""});
	useEffect(() => {
		if(PromtContent.title!=""){
			ShowPromt.current!.click();
		}
	}, [PromtContent]);
	const PromtBox=()=>{
		const [input,setInput]=useState("");
		const perform_task=useCallback(()=>{
			if(PromtContent.topic=="File-Rename"){
				const arr=dir_path!.split("/")!;
				const {email}:User=JSON.parse(UserInfo)
				let currpath=email!;
				arr.forEach((value,index,arr)=>{
					currpath+="/";
					currpath+=value;
					if(index<arr.length-1){
						currpath+="/folders";
					}
				})
				const oldRef=doc(database,currpath+"/files",PromtContent.info)
				updateDoc(oldRef, {
					name: input
				}).then(()=> {
					console.log("renamed successfully")
					RetrieveDocs();
				});
			}
		},[input])
		return <Dialog.Root>
			<Dialog.Trigger>
				<Button ref={ShowPromt} style={{display:"none"}} >Click</Button>
			</Dialog.Trigger>
			<Dialog.Content style={{ maxWidth: 450 }}>
				<Dialog.Title>{PromtContent.title}</Dialog.Title>
				<TextField.Input value={input} onChange={(e)=>setInput(e.currentTarget.value)} />
				<Flex gap="3" mt="4" justify="end">
					<Dialog.Close>
						<Button variant="soft" color="gray">
							Cancel
						</Button>
					</Dialog.Close>
					<Dialog.Close>
						<Button onClick={perform_task}>Save</Button>
					</Dialog.Close>
				</Flex>
			</Dialog.Content>
		</Dialog.Root>
	}


	return <div id={"documents-page"} onContextMenu={(e)=>ShowContextMenu(e,"Page",{name:""})} onDragOver={(e)=> {
		e.preventDefault();
		e.currentTarget.style.backgroundColor = "#c0d1ef"
	}} onDragLeave={(e)=> {
		e.preventDefault();
		e.currentTarget.style.backgroundColor = "white"
	}} onDropCapture={(e)=>DropEventFunc(e)}>

		<PromtBox  />

		<input type={"file"} ref={myFileInput} hidden onChange={upload_files} multiple/>

		<div ref={ContextRef} style={{left:ContextMenuContent[1] as number,top:ContextMenuContent[2] as number}} id={"context-menu"} onMouseLeave={(e)=>e.currentTarget.style.height="0px"}>
			<Context_Menu content={ContextMenuContent} myFileInput={myFileInput} menu={ContextRef} SetPromtContent={SetPromtContent}/>
		</div>
		{Folders.length>0?<p style={{margin:"10px 0px",fontWeight:700}}>Folders</p>:<></>}
		<div id={"documents-folders"}>
			{
				Folders.map((value,index)=>{
					return <div key={index} title={value.name} onContextMenu={(e)=>ShowContextMenu(e,"Folder",value)}
								onDoubleClick={()=>openFolder(value)}>
						<p style={{width:200,height:20,textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{value.name}</p>
						<div onClick={(e)=>ShowContextMenu(e,"Folder",value)}>
							<BsThreeDotsVertical size={14}/>
						</div>
					</div>
				})
			}
		</div>
		{Files.length>0?<p style={{margin:"10px 0px",fontWeight:700}}>Files</p>:<></>}
		<div id={"documents-files"}>
			{
				Files.map((value,index)=>{
					return <div key={index} title={value.name} onContextMenu={(e)=>ShowContextMenu(e,"File",value)}
								onDoubleClick={()=>openFile(value)}>
						<p style={{width:200,height:20,textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{value.name}</p>
						<div onClick={(e)=>ShowContextMenu(e,"File",value)} >
							<BsThreeDotsVertical size={14}/>
						</div>
					</div>
				})
			}
		</div>
	</div>
}