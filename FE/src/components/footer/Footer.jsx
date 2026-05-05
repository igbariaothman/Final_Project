import classes from './footer.module.css';

export default function Footer() {
  const date = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <div className={classes.container}>
        <p className={classes.text}>
          <span>&copy;</span> {date} יד שנייה לסטודנטים. כל הזכויות שמורות.
        </p>
        <p className={classes.classInfo}>
          Class 50/2
        </p>
      </div>
    </footer>
  );
}