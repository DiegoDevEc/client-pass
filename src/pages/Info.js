import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { Common } from "./Common"

function Info(props) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const common = Common();

    const movePage = (url) => {
        navigate(url);
    };

    useEffect(() => {
        const selPasswordNo = window.localStorage.getItem("selPasswordNo");
        if(selPasswordNo === null){
            window.localStorage.setItem("selPasswordNo", 1);
        }
    });

    return (
        <div className=" main_container">
            <div className="modal">
                <div className="sample_site">
                <div style={{width: '100%', textAlign: 'right', margin: '20px 45px'}}>
                    <div className="select_lang">
                        <select id="lang" name="lang" value={sessionStorage.getItem("language")} onChange={(e) => common.changeLanguage(e.target.value)}>
                            <option value="en">{t("Main.051")}</option>
                            <option value="ko">{t("Main.052")}</option>
                        </select>
                    </div>
                </div>
                <div style={{width: '100%'}}>
                    <ul>
                    <li>
                        <a href="#" onClick={() => movePage("/login")} style={{backgroundColor: '#ffffff'}}><img src={process.env.PUBLIC_URL + "/image/pl_logo.png"} alt="" />
                        <strong>{t("Main.041")}</strong>
                        <span>{t("Main.042")}</span>
                        <em className="btn">{t("Main.043")}</em>
                        </a>
                    </li>
                    </ul>
                </div>
                </div>
            </div>
        </div>

    );
}

export default Info;
