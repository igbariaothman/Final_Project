import { useEffect, useState } from "react";
import classes from "./header.module.css";
import logo from "../../assets/logo.jpg";
import { useNavigate } from "react-router-dom";
// import fa from ".../Pages/Favorites/Favorites.jsx"


export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("id"));
  const navigation = useNavigate() ;


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
        <div
          className={classes.logoContainer}
          onClick={() => navigation("/")}
        >
          <img src={logo} alt="Logo" className={classes.logoImage} />
          <p className={classes.wepName}>יד שניה לסטודנטים</p>
        </div>

        <nav className={classes.nav}>
          <ul className={classes.ul}>
            {isLoggedIn && (
              <>
                <li
                  onClick={() => navigation("add-product")}
                  className={classes.li}
                >
                  הוספת מוצר
                </li>

                <li
                  onClick={() => navigation("favorites")}
                  className={classes.li}
                >
                  מועדפים
                </li>
              </>
            )}

            {!isLoggedIn ? (
              <li
                onClick={() => navigation("login")}
                className={`${classes.li} ${classes.loginBtn}`}
              >
                התחברות
              </li>
            ) : (
              <li
                onClick={handleLogOut}
                className={`${classes.li} ${classes.logoutBtn}`}
              >
                התנתקות
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}