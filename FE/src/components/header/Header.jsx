/**
 * מודול: סרגל ניווט עליון
 * תפקיד: הצגת תפריט האתר, ניהול ניווט מותאם הרשאות, חיווי הודעות שלא נקראו וביצוע התנתקות
 */

import { useEffect, useState } from "react";
import classes from "./header.module.css";
import logo from "../../assets/logo.jpg";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";

export default function Header() {
  const { currentUser, logout } = useUserContext();
  const navigation = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // משיכת כמות ההודעות שלא נקראו במרווחי זמן קבועים
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchUnread = () => {
      fetch(`http://localhost:5000/messages/inbox/${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const count = data.filter(
              (conv) =>
                conv.isRead === 0 && Number(conv.receiverId) === Number(currentUser.id)
            ).length;
            setUnreadCount(count);
          }
        })
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 4000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // ביצוע התנתקות מהמערכת
  function handleLogOut() {
    logout();
  }

  return (
    <header className={classes.header}>
      <div className={classes.container}>
        {/* לוגו האתר וחזרה לדף הבית */}
        <div className={classes.logoContainer} onClick={() => navigation("/")}>
          <img src={logo} alt="Logo" className={classes.logoImage} />
          <p className={classes.wepName}>יד שניה לסטודנטים</p>
        </div>

        {/* תפריט ניווט דינמי לפי סוג משתמש */}
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
                <li
                  onClick={() => navigation("/add-product")}
                  className={classes.li}
                >
                  הוספת מוצר
                </li>
                <li
                  onClick={() => navigation("/favorites")}
                  className={classes.li}
                >
                  מועדפים
                </li>
                <li
                  onClick={() => navigation("/inbox")}
                  className={`${classes.li} ${unreadCount > 0 ? classes.glowingInboxNav : ""}`}
                >
                  <span>הודעות</span>
                  {unreadCount > 0 && (
                    <span className={classes.unreadBadge}>{unreadCount}</span>
                  )}
                </li>
                <li
                  onClick={() => navigation(`/profile/${currentUser.id}`)}
                  className={classes.li}
                >
                  המוצרים שלי
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* כפתורי פעולה: פרופיל, התחברות והתנתקות */}
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
            <button
              onClick={() => navigation("/login")}
              className={classes.loginBtn}
            >
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