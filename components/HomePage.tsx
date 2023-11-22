import "./HomePage.css"
import {Documents} from "./Documents.tsx";
import {Link, useParams} from "react-router-dom";
const CurrentPath=()=>{
	const {dir_path}=useParams();
	const arr=dir_path!.split('/');
	let temp="";
	return <div id={"homepage-curpath"}>
		{
			arr.map((value,index)=>{
				temp+="/";
				temp+=value;
				return <span key={index} style={{display:"flex",alignItems:"center",gap:10}} >
					<span> {">"} </span>
					<span><Link to={"/"+encodeURIComponent(temp.substring(1))}>{`F${index+1}`}</Link> </span>
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