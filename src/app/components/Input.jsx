import * as React from "react";
import { Grid, TextField, Button, Alert } from "@mui/material";
import { addAccount, getData } from "../storage/models";

export default ({ setAccounts }) => {
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState("");

  const onAddNewAccount = async () => {
    let username;
    setError("");

    if (text === "") return setError("Please paste a twitter link or user id");

    if (text.startsWith("https://x.com/")) {
      username = text.split("https://x.com/")[1];
    } else if (text.startsWith("https://twitter.com/")) {
      username = text.split("https://twitter.com/")[1];
    } else if (text.startsWith("https://www.twitter.com/")) {
      username = text.split("https://www.twitter.com/")[1];
    } else if (text.startsWith("https://www.x.com/")) {
      username = text.split("https://www.x.com/")[1];
    } else if (text.startsWith("@")) {
      username = text.split("@")[1];
    } else {
      username = text;
    }

   const userIdResponse = await fetch(`/api/userid?username=${username}`)

   if(!userIdResponse.ok){
    return setError(`Could not retrieve user info. REASON: ${userIdResponse.statusText}`)
   }

   const { userId } = await userIdResponse.json()
   
   let tweets = []
   if(userId){
    const tweetsResponse = await fetch(`/api/tweets?username=${username}&userId=${userId}`)
        if(tweetsResponse.ok){
            tweets = await tweetsResponse.json()
        }else {
            setError(`Could not retrieve user tweets, We added the user but try to refresh the data in 10 minutes. REASON: ${tweetsResponse.statusText}`)
        }
   }

    
    addAccount({ username, userId, tweets });
    setAccounts(getData());

    setText("");
  };

  const onRefreshData = async () => {
    const accounts = getData()
    
    const refreshedAccounts = accounts.map(async account => {
        
    })
  }

  // Render
  return (
    <Grid>
      <Grid
        container
        direction="row"
        sx={{
          justifyContent: "center",
        }}
      >
        <Grid item xs={9}>
          <TextField
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            helperText="Paste Twitter link or user id"
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "white",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
              },
              "& .MuiFormHelperText-root": {
                color: "white",
              },
            }}
          />
        </Grid>
        <Grid item size={2} sx={{ margin: "0.5rem" }}>
          <Button variant="contained" onClick={onAddNewAccount}>
            Add New Account
          </Button>
          <Button variant="contained" color="success">
            Refresh Data
          </Button>
        </Grid>
      </Grid>
      <Grid
        item
        sx={{ marginLeft: "25%", marginRight: "25%", marginBottom: "1rem" }}
      >
        <Alert variant="filled" severity="warning">
            Because of Twitter API free tier Rate limit we can only add 1 account at a time and refesh the data every 10 mins
          </Alert>
        {error && (
          <Alert variant="filled" severity="error">
            {error}
          </Alert>
        )}
      </Grid>
    </Grid>
  );
};
