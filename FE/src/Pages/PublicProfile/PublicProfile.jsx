import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import classes from "./PublicProfile.module.css";

function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:5000/users/${id}`).then((res) => res.json()),
      fetch(`http://localhost:5000/products`).then((res) => res.json()),
    ])
      .then(([userData, allProducts]) => {
        setUser(userData);
        setProducts(allProducts.filter((p) => Number(p.userId) === Number(id)));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const getImgUrl = (images) => {
    try {
      const arr = typeof images === "string" ? JSON.parse(images) : images;
      return arr?.length > 0
        ? `http://localhost:5000${arr[0]}`
        : "https://via.placeholder.com/200";
    } catch {
      return "https://via.placeholder.com/200";
    }
  };

  if (loading) return (
    <div className={classes.loadingPage}>
      <div className={classes.spinner} />
    </div>
  );

  if (!user) return (
    <div className={classes.loadingPage}>
      <p className={classes.notFound}>משתמש לא נמצא</p>
    </div>
  );

  return (
    <div className={classes.profilePage}>

      {/* Hero Section */}
      <div className={classes.heroSection}>
        <div className={classes.heroBg} />
        <div className={classes.heroContent}>
          <div className={classes.avatar}>
            {user.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className={classes.heroInfo}>
            <h1 className={classes.username}>{user.username}</h1>
            <span className={classes.roleBadge}>משתמש רשום</span>
          </div>
        </div>

        {/* Stats */}
        <div className={classes.statsRow}>
          <div className={classes.statItem}>
            <span className={classes.statNumber}>{products.length}</span>
            <span className={classes.statLabel}>מוצרים</span>
          </div>
          <div className={classes.statItem}>
            <span className={classes.statNumber}>
              {products.filter((p) => p.listingType === "donation").length}
            </span>
            <span className={classes.statLabel}>תרומות</span>
          </div>
          <div className={classes.statItem}>
            <span className={classes.statNumber}>
              {products.filter((p) => p.listingType === "sale").length}
            </span>
            <span className={classes.statLabel}>מכירות</span>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className={classes.productsSection}>
        <h2 className={classes.productsTitle}>
          מוצרים של {user.username}
        </h2>

        {products.length === 0 ? (
          <div className={classes.emptyState}>
            <p className={classes.emptyIcon}>📦</p>
            <p className={classes.emptyText}>אין מוצרים עדיין</p>
          </div>
        ) : (
          <div className={classes.productsGrid}>
            {products.map((p) => (
              <div
                key={p.productId}
                className={classes.productCard}
                onClick={() => navigate(`/productDetails/${p.productId}`)}
              >
                <div className={classes.productImageWrapper}>
                  <img
                    src={getImgUrl(p.images)}
                    alt={p.productName}
                    className={classes.productImg}
                  />
                  <div className={classes.productBadge}>
                    {p.listingType === "donation" ? "תרומה" : "מכירה"}
                  </div>
                </div>
                <div className={classes.productInfo}>
                  <p className={classes.productName}>{p.productName}</p>
                  <p className={classes.productPrice}>
                    {p.listingType === "donation"
                      ? "חינם "
                      : `₪${Number(p.price).toLocaleString()}`}
                  </p>
                  <p className={classes.productDesc}>{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;