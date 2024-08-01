import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import Peer from "peerjs";
import "./index.css";

const JoinRoom = () => {
  const { callId } = useParams(); // Get courseId from URL

  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerInstance = useRef(null);

  useEffect(() => {
    const peer = new Peer();
    peerInstance.current = peer;

    peer.on("open", (id) => {
      console.log("My peer ID is: ", id);
      setPeerId(id);

      saveTeacherPeerId(id);
    });

    peer.on("error", (error) => {
      console.error("PeerJS error:", error);
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        peer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        });
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
      });

    return async () => {
      try {
        await updateDoc(doc(db, "calls", where("courseId", "==", callId)), {
          status: "ended",
          endedAt: serverTimestamp(),
        });
        console.log("Call ended for course: ", callId);
      } catch (error) {
        console.error("Error updating call status: ", error);
      }
      peer.destroy();
    };
  }, []);

  const makeCall = () => {
    const peer = peerInstance.current;
    const stream = localVideoRef.current.srcObject;
    if (!peer || !stream) {
      console.error("Peer not initialized or local stream not available");
      return;
    }

    const call = peer.call(remotePeerId, stream);
    call.on("stream", (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });
    call.on("error", (error) => {
      console.error("Call error:", error);
    });
  };

  const saveTeacherPeerId = async (teacherPeerId) => {
    try {
      const callsRef = collection(db, "calls");
      const docRef = await addDoc(callsRef, {
        courseId: callId,
        teacherPeerId: teacherPeerId,
        createdAt: serverTimestamp(),
        status: "active",
      });
      console.log("Teacher's peer ID saved for course: ", callId);
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error saving teacher's peer ID: ", error);
    }
  };

  return (
    <div className="flex flex-col p-12">
      <div className="App">
        <div>
          <h2>Your ID: {peerId}</h2>
          <input
            type="text"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            placeholder="Enter peer ID to call"
          />
          <button onClick={makeCall}>Call</button>
        </div>
        <div>
          <h2>Local Video</h2>
          <video ref={localVideoRef} autoPlay playsInline muted />
        </div>
        <div>
          <h2>Remote Video</h2>
          <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
