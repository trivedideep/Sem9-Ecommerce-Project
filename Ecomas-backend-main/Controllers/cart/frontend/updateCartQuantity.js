const cart = require("../../../Models/cart");

const updateCartQuantity = async (req, res) => {
  try {
    const { cartItemId, newQuantity } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!cartItemId) {
      return res.status(400).send({ status: "failed", message: "Cart item ID is required" });
    }

    if (!newQuantity || newQuantity < 1) {
      return res.status(400).send({ status: "failed", message: "Quantity must be at least 1" });
    }

    // Find and populate cart item with product details
    const existingCartItem = await cart.findOne({
      _id: cartItemId,
      user_id,
    }).populate('product_id').populate('product_variant_id');

    if (!existingCartItem) {
      return res.status(404).send({ status: "failed", message: "Cart item not found or does not belong to you" });
    }

    // Check stock availability - CRITICAL for preventing overselling
    const product = existingCartItem.product_id || existingCartItem.product_variant_id;

    if (product && product.stock !== undefined && product.stock !== null) {
      const availableStock = parseInt(product.stock);

      if (availableStock === 0) {
        return res.status(400).send({
          status: "failed",
          message: "This product is currently out of stock"
        });
      }

      if (newQuantity > availableStock) {
        return res.status(400).send({
          status: "failed",
          message: `Only ${availableStock} item${availableStock > 1 ? 's' : ''} available in stock. You are trying to add ${newQuantity}.`
        });
      }
    }

    // Update quantity
    existingCartItem.product_qty = parseInt(newQuantity);
    await existingCartItem.save();

    res.send({
      status: "successfully",
      message: "Cart quantity updated successfully",
      data: existingCartItem
    });
  } catch (err) {
    console.log(`Error updating cart quantity: ${err}`);
    res.status(500).send({ status: "failed", message: "Failed to update cart quantity", errors: err.message });
  }
};

module.exports = updateCartQuantity;
