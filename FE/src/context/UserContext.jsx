

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * מודול: ניהול מצב משתמש גלובלי
 * תפקיד: שיתוף נתוני המשתמש המחובר, ביצוע התחברות, הרשמה, התנתקות וטעינת נתוני הפעלה
 */

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // טעינת נתוני המשתמש מהשרת במידה וקיימת הפעלה שמורה
  useEffect(() => {
    if (localStorage.getItem("session")) loadMe();
    else setIsLoading(false);
  }, []);

  // שליפת פרטי המשתמש המחובר מהשרת
  async function loadMe() {
    try {
      const res = await axios.get("/users/profile");
      setCurrentUser(res.data.user);
    } catch {
      setCurrentUser(null);
      localStorage.removeItem("session");
    } finally {
      setIsLoading(false);
    }
  }

  // ביצוע התחברות למערכת וניתוב לפי הרשאה
  const login = async (userData) => {
    try {
      const res = await axios.post("/users/login", userData);
      const user = res.data.user;
      setCurrentUser(user);
      setErrorMsg("");
      localStorage.setItem("session", "true");
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "שגיאה בהתחברות למערכת");
    }
  };

  // הרשמת משתמש חדש
  const register = async (userData) => {
    try {
      await axios.post("/users/signup", userData);
      setErrorMsg("");
      return true;
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "שגיאה ברישום למערכת");
      return false;
    }
  };

  // התנתקות מהמערכת ומחיקת נתוני ההפעלה
  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post("/users/logout", null);
      setCurrentUser(null);
      setErrorMsg("");
      localStorage.removeItem("session");
      navigate("/login");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        login,
        errorMsg,
        setErrorMsg,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
export default UserContextProvider;