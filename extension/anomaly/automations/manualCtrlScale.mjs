let isRunning = false;
let hasInjected = false;

export function manualScale(game) {
  isRunning = !isRunning;
  
  if (hasInjected) return;
  hasInjected = true;

  let isCtrlPressed = false;
  let zoomState = 1.3;

  const scrollInterval = 0.2;

  const mainScene = game.scene.scenes[0];
  const mainCamera = mainScene.cameras.cameras[0];

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