import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Home from "../Pages/Home/Home";
import AddProduct from "../Pages/AddProduct/AddProduct";
import LogIn from "../Pages/Login/Login";
import ProductDetails from "../Pages/ProductDetails/ProductDetails";
import Favorites from "../Pages/Favorites/Favorites";
import Report from "../Pages/Reports/Reports.jsx";
import Inbox from "../Pages/Inpox/Inbox.jsx"
import classes from "./app.module.css";
import AdminPage from "../Pages/AdminPage/AdminPage.jsx";

export default function App() {
  const role = localStorage.getItem("role");

  return (
    <div className={classes.app}>
      <Header />
      <main>
        {role === "admin" || role === "user" ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/productDetails/:id" element={<ProductDetails />} />
            <Route path="/reports" element={<Report />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/productDetails/:id" element={<ProductDetails />} />
            <Route path="/reports" element={<Navigate to="/login" replace />} />
            <Route path="/inbox" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  );
}