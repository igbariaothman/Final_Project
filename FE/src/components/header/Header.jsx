import { useEffect, useState } from "react";
import classes from "./header.module.css";
import logo from "../../assets/logo.jpg";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";

export default function Header() {
  const { currentUser, logout } = useUserContext();

  const navigation = useNavigate();

  function handleLogOut() {
    logout();
  }

  return (
    <header className={classes.header}>
      <div className={classes.container}>
        <div className={classes.logoContainer} onClick={() => navigation("/")}>
          <img src={logo} alt="Logo" className={classes.logoImage} />
          <p className={classes.wepName}>יד שניה לסטודנטים</p>
        </div>

        <nav className={classes.nav}>
          <ul className={classes.ul}>
            {currentUser?.role === "admin" && (
              <li onClick={() => navigation("/admin")} className={classes.li}>
                Admin
              </li>
            )}

            <li onClick={() => navigation("/")} className={classes.li}>
              דף הבית
            </li>

            {currentUser?.role === "user" && (
              <>
                <li onClick={() => navigation("/add-product")} className={classes.li}>
                  הוספת מוצר
                </li>
                <li onClick={() => navigation("/favorites")} className={classes.li}>
                  מועדפים
                </li>
                <li onClick={() => navigation("/inbox")} className={classes.li}>
                     הודעות
                </li>
                  <li onClick={() => navigation("/profile")} className={classes.li}>
             פרופיל שלי
                </li>
              </>
            )}

            {!currentUser ? (
              <li
                onClick={() => navigation("/login")}
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
