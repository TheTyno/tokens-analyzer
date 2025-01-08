import * as React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteAccount, getData } from "../storage/models";

const onDeleteAccount = (userId, setAccounts) => {
  deleteAccount(userId);
  const accounts = getData();
  setAccounts(accounts);
};

const generateKeywordAccordion = (keyword) => (
  <Accordion
    sx={{ backgroundColor: "#f0f0f0", marginBottom: 1, borderRadius: 1 }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel2-content"
      id="panel2-header"
      sx={{ backgroundColor: "#d0d0d0", borderRadius: 1 }}
    >
      <Typography sx={{ color: "#333" }}>{keyword.keyword}</Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {keyword.relatedTokens.map((token) => (
        <Chip key={token} label={token} color="secondary" />
      ))}
    </AccordionDetails>
  </Accordion>
);

const generateTweetAccordion = (tweet) => (
  <Accordion
    sx={{ backgroundColor: "#e0e0e0", marginBottom: 2, borderRadius: 1 }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1-content"
      id="panel1-header"
      sx={{ backgroundColor: "#c0c0c0", borderRadius: 1 }}
    >
      <a href={tweet.url} style={{ textDecoration: "none", color: "#000" }}>
        {tweet.text}
      </a>
    </AccordionSummary>
    <AccordionDetails>
      <Typography sx={{ color: "#555", marginBottom: 1 }}>Keywords</Typography>
      {tweet.keywords.map((keyword) => generateKeywordAccordion(keyword))}
    </AccordionDetails>
  </Accordion>
);

const generateUserAccordion = (data, setAccounts) => (
  <Accordion
    sx={{ backgroundColor: "#d0d0d0", marginBottom: 2, borderRadius: 1 }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon sx={{ color: "#ffffff" }} />}
      aria-controls="panel1-content"
      id="panel1-header"
      sx={{ backgroundColor: "#14171A", borderRadius: 1 }}
    >
        <b>
      <a
        target="_blank"
        href={`https://x.com/${data.userId}`}
        style={{ color: "#ffff" }}
      >
        @{data.username}{" "}
      </a></b>
      <Button
        size="small"
        color="error"
        sx={{ marginLeft: "0.5rem" }}
        startIcon={<DeleteIcon />}
        onClick={() => onDeleteAccount(data.userId, setAccounts)}
      />
    </AccordionSummary>
    <AccordionDetails>
      {data.tweets.map((tweet) => generateTweetAccordion(tweet))}
    </AccordionDetails>
  </Accordion>
);

export default function AccordionUsage({ accounts, setAccounts }) {
  return (
    <div>
      {accounts.map((data) => generateUserAccordion(data, setAccounts))}
    </div>
  );
}
