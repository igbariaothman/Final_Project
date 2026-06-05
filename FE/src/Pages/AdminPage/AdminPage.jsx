import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./adminPAge.module.css";

function AdminPage() {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/reports")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
      })
      .catch((err) => {
        console.log("Error fetching reports:", err);
      });
  }, []);

  const getProductImage = (imagesField) => {
    if (!imagesField) return "https://via.placeholder.com/600x400";
    try {
      const parsed = JSON.parse(imagesField);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return `http://localhost:5000${parsed[0]}`;
      }
    } catch (e) {
      if (typeof imagesField === "string" && imagesField.startsWith("/")) {
        return `http://localhost:5000${imagesField}`;
      }
    }
    return "https://via.placeholder.com/600x400";
  };

  const getBadgeLabel = (type) => {
    if (type === "product") return "דיווח מוצר";
    if (type === "user") return "דיווח משתמש";
    if (type === "chat") return "דיווח צ'אט";
    return type;
  };

  return (
    <div className={classes.pageWrapper}>
      <h1 className={classes.pageTitle}>דוחות</h1>

      <div className={classes.cardsContainer}>
        {reports.length === 0 ? (
          <p className={classes.noReports}>אין דיווחים קיימים במערכת</p>
        ) : (
          reports.map((report) => (
            <div 
              className={classes.reportCard} 
              key={report.reportId}
              onClick={() => navigate(`/productDetails/${report.productId}`)}
              style={{ cursor: "pointer" }}
            >
              <div className={classes.imageWrapper}>
                <img
                  src={getProductImage(report.images)}
                  alt={report.productName || "Product"}
                  className={classes.image}
                />
                <span className={`${classes.badge} ${classes[report.reportType]}`}>
                  {getBadgeLabel(report.reportType)}
                </span>
              </div>

              <div className={classes.cardContent}>
                <h2>{report.productName || "מוצר כללי"}</h2>
                <p className={classes.price}>{report.price ? `₪${Number(report.price).toLocaleString()}` : "חינם / תרומה"}</p>

                <div className={classes.metaInfo}>
                  <p>
                    <strong>משתמש: </strong> {report.username || "משתמש"}
                  </p>
                  <p className={classes.reportMessage}>
                    <strong>הודעה :</strong> {report.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPage;