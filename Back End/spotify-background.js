const clientId = "CLIENT ID"
const responseType = "token"
const redirectUri = "https://kmiobbpfbiijebejmcmjgjjidpfnlkii.chromiumapp.org/"
const state = "meet" + Math.random().toString(36).substring(2, 15)
const scope = "playlist-read-private playlist-read-collaborative"
const showDialog = "true"

let isSignedIn = false;

function createSpotifyUrl() {
    let spotifyUrl = "https://accounts.spotify.com/authorize?"
    spotifyUrl += "client_id=" + encodeURIComponent(clientId)
    spotifyUrl += "&response_type=" + encodeURIComponent(responseType)
    spotifyUrl += "&redirect_uri=" + encodeURIComponent(redirectUri) 
    spotifyUrl += "&state=" + encodeURIComponent(state) 
    spotifyUrl += "&scope=" + encodeURIComponent(scope)
    spotifyUrl += "&show_dialog=" + encodeURIComponent(showDialog)
    
    console.log(spotifyUrl)

    return spotifyUrl
}

function redirectOnFailure(redirectUrl) {
    if (chrome.runtime.lastError || redirectUrl.includes('callback?error=access_denied'))
        sendResponse({message: "fail"})

    else
        console.log(redirectUrl)
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message == "login") {
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