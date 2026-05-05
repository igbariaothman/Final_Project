import { useParams } from "react-router-dom";
import { useEffect , useState } from "react";
import classes from "./productDetails.module.css";

function ProductDetails () {

  const { id } = useParams() ;
  const [product , setProduct ] = useState(null) ;
  
    useEffect(() => {
      fetch(`http://localhost:5000/products/${id}`)
        .then((res) => res.json())
        .then((data) => setProduct(data))
        .catch((err) => console.error(err));
    }, [id]);

    if (!product) return <h2>Loding ...</h2>



  return (
    // <div className={classes.container}>
    //   <div className={classes.card}>
    //     <h1 className={classes.productName}>שם המוצר : {product.productName}</h1>

    //     <div className={classes.imageContainer}>
    //       <img
    //         src={`http://localhost:5000${product.images[0]}`}
    //         alt={product.productName}
    //         className={classes.productImg}
    //       />
    //     </div>

    //     <p className={classes.description}>
    //       תאור : {product.description}
    //     </p>

    //     <div className={classes.priceTag}>
    //       {product.listingType === "donation" ? (
    //         <span className={classes.freeText}>חינם</span>
    //       ) : (
    //         <div className={classes.priceContainer}>
    //           <span className={classes.priceVal}>
    //             מחיר : {Number(product.price).toLocaleString()}
    //           </span>
    //           <span className={classes.currency}>₪</span>
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </div>

    <div className={classes.card}>
      <div className={classes.contentWrapper}>
        {/* الصورة */}
        <div className={classes.imageContainer}>
          <img
            src={`http://localhost:5000${product.images[0]}`}
            alt={product.productName}
            className={classes.productImg}
          />
        </div>

        {/* النص */}
        <div className={classes.textSection}>
          <h1 className={classes.productName}>
            שם המוצר : {product.productName}
          </h1>

          <p className={classes.description}>תאור : {product.description}</p>

          <div className={classes.priceTag}>
            {product.listingType === "donation" ? (
              <span className={classes.freeText}>חינם</span>
            ) : (
              <div className={classes.priceContainer}>
                <span className={classes.priceVal}>
                  מחיר : {Number(product.price).toLocaleString()}
                </span>
                <span className={classes.currency}>₪</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}

export default ProductDetails ;