import { useState, useEffect } from "react";
import classes from "./favorites.module.css";



function Favorites (){
const [favorite, setFavorite] = useState([]); ;
const userId = localStorage.getItem("id") ;

 useEffect(() => {
   fetch(`http://localhost:5000/favorite?userId=${userId}`)
     .then((res) => res.json())
     .then((data) => setFavorite(data))
     .catch((err) => console.error(err));
 }, [userId]);

 //delete from favorite 
function deleteFavorite (productId){
  const userId = localStorage.getItem("id") ;

  fetch(`http://localhost:5000/favorite/${productId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",},
      body : JSON.stringify({ userId }) ,
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data.message); 
      setFavorite((prevFavorites) =>
        prevFavorites.filter((item) => item.id !== productId),
      );
    })
    .catch((err) => console.error(err));
}

return (
  <div className= {classes.favorite}>
    <h1>My Favorites</h1>

    {favorite.length === 0 && <p className= {classes.message}>No Favorotes</p>}

    <div className= {classes.grid}>
      {favorite.map((p) => (
      <div key={p.id} className={classes.card}>
        <div className={classes.details}>
          <h2 className={classes.name}>{p.productName}</h2>
          <p className={classes.price}>{p.price}</p>
          <p className={classes.description}>{p.description}</p>
          <p onClick={() => deleteFavorite(p.id)}>❌</p>
        </div>
      </div>
    ))}
    </div>
    
  </div>
);
}
export default Favorites; 