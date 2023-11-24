import express from "express";
import {config} from "dotenv";
import {ref,getStream,getMetadata} from "firebase/storage"
import cors from "cors";
const app=express();
config();
import {fireStorage} from "./utils/firebaseconf";

app.use(cors({
	origin:[`${process.env.WEBSITE}`]
}))
app.get("/:fileName",async (req,res)=>{
	try {
		const {fileName}=req.params;
		console.log(fileName);
		let progress=0;
		const {size}=await getMetadata(ref(fireStorage,fileName));

		const stream=getStream(ref(fireStorage,fileName));
		stream.pipe(res);

		stream.on("data",(chunk:Buffer)=>{
			progress+=chunk.length;
			console.log(`downloaded ${progress*100/(size)}`);
		})
		stream.on("end",()=>{
			console.log(`total data reached`);
		})
		stream.on("error",()=>{
			res.send("error");
			console.log("error occurred")
		})

	}
	catch (err){
		res.status(400).send("error");
		console.log(err);
	}


})

app.listen(process.env.PORT,()=>{
	console.log(`server is listening at ${process.env.PORT}`)
})