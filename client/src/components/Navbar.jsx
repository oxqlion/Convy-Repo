import React, { useState, useEffect } from "react";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user data is in session storage on component mount
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [setUser]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="fixed w-full bg-slate-50 border-b border-black z-50">
      <div className="w-full flex flex-row justify-between items-center px-6 py-4">
        <h2 className="text-3xl font-bold text-primary font-inter">Convy</h2>
        <div className="flex items-center space-x-6">
          {user ? (
            <button
              onClick={handleLogout}
              className="hidden md:block border border-black focus:outline-none bg-red-500 p-2 rounded-lg text-white font-semibold hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          ) : (
            <div className="flex space-x-2">
              <a
                href="/login"
                className="border border-black focus:outline-none bg-primary p-2 rounded-lg text-white font-semibold hover:bg-blue-500 transition duration-300"
              >
                Login
              </a>
              <a
                href="/register"
                className="border border-black focus:outline-none bg-blue-500 p-2 rounded-lg text-white font-semibold hover:bg-blue-700 transition duration-300"
              >
                Register
              </a>
            </div>
          )}
          <button
            className="md:hidden block border border-black focus:outline-none bg-primary p-4 rounded-lg"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              fill="white"
              stroke="white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <ul
        className={`${isMenuOpen ? "block" : "hidden"
          } md:hidden flex flex-col items-left space-y-6 pb-4 text-primary duration-300 ease-in-out font-inter transform px-8 font-semibold ${isMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        {user ? (
          <li className="flex justify-between">
            <h1 className="text-black border border-black focus:outline-none bg-secondary p-2 rounded-lg font-semibold hover:opcaity-50 transition duration-300">Hello, {user.email}</h1>
            <button
              onClick={handleLogout}
              className="border border-black focus:outline-none bg-red-500 p-2 rounded-lg text-white font-semibold hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          </li>
        ) : (
          <li className="flex justify-center">
            <a
              href="/login"
              className="border border-black focus:outline-none bg-primary p-2 rounded-lg text-white font-semibold hover:bg-blue-500 transition duration-300"
            >
              Login
            </a>
            <a
              href="/register"
              className="border border-black focus:outline-none bg-blue-500 p-2 rounded-lg text-white font-semibold hover:bg-blue-700 transition duration-300 ml-2"
            >
              Register
            </a>
          </li>
        )}
        <li className="hover:text-blue-500 cursor-pointer">Home</li>
        <li className="hover:text-blue-500 cursor-pointer">Class</li>
        <li className="hover:text-blue-500 cursor-pointer">Contacts</li>
        <li className="hover:text-blue-500 cursor-pointer">About Us</li>
      </ul>
    </div>
  );
};

export default Navbar;
