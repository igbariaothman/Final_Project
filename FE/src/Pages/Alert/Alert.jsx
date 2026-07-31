
import classes from "./alert.module.css";
import {useContext} from "react";
import {AlertContext} from "../../context/AlertContext";

function Alert () {

  const {alerts , removeAlert} = useContext(AlertContext);

  return (
    <div className={classes.alertContainer}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${classes.alert} ${classes[alert.type]} ${alert.hide ? classes.hide : ""}`}
        >
          <span>{alert.message}</span>
          
          <button
            className={classes.closeBtn}
            onClick={() => removeAlert(alert.id)}
          >
            X
          </button>

          <div className={classes.progress}></div>
        </div>
      ))}
    </div>
  );
}

export default Alert;