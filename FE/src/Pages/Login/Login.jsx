import { useState } from "react";
import classes from "./login.module.css";
import Home from "../Home/Home";
import { data } from "react-router-dom";

function LogIn() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const [logEmail, setLogEmail] = useState("");
  const [logPassword, setLogPassword] = useState("");
  const [logMessage, setLogMessage] = useState("");

  const [signUserName, setSignUseName] = useState("");
  const [signEmail, setSignEmail] = useState("");
  const [signPassword, setSignPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signMessage, setSignMessage] = useState("");

  // const [role , setRole ] = useState("user") ;

  async function logIn() {
    setLogMessage("");
    if (!logEmail || !logPassword) {
      setLogMessage("נא למלא אימייל וסיסמה");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: logEmail, password: logPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLogMessage(data.message || "שגיאה בהתחברות");
        return;
      }
      localStorage.setItem("id", data.user.id);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("login", true);
      window.dispatchEvent(new Event("authChanged"));
      setLoggedIn(true);
    } catch (err) {
      setLogMessage("שגיאה בחיבור לשרת");
    }
  }

  async function signUp() {
    setSignMessage("");
    if (!signEmail || !signPassword || !signUserName || !confirmPassword) {
      setSignMessage("נא למלא את כל השדות");
      return;
    }
    if (signPassword !== confirmPassword) {
      setSignMessage("הסיסמאות אינן תואמות");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signUserName,
          email: signEmail,
          password: signPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignMessage(data.message || "שגיאה בהרשמה");
        return;
      }
      setSignMessage("החשבון נוצר בהצלחה! ניתן להתחבר כעת");
      setIsLoginMode(true);
    } catch (err) {
      setSignMessage("שגיאה בחיבור לשרת");
    }
  }

  if (loggedIn) return <Home />;

  return (
    <div className={classes.wrapper}>
      <div className={classes.authCard}>
        <h2 className={classes.title}>
          {isLoginMode ? "התחברות" : "הרשמה למערכת"}
        </h2>

        {isLoginMode ? (
          <div className={classes.formGroup}>
            <div className={classes.inputBox}>
              <input
                type="email"
                value={logEmail}
                onChange={(e) => setLogEmail(e.target.value)}
                required
              />
              <label>אימייל</label>
            </div>
            <div className={classes.inputBox}>
              <input
                type="password"
                value={logPassword}
                onChange={(e) => setLogPassword(e.target.value)}
                required
              />
              <label>סיסמה</label>
            </div>
            {logMessage && <p className={classes.errorMessage}>{logMessage}</p>}
            <button onClick={logIn} className={classes.actionBtn}>
              התחבר
            </button>
            <p className={classes.switchText}>
              אין לך חשבון?{" "}
              <span onClick={() => setIsLoginMode(false)}>הירשם כאן</span>
            </p>
          </div>
        ) : (
          <div className={classes.formGroup}>
            <div className={classes.inputBox}>
              <input
                type="text"
                value={signUserName}
                onChange={(e) => setSignUseName(e.target.value)}
                required
              />
              <label>שם משתמש</label>
            </div>
            <div className={classes.inputBox}>
              <input
                type="email"
                value={signEmail}
                onChange={(e) => setSignEmail(e.target.value)}
                required
              />
              <label>אימייל</label>
            </div>
            <div className={classes.inputBox}>
              <input
                type="password"
                value={signPassword}
                onChange={(e) => setSignPassword(e.target.value)}
                required
              />
              <label>סיסמה</label>
            </div>
            <div className={classes.inputBox}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label>אימות סיסמה</label>
            </div>

            {signMessage && (
              <p className={classes.infoMessage}>{signMessage}</p>
            )}
            <button onClick={signUp} className={classes.actionBtn}>
              צור חשבון
            </button>
            <p className={classes.switchText}>
              כבר יש לך חשבון?{" "}
              <span onClick={() => setIsLoginMode(true)}>התחבר כאן</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LogIn;
