import {useCallback, useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {doc,getDoc} from "firebase/firestore";
import {database} from "../utils/firebaseconf.ts";
import {useDispatch, useSelector} from "react-redux";
import {StoreType} from "../ReduxStore/store.ts";
import {User} from "firebase/auth";
import {setUserInfo} from "../ReduxStore/slice.ts";
import {GetCookie} from "../utils/get_set_cookies.ts";

export const Access_files=()=>{
	const {access_id}=useParams();
	const navigate=useNavigate();
	const dispatch=useDispatch();
	const response=useMemo(()=>{
		return GetCookie();
	},[])
	const [denied_access,setDeniedAccess]=useState(false);
	const UserInfo=useSelector((store:StoreType)=>store.slice1.UserInfo);
	const RetrieverAccessFile=useCallback(()=>{
		if(UserInfo!=""){
			const {email}:User=JSON.parse(UserInfo)
			getDoc( doc(database,"access_files_db",access_id!)).then((docSnap)=>{
				if(docSnap.exists()){
					const its_allowed_users:string[]=docSnap.data().allowed_users;
					if(docSnap.data().host_email===email || (its_allowed_users.length>0 && its_allowed_users[0]=="*")  || its_allowed_users.find((value:string)=>{
						return value===email;
					})) {
						const a=document.createElement("a");
						a.href=docSnap.data().db_url!;
						a.click();
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
		</div>:<></>}

	</>
}