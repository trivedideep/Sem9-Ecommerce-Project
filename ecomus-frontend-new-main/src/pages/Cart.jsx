import React, { useState } from "react";
import Header from "../components/Header/Header";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  useDeleteCartMutation,
  useGetCartCountQuery,
  useGetCartProductQuery,
  usePostUpdateCartMutation,
} from "../store/api/cartapi";
import { addItem } from "../store/state/cart";

const Cart = () => {
  const nvg = useNavigate();
  const dispatch = useDispatch();
  const globalvariable = useSelector(state => state);
  const [showtax, setshowtax] = useState(false);
  const [loading, setloading] = useState(false);
  const [vouchervalue, setvouchervalue] = useState("");
  const [totalvoucher, settotalvoucher] = useState(0);
  const [voucherlist, setvoucherlist] = useState([]);
  const [vouchererror, setvouchererror] = useState("");

  const { data: cartdata, isLoading, refetch } = useGetCartProductQuery();
 
  console.log("rds cartdata:", cartdata);

  // add safe local variables to avoid repeating optional chaining
  const cartItems = cartdata?.data || [];
  const totalItems = cartdata?.totalItems || 0;
  const totalAmountWithoutDiscount = cartdata?.total_Amount_without_discount || 0;
  const totalDiscount = cartdata?.totalDiscount || 0;
  const shippingCharges = cartdata?.shipping_charges || 0;
  const totalAmountWithDiscount = cartdata?.total_Amount_with_discount || 0;

  const [updatecart] = usePostUpdateCartMutation();
  const [deletecartitem] = useDeleteCartMutation();

  const getCartItemStock = item => {
    if (!item) return undefined;

    const stockCandidates = [
      item?.product_variant_id?.stock,
      item?.product_id?.stock,
      item?.product_variant_id?.quantity,
      item?.product_id?.quantity,
      item?.product_variant_id?.stock_quantity,
      item?.product_id?.stock_quantity,
      item?.product_variant_id?.available_stock,
      item?.product_id?.available_stock,
      item?.stock,
      item?.available_stock,
      item?.stock_record?.stock,
      item?.stock_record?.available_stock,
      item?.stock_record?.quantity,
      item?.product_variant_id?.stock_record?.stock,
      item?.product_variant_id?.stock_record?.available_stock,
      item?.product_variant_id?.stock_record?.quantity,
      item?.product_id?.stock_record?.stock,
      item?.product_id?.stock_record?.available_stock,
      item?.product_id?.stock_record?.quantity,
    ];

    // Mirror backend: rely on the lowest non-negative stock number to avoid overstating availability.
    const numericCandidates = stockCandidates
      .map(candidate => {
        const parsed = Number(candidate);
        return Number.isFinite(parsed) ? parsed : null;
      })
      .filter(candidate => candidate !== null && candidate >= 0);

    if (!numericCandidates.length) {
      return undefined;
    }

    return Math.min(...numericCandidates);
  };

  const { data: cartcount, isLoading: cartcountloader, refetch: cartrefetch } = useGetCartCountQuery()
  const incrementcart = async (qty, id, stockHint) => {
    const currentQty = Number(qty) || 0;
    let parsedStock = stockHint !== undefined && stockHint !== null ? Number(stockHint) : undefined;

    if ((parsedStock === undefined || Number.isNaN(parsedStock)) && Array.isArray(cartItems)) {
      const itemMatch = cartItems.find(cartItem => (cartItem?._id || "") === id);
      if (itemMatch) {
        const fallbackStock = getCartItemStock(itemMatch);
        if (fallbackStock !== undefined) {
          parsedStock = Number(fallbackStock);
        }
      }
    }

    if (parsedStock !== undefined && Number.isFinite(parsedStock)) {
      const maxAllowed = Math.max(parsedStock, 0);
      if (currentQty >= maxAllowed) {
        const message = maxAllowed > 0
          ? `Only ${maxAllowed} item${maxAllowed > 1 ? "s" : ""} available in stock.`
          : "This product is currently out of stock.";
        alert(message);
        return;
      }
    }

    const data = {
      newQuantity: currentQty + 1,
      cartItemId: id,
    };
    setloading(false);
    const response = await updatecart(data);
    if (response?.data?.status === "successfully") {
      cartrefetch()
      if (cartcountloader == false) {

        dispatch(addItem(cartcount?.totalItems ?? 0));
        // dispatch(addItem(globalvariable.cart + 1));
        refetch();
      }
      return;
    }

    const errorMessage = response?.error?.data?.message || response?.data?.message || "Unable to update quantity at this time.";
    alert(errorMessage);
  };


  const decrementcart = async (qty, id) => {
    const currentQty = Number(qty) || 0;
    if (currentQty > 1) {
      const data = {
        newQuantity: currentQty - 1,
        cartItemId: id,
      };
      setloading(false);
      const response = await updatecart(data);
      if (response?.data?.status === "successfully") {
        cartrefetch()
        if (cartcountloader === false) {

          dispatch(addItem(cartcount?.totalItems ?? 0));
          refetch();
        }
      } else {
        const errorMessage = response?.error?.data?.message || response?.data?.message || "Unable to update quantity at this time.";
        alert(errorMessage);
      }
    }
  };
  const deletecart = async (id, qty) => {
    const response = await deletecartitem(id);
    if (response) {
      dispatch(addItem(globalvariable.cart - qty));
      refetch();
    }
  };

  return isLoading === true ? (
    <></>
  ) : (
    <>
      <Header />
      <div className="breadcrumb-main margincart">
        <div className="container m-0">
          <div className="row">
            <div className="col">
              <div className="breadcrumb-contain">
                <div>
                  <ul>
                    <li>
                      <a href="/">home</a>
                    </li>
                    <li>
                      <i className="fa fa-angle-double-right" />
                    </li>
                    <li>
                      <a href="javascript:void(0)">cart</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* breadcrumb End */}

      {/*section start*/}
      <section className="section-big-py-space b-g-light">
        <div className="container-fluid">
          <div className="row specailmargin">
            <div className="col-md-8" style={{ backgroundColor: 'white' }}>
              <div className=" hayeveryone">
                <div
                  className="row details  cartdesgintwo"
                  style={{ display: "none" }}
                >
                  {isLoading === true
                    ? ""
                    : cartItems[0]?.product_name
                      ? cartItems.map((item, index) => {
                        const availableStock = getCartItemStock(item);
                        return (
                          <div key={`cart-item-${item._id || index}`} className="col-lg-5 py-2" style={{ width: "470px" }}>
                            <div className="card">
                              <div
                                className="card-body"
                                style={{
                                  paddingTop: "0px",
                                  paddingBottom: "0px",
                                  display: "flex",
                                }}
                              >
                                <div style={{ padding: "10px" }}>
                                  <img
                                    src={`http://localhost:8000/uploads/images/${item.product_id === null
                                      ? item.product_variant_id.product_image1
                                      : item.product_id.product_image1
                                      }`}
                                    width="120px"
                                    height="170px"
                                    alt="cart"
                                    className=" "
                                  />
                                </div>
                                <div style={{ paddingTop: "40px" }}>
                                  <h6 className="pnwidth">
                                    <span
                                      style={{
                                        color: "black",
                                        fontSize: "14px",
                                        lineHeight: "20px",
                                        fontWeight: "600",
                                        display: "-webkit-box",
                                        WebkitLineClamp: "1",
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                      }}
                                    >
                                      {item.product_id === null
                                        ? item.product_variant_id.product_name
                                        : item.product_id.product_name}
                                    </span>
                                  </h6>
                                  <h6
                                    className="td-color"
                                    style={{
                                      fontWeight: 400,
                                      lineHeight: "18px",
                                      fontSize: "14px",
                                      paddingTop: "7px",
                                    }}
                                  >
                                    &nbsp;{item.product_id === null
                                      ? item.product_variant_id?.selling_price
                                      : item.product_id?.selling_price}
                                    <span
                                      style={{
                                        color: "#c1c2c5",
                                        textDecoration: "line-through",
                                        fontSize: "11px",
                                      }}
                                    >{item.product_id === null
                                      ? item.product_variant_id.mrp_price
                                      : item.product_id.mrp_price}</span>
                                  </h6>
                                  <div
                                    className="qty-box"
                                    style={{ padding: "" }}
                                  >
                                    <div
                                      className="qty-box"
                                      style={{ padding: "10px 0px" }}
                                    >
                                      <div className="input-group qtywidth">
                                        <button
                                          style={{
                                            border: "none",
                                            outline: "none",
                                            backgroundColor: "white",
                                            color: "#059fe2",
                                            fontSize: "17px",
                                            fontWeight: 700,
                                          }}
                                          onClick={() => {
                                            decrementcart(
                                              item?.product_qty,
                                              item?._id
                                            );
                                          }}
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          name="quantity"
                                          style={{ width: "40px" }}
                                          className="form-control qty input-number"
                                          readOnly
                                          defaultValue={item?.product_qty}
                                        />
                                        <button
                                          style={{
                                            border: "none",
                                            outline: "none",
                                            backgroundColor: "white",
                                            color: "#059fe2",
                                            fontSize: "17px",
                                            fontWeight: 700,
                                            cursor: availableStock === undefined || item?.product_qty < availableStock ? 'pointer' : 'not-allowed',
                                          }}
                                          onClick={() => {
                                            incrementcart(
                                              item?.product_qty,
                                              item?._id,
                                              availableStock
                                            );
                                          }}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <hr
                                style={{
                                  color: "black",
                                  width: "100%",
                                  margin: "0px 0px 10px 0px",
                                }}
                              />
                              <a
                                href="#"
                                style={{ color: "#059fe2" }}
                                className="remove"
                                onClick={() => {
                                  deletecart(item?._id, item?.product_qty);
                                }}
                              >
                                Remove
                              </a>
                            </div>
                          </div>
                        )
                      })
                      : ""}
                </div>
              </div>

              <div
                className="table-responsive bigcart"
                style={{ borderRadius: "6px", padding: "0px 5px" }}
              >
                {/* <h3
                  style={{
                    padding: "5px 9px",
                    fontWeight: 700,
                    fontSize: "18px",
                  }}
                >
                  Shopping Cart
                </h3> */}

                <table className="table" style={{ marginTop: '5px' }}>
                  <thead>
                    <tr>
                      <th
                        className="family"
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          width: "15%",
                          textAlign: "center",
                        }}
                      >
                        Image
                      </th>
                      <th
                        className="family"
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          width: "15%",
                          textAlign: "center",
                        }}
                      >
                        Product Name
                      </th>
                      <th
                        className="family"
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          width: "15%",
                          textAlign: "center",
                        }}
                      >
                        MRP
                      </th>
                      <th
                        className="family"
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          width: "15%",
                          textAlign: "center",
                        }}
                      >
                        Price
                      </th>
                      <th
                        className="family"
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          width: "15%",
                          textAlign: "center",
                        }}
                      >
                        Quantity
                      </th>
                      <th
                        className="family"
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          width: "15%",
                          textAlign: "center",
                        }}
                      >
                        Total
                      </th>
                      <th
                        className="family"
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          width: "8%",
                        }}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading === true ? (
                      ""
                    ) : cartItems[0]?.product_name ? (
                      cartItems.map((item, index) => {
                        const availableStock = getCartItemStock(item);
                        return (
                          <tr>
                            <td
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <img
                                src={`http://localhost:8000/uploads/images/${item.product_id == null
                                  ? item.product_variant_id.product_image1
                                  : item.product_id.product_image1
                                  }`}
                                width="80px"
                                height="80px"
                                alt="cart"
                                className=" "
                              />
                            </td>
                            <td className="pnwidth">
                              <div style={{ position: "relative", top: "13px" }}>
                                <span
                                  style={{
                                    color: "black",
                                    fontSize: "14px",
                                    lineHeight: "37px",
                                    textAlign: "center",
                                    display: "-webkit-box",
                                    WebkitLineClamp: "1",
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {item.product_id == null
                                    ? item.product_variant_id.product_name
                                    : item.product_id.product_name}
                                </span>
                              </div>
                            </td>
                            <td>
                              <h6
                                className="td-color"
                                style={{
                                  fontWeight: 400,
                                  lineHeight: "63px",
                                  fontSize: "14px",
                                  textAlign: "center",
                                }}
                              >
                                ₹{" "}
                                {item.product_id == null
                                  ? item.product_variant_id.mrp_price
                                  : item.product_id.mrp_price}
                              </h6>
                            </td>
                            <td>
                              <h6
                                className="td-color"
                                style={{
                                  fontWeight: 400,
                                  lineHeight: "63px",
                                  fontSize: "14px",
                                  textAlign: "center",
                                }}
                              >
                                ₹
                                {item.product_id == null
                                  ? item.product_variant_id?.selling_price
                                  : item.product_id?.selling_price}
                              </h6>
                            </td>
                            <td >
                              {" "}
                              <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100px',
                                height: '32px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '6px',
                                background: '#fff',
                                boxSizing: 'border-box',
                                padding: 0,
                                marginTop: '20px'

                              }}>
                                <button
                                  style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'none',
                                    color: '#059fe2',
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    width: '32px',
                                    height: '32px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s',
                                    margin: 0,

                                  }}
                                  onClick={() => {
                                    decrementcart(item?.product_qty, item?._id);
                                  }}
                                >
                                  -
                                </button>
                                <span
                                  style={{
                                    width: '36px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#222',
                                    userSelect: 'none',
                                    margin: 0,
                                  }}
                                >
                                  {item.product_qty === 0 ? 0 : item.product_qty}
                                </span>
                                <button
                                  style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'none',
                                    color: '#059fe2',
                                    fontSize: '20px',
                                    fontWeight: 600,
                                    width: '32px',
                                    height: '32px',
                                    cursor: availableStock === undefined || item?.product_qty < availableStock ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s',
                                    margin: 0,
                                  }}
                                  onClick={() => {
                                    incrementcart(item?.product_qty, item?._id, availableStock);

                                  }}
                                  disabled={availableStock !== undefined && item?.product_qty >= availableStock}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td>
                              <h6
                                className="td-color"
                                style={{
                                  fontWeight: 400,
                                  lineHeight: "63px",
                                  fontSize: "14px",
                                  color: "#059fe2",
                                  textAlign: "center",
                                }}
                              >
                                ₹
                                {(item.product_id == null
                                  ? item.product_variant_id.selling_price
                                  : item.product_id.selling_price) *
                                  item.product_qty}
                              </h6>
                            </td>
                            <td>
                              <a
                                href="javascript:void(0)"
                                onClick={() => {
                                  deletecart(item?._id, item?.product_qty);
                                }}
                                className="icon"
                                style={{
                                  color: "#777777",
                                  padding: "0px 3px",
                                  lineHeight: "63px",
                                }}
                              >
                                <img src="/images/delete.png" alt={404} />
                              </a>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan="7">
                          <h6
                            className="td-color"
                            style={{
                              fontWeight: 400,
                              lineHeight: "34px",
                              fontSize: "14px",
                              color: "#059fe2",
                              textAlign: "center",
                            }}
                          >
                            Your Cart is Empty!
                          </h6>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <h5
                  style={{
                    padding: "9px 9px",
                    fontWeight: 400,
                    fontSize: 14,
                    cursor: "pointer",
                    color: "#50b3f7"
                  }}
                  onClick={() => {
                    nvg("/home");
                  }}
                >
                  {/* <img src="/images/ar.png" alt="arrow" /> */}
                  Continue Shop
                </h5>
              </div>
            </div>
            <div className="col-md-4 mt-lg-0 mt-md-0 mt-sm-3 mt-xs-3">
              <div
                className="py-2 px-2"
                style={{ background: "#ffff", borderRadius: 6 }}
              >
                <h4
                  style={{
                    padding: "0px 9px",
                    fontWeight: 700,
                    fontSize: "18px",
                  }}
                >
                  Summary
                </h4>
                <div
                  className="firstrow px-3 d-flex justify-content-between"
                  style={{ padding: "5px 0px" }}
                >
                  <span
                    className="family"
                    style={{ fontWeight: 600, fontSize: "12px" }}
                  >
                    {totalItems} Items
                    {/* {data.length} Items */}
                  </span>
                  <span
                    className="family"
                    style={{
                      fontWeight: 500,
                      color: "#059fe2",
                      fontSize: "12px",
                    }}
                  >
                    ₹{totalAmountWithoutDiscount === 0 ? 0.0 : totalAmountWithoutDiscount}
                  </span>
                </div>
                <div
                  className="firstrow px-3 d-flex justify-content-between"
                  style={{ padding: "5px 0px" }}
                >
                  <span
                    className="family"
                    style={{ fontWeight: 600, fontSize: "12px" }}
                  >
                    Discount
                  </span>
                  <span
                    className="family"
                    style={{
                      fontWeight: 500,
                      color: "#059fe2",
                      fontSize: "12px",
                    }}
                  >
                    {totalDiscount === 0 ? `₹0.00` : `-₹${totalDiscount}`}
                  </span>
                </div>
                <div
                  className="firstrow px-3 d-flex justify-content-between"
                  style={{ padding: "5px 0px" }}
                >
                  <span
                    className="family"
                    style={{ fontWeight: 600, fontSize: "12px" }}
                  >
                    Shipping
                  </span>
                  <span
                    className="family"
                    style={{
                      fontWeight: 500,
                      color: "#059fe2",
                      fontSize: "12px",
                    }}
                  >
                    ₹{shippingCharges === 0 ? `0.00` : parseInt(shippingCharges)}
                  </span>
                </div>
                {/* <div
                  className="firstrow px-3 d-flex justify-content-between"
                  style={{ padding: "5px 0px" }}
                >
                  <span
                    className="family"
                    style={{ fontWeight: 600, fontSize: "12px" }}
                  >
                    Voucher Redemption
                  </span>
                  <span
                    style={{
                      color: "#059fe2",
                      fontWeight: 500,
                      fontSize: "12px",
                    }}
                  >
                    {" "}
                    {totalvoucher == 0 ? `₹0.00` : `-₹${totalvoucher}`}
                  </span>
                </div>
                {voucherlist[0]?.amount
                  ? voucherlist.map((item, index) => (
                      <div className="firstrow px-2 mx-2 py-1 d-flex justify-content-between mt-1 align-items-center">
                        <div
                          className="firstcontianer d-flex align-items-start"
                          style={{ gap: 4 }}
                        >
                          <div className="containerimg">
                            <img src="/images/carticon.png" alt={404} />
                          </div>
                          <div>
                            <p
                              className="m-0"
                              style={{ fontWeight: 400, fontSize: "12px" }}
                            >
                              {item.voucher.code} applied
                            </p>
                          </div>
                        </div>
                        <div className="remove">
                          <span
                            style={{
                              color: "#D83043",
                              fontWeight: 500,
                              fontSize: "10px",
                            }}
                          >
                            - ₹{item.amount}
                          </span>
                        </div>
                      </div>
                    ))
                  : ""} */}
                <div className="firstrow px-3 pt-1 d-flex justify-content-between">
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "12px",
                      paddingLeft: "0px",
                    }}
                  >
                    Payable{" "}
                    {/* <span
                      style={{
                        fontSize: "10px",
                        color: "#8F9091",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setshowtax(!showtax);
                      }}
                    >
                      (incl. taxes){" "}
                      <span style={{ fontSize: "13px" }}>
                        {showtax == true ? "-" : "+"}
                      </span>{" "}
                      <br />{" "}
                      <span
                        style={{
                          fontSize: 10,
                          color: "#8F9091",
                          textAlign: "end",
                          display: showtax == true ? "block" : "none",
                        }}
                        id="span2"
                      >
                        ₹0
                      </span>
                    </span> */}
                  </span>
                  <span
                    style={{
                      fontWeight: 500,
                      color: "#059fe2",
                      fontSize: "12px",
                    }}
                  >
                    {totalAmountWithDiscount === 0
                      ? "₹0.00"
                      : `₹${totalAmountWithDiscount}`}
                  </span>
                </div>
                <div
                  className="firstrow px-2 d-flex justify-content-between"
                  style={{ padding: "5px 0px", paddingLeft: "20px" }}
                >
                  {totalAmountWithDiscount !== 0 ? (
                    <NavLink
                      to="#"
                      onClick={() => { nvg('/checkout'); window.location.reload(); }}
                      style={{ width: "100%" }}
                    >
                      <button
                        style={{
                          border: "none",
                          outline: "none",
                          backgroundColor: "#2B2A29",
                          padding: "7px 0px",
                          color: "white",
                          width: "100%",
                          fontWeight: 600,
                        }}
                      >
                        CHECKOUT
                      </button>
                    </NavLink>
                  ) : (
                    <button
                      style={{
                        border: "none",
                        outline: "none",
                        backgroundColor: "#2B2A29",
                        padding: "7px 0px",
                        color: "white",
                        width: "100%",
                        fontWeight: 600,
                      }}
                    >
                      CHECKOUT
                    </button>
                  )}
                </div>
              </div>
              {/* <div
                className="py-2"
                style={{ background: "#ffff", borderRadius: 6, marginTop: 10 }}
              >
                <div
                  className="firstrow px-3 d-flex justify-content-between"
                  style={{ padding: "5px 0px" }}
                >
                  <span style={{ fontWeight: 600, fontSize: 12 }}>
                    Apply Voucher code
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <span style={{ fontWeight: 700, color: "#059fe2" }}>
                      <input
                        type="text"
                        value={vouchervalue}
                        className="form-control applypay"
                        placeholder="Enter your code"
                        onChange={(e) => {
                          setvouchervalue(e.target.value);
                        }}
                      />
                    </span>
                    <button
                      className="btn"
                      style={{
                        fontWeight: 500,
                        backgroundColor: "#059fe2",
                        color: "white",
                        fontSize: 12,
                        height: "fit-content",
                        padding: "7px 8px",
                      }}
                      onClick={() => {
                        console.log("voucher apply")
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
                <div className="firstrow px-3 pb-2 d-flex justify-content-between">
                  <span style={{ fontWeight: 600, fontSize: "17px" }} />
                  <span
                    style={{ fontWeight: 500, color: "#059fe2", fontSize: 11 }}
                  >
                    <span style={{ color: "red" }}>{vouchererror}</span>
                  </span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>
      {/*section end*/}

    </>
  );
};
export default Cart;
