let isRunning = false;
let hasInjected = false;

export function manualScale(game) {
  const mainScene = game.scene.scenes[0];
  const mainCamera = mainScene.cameras.cameras[0];

  if (isRunning) {
    isRunning = false;
    
    mainCamera.setZoom(1.39, 1.39);
  }

  isRunning = true; // Has to be before the injection check so we can resume if needed.
  
  if (hasInjected) return;
  hasInjected = true;

  let isCtrlPressed = false;
  let zoomState = 1.3;

  const scrollInterval = 0.2;

  document.addEventListener("keydown", (e) => {
    isCtrlPressed = e.code == "ControlLeft";
  });

  document.addEventListener("keyup", (e) => {
    isCtrlPressed = e.code == "ControlLeft";
  });

  document.addEventListener("wheel", (e) => {
    if (!isRunning || !isCtrlPressed) return;

    zoomState += (e.deltaY > 0 ? scrollInterval : -scrollInterval);
    mainCamera.setZoom(zoomState, zoomState);
  });
}