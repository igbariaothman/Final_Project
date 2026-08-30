/**
 * מודול: טופס שליחת דיווח ותלונה
 * תפקיד: קליטת דיווחים ממשתמשים על מוצרים, משתמשים או שיחות צ'אט ושליחתם לטיפול מנהל המערכת
 */

import { useState, useContext } from "react";
import classes from "../Reports/report.module.css";
import { useUserContext } from "../../context/UserContext.jsx";
import { AlertContext } from "../../context/AlertContext.jsx";
import { useNavigate } from "react-router-dom";

// אימות תקינות נתוני הדיווח לפני שליחה
function validateReportInput(currentUser, reportType, message, showAlert) {
  if (!currentUser?.id) {
    showAlert("יש להתחבר כדי לשלוח דיווח", "warning");
    return false;
  }
  if (!reportType || !message.trim()) {
    showAlert("נא למלא את כל השדות", "warning");
    return false;
  }
  return true;
}

// ביצוע קריאת השרת לשליחת הדיווח
async function sendReportRequest(payload) {
  const res = await fetch("http://localhost:5000/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "שגיאה בשליחת הדיווח");
  return data;
}

function Reports() {
  const [reportType, setReportType] = useState("");
  const [message, setMessage] = useState("");
  const { currentUser } = useUserContext();
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  // שליחת טופס התלונה לשרת
  async function sendMessage() {
    if (!validateReportInput(currentUser, reportType, message, showAlert)) return;

    const payload = {
      productId: localStorage.getItem("productId"),
      userId: currentUser.id,
      reportType,
      message: message.trim(),
    };

    try {
      await sendReportRequest(payload);
      showAlert("הדיווח נשלח בהצלחה", "success");
      setMessage("");
      setReportType("");
      navigate("/");
    } catch (err) {
      showAlert(err.message || "שגיאת שרת", "error");
    }
  }

  return (
    <div className={classes.container}>
      <p className={classes.title}>דוחות</p>

      {/* בחירת סוג הדיווח */}
      <label htmlFor="reportType">סוג דוח:</label>
      <select
        name="reportType"
        id="reportType"
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        <option value="" disabled>בחר סוג דיווח</option>
        <option value="product">מוצר</option>
        <option value="user">לקוח</option>
        <option value="chat">צ'אט</option>
      </select>

      {/* הזנת פירוט התלונה */}
      <div className={classes.inputGroup}>
        <label>תלונה:</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="הודעה"
        />
      </div>

      <button onClick={sendMessage}>שלח תלונה</button>
    </div>
  );
}

export default Reports;