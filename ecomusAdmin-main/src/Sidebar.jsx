import React, { useEffect } from "react";
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  useProSidebar,
} from "react-pro-sidebar";
import { GiHamburgerMenu } from "react-icons/gi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
// import img from "./assets/loginlogo.png";
import img from "./assets/Ecomus.svg";
import img1 from "./assets/dashboard.png";
import img4 from "./assets/team.png";
import img5 from "./assets/options.png";
import img8 from "./assets/brand.png";
import img9 from "./assets/logout 2.png";
import img11 from "./assets/ads.png";
import img12 from "./assets/products.png";
import img13 from "./assets/personal-information.png";
import img40 from "./assets/trolley.png";
import img43 from "./assets/completed-task.png";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { gettoken, removeToken, sohstore } from "./Localstorage/Store";
import { useState } from "react";
import axios from "axios";
import Header from "./components/Header";

const Sidebarmenu = ({ children }) => {
  const gettokinval = gettoken();
  const nvg = useNavigate();
  const logoutevt = async () => {
    removeToken();
    nvg("/");
  };
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const handleSubMenuClick = (key) => {
    setOpenSubMenu(key === openSubMenu ? null : key);
  };
  useEffect(() => {
    sohstore(false);
  }, []);
  const [hideimg, sethideimg] = useState(false);
  const { collapseSidebar } = useProSidebar();
  const hideorshow = () => {
    sethideimg(!hideimg);
    sohstore(!hideimg);
  };
  const location = useLocation();
  const result = location.pathname.substring(
    0,
    location.pathname.lastIndexOf("/")
  );
  const desiredString = location.pathname.split("/").slice(0, 2).join("/");
  if (location.pathname === "/") {
    return (
      <div
        style={{
          background:
            location.pathname === "/resetpassword" ? "#ffff" : "#F3F6FA",
        }}
      >
        {children}
      </div>
    );
  } else {
    return (
      <div style={{ display: "flex", width: "100%" }}>
        <Sidebar className="sidebarcum" defaultCollapsed="close">
          <div>
            <Menu className="nothover abc">
              <MenuItem
                className="nothover abc"
                style={{ borderBottom: "1px solid #D9D9D9" }}
                icon={
                  <GiHamburgerMenu
                    children="logobtn"
                    fontSize={23}
                    onClick={() => {
                      collapseSidebar();
                      hideorshow();
                    }}
                    color="#0C5398"
                  />
                }
              >
                {" "}
                {hideimg === true ? (
                  <img src={img} alt="qwerty" style={{ width: "80%" }} />
                ) : (
                  ""
                )}
              </MenuItem>
            </Menu>
            <Menu>
              <MenuItem
                className="nothover"
                component={<NavLink to="/dashboard" />}
                icon={
                  <Tippy content="Dashboard" placement="right">
                    <img style={{ width: "36px" }} src={img1} alt="Dashboard" />
                  </Tippy>
                }
                active={location.pathname === "/dashboard"}
              >
                {" "}
                Dashboard{" "}
              </MenuItem>

              <MenuItem
                className="nothover"
                component={<NavLink to="/userlist/0" />}
                icon={
                  <Tippy content="User" placement="right">
                    <img style={{ width: "36px" }} src={img4} alt="User" />
                  </Tippy>
                }
                active={location.pathname === "/adduser" || result === "/userlist" || result === "/edituser"}
              >
                {" "}
                User
              </MenuItem>

              <MenuItem
                className="nothover"
                component={<NavLink to="/cartlist/0" />}
                icon={
                  <Tippy content="Cart" placement="right">
                    <img style={{ width: "36px" }} src={img40} alt="Cart" />
                  </Tippy>
                }
                active={location.pathname === "/" || result === "/cartlist"}
              >
                {" "}
                Cart
              </MenuItem>

              {/*
              <NavLink
                to="/attributelist/0"
                className={
                  location.pathname === "/addattribute" ||
                  result === "/attributelist" ||
                  result === "/editattribute"
                    ? "nav active"
                    : "nav"
                }
              >
                <MenuItem
                  className="nothover"
                  icon={<img style={{width:"36px"}} src={img5} alt="qwdfgerct" />}
                >
                  {" "}
                  Attributes 
                </MenuItem>
              </NavLink>
*/}
              <MenuItem
                className="nothover"
                component={<NavLink to="/categorylist/0" />}
                icon={
                  <Tippy content="Category" placement="right">
                    <img style={{ width: "36px" }} src={img5} alt="Category" />
                  </Tippy>
                }
                active={location.pathname === "/addcategory" || result === "/categorylist" || result === "/editcategory"}
              >
                {" "}
                Category
              </MenuItem>

              <MenuItem
                className="nothover"
                component={<NavLink to="/orderlist/0" />}
                icon={
                  <Tippy content="Order" placement="right">
                    <img style={{ width: "36px" }} src={img43} alt="Order" />
                  </Tippy>
                }
                active={location.pathname === "/addorder" || result === "/orderlist" || result === "/editorder"}
              >
                {" "}
                Order
              </MenuItem>

              <MenuItem
                className="nothover"
                component={<NavLink to="/taxes" />}
                icon={
                  <Tippy content="Tax" placement="right">
                    <img style={{ width: "36px" }} src={img13} alt="Tax" />
                  </Tippy>
                }
                active={location.pathname === "/taxes"}
              >
                {" "}
                Tax
              </MenuItem>

              <MenuItem
                className="nothover"
                component={<NavLink to="/productlist/0" />}
                icon={
                  <Tippy content="Product" placement="right">
                    <img style={{ width: "36px" }} src={img12} alt="Product" />
                  </Tippy>
                }
                active={location.pathname === "/addproduct" || result === "/productlist" || result === "/editproduct"}
              >
                {" "}
                Product
              </MenuItem>

              <MenuItem
                className="nothover"
                component={<NavLink to="/bannerlist/0" />}
                icon={
                  <Tippy content="Banner" placement="right">
                    <img style={{ width: "36px" }} src={img11} alt="Banner" />
                  </Tippy>
                }
                active={location.pathname === "/addbanner" || result === "/bannerlist" || result === "/editbanner"}
              >
                {" "}
                Banner
              </MenuItem>

              <MenuItem
                className="nothover"
                component={<NavLink to="/brandlist/0" />}
                icon={
                  <Tippy content="Brand" placement="right">
                    <img style={{ width: "36px" }} src={img8} alt="Brand" />
                  </Tippy>
                }
                active={location.pathname === "/addbrand" || result === "/brandlist" || result === "/editbrand"}
              >
                {" "}
                Brand
              </MenuItem>
              {/* <NavLink
               className={
                result === "/webinfo"
                  ? "nav active"
                  : "nav"
              }
                to="/webinfo"
              >
                <MenuItem
                  className="nothover"
                  icon={<img style={{width:"36px"}} src={img13} alt="menu" />}
                >
                  {" "}
                  Webinfo 
                </MenuItem>
              </NavLink> */}


              <SubMenu
                title="Submenu 1"
                key="submenu1"
                open={openSubMenu === "submenu1"}
                onClick={() => handleSubMenuClick("submenu1")}
                icon={<img style={{ width: "36px" }} src={img13} alt="qwerct" />}
                label="Webinfo"
              >

                <MenuItem
                  component={<NavLink to="/webinfo" />}
                  style={{ paddingLeft: hideimg === true ? "72px" : "30px" }}
                  active={location.pathname === "/webinfo"}
                >
                  {" "}
                  Web Detail
                </MenuItem>

                <MenuItem
                  component={<NavLink to="/contactlist/0" />}
                  style={{ paddingLeft: hideimg === true ? "72px" : "30px" }}
                  active={location.pathname === "/contactlist" || result === "/contactlist"}
                >
                  {" "}
                  Contact Us
                </MenuItem>
              </SubMenu>

              <MenuItem
                className="nothover"
                onClick={logoutevt}
                icon={
                  <Tippy content="Log Out" placement="right">
                    <img style={{ width: "36px" }} src={img9} alt="Log Out" />
                  </Tippy>
                }
              >
                {" "}
                Log Out{" "}
              </MenuItem>
            </Menu>
          </div>
        </Sidebar>
        <div style={{ width: "100%" }}>
          <Header />
          {children}
        </div>
      </div>
    );
  }
};

export default Sidebarmenu;
