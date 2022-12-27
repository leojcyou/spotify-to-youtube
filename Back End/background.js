//Mainloop
//Google
const API_KEY = "AIzaSyDjeaR3-LeYmrAIw-VwQ_V2YuEPd6KHQC0"
const SPOTIFY_PLAYLIST_ID = "7bjBfZIF7ylSBVV0aqAUBx" 
let playlistName = ""

const songNames = []
const artistNames = []
const ytIds = []

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message == "spotify login") {
        chrome.identity.launchWebAuthFlow(
        {
            url: createSpotifyUrl(),
            interactive: true
        }, spotifyCallback
        )
    }
    if (request.message == "google token"){
        console.log("hello")
        chrome.identity.getAuthToken(
            {
                interactive: true
            }, googleCallback
        )
        // sendResponse(true) //unsure what this does atm
    }
})




//Spotify
function createSpotifyUrl() {
    const spotifyClientId = "d502e1de8496425e9a6b3c792ae9df0d";
    const state = "meet" + Math.random().toString(36).substring(2, 15);
    const spotifyScope = "playlist-read-private playlist-read-collaborative";
    const showDialog = "true";
    const responseType = "token";
    const redirectUri = "https://ddhlalnafmgfpodpaiiheghpeochgflc.chromiumapp.org/"; //the id may be different?

    let spotifyUrl = "https://accounts.spotify.com/authorize?";
    spotifyUrl += "client_id=" + encodeURIComponent(spotifyClientId);
    spotifyUrl += "&response_type=" + encodeURIComponent(responseType);
    spotifyUrl += "&redirect_uri=" + encodeURIComponent(redirectUri);
    spotifyUrl += "&state=" + encodeURIComponent(state);
    spotifyUrl += "&scope=" + encodeURIComponent(spotifyScope);
    spotifyUrl += "&show_dialog=" + encodeURIComponent(showDialog);
    
    console.log(spotifyUrl);
    return spotifyUrl;
}

function parseUrl(accessUrl){
    let accessToken = accessUrl.split('=')[1];
    accessToken = accessToken.split('&')[0];
    return accessToken;
}

async function getName(token, playlistId){//
    let playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;

    const response = await fetch(playlistUrl, {//
        method: 'GET',
        headers: { 
            "Accept" : "application/json",
            "Content-Type":"application/json",
            "Authorization" : "Bearer " + token
        }
    });
    const data = await response.json();
    console.log(data)

    playlistName = data.name + " | Import from Spotify"

    return;
}

async function importPlaylist(token, playlistId){//
    let limit = 2;
    let playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    const response = await fetch(playlistUrl, {//
        method: 'GET',
        headers: { 
            "Accept" : "application/json",
            "Content-Type":"application/json",
            "Authorization" : "Bearer " + token
        }
    });
    const data = await response.json();
    console.log(data)

    if(data.total < limit) limit = data.total;
    
    for (let i = 0; i < limit ; i++)
    {
        songNames[i] = data.items[i].track.name;
        artistNames[i] = data.items[i].track.artists[0].name;

        console.log(data.items[i].track.name);
        console.log(data.items[i].track.artists[0].name);
    }

    return;
}

async function spotifyCallback(redirectUrl) {
    if (chrome.runtime.lastError || redirectUrl.includes('callback?error=access_denied')){
        console.log("no auth");
    }

    else
    {
        console.log(redirectUrl);
        console.log("authed");
        let spotifyAuthToken = parseUrl(redirectUrl);
        console.log(spotifyAuthToken);
        await getName(spotifyAuthToken,SPOTIFY_PLAYLIST_ID)
        await importPlaylist(spotifyAuthToken,SPOTIFY_PLAYLIST_ID);
        //console.log("hjel;osdfjios")

        chrome.identity.getAuthToken(
            {
                interactive: true
            }, googleCallback
        )
    }        
    
    return
}

//Youtube
async function googleCallback(token) {
    if (chrome.runtime.lastError) {
        console.log("no auth");
    }

    else {
        let googleAuthToken = token;
        console.log(googleAuthToken);

        await searchYoutube(googleAuthToken);
        console.log("Searching has finished")

        createPlaylist(googleAuthToken)
    } 
}

async function createPlaylist(token) {
    // let d = new Date()
    // let date = d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate()
    // let playlistName = "Import from Spotify" + " " + date

    let endpointUrl = `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&key=${API_KEY}`

    const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + String(token)
        },
        body: JSON.stringify(
            {
                "snippet": {
                    "title": playlistName
                }
            }
        )
    });

    const data = await response.json();

    console.log(data)
    let playlistId = data.id;
    console.log("playlist created " + playlistId)

    addSongs(playlistId, token)
}

async function addSongs(playlistId, token) {
    let endpointUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&part=id&key=${API_KEY}`

    for (let i = 0; i < songNames.length; i++) {
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                "Accept" : "application/json",
                "Content-Type": "application/json",
                "Authorization" : "Bearer" + " " + token
            },
            body: JSON.stringify(
                {
                    "snippet": {
                        "playlistId": playlistId,
                        "position": i,
                        "resourceId": {
                            "kind": "youtube#video",
                            "videoId": ytIds[i]
                        }
                    }
                }
            )
        })

        const data = await response.json()

        console.log(data)
        console.log("song " + i + " added")

        //get the data and check the error code, if failed, print to final screen to tell user x song was not added
    }
}

function getKeyword(artist, song) {
    return artist.replace(" ", "%20") + "%20" + song.replace(" ", "%20")
}

async function searchYoutube(token) {
    // console.log("we're in search!")

    for (let i = 0; i < songNames.length; i++) {
        let searchUrl = "https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1"
        searchUrl += "&q=" + getKeyword(artistNames[i], songNames[i])
        searchUrl += "&key=" + API_KEY

        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: { 
                "Accept" : "application/json",
                "Authorization" : "Bearer" + " " + token
            }
        });

        const data = await response.json();
        console.log(data)

        ytIds[i] = data.items[0].id.videoId
        console.log(ytIds[i])
    }
}