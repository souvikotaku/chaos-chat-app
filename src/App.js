import logo from "./logo.svg";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import React, { useRef, useState } from "react";
import sample from "./assets/trip.mp4";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyAerrLV3keYl7OMso-u1tPs8A6-_Q6BrY4",
  authDomain: "react-chat-app-de957.firebaseapp.com",
  projectId: "react-chat-app-de957",
  storageBucket: "react-chat-app-de957.appspot.com",
  messagingSenderId: "779069507541",
  appId: "1:779069507541:web:3f26fe1c0760216a65df5c",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      <video
        className="videoTag"
        autoPlay
        loop
        muted
        style={{
          position: "absolute",
          zIndex: -1,
          overflowY: "none",
          width: "100%",
        }}
      >
        <source src={sample} type="video/mp4" />
      </video>
      <div className="App">
        <header>
          <h1>Chaos Chat</h1>
          <SignOut />
        </header>

        <section>{user ? <ChatRoom /> : <SignIn />}</section>
      </div>
    </>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something"
        />

        <button type="submit" disabled={!formValue}>
          <i className="fas fa-skull" />
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt } = props.message;
  console.log("props.message", props.message);

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <div>
          <p
            className="textpara"
            style={{
              marginBottom: "0px",
            }}
          >
            {text}
          </p>
          <p
            style={{
              fontStyle: "italic",
              fontSize: "8px",
              color: "white",
              background: "none",
              padding: "0px",
              marginBottom: "0px",
              marginTop: "0px",
            }}
          >
            {`${createdAt?.toDate().toLocaleTimeString()}, ${createdAt
              ?.toDate()
              .toDateString()}`}
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
