import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {doc,getDoc} from "firebase/firestore";
import {database} from "../utils/firebaseconf.ts";
import {useDispatch, useSelector} from "react-redux";
import {StoreType} from "../ReduxStore/store.ts";
import {User} from "firebase/auth";
import {setUserInfo} from "../ReduxStore/slice.ts";
import {GetCookie} from "../utils/get_set_cookies.ts";
import {Button, Dialog, Flex, Text} from "@radix-ui/themes";
export const Access_files=()=>{
	const {access_id}=useParams();
	const navigate=useNavigate();
	const dispatch=useDispatch();
	const response=useMemo(()=>{
		return GetCookie();
	},[])
	const [denied_access,setDeniedAccess]=useState(false);
	const promtdownloadedfile=useRef<HTMLButtonElement>(null);
	const UserInfo=useSelector((store:StoreType)=>store.slice1.UserInfo);
	const [downloadInputUrl,setDownloadInputUrl]=useState<undefined|string>(undefined);
	const [DownloadProgress,setDownloadProgress]=useState(0);
	const [file_info,setFileInfo]=useState({name:"",type:""});
	const RetrieverAccessFile=useCallback(()=>{
		if(UserInfo!=""){
			const {email}:User=JSON.parse(UserInfo)
			getDoc( doc(database,"access_files_db",access_id!)).then((docSnap)=>{
				if(docSnap.exists()){
					setFileInfo({name:docSnap.data().name,type:docSnap.data().type});
					const its_allowed_users:string[]=docSnap.data().allowed_users;
					if(docSnap.data().host_email===email || (its_allowed_users.length>0 && its_allowed_users[0]=="*")  || its_allowed_users.find((value:string)=>{
						return value===email;
					}))
					{
						promtdownloadedfile.current!.click();
						fetch(`${import.meta.env.VITE_BACKEND}/${access_id}.${docSnap.data().extension}`)
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
												const progress = (receivedLength / docSnap.data()!.size) * 100;
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
								const newBlob=new Blob([blob],{type:docSnap.data().type});
								const url=URL.createObjectURL(newBlob);
								setDownloadInputUrl(url);
							}).catch(error => {
							console.error('Error downloading file:', error);
						});
					}
					else{
						setDeniedAccess(true);
					}

				}
				else{
					navigate("/wrong_page",{replace:true});
				}
			})

		}

	},[UserInfo, access_id, navigate])

	useEffect(()=>{
		if(!response){
			navigate('/login');
		}
		else{
			dispatch(setUserInfo(response))
			RetrieverAccessFile();
		}

	},[RetrieverAccessFile, dispatch, navigate, response])
	
	return <>
		<Dialog.Root>
			<Dialog.Trigger>
				<button hidden={true} ref={promtdownloadedfile}></button>
			</Dialog.Trigger>
			<Dialog.Content style={{ minWidth:"90vw",minHeight:"90vh",overflow:"hidden",width:"90vw",height:"90vh",display:"flex",flexDirection:"column"}}>
				<Flex justify={"between"}>
					<Text style={{fontWeight:"bolder"}}>{file_info.name}</Text>
					<Button disabled={downloadInputUrl==undefined} onClick={()=>{
						const a=document.createElement("a");
						a.href=downloadInputUrl!;
						a.download=file_info.name;
						a.click();
					}}>Download</Button>
				</Flex>
				<progress value={DownloadProgress}  max={100} style={{width:"100%"}} >{DownloadProgress}</progress>
				<object type={`${file_info.type}`} data={downloadInputUrl} height={"100%"} width={"100%"} style={{objectFit:"contain"}} >
				</object>
			</Dialog.Content>
		</Dialog.Root>
		{denied_access?<div style={{
			fontFamily: 'Roboto, sans-serif',
			textAlign: 'center',
			margin: '50px',
			color: '#444',
		}}>
			<h1 style={{
				fontSize: '3em',
				color: '#ff6347', // Tomato color
				marginBottom: '10px',
			}}>403 - Forbidden</h1>
			<p style={ {
				fontSize: '1.2em',
				color: '#777',
			}}>Sorry, you don't have permission to access this file.</p>
		</div>:<>Loading...</>}

	</>
}