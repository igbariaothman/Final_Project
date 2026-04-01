import { useState } from "react";
import classes from "./addProduct.module.css";

function Product() {
  const id = localStorage.getItem("id");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  //update Name
  function handleSetName(e) {
    setName(e.target.value);
  }

  //Update Price
  function handlePrice(e) {
    setPrice(e.target.value);
  }

  //Update Category
  function handleCategory(e) {
    setCategory(e.target.value);
  }

  //Update Description
  function handleDescription(e) {
    setDescription(e.target.value);
  }

  //Add product 
  function handleAddProduct() {
    const priceNumber = Number(price);
    if (!name || !price || !category || !description) {
      setMessage("Please fill in all the fields");
      return;
    }
    if (!name) {
      setMessage("Please Enter the Product Name");
      return;
    }
    if (!price) {
      setMessage("Please Enter the Price ");
      return;
    }
    if (priceNumber < 0) {
      setMessage("The Price is negative");
      return;
    }
    if (!category) {
      setMessage("Please Enter the Category");
      return;
    }
    if (!description) {
      setMessage("Please Enter the Description");
      return;
    }
    if (id === null) {
      setMessage("To share product need to logIn");
      return;
    }

    console.log(id);

    fetch("http://localhost:5000/products/addProduct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productName: name,
        price: priceNumber,
        category: category,
        description: description,
        userId: id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setName("");
        setPrice("");
        setCategory("");
        setDescription("");
        setMessage("");
      })
      .catch((err) => {
        console.error(err);
        setMessage("Error adding Product");
      });
  }

  return (
    <div className={classes.container}>
      <p className={classes.title}>Add Product </p>

      <div className={classes.inputGroup}>
        <input
          type="text"
          required=""
          autoComplete="off"
          placeholder=" "
          value={name}
          onChange={handleSetName}
        />
        <label>Product Name</label>
      </div>

      <div className={classes.inputGroup}>
        <input
          type="text"
          required=""
          autoComplete="off"
          placeholder=" "
          value={price}
          onChange={handlePrice}
        />
        <label>Price</label>
      </div>

      <div className={classes.inputGroup}>
        <input
          type="text"
          required=""
          autoComplete="off"
          placeholder=" "
          value={category}
          onChange={handleCategory}
        />
        <label>Category</label>
      </div>

      <div className={classes.inputGroup}>
        <input
          type="text"
          required=""
          autoComplete="off"
          placeholder=" "
          value={description}
          onChange={handleDescription}
        />
        <label>Description</label>
      </div>

      <button className={classes.shareBtn} onClick={handleAddProduct}>
        <span>Share it</span>
      </button>
      <p className={classes.message}>{message}</p>
    </div>
  );
}
export default Product;
