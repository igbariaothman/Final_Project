import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../../context/UserContext.jsx";
import classes from "../PublicProfile/PublicProfile.module.css";

function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUserContext();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = () => {
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
  };

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const handleMarkAsSold = async (e, productId) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "האם אתה בטוח שברצונך לסמן מוצר זה כנמכר ולהעביר אותו להיסטוריה?",
    );

    if (!confirmed) return;

    try {
      await axios.put(`http://localhost:5000/products/sold/${productId}`);
      fetchProfileData();
    } catch (error) {
      alert(error.response?.data?.message || "שגיאה בעדכון סטטוס המוצר");
    }
  };

  const getImgUrl = (images) => {
    try {
      const arr = typeof images === "string" ? JSON.parse(images) : images;
      return arr?.length > 0
        ? `http://localhost:5000${arr[0]}`
        : "https://via.placeholder.com/150";
    } catch {
      return "https://via.placeholder.com/150";
    }
  };

  if (loading)
    return (
      <div className={classes.loadingPage}>
        <div className={classes.spinner} />
      </div>
    );

  if (!user)
    return (
      <div className={classes.loadingPage}>
        <p className={classes.notFound}>משתמש לא נמצא</p>
      </div>
    );

  const activeProducts = products.filter((p) => p.status !== "sold");
  const soldHistoryProducts = products.filter((p) => p.status === "sold");

  const isOwner = currentUser && Number(currentUser.id) === Number(id);

  return (
    <div className={classes.profilePage}>
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

        <div className={classes.statsRow}>
          <div className={classes.statItem}>
            <span className={classes.statNumber}>{activeProducts.length}</span>
            <span className={classes.statLabel}>מוצרים פעילים</span>
          </div>
          <div className={classes.statItem}>
            <span className={classes.statNumber}>
              {soldHistoryProducts.length}
            </span>
            <span className={classes.statLabel}>היסטוריית מכירות</span>
          </div>
          <div className={classes.statItem}>
            <span className={classes.statNumber}>
              {
                activeProducts.filter((p) => p.listingType === "donation")
                  .length
              }
            </span>
            <span className={classes.statLabel}>תרומות זמינות</span>
          </div>
        </div>
      </div>

      <div className={classes.productsSection}>
        <h2 className={classes.productsTitle}>
          מוצרים זמינים של {user.username}
        </h2>

        {activeProducts.length === 0 ? (
          <div className={classes.emptyState}>
            <p className={classes.emptyIcon}>📦</p>
            <p className={classes.emptyText}>אין מוצרים זמינים כרגע</p>
          </div>
        ) : (
          <div className={classes.grid}>
            {activeProducts.map((p) => (
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
                      src={getImgUrl(p.images)}
                      alt={p.productName}
                      className={classes.productImg}
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

                {isOwner && (
                  <button
                    onClick={(e) => handleMarkAsSold(e, p.productId)}
                    className={classes.soldButton}
                  >
                    סמן כנמכר
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className={classes.divider} />

      <div className={classes.productsSection}>
        <h2 className={classes.productsTitle}>היסטוריית מוצרים (נמכרו)</h2>

        {soldHistoryProducts.length === 0 ? (
          <div className={classes.emptyState}>
            <p className={classes.emptyIcon}>📜</p>
            <p className={classes.emptyText}>אין מוצרים בהיסטוריה</p>
          </div>
        ) : (
          <div className={classes.grid}>
            {soldHistoryProducts.map((p) => (
              <div
                key={p.productId}
                onClick={() => navigate(`/productDetails/${p.productId}`)}
                className={`${classes.card} ${classes.soldCardBg}`}
                style={{ opacity: 0.75 }}
              >
                <div className={classes.soldBadge}>נמכר / הועבר</div>

                <div className={classes.contentWrapper}>
                  <div className={classes.imageContainer}>
                    <img
                      src={getImgUrl(p.images)}
                      alt={p.productName}
                      className={classes.productImg}
                    />
                  </div>

                  <div className={classes.textDetails}>
                    <h2 className={classes.productName}>{p.productName}</h2>
                    <p className={classes.description}>{p.description}</p>
                  </div>
                </div>

                <div className={classes.priceTag}>
                  <span className={classes.historyPriceLabel}>
                    נמכר בשווי: {Number(p.price).toLocaleString()} ₪
                  </span>
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
