  /**
 * מודול: מסך פרטי מוצר מלאים
 * תפקיד: הצגת מפרט פריט, גלריית תמונות אינטראקטיבית, הוספה למועדפים ויצירת קשר עם המוכר
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import classes from "./productDetails.module.css";
import Chat from "../Chat/Chat";
import { useUserContext } from "../../context/UserContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUserContext();

  // ניהול נתוני המוצר, תצוגת התמונות, פתיחת מודאלים ומועדפים
  const [product, setProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const userId = currentUser?.id;
  const isLoggedIn = !!currentUser;

 
  // מיפוי קטגוריות מתורגמות
  const categoryMap = {
    electronics: "אלקטרוניקה ומחשוב",
    books: "ספרים וחומרי לימוד",
    furniture: "ריהוט וציוד לחדר",
    appliances: "מוצרי חשמל למעונות",
    bags: "תיקים ואביזרים",
    stationery: "כלי כתיבה וציוד משרדי",
    laboratory: "ציוד מעבדה",
    other: "אחר",
  };

 
  // הוספה או הסרה של המוצר מרשימת המועדפים
  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (isFavorite) {
      try {
        const response = await fetch(
          `http://localhost:5000/favorites/remove/${id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );
        if (response.ok) setIsFavorite(false);
      } catch (err) {
        console.error("Error removing from favorites:", err);
      }
    } else {
      try {
        const response = await fetch("http://localhost:5000/favorites/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, productId: id }),
        });
        if (response.ok) setIsFavorite(true);
      } catch (err) {
        console.error("Error adding to favorites:", err);
      }
    }
  };

  // שליפת פרטי המוצר ובדיקת סטטוס מועדף
  useEffect(() => {
    fetch(`http://localhost:5000/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));

    if (isLoggedIn) {
      fetch(
        `http://localhost:5000/favorites/check?userId=${userId}&productId=${id}`
      )
        .then((res) => res.json())
        .then((data) => setIsFavorite(data.isFavorite))
        .catch((err) => console.error(err));
    }
  }, [id, userId, isLoggedIn]);

  if (!product) return <h2 className={classes.loading}>טוען...</h2>;

  // פתיחת חלון שיחה מול בעל המוצר
  const handleSendMessage = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (Number(userId) === Number(product.userId)) {
      alert("לא ניתן לשלוח הודעה למוצר שלך");
      return;
    }
    setOpenChat(true);
  };

  // חילוץ ועיבוד כתובת תמונה
  const getImgUrl = (path) => {
    if (!path) return "https://via.placeholder.com/600x400";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000${path}`;
  };

  const isSold = product.status === "sold";
  const isOwner = Number(userId) === Number(product.userId);
  const isAdmin = currentUser?.role === "admin";

  return (
    <>
      <div className={classes.pageWrapper}>
        <div className={classes.mainContent}>
          {/* עמודה ימנית: תמונות ומפרט המוצר */}
          <div className={classes.rightColumn}>
            {/* גלריית תמונות ראשית ומעבר בין תמונות */}
            <div
              className={classes.imageMainWrapper}
              onClick={() => setIsModalOpen(true)}
              style={{ cursor: "zoom-in" }}
            >
              <img
                src={getImgUrl(product.images[currentIndex])}
                alt={product.productName}
                className={classes.mainDisplayImage}
              />
              {product.images.length > 1 && (
                <>
                  <button
                    className={classes.arrowLeft}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(
                        (prev) => (prev + 1) % product.images.length
                      );
                    }}
                  >
                    ❯
                  </button>
                  <button
                    className={classes.arrowRight}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(
                        (prev) =>
                          (prev - 1 + product.images.length) %
                          product.images.length
                      );
                    }}
                  >
                    ❮
                  </button>
                </>
              )}
            </div>

            {/* פרטים מתחת לתמונה: תיאור ומצב */}
            <div className={classes.detailsUnderImage}>
              <div className={classes.descriptionSection}>
                <h3 className={classes.sectionTitle}>תיאור המוצר</h3>
                <p className={classes.descriptionText}>{product.description}</p>
              </div>

              <div className={classes.productSpecs}>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>מצב המוצר:</span>
                  <span className={classes.specValue}>
                    {product.productstatus === "new"
                      ? "חדש"
                      : product.productstatus === "like-new"
                        ? "כמו חדש"
                        : product.productstatus === "good"
                          ? "מצב טוב"
                          : "סביר"}
                  </span>
                </div>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>קטגוריה:</span>
                  <span className={classes.specValue}>
                    {categoryMap[product.category] || product.category}
                  </span>
                </div>

                {/* כפתור דיווח על מודעה */}
                {!isSold && !isOwner && !isAdmin && isLoggedIn && (
                  <div className={classes.reportButtonWrapper}>
                    <Link
                      to={"/reports"}
                      onClick={() =>
                        localStorage.setItem("productId", product.productId)
                      }
                    >
                      דיווח
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* עמודה שמאלית: כרטיס רכישה ופרטי מוכר */}
          <div className={classes.leftColumn}>
            <div className={classes.actionCard}>
              <div
                className={classes.titleRow}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h1 className={classes.productTitle}>{product.productName}</h1>
                {isLoggedIn && (
                  <button
                    className={`${classes.favoriteBtn} ${
                      isFavorite ? classes.activeFavorite : ""
                    }`}
                    onClick={handleToggleFavorite}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: "3rem",
                      cursor: "pointer",
                    }}
                  >
                    {isFavorite ? "❤️" : "🤍"}
                  </button>
                )}
              </div>

              {/* תג המחיר או תרומה */}
              <div className={classes.priceSection}>
                {product.listingType === "donation" ? (
                  <span className={classes.freeText}>חינם</span>
                ) : (
                  <span className={classes.price}>
                    ₪{Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* כפתור יצירת קשר */}
              {!isSold && isLoggedIn && !isOwner && (
                <button
                  onClick={handleSendMessage}
                  className={classes.messageBtn}
                >
                  שליחת הודעה 💬
                </button>
              )}

              {/* חיווי מוצר שנמכר */}
              {isSold && (
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontWeight: "bold",
                    margin: "10px 0",
                    fontSize: "2.2rem",
                  }}
                >
                  מוצר זה נמכר
                </div>
              )}

              {/* פרטי המוכר ומעבר לפרופיל */}
              <div className={classes.sellerInfo}>
                <p className={classes.sellerLabel}>על המכר : </p>
                <div className={classes.sellerRow}>
                  <div
                    className={classes.avatar}
                    onClick={() => navigate(`/profile/${product.userId}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {product.profileImage ? (
                      <img
                        src={getImgUrl(product.profileImage)}
                        alt={product.username || "מוכר"}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      product.username?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div className={classes.sellerMeta}>
                    <p
                      className={classes.sellerName}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/profile/${product.userId}`)}
                    >
                      {product.username || "משתמש"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* חלון צ'אט מול המוכר */}
      {openChat && isLoggedIn && (
        <Chat
          productId={product.productId}
          sellerId={product.userId}
          sellerName={product.username}
          onClose={() => setOpenChat(false)}
        />
      )}

      {/* מודאל תצוגת תמונה מוגדלת */}
      {isModalOpen && (
        <div
          className={classes.imageModal}
          onClick={() => setIsModalOpen(false)}
        >
          <span className={classes.closeModalBtn}>&times;</span>
          <img
            src={getImgUrl(product.images[currentIndex])}
            className={classes.modalContent}
            alt="Full Size"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default ProductDetails;