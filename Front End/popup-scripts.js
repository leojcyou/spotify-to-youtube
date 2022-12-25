document.getElementById("authenticate_btn").addEventListener("click", main);

function log() {
  console.log("your mom");
}

function sendToAuthResponse(response) {
  if (response.message == "success")
    window.close();
}

function sendToAuth(message){
  chrome.runtime.sendMessage({message: message})
  chrome.runtime.onMessage.addEventListener((request, sender, sendResponse) => {
    if (request.message == false)
    {
      console.log("failed")
      return false;
    }
    else if (request.message == true)
    {
      console.log("succeeded")
      return true;
    }

  })
}

function returnFailure(){
  return
}

function main(){
  sendToAuth("spotify login")
  sendToAuth("google token")
}