
import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-8 pt-28">
        <div className="w-full max-w-md">
            <Navbar/>
          <Outlet />
          
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
