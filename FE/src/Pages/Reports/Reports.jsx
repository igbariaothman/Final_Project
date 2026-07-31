import { useState , useContext} from "react";
import classes from "../Reports/report.module.css";
import { useUserContext } from "../../context/UserContext.jsx"; 
import { AlertContext } from "../../context/AlertContext.jsx";

function Reports() {
  const [reportType, setReportType] = useState("");
  const [message, setMessage] = useState("");
  const { currentUser } = useUserContext();
  const { showAlert } = useContext(AlertContext);


  // Function to send a report to the server
  async function sendMessage() {

    if (!currentUser.id) {
      showAlert("יש להתחבר כדי לשלוח דיווח", "error");
      return;
    }

    if (!reportType || !message.trim()) {
      showAlert("נא למלא את כל השדות", "error");
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
          userId:currentUser.id,
          reportType,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert(data.message || "Error sending report", "error");
        return;
      }

      showAlert("הדיווח נשלח בהצלחה", "success");
      setMessage("");
      setReportType("");
    } catch (err) {
      console.error("Error sending report:", err);
      showAlert("שגיאת שרת", "error");
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
      
    </div>
  );
}

export default Reports;