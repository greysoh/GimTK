export function setZoom(xZoom, yZoom, game) {
  const mainScene = game.scene.scenes[0];
  const mainCamera = mainScene.cameras.cameras[0];

  mainCamera.setZoom(xZoom, yZoom);
}