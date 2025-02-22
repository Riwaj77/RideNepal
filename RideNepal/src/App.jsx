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
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;