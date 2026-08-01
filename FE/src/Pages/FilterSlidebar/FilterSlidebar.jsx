
import classes from "./filterSlidebar.module.css";
import { useState } from "react";

function FilterSlidebar({ isOpen, onClose, setFilters }) {
  const [productstatus, setProductStatus] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [listingType, setListingType] = useState("sale");
  const [category, setCategory] = useState("");

  const handleApplyFilters = () => {
    setFilters({
      category,
      listingType,
      productstatus,
      priceRange: { min: priceRange.min, max: priceRange.max },
    });
  };

  return (
    <>
      {isOpen && <div className={classes.overlay} onClick={onClose}></div>}
      <div
        className={`${classes.sidebar} ${
          isOpen ? classes.open : classes.close
        }`}
      >
        <div className={classes.header}>
          <h2>Filters</h2>
          <button className={classes.closeBtn} onClick={onClose}>
            X
          </button>
        </div>

        <div className={classes.filterGroup}>
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

        <div className={classes.filterGroup}>
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

        {listingType === "sale" && (
          <div className={classes.filterGroup}>
            <label>
              מחיר: {priceRange.min} ₪ - {priceRange.max} ₪
            </label>

            <div className={classes.rangeContainer}>
              <input
                type="range"
                min="0"
                max="5000"
                step="10"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    min: Math.min(Number(e.target.value), priceRange.max - 100),
                  })
                }
                className={classes.range}
              />

              <input
                type="range"
                min="0"
                max="5000"
                step="10"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({
                    ...priceRange,
                    max: Math.max(Number(e.target.value), priceRange.min + 100),
                  })
                }
                className={classes.range}
              />
            </div>
          </div>
        )}

        <div className={classes.filterGroup}>
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

        <button className={classes.applyBtn} onClick={handleApplyFilters}>
          החל סינון
        </button>

        <button
          className={classes.resetBtn}
          onClick={() => {
            setCategory("");
            setListingType("sale");
            setProductStatus("");
            setPriceRange({ min: 0, max: 500 });
          }}
        >
          איפוס סינון
        </button>
      </div>
    </>
  );
}

export default FilterSlidebar;
