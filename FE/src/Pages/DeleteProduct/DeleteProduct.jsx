
import classes from "./deleteproduct.module.css";


function DeleteProduct({ productId, products }) {
  async function deleteProduct() {
    // Implementation for deleting a product
    try {
      const res = await fetch(`http://localhost:5000/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message);
        return;
      }

      products((prev) => prev.filter((p) => p.productId !== productId));
      console.log(`Product deleted successfully: ${productId} `);

    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div>
      <button
        className={classes.deletebutton}
        onClick={(e) => {
          e.stopPropagation();
          deleteProduct();
        }}
      >
        Delete
      </button>
    </div>
  );
}

export default DeleteProduct;
