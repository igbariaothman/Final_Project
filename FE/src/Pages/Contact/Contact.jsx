import React from "react";
import classes from "./contact.module.css";

function Contact() {
  return (
    <div className={classes.pageContainer}>
      <h1 className={classes.pageTitle}>צור קשר</h1>
      <div className={classes.pageContent}>
        <p>לכל פנייה או שאלה, ניתן לפנות אלינו במייל:</p>
        <div className={classes.contactInfo}>
          <span className={classes.contactItem}>comp502@students.ac.il</span>
        </div>
      </div>
    </div>
  );
}

export default Contact;
