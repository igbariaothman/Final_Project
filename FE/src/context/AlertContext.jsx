
import {createContext, useState} from "react";

export const AlertContext = createContext();

function AlertContextProvider({ children }) {
  const [alerts , setAlerts] = useState ([]) ;

  const showAlert = (message ,type ) => {
    const newAlert = {
      id :Date.now() ,
      message ,
      type ,
      hide : false
    };
    setAlerts((prev) => [...prev , newAlert])

    setTimeout(() => {
      setAlerts((prev) => 
      prev.map((alert) => alert.id === newAlert.id ?
       {...alert , hide : true} 
        : alert)) ;

        setTimeout(() => {
          setAlerts((prev) => 
          prev.filter((alert) => alert.id !== newAlert.id)
          ) ; 
        } , 400) ;
    } ,5000)
  } ;

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id)) ;
  }

  return (
    <AlertContext.Provider value={{alerts , showAlert , removeAlert }} >
      {children}
    </AlertContext.Provider>
  ) ;
}

export default AlertContextProvider ;