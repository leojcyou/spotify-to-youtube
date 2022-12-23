//const clientId = 
let isSignedIn = false;

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