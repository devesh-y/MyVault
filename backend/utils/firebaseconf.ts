import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage"
const firebaseConfig = {
	apiKey: process.env.VITE_APIKEY,
	authDomain: process.env.VITE_AUTHDOMAIN,
	projectId: process.env.VITE_PROJECTID,
	storageBucket:process.env.VITE_STORAGEBUCKET,
	messagingSenderId: process.env.VITE_MESSAGINGSENDINGID,
	appId: process.env.VITE_APPID
};

const app = initializeApp(firebaseConfig);
export const fireStorage=getStorage(app);
