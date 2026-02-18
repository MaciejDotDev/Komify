(() => {
  const imageFilePath = "assets/images/";
  const numImages = 35; // 0..34
  const flipRandomPercent = 2;

  const OVERLAY_CLASS = "komify-overlay";
  const CONTAINER_CLASS = "komify-container";

  function getImageURL(index) {
    return chrome.runtime.getURL(`${imageFilePath}${index}.png`);
  }

  function randInt(max) {
    return Math.floor(Math.random() * max);
  }

  function pickIndex() {
    return randInt(numImages); // 0..34
  }

  function shouldFlip() {
    return randInt(flipRandomPercent) === 1;
  }

  function isVideoThumbnailImg(img) {
    const src = img.currentSrc || img.src || "";
    return typeof src === "string" && src.includes("i.ytimg.com/vi/");
  }

  function findOverlayHost(img) {
    return (
      img.closest("a#thumbnail") ||
      img.closest("ytd-thumbnail") ||
      img.parentElement
    );
  }

  function ensureContainerStyles(host) {
    if (!host) return;

    const cs = getComputedStyle(host);
    if (cs.position === "static") host.style.position = "relative";

    host.style.zIndex = host.style.zIndex || "0";
  }

  function addOverlay(host) {
    if (!host) return;

    if (host.classList.contains(CONTAINER_CLASS) && host.querySelector(`.${OVERLAY_CLASS}`)) return;

    host.classList.add(CONTAINER_CLASS);

    const overlay = document.createElement("img");
    overlay.className = OVERLAY_CLASS;
    overlay.alt = "";
    overlay.decoding = "async";
    overlay.loading = "eager";
    overlay.src = getImageURL(pickIndex());

    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.objectFit = "contain";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "999999"; 
    overlay.style.opacity = "0.7";

    if (shouldFlip()) overlay.style.transform = "scaleX(-1)";

    overlay.addEventListener(
      "error",
      () => {
        overlay.remove();
      },
      { once: true }
    );

    ensureContainerStyles(host);
    host.appendChild(overlay);
  }

  function process() {
    document.querySelectorAll("img").forEach((img) => {
      if (!isVideoThumbnailImg(img)) return;

      const host = findOverlayHost(img);
      if (!host) return;

      addOverlay(host);
    });
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      process();
    }, 250);
  }

  console.log("[Komify] injected overlay mode. Example:", getImageURL(0));

  process();

  const pageObs = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.addedNodes && m.addedNodes.length) {
        schedule();
        break;
      }
    }
  });

  pageObs.observe(document.body, { childList: true, subtree: true });
})();
