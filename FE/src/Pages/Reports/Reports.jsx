import { useState } from "react";
import classes from "../Reports/report.module.css";

function Reports() {

const [reportType, setReportType] = useState("") ;
const [message, setMessage] = useState("") ;
const [alert , setAlert] = useState("") ;

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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productId : localStorage.getItem("productId"),
        userId: localStorage.getItem("id"),
        reportType,
        message,
      })
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
    <div className= {classes.container}>
      <p className={classes.title}>Reports</p>

      <label>Report Type:</label>
      <select 
        name="reportType" 
        id="reportType"
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        <option value="" disabled>בחר סוג דיווח</option>
        <option value="product">Product</option>
        <option value="user">User</option>
        <option value="chat">Chat</option>
        
        </select>

      <div className={classes.inputGroup}>
        <label>Message:</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" />
      </div>
        <button onClick={sendMessage}>send Report</button>
        <p className={classes.alert}>{alert}</p>
      
    </div>
  )}

  export default Reports;