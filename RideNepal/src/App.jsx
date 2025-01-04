import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';

function App() {
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
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
