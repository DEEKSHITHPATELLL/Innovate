import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Container, Form, Button, Card } from 'react-bootstrap';
import { FaPaperPlane, FaRobot, FaUser, FaFileUpload } from 'react-icons/fa';
import "./Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [waitingForFile, setWaitingForFile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = "user-123";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim()) {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "user", text: input },
        ]);
        
        setIsTyping(true);
        try {
            const response = await axios.post("http://localhost:5000/chat", {
                message: input,
            });

            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "bot", text: response.data.reply },
            ]);
            setIsTyping(false);
        } catch (error) {
            console.error("Error sending message:", error);
            setIsTyping(false);
        }
        setInput("");
    }
};

  const uploadFile = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: `Uploading file: ${file.name}...` },
        ]);

        const response = await axios.post("http://localhost:5000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "File uploaded successfully. Processing..." },
        ]);

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: response.data.reply },
        ]);

        setFile(null);
        setWaitingForFile(false);
      } catch (error) {
        console.error("Error uploading file:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Error uploading file. Please try again." },
        ]);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Container className="chatbot-container">
      <Card className="chat-card">
        <Card.Header className="chat-header">
          <FaRobot className="bot-icon" />
          <h2>AI Assistant</h2>
        </Card.Header>
        
        <Card.Body className="chat-body">
          <div className="messages-container">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`message-wrapper ${msg.sender === "user" ? "user" : "bot"}`}
                >
                  <div className="message-icon">
                    {msg.sender === "user" ? <FaUser /> : <FaRobot />}
                  </div>
                  <div className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="typing-indicator"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </Card.Body>

        <Card.Footer className="chat-footer">
          {waitingForFile ? (
            <div className="file-upload-container">
              <Form.Group controlId="formFile" className="mb-0">
                <Form.Label className="file-upload-label">
                  <FaFileUpload className="upload-icon" />
                  {file ? file.name : "Choose a file"}
                </Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="d-none"
                />
              </Form.Group>
              <Button
                variant="primary"
                onClick={uploadFile}
                disabled={!file}
                className="upload-button"
              >
                Upload
              </Button>
            </div>
          ) : (
            <div className="input-container">
              <Form.Control
                as="textarea"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="message-input"
              />
              <Button
                variant="primary"
                onClick={sendMessage}
                disabled={!input.trim()}
                className="send-button"
              >
                <FaPaperPlane />
              </Button>
            </div>
          )}
        </Card.Footer>
      </Card>
    </Container>
  );
}

export default Chatbot;
