/**
 * מודול: דף הבית ותצוגת מוצרים
 * תפקיד: הצגת קטלוג המוצרים, חיפוש מבוסס מילות מפתח, סינון מתקדם, מיון וחלוקה לעמודים
 */

import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./home.module.css";
import { useUserContext } from "../../context/UserContext";
import FilterSlidebar from "../FilterSlidebar/FilterSlidebar";
import { AlertContext } from "../../context/AlertContext";

function Home() {
  // ניהול מצבי נתונים, שדות חיפוש, פגינציה ומסננים
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSlidebarOpen, setIsSlidebarOpen] = useState(false);
  const [sortType, setSortType] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    listingType: "",
    productstatus: "",
    priceRange: { min: 0, max: 500 },
  });

  const navigate = useNavigate();
  const { currentUser } = useUserContext();
  const { showAlert } = useContext(AlertContext);

  const PRODUCTS_PER_PAGE = 16;

  // טעינת רשימת המוצרים בעת עליית הרכיב
  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // איפוס עמוד הפגינציה ל-1 בעת שינוי מסנן או חיפוש
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortType, filters]);

  // מעבר בין עמודים וגלילה לראש המסך
  function handlePageChange(newPage) {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // סינון מוצרים לפי סטטוס פעיל ומילות חיפוש
  function filteredProduct() {
    const activeProducts = products.filter((p) => p.status !== "sold");
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return activeProducts;

    const keywords = searchLower.split(/\s+/);
    return activeProducts.filter((p) => {
      const productName = (p.productName || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      return keywords.every(
        (key) => productName.includes(key) || category.includes(key),
      );
    });
  }

  // חילוץ כתובת תמונה ראשית מהמערך
  function getImage(images) {
    if (Array.isArray(images) && images.length > 0) {
      const path = images[0];
      if (path.startsWith("http")) return path;
      return `http://localhost:5000${path}`;
    }
    return "https://via.placeholder.com/150";
  }

  // תרגום סטטוס המוצר לתווית תצוגה
  function getProductStatusLabel(status) {
    switch (status) {
      case "new":
        return "חדש";
      case "like-new":
        return "כמו חדש";
      case "good":
        return "מצב טוב";
      case "fair":
        return "סביר";
      default:
        return status;
    }
  }

  // קיצור תיאור המוצר עבור תצוגת הכרטיס
  function getShortDescription(text) {
    if (!text) return "";
    const firstPeriod = text.indexOf(".");
    if (firstPeriod !== -1 && firstPeriod < 60) {
      return text.substring(0, firstPeriod + 1);
    }
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  }

  // מחיקת מוצר ישירה על ידי מנהל מערכת
  async function deleteProduct(productId) {
    try {
      const res = await fetch(`http://localhost:5000/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) return;

      setProducts((prev) => prev.filter((p) => p.productId !== productId));
      showAlert("המוצר נמחק בהצלחה", "success");
    } catch (err) {
      showAlert("שגיאה במחיקת המוצר", "error");
    }
  }

  // סינון מתקדם לפי קטגוריה, סוג מודעה, מצב וטווח מחירים
  const filtered = filteredProduct();
  const filteredProducts = filtered.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.listingType && product.listingType !== filters.listingType)
      return false;
    if (
      filters.productstatus &&
      product.productstatus !== filters.productstatus
    )
      return false;
    if (
      filters.priceRange.min &&
      Number(product.price) < Number(filters.priceRange.min)
    )
      return false;
    if (
      filters.priceRange.max &&
      Number(product.price) > Number(filters.priceRange.max)
    )
      return false;
    return true;
  });

  // מיון המוצרים לפי מחיר או תאריך העלאה
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortType === "priceLow") return Number(a.price) - Number(b.price);
    if (sortType === "priceHigh") return Number(b.price) - Number(a.price);
    if (sortType === "newest") {
      const dateA = new Date(a.created_at || a.createdAt || 0);
      const dateB = new Date(b.created_at || b.createdAt || 0);
      return dateB - dateA;
    }
    return 0;
  });

  // חישוב עמודים ופילוח מוצרים לעמוד הנוכחי
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = sortedProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  return (
    <div className={classes.container}>
      {/* סרגל חיפוש ראשי */}
      <div className={classes.topBar}>
        <div className={classes.searchWrapper}>
          <span className={classes.searchIcon}>🔍︎</span>
          <input
            className={classes.searchInput}
            type="text"
            placeholder="חיפוש לפי שם מוצר או קטגוריה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* סרגל צדדי לסינון */}
      <FilterSlidebar
        isOpen={isSlidebarOpen}
        onClose={() => setIsSlidebarOpen(false)}
        setFilters={setFilters}
      />

      <h1 className={classes.mainTitle}>רשימת מוצרים</h1>

      {/* סרגל פעולות: פתיחת מסננים ובחירת מיון */}
      <div className={classes.actionsContainer}>
        <button
          className={classes.filterBtn}
          onClick={() => setIsSlidebarOpen(true)}
        >
          ☰ סינון
        </button>

        <select
          className={classes.sortSelect}
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="">מיון</option>
          <option value="newest">החדש ביותר</option>
          <option value="priceLow">מחיר: מהנמוך לגבוה</option>
          <option value="priceHigh">מחיר: מהגבוה לנמוך</option>
        </select>
      </div>

      {/* גריד כרטיסי מוצר */}
      <div className={classes.grid}>
        {currentProducts.map((p) => (
          <div
            key={p.productId}
            onClick={() => navigate(`/productDetails/${p.productId}`)}
            className={`${classes.card} ${
              p.listingType === "donation" ? classes.donationBg : classes.saleBg
            }`}
          >
            <div className={classes.badge}>
              {p.listingType === "donation" ? "תרומה" : "מכירה"}
            </div>

            <div className={classes.contentWrapper}>
              <div className={classes.imageContainer}>
                <img
                  src={getImage(p.images)}
                  alt={p.productName}
                  className={classes.productImg}
                />
              </div>

              <div className={classes.textDetails}>
                <div className={classes.statusTag}>
                  {getProductStatusLabel(p.productstatus)}
                </div>
                <h2 className={classes.productName}>{p.productName}</h2>
                <p className={classes.description}>
                  {getShortDescription(p.description)}
                </p>
              </div>
            </div>

            <div className={classes.priceTag}>
              {p.listingType === "donation" ? (
                <span className={classes.freeText}>חינם</span>
              ) : (
                <div className={classes.priceContainer}>
                  <span className={classes.priceVal}>
                    {Number(p.price).toLocaleString()}
                  </span>
                  <span className={classes.currency}>₪</span>
                </div>
              )}

              {currentUser?.role === "admin" && (
                <div>
                  <button
                    className={classes.deletebutton}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProduct(p.productId);
                    }}
                  >
                    מחיקת מוצר
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* רכיב פגינציה ומעבר בין עמודים */}
      {totalPages > 1 && (
        <div className={classes.pagination}>
          <button
            className={classes.pageArrowBtn}
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            ❮
          </button>

          <div className={classes.pageNumbersWrapper}>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`${classes.pageBtn} ${
                  currentPage === index + 1 ? classes.activePage : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            className={classes.pageArrowBtn}
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            ❯
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;