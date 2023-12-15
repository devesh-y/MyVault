import {Link} from "react-router-dom";

export const CurrentPath=({dir_path}:{dir_path:string|undefined})=>{
    const arr=dir_path!.split('/');
    let url="";

    return <div id={"homepage-curpath"}>
        {
            arr.map((value,index)=>{
                url+="/";
                url+=value;
                const temp=url;
                return <span key={index} style={{display:"flex",alignItems:"center",gap:10}} >
					<span> {">"} </span>
                    <span><Link to={"/"+encodeURIComponent(temp.substring(1))}>{`F${index+1}`}</Link></span>
				</span>

            })
        }
    </div>
}