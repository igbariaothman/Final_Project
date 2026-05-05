import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import classes from "./productDetails.module.css";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <h2 className={classes.loading}>Loading...</h2>;

  const getImgUrl = (path) => path ? `http://localhost:5000${path}` : "https://via.placeholder.com/600x400";

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const sellerName = product.username || "משתמש";
  const initialLetter = sellerName.charAt(0).toUpperCase();

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
              <img 
                src={getImgUrl(product.images[currentIndex])} 
                alt="Product" 
                className={classes.mainDisplayImage} 
              />
              {product.images.length > 1 && (
                <>
                  <button className={classes.arrowLeft} onClick={(e) => { e.stopPropagation(); nextImage(); }}>❯</button>
                  <button className={classes.arrowRight} onClick={(e) => { e.stopPropagation(); prevImage(); }}>❮</button>
                </>
              )}
            </div>

            <div className={classes.thumbnailBar}>
              {product.images.map((img, index) => (
                <div 
                  key={index} 
                  className={`${classes.thumbWrapper} ${currentIndex === index ? classes.activeThumb : ""}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <img src={getImgUrl(img)} alt="Thumb" />
                </div>
              ))}
            </div>

            <div className={classes.descriptionSection}>
              <p className={classes.productCategory}>קטגוריה: {product.category}</p>
              <h3 className={classes.sectionTitle}>על המוצר</h3>
              <p className={classes.productDescription}>{product.description}</p>
            </div>
          </div>

          <div className={classes.leftColumn}>
            <div className={classes.actionCard}>
              <h1 className={classes.productTitle}>{product.productName}</h1>
              <div className={classes.priceSection}>
                {product.listingType === "donation" ? (
                  <span className={classes.freeText}>חינם</span>
                ) : (
                  <span className={classes.price}>₪{Number(product.price).toLocaleString()}</span>
                )}
              </div>
              <button className={classes.messageBtn}>שליחת הודעה 💬</button>
              <div className={classes.sellerInfo}>
                <p className={classes.sellerLabel}>על המוכר</p>
                <div className={classes.sellerRow}>
                  <div className={classes.avatar}>{initialLetter}</div>
                  <div className={classes.sellerMeta}>
                    <p className={classes.sellerName}>{sellerName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {isModalOpen && (
        <div className={classes.imageModal} onClick={() => setIsModalOpen(false)}>
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