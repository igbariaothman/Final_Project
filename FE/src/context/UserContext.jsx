import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();


const UserContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load the current user from the server if there is a session in localStorage
  useEffect(() => {
    if (localStorage.getItem("session")) loadMe();
    else setIsLoading(false);
  }, []);


  // Load the current user from the server
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

// Login function
  const login = async (userData) => {
    try {
      const response = await axios.post("/users/login", userData);
      const user = response.data.user;
      setCurrentUser(user);
      setErrorMsg("");
      localStorage.setItem("session", "true");
      if (user.role === "admin") 
        navigate("/admin");
      if (user.role === "user")
        navigate("/");
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "שגיאה בהתחברות למערכת");
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post("/users/signup", userData);
      setErrorMsg("");
      return true;
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "שגיאה ברישום למערכת");
      return false;
    }
  };

  const updateProfileData = (updatedUser) => {
    setCurrentUser(updatedUser);
  };
  
  // Logout function 
  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post("/users/logout", null);
      setCurrentUser(null);
      setErrorMsg("");
      localStorage.removeItem("session");
      navigate("/login");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  //
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
