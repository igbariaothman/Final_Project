import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./favorites.module.css";
import { useUserContext } from "../../context/UserContext";

function Favorites() {
  const [favorite, setFavorite] = useState([]);
  const navigate = useNavigate();

  const { currentUser } = useUserContext();
  const userId = currentUser?.id;

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/favorites?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => setFavorite(data))
        .catch((err) => console.error(err));
    }
  }, [userId]);

  function deleteFavorite(e, productId) {
    e.stopPropagation();
    fetch(`http://localhost:5000/favorites/remove/${productId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((res) => res.json())
      .then(() => {
        setFavorite((prev) => prev.filter((item) => item.productId !== productId));
      })
      .catch((err) => console.error(err));
  }

  const getImgUrl = (images) => {
    if (!images) return "https://via.placeholder.com/200";
    try {
      const imgArray = typeof images === "string" ? JSON.parse(images) : images;
      return imgArray.length > 0
        ? `http://localhost:5000${imgArray[0]}`
        : "https://via.placeholder.com/200";
    } catch (e) {
      return `http://localhost:5000${images}`;
    }
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>המוצרים המועדפים שלי</h1>

      {favorite.length === 0 ? (
        <div className={classes.emptyState}>
          <p className={classes.message}>אין מוצרים במועדפים כרגע</p>
          <button className={classes.goHomeBtn} onClick={() => navigate("/")}>
            חזור לדף הבית
          </button>
        </div>
      ) : (
        <div className={classes.grid}>
          {favorite.map((p) => (
            <div
              key={p.productId}
              className={classes.card}
              onClick={() => navigate(`/productDetails/${p.productId}`)}
            >
              <div className={classes.imageWrapper}>
                <img
                  src={getImgUrl(p.images)}
                  alt={p.productName}
                  className={classes.productImg}
                />
                <button
                  className={classes.deleteBtn}
                  onClick={(e) => deleteFavorite(e, p.productId)}
                >
                  ✕
                </button>
              </div>
              <div className={classes.details}>
                <h2 className={classes.name}>{p.productName}</h2>
                <div className={classes.priceRow}>
                  <span className={classes.price}>
                    ₪{Number(p.price).toLocaleString()}
                  </span>
                </div>
                <p className={classes.description}>{p.description}</p>
                <div className={classes.footer}>
                  <span className={classes.viewMore}>צפה בפרטים</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;