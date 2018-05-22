# YouTube Spot Finder
YouTube Spot Finder is a Chrome Extension that helps you find the spot you were looking for in a video, as well as save it for later.

##Screenshot

![Screenshot](https://raw.githubusercontent.com/dahopkin/YoutubeSpotFinder/master/images/screenshots/whole-ui.jpg)
## Features
 **Find a Spot:**  Spot Finder works similar to the way you would find a spot in a YouTube video normally: by jumping to a spot, and deciding whether to jump before or after depending on where you went. Spot Finder simply keeps track of where you were so you don't have to.
 
Finding a spot in a video works like this:

1.) Click the "Find" button, and the Spot Finder will jump to the middle of the video.

2.) If what you want is at or close enough to where you are now, click "Stop" to end the search. 
If it's before that, click "Before This". 
If it's after, click "After This". 
With "Before" and "After", the Spot Finder will jump to new "middles" depending on which you pick, cutting it's "search range" in half each time. 

3.) Repeat Step 2 until you find what you want. Note that the Finder will automatically stop if the search range has become too narrow. You can click the "Undo" button to go back a step if you make a mistake.


 **Bookmarking:** You can save spots in a video you like for later. Hit the "Bookmark Current Time" button and enter your description (or nothing) to save the current time to a bookmark. Bookmarks will re-appear on the page you saved them for when you visit the page again. They can be edited and deleted. 

 Tech Note: right now, the bookmarks are saved in chrome's local extension storage, because the sync storage is only 100KB big (as opposed to local's 5MB).

 **Going Back/Forward:** You can click these buttons to go back/forward 15, 30, or 60 seconds in a video. 
 
## Download
The extension is still being worked on, so it's not available for download on the Chrome Web Store yet. However, if you want to try it out or play around with the code yourself, you're free to download it and load it in chrome as an unpacked extension.

## Community
- **Find a bug?** [Open an issue](https://github.com/dahopkin/YoutubeJumpTo/issues). Try to be as specific as possible.
- **Have a feature request?** [Open an issue](https://github.com/dahopkin/YoutubeJumpTo/issues). You can just suggest it, but please also describe why this feature would be useful (if it isn't obvious).