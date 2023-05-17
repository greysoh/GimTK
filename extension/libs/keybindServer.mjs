import { OverlayItem } from "./ui.mjs";
import { defaultBindings, scopeNameBindings } from "./keybinds.mjs";

let spyingEnabled = false;
let spyKey = "";

const itemLookupTable = {};

document.addEventListener("keypress", (e) => {
  if (!spyingEnabled) return false;
  if (e.key != "Enter") spyKey = e.key;
});

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

async function getItem(item) {
  const data = await chrome.storage.sync.get([item]);
  itemLookupTable[item] = data[item];

  return data[item];
}

async function setItem(item, value) {
  const dataFun = {}; // I don't know of a good way to easily set a value of something using a variable and an object
  dataFun[item] = value;

  await chrome.storage.sync.set(dataFun);

  itemLookupTable[item] = value;
}

async function getKeyboardKeyAbsolute() {
  spyingEnabled = true;

  while (true) {
    if (spyKey) break;
    await new Promise((i) => setTimeout(i, 20));
  }

  const key = spyKey;
  spyKey = "";
  spyingEnabled = false;

  return key;
}

export async function validateKeybindings() {
  for (const binding of Object.keys(defaultBindings)) {
    if (!(await getItem(binding))) {
      console.log("Setting default binding for '%s'", binding);
      setItem(binding, defaultBindings[binding]);
    }
  }
}

export async function rerender(overlay) {
  if (!overlay.viewExists("MacroWaitPage")) {
    overlay.createView("MacroWaitPage");
    overlay.appendToView("MacroWaitPage", [
      OverlayItem("Enter a key to set this binding to. (case-sensitive)", () => {
        overlay.setActiveView("MacroWaitPage");
        overlay.render();
      })
    ]);
  };

  if (overlay.viewExists("MacroBindings")) overlay.destroyView("MacroBindings");
  overlay.createView("MacroBindings");

  for (const scope of Object.keys(scopeNameBindings)) {
    const title = `[${await getItem(scope)}] ${scopeNameBindings[scope]}`;

    overlay.appendToView("MacroBindings", [
      OverlayItem(title, async() => {
        overlay.setActiveView("MacroWaitPage");
        overlay.render();

        const key = await getKeyboardKeyAbsolute();
        overlay.forceStop();
        overlay.clearActiveView();

        await setItem(scope, key);
      })
    ]);
  }

  overlay.appendToView("MacroBindings", [
    OverlayItem("Quit", () => overlay.clearActiveView())
  ]);
}

let isZoomToggled = false;

export function initKeybindings(msgApi) {
  document.addEventListener("keydown", async(e) => {
    const registeredBinding = getKeyByValue(itemLookupTable, e.key); //itemLookupTable.find((i) => i == e.key);
    if (!registeredBinding) return;

    console.log("keybindServer: binding '%s' found!", registeredBinding);

    switch (registeredBinding) {
      default: {
        console.log("keybindServer: unimplemented keybinding '%s'", registeredBinding);
        break;
      }

      case "gim.tencps.zoomToggle": {
        await chrome.runtime.sendMessage({
          type: "toggleManualScale"
        });

        break;
      }
    }
  });
}