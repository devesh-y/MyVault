import {database, firebaseAuth} from "./firebaseconf.ts";
import {GoogleAuthProvider,signInWithPopup} from "firebase/auth"
import {doc, getDoc, setDoc} from "firebase/firestore";

export const HandleLogin=async (create:boolean) =>{
	try {
		const provider= new GoogleAuthProvider();

		const {user}= await signInWithPopup(firebaseAuth,provider);
		if(user.email  && user.emailVerified){
			const snap=await getDoc( doc(database,user.email,"root"))
			if(create){
				if(snap.exists()){
					return new Promise((_res, reject)=>{
						reject(new Error("User already Exists"));
					})
				}
				else{
					await setDoc(doc(database, user.email, "root"), {});
					return new Promise((resolve)=>{
						resolve(user);
					})
				}
			}
			else{
				if(snap.exists()){
					return new Promise((resolve)=>{
						resolve(user);
					})
				}
				else{
					return new Promise((_res, reject)=>{
						reject(new Error("User doesn't Exists. Kindly Create your Account."));
					})
				}
			}

		}
		else{
			return new Promise((_res, reject)=>{
				reject(new Error("Error occurred at Email Verification"));
			})
		}

	}
	catch(err){
		return new Promise((_res, reject)=>{
			reject(new Error("Login Window Discarded"));
		})
	}
}