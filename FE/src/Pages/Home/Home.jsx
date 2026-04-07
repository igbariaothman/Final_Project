import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./home.module.css";

function Home() {
  const navigate = useNavigate();

  const [searchCategory, setSearchCategory] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, [navigate]);

  function filteredProduct() {
    return products.filter((p) =>
      p.category.toLowerCase().includes(searchCategory.toLowerCase())
    );
  }

  // add to favorite 
function addFavorite (productId){
  const userId = localStorage.getItem("id");

    fetch("http://localhost:5000/favorite/addfavorite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, productId }),
  })
    .then((res) => res.json())
    .catch((err) => console.error(err));
}

function getImageArray(images) {
  if (!images) return [];
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
}

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>Products List</h1>

      <input
        type="text"
        placeholder="Search by Category"
        value={searchCategory}
        onChange={(e) => setSearchCategory(e.target.value)}
      />
      {/* add to favorite */}
      <div className={classes.grid}>
        {filteredProduct().map((p) => {
          const imgs = getImageArray(p.images);

          return (
            <div key={p.id} className={classes.card}>
              <img
                src={
                  imgs.length > 0
                    ? `http://localhost:5000${imgs[0]}`
                    : "https://via.placeholder.com/150"
                }
                alt={p.productName}
                className={classes.productImage}
              />

              <div className={classes.details}>
                <h2 className={classes.name}>{p.productName}</h2>
                <p className={classes.price}>{p.price}</p>
                <p className={classes.description}>{p.description}</p>

                <button
                  onClick={() => addFavorite(p.id)}
                  className={classes.favoriteBtn}
                >
                  ❤️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
