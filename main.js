(() => {
  const imageFilePath = "assets/images/";
  const numImages = 34;
  const flipRandomPercent = 2;
  const isEnabled = true;

  const IMG_SELECTOR = "ytd-thumbnail img, img.yt-core-image";
  const DIV_SELECTOR = ".ytp-videowall-still-image";
  const MARK = "komifyDone";

  function getImageURL(index) {
    return chrome.runtime.getURL(`${imageFilePath}${index}.png`);
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getRandomImageIndex() {
    return getRandomInt(numImages); 
  }

  function shouldFlip() {
    return getRandomInt(flipRandomPercent) === 1;
  }

  function komifyImg(img) {
    if (!img || img.nodeName !== "IMG") return;

    if (img.dataset[MARK] === "1") return;
    img.dataset[MARK] = "1";

    const url = getImageURL(getRandomImageIndex());

    if (!img.dataset.originalSrc) img.dataset.originalSrc = img.currentSrc || img.src || "";

    img.removeAttribute("srcset");
    img.removeAttribute("sizes");

    img.src = url;

    if (shouldFlip()) img.style.transform = "scaleX(-1)";
  }

  function komifyDiv(div) {
    if (!div || div.nodeName !== "DIV") return;
    if (div.dataset[MARK] === "1") return;
    div.dataset[MARK] = "1";

    const url = getImageURL(getRandomImageIndex());
    div.style.backgroundImage = `url("${url}")`;
    div.style.backgroundSize = "cover";
    div.style.backgroundPosition = "center";
  }

  function process() {
    document.querySelectorAll(IMG_SELECTOR).forEach(komifyImg);
    document.querySelectorAll(DIV_SELECTOR).forEach(komifyDiv);
  }


  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      process();
    }, 300);
  }

  if (isEnabled) {
    process();

    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          schedule();
          break;
        }
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });
  }
})();
