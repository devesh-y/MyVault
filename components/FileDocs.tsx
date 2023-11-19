import {Button, ContextMenu, Dialog, DropdownMenu, Flex, TextField, Text, IconButton, ScrollArea} from "@radix-ui/themes";
import {useCallback, useRef, useState,memo} from "react";
import {useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {StoreType} from "../ReduxStore/store.ts";
import {User} from "firebase/auth"
import {updateDoc, doc, deleteDoc, getDoc} from "firebase/firestore";
import {database,fireStorage} from "../utils/firebaseconf.ts";
import {BsThreeDotsVertical} from "react-icons/bs";
import {generalDir} from "./Documents.tsx";
import { IoAdd } from "react-icons/io5";
import {ref,deleteObject} from "firebase/storage";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { GoDownload } from "react-icons/go";
import { MdOutlineShare } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoCopyOutline } from "react-icons/io5";
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
	const RenamePromtTrigger=useRef<HTMLButtonElement>(null)
	const SharePromtTrigger=useRef<HTMLButtonElement>(null);
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
	const copyLinkFunc=useCallback(()=>{
		navigator.clipboard.writeText(import.meta.env.VITE_WEBSITE+"/access/"+file_info.access_id).then(()=>{
			console.log("copied successfully");
		}).catch(()=>{
			alert("copy fails");
		})
	},[file_info.access_id])
	const [AlreadyAllowedUsers,SetAllowedUsers]=useState(new Array<string>());
	const fetchAllowedUsers=useCallback(()=>{
		const tempRef=doc(database,"access_files_db",file_info.access_id!);
		getDoc(tempRef).then((docSnap)=>{
			if(docSnap.exists()){
				const arr:string[]=docSnap.data().allowed_users;
				SetAllowedUsers(arr);
			}
		})
	},[file_info.access_id])
	const [addUserEmail,setAddUserEmail]=useState("");
	const allowUserFileFunc=useCallback(()=>{
		setAddUserEmail("");
		const {email}:User=JSON.parse(UserInfo)
		const emailRegex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		if(  addUserEmail!="" && !emailRegex.test(addUserEmail)){
			alert("wrong email address");
			return;
		}
		else{
			const tempRef=doc(database,"access_files_db",file_info.access_id!);
			getDoc(tempRef).then((docSnap)=>{
				if(docSnap.exists()){
					if(addUserEmail==""){
						updateDoc(tempRef, {
							allowed_users: ["*"]
						}).then(()=>{
							fetchAllowedUsers();
							console.log("access allowed to this user")
						}).catch(()=>{

							console.log("error in providing access");
						})
					}
					else{
						const arr:string[]=docSnap.data().allowed_users;
						const checkExists=arr.find((email)=>{
							return email===addUserEmail;
						})
						if( !(arr.length>0 && arr[0]=="*") && email!=addUserEmail && !checkExists ){
							const newArray=[...arr,addUserEmail];
							updateDoc(tempRef, {
								allowed_users: newArray
							}).then(()=>{

								fetchAllowedUsers();
								console.log("access allowed to this user")
							}).catch(()=>{

								console.log("error in providing access");
							})
						}
						else{

							console.log("already have access");
						}
					}


				}
			})
		}


	},[UserInfo, addUserEmail, fetchAllowedUsers, file_info.access_id])

	const RevokeAccessUser=useCallback((tempEmail:string)=>{
		const tempRef=doc(database,"access_files_db",file_info.access_id!);
		getDoc(tempRef).then((docSnap)=>{
			if(docSnap.exists()){
				const arr:string[]=docSnap.data().allowed_users;
				const index = arr.indexOf(tempEmail);
				if (index !== -1) {
					arr.splice(index, 1);
				}
				updateDoc(tempRef,{
					allowed_users:arr
				}).then(()=>{
					fetchAllowedUsers();
					console.log("access removed");
				}).catch(()=>{
					console.log("error in removing access");
				})
				

			}
		})
	},[fetchAllowedUsers, file_info.access_id])
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
								<DropdownMenu.Item onClick={()=>RenamePromtTrigger.current!.click()} >
									<Flex gap={"3"} align={"center"}>
										<MdOutlineDriveFileRenameOutline/>
										Rename
									</Flex>
								</DropdownMenu.Item>
								<DropdownMenu.Item onClick={()=>openFile(file_info)}  >
									<Flex gap={"3"} align={"center"}>
										<GoDownload/>
										Download
									</Flex>
									</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Sub>
									<DropdownMenu.SubTrigger>
										<Flex gap={"3"} align={"center"}>
											<MdOutlineShare/>
											Share
										</Flex>
									</DropdownMenu.SubTrigger>
									<DropdownMenu.SubContent>
										<DropdownMenu.Item onClick={()=> {
											SharePromtTrigger.current!.click()
											fetchAllowedUsers();
										}}>
											<Flex gap={"3"} align={"center"}>
												<MdOutlineShare/>
												Share
											</Flex>
										</DropdownMenu.Item>
										<DropdownMenu.Item>
											<Flex gap={"3"} align={"center"} onClick={copyLinkFunc}>
												<IoCopyOutline/>
												Copy link
											</Flex>

										</DropdownMenu.Item>
									</DropdownMenu.SubContent>
								</DropdownMenu.Sub>
								<DropdownMenu.Item >
									<Flex gap={"3"} align={"center"}>
										<IoMdInformationCircleOutline/>
										File Info
									</Flex>
									</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item  color="red" onClick={deleteFileFunc}>
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
						<button ref={RenamePromtTrigger} hidden={true}></button>
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
				<Dialog.Root>
					<Dialog.Trigger>
						<button hidden={true} ref={SharePromtTrigger}></button>
					</Dialog.Trigger>

					<Dialog.Content style={{ maxWidth: 450 }}>
						<Dialog.Title>Share {file_info.name}</Dialog.Title>
						<TextField.Root>
							<TextField.Input placeholder="Add user email" size="2" value={addUserEmail} onChange={(e)=>setAddUserEmail(e.currentTarget.value)}/>
							<TextField.Slot style={{visibility:(addUserEmail!=""?"visible":"hidden")}} onClick={allowUserFileFunc}>
								<IconButton size="1" >
									<IoAdd size={"20"}/>
								</IconButton>
							</TextField.Slot>

						</TextField.Root>
						<Text as="div" size="2" mb="1" mt={"2"} weight="medium">People with access</Text>
						<ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 100 }}  >
							{AlreadyAllowedUsers.length==0?<Text size={"2"}>None</Text>:<></>}
							{AlreadyAllowedUsers.map((email,index)=>{
								return <Flex key={index} align={"center"} justify={"between"} pr={"2"} mb={"2"}>
									<Text size={"2"}>{email=="*"?"Everyone":email}</Text>
									<Button color="crimson" variant="soft" onClick={()=>RevokeAccessUser(email)}>Revoke</Button>
								</Flex>
							})}

						</ScrollArea>
						<Text as="div" size="2" mb="1" mt={"2"} weight="medium">General access</Text>
						<Flex align={"center"} gap={"2"}  >
							<Button onClick={allowUserFileFunc} >Allow everyone </Button>
							<Flex gap={"1"} align={"center"} >
									<IoMdInformationCircleOutline />
								<Text size={"2"}>Anyone can read this file</Text>

							</Flex>

						</Flex>



						<Flex gap="3" mt="4" justify={"between"} >
							<div>
								<Button color={"teal"}>
									<Flex gap={"3"} align={"center"} onClick={copyLinkFunc}>
										<IoCopyOutline/>
										Copy link
									</Flex>
								</Button>
							</div>

							<div>
								<Flex gap="3" justify="end">
									<Dialog.Close>
										<Button variant="soft" color="gray">
											Cancel
										</Button>
									</Dialog.Close>
									<Dialog.Close>
										<Button>Done</Button>
									</Dialog.Close>
								</Flex>

							</div>

						</Flex>
					</Dialog.Content>
				</Dialog.Root>
			</div>

		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item onClick={()=>RenamePromtTrigger.current!.click()} >
				<Flex gap={"3"} align={"center"}>
					<MdOutlineDriveFileRenameOutline/>
					Rename
				</Flex>
			</ContextMenu.Item>
			<ContextMenu.Item onClick={()=>openFile(file_info)} >
				<Flex gap={"3"} align={"center"}>
					<GoDownload/>
					Download
				</Flex>
				</ContextMenu.Item>
			<ContextMenu.Separator />

			<ContextMenu.Sub>
				<ContextMenu.SubTrigger>
					<Flex gap={"3"} align={"center"}>
						<MdOutlineShare/>
						Share
					</Flex>
				</ContextMenu.SubTrigger>
				<ContextMenu.SubContent>
					<ContextMenu.Item onClick={()=> {
						SharePromtTrigger.current!.click();
						fetchAllowedUsers();
					}}>
						<Flex gap={"3"} align={"center"}>
							<MdOutlineShare/>
							Share
						</Flex>
					</ContextMenu.Item>
					<ContextMenu.Item>
						<Flex gap={"3"} align={"center"} onClick={copyLinkFunc}>
							<IoCopyOutline/>
							Copy link
						</Flex>

					</ContextMenu.Item>
				</ContextMenu.SubContent>
			</ContextMenu.Sub>


			<ContextMenu.Item>
				<Flex gap={"3"} align={"center"}>
					<IoMdInformationCircleOutline/>
					File Info
				</Flex>
				</ContextMenu.Item>
			<ContextMenu.Separator />
			<ContextMenu.Item  color="red"  onClick={deleteFileFunc}>
				<Flex gap={"3"} align={"center"}>
					<RiDeleteBin6Line/>
					Delete
				</Flex>
			</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>
})