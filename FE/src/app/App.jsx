import { useState } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Home from "../Pages/Home/Home";
import AddProduct from "../Pages/AddProduct/AddProduct";
import LogIn from '../Pages/Login/Login'
import Favorites  from "../Pages/Favorites/Favorites"; 
import classes from "./app.module.css";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <section className={classes.app}>
      <Header setPage={setPage} />
      <main>
        {page === "home" && <Home  />}
        {page === "products" && <AddProduct />}
        {page === "login" && <LogIn/> }
        {page === "Favorite" && <Favorites/>}
      </main>

      <Footer />
    </section>
  );
}
