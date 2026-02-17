(() => {

    const imageFilePath = "assets/images/";
    const numImages = 35; 
    const flipRandomPercent = 2;

    const IMG_SELECTOR = "ytd-thumbnail img, img.yt-core-image";
    const DIV_SELECTOR = ".ytp-videowall-still-image";

    let pageObserver = null;
    const imgObservers = new WeakMap();
    const handledImages = new WeakSet();

    function getImageURL(index) {
        return chrome.runtime.getURL(`${imageFilePath}${index}.png`);
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function pickIndex() {
        return getRandomInt(numImages);
    }

    function shouldFlip() {
        return getRandomInt(flipRandomPercent) === 1;
    }

    function setKomi(img) {
        const url = getImageURL(pickIndex());

        img.dataset.komiUrl = url;

        img.removeAttribute("srcset");
        img.removeAttribute("sizes");

        img.src = url;

        if (shouldFlip()) {
            img.style.transform = "scaleX(-1)";
        }
    }

    function makeSticky(img) {
        if (imgObservers.has(img)) return;

        const observer = new MutationObserver((mutations) => {
            const desired = img.dataset.komiUrl;
            if (!desired) return;

            const changed = mutations.some(m =>
                m.type === "attributes" &&
                (m.attributeName === "src" ||
                    m.attributeName === "srcset" ||
                    m.attributeName === "sizes")
            );

            if (!changed) return;

            if (img.src !== desired) {
                img.removeAttribute("srcset");
                img.removeAttribute("sizes");
                img.src = desired;
            }
        });

        observer.observe(img, {
            attributes: true,
            attributeFilter: ["src", "srcset", "sizes"]
        });

        imgObservers.set(img, observer);
    }

    function komifyImage(img) {
        if (!img || img.nodeName !== "IMG") return;
        if (handledImages.has(img)) return;

        handledImages.add(img);

        setKomi(img);
        makeSticky(img);
    }

    function komifyDiv(div) {
        if (!div || div.nodeName !== "DIV") return;
        if (div.dataset.komifyDone === "1") return;

        div.dataset.komifyDone = "1";

        const url = getImageURL(pickIndex());
        div.style.backgroundImage = `url("${url}")`;
        div.style.backgroundSize = "cover";
        div.style.backgroundPosition = "center";
    }

    function process() {
        document.querySelectorAll(IMG_SELECTOR).forEach(komifyImage);
        document.querySelectorAll(DIV_SELECTOR).forEach(komifyDiv);
    }

    let scheduled = false;
    function scheduleProcess() {
        if (scheduled) return;
        scheduled = true;

        setTimeout(() => {
            scheduled = false;
            process();
        }, 300);
    }

    function start() {
        if (pageObserver) return;

        console.log("Komify running");

        process();

        pageObserver = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.addedNodes && m.addedNodes.length) {
                    scheduleProcess();
                    break;
                }
            }
        });

        pageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function stop() {
        console.log("Komify stopped");

        if (pageObserver) {
            pageObserver.disconnect();
            pageObserver = null;
        }

        imgObservers.forEach((observer) => observer.disconnect());
        imgObservers.clear();
        handledImages.clear();
    }

    async function checkAndStart() {
        const { komifyEnabled } = await chrome.storage.sync.get({ komifyEnabled: true });

        if (komifyEnabled) {
            start();
        } else {
            stop();
        }
    }

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg?.type === "KOMIFY_TOGGLE") {
            checkAndStart();
        }
    });

    checkAndStart();

})();
