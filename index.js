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
// const client_id = "98f199a472094fb890032932de1bef0e";
// const client_secret = "1c3f809a57b14bc3ac9d5c1a56748e1c";
// const refreshToken =
//   "AQCQUTd7yVjWvoSvi7Gw9e8fqAKhoCWJdZTHYJMhMv1f-IIfyfOW3-Ed_hfAVGwn3szUjyN2dF2Jr4DNCWAfsAYXdE20hK97flnEeRJV4J4OxjJ0q3S38LXoiIyfWFXLUrE";
// ==================================================================

const getAccessToken = async () => {
  const basic = new Buffer.from(`${process.env.CLIID}:${process.env.CLISECRET}`).toString(
    "base64"
  );

  const response = await axios("https://accounts.spotify.com/api/token", {
    method: "post",
    scope: "user-read-recently-played user-read-currently-playing",
    params: {
      grant_type: "refresh_token",
      refresh_token: process.env.REFRESH_TOKEN,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
  });

  return response.data;
};

const getRecentlyPlayed = async () => {
  try {
    const { access_token } = await getAccessToken();
  
    const recentlyPlayedResponse = await axios.get(
      `https://api.spotify.com/v1/me/player/recently-played`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: { limit: 1 },
      }
    );
  
    const recentlyPlayed = await recentlyPlayedResponse.data.items[0].track;
    const albumImg = recentlyPlayed.album.images[0].url;
    const song = recentlyPlayed.name;
    const artist = recentlyPlayed.artists[0].name;
    const songUrl = recentlyPlayed.external_urls.spotify;
    const album = recentlyPlayed.album.name;

    console.log(song, albumImg, artist, songUrl, album);

    return {
      song: song,
      artist: artist,
      songUrl: songUrl,
      album: album,
      albumImg: albumImg,
      currentlyPlaying: false
    };
  
  } catch (error) {
    console.error("Error fetching recently played song");
    return error.message.toString();
  }

};

const getNowPlaying = async () => {
  try {
    //Generate an access token
    const { access_token } = await getAccessToken();

    const nowPlayingResponse = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing", // Get currently playing song using access token
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: {
          json: true,
        },
      }
    );

    if (nowPlayingResponse.status > 400) {
      throw new Error( // If response status > 400 means there was some error while fetching the required information
        "Error fetching song error code: ",
        nowPlayingResponse.status
      );
    } else if (nowPlayingResponse.status == 204) {
      getRecentlyPlayed();
      // throw new Error("Currently not playing."); // The response was fetched but there was no content
    } else {
      // Gather details below (UI data for state)
      const songDetails = await nowPlayingResponse;
      const artist = songDetails.data.item.artists[0].name;
      const song = songDetails.data.item.name;
      const songUrl = songDetails.data.item.external_urls.spotify;
      const album = songDetails.data.item.album.name;
      const albumImg = songDetails.data.item.album.images[0].url;
      const isPlaying = songDetails.data.is_playing;

      console.log(
        " Artist: " + artist + "\n",
        "Song: " + song + "\n",
        "SongURL: " + songUrl + "\n",
        "Album: " + album + "\n",
        "AlbumImg: " + albumImg + "\n",
        "isPlaying: " + isPlaying
      );

      return {
        song: song,
        artist: artist,
        songUrl: songUrl,
        album: album,
        albumImg: albumImg,
        currentlyPlaying: isPlaying
      };

    }
  } catch (error) {
    console.error("Error fetching currently playing song: ", error);
    return error.message.toString();
  }
};
getNowPlaying();

app.listen("3000", () => {
  console.log("Listening on port 3000");
});
