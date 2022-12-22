console.log("ur mom");


const Spotify = require("spotify-api.js");
const client = new Spotify.Client({ token: 'token' });


const { Client } = require('spotify-api.js');

const client = await Client.create({
    token: {
        clientID: 'id', // Your spotify application client id.
        clientSecret: 'secret', // Your spotify application client secret.
        code: 'code', // The code search query from the web redirect. Do not use this field if your aim is to refresh the token.
        refreshToken: 'refreshToken', // Use this field only if your aim is to refresh your token instead of getting new one put your refresh token here.
        redirectURL: 'url' // The redirect url which you have used when redirected to the login page.
    }
});

console.log(client.token); // The current user token. 
await client.artists.follow("SOME ARTIST ID"); // And can use the api methods which are for current user if you have the paticular scopes...
