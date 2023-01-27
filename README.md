# Spotify-to-Youtube Playlist Migration

## Contributors: Qianxu Guo, Leo You

## This chrome extension helps users migrate their Spotify playlists to a Youtube playlist.

### Our process:
+ Collect user's Spotify playlist link, Spotify authentication, and Google authentication.
+ Verify playlist link and request the playlist's information from Spotify.
+ Sort through the returned JSON and collect songs' names and artists in an array.
+ Generate a Youtube playlist and add each song.

The result would be a a plylist with all the user's songs loaded when opening Youtube afterwards.

### Contraints:
+ This app is not launched due to the developer token limitations for using Youtube's and Spotify's APIs.

