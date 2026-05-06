import { Routes, Route } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Home from "../Pages/Home/Home";
import AddProduct from "../Pages/AddProduct/AddProduct";
import LogIn from '../Pages/Login/Login'
import ProductDetails from "../Pages/ProductDetails/ProductDetails";
import Favorites from "../Pages/Favorites/Favorites"
import classes from "./app.module.css";

export default function App() {
  return (
    <div className={classes.app}>
      <Header />
      <main >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/productDetails/:id" element ={<ProductDetails/>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}