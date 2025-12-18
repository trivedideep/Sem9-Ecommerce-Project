import Breadcup from '../../components/Breadcup'
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Editprofile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        dob: '',
        mobile: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch current user data
        async function fetchUserData() {
            try {
                const tokenData = localStorage.getItem('ecomustoken');
                let token = tokenData;
                
                // Parse token if it's stored as JSON object
                try {
                    const parsedData = JSON.parse(tokenData);
                    token = parsedData.token || tokenData;
                } catch (e) {
                    // If parsing fails, use as-is
                    token = tokenData;
                }
                
                let url = `${process.env.REACT_APP_API_URL}user/userinfo`;
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const userData = response?.data?.data || {};
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
                    mobile: userData.mobile || ''
                });
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to load user data");
            }
        }
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError('');
            
            const tokenData = localStorage.getItem('ecomustoken');
            let token = tokenData;
            
            // Parse token if it's stored as JSON object
            try {
                const parsedData = JSON.parse(tokenData);
                token = parsedData.token || tokenData;
            } catch (e) {
                // If parsing fails, use as-is
                token = tokenData;
            }

            // Validate required fields
            if (!formData.first_name || !formData.email || !formData.mobile || !formData.dob) {
                setError('Please fill all required fields');
                setLoading(false);
                return;
            }

            const url = `${process.env.REACT_APP_API_URL}user`;
            const response = await axios.patch(url, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === "successfully") {
                alert('Profile updated successfully!');
                navigate('/profiledetail');
            }
            setLoading(false);
        } catch (error) {
            console.error("Error saving profile:", error);
            setError(error.response?.data?.error || "Failed to update profile");
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/profiledetail');
    };

    return (
        <div style={{ width: '100%' }}>
            {/* <Header /> */}
            <div className="dashboardcontent">
                <Breadcup name={'Profile'} />
                {error && (
                    <div className="alert alert-danger mx-2 mt-3" role="alert">
                        {error}
                    </div>
                )}
                <div className="container-fuild px-2 desgin1 mt-3">
                    <div className="row bg-white ">
                        <div className="col-12 py-3 customtext23" style={{ background: 'hsla(210, 85%, 32%, 0.2)', color: '#0C5398' }}>Personal Details</div>
                    </div>
                </div>
                <div className="container-fuild px-2 pb-4 pt-3 bg-white">
                    <div className="row bg-white pb-4 round" style={{ border: '1px solid #E0E0E0', margin: "10px 0px", borderRadius: '3px' }}>
                        <div className="col-6 px-4 pt-4">
                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="" className="form-label">
                                        First Name <span style={{ color: 'red' }}>*</span>
                                    </label>
                                </div>
                                <div className="col-9">
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder='First Name'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-6 px-4 pt-4">
                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="" className="form-label">
                                        Last Name
                                    </label>
                                </div>
                                <div className="col-9">
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder='Last Name'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-6 px-4 pt-4">
                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="" className="form-label">Email <span style={{ color: 'red' }}>*</span></label>
                                </div>
                                <div className="col-9">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder='Email Address'
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-6 px-4 pt-4">
                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="" className="form-label customw">Date of Birth<span style={{ color: 'red' }}>*</span> </label>
                                </div>
                                <div className="col-9">
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder='D.O.B'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-6 px-4 pt-4">
                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="" className="form-label">Mobile No. <span style={{ color: 'red' }}>*</span></label>
                                </div>
                                <div className="col-9">
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            className="form-control"
                                            placeholder="Enter mobile number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Address, Country, State, Pincode fields hidden as they don't exist in user model */}
                        {/* <div className="col-6 px-4 pt-4">
                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="" className="form-label">Address <span style={{ color: 'red' }}>*</span></label>
                                </div>
                                <div className="col-9">
                                    <input type="text" className="form-control" placeholder='Address ' />
                                </div>
                            </div>
                        </div>
                        <div className="col-6 px-4 pt-4">
                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="" className="form-label">Country  <span style={{ color: 'red' }}>*</span></label>
                                </div>
                                <div className="col-9">
                                    <input type="number" className="form-control" placeholder='Country ' />
                                </div>
                            </div>
                        </div>
                        <div className="col-6 px-4 pt-4">
                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="" className="form-label">State  <span style={{ color: 'red' }}>*</span></label>
                                </div>
                                <div className="col-9">
                                    <input type="text" className="form-control" placeholder='State ' />
                                </div>
                            </div>
                        </div> */}
                        {/* <div className="col-6 px-4 pt-4">
                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="" className="form-label">City <span style={{ color: 'red' }}>*</span></label>
                                </div>
                                <div className="col-9">
                                    <input type="text" className="form-control" placeholder='City' />
                                </div>
                            </div>
                        </div> */}
                        {/* <div className="col-6 px-4 pt-4">
                            <div className="row">
                                <div className="col-3">
                                    <label htmlFor="" className="form-label">Pincode <span style={{ color: 'red' }}>*</span></label>
                                </div>
                                <div className="col-9">
                                    <input type="text" className="form-control" placeholder='Pincode' />
                                </div>
                            </div>
                        </div> */}

                        <div className="col-12">
                            <div className="row">
                                <div className="col-12 py-5 px-4 d-flex justify-content-end" style={{ gap: '4px' }}>
                                    <button className='btn4' onClick={handleCancel} disabled={loading}>Cancel</button>
                                    <button className='btn5' onClick={handleSave} disabled={loading}>
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Editprofile