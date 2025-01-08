"use client"

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Handle sending messages
  const handleSend = async () => {
    if (input.trim() === "") return;

    const rawResponse = await fetch('/api/tokens', {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({text: input})
    })

    const result = await rawResponse.json()

    // Add user's message and a bot response
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "You", text: input },
      { sender: "Bot", text: result},
    ]);
    setInput(""); // Clear input field
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        width: "100%",
        maxWidth: "600px",
        margin: "auto",
        padding: "16px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Chat messages display */}
      <Paper
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          marginBottom: "16px",
        }}
        elevation={2}
      >
        <List>
          {messages.map((message, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: message.sender === "You" ? "bold" : "normal",
                    }}
                  >
                    {message.sender}
                  </Typography>
                }
                secondary={message.text}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Input field and send button */}
      <Box
        sx={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <TextField
          label="Paste a Text to analyze"
          variant="outlined"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ffffff", // Change the border color to white when focused
            },
            // Change label color to white when focused
            "& .MuiInputLabel-root.Mui-focused": {
            color: "#ffffff",
            },
          }}
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;
