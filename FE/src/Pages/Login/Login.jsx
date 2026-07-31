import { useState , useContext } from "react";
import classes from "./login.module.css";
import Home from "../Home/Home";
import { useUserContext } from "../../context/UserContext";
import {AlertContext} from "../../context/AlertContext";

function LogIn() {
  const { login, errorMsg, register, setErrorMsg } = useUserContext();
  const {showAlert} = useContext(AlertContext);
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

  // Function to handle login form submission
  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLogMessage("");
    if (!logEmail || !logPassword) {
      setErrorMsg("נא למלא אימייל וסיסמה");
      showAlert("נא למלא אימייל וסיסמה", "error");
      return;
    }

    // Create user data object and call the login function from context
    const userData = { email: logEmail, password: logPassword };
    login(userData);
  }

  // Function to handle sign-up form submission
  async function handleSignUpSubmit(e) {
    e.preventDefault();
    setSignMessage("");
    setErrorMsg("");
    // Validate that all required fields are filled
    if (!signUserName || !signEmail || !signPassword || !confirmPassword) {
      setErrorMsg("נא למלא את כל השדות");
      showAlert("נא למלא את כל השדות", "error");
      return;
    }
    if (signPassword !== confirmPassword) {
      setErrorMsg("הסיסמאות אינן תואמות");
      showAlert("הסיסמאות אינן תואמות", "error");
      return;
    }
    if (signPassword.length < 8) {
      setErrorMsg("הסיסמה חייבת להכיל לפחות 8 תווים");
      showAlert("הסיסמה חייבת להכיל לפחות 8 תווים", "error");
      return;
    }

    // Create user data object and call the register function from context
    const userData = {
      username: signUserName,
      email: signEmail,
      password: signPassword,
    };
    if (await register(userData)) {
      setSignMessage("החשבון נוצר בהצלחה! ניתן להתחבר כעת");
      showAlert("החשבון נוצר בהצלחה! ניתן להתחבר כעת", "info");
      setIsLoginMode(true);
      setSignUserName("");
      setSignEmail("");
      setSignPassword("");
      setConfirmPassword("");
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
          <form onSubmit={handleLoginSubmit} className={classes.formGroup}>
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
            {errorMsg && <p className={classes.errorMessage}>{errorMsg}</p>}
            <button type="submit" className={classes.actionBtn}>
              התחבר
            </button>
            <p className={classes.switchText}>
              אין לך חשבון?{" "}
              <span
                onClick={() => {
                  setIsLoginMode(false);
                  setErrorMsg("");
                }}
              >
                הירשם כאן
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignUpSubmit} className={classes.formGroup}>
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

            {errorMsg && <p className={classes.errorMessage}>{errorMsg}</p>}
            {signMessage && (
              <p className={classes.infoMessage}>{signMessage}</p>
            )}
            <button type="submit" className={classes.actionBtn}>
              צור חשבון
            </button>
            <p className={classes.switchText}>
              כבר יש לך חשבון?{" "}
              <span
                onClick={() => {
                  setIsLoginMode(true);
                  setErrorMsg("");
                }}
              >
                התחבר כאן
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default LogIn;
