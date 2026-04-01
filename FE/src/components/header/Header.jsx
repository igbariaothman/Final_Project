import { useEffect, useState } from "react";
import classes from "./header.module.css";

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

  function handleGoLogin() {
    setPage("login");
  }

  return (
    <header className={classes.header}>
      <h1 onClick={() => setPage("home")}>My Store</h1>

      <nav className={classes.nav}>
        <ul>
          <li onClick={() => setPage("home")} className={classes.li}>
            Home
          </li>

          <li onClick={() => setPage("products")} className={classes.li}>
            Add Product
          </li>

          <li onClick={() => setPage("Favorite")} className={classes.li}>
            Favorites
          </li>

          {!isLoggedIn ? (
            <li onClick={handleGoLogin} className={classes.li}>
              Log In
            </li>
          ) : (
            <li onClick={handleLogOut} className={classes.li}>
              Log out
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
