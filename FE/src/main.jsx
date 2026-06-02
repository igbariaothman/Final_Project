import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "normalize.css";
import "./index.css";
import App from "./app/App";
import UserContextProvider from "./context/UserContext";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000/";
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserContextProvider>
        <App />
      </UserContextProvider>{" "}
    </BrowserRouter>
  </React.StrictMode>,
);

// const h1 = document.createElement('h1')
// h1.textContent = 'Hello'
// document.getElementById('root').append(h1)
