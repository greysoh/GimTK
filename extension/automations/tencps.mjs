let isRunning = false;

export async function toggleTenCps(msgApi) {
  isRunning = !isRunning;
  
  while (true) {
    if (!isRunning) return;

    await msgApi.clickMouse(1, 1, "left", false, true);
    await new Promise((i) => setTimeout(i, 1000/3));
  }
}