import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./home.module.css";
import { useUserContext } from "../../context/UserContext";

function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { currentUser, isLoading } = useUserContext();

  //num ber of products to show per page
  const PRODUCTS_PER_PAGE = 16;

  // Fetch all products from the backend when the component mounts
  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

// Reset the current page to 1 whenever the search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle page change and scroll to the top of the page
  function handlePageChange(newPage) {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

// Filter products based on the search term and exclude sold products
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

  // Function to get the image URL for a product, handling cases where images may be missing or malformed
  function getImage(images) {
    if (Array.isArray(images) && images.length > 0) {
      const path = images[0];
      if (path.startsWith("http")) return path;
      return `http://localhost:5000${path}`;
    }
    return "https://via.placeholder.com/150";
  }

  // Function to get the label for the product status
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

  // Function to get a short description for display, truncating if necessary
  function getShortDescription(text) {
    if (!text) return "";
    const firstPeriod = text.indexOf(".");
    if (firstPeriod !== -1 && firstPeriod < 60) {
      return text.substring(0, firstPeriod + 1);
    }
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  }

  // Function to delete a product by its ID, only accessible to admin users
  async function deleteProduct(productId) {
    try {
      const res = await fetch(`http://localhost:5000/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);
        return;
      }
      console.log(`מוצר נמחק בהצלחה ${productId}`);

      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (err) {
      console.log(err);
    }
  }

  // Calculate the filtered products and pagination details
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
          placeholder="חיפוש לפי שם מוצר או קטגוריה..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <h1 className={classes.mainTitle}>רשימת מוצרים</h1>

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
