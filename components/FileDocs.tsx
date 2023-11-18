import {Button, ContextMenu, Dialog, DropdownMenu, Flex, TextField} from "@radix-ui/themes";
import {useCallback, useRef, useState,memo} from "react";
import {useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {StoreType} from "../ReduxStore/store.ts";
import {User} from "firebase/auth"
import {updateDoc,doc,deleteDoc} from "firebase/firestore";
import {database,fireStorage} from "../utils/firebaseconf.ts";
import {BsThreeDotsVertical} from "react-icons/bs";
import {generalDir} from "./Documents.tsx";
import {ref,deleteObject} from "firebase/storage";

export const FileDocs=memo(({file_info,openFile,RetrieveDocs}:{file_info:generalDir,openFile:(value: generalDir) => void,RetrieveDocs:()=>void})=>{
	const {dir_path}=useParams();
	const UserInfo=useSelector((store:StoreType)=>store.slice1.UserInfo);
	const [input,setInput]=useState("");
	const rename_file_func=useCallback( ()=>{
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
		const oldRef=doc(database,currpath+"/files",file_info.id!)
		updateDoc(oldRef, {
			name: input
		}).then(()=> {
			console.log("renamed successfully")
			RetrieveDocs();
		});
	},[RetrieveDocs, UserInfo, dir_path, file_info.id, input])
	const PromtTrigger=useRef<HTMLButtonElement>(null)
	const deleteFileFunc=useCallback(async ()=>{
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
		//delete from files database
		await deleteDoc(doc(database,currpath+"/files",file_info.id!))
		//delete from access_db
		await deleteDoc(doc(database,"access_files_db",file_info.access_id!))
		//delete from storage
		const deleteRef=ref(fireStorage,file_info.access_id+"."+file_info.extension);
		await deleteObject(deleteRef)
		RetrieveDocs();

	},[RetrieveDocs, UserInfo, dir_path, file_info.access_id, file_info.extension, file_info.id])
	return <ContextMenu.Root>
		<ContextMenu.Trigger >
			<div>
				<div title={file_info.name}  onDoubleClick={()=>openFile(file_info)} style={
					{
						width:"fit-content",
						borderRadius: "10px",
						padding:"10px",
						backgroundColor:"#e1f3eb",
						display:"flex",
						justifyContent:"space-between",
						alignItems:"center",
					}
				}>
					<p style={{width:200,textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{file_info.name}</p>
					<div>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<div>
									<BsThreeDotsVertical size={14}/>
								</div>

							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Item onClick={()=>PromtTrigger.current!.click()} >Rename</DropdownMenu.Item>
								<DropdownMenu.Item onClick={()=>openFile(file_info)}  >Download</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item >Share</DropdownMenu.Item>
								<DropdownMenu.Item >File Info</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item  color="red" onClick={deleteFileFunc}>
									Delete
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
				<Dialog.Root>
					<Dialog.Trigger  >
						<button ref={PromtTrigger} hidden={true}></button>
					</Dialog.Trigger>
					<Dialog.Content style={{ maxWidth: 450 }}>
						<Dialog.Title>Rename</Dialog.Title>
						<TextField.Input placeholder="..." value={input} onChange={(e)=>setInput(e.currentTarget.value)}/>
						<Flex gap="3" mt="4" justify="end">
							<Dialog.Close>
								<Button variant="soft" color="gray">
									Cancel
								</Button>
							</Dialog.Close>
							<Dialog.Close>
								<Button onClick={rename_file_func}>Save</Button>
							</Dialog.Close>
						</Flex>
					</Dialog.Content>
				</Dialog.Root>
			</div>

		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item onClick={()=>PromtTrigger.current!.click()} >Rename</ContextMenu.Item>
			<ContextMenu.Item onClick={()=>openFile(file_info)} >Download</ContextMenu.Item>
			<ContextMenu.Separator />
			<ContextMenu.Item >Share</ContextMenu.Item>
			<ContextMenu.Item>File Info</ContextMenu.Item>
			<ContextMenu.Separator />
			<ContextMenu.Item  color="red"  onClick={deleteFileFunc}>
				Delete
			</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>
})