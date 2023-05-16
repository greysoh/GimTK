  export function injectAnomaly() {
    const scriptElem = document.createElement("script");
    scriptElem.src = chrome.runtime.getURL("libs/anomalyLdr.mjs");
    scriptElem.type = "module";
    
    scriptElem.onload = function() {
      this.remove();
    };

    (document.head || document.documentElement).appendChild(scriptElem);
    console.log("Injected Anomaly.");
  }