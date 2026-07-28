import React from "react";
import classes from "./privacy.module.css";

function Privacy() {
  return (
    <div className={classes.pageContainer}>
      <h1 className={classes.pageTitle}>מדיניות פרטיות</h1>
      <div className={classes.pageContent}>
        <p>
          אנו מתחייבים לשמור על פרטיות המשתמשים שלנו ולא להעביר פרטים לצד שלישי.
        </p>
      </div>
    </div>
  );
}

export default Privacy;
