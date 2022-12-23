document.getElementById("authenticate_btn").addEventListener("click", sendToAuth);

function log() {
  console.log("your mom");
}

function sendToAuthResponse(response) {
  if (response.message == "success")
    window.close();
} 

function sendToAuth() {
  chrome.runtime.sendMessage({message: "login"}, sendToAuthResponse)
}