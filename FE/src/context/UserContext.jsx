import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMe();
  }, []);

  async function loadMe() {
    try {
      const res = await axios.get("/users/profile");
      setCurrentUser(res.data.user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (userData) => {
    try {
      const response = await axios.post("/users/login", userData);
      setCurrentUser(response.data.user);
      setErrorMsg("");
      navigate("/");
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "שגיאה בהתחברות למערכת");
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/users/register", userData);
      setCurrentUser(response.data.user);
      setErrorMsg("");
      navigate("/");
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "שגיאה ברישום המערכת");
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post("/users/logout", null);
      setCurrentUser(null);
      setErrorMsg("");
      navigate("/login");
    } catch (error) {
      console.log(error);
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