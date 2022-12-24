document.getElementById("authenticate_btn").addEventListener("click", sendToSpotifyAuth);

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