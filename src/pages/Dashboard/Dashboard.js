import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Chart } from "primereact/chart";
import "chart.js/auto";

function Dashboard() {
    const { t } = useTranslation();

    const [chartData] = useState({
        labels: [t("Main.065"), t("Main.066"), t("Main.067")],
        datasets: [
            {
                label: t("Main.064"),
                backgroundColor: ["#42A5F5", "#66BB6A", "#FFA726"],
                data: [5, 10, 2]
            }
        ]
    });

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        }
    };

    const containerStyle = {
        width: "600px",
        height: "400px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        padding: "20px",
        border: "1px solid #e1e1e1",
        boxShadow: "0px 0px 8px rgba(0,0,0,0.15)",
        borderRadius: "10px"
    };

    return (
        <div className="main_container">
            <div className="modal">
                <div style={containerStyle}>
                    <h2>{t("Main.064")}</h2>
                    <Chart type="bar" data={chartData} options={options} style={{height:'300px'}} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
