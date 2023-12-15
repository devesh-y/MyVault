import "./AuthPage.css"
import {FcGoogle} from "react-icons/fc"
import {useNavigate} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import {SetCookie} from "../../utils/get_set_cookies.ts";
import {GetCookie} from "../../utils/get_set_cookies.ts";

import {TailSpin} from "react-loader-spinner";
import {HandleLogin} from "../../utils/HandleLogin.ts";


export const AuthPage=()=>{

	const navigate =useNavigate();
	const [showAuthPage,setAuthPage]=useState(false);
	const LoginFunc=useCallback((create:boolean)=>{
		setAuthPage(false);
		HandleLogin(create).then((res)=>{
			const user=JSON.stringify(res);
			SetCookie(user);
			navigate("/root", {replace: true });

		}).catch((err)=>{
			alert(err.message)
			setAuthPage(true);
			console.log(err)
		})
	},[navigate])
	useEffect(()=>{
		const response=GetCookie();
		if(response){
			navigate("/root", { replace: true });
		}
		else{
			setAuthPage(true)
		}

	},[navigate])

	return <div id={"loginpage"}>
		{showAuthPage?
		<>
			<div id={"loginpage-heading"}>
				MyVault
			</div>
			<div style={{display:"flex",gap:"20px"}}>
				<div className={"authpage-btn"} style={{backgroundColor: "skyblue"}} onClick={() => LoginFunc(false)}>
					<FcGoogle size={30}/>
					<strong>Login With Google</strong>
				</div>
				<div className={"authpage-btn"} style={{backgroundColor: "black"}} onClick={() => LoginFunc(true)}>
					<FcGoogle size={30}/>
					<strong>Create Account</strong>
				</div>
			</div>

		</> : <div style={{display: "flex", justifyContent: "center"}}>
				<TailSpin
					height="80"
					width="80"
					color="#4fa94d"
					ariaLabel="tail-spin-loading"
					radius="1"
					wrapperStyle={{}}
					wrapperClass=""
					visible={true}
				/>
			</div>
		}

	</div>
}