import {Button, ContextMenu, Dialog, DropdownMenu, Flex, TextField, Text, IconButton, ScrollArea} from "@radix-ui/themes";
import React, {useCallback, useRef, useState,memo} from "react";
import {useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {StoreType} from "../../ReduxStore/store.ts";
import {User} from "firebase/auth"
import {updateDoc, doc, deleteDoc, getDoc} from "firebase/firestore";
import {database,fireStorage} from "../../utils/firebaseconf.ts";
import {BsThreeDotsVertical} from "react-icons/bs";
import {generalDir} from "./Documents.tsx";
import { IoAdd } from "react-icons/io5";
import {ref, deleteObject} from "firebase/storage";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { GoDownload } from "react-icons/go";
import { MdOutlineShare } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoCopyOutline } from "react-icons/io5";
export const FileDocs=memo(({file_info,Files,setFiles}:{file_info:generalDir,setFiles:React.Dispatch<React.SetStateAction<generalDir[]>>,Files:generalDir[]})=>{
	const {dir_path}=useParams();
	const UserInfo=useSelector((store:StoreType)=>store.slice1.UserInfo);
	const [inputRename,setInputRename]=useState("");
	const RenamePromtTrigger=useRef<HTMLButtonElement>(null)
	const SharePromtTrigger=useRef<HTMLButtonElement>(null);
	const [addUserEmail,setAddUserEmail]=useState("");
	const promtdownloadedfile=useRef<HTMLButtonElement>(null);
	const [downloadInputUrl,setDownloadInputUrl]=useState<undefined|string>(undefined);
	const [AlreadyAllowedUsers,SetAllowedUsers]=useState(new Array<string>());
	const [DownloadProgress,setDownloadProgress]=useState(0);
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
		getDoc(oldRef).then((doc)=>{
			if(doc.exists()){
				updateDoc(oldRef, {
					name: inputRename
				}).then(()=> {
					console.log("renamed successfully")
					const index=Files.indexOf(file_info);
					if(index!=-1){
						const temp=Array.from(Files);
						temp.splice(index,1);
						const newvalues=file_info;
						newvalues.name=inputRename;
						temp.splice(index,0,newvalues);
						setFiles(temp);
						const cache=localStorage.getItem(email!+dir_path);
						if(cache){
							const obj:{files:generalDir[],folders:generalDir[]}=JSON.parse(cache);
							const files=temp;
							localStorage.setItem(email!+dir_path,JSON.stringify({folders:obj["folders"],files}));
						}
						setInputRename("");
					}
				});
			}
		})

	},[Files, UserInfo, dir_path, file_info, inputRename, setFiles])


	const openFile=useCallback((file_info:generalDir,toDownload:boolean)=>{
		if(toDownload && downloadInputUrl){
			const a=document.createElement("a");
			a.href=downloadInputUrl;
			a.download=file_info.name;
			a.click();
			return;
		}
		if(!toDownload){
			promtdownloadedfile.current!.click();
		}
		if(downloadInputUrl){
			return;
		}
		fetch(`${import.meta.env.VITE_BACKEND}/${file_info.access_id}.${file_info.extension}`)
			.then(response => {

				let receivedLength = 0;
				const reader = response.body!.getReader();
				return new ReadableStream({
					start(controller) {
						async function pump() {
							return reader.read().then(({ done, value }) => {
								if (done) {
									controller.close();
									return;
								}
								receivedLength += value.length;
								// Update the progress bar
								const progress = (receivedLength / file_info.size!) * 100;
								// console.log(progress)
								setDownloadProgress(progress);
								// Process the chunk (value) as needed
								// Enqueue the next chunk
								controller.enqueue(value);
								// Continue with the next data chunk
								pump();
							});
						}
						return pump();
					}
				});
			}).then(stream => new Response(stream))
			.then(response => response.blob())
			.then(blob => {
				if(toDownload){
					const a=document.createElement("a");
					const newBlob=new Blob([blob],{type:file_info.type});
					const url=URL.createObjectURL(newBlob);
					setDownloadInputUrl(url);
					a.href=url;
					a.download=file_info.name;
					a.click();
					console.log('Download complete!');
				}
				else{
					const newBlob=new Blob([blob],{type:file_info.type});
					const url=URL.createObjectURL(newBlob);
					setDownloadInputUrl(url);
				}
			}).catch(error => {
				console.error('Error downloading file:', error);
			});


	},[downloadInputUrl])

	const deleteFileFunc=useCallback( ()=>{
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
		deleteDoc(doc(database,currpath+"/files",file_info.id!)).catch(()=>{
			console.log("error in deleting from files database");
		})
		//delete from access_db
		deleteDoc(doc(database,"access_files_db",file_info.access_id!)).catch(()=>{
			console.log("error in deleting from filesaccess database");
		})

		//delete from storage
		const deleteRef=ref(fireStorage,file_info.access_id+"."+file_info.extension);
		deleteObject(deleteRef).catch(()=>{
			console.log("error in deleting from storage");
		})
		const index=Files.indexOf(file_info);
		if(index!=-1){
			const temp=Array.from(Files);
			temp.splice(index,1);
			setFiles(temp);
			const cache=localStorage.getItem(email!+dir_path);
			if(cache){
				const obj:{files:generalDir[],folders:generalDir[]}=JSON.parse(cache);
				const files=temp;
				localStorage.setItem(email!+dir_path,JSON.stringify({folders:obj["folders"],files}));
			}
		}


	},[Files, UserInfo, dir_path, file_info, setFiles])
	const copyLinkFunc=useCallback(()=>{
		navigator.clipboard.writeText(import.meta.env.VITE_WEBSITE+"/access/"+file_info.access_id).then(()=>{
			console.log("copied successfully");
		}).catch(()=>{
			alert("copy fails");
		})
	},[file_info.access_id])
	const fetchAllowedUsers=useCallback(()=>{
		const tempRef=doc(database,"access_files_db",file_info.access_id!);
		getDoc(tempRef).then((docSnap)=>{
			if(docSnap.exists()){
				const arr:string[]=docSnap.data().allowed_users;
				SetAllowedUsers(arr);
			}
		})
	},[file_info.access_id])
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
							SetAllowedUsers(["*"]);
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

								SetAllowedUsers(newArray);
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


	},[UserInfo, addUserEmail, file_info.access_id])

	const RevokeAccessUser=useCallback((tempEmail:string)=>{
		const tempRef=doc(database,"access_files_db",file_info.access_id!);
		getDoc(tempRef).then((docSnap)=>{
			if(docSnap.exists()){
				const arr:string[]=docSnap.data().allowed_users;
				const index = arr.indexOf(tempEmail);
				if (index !== -1) {
					arr.splice(index, 1);
					updateDoc(tempRef,{
						allowed_users:arr
					}).then(()=>{
						SetAllowedUsers(arr);
						console.log("access removed");
					}).catch(()=>{
						console.log("error in removing access");
					})
				}
			}
		})
	},[file_info.access_id])
	return <>
		<Dialog.Root>
			<Dialog.Trigger>
				<button hidden={true} ref={promtdownloadedfile}></button>
			</Dialog.Trigger>
			<Dialog.Content style={{minWidth:"90vw",minHeight:"90vh",width:"90vw",height:"90vh",display:"flex",flexDirection:"column"}}>
				<Flex justify={"between"} align={"center"} width={"100%"}>
					<Text style={{fontWeight:"bolder",textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{file_info.name}</Text>
					<Flex gap={"2"}>
						<Button disabled={downloadInputUrl==undefined} onClick={()=>openFile(file_info,true)}>Download</Button>
						<Dialog.Close>
							<Button color="crimson" variant="soft">
								Close
							</Button>
						</Dialog.Close>

					</Flex>
				</Flex>
				<div>
					<progress value={DownloadProgress}  max={100} style={{width:"100%"}}>{DownloadProgress}</progress>
				</div>
				<div style={{flex:"1 1 auto",display:"flex",justifyContent:"center",overflow:"hidden"}}>
					<object type={`${file_info.type}`} data={downloadInputUrl} height={"100%"} width={"100%"}  style={{objectFit:'contain'}}   >
					</object>
				</div>

			</Dialog.Content>
		</Dialog.Root>
		<Dialog.Root>
			<Dialog.Trigger  >
				<button ref={RenamePromtTrigger} hidden={true}></button>
			</Dialog.Trigger>
			<Dialog.Content style={{ maxWidth: 450 }}>
				<Dialog.Title>Rename</Dialog.Title>
				<TextField.Input placeholder={file_info.name} value={inputRename}  onChange={(e)=>setInputRename(e.currentTarget.value)}/>
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

			<Dialog.Content onOpenAutoFocus={(e)=>e.preventDefault()} style={{ maxWidth: 450 }}>
				<Dialog.Title  style={{fontWeight:"normal"}}>Share <i>{file_info.name}</i></Dialog.Title>
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
						return <Flex key={index+(file_info.access_id?file_info.access_id:"")} align={"center"} justify={"between"} pr={"2"} mb={"2"}>
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
		<ContextMenu.Root>
			<ContextMenu.Trigger >
				<div title={file_info.name}  onDoubleClick={()=>openFile(file_info,false)} style={
					{
						width:250,
						borderRadius: "10px",
						backgroundColor:"#e1f3eb",
						display:"flex",
						padding:"5px 10px",
						justifyContent:"space-between",
						alignItems:"center",

					}
				}>
					<p style={{textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{file_info.name}</p>
					<div>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<div className={"dropDownDots"}>
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
								<DropdownMenu.Item onClick={()=>openFile(file_info,true)}  >
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
								{/*<DropdownMenu.Item >*/}
								{/*	<Flex gap={"3"} align={"center"}>*/}
								{/*		<IoMdInformationCircleOutline/>*/}
								{/*		File Info*/}
								{/*	</Flex>*/}
								{/*</DropdownMenu.Item>*/}
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

			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item onClick={()=>RenamePromtTrigger.current!.click()} >
					<Flex gap={"3"} align={"center"}>
						<MdOutlineDriveFileRenameOutline/>
						Rename
					</Flex>
				</ContextMenu.Item>
				<ContextMenu.Item onClick={()=>openFile(file_info,true)} >
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


				{/*<ContextMenu.Item>*/}
				{/*	<Flex gap={"3"} align={"center"}>*/}
				{/*		<IoMdInformationCircleOutline/>*/}
				{/*		File Info*/}
				{/*	</Flex>*/}
				{/*</ContextMenu.Item>*/}
				<ContextMenu.Separator />
				<ContextMenu.Item  color="red"  onClick={deleteFileFunc}>
					<Flex gap={"3"} align={"center"}>
						<RiDeleteBin6Line/>
						Delete
					</Flex>
				</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	</>
})