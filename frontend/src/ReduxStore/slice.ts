import { createSlice } from "@reduxjs/toolkit";
const slice1=createSlice({
	name:"slice1",
	initialState:{
		UserInfo:"",
	},
	reducers:{
		setUserInfo:(state,action)=>{
			state.UserInfo=action.payload;
		}
	}
});

export const {setUserInfo}=slice1.actions;
export const reducer1=slice1.reducer;
