import React, { useRef, useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";

import Navbar from "./components/Navbar";
import Searchbar from "./components/Searchbar";
import CourseCard from "./components/CourseCard";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Footer from "./components/Footer";
import { FaStar } from "react-icons/fa";
import "./index.css";
import CourseCardBig from "./components/CourseCardBig";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

const Home = () => {
  const { setUser } = useUser()
  const navigate = useNavigate()
  const [allCourse, setAllCourse] = useState([]);

  useEffect(() => {
    // Check if user data is in session storage on component mount
    const userData = sessionStorage.getItem('user');
    if (userData) {
      console.log("User data : ", userData)
      setUser(JSON.parse(userData));
    } else {
      navigate('/login')
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      const q = query(collection(db, "courses"));
      const querySnapshot = await getDocs(q);
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllCourse(coursesData);
    };

    fetchCourses();
  }, []);

  const carouselRef = useRef(null);
  const carouselRef2 = useRef(null);

  const scrollLeft1 = () => {
    carouselRef.current.scrollBy({
      left: -carouselRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  const scrollRight1 = () => {
    carouselRef.current.scrollBy({
      left: carouselRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  const scrollLeft2 = () => {
    carouselRef2.current.scrollBy({
      left: -carouselRef2.current.offsetWidth,
      behavior: "smooth",
    });
  };

  const scrollRight2 = () => {
    carouselRef2.current.scrollBy({
      left: carouselRef2.current.offsetWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-screen h-screen">
      <Navbar />
      <div className="w-full pt-20 bg-primary pb-2">
        <h1 className="text-white text-left text-3xl font-inter font-semibold px-8 pt-10 pb-4 mr-10">
          What Skill Do You Want To Learn Today?
        </h1>
        <h2 className="text-gray-300 px-8">Learn together with new friends!</h2>
        <Searchbar />
      </div>
      <div className="w-full mt-6">
        <div className="flex flex-row justify-between items-center mb-4 px-8">
          <div className="flex flex-row gap-2">
            <FaStar className="text-2xl text-yellow-500" />
            <h1 className="font-inter text-xl text-left font-bold">
              Popular Classes
            </h1>
          </div>
          <div className="flex flex-row space-x-2">
            <button onClick={scrollLeft1} className="bg-transparent text-3xl">
              <IoIosArrowDropleft />
            </button>
            <button onClick={scrollRight1} className="bg-transparent text-3xl">
              <IoIosArrowDropright />
            </button>
          </div>
        </div>
        <div
          ref={carouselRef}
          className="px-6 overflow-x-auto flex space-x-4 pb-4 scroll-smooth"
        >
          {allCourse.map((course, index) => (
            <Link
              key={index}
              to={`/course/${course.id}`}
            >
              <CourseCard
                title={course.courseName}
                description={course.courseDescription}
                image={course.thumbnail}
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="w-full mt-4">
        <div className="flex flex-row justify-between items-center mb-4 px-8">
          <div className="flex flex-row gap-2">
            <h1 className="font-inter text-xl text-left font-bold">Live Now</h1>
          </div>
          <div className="flex flex-row space-x-2">
            <button onClick={scrollLeft2} className="bg-transparent text-3xl">
              <IoIosArrowDropleft />
            </button>
            <button onClick={scrollRight2} className="bg-transparent text-3xl">
              <IoIosArrowDropright />
            </button>
          </div>
        </div>
        <div
          ref={carouselRef2}
          className="px-6 overflow-x-auto flex space-x-4 pb-4 scroll-smooth"
        >
          {allCourse.map((course, index) => (
            <Link
              key={index}
              to={`/course/${course.id}`}
            >
              <CourseCard
                title={course.courseName}
                description={course.courseDescription}
                image={course.thumbnail}
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="w-full mt-4">
        <div className="flex flex-row justify-between items-center mb-4 px-8">
          <div className="flex flex-row gap-2">
            <h1 className="font-inter text-xl text-left font-bold">
              Other Classes
            </h1>
          </div>
        </div>
      </div>
      <div className="flex flex-col mx-8 gap-4 mb-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <CourseCardBig />
        <CourseCardBig />
        <CourseCardBig />
        <CourseCardBig />
        <CourseCardBig />
        <CourseCardBig />
        <CourseCardBig />
        <CourseCardBig />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
