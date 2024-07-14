import React, { useState } from "react";
import { db, fb_auth } from "../firebaseConfig";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const TeacherRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
    role: "Teacher",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, ...otherData } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        fb_auth,
        email,
        password
      );
      const user = userCredential.user;

      await addDoc(collection(db, "teachers"), {
        ...otherData,
        email,
      });

      await setDoc(doc(db, "user", user.uid), {
        email: user.email,
        role: "Teacher",
      });

      console.log("Form Data Submitted:", formData);
      alert("Registration successful");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        password: "",
        confirmPassword: "",
        role: "Teacher",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error adding document");
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center lg:grid lg:grid-cols-2">
      <div className="max-lg:hidden w-full h-full bg-primary"></div>
      <div className="lg:px-40">
        <h2 className="font-bold text-2xl w-full text-center font-inter mb-4">
          Teacher Registration
        </h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="w-full py-2">
            <p className="font-md text-sm w-full text-left font-inter mb-2">
              Name
            </p>
            <input
              className="w-full font-regular rounded-xl border border-black bg-text-box-bg text-lg py-3 px-2"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-full py-2">
            <p className="font-md text-sm w-full text-left font-inter mb-2">
              Email
            </p>
            <input
              className="w-full font-regular rounded-xl border border-black bg-text-box-bg text-lg py-3 px-2"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-full py-2">
            <p className="font-md text-sm w-full text-left font-inter mb-2">
              Confirm Password
            </p>
            <input
              className="w-full font-regular rounded-xl border border-black bg-text-box-bg text-lg py-3 px-2"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-full py-2">
            <p className="font-md text-sm w-full text-left font-inter mb-2">
              Phone Number
            </p>
            <input
              className="w-full font-regular rounded-xl border border-black bg-text-box-bg text-lg py-3 px-2"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="w-full py-2">
            <p className="font-md text-sm w-full text-left font-inter mb-2">
              Company Origin
            </p>
            <input
              className="w-full font-regular rounded-xl border border-black bg-text-box-bg text-lg py-3 px-2"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-row mb-4">
            <input type="checkbox" id="agree" name="agree" />
            <p className="text-sm font-inter px-2 py-2">
              I agree to the terms & services
            </p>
          </div>
          <button
            className="w-full rounded-full mt-2 py-2 border border-black bg-button-color text-white text-xl font-semibold"
            type="submit"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherRegister;
