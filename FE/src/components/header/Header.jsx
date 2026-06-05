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
                מנהל מערכת
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
              </>
            )}
          </ul>
        </nav>

        <div className={classes.userActions}>
          {currentUser && (
            <div 
              onClick={() => navigation("/profile")} 
              className={classes.profileWrapper}
              title="הפרופיל שלי"
            >
              <div className={classes.profileLogoWrapper}>
                <svg 
                  className={classes.profileIcon} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M6 21V19C6 16.79 7.79 15 10 15H14C16.21 15 18 16.79 18 19V21" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}

          {!currentUser ? (
            <button onClick={() => navigation("/login")} className={classes.loginBtn}>
              התחברות
            </button>
          ) : (
            <button onClick={handleLogOut} className={classes.logoutBtn}>
              התנתקות
            </button>
          )}
        </div>

      </div>
    </header>
  );
}