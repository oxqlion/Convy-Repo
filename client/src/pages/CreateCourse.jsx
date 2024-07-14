import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const CreateCourse = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        console.log(user)
    }, [])

    const [courseName, setCourseName] = useState('');
    const [teacherName, setTeacherName] = useState('');
    const [teacherBackground, setTeacherBackground] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [courseDate, setCourseDate] = useState('');
    const [courseTime, setCourseTime] = useState('');
    const [courseDuration, setCourseDuration] = useState('');
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let thumbnailURL = null;

            if (thumbnail) {
                const storageRef = ref(storage, `thumbnails/${thumbnail.name}`);
                await uploadBytes(storageRef, thumbnail);
                thumbnailURL = await getDownloadURL(storageRef);
            }

            const courseData = {
                courseName, // "courseName" : "nama course"
                teacherName,
                teacherBackground,
                courseDescription,
                courseDate,
                courseTime,
                courseDuration,
                thumbnail: thumbnailURL,
                createdBy: user.email // Save the user email
            };

            await addDoc(collection(db, 'courses'), courseData);

            setCourseName('');
            setTeacherName('');
            setTeacherBackground('');
            setCourseDescription('');
            setCourseDate('');
            setCourseTime('');
            setCourseDuration('');
            setThumbnail(null);
            setLoading(false);
            alert('Course created successfully!');

            navigate('/dashboard-teacher'); // Corrected route
        } catch (e) {
            setLoading(false);
            setError('Error adding document: ' + e.message);
        }
    };

    const handleThumbnailChange = (e) => {
        setThumbnail(e.target.files[0]);
    };

    return (
        <div>
            <h1>Create Course</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Course Name:</label>
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Teacher Name:</label>
                    <input
                        type="text"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Teacher Background:</label>
                    <input
                        type="text"
                        value={teacherBackground}
                        onChange={(e) => setTeacherBackground(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Course Description:</label>
                    <textarea
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Course Date:</label>
                    <input
                        type="date"
                        value={courseDate}
                        onChange={(e) => setCourseDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Course Time:</label>
                    <input
                        type="time"
                        value={courseTime}
                        onChange={(e) => setCourseTime(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Course Duration (in hours):</label>
                    <input
                        type="number"
                        value={courseDuration}
                        onChange={(e) => setCourseDuration(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Thumbnail:</label>
                    <input
                        type="file"
                        onChange={handleThumbnailChange}
                        accept="image/*"
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>Create Course</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
};

export default CreateCourse;
