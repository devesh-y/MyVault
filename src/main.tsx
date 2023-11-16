import ReactDOM from 'react-dom/client'
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {LoginPage} from "../components/LoginPage.tsx";
import {HomePage} from "../components/HomePage.tsx";
import {Provider} from "react-redux";
import {store} from "../ReduxStore/store.ts";
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
ReactDOM.createRoot(document.getElementById('root')!).render(
	<Theme>
		<Provider store={store}>
			<BrowserRouter>
				<Routes>
					<Route path={"/"} element={<Navigate to={"/login"}/>}/>
					<Route path={"/login"} element={<LoginPage/>}/>
					<Route path={"/:dir_path"} element={<HomePage/>}/>
				</Routes>
			</BrowserRouter>
		</Provider>
	</Theme>


)
