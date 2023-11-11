import {useNavigate, useParams} from "react-router-dom";
import {collection,getDocs,setDoc,doc} from "firebase/firestore";
import {database, fireStorage} from "../utils/firebaseconf.ts";
import {useEffect, useRef} from "react";
import {User} from "firebase/auth"
import {useCallback, useMemo, useState} from "react";
import {GetCookie} from "../utils/get_set_cookies.ts";
import {useDispatch, useSelector} from "react-redux";
import {setUserInfo} from "../ReduxStore/slice.ts";
import {StoreType} from "../ReduxStore/store.ts";
import {BsThreeDotsVertical} from "react-icons/bs"
import {AiOutlineFolderAdd} from "react-icons/ai";
import {MdUploadFile} from "react-icons/md";
import {ref, uploadBytes,getDownloadURL} from "firebase/storage";

type generalDir ={
	name:string,
	db_url:string
}
export const Documents=()=>{
	const docsCompContextMenu=useRef<HTMLDivElement>(null);
	const navigate=useNavigate();
	const {dir_path}=useParams();
	const [Files,setFiles]=useState(new Array<generalDir>());
	const [Folders,setFolders]=useState(new Array<generalDir>());
	const UserInfo=useSelector((store:StoreType)=>store.slice1.UserInfo)
	const dispatch=useDispatch();
	const myFileInput=useRef<HTMLInputElement>(null)
	const documentsCompRef=useRef<HTMLDivElement>(null);

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
					tempfolders.push({name:doc.id,db_url:doc.data().db_url})
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
				const filePath=dir_path+"/"+filename;
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


	//context-menu and , drag-n-drop
	const DropEventFunc=useCallback((e:DragEvent)=>{
		e.preventDefault();
		(documentsCompRef.current!).style.backgroundColor="white";
		if(e.dataTransfer?.files){
			myFileInput.current!.files=e.dataTransfer.files;
			upload_files();
		}
	},[upload_files])
	useEffect(()=>
	{
		documentsCompRef.current!.addEventListener("contextmenu",(e)=>{
			e.preventDefault();
			(docsCompContextMenu.current!).style.left=(e.clientX-4)+"px";
			(docsCompContextMenu.current!).style.top=(e.clientY-4)+"px";
			(docsCompContextMenu.current!).style.visibility="visible";
			(docsCompContextMenu.current!).style.height=(docsCompContextMenu.current!).scrollHeight+"px";

		});
		docsCompContextMenu.current!.addEventListener("mouseleave",(e)=>{
			e.preventDefault();
			(docsCompContextMenu.current!).style.height="0px";
			(docsCompContextMenu.current!).style.visibility="hidden";
		})
		documentsCompRef.current!.addEventListener("dragover",(e)=>{
			e.preventDefault();
			(documentsCompRef.current!).style.backgroundColor="#c0d1ef";
		});
		documentsCompRef.current!.addEventListener("dragleave",(e:DragEvent)=>{
			e.preventDefault();
			(documentsCompRef.current!).style.backgroundColor="white";
		});
	},[])
	useEffect(() => {
		const x=documentsCompRef.current!;
		x.addEventListener("drop",DropEventFunc)
		return ()=>{
			x.removeEventListener("drop",DropEventFunc);
		}
	}, [DropEventFunc]);
	

	return <div id={"documents-page"} ref={documentsCompRef}>
		<input type={"file"} ref={myFileInput} hidden onChange={upload_files} multiple/>
		<div ref={docsCompContextMenu} id={"documents-context-menu"}>
			<div>
				<AiOutlineFolderAdd size={25}/>
				<p>New folder</p>
			</div>
			<div>
				<MdUploadFile size={25}/>
				<p onClick={()=>myFileInput.current?.click()}>File upload</p>
			</div>
		</div>

		{Folders.length>0?<p style={{margin:"10px 0px",fontWeight:700}}>Folders</p>:<></>}
		<div id={"documents-folders"}>
			{
				Folders.map((value,index)=>{
					return <div key={index} title={value.name}>
						<p style={{width:200,height:20,textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{value.name}</p>
						<BsThreeDotsVertical size={14}/>
					</div>
				})
			}
		</div>
		{Files.length>0?<p style={{margin:"10px 0px",fontWeight:700}}>Files</p>:<></>}
		<div id={"documents-files"}>
			{
				Files.map((value,index)=>{
					return <div key={index} title={value.name}>
						<p style={{width:200,height:20,textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"nowrap"}}>{value.name}</p>
						<BsThreeDotsVertical size={14}/>
					</div>
				})
			}
		</div>
	</div>

}