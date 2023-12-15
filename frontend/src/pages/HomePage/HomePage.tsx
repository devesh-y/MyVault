import "./HomePage.css"
import {Documents} from "./Documents.tsx";
import {createContext, useEffect, useMemo, useState} from "react";
import {GetCookie} from "../../utils/get_set_cookies.ts";
import {useNavigate} from "react-router-dom";
export const UserContext=createContext<string>("");
export const HomePage=()=>{
	const navigate=useNavigate();
	const response=useMemo(()=>{
		return GetCookie();
	},[])
	const [checked,setChecked]=useState(false);
	useEffect(() => {
		if(!response){
			navigate('/login',{replace:true});
		}
		else{
			setChecked(true)
		}
	}, [ navigate, response]);
	return <>
		{checked ? <div id={"homepage"}>
			<div>
				<p id={"homepage-heading"}>MyVault</p>
			</div>
			<UserContext.Provider value={response!}>
				<Documents/>
			</UserContext.Provider>
		</div> : <></>
		}
	</>
	
}