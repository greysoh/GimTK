let isRunning = false;

export function manualScale(game) {
  if (isRunning) return;
  isRunning = true;

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
    console.log(isCtrlPressed);

    if (!isCtrlPressed) return;

    if (e.deltaY > 0) {
      //if (zoomState+scrollInterval > 3) return;
    } else {
      //if (zoomState-scrollInterval > 0.2) return;
    }

    zoomState += (e.deltaY > 0 ? scrollInterval : -scrollInterval);
    mainCamera.setZoom(zoomState, zoomState);
  });
}