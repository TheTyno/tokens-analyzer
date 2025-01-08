"use client";

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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TwitterIcon from "@mui/icons-material/Twitter";
import TelegramIcon from "@mui/icons-material/Telegram";
import LanguageIcon from "@mui/icons-material/Language";

const customIcon = (type) => {
  let image
  console.log(type)
  if(type === "dexscreener") image = "https://cdn.prod.website-files.com/6421d264d066fd2b24b91b20/661375b92a7e161501f4b5e5_dexscreener.322a5a2d.png"
  if(type === "dextools") image = "https://cdn.prod.website-files.com/6421d264d066fd2b24b91b20/661375b92a7e161501f4b5e5_dexscreener.322a5a2d.png"

  return (props) => (
    <IconButton>
      <img
      {...props}
                src={image}
                alt={`${type} Icon`}
                style={{
                  width: "25px",  // You can adjust the size of the icon
                  height: "25px",
                  borderRadius: "50%",
                  objectFit: "contain", // Ensures the image doesn't stretch
                }}
      />
    </IconButton>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Handle sending messages
  const handleSend = async () => {
    if (input.trim() === "") return;

    const rawResponse = await fetch("/api/tokens", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    });

    const result = await rawResponse.json();

    // Add user's message and a bot response
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "You", text: input },
      { sender: "Bot", text: result },
    ]);
    setInput(""); // Clear input field
  };

  // Render links with appropriate icons as clickable buttons
  const renderLinks = (links) => {
    return links.map((link, index) => {
      let IconComponent = null;

      if (link.type === "twitter") {
        IconComponent = TwitterIcon;
      } else if (link.type === "telegram") {
        IconComponent = TelegramIcon;
      } else if (link.label?.toUpperCase() === "WEBSITE") {
        IconComponent = LanguageIcon;
      } else {
        IconComponent = customIcon(link.type)
      }

      return (
        IconComponent && (
          <IconButton
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              marginRight: "8px",
              color: "#1976d2", // Default icon color (blue)
            }}
          >
            <IconComponent />
          </IconButton>
        )
      );
    });
  };

  // Function to render a single object
  const renderObject = (obj) => {
    const { ca, chain, icon, description, links } = obj;

    return (
      <Accordion key={ca}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Render icon and CA */}
            {icon && (
              <img
                src={icon}
                alt="icon"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                }}
              />
            )}
            <Typography
              variant="body1"
              sx={{
                fontWeight: "bold",
                fontSize: "0.875rem", // Smaller font size for CA
              }}
            >
              {ca}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {/* Render description */}
          {description && (
            <Typography variant="body2" sx={{ marginBottom: "8px" }}>
              {description}
            </Typography>
          )}

          {/* Render links */}
          {links && links.length > 0 && (
            <Box sx={{ marginTop: "8px" }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", marginBottom: "4px" }}>
                Links:
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {renderLinks(links)}
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  // Function to render an array of objects
  const renderObjectsArray = (array) => {
    return array.map((obj) => renderObject(obj));
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
                secondary={
                  Array.isArray(message.text) ? (
                    // If the message text is an array, render it as multiple dropdowns
                    renderObjectsArray(message.text)
                  ) : (
                    message.text
                  )
                }
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
