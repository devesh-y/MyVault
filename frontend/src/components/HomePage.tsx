import "./HomePage.css"
import {Documents} from "./Documents.tsx";
export const HomePage=()=>{
	return <div  id={"homepage"} >
		<div >
			<p id={"homepage-heading"}>MyVault</p>
		</div>
		<Documents />
	</div>
}