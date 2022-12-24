//Youtube and Spotify Constants
const redirectUri = "https://kmiobbpfbiijebejmcmjgjjidpfnlkii.chromiumapp.org/"


//Spotify
let spotifySignedIn = false

const spotifyClientId = "d502e1de8496425e9a6b3c792ae9df0d"
const state = "meet" + Math.random().toString(36).substring(2, 15)
const spotifyScope = "playlist-read-private playlist-read-collaborative"
const showDialog = "true"
const responseType = "token"

function createSpotifyUrl() {
    let spotifyUrl = "https://accounts.spotify.com/authorize?"
    spotifyUrl += "client_id=" + encodeURIComponent(spotifyClientId)
    spotifyUrl += "&response_type=" + encodeURIComponent(responseType)
    spotifyUrl += "&redirect_uri=" + encodeURIComponent(redirectUri) 
    spotifyUrl += "&state=" + encodeURIComponent(state) 
    spotifyUrl += "&scope=" + encodeURIComponent(spotifyScope)
    spotifyUrl += "&show_dialog=" + encodeURIComponent(showDialog)
    
    console.log(spotifyUrl)
    return spotifyUrl
}

function redirectOnFailure(spotifyUrl) {
    if (chrome.runtime.lastError || redirectUrl.includes('callback?error=access_denied'))
        sendResponse({message: "fail"})

    else
        console.log(redirectUrl)
}


//Youtube
let googleSignedIn = false

const API_KEY = "AIzaSyDjeaR3-LeYmrAIw-VwQ_V2YuEPd6KHQC0"

function createYoutubeUrl() {
   
}

//Mainloop
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message == "spotify login") {
        chrome.identity.launchWebAuthFlow(
        {
            url: createSpotifyUrl(),
            interactive: true
        }, redirectOnFailure
        )
    }
    if (request.message == "google token"){
        chrome.identity.getAuthToken({interactive: true}, function(auth_token){console.log(auth_token)});
        sendResponse(true)
    }
})


