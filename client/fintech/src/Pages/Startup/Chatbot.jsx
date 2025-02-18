import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Container, Form, Button, Card } from 'react-bootstrap';
import { FaPaperPlane, FaRobot, FaUser, FaFileUpload,FaMicrophone, FaStop  } from 'react-icons/fa';
import "./Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [waitingForFile, setWaitingForFile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
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
  const sendVoiceMessage = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-message.webm');

    setIsTyping(true);
    try {
      const response = await axios.post('http://localhost:5000/voice-chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessages(prevMessages => [
        ...prevMessages,
        { sender: 'user', text: `🎤 ${response.data.original_text}` },
        { sender: 'bot', text: response.data.reply }
      ]);
    } catch (error) {
      console.error('Error sending voice message:', error);
      let errorMessage = 'Sorry, I had trouble processing your voice message. Please try again or type your message.';
      
      // Check for specific error messages from the backend
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('FFmpeg is not installed')) {
          errorMessage = 'Voice chat is currently unavailable. Please type your message instead.';
        } else if (error.response.data.error.includes('Could not understand the audio')) {
          errorMessage = 'I could not understand the audio. Please speak clearly and try again.';
        }
      }
      
      setMessages(prevMessages => [
        ...prevMessages,
        { sender: 'bot', text: errorMessage }
      ]);
    }
    setIsTyping(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (chunksRef.current.length === 0) {
          setMessages(prevMessages => [
            ...prevMessages,
            { sender: 'bot', text: 'No audio was recorded. Please try again.' }
          ]);
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setMessages(prevMessages => [
          ...prevMessages,
          { sender: 'bot', text: 'There was an error recording audio. Please try again or type your message.' }
        ]);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { sender: 'bot', text: 'Could not access the microphone. Please ensure you have granted microphone permissions and try again.' }
      ]);
    }
    setIsTyping(false);
  };
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
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
              variant={isRecording ? "danger" : "secondary"}
              onClick={isRecording ? stopRecording : startRecording}
              className="voice-button mx-2"
            >
              {isRecording ? <FaStop /> : <FaMicrophone />}
            </Button>
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
};

export default Chatbot;
