import React, { useState } from "react";
import { fb_auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(fb_auth, email, password);
      const user = userCred.user;

      // Add user data to Firestore
      await setDoc(doc(db, "user", user.uid), {
        email: user.email,
        role: "Public"
      });

      alert("Registered successfully!");
      navigate("/login");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center lg:grid lg:grid-cols-2">
      <div className="max-lg:hidden w-full h-full bg-primary"></div>
      <div className="lg:px-40">
        <h2 className="font-bold text-2xl w-full text-center font-inter ">
          Register
        </h2>
        <div className="w-full py-2">
          <p className="font-md text-sm w-full text-left font-inter mb-2">
            Email
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full font-regular rounded-xl border border-black bg-text-box-bg text-lg py-3 px-2"
            required
          />
        </div>
        <div className="w-full py-2">
          <p className="font-md text-sm w-full text-left font-inter mb-2">
            Password
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full font-regular rounded-xl border border-black bg-text-box-bg text-lg py-3 px-2"
            required
          />
        </div>
        <div className="w-full py-2">
          <p className="font-md text-sm w-full text-left font-inter mb-2">
            Confirm Password
          </p>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full font-regular rounded-xl border border-black bg-text-box-bg text-lg py-3 px-2"
            required
          />
        </div>

        <div className="flex flex-row mb-2">
          <input type="checkbox" id="agree" name="agree" />
          <p className="text-sm font-inter px-2">
            I agree to the terms & services
          </p>
        </div>
        <button
          onClick={handleRegister}
          className="w-full rounded-full py-2 border bg-button-color text-xl font-semibold"
        >
          Register
        </button>
        {error && (
          <p className="text-red-500 py-2 w-full text-center">{error}</p>
        )}
        <p className="py-3 w-full text-center font-semibold text-sm">
          Already have an account?
          <a href="/login" style={{ color: "#3b82f6" }}>
            login
          </a>
          here
        </p>
      </div>
    </div>
  );
};

export default Register;
