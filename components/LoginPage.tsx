import "./LoginPage.css"
import {FcGoogle} from "react-icons/fc"
import {HandleLogin} from "../utils/HandleLogin.ts";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {SetCookie} from "../utils/get_set_cookies.ts";
import {GetCookie} from "../utils/get_set_cookies.ts";
import {useDispatch} from "react-redux";
import {setUserInfo} from "../ReduxStore/slice.ts";
import { Dispatch} from "@reduxjs/toolkit";

function SignIn(navigate:NavigateFunction,dispatch:Dispatch){

	HandleLogin().then((res)=>{

		const user=JSON.stringify(res);
		SetCookie(user);
		dispatch(setUserInfo(user));
		navigate("/root", {replace: true });

	}).catch((err)=>{
		console.log(err)
	})

}
export const LoginPage=()=>{
	const dispatch=useDispatch();
	const navigate =useNavigate();
	useEffect(()=>{
		const response=GetCookie();
		if(response){
			dispatch(setUserInfo(response));
			navigate("/root", { replace: true });
		}

	},[dispatch, navigate])

	return <div id={"loginpage"}>
		<div id={"loginpage-heading"}>
			MyVault
		</div>
		<div id={"loginpage-btn"} onClick={()=>SignIn(navigate,dispatch)}>
			<FcGoogle size={30}/>
			<p>Login With Google</p>
		</div>
	</div>
}