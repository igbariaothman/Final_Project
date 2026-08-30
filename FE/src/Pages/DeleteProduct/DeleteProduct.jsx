/**
 * מודול: כפתור מחיקת מוצר
 * תפקיד: ביצוע מחיקת מוצר מול השרת ועדכון רשימת המוצרים בתצוגה
 */

import classes from "./deleteproduct.module.css";

function DeleteProduct({ productId, products }) {
  // שליחת בקשת מחיקה לשרת ועדכון המצב המקומי
  async function deleteProduct() {
    try {
      const res = await fetch(`http://localhost:5000/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);
        return;
      }

      // סינון והסרת המוצר שנמחק מרשימת המוצרים במסך
      products((prev) => prev.filter((p) => p.productId !== productId));
      console.log(`Product deleted successfully: ${productId} `);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div>
      {/* כפתור מחיקה עם מניעת פעפוע אירוע הלחיצה לכרטיס המוצר */}
      <button
        className={classes.deletebutton}
        onClick={(e) => {
          e.stopPropagation();
          deleteProduct();
        }}
      >
        מחיקה
      </button>
    </div>
  );
}

export default DeleteProduct;