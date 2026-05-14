// Background service worker
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'copy_to_clipboard') {
    // Copy JSON to clipboard via offscreen (MV3)
    const text = JSON.stringify(msg.data);
    navigator.clipboard.writeText(text).catch(() => {});
    sendResponse({ ok: true });
  }
  return true;
});
