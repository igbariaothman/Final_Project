import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import classes from "./productDetails.module.css";
import Chat from "../Chat/Chat";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  const userId = localStorage.getItem("id");
  const isLoggedIn = !!userId;

  const categoryMap = {
    electronics: "אלקטרוניקה ומחשוב",
    books: "ספרים וחומרי לימוד",
    furniture: "ריהוט וציוד לחדר",
    appliances: "מוצרי חשמל למעונות",
    bags: "תיקים ואביזרים",
    stationery: "כלי כתיבה וציוד משרדי",
    laboratory: "ציוד מעבדה",
    other: "אחר"
  };

  useEffect(() => {
    fetch(`http://localhost:5000/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <h2 className={classes.loading}>Loading...</h2>;

  const handleSendMessage = () => {
    if (isLoggedIn) {
      setOpenChat(true);
    } else {
      alert("נא להתחבר כדי לשלוח הודעה");
      navigate("/login");
    }
  };

  const getImgUrl = (path) => path ? `http://localhost:5000${path}` : "https://via.placeholder.com/600x400";

  return (
    <>
      <div className={classes.pageWrapper}>
        <div className={classes.mainContent}>
          <div className={classes.rightColumn}>
            <div 
              className={classes.imageMainWrapper} 
              onClick={() => setIsModalOpen(true)}
              style={{ cursor: 'zoom-in' }}
            >
              <img src={getImgUrl(product.images[currentIndex])} alt="Product" className={classes.mainDisplayImage} />
              {product.images.length > 1 && (
                <>
                  <button className={classes.arrowLeft} onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % product.images.length); }}>❯</button>
                  <button className={classes.arrowRight} onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + product.images.length) % product.images.length); }}>❮</button>
                </>
              )}
            </div>

       
            <div className={classes.detailsUnderImage}>
              <div className={classes.descriptionSection}>
                <h3 className={classes.sectionTitle}>תיאור המוצר</h3>
                <p className={classes.descriptionText}>{product.description}</p>
              </div>

              <div className={classes.productSpecs}>
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>מצב המוצר:</span>
                  <span className={classes.specValue}>
                    {product.productstatus === "new" ? "חדש" :
                     product.productstatus === "like-new" ? "כמו חדש" :
                     product.productstatus === "good" ? "מצב טוב" : "סביר"}
                  </span>
                </div>
                
                <div className={classes.specItem}>
                  <span className={classes.specLabel}>קטגוריה:</span>
                  <span className={classes.specValue}>
                    {categoryMap[product.category] || product.category}
                  </span>
                </div>
              </div>
            </div>
          </div>

        
          <div className={classes.leftColumn}>
            <div className={classes.actionCard}>
              <h1 className={classes.productTitle}>{product.productName}</h1>
              <div className={classes.priceSection}>
                {product.listingType === "donation" ? 
                  <span className={classes.freeText}>חינם</span> : 
                  <span className={classes.price}>₪{Number(product.price).toLocaleString()}</span>
                }
              </div>
              
              <button onClick={handleSendMessage} className={classes.messageBtn}>שליחת הודעה 💬</button>
              
              <div className={classes.sellerInfo}>
                <p className={classes.sellerLabel}>על המוכר</p>
                <div className={classes.sellerRow}>
                  <div className={classes.avatar}>{product.username?.charAt(0).toUpperCase() || "U"}</div>
                  <div className={classes.sellerMeta}>
                    <p className={classes.sellerName}>{product.username || "משתמש"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    
      {openChat && isLoggedIn && (
        <Chat productId={product.productId} sellerId={product.userId} sellerName={product.username} />
      )}
      {isModalOpen && (
        <div className={classes.imageModal} onClick={() => setIsModalOpen(false)}>
          <span className={classes.closeModalBtn}>&times;</span>
          <img src={getImgUrl(product.images[currentIndex])} className={classes.modalContent} alt="Full Size" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

export default ProductDetails;