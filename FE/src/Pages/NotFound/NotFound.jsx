import { useNavigate } from "react-router-dom";
import styles from "./NotFound.module.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.NotFound}>
      <h1 className={styles.errorNumber}>404</h1>
      <h2 className={styles.errorText}>הדף שחיפשת אינו קיים</h2>
      <p className={styles.errorDesc}>
        הקישור שהגעת אליו עשוי להיות שבור, או שהדף הוסר מהמערכת.
      </p>
      <button onClick={() => navigate("/")} className={styles.homeBtn}>
        חזרה לדף הבית
      </button>
    </div>
  );
};

export default NotFound;