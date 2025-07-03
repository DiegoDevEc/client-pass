import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Info from "../Info";
import Login from "../Login/Login";
import ChangePW from "../Login/Changepw";
import Join from "../Login/Join";
import Main from "../Main";

function RootRoutes() {
    const [isLogin, setIsLogin] = useState(null);
    const location = useLocation();

    useEffect(() => {
        console.log("Page changed:", location.pathname);
        checkLogin();
    }, [location]);

    const checkLogin = async () => {
        const loginCheck = window.localStorage.getItem("loginCheck");
        console.log("Login check from localStorage:", loginCheck);
        if (loginCheck !== null) {
            setIsLogin(true);
        } else {
            setIsLogin(false);
        }
    };

    useEffect(() => {
        checkLogin();
    }, []);

    return (
        <Routes>
            <Route path="/" element={isLogin ? <Main /> : <Info />} />
            <Route path="/login" element={isLogin ? <Main /> : <Login />} />
            <Route path="/changepw" element={isLogin ? <Main /> : <ChangePW />} />
            <Route path="/join" element={isLogin ? <Main /> : <Join />} />
            <Route path="/main" element={isLogin ? <Main /> : <Login />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <RootRoutes />
        </BrowserRouter>
    );
}
