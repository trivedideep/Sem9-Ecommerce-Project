import Header from "../components/Header/Header";
import Footer from "../components/Footer";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { usePostOrderMutation } from "../store/api/orderapi";

const Thankyoupage = () => {
  const [loading, setloading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const location = useLocation();

  const [postorder] = usePostOrderMutation();

  const formatCurrency = (value = 0) => {
    const parsed = Number(value) || 0;
    return parsed.toFixed(2);
  };

  const billingSummary = useMemo(() => {
    if (!orderDetails) {
      return null;
    }
    const subtotal = orderDetails.subtotal ?? orderDetails.sub_total_amount ?? 0;
    const gstAmount = orderDetails.gstAmount ?? orderDetails.tax_amount ?? 0;
    const shipping = orderDetails.shipping_charges ?? 0;
    const totalPayable = orderDetails.grand_total_amount ?? (subtotal + gstAmount + shipping);
    return {
      subtotal,
      gstAmount,
      shipping,
      totalPayable,
    };
  }, [orderDetails]);

  useEffect(() => {
    const checkoutform = async () => {
      try {
        const response = await postorder(location?.state?.orderinfo).unwrap();
        setOrderDetails(response?.order || null);
        setOrderError(null);
      } catch (error) {
        setOrderError("We couldn't confirm your order. Please contact support if this continues.");
      } finally {
        setloading(false);
      }
    };

    if (location?.state?.orderinfo) {
      checkoutform();
    } else {
      setloading(false);
      setOrderError("No order information found. Please return to the shop.");
    }
  }, [location?.state?.orderinfo, postorder]);
  return (
    loading === true ? <></> : <>
      <div>

        {/*header start*/}
        <Header />
        {/*header end*/}



        <section className="pt-lg-5 pt-md-2 mt-5">
          <div className="col-lg-12 col-sm-12  mt-lg-2 mt-1 mb-2">
            {/* <div className='container-fluid bigdiv'> */}
            <div className="container-fluid">
              <div className="row Thankpage">
                <div className="col-lg-12 col-sm-12 col-md-12">
                  <div className="TextTankyou">
                    <div className="Imgverify"> <img src="./images/icon/Group1.png" alt="img-fluid" style={{ width: '23%' }} className="boyimg" /></div>
                    <h2 className="Fontthank" style={{ fontWeight: '600' }}> <a href="Thank you" style={{ color: '#059fe2' }}>Thank you</a> for your order <img src="./images/icon/Group2.png" alt="404" className="Checkimg2" /></h2>
                  </div>
                  <div>
                    <p className="text-center" style={{ color: '#8F9091' }} >Your order has been placed and is being processed. You will Receive an Email from Ecomus.</p>
                  </div>
                  {billingSummary && (
                    <div className="row justify-content-center mt-4">
                      <div className="col-lg-6 col-md-8 col-sm-10">
                        <div className="card shadow-sm">
                          <div className="card-body">
                            <h5 className="mb-3" style={{ fontSize: '16px', fontWeight: 600 }}>Bill Summary</h5>
                            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
                              <span>Subtotal</span>
                              <span>₹{formatCurrency(billingSummary.subtotal)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
                              <span>GST (18%)</span>
                              <span>₹{formatCurrency(billingSummary.gstAmount)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
                              <span>Shipping</span>
                              <span>₹{formatCurrency(billingSummary.shipping)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between" style={{ fontSize: '14px', fontWeight: 600 }}>
                              <span>Total Payable</span>
                              <span>₹{formatCurrency(billingSummary.totalPayable)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {orderError && (
                    <p className="text-center mt-3" style={{ color: '#ff4d4f', fontSize: '13px' }}>{orderError}</p>
                  )}

                  <div className="backTohome" style={{ paddingTop: '20px' }}>
                    <NavLink to="/home" style={{ lineHeight: '20px', color: '#8F9091', fontSize: '14px' }}>Continue Shopping</NavLink>
                  </div>



                </div>


              </div>
            </div>
          </div>
        </section>

        {/* footer start */}
        <Footer />
        {/* footer end */}


      </div>




    </>
  )
}
export default Thankyoupage;