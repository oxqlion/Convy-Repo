import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { useUser } from '../UserContext';
import Peer from 'peerjs';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { AiTwotoneCalendar } from "react-icons/ai";

const CourseDetail = () => {
    const { courseId } = useParams();
    const { user } = useUser(); // Get the logged-in user from the context
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [callExists, setCallExists] = useState(false);
    const [peerId, setPeerId] = useState(null);
    const remoteVideoRef = useRef(null);
    const localVideoRef = useRef(null);

    useEffect(() => {

        if (!user) {
            navigate('/login')
        }

        console.log("Course ID: ", courseId);

        const fetchCourse = async () => {
            try {
                const courseDoc = await getDoc(doc(db, 'courses', courseId));
                if (courseDoc.exists()) {
                    setCourse(courseDoc.data());
                } else {
                    setError('Course not found');
                }
            } catch (e) {
                setError('Error fetching course: ' + e.message);
                console.log(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    useEffect(() => {
        if (!user) {
            navigate('/login')
        }

        if (user.email !== course?.createdBy && course) {
            const checkCallExists = async () => {
                try {
                    const q = query(collection(db, 'calls'), where('id', '==', courseId));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        setCallExists(true);
                    }
                } catch (error) {
                    console.error("Error checking call existence: ", error);
                }
            };

            checkCallExists();
        }
    }, [course, courseId, user]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!course) {
        return <div>Course not found</div>;
    }

    const courseDateTime = new Date(`${course.courseDate}T${course.courseTime}`);
    const currentDateTime = new Date();

    const startCall = async () => {
        const callPeerId = Math.floor(100000 + Math.random() * 900000);
        setPeerId(callPeerId);
        navigate(`/meeting/${courseId}`);
    };

    const renderButton = () => {
        if (user.email === course.createdBy) {
            console.log("User is the creator of the course");
            if (currentDateTime >= courseDateTime) {
                console.log("Current date/time has passed the course date/time");
                return <button onClick={startCall}>Start Course</button>;
            } else {
                console.log("Current date/time has not yet reached the course date/time");
                return <button disabled={true}>Course will start at {course.courseDate}</button>;
            }
        } else {
            console.log("User is not the creator of the course");
            if (currentDateTime >= courseDateTime) {
                console.log("Current date/time has passed the course date/time");
                if (callExists) {
                    return <button onClick={() => navigate(`/meeting/${courseId}`)}>Join Course</button>;
                } else {
                    return <button disabled={true}>Course hasn't started yet</button>;
                }
            } else {
                console.log("Current date/time has not yet reached the course date/time");
                return <button>Save Course</button>;
            }
        }
    };

    return (
        <div>
            {/* <h1>{course.courseName || 'Course Name Not Available'}</h1>
            {course.thumbnail && <img src={course.thumbnail} alt={course.courseName} />}
            <p><strong>Teacher Name:</strong> {course.teacherName || 'Teacher Name Not Available'}</p>
            <p><strong>Teacher Background:</strong> {course.teacherBackground || 'Teacher Background Not Available'}</p>
            <p><strong>Description:</strong> {course.courseDescription || 'Description Not Available'}</p>
            <p><strong>Date:</strong> {course.courseDate || 'Date Not Available'}</p>
            <p><strong>Time:</strong> {course.courseTime || 'Time Not Available'}</p>
            <div>{renderButton()}</div> */}

            <div className="w-screen h-screen font-inter">
                <Navbar />
                <div className="w-full pt-16"></div>
                <div className="w-full h-full p-6 flex justify-center items-start py-12">
                    <div className="bg-slate-100 w-full md:w-2/3 lg:w-1/2 border border-black rounded-lg p-4">
                        <h1 className="text-2xl font-semibold mb-2">
                            {course.courseName || "Course Name Not Available"}
                        </h1>
                        <p className="text-xs mb-4">Sparx Foundation</p>
                        <img
                            src={course.thumbnail}
                            alt={course.courseName}
                            className="w-full h-64 object-cover rounded-t-lg mb-4"
                        />
                        <div className="border-b border-black mb-4"></div>
                        <div className="flex flex-row items-center mb-2">
                            <LiaChalkboardTeacherSolid className="text-3xl mr-2" />
                            <h1 className="text-xl font-semibold">Narasumber</h1>
                        </div>
                        <div className="rounded border border-black p-4 flex flex-row mb-4">
                            <img
                                src="path/to/speaker/image.jpg" // Replace with actual image path
                                alt="Speaker"
                                className="w-16 h-16 rounded-full mr-4"
                            />
                            <div className="flex flex-col justify-center">
                                <h1 className="text-md font-semibold">
                                    {course.teacherName || "Teacher Name Not Available"}
                                </h1>
                                <p className="text-xs">
                                    {course.teacherBackground || "Teacher Background Not Available"}
                                </p>
                            </div>
                        </div>
                        <h1 className="text-xl font-semibold mb-2">Informasi Kelas</h1>
                        <p className="text-sm mb-4">
                            {course.courseDescription || "Description Not Available"}
                        </p>
                        <h2 className="text-xs font-semibold mb-2 flex items-center pb-5">
                            <AiTwotoneCalendar className="mr-2 text-xl" />
                            {course.courseDate || "Date Not Available"}, {course.courseTime || "Time Not Available"}
                        </h2>
                        <div className="flex w-full gap-2">
                            <button className="bg-primary text-white w-full py-1 px-4 rounded-md border border-black flex-grow">
                                {/* Ikut Sekarang */}
                                {renderButton()}
                            </button>
                            {/* <button className="bg-gray-200 text-black w-full py-1 px-4 rounded-md border border-black flex-grow">
                                Simpan
                            </button> */}
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default CourseDetail;
