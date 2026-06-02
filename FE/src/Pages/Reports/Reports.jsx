import { useState } from "react";
import classes from "../Reports/report.module.css";

function Reports() {
  const [reportType, setReportType] = useState("");
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState("");

  async function sendMessage() {
    if (!reportType || !message) {
      setAlert("נא למלא את כל השדות");
      return;
    }

    if (!localStorage.getItem("id")) {
      setAlert("יש להתחבר כדי לשלוח דיווח");
      return;
    }

    if (!message) {
      setAlert("נא למלא את שדה ההודעה");
      return;
    }

    if (!reportType) {
      setAlert("נא לבחור סוג דיווח");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: localStorage.getItem("productId"),
          userId: localStorage.getItem("id"),
          reportType,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert(data.message || "Error sending report");
        return;
      }

      setAlert("Report sent");
      setMessage("");
      setReportType("");
    } catch (err) {
      setAlert("Server error");
    }
  }

  return (
    <div className={classes.container}>
      <p className={classes.title}>דוחות</p>

      <label>סוג דוח:</label>
      <select
        name="reportType"
        id="reportType"
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        <option value="" disabled>
          בחר סוג דיווח
        </option>
        <option value="product">מוצר</option>
        <option value="user">לקוח</option>
        <option value="chat">צ"אט</option>
      </select>

      <div className={classes.inputGroup}>
        <label>תלונה:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="הודעה"
        />
      </div>
      <button onClick={sendMessage}>שלח תלונה</button>
      <p className={classes.alert}>{alert}</p>
      <button onClick={sendMessage}>send Report</button>
      {alert && <p className={classes.alert}>{alert}</p>}
    </div>
  );
}

export default Reports;
