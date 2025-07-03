import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { Common } from "./Common";

function Main(props) {
    const navigate = useNavigate();
    const { t } = useTranslation(); 
    const common = Common();
    const [formData, setFormData] = useState({});

    const pStyle = {
        backgroundColor: 'rgb(255, 255, 255)',
        width: '500px',
        textDecoration: 'none',
        color: '#333333',
        padding: '30px',
        border: '1px solid #e1e1e1',
        boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.15)',
        borderRadius: '10px',
      };

    const buttonStyle = {
        textDecoration : 'none',
        color: '#333333',
        padding: "0px 0px 0px",
        border: '1px solid #e1e1e1',
        boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.15)',
        borderRadius: '10px',
    }

    useEffect(() => {
    });

    const movePage = (url) => {
        navigate(url);
    };

    const logout = async () =>  {
        const method = "post";
        const url = "http://localhost/api/Login/logout";
        const data = "";
        const config = "";
        const response = await common.apiRequest(method, url, data, config);
        window.localStorage.removeItem("loginCheck");
        movePage("/");
      };
    
      const withdraw = async () => {
        
        if(window.confirm(t("Main.011") + "\n" + t("Main.012"))) {
            const method = "post";
            const url = "http://localhost/api/Login/withdraw";
            const data = "";
            const config = "";
            const response = await common.apiRequest(method, url, data, config);
            console.log(response);
            if(response.result === "OK"){
                alert("Membership withdrawal has been completed.");
                movePage("/");
            }
        }
      };

    return (
        <div className="main_container">
      <div className="modal">
        <div className="sample_site" style={{ margin: '0 0 0' }}>
          <div style={{ width: '100%', textAlign: 'right', margin: '20px 45px' }}>
            <div className="select_lang">
            <select id="lang" name="lang" value={sessionStorage.getItem("language")} onChange={(e) => common.changeLanguage(e.target.value)}>
                <option value="en">EN</option>
                <option value="ko">KR</option>
              </select>
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <ul>
              <li>
                <p style={pStyle}>
                  <strong>{t("Main.041")}</strong>
                  <span>{t("Main.042")}</span>
                  <a href="#" onClick={logout} style={buttonStyle}>
                    <em className="btn" id="btn_logout">{t("Main.004")}</em>
                  </a>
                  &nbsp;&nbsp;
                  <a href="#" onClick={withdraw} style={buttonStyle}>
                    <em className="btn" id="btn_delete">{t("Main.006")}</em>
                  </a>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    );
}

export default Main;
