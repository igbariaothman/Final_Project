
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./favorites.module.css";
import { useUserContext } from "../../context/UserContext";
import { AlertContext } from "../../context/AlertContext";

/**
 * מודול: רשימת מוצרים מועדפים
 * תפקיד: הצגת המוצרים שסומנו כמועדפים על ידי המשתמש ואפשרות להסרתם
 */
// חילוץ ועיבוד כתובת התמונה מתוך נתוני המוצר
function parseImageUrl(images) {
  if (!images) return "https://via.placeholder.com/200";
  try {
    const imgArray = typeof images === "string" ? JSON.parse(images) : images;
    return imgArray.length > 0 ? `http://localhost:5000${imgArray[0]}` : "https://via.placeholder.com/200";
  } catch (e) {
    return `http://localhost:5000${images}`;
  }
}

// משיכת רשימת המועדפים של המשתמש מהשרת
function fetchFavoritesList(userId, setFavorite) {
  if (!userId) return;
  fetch(`http://localhost:5000/favorites?userId=${userId}`)
    .then((res) => res.json())
    .then((data) => setFavorite(data))
    .catch((err) => console.error(err));
}

// ביצוע קריאת שרת להסרת מוצר מרשימת המועדפים
function executeDeleteFavorite(userId, productId, setFavorite, showAlert) {
  fetch(`http://localhost:5000/favorites/remove/${productId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  })
    .then((res) => res.json())
    .then(() => {
      setFavorite((prev) => prev.filter((item) => item.productId !== productId));
      showAlert("המוצר הוסר מהמועדפים", "error");
    })
    .catch((err) => console.error(err));
}

function Favorites() {
  const [favorite, setFavorite] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useUserContext();
  const { showAlert } = useContext(AlertContext);

  // טעינת רשימת המועדפים בעת עליית הרכיב
  useEffect(() => {
    fetchFavoritesList(currentUser?.id, setFavorite);
  }, [currentUser?.id]);

  // מחיקת מוצר מרשימת המועדפים
  function deleteFavorite(e, productId) {
    e.stopPropagation();
    executeDeleteFavorite(currentUser?.id, productId, setFavorite, showAlert);
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>המוצרים המועדפים שלי</h1>

      {/* תצוגת מצב ריק במידה ואין מוצרים שמורים */}
      {favorite.length === 0 ? (
        <div className={classes.emptyState}>
          <p className={classes.message}>אין מוצרים במועדפים כרגע</p>
          <button className={classes.goHomeBtn} onClick={() => navigate("/")}>חזור לדף הבית</button>
        </div>
      ) : (
        /* גריד כרטיסי המוצרים המועדפים */
        <div className={classes.grid}>
          {favorite.map((p) => (
            <div key={p.productId} className={classes.card} onClick={() => navigate(`/productDetails/${p.productId}`)}>
              <div className={classes.imageWrapper}>
                <img src={parseImageUrl(p.images)} alt={p.productName} className={classes.productImg} />
                <button className={classes.deleteBtn} onClick={(e) => deleteFavorite(e, p.productId)}>✕</button>
              </div>
              <div className={classes.details}>
                <h2 className={classes.name}>{p.productName}</h2>
                <div className={classes.priceRow}>
                  <span className={classes.price}>₪{Number(p.price).toLocaleString()}</span>
                </div>
                <p className={classes.description}>{p.description}</p>
                <div className={classes.footer}><span className={classes.viewMore}>צפה בפרטים</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;