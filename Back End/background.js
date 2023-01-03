const YOUTUBE_API_KEY = "AIzaSyDjeaR3-LeYmrAIw-VwQ_V2YuEPd6KHQC0"


const songNames = []
const artistNames = []
const youtubeSongIds = []

let spotifyPlaylistUrl = ""
let spotifyPlaylistId = "" 
let youtubePlaylistName = ""

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message) {

        spotifyPlaylistUrl = request.message
        console.log(spotifyPlaylistUrl)
        spotifyPlaylistId = getPlaylistId(spotifyPlaylistUrl)

        chrome.identity.launchWebAuthFlow(
            {
                url: createSpotifyUrl(),
                interactive: true
            }, 
            spotifyCallback
        )
    }
})

async function spotifyCallback(redirectUrl) {
    if (chrome.runtime.lastError || redirectUrl.includes("callback?error=access_denied")) {
        sendError("Could not authenticate with Spotify")
    }

    else {
        let spotifyAuthToken = parseUrl(redirectUrl)
        await importPlaylist(spotifyAuthToken, spotifyPlaylistId)

        chrome.identity.getAuthToken(
            {
                interactive: true
            }, 
            youtubeCallback
        )
    }        
}

async function youtubeCallback(googleAuthToken) {
    if (chrome.runtime.lastError) {
        sendError("Could not authenticate with Google")
    }

    else {
        await searchYoutube(googleAuthToken)
        createPlaylist(googleAuthToken)
    } 
}

// Spotify
function getPlaylistId(playlistUrl){
    let playlistId = playlistUrl.split("/")[4]
    playlistId = playlistId.split("?")[0]
    return playlistId
}

function createSpotifyUrl() {
    const SPOTIFY_CLIENT_ID = "d502e1de8496425e9a6b3c792ae9df0d"
    const STATE = Math.random().toString().substring(2, 18)
    const SPOTIFY_SCOPE = "playlist-read-private playlist-read-collaborative"
    const SHOW_DIALOG = "true"
    const RESPONSE_TYPE = "token"
    const REDIRECT_URI = "https://ddhlalnafmgfpodpaiiheghpeochgflc.chromiumapp.org/" //the id may be different?

    let spotifyUrl = `https://accounts.spotify.com/authorize?`
    spotifyUrl += `client_id=` + encodeURIComponent(SPOTIFY_CLIENT_ID)
    spotifyUrl += `&response_type=` + encodeURIComponent(RESPONSE_TYPE)
    spotifyUrl += `&redirect_uri=` + encodeURIComponent(REDIRECT_URI)
    spotifyUrl += `&state=` + encodeURIComponent(STATE)
    spotifyUrl += `&scope=` + encodeURIComponent(SPOTIFY_SCOPE)
    spotifyUrl += `&show_dialog=` + encodeURIComponent(SHOW_DIALOG)
    
    return spotifyUrl
}

function parseUrl(accessUrl) {
    let accessToken = accessUrl.split("=")[1]
    accessToken = accessToken.split("&")[0]

    return accessToken
}

async function importPlaylist(spotifyAuthToken, spotifyPlaylistId) {
    let limit = 2
    let spotifyEndpointPlaylistUrl = `https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/tracks`

    await getName(spotifyAuthToken, spotifyPlaylistId)

    const response = await fetch(spotifyEndpointPlaylistUrl, {
        method: "GET",
        headers: { 
            "Accept" : "application/json",
            "Content-Type":"application/json",
            "Authorization" : "Bearer" + " " + spotifyAuthToken
        }
    })

    const data = await response.json()

    if(data.error) {
        sendError("Invalid Playlist Link")
    }
    else {
        if (data.total < limit) {
            limit = data.total
        }
    
        for (let i = 0; i < limit; i++) {
            songNames[i] = data.items[i].track.name
            artistNames[i] = data.items[i].track.artists[0].name
        }
    }
}

async function getName(spotifyAuthToken, spotifyPlaylistId) {
    let spotifyEndpointPlaylistUrl = `https://api.spotify.com/v1/playlists/${spotifyPlaylistId}`

    const response = await fetch(spotifyEndpointPlaylistUrl, {
        method: "GET",
        headers: { 
            "Accept" : "application/json",
            "Content-Type":"application/json",
            "Authorization" : "Bearer" + " " + spotifyAuthToken
        }
    })

    const data = await response.json()

    if(data.error) {
        sendError("Invalid Playlist Link")
    }
    else {
        youtubePlaylistName = data.name + " | Import from Spotify"
    }
}

async function searchYoutube(googleAuthToken) {
    for (let i = 0; i < songNames.length; i++) {
        let keyword = getKeyword(artistNames[i], songNames[i])
        let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q=${keyword}&key=${YOUTUBE_API_KEY}`

        const response = await fetch(searchUrl, {
            method: "GET",
            headers: { 
                "Accept" : "application/json",
                "Authorization" : "Bearer" + " " + googleAuthToken
            }
        })

        const data = await response.json()

        youtubeSongIds[i] = data.items[0].id.videoId
    }
}

async function createPlaylist(googleAuthToken) {
    let endpointUrl = `https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&key=${YOUTUBE_API_KEY}`

    const response = await fetch(endpointUrl, {
        method: "POST",
        headers: { 
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer" + " " + googleAuthToken
        },
        body: JSON.stringify(
            {
                "snippet": {
                    "title": youtubePlaylistName
                }
            }
        )
    })

    const data = await response.json()
    let youtubePlaylistId = data.id

    addSongs(youtubePlaylistId, googleAuthToken) 
}

async function addSongs(youtubePlaylistId, googleAuthToken) {
    let endpointUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&part=id&key=${YOUTUBE_API_KEY}`

    for (let i = 0; i < songNames.length; i++) {
        const response = await fetch(endpointUrl, {
            method: "POST",
            headers: {
                "Accept" : "application/json",
                "Content-Type": "application/json",
                "Authorization" : "Bearer" + " " + googleAuthToken
            },
            body: JSON.stringify(
                {
                    "snippet": {
                        "playlistId": youtubePlaylistId,
                        "position": i,
                        "resourceId": {
                            "kind": "youtube#video",
                            "videoId": youtubeSongIds[i]
                        }
                    }
                }
            )
        })

        const data = await response.json()

        //get the data and check the error code, if failed, print to final screen to tell user x song was not added
    }
}

function getKeyword(artist, song) {
    return artist.replace(" ", "%20") + "%20" + song.replace(" ", "%20")
}

function sendError(message) {
    chrome.storage.session.set({"err": message})
    console.log("saved to chrome.storage: " + message)

    // NOTE: trying to make it so that popup window auto-refreshes every time an error occurs, but this below code doesn't work
    chrome.action.setPopup(
        {
            popup: "../Front End/popup.html"
        }
    )
}