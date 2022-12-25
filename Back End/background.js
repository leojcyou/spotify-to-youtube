//Mainloop

const songNames = [];
const artistNames = [];

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
        chrome.identity.getAuthToken(
            {
                interactive: true
            }, googleCallback
            )
        sendResponse(true) //unsure what this does atm
    }
})





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
    spotifyUrl += "&state=" + encodeURIComponent(state) ;
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

async function importPlaylist(token, playlistId){
    let limit = 10;
    let playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    const response = await fetch(playlistUrl, {
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
    /*
    JSON PATH
    items -> track ->

     ===> artists - > name
     ===> name
     */
}

//Youtube
function spotifyCallback(redirectUrl) {
    if (chrome.runtime.lastError || redirectUrl.includes('callback?error=access_denied')){
        console.log("no auth");
    }

    else
    {
        console.log(redirectUrl);
        console.log("authed");
        let spotifyAuthToken = parseUrl(redirectUrl);
        console.log(spotifyAuthToken);
        importPlaylist(spotifyAuthToken,'7bjBfZIF7ylSBVV0aqAUBx');
    }
}

//Youtube
const API_KEY = "AIzaSyDjeaR3-LeYmrAIw-VwQ_V2YuEPd6KHQC0"

function googleCallback(token)
{
    if (chrome.runtime.lastError)
    {
        console.log("no auth");
    }
    else{
        let googleAuthToken = token;
        console.log(googleAuthToken);
    } 
}




