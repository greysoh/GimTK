const clapperClass = "animated pulse infinite";
let isRunning = false;

export async function autoClap(msgApi) {
  if (isRunning) isRunning = false;
  isRunning = true;

  const targetCPS = parseFloat(prompt("Enter target CPS:"));
  
  if (targetCPS != targetCPS) {
    alert("Not a valid CPS rate!");
    isRunning = false;
    return;
  }

  const clapperElem = document.getElementsByClassName(clapperClass)[0];
  const clapperHitBox = clapperElem.getBoundingClientRect();

  const clapperTargetX = clapperHitBox.x + (clapperHitBox.width/2);
  const clapperTargetY = clapperHitBox.y + (clapperHitBox.height/2);

  while (true) {
    if (!isRunning) return;

    await new Promise((i) => setTimeout(i, 1000/targetCPS));
    await msgApi.clickMouse(clapperTargetX, clapperTargetY, "left");
  }
}