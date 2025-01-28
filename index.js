console.log("Linked");

const axios = require("axios").default;
const dotEnv = require("dotenv");
dotEnv.config();

const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// =========================== Move to .env ========================
const client_id = "98f199a472094fb890032932de1bef0e";
const client_secret = "1c3f809a57b14bc3ac9d5c1a56748e1c";
const refreshToken =
  "AQCFzbFWGF04Bs-_zQ4LNJXFV5d6532IE48xlZAFpU6wB93FOWZpnA6MrwYwyU7NhjZwP0OBTwOn6uEc2zouPLJWVkn6BpyHkLfTJmvnbmySxhZrHCzQjrwZSBFim9f2SCc";
// ==================================================================

const getAccessToken = async (client_id, client_secret, refreshToken) => {
  const basic = new Buffer.from(`${client_id}:${client_secret}`).toString(
    "base64"
  );

  const response = await axios("https://accounts.spotify.com/api/token", {
    method: "post",
    params: {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
  })

  return response.data;
};

const getNowPlaying = async () => {
  try {
    const { access_token } = await getAccessToken(
      client_id,
      client_secret,
      refreshToken
    );

    const nowPlayingResponse = await axios.get( // Get currently playing song
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
            json: true
          },
      }
    );

    if(nowPlayingResponse.status > 400){ //If response status > 400 means there was some error while fetching the required information
        throw new Error('Error fetching song error code: ', nowPlayingResponse.status);
    }else if(nowPlayingResponse.status == 204){ // The response was fetched but there was no content
        throw new Error('Currently not playing.')
        // ================== FETCH LAST SONG PLAYED? ===================
    }

    const songDetails = await nowPlayingResponse;
    // console.log(songDetails.data);
    const artist = songDetails.data.item.artists[0].name;
    const song = songDetails.data.item.name;
    const songUrl = songDetails.data.item.external_urls.spotify;
    const album = songDetails.data.item.album.name;
    const albumImg = songDetails.data.item.album.images[0].url;
    const isPlaying = songDetails.data.is_playing;

    console.log(
        " Artist: " + artist+"\n", "Song: " + song+"\n", "Album: " + album+"\n", "isPlaying: " + isPlaying
    );


  } catch (error) {
    console.error("Error fetching currently playing song: ", error);
    return error.message.toString();
  }
};

getNowPlaying();

app.listen("3000", () => {
  console.log("Listening on port 3000");
});

// https://accounts.spotify.com/en/authorize?client_id=98f199a472094fb890032932de1bef0e&response_type=code&redirect_uri=http%3A%2F%2Flocalhost:3000&scope=user-read-currently-playing

// Refresh token
// AQAotgFS44BoikKWNUJ-UFufZUGGnWmgLtfzbqv0Ewzf70ADfn5WhyCbwmvHoTiAB72oMXNNEfh5FwJWJEFvCSfqDvTl3hgmKAHQBhupPVzafRjrzB-sxs0tue7DopmyFmbH6NFkWqx5HaHNhFIf02yhRgdULOlhxpTHIusokM09YE2WOYrdHRS2x8VTubLL8crxataZ
