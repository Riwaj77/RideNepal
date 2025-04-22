import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./personaldetails.css";
import "./Editpd.css";

export default function Editpd({ toggleMenu }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(location.state?.user || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!location.state?.user) {
      navigate("/personaldetails");
    }
  }, [location.state, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]); // Store selected file
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) return null; // No new image uploaded

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "your_upload_preset"); // Replace with your Cloudinary preset

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dkrtmcbay/image/upload", // Replace with your Cloudinary URL
        formData
      );
      return response.data.secure_url; // Get uploaded image URL
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Image upload failed. Please try again.");
      return null;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
        setLoading(false);
        setError("No token found. Please log in.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("firstname", userData.firstname);
        formData.append("lastname", userData.lastname);
        formData.append("email", userData.email);
        formData.append("phone", userData.phone);

        if (imageFile) {
            formData.append("image", imageFile);
        }

        await axios.put(`http://localhost:4000/user/${userData._id}`, formData, {
            headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            },
        });

        alert("Saved successfully!");
        navigate("/personaldetails");
    } catch (error) {
        setError("Failed to update. Please try again.");
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="pd_main-container">
      <header className="header">
        <div className="black-blue-logo"></div>
        <div className="group" />
        <div className="material-symbols-menu" onClick={toggleMenu} />
        <Link to="/book-ride" className="book-ride">Book a Ride</Link>
        <Link to="/about" className="about">About</Link>
        <Link to="/contact-us" className="contact-us">Contact Us</Link>
        <Link to="/home" className="pd_home">Home</Link>
      </header>

      <div className="pd_profile-setting">
        <div className="pd_flex-row-cb">
          <span className="pd_email">Email</span>
          <span className="pd_phone-number">Phone Number</span>
          <div className="pd_rectangle" />
          <div className="pd_rectangle-2" />
          <span className="pd_profile-3">Edit Profile</span>

          <Link to="/personaldetails">
             <span className="pd_ep-back" />
           </Link>

          {/* Profile Image */}
          <div className="pd_ellipse">
            {userData.image && <img src={userData.image} alt="Profile" className="pd_user-profile-img" />}
          </div>

          {/* Image Upload */}
          <input type="file" accept="image/*" onChange={handleImageChange} className="pd_user-profile" />

          {/* <div className="pd_user-profile" /> */}
          <div className="pd_group-4">
            <span className="pd_barsha-maharjan">{userData.firstname} {userData.lastname}</span>
            <span className="pd_barsha-email">{userData.email}</span>
          </div>

          <input className="pd_rectangle-6" placeholder="First Name" name="firstname" value={userData.firstname || ''} onChange={handleInputChange} />
          <input className="pd_rectangle-7" placeholder="Last Name" name="lastname" value={userData.lastname || ''} onChange={handleInputChange} />
          <input className="pd_rectangle-8" placeholder="Email" name="email" value={userData.email || ''} onChange={handleInputChange} />
          <input className="pd_rectangle-a" placeholder="Phone" name="phone" value={userData.phone || ''} onChange={handleInputChange} />

          <button className="pd_button-frame" onClick={handleSave} disabled={loading}>
            <span className="pd_save">{loading ? "Saving..." : "Save"}</span>
          </button>

          <Link to='/personaldetails'>
            <button className="pd_button-frame-1">
              <span className="pd_cancel">Cancel</span>
            </button>
          </Link>
        </div>
      </div>

      <footer className="footer">
        <span className="all-rights-reserved">© 2024 RideNepal. All Rights Reserved.</span>
      </footer>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
