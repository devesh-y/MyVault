import ReactDOM from 'react-dom/client'
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {AuthPage} from "./pages/LoginPage/AuthPage.tsx";
import {HomePage} from "./pages/HomePage/HomePage.tsx";
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import {Access_files} from "./pages/AccessPage/Access_files.tsx";
import {WrongPage} from "./pages/WrongUrl/WrongPage.tsx";
ReactDOM.createRoot(document.getElementById('root')!).render(
	<Theme>
			<BrowserRouter>
				<Routes>
					<Route path={"/"} element={<Navigate to={"/root"} replace={true}/>}/>
					<Route path={"/login"} element={<AuthPage/>}/>
					<Route path={"/wrong_page"} element={<WrongPage/>}/>
					<Route path={"/:dir_path"} element={<HomePage/>}/>
					<Route path={"/access/:access_id"} element={<Access_files/>}/>
					<Route path={"/*"} element={<Navigate to={"wrong_page"} replace={true}/> }/>

				</Routes>
			</BrowserRouter>
	</Theme>


)
