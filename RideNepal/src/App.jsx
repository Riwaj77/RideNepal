import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Verify from './Verify';
import Home from './Home';
import Homepage from './Homepage';
import Menu from './Menu';
import Personaldetails from './personaldetails';
import RiderProfile  from './RiderProfile';
import DriverRegister  from './DriverRegister';
import EditPersonaldetails from './Editpd';
import Wallet from './Wallet';
import Aboutus from './Aboutus';
import EditUser from './admin/edituser'
import RideHistory from './RideHistory';
import Help from './Help';
import AdminDashboard from './admin/AdminDashboard';
import EditRider from './admin/editriders';
import AdminLogin from './admin/ad_login'
import RideBooking from './RideBooking';
import LiveTracking from './LiveTracking';
import RiderLogin from './RiderLogin';
import RiderVerify from './RiderVerify';
import RiderHome from './RiderHome';
import RiderWallet from './RiderWallet';
import RiderHistory from './RiderHistory';
import EditRiderProfile from './Editrp';
import RiderTracking from './RiderTracking';
import ContactUs from './ContactUs';
import ErrorBoundary from './ErrorBoundary';

function App() {
  // State to control the menu overlay
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to toggle the menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Create the router and define your routes
  const router = createBrowserRouter([
    {
      path: "/login", // Login route
      element: <Login />,
    },
    {
      path: "/riderlogin", // Driver login route
      element: <RiderLogin />,
    },
    {
      path: "/riderverify", // Rider verification route
      element: <RiderVerify />,
    },
    {
      path: "/riderhome",
      element: <RiderHome />,
    },
    {
      path: "/ridertracking/:rideId",
      element: <ErrorBoundary><RiderTracking /></ErrorBoundary>,
    },
    {
      path: "/rider-tracking",
      element: <ErrorBoundary><RiderTracking /></ErrorBoundary>,
    },
    {
      path: "/riderwallet", // Rider wallet route
      element: <RiderWallet />,
    },
    {
      path: "/riderhistory", // Rider history route
      element: <RiderHistory />,
    },
    {
      path: "/rider/editprofile", // Rider profile route
      element: <EditRiderProfile />,
    },
    {
      path: "/signup", // Signup route
      element: <Signup />,
    },
    {
      path: "/verify",
      element: <Verify />,
    },
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/help",
      element: <Help />,
    },
    {
      path: "/contact-us",
      element: <ContactUs />,
    },
    {
      path: "/ridehistory",
      element: <RideHistory />,
    },
    {
      path: "/home",
      element: (
        <>
          <Homepage toggleMenu={toggleMenu} />
          {isMenuOpen && <Menu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />}
        </>
      ),

    },
    {
      path: "/menu",
      element: <Menu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />,
    },
    {
      path: "/personaldetails",
      element: <Personaldetails />,
    },
    {
      path: "/RiderProfile",
      element: <RiderProfile />,
    },
    {
      path: "/DriverRegister",
      element: <DriverRegister />,
    },
    {
      path: "/Editpersonaldetails",
      element: <EditPersonaldetails />,
    },
    {
      path: "/wallet",
      element: <Wallet />,
    },
    {
      path: "/about",
      element: <Aboutus />,
    },
    
      //Admin panel
      {
        path: "/admin/login",
        element: <AdminLogin />,
        },
      {
        path: "/edituser",
        element: <EditUser />,
        },
        {
          path: "/editrider",
          element: <EditRider />,
          },
          {
            path: "/adDashboard",
            element: <AdminDashboard />,
            },
    {
      path: "/book-ride",
      element: <RideBooking />,
    },
    {
      path: "/live-tracking",
      element: <ErrorBoundary><LiveTracking /></ErrorBoundary>,
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;