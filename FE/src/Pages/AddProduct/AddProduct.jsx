import { useState } from "react";
import classes from "./addProduct.module.css";

function Product() {
  const userId = localStorage.getItem("id");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState("sale"); 
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [productstatus, setProductStatus] = useState("");

  
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  function handleAddProduct() {
    const priceNumber = listingType === "donation" ? 0 : Number(price);

    if (!name || (listingType === "sale" && !price) || !category || !description || !productstatus) {
      setMessage("נא למלא את כל השדות החיוניים");
      return;
    }
    
    if(images && images.length > 10) {
      setMessage("ניתן להעלות רק עד 10 תמונות");
      return;
    }

    if (listingType === "sale" && priceNumber < 0) {
      setMessage("המחיר לא יכול להיות שלילי");
      return;
    }

    if (!userId) {
      setMessage("יש להתחבר כדי לפרסם מוצר");
      return;
    }

    const formData = new FormData();
    formData.append("productName", name);
    formData.append("price", priceNumber);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("listingType", listingType); 
    formData.append("userId", userId);
    formData.append("productstatus", productstatus);

    images.forEach((img) => {
      formData.append("images", img);
    });

    fetch("http://localhost:5000/products/addProduct", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage("המוצר פורסם בהצלحة!");
        setName("");
        setPrice("");
        setCategory("");
        setDescription("");
        setListingType("sale");
        setImages([]);
        setPreview([]);
        setProductStatus("");
      })
      .catch((err) => {
        console.error(err);
        setMessage("שגיאה בהוספת המוצר");
      });
  }

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>הוספת מוצר חדש</h2>

      <div className={classes.inputGroup}>
        <label>שם המוצר</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="מה אתה מוכר؟" />
      </div>

      <div className={classes.inputGroup}>
        <label>סוג המודעה</label>
        <select value={listingType} onChange={(e) => setListingType(e.target.value)} className={classes.select}>
          <option value="sale">למכירה</option>
          <option value="donation">לתרומה</option>
        </select>
      </div>

      {listingType === "sale" && (
        <div className={classes.inputGroup}>
          <label>מחיר (₪)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00 ₪" />
        </div>
      )}

      <div className={classes.inputGroup}>
        <label>קטגוריה</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={classes.select} >
          <option value="">בחר קטגוריה</option>
          <option value="אלקטרוניקה ומחשוב">אלקטרוניקה ומחשוב</option>
          <option value="ספרים וחומרי לימוד">ספרים וחומרי לימוד</option>
          <option value="ריהוט וציוד לחדר">ריהוט וציוד לחדר</option>
          <option value="מוצרי חשמל למעונות">מוצרי חשמל למעונות</option>
          <option value="תיקים ואביזרים">תיקים ואביזרים</option>
          <option value="כלי כתיבה וציוד משרדי">כלי כתיבה וציוד משרדי</option>
          <option value="ציוד מעבדה">ציוד מעבדה</option>
          <option value="אחר">אחר</option>
        </select>
      </div>

      <div className={classes.inputGroup}>
        <label>מצב</label>
        <select value={productstatus} onChange={(e) => setProductStatus(e.target.value)} className={classes.select}>
          <option value="">בחר מצב</option>
          <option value="new">חדש</option>
          <option value="like-new">משומש - כמו חדש </option>
          <option value="good">משומש - במצב טוב</option>
          <option value="fair">משומש - במצב סביר</option>
        </select>
      </div>

      <div className={classes.inputGroup}>
        <label>תיאור המוצר</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="פרט קצת על המוצר..." />
      </div>

      <div className={classes.inputGroup}>
        <label>העלאת תמונות</label>
        <input
          type="file"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files);
            setImages((prev) => [...prev, ...files]);
            const filesArray = files.map((file) => URL.createObjectURL(file));
            setPreview((prev) => [...prev, ...filesArray]);
          }}
        />
      </div>


<div className={classes.previewContainer}>
  {preview.map((img, i) => (
    <div key={i} className={classes.imageWrapper}>
      <img src={img} className={classes.imgPreview} alt="preview" />
      <button 
        type="button"
        className={classes.removeBtn} 
        onClick={() => handleRemoveImage(i)}
        aria-label="Remove image"
      >
        ✕
      </button>
    </div>
  ))}
</div>

      <button className={classes.shareBtn} onClick={handleAddProduct}>
        פרסם מוצר
      </button>

      {message && <p className={classes.message}>{message}</p>}
    </div>
  );
}

export default Product;