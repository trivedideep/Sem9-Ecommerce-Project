import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { gettoken, removeToken } from "../../Localstorage/Store";
import Nav from "./Nav";
import { useGetCartCountQuery , useGetCartProductQuery } from "../../store/api/cartapi";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../store/state/cart";
import { useGetWishlistCountQuery } from "../../store/api/wishlistapi";
import { addwishlist } from "../../store/state/wishlist";
import axios from "axios";
import { useGetProductBySearchQuery } from "../../store/api/productapi";
import { useGetUserInfoQuery } from "../../store/api/userapi";

const Header = () => {
  const [showsidebar, setshowsidebar] = useState(false);
  const location = useLocation();
  const searchRef = useRef(null)
  const [serchvalue, setserchvalue] = useState('');
  const [searchdata, setsearchdata] = useState([]);
  const [showrecords, setshowrecords] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Call gettoken() defensively to avoid crashes when localStorage value is missing/invalid. 
  // If gettoken() throws or returns undefined, checktoken will be null and the rest of the UI continues to work.
  let checktoken = null;
  try {
    const tk = gettoken();
    checktoken = tk ??  null;
  } catch (err) {
    // don't break the app if localStorage is malformed — keep behavior unchanged for logged-in users
    console.warn("gettoken() failed in Header — treating as not-logged-in:", err);
    checktoken = null;
  }

  const pagename = location.pathname
  const nvg = useNavigate();
  const dispatch = useDispatch();
  const gobalvariable = useSelector(state => state);
  const redirectfun = (linkpage) => {
    nvg(linkpage);
  };
  const closesidebar = () => {
    setshowsidebar(false);
  };
  const { data: cartcount, isLoading, refetch } = useGetCartCountQuery();
    const {  refetch: cartlistRefrsh } = useGetCartProductQuery()

  const { data: wishlistcount, isLoading: wislistloading, refetch: wishlistrefetch } = useGetWishlistCountQuery()

  // Fetch user info only if user is logged in
  const { data: userinfo, isLoading:  userinfoLoading, refetch: refetchUser } = useGetUserInfoQuery(undefined, {
    skip: !checktoken, // Skip query if user is not logged in
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: checktoken ? 15000 : 0,
  })

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef. current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  console.log("global state is here ", gobalvariable)

  const transfer = (productid, pname) => {
    // nvg(`/productdetails/${productid}`, {
    //   // state: {
    //   //   id:  productid,
    //   //   pname: pname,
    //   // },
    // });
    nvg(`/productdetails/${productid}`);
  }

  const { data: searchapidata, isLoading: searchloading, refetch: refetchsearch, isError } = useGetProductBySearchQuery(serchvalue)
  console.log("eeddeeeeeee", isError)
  const searchresult = async (value) => {
    // console.log("kdkdd",searchapidata)
    //     if(value == undefined || value == null || value == ''){     
    //       refetchsearch()
    //     }else{
    refetchsearch()

    // setsearchdata(response.data.data)

    // }
  }


  useEffect(() => {
    if (isLoading === false && wislistloading === false && cartcount?. totalItems !== undefined && wishlistcount?.totalItems !== undefined) {
      dispatch(addItem(cartcount.totalItems));
      dispatch(addwishlist(wishlistcount.totalItems));
    }
  }, [isLoading, cartcount, wislistloading, wishlistcount])

  const logoutfunction = () => {
    removeToken();
    setShowDropdown(false);
    nvg("/");
  };

  useEffect(() => {
    refetch();
    cartlistRefrsh();
  }, [gobalvariable. cart])

  const handleProfileClick = () => {
    if (checktoken) {
      setShowDropdown(! showDropdown);
    } else {
      nvg('/login');
    }
  };

  const handleProfileNavigation = () => {
    nvg("/profile", { state: { id: 1 } });
    setShowDropdown(false);
  };


  return (
    <header className="fixed-top" style={{ position: "fixed" }}>
      {/* top header start here  */}
      <div className="header7">
        <div className="custom-container">
          <div className="row">
            <div className="col-12">
              <div className="header-contain ">
                <div className="logo-block logowidth">
                  <div
                    className="mobilecat-toggle"
                    onClick={() => setshowsidebar(true)}
                  >
                    {" "}
                    <i className="fa fa-bars sidebar-bar" />
                  </div>
                  <div className="brand-logo logo-sm-center">
                    <NavLink to="/home">
                      <img
                        src={`${process.env.PUBLIC_URL}/images/Ecomus.svg`}
                        className="img-fluid"
                        alt="logo"
                      />
                    </NavLink>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <div
                    ref={searchRef}
                    className="header-search ajax-search the-basics dflex"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #cbc7c7",
                      padding: "0px 3px",
                    }}
                  >
                    <div
                      className="input-group"
                      style={{ border: "1px solid white" }}
                    >
                      <input
                        type="text"
                        className="form-control newsizeinput"
                        style={{
                          border: "1px solid white",
                          background: "white",
                          borderRadius: "25px",
                          overflowX: 'hidden',
                          padding: 0,
                          fontSize: '15px',
                          letterSpacing: 0,
                        }}
                        value={serchvalue}
                        onChange={(e) => { searchresult(e.target. value); setserchvalue(e.target. value); setshowrecords(true) }}
                        // onBlur={()=>{setshowrecords(false);searchresult([]);setserchvalue('')}}
                        placeholder="Search Product"
                      />
                    </div>
                    <div
                      className="input-group-text btn "
                      style={{
                        backgroundColor: "white",
                        padding: "0px 17px",
                        borderRadius: 0,
                        display: "flex",
                        border: "none",
                      }}
                    >
                      <span className="newfontsize" onClick={() => { setshowrecords(serchvalue !== '' ? ! showrecords : false) }}>
                        {" "}
                        <i
                          className="fa fa-search "
                          style={{ color: "#059fe2" }}
                        />
                      </span>
                    </div>
                  </div>
                  <ul className="serachlisting" style={{ display: 'flex', position: 'absolute', width: '100%', flexDirection: 'column', zIndex: 4, background: "#fff", maxHeight: '60vh', overflowY: 'auto', boxShadow: '0 6px 18px rgba(0,0,0,0.12)', border: '1px solid #e9ecef', borderTop: 'none', scrollbarWidth: 'thin' }} >
                    {isError === false ? searchapidata?.results?.[0]?.product_name ?  searchapidata?.results. map((item, index) => (
                      <li key={item._id || index}>
                        <div className="p-1 d-flex" style={{ gap: "10px", cursor: 'pointer' }} onClick={() => { transfer(item._id, item. title) }} >
                          <div className="imagecontain" style={{ width: '47%' }}>
                            <img src={`http://localhost:8000/uploads/images/${item.product_image1}`} style={{ width: '100%', height: '100%' }} className="img-fluid  " alt="product" />
                          </div>
                          <div className="cartinfo">
                            <h6 style={{ fontSize: '12px', color: '#059fe2', fontWeight: '600', padding:  '3px 0px' }}>{item.product_name}</h6>
                            <h6 style={{ fontSize: '12px', color: '#059fe2', padding: '3px 0px' }}>₹{item.selling_price}</h6>
                            <p style={{
                              fontSize: '11px', color: '#059fe2', display: "-webkit-box",
                              WebkitLineClamp: "2",
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}>{item.sort_description}</p>
                          </div>
                        </div>
                      </li>
                    )) : serchvalue === '' ? '' : <li style={{ width: '100%' }}>
                      <div className="p-1 d-flex" style={{ gap: "10px", padding: '4px 0px', cursor: 'pointer', width: '100%', display: 'flex', justifyContent: 'center' }} >

                        <h6 style={{ fontSize: '14px', color: '#333', fontWeight: '600', padding: '3px 0px' }}>No Record Fount</h6>


                      </div>
                    </li> :  ''}
                  </ul>
                </div>
                <div className="icon-block">
                  <ul className="theme-color">
                    <li
                      className="mobile-user newposition2 item-count "
                      ref={dropdownRef}
                      style={{ position: 'relative' }}
                    >
                      <div
                        className="dropdown show d-flex showaccountcontent"
                        style={{ justifyContent: "end", alignItems: "end", cursor: "pointer" }}
                        onClick={handleProfileClick}
                      >
                        <div className="showaccountcontent">
                          <img
                            src={`${process.env.PUBLIC_URL}/images/mega-store/brand/profile.png`}
                            className="newwidthpro"
                            alt={404}
                          />
                          <span
                            className="mobilehide largesize"
                            style={{ color:  "black", width: "13px" }}
                          >
                            {checktoken ? (userinfo?.data?.first_name || "Account") : "Login"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Dropdown Menu */}
                      {checktoken && showDropdown && (
                        <div
                          style={{
                            position: 'absolute',
                            top:  '100%',
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            marginTop: '8px',
                            minWidth: '180px',
                            zIndex:  1000,
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            onClick={handleProfileNavigation}
                            style={{
                              padding: '12px 20px',
                              cursor: 'pointer',
                              display:  'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'background-color 0.2s',
                              borderBottom: '1px solid #f0f0f0'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <i className="fa fa-user" style={{ color: '#059fe2', fontSize: '14px' }} />
                            <span style={{ color: '#333', fontSize: '14px', fontWeight: '500' }}>Profile</span>
                          </div>
                          <div
                            onClick={logoutfunction}
                            style={{
                              padding: '12px 20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget. style.backgroundColor = 'white'}
                          >
                            <i className="fa fa-sign-out" style={{ color: '#059fe2', fontSize: '14px' }} />
                            <span style={{ color: '#333', fontSize: '14px', fontWeight:  '500' }}>Logout</span>
                          </div>
                        </div>
                      )}
                    </li>
                    <li className="mobile-wishlist item-count">
                      <button
                        type="button"
                        className="hidecontent"
                        style={{
                          border: "none",
                          outline: "none",
                          backgroundColor: "white",
                        }}
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModaltwo"
                      >
                        {" "}
                        <img
                          src={`${process.env.PUBLIC_URL}/images/mega-store/brand/search.png`}
                          className="newwidthpro"
                          alt={404}
                        />
                      </button>
                      <NavLink to="/wishlist" className="showaccountcontent">
                        {" "}
                        <img
                          src={`${process.env.PUBLIC_URL}/images/mega-store/brand/wishlist.png`}
                          className="newwidthpro"
                          alt={404}
                        />
                        <div className="item-count-contain inverce">{gobalvariable.wishlist}</div>
                      </NavLink>
                    </li>
                    <span
                      className="mobilehide largesize "
                      onClick={() => {
                        redirectfun("/wishlist");
                      }}
                      style={{
                        color: "black",
                        cursor: "pointer",
                        marginLeft: "-13px",
                        paddingLeft: 4,
                      }}
                    >
                      Wish List
                    </span>
                    <li className="mobile-cart item-count showaccountcontent">
                      <NavLink to="/cart">
                        {" "}
                        <img
                          src={`${process.env.PUBLIC_URL}/images/mega-store/brand/cart.png`}
                          className="newwidthpro"
                          alt={404}
                        />
                        <div className="item-count-contain inverce">
                          {gobalvariable.cart}
                        </div>
                      </NavLink>
                    </li>
                    <span
                      className="mobilehide largesize"
                      onClick={() => {
                        redirectfun("/cart");
                      }}
                      style={{
                        color: "black",
                        cursor: "pointer",
                        marginLeft: "-13px",
                        paddingLeft: 4,
                      }}
                    >
                      My Cart
                    </span>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="searchbar-input">
          <div className="input-group">
            <div className="input-group-append">
              <span className="input-group-text">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  width="28. 931px"
                  height="28.932px"
                  viewBox="0 0 28.931 28.932"
                  style={{ enableBackground: "new 0 0 28.931 28.932" }}
                  xmlSpace="preserve"
                >
                  <g>
                    <path d="M28.344,25.518l-6.114-6.115c1.486-2.067,2.303-4.537,2.303-7.137c0-3.275-1.275-6.355-3.594-8.672C18.625,1.278,15.543,0,12.266,0C8.99,0,5.909,1.275,3.593,3.594C1.277,5.909,0.001,8.99,0.001,12.266c0,3.276,1.275,6.356,3.592,8.674c2.316,2.316,5.396,3.594,8.673,3.594c2.599,0,5.067-0.813,7.136-2.303l6.114,6.115c0.392,0.391,0.902,0.586,1.414,0.586c0.513,0,1.024-0.195,1.414-0.586C29.125,27.564,29.125,26.299,28.344,25.518z M6.422,18.111c-1.562-1.562-2.421-3.639-2.421-5.846S4.86,7.983,6.422,6.421c1.561-1.562,3.636-2.422,5.844-2.422s4.284,0.86,5.845,2.422c1.562,1.562,2.422,3.638,2.422,5.845s-0.859,4.283-2.422,5.846c-1.562,1.562-3.636,2.42-5.845,2.42S7.981,19.672,6.422,18.111z"></path>
                  </g>
                </svg>
              </span>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="search your product"
            />
            <div className="input-group-append">
              <span className="input-group-text close-searchbar">
                <svg
                  viewBox="0 0 329. 26933 329"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* top header end here  */}


      {/* menu start here  */}
      {pagename === "/cart" || pagename === "/checkout" || pagename === "/pay" ?  "" : <Nav togglesidebar={showsidebar} closesidebar={closesidebar} />}
      {/* menu start here  */}


      {/* Search bar for mobile start here  */}
      <div
        className="modal fade"
        id="exampleModaltwo"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        style={{ zIndex: 9383838 }}
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-centered modal-xl"
          style={{
            position: "relative",
            top: "51px",
            alignItems: "flex-start",
          }}
        >
          <div
            className="modal-content"
            style={{ flexDirection: "row-reverse" }}
          >
            <div className="modal-header mod-line">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">

              <input
                type="text"
                name=""
                placeholder="Search For Product"
                style={{ width: "100%", border: "none", outline: "none" }}
                id=""
              />
            </div>
          </div>
        </div>
      </div>
      {/* Search bar for mobile end here  */}
    </header>
  );
};

export default Header;