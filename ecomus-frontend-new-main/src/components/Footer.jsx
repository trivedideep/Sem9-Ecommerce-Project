import React from 'react'
import { NavLink } from 'react-router-dom'

const Footer = () => {
  return (
    <footer>
      <div className="footer1">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="footer-main">
                <div className="footer-box">
                  <div className="footer-title mobile-title">
                    <h5>about</h5>
                  </div>
                  <div className="footer-contant">
                    <div className="footer-logo">
                      <NavLink href="/Home">
                        <img src={`${process.env.PUBLIC_URL}/images/Ecomus.svg`} className="maxwidthlogo" alt="logo" />
                      </NavLink>
                    </div>
                    <p style={{ color: '#059fe2', fontWeight: '500' }}>Introducing Ecomus: Your premier online shopping destination! Explore a vast range of products from fashion to electronics. exclusive deals, and convenient shopping from home. Join our community and start celebrating every purchase today!</p>
                    {/* <ul className="paymant">
                  <li>
                    <a href="javascript:void(0)"><img src={`${process.env.PUBLIC_URL}/images/layout-1/pay/1.png`} className="img-fluid" alt="pay" /></a>
                  </li>
                  <li>
                    <a href="javascript:void(0)"><img src={`${process.env.PUBLIC_URL}/images/layout-1/pay/2.png`} className="img-fluid" alt="pay" /></a>
                  </li>
                  <li>
                    <a href="javascript:void(0)"><img src={`${process.env.PUBLIC_URL}/images/layout-1/pay/3.png`} className="img-fluid" alt="pay" /></a>
                  </li>
                  <li>
                    <a href="javascript:void(0)"><img src={`${process.env.PUBLIC_URL}/images/layout-1/pay/4.png`} className="img-fluid" alt="pay" /></a>
                  </li>
                  <li>
                    <a href="javascript:void(0)"><img src={`${process.env.PUBLIC_URL}/images/layout-1/pay/5.png`} className="img-fluid" alt="pay" /></a>
                  </li>
                </ul> */}
                  </div>
                </div>
                <div className="footer-box">
                  <div className="footer-title">
                    <h5 style={{ color: '#059fe2' }}>INFORMATION</h5>
                  </div>
                  <div className="footer-contant">
                    <ul>
                      <li><NavLink to="/about">About Us</NavLink></li>
                      <li><NavLink to="/contact">Contact Us</NavLink></li>
                      <li><NavLink to="/privacypolicy">Privacy Policy</NavLink></li>
                      <li><NavLink to="/termsconditions">Terms & Conditions</NavLink></li>
                      {/* <li>Follow &amp; exchanges</li> */}
                      {/* <li><a href="javascript:void(0)">terms &amp; conditions</a></li>
                        <li><a href="javascript:void(0)">returns &amp; exchanges</a></li>
                     <li><a href="javascript:void(0)">shipping &amp; delivery</a></li> */}
                    </ul>
                  </div>
                </div>
                <div className="footer-box">
                  <div className="footer-title">
                    <h5 style={{ color: '#059fe2' }}>Follow us</h5>
                  </div>
                  <div className="footer-contant">
                    <ul>
                      <li>
                        {/* <NavLink to="/about">Facebook</NavLink> */}
                        <a href="" style={{ position: 'relative', background: 'white', borderRadius: '50%', color: '"white"', padding: '0px 0px', display: 'flex', justifyContent: 'start', alignItems: 'center' }}><i style={{ position: 'relative', color: '#059fe2' }} className="fa-brands fa-facebook-f" />  &nbsp; Facebook</a>

                      </li>
                      <li>
                        {/* <NavLink to="/contact">Contact Us</NavLink> */}
                        <a href="https://www.facebook.com/oneuptrade/" style={{ position: 'relative', background: 'white', borderRadius: '50%', color: '"white"', padding: '0px 0px', display: 'flex', justifyContent: 'start', alignItems: 'center' }}><i style={{ position: 'relative', color: '#059fe2' }} className="fa-brands fa-instagram" /> &nbsp; Instagram</a>

                      </li>
                      {/* <li>
                   <NavLink to="/privacypolicy">Privacy Policy</NavLink> 
                  <a href="https://www.facebook.com/oneuptrade/" style={{position: 'relative', background: 'white',borderRadius: '50%', color: '"white"', padding: '0px 0px', display: 'flex', justifyContent: 'start', alignItems: 'center'}}><i style={{position: 'relative', color: '#059fe2'}} className="fa-brands fa-youtube" /> &nbsp; You Tube</a>

                    </li> */}
                      <li>
                        {/* <NavLink to="/termsconditions">Terms & Conditions</NavLink> */}
                        <a href="https://www.facebook.com/oneuptrade/" style={{ position: 'relative', background: 'white', borderRadius: '50%', color: '"white"', padding: '0px 0px', display: 'flex', justifyContent: 'start', alignItems: 'center' }}><i style={{ position: 'relative', color: '#059fe2' }} className="fa-brands fa-linkedin" /> &nbsp; Linkedin</a>

                      </li>
                      {/* <li>Follow &amp; exchanges</li> */}
                      {/* <li><a href="javascript:void(0)">terms &amp; conditions</a></li>
                        <li><a href="javascript:void(0)">returns &amp; exchanges</a></li>
                     <li><a href="javascript:void(0)">shipping &amp; delivery</a></li> */}
                    </ul>
                  </div>
                </div>
                <div className="footer-box">
                  <div className="footer-title">
                    <h5 style={{ color: '#059fe2' }}>contact us</h5>
                  </div>
                  <div className="footer-contant">
                    <ul className="contact-list">
                      <li>
                        <i className="fa fa-map-marker" />505 Silver Point,
                        Althan,
                        Bhatar, <br />
                        Surat, -<span>395017</span>
                      </li>
                      {/*<li><i class="fa fa-phone"></i>call us: <span>123-456-7898</span></li>*/}
                      <li>
                        <i className="fa fa-envelope-o" />email us:
                        deeptrivedi2002@gmail.com
                      </li>
                      {/*<li><i class="fa fa-fax"></i>fax <span>123456</span></li>*/}
                      {/* <li>
                    <div style={{display: 'flex', gap: 6, position: 'relative', alignItems: 'center'}}>
                      <span> Follow us: </span>
                      <div style={{display: 'flex', gap: 5}}>
                        <a href="https://www.facebook.com/oneuptrade/" style={{position: 'relative', background: '#4150b5', borderRadius: '50%', color: '"white"', padding: '7px 10px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><i style={{position: 'relative', color: 'white'}} className="fa-brands fa-facebook-f" /></a>
                        <a href="https://www.linkedin.com/company/oneuptrade/" style={{position: 'relative', background: '#4150b5', borderRadius: '50%', color: '"white"', padding: '7px 6px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                          <i style={{position: 'relative', color: 'white'}} className="fa-brands fa-linkedin" /></a>
                        <a href="javascript:void(0)" style={{position: 'relative', background: '#4150b5', borderRadius: '50%', color: '"white"', padding: '7px 7px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><i style={{position: 'relative', color: 'white'}} className="fa-brands fa-youtube" />
                        </a><a href="https://www.instagram.com/oneuptrade/" style={{position: 'relative', background: '#4150b5', borderRadius: '50%', color: '"white"', padding: '7px 7px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><i style={{position: 'relative', color: 'white'}} className="fa-brands fa-instagram" /></a>
                      </div>
                    </div>
                  </li> */}

                      <li>

                      </li>
                    </ul>
                  </div>
                </div>
                {/* <div className="footer-box">
              <div className="footer-title">
                <h5>Newsletter</h5>
              </div>
              <div className="footer-contant">
                <div className="newsletter-second bottomspace">
                  <div className="form-group">
                    <div className="input-group">
                      <input type="text" className="form-control" placeholder="enter full name" />
                      <span className="input-group-text"><i className="fa-solid fa-user" /></span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <input type="text" className="form-control" placeholder="enter email address" />
                      <span className="input-group-text"><i className="fa-solid fa-envelope" /></span>
                    </div>
                  </div>
                  <div className="form-group mb-0">
                    <a href="javascript:void(0)" className="btn btn-solid btn-sm">Submit Now</a>
                  </div>
                </div>
              </div>
            </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>


  )
}

export default Footer