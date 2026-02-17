console.log("POPUP JS LOADED v0.2.9", chrome?.runtime?.id);

document.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("DisableButton");

  const { komifyEnabled } = await chrome.storage.sync.get({ komifyEnabled: true });
  btn.textContent = komifyEnabled ? "Disable" : "Enable";

  btn.addEventListener("click", async () => {
    const { komifyEnabled: current } = await chrome.storage.sync.get({ komifyEnabled: true });
    const next = !current;

    await chrome.storage.sync.set({ komifyEnabled: next });
    btn.textContent = next ? "Disable" : "Enable";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) chrome.tabs.sendMessage(tab.id, { type: "KOMIFY_TOGGLE" });
  });
});
