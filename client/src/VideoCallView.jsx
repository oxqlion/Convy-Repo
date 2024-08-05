import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "peerjs";
import { db } from "./firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import "./index.css";
import axios from "axios";

const VideoCallView = () => {
  const { meetingId } = useParams();

  const [peerId, setPeerId] = useState("");
  const [teacherPeerId, setTeacherPeerId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [sentence, setSentence] = useState("Default Sentence");
  const [caption, setCaption] = useState("Defauilt Caption");

  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log("Fetching teacher peer ID...");
    const fetchTeacherPeerId = async () => {
      try {
        const callsRef = collection(db, "calls");
        const q = query(
          callsRef,
          where("courseId", "==", meetingId),
          where("status", "==", "active")
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Assuming there's only one matching document
          const docData = querySnapshot.docs[0].data();
          setTeacherPeerId(docData.teacherPeerId);
          console.log("Teacher's peer ID:", docData.teacherPeerId);
        } else {
          console.log("No matching document found for meetingId:", meetingId);
        }
      } catch (error) {
        console.error("Error fetching teacher's peer ID:", error);
      }
    };

    fetchTeacherPeerId();
  }, [meetingId]);

  useEffect(() => {
    console.log("Joining teacher room with peer ID: ", teacherPeerId);

    const peer = new Peer();
    peerInstance.current = peer;

    peer.on("open", (id) => {
      console.log("Student's peer ID from parameter is: ", id);
      setPeerId(id);
      console.log("Saved student's peer ID is: ", peerId);
      joinCall();
    });

    peer.on("error", (error) => {
      console.error("PeerJS error:", error);
    });

    setInterval(() => {
      console.log("Calling captureFrameAndSend...");
      captureFrameAndSend();
    }, 1000 / 30);

    peer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          call.answer(stream);

          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        })
        .catch((err) => {
          console.log("Something went wrong on Join Room Use Effect : ", err);
        });
    });
  }, [teacherPeerId]);

  const joinCall = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const call = peerInstance.current.call(teacherPeerId, stream);

        call.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setIsConnected(true);
          console.log("Call established with teacher: ", isConnected);
        });

        call.on("close", () => {
          setIsConnected(false);
          console.log("Call established with teacher: ", isConnected);
        });
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
      });
  };

  const captureFrameAndSend = async () => {
    console.log("Capturing frame...");

    if (!canvasRef.current || !localVideoRef.current) return;

    const canvas = canvasRef.current;
    const video = localVideoRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video frame size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Create a new canvas for the grayscale image
    const grayCanvas = document.createElement("canvas");
    grayCanvas.width = 1662;
    grayCanvas.height = 30;
    const grayContext = grayCanvas.getContext("2d");

    // Draw the original image onto the grayscale canvas, effectively resizing it
    grayContext.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      1662,
      30
    );

    // Convert the grayscale canvas to a data URL
    const frame = grayCanvas.toDataURL("image/jpeg");

    // Send the frame to the server
    try {
      console.log("Sending frame to server...");
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        frame,
      });

      if (response.data.sequence_complete) {
        const prediction = response.data.prediction;
        console.log("Prediction:", prediction);
        setSentence(response.data.sentence);

        // Update caption based on the highest probability
        const maxIndex = prediction.indexOf(Math.max(...prediction));
        const actions = [
          "hello",
          "thanks",
          "awesome",
          "ready",
          "i",
          "i love you",
        ];
        setCaption(actions[maxIndex]);
      } else {
        console.log("Sequence not complete yet...");
      }
    } catch (error) {
      console.error("Error sending frame to server:", error);
    }
  };

  if (!teacherPeerId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col p-12">
      <div className="App">
        <h1>Welcome To The Meeting</h1>
        <div>
          <button onClick={joinCall}>Call</button>
        </div>
        <div>
          <h2>Local Video</h2>
          <h1>Current Word: {caption}</h1>
          <h2>Sentence: {sentence}</h2>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "640px", height: "480px" }}
          />
          <canvas
            ref={canvasRef}
            style={{ display: "none", width: "640px", height: "480px" }}
          />
        </div>
        <div>
          <h2>Remote Video</h2>
          {/* <video ref={remoteVideoRef} autoPlay playsInline /> */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "640px", height: "480px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCallView;
