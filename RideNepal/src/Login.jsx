// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./Login.css";

// export default function Login() {
//   const [phone, setPhone] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Making the API request to check phone number
//     axios.post("http://localhost:4000/logins", { phone })
//       .then((response) => {
//         console.log(response.data);
//         navigate("/verify"); // Redirect to the verification page (assuming you want to verify after login)
//       })
//       .catch((err) => {
//         console.log(err);
//         if (err.response && err.response.data) {
//           setErrorMessage(err.response.data.message); // Show error message if phone not registered
//         }
//       });
//   };

//   return (
//     <div className="login-main-container">
//       <div className="login-login-1">
//         <div className="login-flex-row-ec">
//           <div className="login-frame">
//             <div className="login-yellow-white-modern"></div>
//           </div>
//           <div className="login-frame-2">
//             <span className="login-3">Login</span>
//           </div>
//           <button className="login-group">
//             <div className="login-frame-4">
//               <span> <Link to="/verify" className="login-next">Login</Link></span>
//             </div>
//           </button>
//         </div>
//         <div className="login-flex-row-b">
//           <div className="login-black-blue-minimalist"></div>
//           <div className="login-group-5">
//             <span className="login-ride-nepal">RideNepal</span>
//           </div>
//           <div className="login-black-blue-minimalist-6"></div>
//         </div>
//         <span className="login-access">Login to access your RideNepal account</span>
//         <div className="login-flex-row-dbc">
//           <span className="login-enter-mobile-number">Enter your mobile number</span>
//           <button className="login-button-group">
//             <input
//               className="login-plus"
//               placeholder="+977"
//               value="+977"
//               disabled
//             />
//             <div className="login-nepal"></div>
//           </button>
//           <div className="login-group-7">
//             <input
//               className="login-number"
//               placeholder="##########"
//               maxLength={10}
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//             />
//           </div>
//         </div>
//         {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Show error message */}
//         <div className="login-group-9">
//           <span className="login-not-registered-yet">Not registered yet?</span>
//           <div className="login-group-a">
//             <span>
//               <Link to="/signup" className="login-register-now"> Register Now</Link>
//             </span>
//           </div>
//         </div>
//         <button className="login-button-group" onClick={handleSubmit}>
//           Login
//         </button>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    // Make the API request to check phone number
    axios.post("http://localhost:4000/logins", { phone })
      .then((response) => {
        console.log(response.data);
        navigate("/verify"); // Redirect to the verification page
      })
      .catch((err) => {
        console.log(err);
        if (err.response && err.response.data) {
          alert(err.response.data.message); // Show error message if phone not found
        }
      });
  };

  return (
    <div className="login-main-container">
      <div className="login-login-1">
        <div className="login-flex-row-ec">
          <div className="login-frame">
            <div className="login-yellow-white-modern"></div>
          </div>
          <div className="login-frame-2">
            <span className="login-3">Login</span>
          </div>
        </div>
        <div className="login-flex-row-b">
          <div className="login-black-blue-minimalist"></div>
          <div className="login-group-5">
            <span className="login-ride-nepal">RideNepal</span>
          </div>
          <div className="login-black-blue-minimalist-6"></div>
        </div>
        <span className="login-access">Login to access your RideNepal account</span>
        <div className="login-flex-row-dbc">
          <span className="login-enter-mobile-number">Enter your mobile number</span>
          <button className="login-button-group">
            <input
              className="login-plus"
              placeholder="+977"
              value="+977"
              disabled
            />
            <div className="login-nepal"></div>
          </button>
          <div className="login-group-7">
            <input
              className="login-number"
              placeholder="##########"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* This is the actual Login Button */}
        <div className="login-group">
          <button className="login-frame-4" onClick={handleSubmit}>Login</button>
        </div>

        <div className="login-group-9">
          <span className="login-not-registered-yet">Not registered yet?</span>
          <div className="login-group-a">
            <span>
              <Link to="/signup" className="login-register-now"> Register Now</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
