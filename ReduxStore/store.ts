import { configureStore } from "@reduxjs/toolkit"
import {reducer1} from "./slice.ts"
export const store = configureStore({
	reducer: {
		slice1: reducer1,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware({
		serializableCheck:false
	})
})

export type StoreType={
	slice1:{
		UserInfo:string
	}
}
