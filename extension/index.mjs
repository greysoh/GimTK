// I'd like to file a feature request
//import { RbAPI, pingServer } from "./rbsvrAPI.mjs";

console.log(` ______     __     __    __     ______   __  __    
/\\  ___\\   /\\ \\   /\\ "-./  \\   /\\__  _\\ /\\ \\/ /    
\\ \\ \\__ \\  \\ \\ \\  \\ \\ \\-./\\ \\  \\/_/\\ \\/ \\ \\  _"-.  
 \\ \\_____\\  \\ \\_\\  \\ \\_\\ \\ \\_\\    \\ \\_\\  \\ \\_\\ \\_\\ 
  \\/_____/   \\/_/   \\/_/  \\/_/     \\/_/   \\/_/\\/_/ 
                                                   `);
console.log("GimTK is starting up...", "\n [x] Importing modules (and injecting Anomaly)...");
const runtimeErrors = [];

async function main() {
  // Even more core
  const { injectAnomaly } = await import("./libs/anomalyPreLdr.mjs");
  injectAnomaly();
  
  // Core
  const { Overlay, OverlayItem, OverlayItemToView } = await import("./libs/ui.mjs");
  const { RbAPI, pingServer } = await import("./libs/rbsvrAPI.mjs");

  // Cheats
  const { ripClassic } = await import("./cheats/ripclassic.mjs");
  const { autoClap } = await import("./cheats/autoclap.mjs");
  const { rip2D } = await import("./cheats/rip2d.mjs");

  // Binding library
  const { validateKeybindings, initKeybindings, rerender } = await import("./libs/keybindServer.mjs");
  console.log(" [x] Starting background task: Validate Keybindings...");
  validateKeybindings();

  console.log(" [x] Attempting to connect to RbAPI Server...");
  const serverResponse = await pingServer("http://127.0.0.1:8745/api/v1/ping");
  if (!serverResponse) console.log(" [x] Failed to ping server! Ensure that RbAPI is running for remote computer control!");

  console.log(` [x]${serverResponse ? " Success!" : ""} Initializing msgApi...`);
  const msgApi = new RbAPI("http://127.0.0.1:8745");

  console.log(" [x] Initializing overlay...");
  const overlay = new Overlay("GimTK-prerelease", true); 
  overlay.initializeMainView();

  OverlayItemToView("Automations...", "Main", overlay);
  
  // Simple way to disable menu if no response
  if (!serverResponse) {
    overlay.createView("Cheats...");
    overlay.createView("Macros...");

    runtimeErrors.push("Cheats are disabled due to no Input API response.");
    runtimeErrors.push("Macros are disabled due to no Input API response.");

    overlay.appendToView("Main", [
      OverlayItem("=> View Runtime Errors", () => {
        alert(`${runtimeErrors.length} error(s) generated.\n${runtimeErrors.join("\n")}`);
      })
    ])
  } else {
    OverlayItemToView("Cheats...", "Main", overlay);
    
    overlay.appendToView("Main", [
      OverlayItem("=> Macros...", async() => {
        await rerender(overlay);

        overlay.setActiveView("MacroBindings");
        overlay.render();
      })
    ]);

    initKeybindings(msgApi);
  }

  OverlayItemToView("2D Options...", "Automations...", overlay);

  overlay.appendToView("Main", [
    // We don't need to clear the active view here, but I'm lazy.
    OverlayItem("Quit", () => overlay.clearActiveView())
  ]);
  
  overlay.appendToView("Automations...", [
    OverlayItem("Quit", () => overlay.clearActiveView())
  ]);

  overlay.appendToView("2D Options...", [
    OverlayItem("Set Zoom Level", async() => {
      const zoomLevelRaw = prompt("Set the zoom ratio:");
      if (parseInt(zoomLevelRaw) != parseInt(zoomLevelRaw)) {
        return alert("Zoom ratio not a number, or a paradox is happening.");
      }

      await chrome.runtime.sendMessage({
        type: "setZoom",
        xZoom: parseFloat(zoomLevelRaw),
        yZoom: parseFloat(zoomLevelRaw)
      });
    }),
    OverlayItem("Reset Zoom Level", async() => {
      await chrome.runtime.sendMessage({
        type: "setZoom",
        xZoom: 1.39,
        yZoom: 1.39
      });
    }),
    OverlayItem("Enable Game Zoom", async() => {
      await chrome.runtime.sendMessage({
        type: "toggleManualScale"
      });
    }),

    OverlayItem("Quit", () => overlay.clearActiveView())
  ]);

  OverlayItemToView("Classic...", "Cheats...", overlay);
  OverlayItemToView("2D...", "Cheats...", overlay);

  overlay.appendToView("Classic...", [
    OverlayItem("Toggle RipClassic", () => ripClassic(msgApi)),
    OverlayItem("Enable AutoClapper", () => autoClap(msgApi)),

    OverlayItem("Quit", () => overlay.clearActiveView())
  ]);

  overlay.appendToView("2D...", [
    OverlayItem("Toggle Rip2D", () => rip2D(msgApi)),
    
    OverlayItem("Toggle Aimbot", async() => {
      await chrome.runtime.sendMessage({
        type: "toggleAimbot"
      });
    }),

    OverlayItem("Quit", () => overlay.clearActiveView())
  ]);

  overlay.appendToView("Cheats...", [
    OverlayItem("Quit", () => overlay.clearActiveView())
  ]);

  // DOMContentLoaded doesn't fire here, so I have to do this VERY sketchy loop.
  // Content isolation has forced my hand.

  while (true) {
    try {
      document.body.appendChild(overlay.fetchDiv());
      return true;
    } catch (e) {
      //
    }

    await new Promise((i) => setTimeout(i, 200));
  }
};

main();