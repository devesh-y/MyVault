import {NavigateFunction} from "react-router-dom";
import React, {useCallback, useEffect} from "react";

export const CurrentPath=({dir_path,navigate,setDocsLoading}:{dir_path:string|undefined,navigate: NavigateFunction,setDocsLoading: React.Dispatch<React.SetStateAction<boolean>>})=>{
    const arr=dir_path!.split('/');
    let url="";
    const redirect=useCallback((url:string)=>{
        setDocsLoading(true);
        navigate("/"+encodeURIComponent(url))
    },[navigate, setDocsLoading])
    useEffect(() => {
        window.addEventListener("popstate",()=>{
            setDocsLoading(true);
        })
        return ()=>{
            window.removeEventListener("popstate",()=>{
                setDocsLoading(true);
            })
        }
    }, [setDocsLoading]);
    return <div id={"homepage-curpath"}>
        {
            arr.map((value,index)=>{
                url+="/";
                url+=value;
                const temp=url;
                return <span key={index} style={{display:"flex",alignItems:"center",gap:10}} >
					<span> {">"} </span>
                    <span onClick={()=>redirect(temp.substring(1))}>{`F${index+1}`}</span>
				</span>

            })
        }
    </div>
}