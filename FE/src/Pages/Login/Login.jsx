import { useState } from "react";
import classes from "./login.module.css";
import Home from '../Home/Home'

function LogIn() {
  
  const [logEmail, setLogEmail] = useState("");
  const [logPassword, setLogPassword] = useState("");
  const [logMessage, setLogMessage] = useState("");
  const [signUserName, setSignUseName] = useState("");
  const [signEmail ,setSignEmail] = useState("")
  const [signPassword , setSignPassword] = useState("")
  const [confirmPasswod , setConfirmPasswoerd  ] = useState("")
  const [signMessage , setSignMessage] = useState("")
  const [loggedIn , setLoggedIn] = useState(false) 


// Update Email to log in 
  function handleLogEmail(e) {
    setLogEmail(e.target.value);
  }

  //Update Pass to login
  function handleLogPassword(e) {
    setLogPassword(e.target.value);
  }

  //Update Username to signUp
  function handleUserName (e){
    setSignUseName(e.target.value)
  }

  //Update Email toSignUp 
  function handleSignEmail (e){
    setSignEmail(e.target.value)
  }

  //Update Pass to signUp 
  function handleSignPassword (e) {
    setSignPassword(e.target.value)
  }

  //Update confirm Pass to signUp
  function handleConfirmPassword (e) {
    setConfirmPasswoerd(e.target.value)
  }


  // Log in function
async function logIn() {
  setLogMessage("");

  // if email or pass is empty 
  if (!logEmail || !logPassword) {
    setLogMessage("Please fill email and password");
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
      // erros with express-validator
      if (data.errors) {
        setLogMessage(data.errors.map(e => e.msg || e).join(" • "));
      } else {
        setLogMessage(data.message || "Login failed");
      }
      return;
    }

localStorage.setItem("id", data.user.id);
window.dispatchEvent(new Event("authChanged"));
setLoggedIn(true);

    setLogEmail("");
    setLogPassword("");
  } catch (err) {
    console.error(err);
    setLogMessage("Error to log in");
  }
}



  // Sign Up function
async function signUp() {
  setSignMessage("");

  if (!signEmail || !signPassword || !signUserName || !confirmPasswod) {
    setSignMessage("Please fill in all the fields");
    return;
  }

  if (signPassword !== confirmPasswod) {
    setSignMessage("Passwords do not match");
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
      if (data.errors) {
        setSignMessage(data.errors.map(e => e.msg || e).join(" • "));
      } else {
        setSignMessage(data.message || "Signup failed");
      }
      return;
    }

    // successful signup
    setSignMessage(data.message || "User created!");
    setSignUseName("");
    setSignEmail("");
    setSignPassword("");
    setConfirmPasswoerd("");
  } catch (err) {
    console.error(err);
    setSignMessage("Error to sign up");
  }
}


  if (loggedIn){
    return <Home /> ;
  }

  return (
    <div className={classes.container}>
      {/* ======= Log in ======= */}
      <div className={classes.logIn}>
        <p>Log in </p>
        <div className={classes.inputGroup}>
          <input
            type="email"
            placeholder=" "
            value={logEmail}
            onChange={handleLogEmail}
          />
          <label>Email </label>
        </div>

        <div className={classes.inputGroup}>
          <input
            type="password"
            placeholder=" "
            value={logPassword}
            onChange={handleLogPassword}
          />
          <label>Password</label>
        </div>
        <p className={classes.message}>{logMessage}</p>
        <button onClick={logIn} className={classes.shareBtn}>
          Log in{" "}
        </button>
      </div>

      {/* ======== Sign Up ======== */}
      <div className={classes.signUp}>
        <p>Sign Up</p>

        <div className={classes.inputGroup}>
          <input
            type="text"
            placeholder=" "
            value={signUserName}
            onChange={handleUserName}
          />
          <label>UserName</label>
        </div>

        <div className={classes.inputGroup}>
          <input
            type="email"
            placeholder=" "
            value={signEmail}
            onChange={handleSignEmail}
          />
          <label>Email</label>
        </div>

        <div className={classes.inputGroup}>
          <input
            type="password"
            placeholder=" "
            value={signPassword}
            onChange={handleSignPassword}
          />
          <label>Password</label>
        </div>

        <div className={classes.inputGroup}>
          <input
            type="password"
            placeholder=" "
            value={confirmPasswod}
            onChange={handleConfirmPassword}
          />
          <label>Confirm Passwod</label>
        </div>
        <p className={classes.message}>{signMessage}</p>
        <button onClick={signUp} className={classes.shareBtn}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default LogIn;
