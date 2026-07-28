import React from "react";
import classes from "./about.module.css";

function About() {
  return (
    <div className={classes.pageContainer}>
      <h1 className={classes.pageTitle}>אודות האתר</h1>
      <div className={classes.pageContent}>
        <p>
          אתר יד שנייה לסטודנטים נועד לעזור לסטודנטים לקנות ולמכור ציוד בקלות
          ובמחירים נוחים.
        </p>
        <p>
          אנו מאמינים בבניית קהילה שיתופית חזקה שמקלה על חיי היומיום בקמפוס.
        </p>
      </div>
    </div>
  );
}

export default About;
