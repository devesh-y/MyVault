import {AiOutlineFolderAdd} from "react-icons/ai";
import {MdUploadFile} from "react-icons/md";
import React, {memo, useCallback, useEffect} from "react"
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { PiShareFill } from "react-icons/pi";
import { MdDelete } from "react-icons/md";
import {generalDir, PromtCont} from "./Documents.tsx";


export const Context_Menu=memo(({content,myFileInput,menu,SetPromtContent}:{content:(boolean|string|number|generalDir)[],myFileInput:React.RefObject<HTMLInputElement>,menu: React.RefObject<HTMLDivElement>,SetPromtContent:React.Dispatch<React.SetStateAction<PromtCont>>})=>{

	useEffect(() => {
		if(content[0]){
			menu.current!.style.height=menu.current?.scrollHeight+"px";
		}
	}, [content, menu]);

	const renameFile=useCallback((tempfile:generalDir)=>{
		
		SetPromtContent({title:"Rename",topic:"File-Rename",info:tempfile.id!})
	},[SetPromtContent])
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