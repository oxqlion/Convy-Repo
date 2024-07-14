import React, { useState, useEffect } from "react";
import { fb_auth, db } from "./firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { useUser } from "./UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user data is in session storage on component mount
    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      navigate('/')
    }
  }, [setUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(
        fb_auth,
        email,
        password,
      );
      const user = userCred.user;

      const q = query(
        collection(db, "user"),
        where("email", "==", user.email),
      );
      const querySnapshot = await getDocs(q);
      console.log(querySnapshot);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData)); // Store user data in session storage

        if (userData.role === "Teacher") {
          navigate("/dashboard-teacher");
        } else {
          // Redirect to another route if needed
          setUser(user);
          sessionStorage.setItem('user', JSON.stringify(userData)); // Store user data in session storage
          navigate("/");
        }
      } else {
        console.log("User role not found");
        navigate("/");
      }

      alert("Logged in successfully!");
    } catch (error) {
      setError("Error : " + error.message);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center lg:grid lg:grid-cols-2">
      <div className="max-lg:hidden w-full h-full bg-primary"></div>
      <div className="lg:px-40">
        <h2 className="font-bold text-2xl w-full text-center font-inter ">
          Login
        </h2>
        <div className="w-full py-2">
          <p className="font-md text-sm w-full text-left font-inter mb-2">
            Email
          </p>
          <input
            className="w-full font-regular rounded-xl border border-black bg-text-box-bg text-lg py-3 px-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="w-full py-2">
          <p className="font-md text-sm w-full text-left font-inter mb-2">
            Password
          </p>
          <input
            className="w-full font-regular rounded-xl border border-black bg-text-box-bg text-lg py-3 px-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="w-full py-2">
          <div className="flex flex-row mb-2">
            <input type="checkbox" id="agree" name="agree" />
            <p className="text-sm font-inter px-2">
              I agree to the terms & services
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full rounded-full py-2 border bg-button-color text-white text-xl font-semibold"
          >
            Login
          </button>

          {error && (
            <p className="text-red-500 py-2 w-full text-center">{error}</p>
          )}
          <p className="py-3 w-full text-center font-semibold text-sm">
            don't have an account?
            <a href="/register" style={{ color: "#3b82f6" }}>
              register
            </a>
            here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
