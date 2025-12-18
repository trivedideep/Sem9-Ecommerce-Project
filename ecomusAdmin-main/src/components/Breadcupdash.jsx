import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const Breadcupdash = ({ name }) => {
  const [selected, setSelected] = useState("userlist/0");
  const nvg = useNavigate();
  return (
    <div
      className="dashboard"
      style={{ width: "100%" }}
    >
      <div className="row d-flex justify-content-between">
        <div className="col-6"><p style={{ fontWeight: '700', fontSize: '22px', margin: '0px' }}>Dashboard</p></div>
        <div className="col-6">
          <div className="d-flex justify-content-end" style={{ gap: "11px" }}>
            <div className="_width_57">
              <select
                name="filter"
                id="filter"
                className="form-select"
                aria-label="Default select example"
                value={selected}
                onChange={e => setSelected(e.target.value)}
              >
                <option value="userlist/0">Customer</option>
                <option value="orderlist/0">Order</option>
                <option value="cartlist/0">Cart</option>
                <option value="wishlist/0">Wishlist</option>
                <option value="productlist/0">Product</option>

              </select>
            </div>
            <div className="_width_20 addnew">
              <button className="btn text-white customcolor2" onClick={() => nvg(`/${selected}`)}>
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};
export default Breadcupdash;
