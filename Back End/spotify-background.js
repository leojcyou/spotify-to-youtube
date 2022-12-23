const clientId = "CLIENT ID"
const responseType = "token"
const redirectUri = "https://kmiobbpfbiijebejmcmjgjjidpfnlkii.chromiumapp.org/"
const state = "meet" + Math.random().toString(36).substring(2, 15)
const scope = "playlist-read-private playlist-read-collaborative"
const showDialog = "true"

let isSignedIn = false;

<<<<<<< HEAD
function authenticateSpotify() {

    var client_id = 'd502e1de8496425e9a6b3c792ae9df0d';
    var redirect_uri = 'https://kmiobbpfbiijebejmcmjgjjidpfnlkii.chromiumapp.org/';
    var state = generateRandomString(16);
    localStorage.setItem(stateKey, state);
    var scope = 'playlist-read-private playlist-read-collaborative';

    //generates url with access_token
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(client_id);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    url += '&state=' + encodeURIComponent(state);

    console.log("hi");
    // let accessLink = chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //     if (request.message == "login") {
    //         chrome.identity.launchWebAuthFlow(
    //         {
    //             url: createSpotifyUrl(),
    //             interactive: true
    //         },
    //         redirectOnFailure
    //         )
    //     }
    
    //     return true;
    // })

    // return accessLink;
}

function readPlaylist(playlistId) {

}




export {authenticateSpotify, token};




// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.message == "login") {

//     }
// })
=======
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
>>>>>>> 0e8b4f5b0fb8d213231c206711ec0ec49a2cd031
