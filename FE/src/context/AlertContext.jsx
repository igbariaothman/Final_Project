/**
 * מודול: ניהול התראות מערכת
 * תפקיד: הצגת הודעות חיווי למשתמש עם מנגנון הסרה והסתרה אוטומטי
 */

import { createContext, useState } from "react";

export const AlertContext = createContext();

function AlertContextProvider({ children }) {
  // ניהול רשימת ההתראות הפעילות
  const [alerts, setAlerts] = useState([]);

  // הצגת התראה חדשה והגדרת טיימר להסרה אוטומטית
  const showAlert = (message, type) => {
    const newAlert = {
      id: Date.now(),
      message,
      type,
      hide: false,
    };
    setAlerts((prev) => [...prev, newAlert]);

    // הפעלת אנימציית הסתרה לאחר 5 שניות
    setTimeout(() => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === newAlert.id ? { ...alert, hide: true } : alert
        )
      );

      // מחיקה סופית של ההתראה לאחר סיום האנימציה
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== newAlert.id));
      }, 400);
    }, 5000);
  };

  // מחיקת התראה ידנית לפי מזהה
  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export default AlertContextProvider;