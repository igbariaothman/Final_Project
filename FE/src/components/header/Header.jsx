import { useEffect, useState } from "react";
import classes from "./header.module.css";
import logo from "../../assets/logo.jpg";

export default function Header({ setPage }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("id"));

  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem("id"));
    window.addEventListener("authChanged", check);
    return () => window.removeEventListener("authChanged", check);
  }, []);

  function handleLogOut() {
    localStorage.removeItem("id");
    window.dispatchEvent(new Event("authChanged"));
    setPage("home");
  }

  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <div className={classes.logoContainer} onClick={() => setPage("home")}>
          <img
            src={logo} 
            alt="Logo"
            className={classes.logoImage}
          />
        </div>
        <p className={classes.wepName}>יד שניה לסטודנטים</p>

        <nav className={classes.nav}>
          <ul className={classes.ul}>

            { isLoggedIn && (
              <>
                <li onClick={() => setPage("products")} className={classes.li}>
                  הוספת מוצר
                </li>
                
                
                <li onClick={() => setPage("Favorite")} className={classes.li}>
                  מועדפים
                </li>
              </>
            )
          }

            {!isLoggedIn ? (
              <li onClick={() => setPage("login")} className={`${classes.li} ${classes.loginBtn}`}>
                התחברות
              </li>
            ) : (
              <li onClick={handleLogOut} className={`${classes.li} ${classes.logoutBtn}`}>
                התנתקות
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}