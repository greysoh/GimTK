import { manualScale } from "./automations/manualCtrlScale.mjs";
import { setZoom } from "./automations/scale.mjs";
import { aimbot } from "./cheats/aimbot.mjs";

import { extensionID } from "../config.mjs";

export async function main(game) {
  let port = chrome.runtime.connect(extensionID(), {
    name: "PostAnomaly"
  });

  port.onMessage.addListener((msg) => {
    if (typeof msg != "object") return;

    switch (msg.type) {
      case "setZoom": {
        setZoom(msg.xZoom, msg.yZoom, game);
        break;
      }

      case "toggleAimbot": {
        aimbot(game);
        break;
      }

      case "toggleManualScale": {
        manualScale(game);
        break;
      }
    }
  });

  async function constantKeepalive() {
    while (true) {
      try {
        port.postMessage({ type: "keepalive" });
      } catch (e) {
        console.error("PostAnomaly: Failed keepalive! Worker is probably napping. Attempting to force it awake!");
        port.disconnect();
  
        port = chrome.runtime.connect(extensionID(), {
          name: "PostAnomaly"
        });
      }
  
      await new Promise((i) => setTimeout(i, 100));
    }
  }

  async function connectionKeepalive() {
    while (true) {
      try {
        chrome.runtime.connect(extensionID(), {
          name: "KeepaliveSpoof"
        });
        
        console.log("PostAnomaly: Running periodic keepalive connection...");
      } catch (e) {
        //
      }

      await new Promise((i) => setTimeout(i, 20*1000));
    }
  }

  constantKeepalive();
  connectionKeepalive();
}