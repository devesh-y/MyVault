import {useNavigate, useParams} from "react-router-dom";
import {collection,getDocs,setDoc,doc} from "firebase/firestore";
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

export type generalDir ={
	name:string,
	db_url?:string,
	timestamp?:Date
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
					tempfolders.push({name:doc.id})
				})
				setFolders(tempfolders);
			})
			getDocs(collection(database,finalpath+"/files")).then((response)=>{
				response.forEach((doc)=>{
					tempfiles.push({name:doc.id,db_url:doc.data().db_url})
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
				const filePath=email!+"/"+dir_path!+"/"+filename;
				const storeRef=ref(fireStorage,filePath);
				try
				{
					const snapshot=await uploadBytes(storeRef,file);
					console.log("uploaded")
					const url=await getDownloadURL(snapshot.ref);
					await setDoc(doc(database,finalpath+"/files",filename),{db_url:url});
					tempfiles.push({name:filename,db_url:url});
				}
				catch(err){
					console.log("error in uploading")
				}
			}
			setFiles([...Files,...tempfiles]);

		}
	},[Files, UserInfo, dir_path])

	// drag-n-drop
	const DropEventFunc=useCallback((e:React.DragEvent<HTMLDivElement>)=>{
		e.preventDefault();
		e.currentTarget.style.backgroundColor="white";
		if(e.dataTransfer?.files){
			myFileInput.current!.files=e.dataTransfer.files;
			upload_files();
		}
	},[upload_files])
	const ShowContextMenu=useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>,type:string,value:generalDir)=>{
		e.preventDefault();
		e.stopPropagation();
		SetContextContent([true,(e.clientX-4),(e.clientY-4),type,value]);
	},[])
	
	return <div id={"documents-page"} onContextMenu={(e)=>ShowContextMenu(e,"Page",{name:""})} onDragOver={(e)=> {
		e.preventDefault();
		e.currentTarget.style.backgroundColor = "#c0d1ef"
	}} onDragLeave={(e)=> {
		e.preventDefault();
		e.currentTarget.style.backgroundColor = "white"
	}} onDropCapture={(e)=>DropEventFunc(e)}>

		<input type={"file"} ref={myFileInput} hidden onChange={upload_files} multiple/>

		<div ref={ContextRef} style={{left:ContextMenuContent[1] as number,top:ContextMenuContent[2] as number}} id={"context-menu"} onMouseLeave={(e)=>e.currentTarget.style.height="0px"}>
			<Context_Menu content={ContextMenuContent} myFileInput={myFileInput} menu={ContextRef} />
		</div>
		{Folders.length>0?<p style={{margin:"10px 0px",fontWeight:700}}>Folders</p>:<></>}
		<div id={"documents-folders"}>
			{
				Folders.map((value,index)=>{
					return <div key={index} title={value.name} onContextMenu={(e)=>ShowContextMenu(e,"Folder",value)}>
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
					return <div key={index} title={value.name} onContextMenu={(e)=>ShowContextMenu(e,"File",value)}>
						<p style={{width:200,height:20,textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{value.name}</p>
						<div onClick={(e)=>ShowContextMenu(e,"File",value)}>
							<BsThreeDotsVertical size={14}/>
						</div>

					</div>
				})
			}
		</div>
	</div>

}