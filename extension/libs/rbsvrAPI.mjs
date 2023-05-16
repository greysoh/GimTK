// FIXME: This is sortof a hack.
function portOneWay(name, msg) {
  return new Promise((resolve, reject) => {
    const port = chrome.runtime.connect({ name });

    port.onMessage.addListener((msg) => {
      port.disconnect();
      return resolve(msg);
    });

    port.postMessage(msg);
  })
}

async function fetchProxy(url, params) {
  const workerParams = {
    url,
    mode: "text",
    ...params
  }

  const msg = await portOneWay("rbsvrProxy", workerParams);
  if (!msg) throw new Error("Recieved no response!");
  if (!msg.success) throw new Error("Failed to fetch (see worker code for trace)");

  return {
    async json() {
      return JSON.parse(msg.data);
    },

    async text() {
      return msg.data;
    },

    ok: true
  }
}

async function post(url, body) {
  const data = await fetchProxy(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(body)
  });

  return await data.json();
}

export async function pingServer(url) {
  try {
    const response = await fetchProxy(url, { method: 'GET', timeout: 1000 });
    return response.ok;
  } catch {
    return false;
  }
}

export class RbAPI {
  constructor(url) {
    this.url = url;
  }

  async sendKey(key) {
    console.log(key);
    if (!key) throw new Error("Missing key");

    // TODO: Make lookup table to convert between Robot.JS and DOM
    const keyResp = await post(this.url + "/api/v1/keyboard/tap", {
      key: key
    });

    if (!keyResp.success) throw new Error("[api] " + keyResp.error);
    return true;
  }

  async pressAndHoldKey(key, ms) {
    if (!key) throw new Error("Missing key");
    if (!ms) throw new Error("Missing milliseconds");
    
    // TODO: Make lookup table to convert between Robot.JS and DOM
    const keyResp = await post(this.url + "/api/v1/keyboard/hold", {
      key,
      ms
    });

    if (!keyResp.success) throw new Error(keyResp.error);
    return true;
  }

  async type(string) {
    if (!string) throw new Error("Missing string parameter");

    const keyResp = await post(this.url + "/api/v1/keyboard/type", {
      string
    });

    if (!keyResp.success) throw new Error(keyResp.error);
    return true;
  }

  async moveMouse(x, y) {
    if (!x) throw new Error("Missing mouse 'x'");
    if (!y) throw new Error("Missing mouse 'y'");

    const mouseResp = await post(this.url + "/api/v1/mouse/move", {
      x,
      y
    });

    if (!mouseResp.success) throw new Error(mouseResp.error);
    return true;
  }

  async clickMouse(x, y, button, doubleClick, disableMouseMove) {
    if (!x) throw new Error("Missing mouse 'x'");
    if (!y) throw new Error("Missing mouse 'y'");

    if (button) {
      // This check could be better, but I'm lazy.
      if (button != "left" && button != "middle" && button != "right") {
        throw new Error("Button must be 'left', 'middle', or 'right'!");
      }
    }

    const mouseResp = await post(this.url + "/api/v1/mouse/click", {
      x,
      y,
      disableMouseMove,
      button: button ?? "left",
      doubleClick: doubleClick ?? false
    }); 

    if (!mouseResp.success) throw new Error(mouseResp.error);
    return true;
  }
}