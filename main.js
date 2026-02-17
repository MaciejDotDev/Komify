(() => {
  const imageFilePath = "assets/images/";
  const numImages = 35;
  const flipRandomPercent = 2;
  const isEnabled = true;

  const IMG_SELECTOR = "ytd-thumbnail img, img.yt-core-image";
  const DIV_SELECTOR = ".ytp-videowall-still-image";

  const handled = new WeakSet();
  const observers = new WeakMap();

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

  function setImgToKomi(img) {
    const url = getImageURL(pickIndex());
    img.dataset.komiUrl = url;

    img.removeAttribute("srcset");
    img.removeAttribute("sizes");

    img.src = url;

    if (shouldFlip()) img.style.transform = "scaleX(-1)";
  }

  function makeSticky(img) {
    if (observers.has(img)) return;

    const obs = new MutationObserver((mutations) => {
      const desired = img.dataset.komiUrl;
      if (!desired) return;

      const changed = mutations.some(m => m.type === "attributes" && (m.attributeName === "src" || m.attributeName === "srcset"));
      if (!changed) return;

      if (img.src !== desired) {
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.src = desired;
      }
    });

    obs.observe(img, { attributes: true, attributeFilter: ["src", "srcset", "sizes"] });
    observers.set(img, obs);
  }

  function komifyImg(img) {
    if (!img || img.nodeName !== "IMG") return;

    if (!handled.has(img)) {
      handled.add(img);
      setImgToKomi(img);
      makeSticky(img);
    } else {
      if (!img.dataset.komiUrl) {
        setImgToKomi(img);
      }
    }
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
    console.log("Komify injected");
    process();

    const pageObs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          schedule();
          break;
        }
      }
    });

    pageObs.observe(document.body, { childList: true, subtree: true });
  }
})();
