import {Button, ContextMenu, Dialog, Flex, TextField,DropdownMenu} from "@radix-ui/themes";
import {useCallback, useRef, useState,memo} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {StoreType} from "../ReduxStore/store.ts";
import {User} from "firebase/auth"
import {updateDoc, doc, deleteDoc} from "firebase/firestore";
import {database} from "../utils/firebaseconf.ts";
import {BsThreeDotsVertical} from "react-icons/bs";
import {generalDir} from "./Documents.tsx";
import {RiDeleteBin6Line} from "react-icons/ri";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import {IoMdInformationCircleOutline} from "react-icons/io";

export const FolderDocs=memo(({folder_info,RetrieveDocs}:{folder_info:generalDir,RetrieveDocs:()=>void})=>{
	const {dir_path}=useParams();
	const UserInfo=useSelector((store:StoreType)=>store.slice1.UserInfo);
	const [input,setInput]=useState("");
	const navigate=useNavigate();
	const rename_folder_func=useCallback( ()=>{
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
		const oldRef=doc(database,currpath+"/folders",folder_info.id!)
		updateDoc(oldRef, {
			name: input
		}).then(()=> {
			console.log("renamed successfully")
			RetrieveDocs();
		});
	},[RetrieveDocs, UserInfo, dir_path, folder_info.id, input])
	const openFolder=useCallback((value:generalDir)=>{
		let finalpath=dir_path!;
		finalpath+="/";
		finalpath+=value.id;
		finalpath=encodeURIComponent(finalpath);
		navigate("/"+finalpath,{replace:true});
	},[dir_path, navigate])
	const PromtTrigger=useRef<HTMLButtonElement>(null)
	const deleteFolderFunc=useCallback(()=>{
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
		deleteDoc(doc(database,currpath+"/folders",folder_info.id!)).then(()=>{
			console.log("folder deleted");
			RetrieveDocs();
		}).catch(()=>{
			console.log("error in deleting folder");
		})

	},[RetrieveDocs, UserInfo, dir_path, folder_info.id])
	return <ContextMenu.Root>
		<ContextMenu.Trigger >
			<div>
				<div title={folder_info.name}  onDoubleClick={()=>openFolder(folder_info)} style={
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
					<p style={{width:200,textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{folder_info.name}</p>
					<div>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<div>
									<BsThreeDotsVertical size={14}/>
								</div>

							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Item onClick={()=>PromtTrigger.current!.click()} >
									<Flex gap={"3"} align={"center"}>
									<MdOutlineDriveFileRenameOutline />
									Rename
									</Flex>
								</DropdownMenu.Item>
								<DropdownMenu.Item >
									<Flex gap={"3"} align={"center"}>
									<IoMdInformationCircleOutline/>
									Folder Info
									</Flex>
									</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item  color="red" onClick={deleteFolderFunc}>
									<Flex gap={"3"} align={"center"}>
									<RiDeleteBin6Line/>
									Delete
									</Flex>
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
								<Button onClick={rename_folder_func}>Save</Button>
							</Dialog.Close>
						</Flex>
					</Dialog.Content>
				</Dialog.Root>
			</div>

		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item onClick={()=>PromtTrigger.current!.click()} >
				<Flex gap={"3"} align={"center"}>
				<MdOutlineDriveFileRenameOutline/>
				Rename
				</Flex>
			</ContextMenu.Item>
			<ContextMenu.Item>
				<Flex gap={"3"} align={"center"}>
				<IoMdInformationCircleOutline/>
				Folder Info
				</Flex>
				</ContextMenu.Item>
			<ContextMenu.Separator />
			<ContextMenu.Item  color="red" onClick={deleteFolderFunc}>
				<Flex gap={"3"} align={"center"}>
				<RiDeleteBin6Line/>
				Delete
				</Flex>
			</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>
})

