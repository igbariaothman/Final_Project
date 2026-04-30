import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import classes from "./productDetails.module.css";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <h2 className={classes.loading}>Loading...</h2>;

  const getImgUrl = (path) => path ? `http://localhost:5000${path}` : "https://placehold.co/400x300?text=No+Image";

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <>
      <div className={classes.container}>
        <div className={classes.card}>
          <h1 className={classes.productName}>{product.productName}</h1>

          <div className={classes.imageGrid}>
            <div className={classes.mainImage} onClick={() => setCurrentIndex(0)}>
              <img src={getImgUrl(product.images[0])} alt="Main" className={classes.productImg} />
            </div>

            <div className={classes.sideGallery}>
              {product.images.slice(1, 3).map((img, index) => (
                <div 
                  key={index} 
                  className={classes.sideImgWrapper} 
                  onClick={() => setCurrentIndex(index + 1)}
                >
                  <img src={getImgUrl(img)} alt="Side" className={classes.productImg} />
                  
                  {index === 1 && product.images.length > 3 && (
                    <div className={classes.overlay}>
                      <span>+{product.images.length - 3}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={classes.detailsSection}>
            <p className={classes.description}>{product.description}</p>
            <div className={classes.priceTag}>
              {product.listingType === "donation" ? (
                <span className={classes.freeText}>חינם</span>
              ) : (
                <div className={classes.priceContainer}>
                  <span className={classes.priceVal}>
                    {Number(product.price).toLocaleString()} ₪
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {currentIndex !== null && (
        <div className={classes.modal} onClick={() => setCurrentIndex(null)}>
          <button className={`${classes.navBtn} ${classes.prev}`} onClick={prevImage}>❮</button>
          
          <div className={classes.modalContentWrapper}>
            <img 
              className={classes.modalContent} 
              src={getImgUrl(product.images[currentIndex])} 
              alt="Enlarged" 
            />
            <div className={classes.imageCounter}>
              {currentIndex + 1} / {product.images.length}
            </div>
          </div>

          <button className={`${classes.navBtn} ${classes.next}`} onClick={nextImage}>❯</button>
          <span className={classes.closeBtn}>&times;</span>
        </div>
      )}
    </>
  );
}

export default ProductDetails;