document.getElementById("authenticate_btn").addEventListener("click", main)

function main() {
  let input = document.getElementById("playlist_link").value

  if (!isValidLink(input)) {
    sendError("invalid link inputted.")
  }
  
  else {
    chrome.runtime.sendMessage({message: input})
  }
}

function isValidLink(input) {
  try {
    return Boolean(new URL(input))
  }

  catch(e) {
    return false
  }
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