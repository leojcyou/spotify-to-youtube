document.getElementById("spotify_authenticate_btn").addEventListener("click", sendToSpotifyAuth);
document.getElementById("google_authenticate_btn").addEventListener("click", sendToGoogleAuth);

function log() {
  console.log("your mom");
}

function sendToAuthResponse(response) {
  if (response.message == "success")
    window.close();
}

function sendToSpotifyAuth() {
  chrome.runtime.sendMessage({message: "spotify login"})
}

function sendToGoogleAuth() {
  chrome.runtime.sendMessage({message: "google token"})
}


