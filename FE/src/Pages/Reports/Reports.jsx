import { useState } from "react";
import classes from "../Reports/report.module.css";
import { useUserContext } from "../../context/UserContext.jsx"; 

function Reports() {
  const { currentUser } = useUserContext();
  const [reportType, setReportType] = useState("");
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState("");

  async function sendMessage() {
    setAlert(""); 

    if (!currentUser) {
      setAlert("יש להתחבר כדי לשלוח דיווח");
      return;
    }

    if (!reportType || !message.trim()) {
      setAlert("נא למלא את כל השדות");
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
          userId: localStorage.getItem("id") || currentUser.id,
          reportType,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAlert(data.message || "Error sending report");
        return;
      }

      setAlert("הדיווח נשלח בהצלחה");
      setMessage("");
      setReportType("");
    } catch (err) {
      console.error("Error sending report:", err);
      setAlert("שגיאת שרת");
    }
  }

  return (
    <div className={classes.container}>
      <p className={classes.title}>דוחות</p>

      <label htmlFor="reportType">סוג דוח:</label>
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
      
      {alert && <p className={classes.alert}>{alert}</p>}
    </div>
  );
}

export default Reports;