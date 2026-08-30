

import { useState, useContext } from "react";
import classes from "./login.module.css";
import Home from "../Home/Home";
import { useUserContext } from "../../context/UserContext";
import { AlertContext } from "../../context/AlertContext";

/**
 * מודול: מסך התחברות והרשמה
 * תפקיד: אימות פרטי משתמש, יצירת חשבונות חדשים, מעבר בין מצבי אימות ובדיקות תקינות קלט
 */

// אימות תקינות שדות טופס ההרשמה
function validateRegistrationInput(data, setErrorMsg, showAlert) {
  const { signUserName, signEmail, signPassword, confirmPassword } = data;
  if (!signUserName || !signEmail || !signPassword || !confirmPassword) {
    setErrorMsg("נא למלא את כל השדות");
    showAlert("נא למלא את כל השדות", "error");
    return false;
  }
  if (signPassword !== confirmPassword) {
    setErrorMsg("הסיסמאות אינן תואמות");
    showAlert("הסיסמאות אינן תואמות", "error");
    return false;
  }
  if (signPassword.length < 8) {
    setErrorMsg("הסיסמה חייבת להכיל לפחות 8 תווים");
    showAlert("הסיסמה חייבת להכיל לפחות 8 תווים", "error");
    return false;
  }
  return true;
}

function LogIn() {
  const { login, errorMsg, register, setErrorMsg } = useUserContext();
  const { showAlert } = useContext(AlertContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loggedIn] = useState(false);

  const [logEmail, setLogEmail] = useState("");
  const [logPassword, setLogPassword] = useState("");
  const [signUserName, setSignUserName] = useState("");
  const [signEmail, setSignEmail] = useState("");
  const [signPassword, setSignPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signMessage, setSignMessage] = useState("");

  // איפוס שדות ההרשמה ומעבר להתחברות
  const resetSignUpState = () => {
    setSignMessage("החשבון נוצר בהצלחה! ניתן להתחבר כעת");
    showAlert("החשבון נוצר בהצלחה! ניתן להתחבר כעת", "info");
    setIsLoginMode(true);
    setSignUserName("");
    setSignEmail("");
    setSignPassword("");
    setConfirmPassword("");
  };

  // שליחת טופס התחברות
  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (!logEmail || !logPassword) {
      setErrorMsg("נא למלא אימייל וסיסמה");
      showAlert("נא למלא אימייל וסיסמה", "error");
      return;
    }
    login({ email: logEmail, password: logPassword });
  }

  // שליחת טופס הרשמה
  async function handleSignUpSubmit(e) {
    e.preventDefault();
    setSignMessage("");
    setErrorMsg("");

    const formData = { signUserName, signEmail, signPassword, confirmPassword };
    if (!validateRegistrationInput(formData, setErrorMsg, showAlert)) return;

    const userData = { username: signUserName, email: signEmail, password: signPassword };
    if (await register(userData)) resetSignUpState();
  }

  if (loggedIn) return <Home />;

  return (
    <div className={classes.wrapper}>
      <div className={classes.authCard}>
        <h2 className={classes.title}>{isLoginMode ? "התחברות" : "הרשמה למערכת"}</h2>

        {isLoginMode ? (
          <form onSubmit={handleLoginSubmit} className={classes.formGroup}>
            <div className={classes.inputBox}>
              <input type="email" value={logEmail} onChange={(e) => setLogEmail(e.target.value)} required />
              <label>אימייל</label>
            </div>
            <div className={classes.inputBox}>
              <input type="password" value={logPassword} onChange={(e) => setLogPassword(e.target.value)} required />
              <label>סיסמה</label>
            </div>
            {errorMsg && <p className={classes.errorMessage}>{errorMsg}</p>}
            <button type="submit" className={classes.actionBtn}>התחבר</button>
            <p className={classes.switchText}>
              אין לך חשבון? <span onClick={() => { setIsLoginMode(false); setErrorMsg(""); }}>הירשם כאן</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignUpSubmit} className={classes.formGroup}>
            <div className={classes.inputBox}>
              <input type="text" value={signUserName} onChange={(e) => setSignUserName(e.target.value)} required />
              <label>שם משתמש</label>
            </div>
            <div className={classes.inputBox}>
              <input type="email" value={signEmail} onChange={(e) => setSignEmail(e.target.value)} required />
              <label>אימייל</label>
            </div>
            <div className={classes.inputBox}>
              <input type="password" value={signPassword} onChange={(e) => setSignPassword(e.target.value)} required />
              <label>סיסמה</label>
            </div>
            <div className={classes.inputBox}>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <label>אימות סיסמה</label>
            </div>
            {errorMsg && <p className={classes.errorMessage}>{errorMsg}</p>}
            {signMessage && <p className={classes.infoMessage}>{signMessage}</p>}
            <button type="submit" className={classes.actionBtn}>צור חשבון</button>
            <p className={classes.switchText}>
              כבר יש לך חשבון? <span onClick={() => { setIsLoginMode(true); setErrorMsg(""); }}>התחבר כאן</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default LogIn;