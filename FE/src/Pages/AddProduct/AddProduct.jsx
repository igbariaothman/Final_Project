/**
 * מודול: טופס הוספת ופרסום מוצר חדש
 * תפקיד: קליטת פרטי המוצר, העלאת תמונות, תצוגה מקדימה, אימות נתונים ושליחה לשרת
 */

import { useState, useContext } from "react";
import classes from "./addProduct.module.css";
import { useUserContext } from "../../context/UserContext";
import { AlertContext } from "../../context/AlertContext";

function Product() {
  const { currentUser } = useUserContext();
  const { showAlert } = useContext(AlertContext);

  // ניהול מצבי שדות הטופס, קובצי התמונות והתצוגה המקדימה
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [listingType, setListingType] = useState("sale");
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [productstatus, setProductStatus] = useState("");

  // הסרת תמונה שנבחרה מהמערך ומהתצוגה המקדימה
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // אימות נתוני הטופס ושליחת המוצר לשרת
  function handleAddProduct() {
    const priceNumber = listingType === "donation" ? 0 : Number(price);

    // בדיקת מילוי שדות החובה
    if (
      !name.trim() ||
      (listingType === "sale" && price === "") ||
      !category ||
      !description.trim() ||
      !productstatus
    ) {
      showAlert("נא למלא את כל השדות החיוניים", "error");
      return;
    }

    // בדיקת קיום תמונות ומגבלת כמות
    if (!images || images.length === 0) {
      showAlert("חובה להעלות לפחות תמונה אחת של המוצר", "error");
      return;
    }

    if (images.length > 10) {
      showAlert("ניתן להעלות רק עד 10 תמונות", "error");
      return;
    }

    // בדיקת תקינות המחיר
    if (listingType === "sale" && priceNumber < 0) {
      showAlert("המחיר לא יכול להיות שלילי", "error");
      return;
    }

    // בדיקת אימות משתמש מחובר
    if (!currentUser) {
      showAlert("יש להתחבר כדי לפרסם מוצר", "error");
      return;
    }

    // בניית אובייקט FormData לשליחת נתונים וקבצים
    const formData = new FormData();
    formData.append("productName", name.trim());
    formData.append("price", priceNumber);
    formData.append("category", category);
    formData.append("description", description.trim());
    formData.append("listingType", listingType);
    formData.append("userId", currentUser?.id);
    formData.append("productstatus", productstatus);

    // הוספת קובצי התמונות לטופס
    images.forEach((img) => {
      formData.append("images", img);
    });

    // שליחת הנתונים לשרת
    fetch("http://localhost:5000/products/addProduct", {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();

        // בדיקת תקינות התשובה מהשרת
        if (!res.ok) {
          throw new Error(data.message || "שגיאה בהוספת המוצר");
        }

        // הצגת הודעת הצלחה ואיפוס כל שדות הטופס
        showAlert("המוצר פורסם בהצלחה!", "success");
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
        showAlert(err.message || "שגיאה בהוספת המוצר", "error");
      });
  }

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>הוספת מוצר חדש</h2>

      {/* הזנת שם המוצר */}
      <div className={classes.inputGroup}>
        <label>שם המוצר</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="מה אתה מוכר؟"
        />
      </div>

      {/* בחירת סוג מודעה (מכירה / תרומה) */}
      <div className={classes.inputGroup}>
        <label>סוג המודעה</label>
        <select
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
          className={classes.select}
        >
          <option value="sale">למכירה</option>
          <option value="donation">לתרומה</option>
        </select>
      </div>

      {/* הזנת מחיר עבור מודעות למכירה בלבד */}
      {listingType === "sale" && (
        <div className={classes.inputGroup}>
          <label>מחיר (₪)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00 ₪"
          />
        </div>
      )}

      {/* בחירת קטגוריית המוצר */}
      <div className={classes.inputGroup}>
        <label>קטגוריה</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={classes.select}
        >
          <option value="" disabled>
            בחר קטגוריה
          </option>
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

      {/* בחירת מצב המוצר */}
      <div className={classes.inputGroup}>
        <label>מצב</label>
        <select
          value={productstatus}
          onChange={(e) => setProductStatus(e.target.value)}
          className={classes.select}
        >
          <option value="" disabled>
            בחר מצב
          </option>
          <option value="new">חדש</option>
          <option value="like-new">משומש - כמו חדש </option>
          <option value="good">משומש - במצב טוב</option>
          <option value="fair">משומש - במצב סביר</option>
        </select>
      </div>

      {/* הזנת תיאור מפורט של המוצר */}
      <div className={classes.inputGroup}>
        <label>תיאור המוצר</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="פרט קצת על המוצר..."
        />
      </div>

      {/* העלאת קובצי תמונות */}
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

      {/* תצוגה מקדימה של התמונות שהועלו עם אפשרות הסרה */}
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

      {/* כפתור אישור ושליחת המוצר לפרסום */}
      <button className={classes.shareBtn} onClick={handleAddProduct}>
        פרסם מוצר
      </button>
    </div>
  );
}

export default Product;