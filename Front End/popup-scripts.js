document.getElementById("authenticate_btn").addEventListener("click", main)

// NOTE: the below code block only gets called when popup window is refreshed
chrome.storage.session.get("err", function(result) {
  document.getElementById("error_message").textContent = result.err
  console.log("retrieving from storage: " + result.err)
})

function sendToAuth(message) {
  chrome.runtime.sendMessage({message: message})
  // chrome.runtime.onMessage.addEventListener((request, sender, sendResponse) => {
  //   if (request.message == false)
  //   {
  //     console.log("failed")
  //     return false;
  //   }
  //   else if (request.message == true)
  //   {
  //     console.log("succeeded")
  //     return true;
  //   }

  // })
}

function isValidLink(input) {
  try {
    return Boolean(new URL(input))
  }

  catch(e) {
    return false
  }
}

function main() {
  let input = document.getElementById("playlist_link").value



  if (!isValidLink(input)) 
    alert("bozo")
  
  else
    chrome.runtime.sendMessage({message: input})

  // message login and playlist confirmation

  // sendToAuth("google token")

  // message of login confirmation
}