import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Common } from "../Common";
import qs from 'qs';

function Login(props) {
    useEffect(() => {
		selPassword(parseInt(window.localStorage.getItem("selPasswordNo")));
    }, []);

    const common = Common();
    const { t} = useTranslation(); 
    const navigate = useNavigate([]);
	const serverUrlRef = useRef(null);
	const registerKeyRef = useRef(null);

    const [formData, setFormData] = useState({});
    const [selPasswordNo, setSelPasswordNo] = useState(parseInt(window.localStorage.getItem("selPasswordNo")));  // 1:password, 2:passwordless, 3:passwordless manage
    const [timeoutId, setTimeoutId] = useState(null);
    const [checkMillisec, setCheckMillisec] = useState(0);
    let passwordlessTerms = useRef(0);
    let passwordlessMillisec = useRef(0);
    let pushConnectorUrl = "";
    let pushConnectorToken = "";
    let sessionId = "";
    let checkType = useRef(null);
	const [PasswordlessToken, setPasswordlessToken] = useState("");
	const [width, setWidth] = useState(0);
	const [tmpPassword, setTempPassword] = useState("--- ---");
	const [showHelp, setShowHelp] = useState("none");
	const [loginTitle, setLoginTitle] = useState("Main.001");
	const [loginbutton, setLoginButton] = useState("Main.003");
	const [tmp_min, setTmp_min] = useState(0);
	const [tmp_sec, setTmp_sec] = useState(0);
	const [qrSrc, setqrSrc] = useState("");
	const [idCheck, setIdCheck] = useState(false);
	const [loginStatus, setloginStatus] = useState(false);
	const qrSocket = useRef(null);
	const [socketCheck, setsocketCheck] = useState(true);
	let lStatus = false;
	let servicePassword = "";


	const [serverUrl, setServerUrl] = useState("");
	const [registerKey, setRegisterKey] = useState("");
	const [qrCheck, setQrcheck] = useState(false);
	
	let timerCheck = false;
	let timer;

	let passwordless_milisec = 0;
	let passwordless_terms = 0;
	let check_millisec = 0;

	const movePage = (url) => {
		navigate(url);
	};

	const changeInput = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const selPassword = (sel) => {

	setSelPasswordNo(sel);
	if(sel === 1 || sel === 2 ){
		window.localStorage.setItem("selPasswordNo",sel);
	}
	if(sel === 1){
		setLoginButton("Main.003");
		setLoginTitle("Main.001");
	}

	if(sel === 2){
		setLoginButton("Main.003");
		setLoginTitle("Main.002");
	}

	if(sel === 3){
		setLoginButton("Main.010");
		setLoginTitle("Main.010");
	}
	};

	const show_help = () => {
	if(showHelp === "none") {
		setShowHelp("block");
	}
	else{
		hide_help();
	}
	};

	const hide_help = () => {
	setShowHelp("none");
	};

	const login = async () => {

	if(selPasswordNo === 1) {
		if(formData.pw === "" || formData.pw === undefined ) {
		alert(t("Main.053"));	
		return false;
		}
		const method = "post";
		const url = "http://localhost/api/Login/loginCheck";
		const data = qs.stringify(formData);
		const config = {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		};
		const response = await common.apiRequest(method, url, data, config);
		if(response.result !== "OK"){
		const newFormData = { ...formData };  
		delete newFormData["pw"];
		setFormData(newFormData);
		alert(response.result);
		}
		else{
		window.localStorage.setItem('loginCheck', "ok");
		movePage("/main");
		}
	}

	else if(selPasswordNo === 2) {
		if(loginStatus === true){
			setLoginButton("Main.003");
			cancelLogin();
		}
			
		else{
			loginPasswordless();
		}
			
	}
	// Passwordless manage
	else if(selPasswordNo === 3){
		managePasswordless();
	}
	};
  

	const loginPasswordless = async () => {
	checkType.current = "LOGIN";

	var existId = await passwordlessCheckID("");
	console.log("existId=" + existId);

		if(existId === "T") {
			var token = await getTokenForOneTime();
			
			if(token !== "") {
				setLoginButton("Main.007");
				setloginStatus(true);
				lStatus = true;
				loginPasswordlessStart(token);
			}
		}
		else if(existId === "F") {
			alert(t("Main.025"));
		}
		else {
			alert(existId);
		}
	}

	const getTokenForOneTime = async () => {
		let ret_val = "";
		const method = "post";
		const url = "http://localhost/api/Login/passwordlessCallApi";
		const reqeustData = {
			url: "getTokenForOneTimeUrl",
			params: "userId=" + formData.id
		}
		const data = qs.stringify(reqeustData);
		const config = {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		};
		const response = await common.apiRequest(method, url, data, config);
		var jsonData = JSON.parse(response.data);
		var msg = jsonData.msg;
		var code = jsonData.code;
		
		if(code === "000" || code === "000.0") {
			var oneTimeToken = response.oneTimeToken;
			ret_val = oneTimeToken;
		}
		else {
			alert("Onetime Token Request error : [" + code + "] " + msg);
		}
		return ret_val;
	}

const passwordlessCheckID = async (QRReg) => {
	let ret_val = "";
	const method = "post";
	const url = "http://localhost/api/Login/passwordlessCallApi";
	const reqeustData = {
		url: "isApUrl",
		params: "userId=" + formData.id + "&QRReg=" + QRReg
	}
	const data = qs.stringify(reqeustData);
	const config = {
	  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	};
	const response = await common.apiRequest(method, url, data, config);
	var strResult = response.result;
	if(strResult === "OK") {
		var resultData = response.data;
		var jsonData = JSON.parse(resultData);
		var msg = jsonData.msg;
		var code = jsonData.code;
		
		if(code === "000" || code === "000.0") {
			var exist = jsonData.data.exist;
			if(exist)	ret_val = "T";
			else		ret_val = "F";
		}
		else {
			ret_val = msg;
		}	
	}
	else {
		ret_val = strResult;
	}
	return ret_val;
}


	const loginPasswordlessStart = async (token) => {
		const method = "post";
		const url = "http://localhost/api/Login/passwordlessCallApi";
		let reqeustData = {
			url: "getSpUrl",
			params: "userId=" + formData.id + "&token=" + token
		}
		var data = qs.stringify(reqeustData);
		const config = {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		};
		const response = await common.apiRequest(method, url, data, config);
		var resultData = response.data;
		var jsonData = JSON.parse(resultData);
		var msg = jsonData.msg;
		var code = jsonData.code;
		
		console.log("msg [" + msg + "] code [" + code + "]");
		console.log(jsonData.data);
		if(code === "000" || code === "000.0") {
			var term = jsonData.data.term;
			servicePassword = jsonData.data.servicePassword;
			setTempPassword(servicePassword);
			pushConnectorUrl = jsonData.data.pushConnectorUrl;
			pushConnectorToken = jsonData.data.pushConnectorToken;
			sessionId = response.sessionId;
			
			window.localStorage.setItem('session_id', sessionId);
			
			var today = new Date();
			passwordlessMillisec.current = today.getTime();
			passwordlessTerms.current = parseInt(term - 1);
			console.log("term=" + term + ", servicePassword=" + jsonData.data.servicePassword);

			drawPasswordlessLogin();
			connWebSocket();
		}
		else if(code === "200.6") {
			sessionId = window.localStorage.getItem('session_id');		//console.log("Already request authentication --> send [cancel], sessionId=" + sessionId);
			
			if(sessionId !== undefined && sessionId != null && sessionId !== "") {
				const method = "post";
				const url = "http://localhost/api/Login/passwordlessCallApi";
				reqeustData = {
					url: "cancelUrl",
					params: "userId=" + formData.id + "&sessionId=" + sessionId
				}
				var data = qs.stringify(reqeustData);
				const config = {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				};
				const response = await common.apiRequest(method, url, data, config);
				var resultData = response.data;
				var jsonData = JSON.parse(resultData);
				var msg = jsonData.msg;
				var code = jsonData.code;

				if(code === "000" || code === "000.0") {
					window.localStorage.removeItem('session_id');
					setTimeout(() => loginPasswordlessStart(token), 500);
				}
				else {
					cancelLogin();
					alert("Try again later.");	// Try again later.
				}
			}
			else {
				cancelLogin();
				alert("Try again later.");	// Try again later.
			}
		}
		else if(code === "200.7") {
			cancelLogin();
			alert(t("Main.026"));	
		}
	}

	const drawPasswordlessLogin = async () => {
		var today = new Date();
		var gap_second = Math.ceil((today.getTime() - passwordlessMillisec.current) / 1000);
		if(lStatus === true) {
			if(gap_second < passwordlessTerms.current) {
			
				var today = new Date();
				var now_millisec = today.getTime();
				var gap_millisec = now_millisec - checkMillisec;
				
				if(gap_millisec > 1500) {
					setCheckMillisec(today.getTime());
					//loginPasswordlessCheck();	// polling
				}
		
				gap_millisec = now_millisec - passwordlessMillisec.current;
				var ratio = 100 - (gap_millisec / passwordlessTerms.current / 1000) * 100 - 1;
				if(ratio > 0) {
					var password = "";
					if(servicePassword.length === 6){
						password = servicePassword.slice(0, 3) + " " + servicePassword.slice(3, 6);
					}
					if(lStatus === true) {
						setWidth(ratio);
						setTempPassword(password);
					}
				}
				
				// setTimeoutId(setTimeout(drawPasswordlessLogin, 100));
				if(!timerCheck) {
					timer = setInterval(() => { drawPasswordlessLogin(); }, 1000); 
					setTimeoutId(timer);
					timerCheck = true;
				}
			}
			else {
				clearTimeout(timeoutId);
				// $("#rest_time").html("0 : 00");
				setloginStatus(false);
				lStatus = false;					
				setLoginTitle(t("Main.002"));			
				setWidth(0);		
				setTempPassword("--- ---");			
				// $("#login_mobile_check").hide();			
				
				window.localStorage.removeItem('session_id');
				
				setTimeout(() => alert(t("Main.019")), 100);	
				clearInterval(timer);
				//setTimeout(() => cancelLogin(), 100);	
			}
		}
	}

	const connWebSocket = async () => {

		qrSocket.current = new WebSocket(pushConnectorUrl);

		qrSocket.current.onopen = function(e) {
			console.log("######## WebSocket Connected ########");
			var send_msg = '{"type":"hand","pushConnectorToken":"' + pushConnectorToken + '"}';
			console.log("url [" + pushConnectorUrl + "]");
			console.log("send [" + send_msg + "]");
			qrSocket.current.send(send_msg);
		}

		qrSocket.current.onmessage = async function (event) {
			console.log("######## WebSocket Data received [" + qrSocket.readyState + "] ########");
			
			try {
				if (event !== null && event !== undefined) {
					var result = await JSON.parse(event.data);
					if(result.type === "result") {
						if(checkType.current === "LOGIN")
							loginPasswordlessCheck();
						else if(checkType.current === "QR")
							regPasswordlessOK();
					}
				}
			} catch (err) {
				console.log(err);
			}
		}

		qrSocket.current.onclose = function(event) {
			if(event.wasClean)
				console.log("######## WebSocket Disconnected - OK !!! [" + qrSocket.readyState + "] ########");
			else
				console.log("######## WebSocket Disconnected - Error !!! [" + qrSocket.readyState + "] ########");

			console.log("=================================================");
			console.log(event);
			console.log("=================================================");
		}

		qrSocket.current.onerror = function(error) {
			console.log("######## WebSocket Error !!! [" + qrSocket.readyState + "] ########");
			console.log("=================================================");
			console.log(error);
			console.log("=================================================");
			setsocketCheck(false);
		}
	}

	const loginPasswordlessCheck = async () =>{
		
		//console.log("----- loginPasswordlessCheck -----");

		var today = new Date();
		var now_millisec = today.getTime();
		var gap_millisec = now_millisec - passwordlessMillisec.current;
		sessionId = sessionId = window.localStorage.getItem('session_id');
		if(gap_millisec < passwordlessTerms.current * 1000 - 1000) {
			const method = "post";
				const url = "http://localhost/api/Login/passwordlessCallApi";
				var reqeustData = {
					url: "resultUrl",
					params: "userId=" + formData.id + "&sessionId=" + sessionId
				}
				var data = qs.stringify(reqeustData);
				const config = {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				};
				const response = await common.apiRequest(method, url, data, config);
				var resultData = response.data;
				var jsonData = JSON.parse(resultData);
				var msg = jsonData.msg;
				var code = jsonData.code;
				
				if(code === "000" || code === "000.0") {
					
					var auth = jsonData.data.auth;
					if(auth === "Y") {
						clearInterval(timer);
						window.localStorage.removeItem('session_id');
						window.localStorage.setItem('loginCheck', "ok");
						alert("Login OK");
						movePage("/main");
					}
					else if(auth === "N") {
						cancelLogin();
						setTimeout(() => alert(t("Main.054")), 100);
					}
					else{
						alert(t("Main.062"));
					}
				}
			}
	}

	const regPasswordlessOK = async () => {
	var existId = await passwordlessCheckID("T");
	if(existId === "T") {
		console.log(timeoutId);
		clearTimeout(timeoutId);
		// $("#login_content").hide();
		// $("#passwordless_reg_content").show();
		cancelManage();
	}
	else{
		alert(t("Main.061"));
	}
	}

	const mobileCheck = () => {
	if(checkType.current === "LOGIN")
		loginPasswordlessCheck();
	else if(checkType.current === "QR")
		regPasswordlessOK();
	};

	const managePasswordless = async () => {
	var id = formData.id === undefined ? "" : formData.id;
	var pw = formData.pw === undefined ? "" : formData.pw;


		if(id === "") {
			alert(t("Main.013"));	
			return false;
			}
		
			if(pw === "") {
				alert(t("Main.014"));	
			return false;
			}

	const method = "post";
    const url = "http://localhost/api/Login/passwordlessManageCheck";
    var reqeustData = {
      id: formData.id,
      pw: formData.pw
    }
    var data = qs.stringify(reqeustData);
    const config = { withCredentials: true }
    const response = await common.apiRequest(method, url, data, config);
	

	if(response.result === "OK"){
		setPasswordlessToken(response.PasswordlessToken);
	}
	else{
		alert(response.result);
		const newFormData = { ...formData };  
        delete newFormData["pw"];
        setFormData(newFormData);
	}
	
	if(response.PasswordlessToken !== "" && response.PasswordlessToken !== undefined ) {
		var existId = await passwordlessCheckID("");
		if(existId === "T") {
			setIdCheck(true);
			// $("#login_content").hide();
			// $("#passwordless_unreg_content").show();
		}
		else {
			getPasswordlessQRinfo(response.PasswordlessToken);
		}
	}
  };

	const getPasswordlessQRinfo = async (PasswordlessToken) => {
		checkType.current = "QR";

		var id = formData.id;
		const method = "post";
		const url = "http://localhost/api/Login/passwordlessCallApi";
		var reqeustData = {
			url: "joinApUrl",
			params: "userId=" + id + "&token=" + PasswordlessToken
		}
		var data = qs.stringify(reqeustData);
		const config = {
			withCredentials: true,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		};
		const response = await common.apiRequest(method, url, data, config);
		var resultData = response.data;
		var jsonData = JSON.parse(resultData);
		var msg = jsonData.msg;
		var code = jsonData.code;
		console.log("msg [" + msg + "] code [" + code + "]");
		
		if(code === "000" || code === "000.0") {
			var data = jsonData.data;
			console.log("------------ info -----------");
			console.log(data);
			
			var qr = data.qr;
			var corpId = data.corpId;
			var registerKey = data.registerKey;
			var terms = data.terms;
			var serverUrl = data.serverUrl;
			var userId = data.userId;
			
			console.log("qr: " + qr);
			console.log("corpId: " + corpId);
			console.log("registerKey: " + registerKey);
			console.log("terms: " + terms);
			console.log("serverUrl: " + serverUrl);
			console.log("userId: " + userId);
			
			pushConnectorUrl = data.pushConnectorUrl;
			pushConnectorToken = data.pushConnectorToken;
			
			console.log("pushConnectorUrl: " + pushConnectorUrl);
			console.log("pushConnectorToken: " + pushConnectorToken);
			
			// $("#login_content").hide();
		
			
			var tmpRegisterKey = "";
			var tmpInterval = 4;
			for(var i=0; i<registerKey.length / tmpInterval; i++) {
				tmpRegisterKey = tmpRegisterKey + registerKey.substring(i*tmpInterval, i*tmpInterval + tmpInterval);
				if(registerKey.length > i*tmpInterval)
					tmpRegisterKey = tmpRegisterKey + " ";
			}
			registerKey = tmpRegisterKey;
			
			setServerUrl(serverUrl);
			setRegisterKey(registerKey);
			setSelPasswordNo(4);
			setIdCheck(true);
			setQrcheck(true);
			setqrSrc(qr);
			
			var today = new Date();
			passwordless_milisec = today.getTime();
			passwordless_terms = parseInt(terms - 1);
			check_millisec = today.getTime();
			
			drawPasswordlessReg();
			connWebSocket();
		}
		else {
			alert("[" + code + "] " + msg);
		}
	}

	const drawPasswordlessReg = async () => {
		
		var id = formData.id;
		var today = new Date();
		var gap_second = Math.ceil((today.getTime() - passwordless_milisec) / 1000);
		
		if(gap_second < passwordless_terms) {
		
			var tmp_min = parseInt((passwordless_terms - gap_second) / 60);
			var tmp_sec = parseInt((passwordless_terms - gap_second) % 60);
			
			if(tmp_sec < 10)
				tmp_sec = "0" + tmp_sec;
			
			setTmp_min(tmp_min);
			setTmp_sec(tmp_sec);
			
			if(!timerCheck) {
				timer = setInterval(() => { drawPasswordlessReg(); }, 1000); 
				setTimeoutId(timer);
				timerCheck = true;
			}
			
			var today = new Date();
			var now_millisec = today.getTime();
			var gap_millisec = now_millisec - check_millisec;
			if(gap_millisec > 1500) {
				check_millisec = today.getTime();
				
			}
		}
		else {
			clearTimeout(timeoutId);
			
			// $("#login_content").show();
			// $("#passwordless_reg_content").hide();
			
			setTimeout(() => alert(t("Main.060")), 100);	
			clearInterval(timer);
			cancelManage();
		}
	}

	const unregPasswordless = async () => {
		if(window.confirm(t("Main.022"))) {
			var id = formData.id;
			const method = "post";
			const url = "http://localhost/api/Login/passwordlessCallApi";
			var reqeustData = {
				url: "withdrawalApUrl",
				params: "userId=" + id + "&token=" + PasswordlessToken
			}
			var data = qs.stringify(reqeustData);
			const config = {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				withCredentials: true,
			};
			const response = await common.apiRequest(method, url, data, config);
			var strResult = response.result;
			if(strResult === "OK") {
				var resultData = response.data;
				var jsonData = JSON.parse(resultData);
				var msg = jsonData.msg;
				var code = jsonData.code;
				
				//console.log("data=" + data);
				//console.log("msg [" + msg + "] code [" + code + "]");
				
				if(code === "000" || code === "000.0") {
					window.localStorage.removeItem('passwordless');
					alert(t("Main.027"));	
					setSelPasswordNo(1);
					setIdCheck(false);
					cancelManage();
				}
				else {
					cancelManage();
					alert("[" + code + "] " + msg);
				}
			}
			else {
				cancelManage();
				alert(strResult);
			}
		}
	};

	const cancelManage = () => {

		if (qrSocket.current) {
			qrSocket.current.close();
		}
		
		timerCheck = true;
		clearInterval(timeoutId);
		setIdCheck(false);
		selPassword(2);
		setRegisterKey("");
	};

	const copyTxt1 = () => {
		if (serverUrlRef.current) {
			const range = document.createRange();
			range.selectNodeContents(serverUrlRef.current); 
	
			const selection = window.getSelection();
			selection.removeAllRanges(); 
			selection.addRange(range); 
		
			try {
			document.execCommand("copy"); 
			alert(t("Main.039"));
			} catch (err) {
			console.error("Failed to copy text: ", err);
			}
	
			selection.removeAllRanges(); 
		}
	};

	const copyTxt2 = () => {
		if (registerKeyRef.current) {
			const range = document.createRange();
			range.selectNodeContents(registerKeyRef.current); 
	
			const selection = window.getSelection();
			selection.removeAllRanges(); 
			selection.addRange(range); 
	
			try {
			document.execCommand("copy"); 
			alert(t("Main.040"));
			} catch (err) {
			console.error("Failed to copy text: ", err);
			}
	
			selection.removeAllRanges(); 
		}
	};

	const cancelLogin = async() => {
		timerCheck = true;
		clearInterval(timeoutId);
		clearInterval(timer);

		setLoginTitle(t("Main.002"));
		setWidth(0);		
		setTempPassword("--- ---");
		setLoginButton("Main.007");
		
		var id = formData.id;
		sessionId = window.localStorage.getItem('session_id');
		const method = "post";
		const url = "http://localhost/api/Login/passwordlessCallApi";
		var reqeustData = {
			url: "cancelUrl",
			params: "userId=" + id + "&sessionId=" + sessionId
		}
		var data = qs.stringify(reqeustData);
		const config = {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		};
		const response = await common.apiRequest(method, url, data, config);
		var resultData = response.data;
		var jsonData = JSON.parse(resultData);
		var msg = jsonData.msg;
		var code = jsonData.code;
		window.localStorage.removeItem('session_id');
		setLoginButton("Main.003");
		setloginStatus(false);
		if (qrSocket.current) {
			qrSocket.current.close();
		}
	};   

    return (
      <div className="main_container">
      <div className="modal">
        <div style={{ width: '100%', textAlign: 'right' }}>
          <div className="select_lang">
          <select id="lang" name="lang" value={sessionStorage.getItem("language")} onChange={(e) => common.changeLanguage(e.target.value)}>
            <option value="ko">KR</option>
            <option value="en">EN</option>
          </select>
          </div>
        </div>
        <div className="login_article">
          <div className="title">
            <em style={{ width: '100%', textAlign: 'center' }} id="login_title" name="login_title">{t(`${loginTitle}`)}</em>
          </div>
          <div className="content">
		  {idCheck === false &&
            <div id="login_content">
              <form id="frm">
                <div className="input_group">
                  <input type="text" id="id" name="id" placeholder="ID" value={formData.id || ""} onChange={changeInput} />
                </div>
                {(selPasswordNo === 1 || selPasswordNo === 3)  &&
                  <div className="input_group" id="pw_group">
                    <input type="password" id="pw" name="pw" value={formData.pw || ""} placeholder="PASSWORD" onChange={changeInput} />
                  </div>
                }       
              </form>
              {selPasswordNo === 2 &&
                <div className="input_group" id="bar_group">
                  <div
                    className="timer"
                    id="bar_content"
                    name="bar_content"
                    style={{
                      position: 'relative',
                      background: 'url("/image/timerBG.png") no-repeat center right',
                      borderRadius: 8,
                      backgroundSize: 'cover',
                    }}
                  >
                    <div
                      className="pbar"
                      id="passwordless_bar"
                      style={{
                        background: 'rgb(55 138 239 / 70%)',
                        height: 50,
                        width: `${width}%`,
                        borderRadius: 8,
                        animationDuration: '0ms',
                      }}
                    />
                    <div
                      className="OTP_num"
                      id="passwordless_num"
                      name="passwordless_num"
                      style={{
						textShadow: 'rgba(0, 0, 0, 0.7) 2px 2px 3px',
						top: '0px',
						position: 'absolute',
						fontSize: '22px',
						color: 'rgb(255, 255, 255)',
						textAlign: 'center',
						height: '50px',
						width: '100%',
						lineHeight: '50px',  
						fontWeight: 800,
						letterSpacing: '1px'
                      }}
                  >
                    {tmpPassword}
                  </div>
                </div>
              </div>
              }
			  {selPasswordNo < 3 &&
				<div id="passwordlessSelButton" style={{ height: 30, marginTop: 10, marginBottom: 10 }}>
					<div style={{ textAlign: 'center' }}>
					<span style={{ display: 'inline-block', padding: '6px 10px 16px 10px', textAlign: 'right' }}>
						<label
						htmlFor="selLogin1"
						style={{ margin: 0, padding: 0, fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 300, fontSize: 'medium' }}
						>
						<input type="radio" id="selLogin1" name="selLogin" defaultValue={1} onChange={() => selPassword(1)} checked={selPasswordNo === 1} />
						Password
						</label>
					</span>
					<span style={{ display: 'inline-block', padding: '6px 10px 16px 10px', textAlign: 'right' }}>
						<label
						htmlFor="selLogin2"
						style={{ margin: 0, padding: 0, fontFamily: '"Noto Sans KR", sans-serif', fontWeight: 300, fontSize: 'medium' }}
						>
						<input className="radio_btn" type="radio" id="selLogin2" name="selLogin" defaultValue={2} onChange={() => selPassword(2)} checked={selPasswordNo === 2 || selPasswordNo === 3} />
						Passwordless
						</label>
					</span>
					<span style={{ display: 'inline-block', padding: '6px 10px 16px 10px', textAlign: 'right' }}>
						<a href="#" onClick={() => show_help()} className="cbtn_ball">
						<img src={process.env.PUBLIC_URL + "/image/help_bubble.png"} style={{ width: 16, height: 16, border: 0 }} />
						</a>
					</span>
					</div>
				</div>
				}
              <div className="pwless_info" style={{display: `${showHelp}`}}>
                <a href="#" onClick={() => hide_help()} className="cbtn_ball">
                  <img src={process.env.PUBLIC_URL + "/image/ic_fiicls.png"} height={20} alt="" />
                </a>
                <p>
                  {t("Main.028")}
                  <br />
                  <br />
                  {t("Main.029")}
                  <br />
                  <br />
                </p>
                <p style={{ width: '100%', textAlign: 'center', fontSize: '140%', fontWeight: 800 }}>
                  <font color="#5555FF">Passwordless X1280 Mobile App</font>
                  <br />
                  <br />
                  <a href="https://apps.apple.com/us/app/autootp/id1290713471" target="_new_app_popup">
                    <img src={process.env.PUBLIC_URL + "/image/app_apple_icon.png"} style={{ width: '45%' }} />
                  </a>
                  &nbsp;
                  <a href="https://play.google.com/store/apps/details?id=com.estorm.autopassword" target="_new_app_popup">
                    <img src={process.env.PUBLIC_URL + "/image/app_google_icon.png"} style={{ width: '45%' }} />
                  </a>
                  <br />
                  <img src={process.env.PUBLIC_URL + "/image/app_apple_qr.png"} style={{ width: '45%' }} />
                  &nbsp;
                  <img src={process.env.PUBLIC_URL + "/image/app_google_qr.png"} style={{ width: '45%' }} />
                </p>
                <br />
                {t("Main.030")}
                <br />
                <br />
                {t("Main.031")}
                <p />
              </div>
			  {selPasswordNo === 3 &&
				<div id="passwordlessNotice">
					<div style={{ textAlign: 'center', lineHeight: '24px' }}>{t("Main.024")}<br></br>{t("Main.056")}</div>
				</div>
				}
              <div className="btn_zone">
                <a href="#" onClick={() => login()} className="btn active_btn" id="btn_login">
                  {t(`${loginbutton}`)}
                </a>
              </div>
				{socketCheck === false &&
				<div className="btn_zone" id="login_mobile_check" name="login_mobile_check">
					<a href="#" onClick={() => mobileCheck()} className="btn active_btn">
					{t("Main.063")}
					</a>
				</div>
				}
				{selPasswordNo === 1 &&
					<div className="menbership" id="login_bottom1" name="login_bottom" style={{ textAlign: 'center' }}>
						<a href="./join">{t("Main.005")}</a>
						<a href="./changepw">{t("Main.008")}</a>
					</div>
				}
				{selPasswordNo === 2 &&
					<div className="menbership" id="login_bottom2" name="login_bottom" style={{ textAlign: 'center'}}>
						<a href="./join">{t("Main.005")}</a>
						<a href="#" onClick={() => selPassword(3)}>
						<font style={{ fontWeight: 800 }}>{t("Main.010")}</font>
						</a>
					</div>
				}
				{selPasswordNo === 3 &&
					<div className="menbership" id="manage_bottom" name="manage_bottom" style={{textAlign: 'center' }}>
						<a href="./changepw">{t("Main.008")}</a>
						<a href="#" onClick={() => cancelManage()}>
						<font style={{ fontWeight: 800 }}>{t("Main.003")}</font>
						</a>
					</div>
				}
            </div>
			}
			{registerKey !== "" &&
				<div id="passwordless_reg_content">
				<div style={{ textAlign: 'center' }}>
					<span style={{ width: '100%', textAlign: 'center', fontWeight: 500, fontSize: 24 }}>
					<br />
					{t("Main.032")}
					</span>
					<br />
					<img id="qr" name="qr" src={qrSrc} width="300px" height="300px"  style={{ display: 'inline-block', marginTop: 10 }} />
					<p style={{ width: '100%', padding: '0% 0%', fontWeight: "500px", fontSize: "16px", lineHeight: "24px" }}>{t("Main.033")}</p>
					<br />
					<span style={{ display: 'inline-block', width: '100%', fontSize: 18, padding: 10, marginBottom: 20 }}>
					<div style={{ gap: 10, display: 'flex', justifyContent: 'center', margin: '8px 0', fontSize: 13 }}>
						<div style={{ width: '88%', textAlign: 'left' }}>
						<span style={{ width: '30%' }}>[ {t("Main.037")} ]</span>
						<span ref={serverUrlRef} id="server_url" name="server_url" style={{ fontWeight: 800 }}>{serverUrl}</span>
						</div>
						<div style={{ width: '10%' }}>
						<img src={process.env.PUBLIC_URL + "/image/ic-copy.png"} onClick={() => copyTxt1()} />
						</div>
					</div>
					<div style={{ gap: 10, display: 'flex', justifyContent: 'center', margin: '8px 0', fontSize: 13 }}>
						<div style={{ width: '88%', textAlign: 'left' }}>
						<span style={{ width: '30%' }}>[ {t("Main.038")} ]</span>
						<span ref={registerKeyRef} id="register_key" name="register_key" style={{ fontWeight: 800 }}>{registerKey}</span>
						</div>
						<div style={{ width: '10%' }}>
						<img src={process.env.PUBLIC_URL + "/image/ic-copy.png"} onClick={() => copyTxt2()} />
						</div>
					</div>
					<br />
					<b>
						<span id="rest_time" style={{ fontSize: 24, textShadow: '1px 1px 2px rgba(0,0,0,0.9)', color: '#afafaf' }}>{tmp_min} : {tmp_sec}</span>
					</b>
					</span>
				</div>
				<div className="btn_zone">
					<a href="#" onClick={() => cancelManage()} className="btn active_btn" id="btn_login">
					{t("Main.007")}
					</a>
				</div>
				{socketCheck === false &&
					<div className="btn_zone" id="reg_mobile_check" name="reg_mobile_check">
						<a href="#" onClick={() => mobileCheck()} className="btn active_btn">
						{t("Main.063")}
						</a>
					</div>
				}
				</div>
			}	
            <input type="hidden" id="passwordlessToken" name="passwordlessToken" defaultValue="" />
			{idCheck === true && qrCheck === false &&
            <div id="passwordless_unreg_content" style={{width: '100%', textAlign: 'center', fontWeight: 500, fontSize: 24, lineHeight: "35px" }}>
              {t("Main.034")}
              <br />
              <br />
              <div className="passwordless_unregist">
                <div style={{ padding: 0 }}>
                  <button
                    type="button"
                    id="btn_unregist"
                    name="btn_unregist"
                    style={{
                      height: 120,
                      borderRadius: 4,
                      color: '#FFFFFF',
                      background: '#3C9BEE',
                      borderColor: '#3090E0',
                      padding: '4px 20px',
                      fontSize: '20px',
                      lineHeight: '40px',
                    }}
					onClick={() => unregPasswordless()}
                  >
                    {t("Main.035")}
					<br></br>
					{t("Main.057")}
                  </button>
                </div>
                <div>
                  &nbsp;
                  <br />
                  <p style={{ width: '100%', padding: '0% 0% 0%', fontWeight: 500, fontSize: "16px", lineHeight: "24px" }}>
                    {t("Main.036")}
					<br></br>
					{t("Main.058")}
                  </p>
                </div>
                <br />
                <div className="btn_zone">
                  <a href="#" onClick={() => cancelManage()} className="btn active_btn" id="btn_login">
                    {t("Main.007")}
                  </a>
                </div>
              </div>
            </div>
			}
          </div>
        </div>
      </div>
    </div>
    
    );
}

export default Login;
