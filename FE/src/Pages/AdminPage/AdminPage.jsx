
import React, { useEffect, useState } from "react";
import classes from "./adminPAge.module.css";


function AdminPage() {

    const [reports, setReports] = useState([]);

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


  return (
<div className={classes.cardsContainer}>
    <p className="title">Product Reports</p>

  {reports.map((report) => (
    <div className={classes.reportCard} key={report.reportId}>

      <img
        src={`http://localhost:5000${JSON.parse(report.images)[0]}`}
        alt={report.productName}
        className={classes.image}
      />

      <h2>{report.productName}</h2>

      <p>{report.price} ₪</p>

      <p>
        <strong>User:</strong> {report.username}
      </p>

      <p>
        <strong>Report Type:</strong> {report.reportType}
      </p>

      <p>
        <strong>Message:</strong> {report.message}
      </p>

    </div>
  ))}

</div>
);
}

export default AdminPage;