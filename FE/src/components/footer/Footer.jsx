import { Link } from "react-router-dom";
import classes from "./footer.module.css";

export default function Footer() {
  const date = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <div className={classes.container}>
        <div className={classes.linksWrapper}>
          <Link to="/about" className={classes.footerLink}>
            אודות
          </Link>
          <Link to="/privacy" className={classes.footerLink}>
            מדיניות פרטיות
          </Link>
          <Link to="/contact" className={classes.footerLink}>
            צור קשר
          </Link>
          <Link to="/accessibility" className={classes.footerLink}>
            הצהרת נגישות
          </Link>
        </div>

        <div className={classes.copyrightWrapper}>
          <p className={classes.text}>
            <span>&copy;</span> {date} יד שנייה לסטודנטים. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}
