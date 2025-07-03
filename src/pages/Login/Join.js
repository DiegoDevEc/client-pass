import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Common } from "../Common";
import qs from 'qs';

function Join(props) {
    const common = Common();
    const { t } = useTranslation(); 
    const navigate = useNavigate([]);
    const [formData, setFormData] = useState({});
    
    useEffect(() => {
    }, []);

    const movePage = (url) => {
        navigate(url);
    };


    const changeInput = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

  const join = async () => {
   
    
    var id = formData.id === undefined ? "" : formData.id;
    var pw = formData.pw === undefined ? "" : formData.pw;
    var pw_re = formData.pw_re === undefined ? "" : formData.pw_re;
  //	email = trim(email);
  
  
    if(id === "") {
      alert(t("Main.013"));	
      return false;
    }
  
    if(pw === "") {
        alert(t("Main.014"));	
      return false;
    }
  
    if(pw_re === "") {
        alert(t("Main.015"));	
      return false;
    }
    
    if(pw !== pw_re) {
        alert(t("Main.016"));	
        const newFormData = { ...formData };  
        delete newFormData["pw_re"];  
        setFormData(newFormData);
      return false;
    }
    const method = "post";
    const url = "http://localhost/api/Login/join";
    var reqeustData = {
      id: formData.id,
      pw: formData.pw,
      email: formData.email
    }
    var data = qs.stringify(reqeustData);
    const config = "";
    const response = await common.apiRequest(method, url, data, config);
    if(response.result === "OK"){
        alert("Sign up is complete.");
        movePage("/login");
    }
    else{
        alert(response.result);
    }
  };

    
    return (
        <div className="main_container">
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
              <em style={{ width: '100%', textAlign: 'center' }}>{t("Main.005")}</em> 
            </div>
            <div className="content">
              <div>
                <form>
                  <div className="input_group">
                    <input
                      type="text"
                      id="id"
                      name="id"
                      placeholder="ID"
                      value={formData.id || ""}
                      onChange={changeInput}
                    />
                  </div>
                  <div className="input_group">
                    <input
                      type="password"
                      id="pw"
                      name="pw"
                      placeholder="PASSWORD"
                      value={formData.pw || ""}
                      onChange={changeInput}
                    />
                  </div>
                  <div className="input_group">
                    <input
                      type="password"
                      id="pw_re"
                      name="pw_re"
                      placeholder="Confirmation PASSWORD"
                      value={formData.pw_re || ""}
                      onChange={changeInput}
                    />
                  </div>
                  <div className="input_group">
                    <input
                      type="text"
                      id="eamil"
                      name="email"
                      placeholder="Confirmation PASSWORD"
                      value={formData.email || ""}
                      onChange={changeInput}
                    />
                  </div>
                </form>
              </div>
              <div className="btn_zone">
                <button onClick={join} className="btn active_btn">
                    {t("Main.005")}
                </button>
                &nbsp;
                <a href="/login" className="btn active_btn">
                    {t("Main.007")}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="modal_bg"></div>
      </div>
    </div>
    );
}

export default Join;
