const YOUTUBE_API_KEY = "AIzaSyDjeaR3-LeYmrAIw-VwQ_V2YuEPd6KHQC0"

const songNames = []
const artistNames = []
const youtubeSongIds = []

let keepRunning = true
let spotifyPlaylistUrl = ""
let spotifyPlaylistId = "" 
let youtubePlaylistName = ""

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message) {
        spotifyPlaylistUrl = request.message
        getPlaylistId(spotifyPlaylistUrl)

        if (spotifyPlaylistId == false) {
            keepRunning = false
            sendError("invalid playlist link inputted.")
            return
        }

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
        sendError("could not authenticate with Spotify.")
        return
    }

    else {
        let spotifyAuthToken = parseUrl(redirectUrl)

        if (spotifyAuthToken == false) {
            keepRunning = false
            sendError("invalid playlist link inputted.")
            return
        }

        await importPlaylist(spotifyAuthToken, spotifyPlaylistId)

        if (keepRunning == false) {
            return
        }

        chrome.identity.getAuthToken(
            {
                interactive: true
            }, 
            youtubeCallback
        )
    }        
}

async function youtubeCallback(googleAuthToken) {
    if (keepRunning == false) {
        return
    }

    if (chrome.runtime.lastError) {
        sendError("could not authenticate with Google.")
        return
    }

    else {
        await searchYoutube(googleAuthToken)
        createPlaylist(googleAuthToken)

        if (keepRunning == false) {
            return
        }

        sendSucessMessage();
    } 
}

// Spotify
function getPlaylistId(playlistUrl) {
    try {
        spotifyPlaylistId = playlistUrl.split("/")[4]
        spotifyPlaylistId = spotifyPlaylistId.split("?")[0]
    }

    catch(e) {
        spotifyPlaylistId = false
    }

    return spotifyPlaylistId
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
    try {
        let accessToken = accessUrl.split("=")[1]
        accessToken = accessToken.split("&")[0]

        return accessToken
    }
    
    catch(e) {
        return false
    }    
}

async function importPlaylist(spotifyAuthToken, spotifyPlaylistId) {
    let limit = 2
    let spotifyEndpointPlaylistUrl = `https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/tracks`

    await getPlaylistName(spotifyAuthToken, spotifyPlaylistId)

    const response = await fetch(spotifyEndpointPlaylistUrl, {
        method: "GET",
        headers: { 
            "Accept" : "application/json",
            "Content-Type":"application/json",
            "Authorization" : "Bearer" + " " + spotifyAuthToken
        }
    })

    const data = await response.json()

    if (data.error) {
        sendError("Spotify playlist import failed; is this a private playlist that is not shared with your current Spotify account?")
        keepRunning = false
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

async function getPlaylistName(spotifyAuthToken, spotifyPlaylistId) {
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

    youtubePlaylistName = data.name + " | Import from Spotify"
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

        if (data.error) {
            sendError("the track " + songNames[i] + " could not be added.")
        }

        else {
            youtubeSongIds[i] = data.items[0].id.videoId
        }
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

    if (data.error) {
        sendError("YouTube playlist creation failed.")
        keepRunning = false
    }

    else {
        let youtubePlaylistId = data.id
        addSongs(youtubePlaylistId, googleAuthToken) 
    }
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
    }
}

function getKeyword(artist, song) {
    return artist.replace(" ", "%20") + "%20" + song.replace(" ", "%20")
}

function sendError(errorMessage) {
    chrome.notifications.create({
        type: "basic",
        // TO-DO: EDIT ICONURL
        iconUrl: "https://images.ctfassets.net/hrltx12pl8hq/3j5RylRv1ZdswxcBaMi0y7/b84fa97296bd2350db6ea194c0dce7db/Music_Icon.jpg",
        title: "Spotify to YouTube Migration",
        message: "An error occurred: " + errorMessage,
    });
}

function sendSucessMessage() {
    chrome.notifications.create({
        type: "basic",
        // TO-DO: EDIT ICONURL
        iconUrl: "https://images.ctfassets.net/hrltx12pl8hq/3j5RylRv1ZdswxcBaMi0y7/b84fa97296bd2350db6ea194c0dce7db/Music_Icon.jpg",
        title: "Spotify to YouTube Migration",
        message: "Playlist migrated successfully!",
    });
}