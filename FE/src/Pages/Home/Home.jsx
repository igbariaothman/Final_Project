import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./home.module.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const navigate = useNavigate() ;

  function filteredProduct() {
    return products.filter((p) =>
      p.category.toLowerCase().includes(searchCategory.toLowerCase()),
    );
  }


  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  

  function getImage(images) {
    if (Array.isArray(images) && images.length > 0) {
      const path = images[0]; 
      return `http://localhost:5000${path}`;
    }
    return "https://via.placeholder.com/150";
  }

  return (
    <div className={classes.container}>
      <div className={classes.searchContainer}>
        <input
          className={classes.searchInput}
          type="text"
          placeholder="Search by Category"
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
        />
      </div>

      <h1 className={classes.mainTitle}>רשימת מוצרים</h1>
      <div className={classes.grid}>
        {filteredProduct().map((p) => (
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;