

(() => {
    const imageFilePath = "assets/images/";
    const numImages = 127;
    const flipRandomPercent = 2; //NOTE: the number represents how many numbers to randomly choose. bigger = less likely, smaller = more likely.
    var isEnabled = true;

    //code to link stylesheet with anims
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.extension.getURL('anim.css');
    document.head.appendChild(link);


    //NOTE: The purpose of this function is to get all YouTube thumbnails on the page
    function getThumbnails() {
        const thumbnailQuery = "ytd-thumbnail:not(.ytd-video-preview, .ytd-rich-grid-slim-media) a > yt-image > img.yt-core-image:only-child:not(.yt-core-attributed-string__image-element),.ytp-videowall-still-image:not([style*='extension:'])";

        const thumbnail = document.querySelectorAll(thumbnailQuery);

        thumbnail.forEach((image) => {
            let counter = Math.random() > 0.001 ? 1 : 20;
            let i = 0;
            for (i = 0; i < counter; i++) {
                const index = getRandomImage();
                let flip = getImageState();
                let url = getImageURL(index);
                applyThumbnails(image, url, flip);
            }
        }
        )
    }

    //NOTE: The purpose of this function is to return the url of an image
    function getImageURL(index) {
        return chrome.runtime.getURL(`${imageFilePath}${index}.png`);
    }

    //NOTE: The purpose of this function is to apply the thumbnail images to the thumbnails on YouTube.com
    function applyThumbnails(image, imageUrl, flip = false) {
        if (image.nodeName == "IMG") {
            const overlay = document.createElement("img");
            overlay.src = imageUrl;
            overlay.style.position = "absolute";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.zIndex = "0";
            if (flip) {
                overlay.style.transform = "scaleX(-1)"; //flips the image
            }
            image.style.position = "relative";
            image.parentElement.appendChild(overlay);
        }
        else if (image.nodeName == "DIV") {
            image.style.backgroundImage = `url("${imageUrl}"), ` + image.style.backgroundImage;
        }
    }

    //NOTE: The purpose of this function is to take in a max number, and return a random number from 0 to that max number
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    //NOTE: The purpose of this function is to get a random image to display
    function getRandomImage() {
        //NOTE: percent is even across the board for any given image to be chosen

        let random = 0;
        random = getRandomInt(numImages + 1); //NOTE: +1 is because max is not inclusive
        return random;
    }

    //NOTE: The purpose of this function is to randomly determine whether or not to flip the image or not
    function getImageState() {
        //NOTE: percent to flip is default 50% when flipRandomPercent = 2

        let random = 0;
        random = getRandomInt(flipRandomPercent); //returns a random number from 0 to flipRandomPercent

        if (random === 1) {
            return true; //STATE: flip image
        }
        else {
            return false; //STATE: do not flip image
        }

    }

    //NOTE: The purpose of this function is to check if an image exists
    async function doesImageExist(index) {
        const url = getImageURL(index);

        return fetch(url).then(() => {
            return true
        }).catch(error => {
            return false
        })
    }

    //function to pick a random number
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    //function to pick a random animation
    function getRandomAnimation() {
        const animations = ['gorightappearleft', 'goleftappearright', 'explode', 'sniff', 'disappearAndReappear', 'shake', 'pulsate', 'walkOffScreen', 'spinAndBounce'];
        return animations[getRandomInt(animations.length)];
    }

    //function to add event listeners to the thumbnails
    function addEventListeners() {
        const thumbnails = document.querySelectorAll('ytd-thumbnail');
        thumbnails.forEach((thumbnail) => {
            thumbnail.addEventListener('mouseover', () => {
                thumbnail.style.animation = getRandomAnimation() + ' 1s';
            });
        });
    }

    //runs the functions
    if (isEnabled) //checks if the user has disabled the plugin or not
    {
        setInterval(getThumbnails, 100);
    }
}
)();
