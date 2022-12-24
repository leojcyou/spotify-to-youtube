const { response } = require("express")
const app = express()

const redirectUri = "https://kmiobbpfbiijebejmcmjgjjidpfnlkii.chromiumapp.org/"
const responseType = "token"

//Spotify
const spotifyClientId = "d502e1de8496425e9a6b3c792ae9df0d"
const state = "meet" + Math.random().toString(36).substring(2, 15)
const spotifyScope = "playlist-read-private playlist-read-collaborative"
const showDialog = "true"

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
function createYoutubeUrl() {
    const googleClientId = '84930495597-s3cb5s04676ptq9kv3lrdkm76213s1rd.apps.googleusercontent.com'

    let youtubeUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    youtubeUrl += "&scope=" + encodeURIComponent('https://www.googleapis.com/auth/youtube')
    youtubeUrl += "&include_granted_scopes=" + encodeURIComponent('true')
    youtubeUrl += "&response_type=" + encodeURIComponent(responseType)
    youtubeUrl += "&state=" + encodeURIComponent(state)
    youtubeUrl += "&redirect_uri=" + encodeURIComponent(redirectUri) 
    youtubeUrl += "client_id=" + encodeURIComponent(googleClientId)

    console.log(youtubeUrl)
    return youtubeUrl
}


//Mainloop
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message == "spotify login") {
        chrome.identity.launchWebAuthFlow(
        {
            url: createSpotifyUrl(),
            interactive: true
        },
        redirectOnFailure
        )
    }
    return true;
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message == "youtube login") {
        chrome.identity.launchWebAuthFlow(
        {
            url: createYoutubeUrl(),
            interactive: true
        },
        redirectOnFailure
        )
    }
    return true;
})

