import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const [username, setUsername] = useState(""); // Store the username
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [messages, setMessages] = useState([]); // Chat messages
  const [input, setInput] = useState(""); // Chat input
  const ws = useRef(null); // WebSocket reference

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");
  
    ws.current.onopen = () => {
      console.log("Connected to WebSocket server");
    };
  
    ws.current.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        // Convert Blob to text
        const text = await event.data.text();
        const messageData = JSON.parse(text);
        setMessages((prevMessages) => [...prevMessages, messageData]);
      } else {
        // Handle plain text or JSON
        try {
          const messageData = JSON.parse(event.data); // Parse JSON if needed
          setMessages((prevMessages) => [...prevMessages, messageData]);
        } catch (err) {
          console.error("Error parsing WebSocket message:", event.data);
        }
      }
    };
  
    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  
    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };
  
    return () => {
      ws.current.close();
    };
  }, []);

  const handleLogin = () => {
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      const message = { sender: username, text: input };
      ws.current.send(JSON.stringify(message)); // Send message via WebSocket
      setInput(""); // Clear input
    }
  };

  return (
    <div className="chat-container">
      {!isLoggedIn ? (
        <div className="login-container">
          <h2>Enter Your Name</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
          />
          <button onClick={handleLogin}>Start Chat</button>
        </div>
      ) : (
        <>
          <div className="messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === username ? "client" : "server"}`}
              >
                <strong>{msg.sender}: </strong>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
