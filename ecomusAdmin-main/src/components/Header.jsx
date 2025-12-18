import React, { useMemo } from "react";
import img from "../assets/qwerty.png";
import { BsFillEnvelopeFill } from "react-icons/bs";
import {
  FaBell,
  FaCog,
  FaEuroSign,
  FaSignature,
  FaUserAlt,
} from "react-icons/fa";
import { getsoh, gettoken, removeToken } from "../Localstorage/Store";
import { NavLink, useNavigate } from "react-router-dom";
import { AiOutlineDown } from "react-icons/ai";
// import img2 from "../assets/loginlogo.png";
import img2 from "../assets/Ecomus.svg";
import { useContactlistlatestQuery } from "../store/api/webinfoapi";
import { useGetUserInfoQuery } from "../store/api/userapi";
import { useLazyGetOutOfStockProductsQuery } from "../store/api/productapi";
const Header = () => {
  const nvg = useNavigate();

  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api/";
  const imageBaseUrl = useMemo(() => {
    const fallback = "http://localhost:8000/uploads/images/";

    if (!apiBaseUrl) {
      return fallback;
    }

    if (apiBaseUrl.includes("/api")) {
      return apiBaseUrl.replace(/\/api\/?$/, "/uploads/images/");
    }

    try {
      const parsed = new URL(apiBaseUrl);
      return `${parsed.origin}/uploads/images/`;
    } catch (error) {
      console.warn("Unable to derive image base URL from API base", error);
      return fallback;
    }
  }, [apiBaseUrl]);

  // Call gettoken() defensively to avoid crashes when localStorage value is missing/invalid
  let usertoken = null;
  try {
    const tk = gettoken();
    usertoken = tk ?? null;
  } catch (err) {
    console.warn("gettoken() failed in Admin Header — treating as not-logged-in:", err);
    usertoken = null;
  }

  console.log("this user info", usertoken)
  const logoutevt = async () => {
    removeToken();
    nvg("/");
  };
  const sshh = getsoh();

  const { data: userData, isLoading } = useContactlistlatestQuery();

  // Fetch logged-in admin user info
  const { data: userinfo, isLoading: userinfoLoading } = useGetUserInfoQuery(undefined, {
    skip: !usertoken // Skip query if user is not logged in
  });

  console.log("dkdkdkdkkc", userData)

  const notificationCount = Array.isArray(userData?.data) ? userData.data.length : 0;
  const notificationCountLabel = notificationCount > 99 ? "99+" : notificationCount;

  const [fetchOutOfStockProducts, { data: outOfStockResponse, isFetching: outOfStockLoading }]
    = useLazyGetOutOfStockProductsQuery();

  const outOfStockProducts = useMemo(() => {
    const rawList = Array.isArray(outOfStockResponse?.data) ? outOfStockResponse.data : [];
    const seen = new Set();

    return rawList.reduce((acc, item) => {
      const key = item?._id || item?.id || item?.product_id || item?.productId || item?.product_name;
      if (!key || seen.has(key)) {
        return acc;
      }
      seen.add(key);

      const imageName = item?.product_image1;
      let imageUrl = null;

      if (typeof imageName === "string" && imageName.trim().length > 0) {
        imageUrl = /^https?:/i.test(imageName) ? imageName : `${imageBaseUrl}${imageName}`;
      }

      acc.push({ ...item, imageUrl });
      return acc;
    }, []);
  }, [outOfStockResponse, imageBaseUrl]);

  const outOfStockCount = outOfStockProducts.length;
  const outOfStockCountLabel = outOfStockCount > 99 ? "99+" : outOfStockCount;

  const handleOutOfStockClick = () => {
    fetchOutOfStockProducts();
  };




  return (
    usertoken ? <div
      className="header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "0px",
      }}
    >
      <div>
        {sshh !== true ? (
          <img src={img2} alt="qwerty" style={{ height: "24px", marginLeft: "4px" }} />
        ) : (
          ""
        )}
      </div>
      <div style={{ display: "flex" }}>
        <div className="icongroup">
          <div style={{ width: "0px", height: "0px" }}>

          </div>



          <div className="icon white" style={{ position: "relative" }}>
            <div className="btn-group">
              {/* <button type="button" className="btn btn-danger"></button> */}
              <button
                type="button"
                className="btn dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ position: "relative" }}
              >
                <BsFillEnvelopeFill color="white" size="19px" />
                {/* <span className="visually-hidden">Toggle Dropdown</span> */}
                {notificationCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "#ff4d4f",
                      color: "#fff",
                      borderRadius: "12px",
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 4px",
                      fontSize: "10px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                      pointerEvents: "none",
                    }}
                  >
                    {notificationCountLabel}
                  </span>
                )}
              </button>
              <ul className="dropdown-menu">
                <div className="notification">
                  <h6 style={{ position: 'relative', top: '10px' }}>Notification</h6>
                  {/* <h6 className="ms-auto">Clear All</h6> */}
                </div>{" "}
                <hr />
                {isLoading === false && userData?.data ? userData.data.map((item, index) => (
                  <>
                    <div className="col drop-msg d-flex align-items-start ms-3 col-12">
                      <div className="col-3">
                        <img src={img} alt="" />
                      </div>
                      <div className="col-9">
                        <h6 className="noti-h">{item.firstname} {item.lastname}</h6>
                        <h6 className="noti">
                          {item.Message.length > 40 ? `${item.Message.substring(0, 40)}...` : `${item.Message.substring(0, 25)}`}
                        </h6>
                      </div>
                    </div>
                    <hr /></>)) : ''}

                {/* <div className="col drop-msg d-flex align-items-start ms-3 col-12">
                   <div className="col-3">
                     <img src={img} alt="" />
                   </div>
                   <div className="col-9">
                     <h6 className="noti-h">Rohit Kumar</h6>
                     <h6 className="noti">
                       Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                     </h6>
                   </div>
                 </div>  */}
                {/* <div className="">
                  {" "}
                  <hr />
                  <h6 className="text-center">View All</h6>
                </div> */}
              </ul>
            </div>
          </div>

          <div className="icon white" style={{ position: "relative" }}>
            <div className="btn-group">
              <button
                type="button"
                className="btn dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ position: "relative" }}
                onClick={handleOutOfStockClick}
              >
                <FaBell size="19px" />
                {outOfStockCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "#ff4d4f",
                      color: "#fff",
                      borderRadius: "12px",
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 4px",
                      fontSize: "10px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                      pointerEvents: "none",
                    }}
                  >
                    {outOfStockCountLabel}
                  </span>
                )}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <div className="notification">
                  <h6 style={{ position: "relative", top: "10px" }}>Stock Alerts</h6>
                </div>
                <hr />
                {outOfStockLoading ? (
                  <p className="text-muted mb-0 px-3" style={{ fontSize: "13px" }}>
                    Loading alerts...
                  </p>
                ) : outOfStockCount > 0 ? (
                  outOfStockProducts.map((item, index) => {
                    const itemKey =
                      item?._id ||
                      item?.id ||
                      item?.product_id ||
                      item?.productId ||
                      `${item?.product_name || "product"}-${index}`;

                    const productImageSrc = item.imageUrl || img;

                    return (
                      <React.Fragment key={itemKey}>
                        <div className="col drop-msg d-flex align-items-start ms-3 col-12">
                          <div className="col-3">
                            <img
                              src={productImageSrc}
                              alt={item?.product_name || "Product"}
                              style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px" }}
                            />
                          </div>
                          <div className="col-9">
                            <h6 className="noti-h">{item?.product_name || "Unknown product"}</h6>
                            <h6 className="noti">Product out of stock</h6>
                          </div>
                        </div>
                        <hr />
                      </React.Fragment>
                    );
                  })
                ) : (
                  <p className="text-muted mb-0 px-3" style={{ fontSize: "13px" }}>
                    All products are in stock.
                  </p>
                )}
              </ul>
            </div>
          </div>
        </div>
        <div className="userlogo">
          <img src={img} alt="qwerty" />
        </div>
        <div className="sec-center">
          <input
            className="dropdown"
            type="checkbox"
            id="dropdown"
            name="dropdown"
          />
          <label className="for-dropdown" htmlFor="dropdown">
            {userinfo?.data?.first_name || 'Admin'} {userinfo?.data?.last_name || ''}
            <AiOutlineDown />
          </label>
          <div className="section-dropdown">
            <div
              className="col sec-profile d-flex align-items-center justify-content-center mt-2 ms-1 col-12"
              style={{ flexDirection: "column" }}
            >
              <div className="col">
                <img src={img} alt="" />
              </div>
              <div className="col-12 name-drop">
                <p className="head-txt">{userinfo?.data?.first_name || 'Admin'} {userinfo?.data?.last_name || ''}</p>
                <p className="head-para">{userinfo?.data?.email || ''}</p>
              </div>
            </div>
            <ul className="p-0">
              <li>
                <NavLink to="/profiledetail">
                  <FaUserAlt /> <span>View Profile</span>{" "}
                </NavLink>
              </li>
              <li>
                <NavLink to="/accountpassword">
                  <FaCog /> <span>Account Setting</span>{" "}
                </NavLink>
              </li>
              <li>
                <NavLink to="/logactivity">
                  <FaSignature /> <span>Login Activity</span>{" "}
                </NavLink>{" "}
                <hr />
              </li>
              <li onClick={logoutevt}>
                <NavLink to="#">
                  {" "}
                  <FaEuroSign /> <span>Log Out</span>{" "}
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

















    </div> : ''
  );
};

export default Header;
