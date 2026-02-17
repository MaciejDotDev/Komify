(() => {
  const imageFilePath = "assets/images/";
  const numImages = 34;
  const flipRandomPercent = 2;
  const isEnabled = true;

  const SELECTOR = "ytd-thumbnail img, .ytp-videowall-still-image";

  function getImageURL(index) {
    return chrome.runtime.getURL(`${imageFilePath}${index}.png`);
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getRandomImage() {
    return getRandomInt(numImages + 1);
  }

  function getImageState() {
    return getRandomInt(flipRandomPercent) === 1;
  }

  function applyThumbnails(el, imageUrl, flip = false) {
    if (el.dataset.komifyApplied === "1") return;
    el.dataset.komifyApplied = "1";

    if (el.nodeName === "IMG") {
      const parent = el.parentElement;
      if (!parent) return;

      const parentStyle = getComputedStyle(parent);
      if (parentStyle.position === "static") parent.style.position = "relative";

      const overlay = document.createElement("img");
      overlay.src = imageUrl;
      overlay.style.position = "absolute";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.objectFit = "cover";
      overlay.style.zIndex = "2";
      overlay.style.pointerEvents = "none";

      if (flip) overlay.style.transform = "scaleX(-1)";

      parent.appendChild(overlay);
    } else if (el.nodeName === "DIV") {
      el.style.backgroundImage = `url("${imageUrl}"), ${el.style.backgroundImage || "none"}`;
      el.style.backgroundSize = "cover";
    }
  }

  function processAll() {
    document.querySelectorAll(SELECTOR).forEach((el) => {
      const url = getImageURL(getRandomImage());
      const flip = getImageState();
      applyThumbnails(el, url, flip);
    });
  }

  if (isEnabled) {
    processAll();

    const obs = new MutationObserver(() => processAll());
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
