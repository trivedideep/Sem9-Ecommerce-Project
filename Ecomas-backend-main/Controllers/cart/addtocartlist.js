
const cart = require("../../Models/cart");
const GST_RATE = 0.18;

const roundCurrency = (amount = 0) => {
  return Math.round((Number(amount) || 0) * 100) / 100;
};

const addtocartlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const userCart = await cart.find({ user_id, orderstatus: 'add to cart' }).populate('user_id', 'name email mobile').populate('product_variant_id', 'product_name product_image1 description selling_price mrp_price weight weighttype stock').populate('product_id', 'product_name product_image1 description selling_price mrp_price weight weighttype stock');

    if (!userCart) {
      return res.status(404).json({ message: 'User cart is Empty' });
    }

    // Calculate total amount and total item number
    let total_Amount_with_discount = 0;
    let total_Amount_without_discount = 0;
    let totalItems = 0;
    let totalDiscount = 0;

    userCart.forEach((cartItem) => {
      total_Amount_with_discount += cartItem.product_qty * (cartItem.product_variant_id == null ? cartItem.product_id.selling_price : cartItem.product_variant_id.selling_price); // Assuming 'selling_price' is the key for the product price
      total_Amount_without_discount += cartItem.product_qty * (cartItem.product_variant_id == null ? cartItem.product_id.mrp_price : cartItem.product_variant_id.mrp_price); // Assuming 'selling_price' is the key for the product price
      totalItems += cartItem.product_qty;
      const discount = (cartItem.product_variant_id == null ? cartItem.product_id.mrp_price : cartItem.product_variant_id.mrp_price) - (cartItem.product_variant_id == null ? cartItem.product_id.selling_price : cartItem.product_variant_id.selling_price);
      totalDiscount += discount * cartItem.product_qty;
    });

    const subtotal = roundCurrency(total_Amount_with_discount);
    const gstAmount = roundCurrency(subtotal * GST_RATE);
    const subtotalWithGst = roundCurrency(subtotal + gstAmount);
    const shipping_charges = calculateFifteenPercent(subtotal);
    const totalPayable = roundCurrency(subtotalWithGst + shipping_charges);

    res.status(200).send({
      data: userCart,
      subtotal,
      gstAmount,
      totalAmount: subtotalWithGst,
      totalPayable,
      total_Amount_with_discount_subtotal: subtotal,
      total_Amount_with_discount: totalPayable,
      total_Amount_without_discount,
      totalItems,
      totalDiscount,
      shipping_charges,
      gstRate: GST_RATE,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }


}


function calculateFifteenPercent(totalAmount) {
  return roundCurrency(totalAmount * 0.15);
}

module.exports = addtocartlist