import React, { useState } from "react";
import Header from "../components/Header/Header";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetCartProductQuery } from "../store/api/cartapi";

const Pay = () => {
  const [paymethod, setpaymethod] = useState("Online");
  const nvg = useNavigate();

  const location = useLocation();
  const userinfo = location.state.checkoutdata;
  console.log("this is userinfo with product details", location)

  const { data: cartdata, isLoading: cartloading } = useGetCartProductQuery();

  const formatCurrency = (value = 0) => {
    const parsed = Number(value) || 0;
    return parsed.toFixed(2);
  };

  const getItemPrices = (item) => {
    const product = item?.product_id === null ? item?.product_variant_id : item?.product_id;
    return {
      mrp: Number(product?.mrp_price) || 0,
      selling: Number(product?.selling_price) || 0,
      name: product?.product_name || "",
    };
  };

  const billingSummary = {
    mrpSubtotal: cartdata?.total_Amount_without_discount ?? 0,
    discount: cartdata?.totalDiscount ?? 0,
    subtotal: cartdata?.subtotal ?? cartdata?.total_Amount_with_discount_subtotal ?? 0,
    gstAmount: cartdata?.gstAmount ?? 0,
    gstPercentage: cartdata?.gstPercentage ?? ((cartdata?.gstRate ?? null) !== null ? (cartdata.gstRate * 100) : null),
    shipping: cartdata?.shipping_charges ?? 0,
    totalPayable: cartdata?.totalPayable ?? cartdata?.total_Amount_with_discount ?? 0,
  };
  const Codpay = async () => {
    const orderInfo = {
      shipping_first_name: userinfo.first_name,
      shipping_last_name: userinfo.last_name,
      shipping_address1: userinfo.address1,
      shipping_address2: userinfo.address2,
      shipping_country: userinfo.country,
      shipping_state: userinfo.state,
      shipping_city: userinfo.city,
      shipping_pincode: userinfo.pincode,
      shipping_email: userinfo.email,
      shipping_mobile: userinfo.phone_number,
      payment_method: "COD",
      total_amount: billingSummary.totalPayable,
      shipping_charges: billingSummary.shipping,
      sub_total_amount: billingSummary.subtotal,
      mrpSubtotal: billingSummary.mrpSubtotal,
      total_discount: billingSummary.discount,
      gstAmount: billingSummary.gstAmount,
      gstPercentage: billingSummary.gstPercentage,
      totalPayable: billingSummary.totalPayable,
    };
    nvg("/thankyoupage", {
      state: {
        orderinfo: orderInfo,
      },
    });
  };

  const Onlinepay = async () => {
    const shipping_address = {
      shipping_first_name: userinfo.first_name,
      shipping_last_name: userinfo.last_name,
      shipping_address1: userinfo.address1,
      shipping_address2: userinfo.address2,
      shipping_country: userinfo.country,
      shipping_state: userinfo.state,
      shipping_city: userinfo.city,
      shipping_pincode: userinfo.pincode,
      shipping_email: userinfo.email,
      shipping_mobile: userinfo.phone_number,
    };
    var options = {
      key: "rzp_test_vv1FCZvuDRF6lQ",
      key_secret: "P4JAUwn4VdE6xDLJ6p2Zy8RQ",
      amount: parseFloat(userinfo.total * 100).toFixed(2),
      currency: "INR",
      order_receipt: "order_rcptid_" + userinfo.first_name,
      name: "Web Mastery",
      description: "for testing purpose",
      handler: function (response) {
        const paymentId = response.razorpay_payment_id;
        const orderInfo = {
          ...shipping_address,
          payment_key: paymentId,
          payment_status: "received",
          payment_method: "Online",
          total_amount: billingSummary.totalPayable,
          shipping_charges: billingSummary.shipping,
          sub_total_amount: billingSummary.subtotal,
          mrpSubtotal: billingSummary.mrpSubtotal,
          total_discount: billingSummary.discount,
          gstAmount: billingSummary.gstAmount,
          gstPercentage: billingSummary.gstPercentage,
          totalPayable: billingSummary.totalPayable,
        };

        try {
          nvg("/thankyoupage", {
            state: {
              orderinfo: orderInfo,
            },
          });
        } catch (error) {
          nvg("/");
        }
      },

      theme: {
        color: "#059fe2",
      },
    };
    var pay = new window.Razorpay(options);
    pay.open();
  };

  return cartloading === false ? (
    <>
      <Header />

      {/* section start */}
      <section className="section-big-py-space b-g-light" style={{ marginTop: '65px' }}>
        <div className="custom-container">
          <div className="checkout-page contact-page">
            <div className="checkout-form">
              <div className="row justify-content-around">
                <div className="col-lg-7 col-sm-12 col-xs-12">
                  <div className="row theme-form">
                    <div className="col-12 p-0">
                      <h5 style={{ padding: "5px 2px" }}>
                        Select Payment Type
                      </h5>
                    </div>
                    <div className="col-xl-4 col-sm-12 border p-0">
                      <div
                        className="tabdes"
                        onClick={() => {
                          setpaymethod("Online");
                        }}
                        style={{
                          padding: "10px",
                          fontSize: "14px",
                          color: paymethod === "Online" ? "#fff" : "#333",
                          fontWeight: "550",
                          backgroundColor:
                            paymethod === "Online" ? "#059fe2" : "#fff",
                          cursor: "pointer",
                        }}
                      >
                        Online Payment
                      </div>
                      <div
                        className="tabdes"
                        onClick={() => {
                          setpaymethod("COD");
                        }}
                        style={{
                          padding: "10px",
                          fontSize: "14px",
                          color: paymethod === "COD" ? "#fff" : "#333",
                          fontWeight: "550",
                          backgroundColor:
                            paymethod === "COD" ? "#059fe2" : "#fff",
                          cursor: "pointer",
                        }}
                      >
                        COD
                      </div>
                    </div>
                    <div className="col-xl-8 col-sm-12 border mt-xl-0 mt-sm-2 mt-2">
                      <div className="paycontainer">
                        <h6
                          style={{
                            color: "#333",
                            padding: "7px 8px",
                            fontWeight: "600",
                          }}
                        >
                          {paymethod === "COD"
                            ? "Cash on Delivery"
                            : "Online Pay"}
                        </h6>

                        <div className="" style={{ padding: "7px 8px" }}>
                          {paymethod === "COD" ? (
                            <button
                              type="button"
                              onClick={Codpay}
                              style={{ fontSize: "12px" }}
                              className="btn-normal btn"
                            >
                              Place Order
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={Onlinepay}
                              style={{ fontSize: "12px" }}
                              className="btn-normal btn"
                            >
                              Place Order
                            </button>
                          )}
                          <p style={{ marginTop: "8px", fontSize: "11px" }}>
                            By placing this order, you agree to
                            <span
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                nvg("/termsconditions");
                              }}
                            >
                              {" "}
                              Ecomus T&C
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-sm-12 col-xs-12">
                  <div className="checkout-details theme-form ">
                    <div className="order-box">
                      <div className="title-box" style={{ border: "none" }}>
                        <div>
                          <h5>Order Information</h5>
                        </div>
                      </div>
                      <div className="title-box">
                        <div style={{ fontSize: "12px" }}>
                          Items <span>Total</span>
                        </div>
                      </div>
                      <ul className="qty">
                        {cartdata.data[0]?.product_name
                          ? cartdata.data.map((item, index) =>
                            (() => {
                              const { mrp, selling, name } = getItemPrices(item);
                              const qty = item.product_qty;
                              const lineMrp = mrp * qty;
                              const lineSelling = selling * qty;
                              const lineDiscount = lineMrp - lineSelling;

                              return (
                                <li
                                  key={`pay-item-${item._id || index}`}
                                  style={{
                                    fontSize: "12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "2px",
                                    paddingBottom: "6px",
                                  }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ maxWidth: "70%" }}>{name} × {qty}</span>
                                    <span style={{ fontSize: "12px" }}>
                                      ₹{formatCurrency(lineSelling)}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#6c757d" }}>
                                    <span>MRP: ₹{formatCurrency(lineMrp)}</span>
                                    {lineDiscount > 0 ? (
                                      <span style={{ color: "#28a745" }}>
                                        You save: -₹{formatCurrency(lineDiscount)}
                                      </span>
                                    ) : <span />}
                                  </div>
                                </li>
                              );
                            })()
                          )
                          : ""}
                      </ul>
                      <ul className="sub-total">
                        <li style={{ fontSize: "12px" }}>
                          Items (MRP)
                          <span style={{ fontSize: "12px" }} className="count">
                            ₹{formatCurrency(billingSummary.mrpSubtotal)}
                          </span>
                        </li>
                        <li style={{ fontSize: "12px" }}>
                          Discount
                          <span style={{ fontSize: "12px" }} className="count">
                            -₹{formatCurrency(billingSummary.discount)}
                          </span>
                        </li>
                        <li style={{ fontSize: "12px" }}>
                          Selling Subtotal
                          <span style={{ fontSize: "12px" }} className="count">
                            ₹{formatCurrency(billingSummary.subtotal)}
                          </span>
                        </li>
                        {billingSummary.gstAmount > 0 || billingSummary.gstPercentage !== null ? (
                          <li style={{ fontSize: "12px" }}>
                            {`GST (${billingSummary.gstPercentage ?? 0}%)`}
                            <span style={{ fontSize: "12px" }} className="count">
                              ₹{formatCurrency(billingSummary.gstAmount)}
                            </span>
                          </li>
                        ) : null}
                        <li style={{ fontSize: "12px" }}>
                          Shipping
                          <span style={{ fontSize: "12px" }} className="count">
                            ₹{formatCurrency(billingSummary.shipping)}
                          </span>
                        </li>
                      </ul>
                      <ul className="sub-total">
                        <li>
                          Total Payable
                          <span style={{ fontSize: "12px" }} className="count">
                            ₹{formatCurrency(billingSummary.totalPayable)}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  ) : (
    <></>
  );
};
export default Pay;
