import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./home.module.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const admin = localStorage.getItem("role");
  const isLoggedIn = localStorage.getItem("login");

  //number of products in page
  const PRODUCTS_PER_PAGE = 25;

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchCategory]);

  function filteredProduct() {
    return products.filter((p) =>
      p.category.toLowerCase().includes(searchCategory.toLowerCase()),
    );
  }

  function getImage(images) {
    if (Array.isArray(images) && images.length > 0) {
      const path = images[0];
      return `http://localhost:5000${path}`;
    }
    return "https://via.placeholder.com/150";
  }

  const filtered = filteredProduct();
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filtered.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  return (
    <div className={classes.container}>
      <div className={classes.searchContainer}>
        <input
          className={classes.searchInput}
          type="text"
          placeholder="חיפוש על קטגוריה"
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
        />
      </div>

      <h1 className={classes.mainTitle}>רשימת מוצרים</h1>

      <div className={classes.grid}>
        {currentProducts.map((p) => (
          <div
            key={p.productId}
            onClick={() => navigate(`/productDetails/${p.productId}`)}
            className={`${classes.card} ${p.listingType === "donation" ? classes.donationBg : classes.saleBg}`}
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
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
              </div>

              <div className={classes.textDetails}>
                <h2 className={classes.productName}>{p.productName}</h2>
                <p className={classes.description}>{p.description}</p>
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

              {isLoggedIn && admin === "admin" && (
                <div>
                  <button className={classes.deletebutton}>delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={classes.pagination}>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`${classes.pageBtn} ${currentPage === index + 1 ? classes.activePage : ""}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
