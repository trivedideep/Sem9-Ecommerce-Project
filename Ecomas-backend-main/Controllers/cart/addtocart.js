const cart = require("../../Models/cart");
const Product = require("../../Models/product");
const Variant = require("../../Models/product_variant");

const addtocart = async (req, res) => {
  try {
    const {
      product_name,
      product_id,
      product_qty,
      product_variant_id,
      item_or_variant,
    } = req.body;
    const user_id = req.user.id;

    // Validate stock before adding to cart
    let product;
    if (item_or_variant === "variant" && product_variant_id) {
      product = await Variant.findById(product_variant_id);
    } else if (product_id) {
      product = await Product.findById(product_id);
    }

    if (product && product.stock !== undefined && product.stock !== null) {
      const availableStock = parseInt(product.stock);

      if (availableStock === 0) {
        return res.status(400).send({
          status: "failed",
          message: "This product is currently out of stock"
        });
      }
    }

    const existingCartItem = await cart.findOne({
      product_id,
      user_id,
      product_variant_id,
      item_or_variant,
      orderstatus: "add to cart"
    });

    if (existingCartItem) {
      const newTotalQty = existingCartItem.product_qty + product_qty;

      // Check if new total exceeds stock
      if (product && product.stock !== undefined && product.stock !== null) {
        const availableStock = parseInt(product.stock);
        if (newTotalQty > availableStock) {
          return res.status(400).send({
            status: "failed",
            message: `Only ${availableStock} item${availableStock > 1 ? 's' : ''} available in stock. You already have ${existingCartItem.product_qty} in cart.`
          });
        }
      }

      existingCartItem.product_qty = newTotalQty;
      await existingCartItem.save();
      res.send({ status: "successfully", data: existingCartItem });
    } else {
      // Check stock for new cart item
      if (product && product.stock !== undefined && product.stock !== null) {
        const availableStock = parseInt(product.stock);
        if (product_qty > availableStock) {
          return res.status(400).send({
            status: "failed",
            message: `Only ${availableStock} item${availableStock > 1 ? 's' : ''} available in stock`
          });
        }
      }

      const addproduct = new cart({
        product_name,
        product_id,
        product_qty,
        user_id,
        product_variant_id,
        item_or_variant,
      });

      const response = await addproduct.save();
      res.send({ status: "successfully", data: response });
    }
  } catch (err) {
    console.log(`Here is error: ${err}`);
    res.status(500).send({ status: "failed", message: "Failed to add to cart", errors: err.message });
  }
};

module.exports = addtocart;
