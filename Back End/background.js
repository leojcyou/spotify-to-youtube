function createSpotifyUrl() {
    const spotifyClientId = "d502e1de8496425e9a6b3c792ae9df0d"
    const state = "meet" + Math.random().toString(36).substring(2, 15)
    const spotifyScope = "playlist-read-private playlist-read-collaborative"
    const showDialog = "true"
    const responseType = "token"
    const redirectUri = "https://ddhlalnafmgfpodpaiiheghpeochgflc.chromiumapp.org/"

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

function parseUrl(accessUrl){
    let accessToken = accessUrl.split('=')[1]
    accessToken = accessToken.split('&')[0]
    return accessToken
}

function spotifyCallback(redirectUrl) {
    if (chrome.runtime.lastError || redirectUrl.includes('callback?error=access_denied')){
        console.log("no auth")
    }

    else
    {
        console.log(redirectUrl)
        console.log("authed")
        let accessToken = parseUrl(redirectUrl)
        console.log(accessToken)
    }
}

//Youtube
const API_KEY = "AIzaSyDjeaR3-LeYmrAIw-VwQ_V2YuEPd6KHQC0"

function googleCallback(token)
{
    if (chrome.runtime.lastError)
    {
        console.log("no auth")
    }
    else{
        let googleAuthToken = token
        console.log(googleAuthToken)
    } 
}

//Mainloop
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
        sendResponse(true) 
    }
})


