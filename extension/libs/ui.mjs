/**
 * Gets a random number
 * @param {number} min Minimum number to generate
 * @param {number} max Maximum number to generate
 * @returns {number} Random number
 */
function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Assigns a random ID to an infinite number of objects
 * @param  {...object} objects List of objects
 * @returns {object[]} Array of objects with a random ID
 */
function assignUIDForMassObjects(...objects) {
  const objectData = objects; // FIXME: This probably does legit nothing. Oh well.

  for (var i = 0; i < objectData.length; i++) {
    if (!objectData[i]) {
      console.warn("Attempted OOB read!");
      break;
    }

    objectData[i].id = getRandomInt(1 * 100000, 9 * 100000);
  }

  return objectData;
}

/**
 * Creates an overlay item
 * @param {string} name Name of item
 * @param {function} functionCall Function called when selected
 * @returns {object} Object for the details
 */
export function OverlayItem(name, functionCall) {
  return {
    name,
    functionCall,
  };
}

/**
 * Creates a view, and adds an element to the active view to go to that view
 * @param {string} name Name for the new view
 * @param {string} activeViewName Name of the active view
 * @param {Overlay} overlay Overlay instance to modify
 * @returns {boolean} True if successful
 */
export function OverlayItemToView(name, activeViewName, overlay) {
  overlay.createView(name);

  return overlay.appendToView(activeViewName, [
    OverlayItem("=> " + name, () => {
      overlay.setActiveView(name);
      overlay.render();
    }),
  ]);
}

export class Overlay {
  /**
   * Creates an overlay on the screen, with static UI elements
   * @param {string} name Name of the overlay
   * @param {boolean} debugMode If true, alerts you on the screen if there's a critical error
   */
  constructor(name, debugMode) {
    const textSpan = document.createElement("span");
    textSpan.innerText = `${name} (dOVe.gimtk v${this.pullVersion()})\n`;
    textSpan.style.color = "#aef071";

    // Config madness
    this.views = [];
    this.activeView = null;
    this.defaultView = null;
    this.activeViewElement = null;

    this.debugMode = debugMode;

    // Element configuration.
    this.div = document.createElement("div");
    this.div.style.zIndex = 2147483647;

    this.div.style.overflow = "hidden";
    this.div.style.display = "none";

    this.div.style.backgroundColor = "rgba(0, 0, 0, 1)";
    this.div.style.color = "#ffffff";

    this.div.style.fontSize = "14px";
    this.div.style.fontFamily = "monospace";

    this.div.style.position = "absolute";

    this.div.style.top = "5px";
    this.div.style.left = "5px";
    this.div.style.width = "400px";
    this.div.style.height = "400px";

    this.elementDiv = document.createElement("div");

    this.div.appendChild(textSpan);
    this.div.appendChild(document.createElement("br"));
    this.div.appendChild(this.elementDiv);

    // Epic scope hack.
    document.addEventListener(
      "keydown",
      async function (e) {
        await this.keyDownCaller(e);
      }.bind(this)
    );
  }

  /**
   * Gives you the div of the element
   * @returns {HTMLDivElement} The div created by the overlay code
   */
  fetchDiv() {
    return this.div;
  }

  /**
   * Gives you the version of the overlay code
   * @returns {string} Version
   */
  pullVersion() {
    return "0.1";
  }

  /**
   * Initializes the main view for you, to make life easier.
   * This sets the active view and the default view also.
   */
  initializeMainView() {
    // Manually create a view.
    this.createView("Main");

    // Manually set the active view, as well as the default one.
    this.activeView = "Main";
    this.defaultView = "Main";
  }

  /**
   * Creates a view to add elements into
   * @param {string} name Name of the new view
   */
  createView(name) {
    if (this.views.find((i) => i.name == name))
      throw new Error("View already created!");

    this.views.push({
      name: name,
      items: [],
    });
  }

  /**
   * Validates list of elements as a sanity check
   * @param  {...any} elems List of elements to validate
   * @returns {boolean} True if valid, false if invalid
   */
  lintElements(...elems) {
    for (const elem of elems) {
      if (typeof elem != "object") return false; // 0: Even more basic checking
      if (!elem.name || !elem.functionCall) return false; // 1: Basic checking
      if (
        (typeof elem.name != "string" && typeof elem.name != "number") ||
        typeof elem.functionCall != "function"
      )
        return false; // 2: Type checking
    }

    return true;
  }

  /**
   * Appends list of elements to a view.
   * @param {string} viewName View name to append to. If null, it uses the active view
   * @param {OverlayItem[]} elements List of elements to use
   * @returns {boolean} True if successful
   */
  appendToView(viewName = this.activeView, elements) {
    const findView = this.views.find((i) => i.name == viewName);
    if (!findView) throw new Error("View does not exist!");

    if (!this.lintElements(...elements))
      throw new Error("One or more of your UI elements are invalid!");

    // Modify the views to have an ID, then push them to the view.
    this.views[this.views.indexOf(findView)].items.push(
      ...assignUIDForMassObjects(...elements)
    );
    return true;
  }

  // Macro(?) madness
  /**
   * Appends list of elements to the active view.
   * This won't take effect until dOVe fully dies out, and then gets triggered again
   * @param {OverlayItem[]} elements List of elements to use.
   * @returns {boolean} True if successful
   */
  appendToActiveView(elements) {
    if (!this.activeView) console.log("No view is currently active!");
    return this.appendToView(this.activeView, elements);
  }

  /**
   * Sets the active view in the overlay
   * @param {string} viewName View name to set active to
   * @returns {boolean} True if successful
   */
  setActiveView(viewName) {
    const findView = this.views.find((i) => i.name == viewName);
    if (!findView) throw new Error("View does not exist!");

    this.activeView = viewName;
    return true;
  }

  /**
   * Clears the active view.
   */
  clearActiveView() {
    const isEnabled = this.div.style.display == "block";
    if (isEnabled)
      throw new Error(
        "On screen menu is still running! Cannot clear the active view."
      );

    this.activeView = null;
  }

  /**
   * Sets the default view.
   * @param {string} viewName View name to set to default
   * @returns {boolean} True if successful
   */
  setDefaultView(viewName) {
    const findView = this.views.find((i) => i.name == viewName);
    if (!findView) throw new Error("View does not exist!");

    this.defaultView = viewName;
    return true;
  }

  /**
   * This sets the selected element in the active view
   * @param {string} name Element's name to set
   * @returns {boolean} True if successful.
   */
  setSelectedElement(name) {
    const activeView = this.views.find((i) => i.name == this.activeView);
    const elementCheck = activeView.items.find((i) => i.name == name);

    if (!elementCheck) throw new Error("Element does not exist!");
    const oldElement = activeView.items.find(
      (i) => i.id == this.activeViewElement
    );

    this.activeViewElement = elementCheck.id;

    for (const element of this.elementDiv.children) {
      if (!(element instanceof HTMLSpanElement)) continue;
      if (element.innerText == oldElement.name) {
        element.style.color = "#ffffff";
      }

      if (element.innerText == elementCheck.name) {
        element.style.color = "#aef071";
      }
    }

    return true;
  }

  /**
   * WARNING: Do not use this, unless you know what you're doing
   * Manually starts the overlay
   * @returns {null} Nothing.
   */
  render() {
    const isEnabled = this.div.style.display == "block";
    if (isEnabled) throw new Error("Already rendering!");

    console.log("dOVe=> Let's begin.");

    if (this.views.length == 0) {
      console.error("dOVe=> Cannot render! No views currently exist!");
      if (this.debugMode)
        alert(
          "No views currently exist! Try adding one with initalizeMainView()!"
        );

      return;
    } else if (!this.activeView && !this.defaultView) {
      console.error(
        "dOVe=> Cannot render! There isn't currently an active OR default view!"
      );
      if (this.debugMode)
        alert(
          "There isn't an active or default view! Try setting one with setActiveView()!"
        );

      return;
    }

    console.log(
      "dOVe=> Setting active configuration to the current default configuration..."
    );
    this.activeView = this.activeView ?? this.defaultView;

    console.log("dOVe=> Fetching active view...");
    const viewDetails = this.views.find((i) => i.name == this.activeView);

    for (const viewElement of viewDetails.items) {
      const viewSpan = document.createElement("span");
      viewSpan.innerText = viewElement.name;

      this.elementDiv.appendChild(viewSpan);
      this.elementDiv.appendChild(document.createElement("br"));
    }

    this.activeViewElement = viewDetails.items[0].id;
    this.div.style.display = "block";

    // Fix our stupid rendering hack (already setting the active element)
    // One could argue that manually selecting the element once we already
    // selected it is also a hack, but whatever. Tis a free country.
    this.setSelectedElement(viewDetails.items[0].name);
  }

  /**
   * BIG WARNING BIG WARNING BIG WARNING BIG WARNING BIG WARNING BIG WARNING
   * BIG WARNING BIG WARNING BIG WARNING BIG WARNING BIG WARNING BIG WARNING
   * This ISN'T intended to be used. Use at your own risk. Here be dragons!!
   * BIG WARNING BIG WARNING BIG WARNING BIG WARNING BIG WARNING BIG WARNING
   * BIG WARNING BIG WARNING BIG WARNING BIG WARNING BIG WARNING BIG WARNING
   * @param {Event} e Event (DO NOT USE)
   * @returns {null} Nothing (DO NOT USE)
   */
  async keyDownCaller(e) {
    const isEnabled = this.div.style.display == "block";

    // We check for the enable toggle manually first.
    if (e.key == "/") {
      if (isEnabled) return;
      this.render();
    }

    if (!isEnabled) return;
    const activeView = this.views.find((i) => i.name == this.activeView);

    // FIXME: This could be a switch statement, but I'm super lazy.
    if (e.key == "ArrowUp") {
      e.preventDefault(); // Disable all other key events for mod menu madness

      const activeElementIndex = activeView.items.indexOf(
        activeView.items.find((i) => i.id == this.activeViewElement)
      );
      if (0 > activeElementIndex - 1) return;

      this.setSelectedElement(activeView.items[activeElementIndex - 1].name);
    } else if (e.key == "ArrowDown") {
      e.preventDefault(); // Disable all other key events for mod menu madness

      const activeElementIndex = activeView.items.indexOf(
        activeView.items.find((i) => i.id == this.activeViewElement)
      );

      // Any .length on an Array returns 1 more than the active index, which is why we -1 for the length.
      if (activeView.items.length - 1 < activeElementIndex + 1) return;

      this.setSelectedElement(activeView.items[activeElementIndex + 1].name);
    } else if (e.key == "Enter") {
      e.preventDefault(); // Disable all other key events for mod menu madness

      // First, pull the data we'll need for selecting the item.
      const activeElement = activeView.items.find(
        (i) => i.id == this.activeViewElement
      );

      // Then, clean up our disaster.
      this.div.style.display = "none";
      this.activeView = null;
      this.activeViewElement = null;

      this.elementDiv.innerHTML = "";

      // Alright, we should be good to go now.
      try {
        await activeElement.functionCall();
      } catch (e) {
        console.error(e);
      }
    }
  }
}