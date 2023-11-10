import "./HomePage.css"
import {Documents} from "./Documents.tsx";
import {useParams} from "react-router-dom";
const CurrentPath=()=>{
	const {dir_path}=useParams();
	const arr=dir_path!.split('/');
	return <div id={"homepage-curpath"}>
		{
			arr.map((value,index)=>{
				return <span key={index} style={{display:"flex",alignItems:"center",gap:10}} >
					<span> {">"} </span>
					<span> {value} </span>
				</span>
			})
		}
	</div>
}
export const HomePage=()=>{
	return <div  id={"homepage"} >
		<div >
			<p id={"homepage-heading"}>MyVault</p>
			<CurrentPath/>
		</div>
		<Documents />
	</div>
}