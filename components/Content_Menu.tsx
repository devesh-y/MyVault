import {AiOutlineFolderAdd} from "react-icons/ai";
import {MdUploadFile} from "react-icons/md";
import React, {memo, useCallback, useEffect} from "react"
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { PiShareFill } from "react-icons/pi";
import { MdDelete } from "react-icons/md";
import {generalDir} from "./Documents.tsx";
import {database} from "../utils/firebaseconf.ts";
import {doc,getDoc} from "firebase/firestore";
import {useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {StoreType} from "../ReduxStore/store.ts";
import {User} from "firebase/auth";

export const Context_Menu=memo(({content,myFileInput,menu}:{content:(boolean|string|number|generalDir)[],myFileInput:React.RefObject<HTMLInputElement>,menu: React.RefObject<HTMLDivElement>})=>{
	const {dir_path}=useParams();
	const UserInfo=useSelector((store:StoreType)=>store.slice1.UserInfo)

	useEffect(() => {
		if(content[0]){
			menu.current!.style.height=menu.current?.scrollHeight+"px";
		}
	}, [content, menu]);

	const renameFile=useCallback((tempfile:generalDir)=>{
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
		const oldRef=doc(database,currpath+"/files",tempfile.id!)
		getDoc(oldRef).then((res)=>{
			console.log(res.data());
		});

	},[UserInfo, dir_path])
	if(content[0]){
		if(content[3]=="File"){
			return <>
				<div onClick={()=>renameFile(content[4] as generalDir)} >
					<MdOutlineDriveFileRenameOutline size={25}/>
					<p >Rename</p>
				</div>
				<div>
					<IoIosInformationCircleOutline size={25}/>
					<p>File Info</p>
				</div>
				<div>
					<PiShareFill size={25}/>
					<p>Share</p>
				</div>
				<div>
					<MdDelete size={25}/>
					<p>Delete</p>
				</div>
			</>
		}
		else if(content[3]=="Folder"){
			return <>
				<div>
					<MdOutlineDriveFileRenameOutline size={25}/>
					<p>Rename</p>
				</div>
				<div>
					<IoIosInformationCircleOutline size={25}/>
					<p>Folder Info</p>
				</div>
				<div>
					<MdDelete size={25}/>
					<p>Delete</p>
				</div>
			</>
		}
		else{
			return <>
				<div>
					<AiOutlineFolderAdd size={25}/>
					<p>New folder</p>
				</div>
				<div>
					<MdUploadFile size={25}/>
					<p onClick={()=>myFileInput.current?.click()}>File upload</p>
				</div>
			</>
		}
	}
	else{
		return <></>
	}
})