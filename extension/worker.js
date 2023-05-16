const portList = [];

chrome.runtime.onConnectExternal.addListener(async(port) => {
  if (port.name == "KeepaliveSpoof") return;
  
  // HTTP RFC 772 - Not cached long enough
  // And maybe HTTP RFC 775 - Out of cash

  const constPort = port; // Making it constant keeps it alive for longer before it dies off
  portList.push(constPort);

  port.onDisconnect(() => {
    portList.splice(portList.indexOf(port), 1);
  });

  while (true) {
    await new Promise((i) => setTimeout(i, 200));
  }
});

// onMessage used for broadcasting message to PostAnomaly
chrome.runtime.onMessage.addListener(async(resp, sender, sendResponse) => {  
  for (const port of portList) {
    try {
      port.postMessage(resp);
    } catch (e) {
      console.warn("Port gone bad, had to remove!");
      portList.splice(portList.indexOf(port), 1);
    }
  }
})

chrome.runtime.onConnect.addListener(async(port) => {
  console.log("fetch-proxy: Recieved new port connection!");

  port.onMessage.addListener(async(data) => {
    if (typeof data != "object") return port.postMessage({ success: false });
    console.log("fetch-proxy: Recieved request for URL '%s' and body '%s'", data.url, JSON.stringify(data.body));
  
    const dataMode = data.mode;
    const dataURL = data.url;
    data.mode = undefined;
    data.url = undefined;
  
    try {
      const fetchResult = await fetch(dataURL, data);
  
      return port.postMessage({
        success: true,
        data: dataMode == "json" ? await fetchResult.json() : await fetchResult.text()
      });
    } catch (e) {
      console.error("fetch-proxy: Failed request! URL is '%s'. Trace:\n", data.url, e);
      return port.postMessage({ success: false });
    }
  });
});