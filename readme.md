# YouTube Spot Finder
YouTube Spot Finder is a Chrome Extension that helps you find the spot you were looking for in a video, as well as save spots for later when you come back. While it's ideal for 1 hour+ long videos (like concerts, podcasts, etc.), it's also handy for shorter videos as well.

## Screenshot

![Screenshot](https://raw.githubusercontent.com/dahopkin/YoutubeSpotFinder/master/images/screenshots/whole-ui.jpg)
## Features
 **Find a Spot:**  Spot Finder works similar to the way you would normally find a spot in a YouTube video: you click to a certain time, judge whether what you wanted is before or after where you are, then click to another spot accordingly. Spot Finder streamlines this process by jumping to the middle each time while keeping track of where it was so you don't have to.
 
Finding a spot in a video works like this:

1.) Click the "Find" button, and the Spot Finder will jump to the middle of the video.

![Screenshot](https://raw.githubusercontent.com/dahopkin/YoutubeSpotFinder/master/images/screenshots/cut-ui-find.jpg)

2.) If what you want is at or close enough to where you are now, click "Stop" to end the search. 

![Screenshot](https://raw.githubusercontent.com/dahopkin/YoutubeSpotFinder/master/images/screenshots/cut-ui-stop.jpg)

If it's before that, click "Before This". 

![Screenshot](https://raw.githubusercontent.com/dahopkin/YoutubeSpotFinder/master/images/screenshots/cut-ui-before.jpg)

If it's after, click "After This". 

![Screenshot](https://raw.githubusercontent.com/dahopkin/YoutubeSpotFinder/master/images/screenshots/cut-ui-after.jpg)

With "Before" and "After", the Spot Finder will jump to new "middles" depending on which you pick, cutting it's "search range" in half each time. The red-and-white progress bar will indicate the current progress of the search (because YouTube's controls are invisible while using this).

![Screenshot](https://raw.githubusercontent.com/dahopkin/YoutubeSpotFinder/master/images/screenshots/cut-ui-narrow.jpg)

3.) Repeat Step 2 until you find what you want. Note that the Finder will automatically stop if the search range has become too narrow. You can click the "Undo" button to go back a step if you make a mistake.


 **Bookmarking:** You can save spots in a video you like for later. Hit the "Bookmark Current Time" button and enter your description (or nothing) to save the current time to a bookmark. Bookmarks will re-appear on the page you saved them for when you visit the page again. They can be edited and deleted. 

 ![Screenshot](https://raw.githubusercontent.com/dahopkin/YoutubeSpotFinder/master/images/screenshots/cut-ui-bookmark.jpg)

 Tech Note: right now, the bookmarks are saved in chrome's local extension storage, because the sync storage is only 100KB big (as opposed to local's 5MB). This means that bookmarks will not sync to other machines when you log in with your google account.

 **Going Back/Forward:** You can click these buttons to go back/forward 15, 30, or 60 seconds in a video. 

 ![Screenshot](https://raw.githubusercontent.com/dahopkin/YoutubeSpotFinder/master/images/screenshots/rewind-fast-forward.jpg)
 
## Download
The extension can be downloade from the Chrome Web Store [Here](https://chrome.google.com/webstore/detail/youtube-spot-finder/knhopkbnanmecaabnkopphkpjfgmgioh). It is still being actively worked on right now, so updates will be frequent. If you want to play around with the code yourself, you're free to download it and load it into Chrome as an unpacked extension for testing.

## Community
- **Find a bug?** [Open an issue](https://github.com/dahopkin/YoutubeJumpTo/issues). Try to be as specific as possible.
- **Have a feature request?** [Open an issue](https://github.com/dahopkin/YoutubeJumpTo/issues). You can just suggest it, but please also describe why this feature would be useful (if it isn't obvious).

## License
[MIT License](https://raw.githubusercontent.com/dahopkin/YoutubeSpotFinder/master/LICENSE)