(() => {
  const imageFilePath = "assets/images/";
  const numImages = 34;
  const flipRandomPercent = 2;
  const isEnabled = true;

  const SELECTOR = "ytd-thumbnail img, .ytp-videowall-still-image";
  const MARKER_CLASS = "komify-applied";

  function getImageURL(index) {
    return chrome.runtime.getURL(`${imageFilePath}${index}.png`);
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getRandomImage() {
    return getRandomInt(numImages); 
  }

  function getImageState() {
    return getRandomInt(flipRandomPercent) === 1;
  }

  function applyToImg(img) {
    const parent = img.parentElement;
    if (!parent) return;

    if (parent.classList.contains(MARKER_CLASS)) return;
    parent.classList.add(MARKER_CLASS);

    const overlay = document.createElement("img");
    overlay.src = getImageURL(getRandomImage());
    overlay.alt = "";
    overlay.decoding = "async";
    overlay.loading = "eager";

    const parentStyle = getComputedStyle(parent);
    if (parentStyle.position === "static") parent.style.position = "relative";

    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.objectFit = "cover";
    overlay.style.zIndex = "9999";
    overlay.style.pointerEvents = "none";

    if (getImageState()) overlay.style.transform = "scaleX(-1)";

    overlay.addEventListener("error", () => {
      parent.classList.remove(MARKER_CLASS);
      overlay.remove();
    });

    parent.appendChild(overlay);
  }

  function applyToVideowall(div) {
    if (div.classList.contains(MARKER_CLASS)) return;
    div.classList.add(MARKER_CLASS);

    const url = getImageURL(getRandomImage());
    div.style.backgroundImage = `url("${url}"), ${div.style.backgroundImage || "none"}`;
    div.style.backgroundSize = "cover";
  }

  function processAll() {
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (el.nodeName === "IMG") applyToImg(el);
      else if (el.nodeName === "DIV") applyToVideowall(el);
    });
  }

  let scheduled = false;
  function scheduleProcess() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      processAll();
    }, 250);
  }

  if (isEnabled) {
    processAll();

    const obs = new MutationObserver((mutations) => {
        for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          scheduleProcess();
          break;
        }
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });
  }
})();
