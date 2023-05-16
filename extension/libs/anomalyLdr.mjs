import { main } from "../anomaly/index.mjs";

const phaserClientList = [];
const maxRetryCount = 10000;

async function validateInjectedCorrectly() {
  await new Promise((i) => setTimeout(i, 1000));
  if (phaserClientList.length == 0) {
    if (window.location.pathname.startsWith("/host")) {
      alert(
        "Injected correctly, but I missed the timing window to get a client. I am NOT retrying due to you being a game host."
      )

      console.error(
        "Anomaly: Injected correctly, but missed timing. NOT retrying due to you hosting the game."
      )

      return;
    }

    console.error(
      "Anomaly: Injected correctly, but missed timing. Retrying via reload..."
    );

    await new Promise((i) => setTimeout(i, 1000)); // Give user some time to process error message in brain
    window.location.reload();
  }

  console.log("Anomaly: Found one! Status is %cOK.", "font-weight: bold; color: lime");
  return true;
}

async function anomalyLdr() {
  let attemptCnt = 0;

  while (true) {
    if (attemptCnt >= maxRetryCount) {
      console.error("Anomaly: Reached max retry count (%s)!", maxRetryCount);

      if (document.getElementsByTagName("canvas")[0].id) {
        console.warn(
          "Anomaly: No canvas elements with Phaser signature detected. NOT retrying."
        );
      } else {
        console.error(
          "Anomaly: Found Phaser signature, but was not able to inject. Retrying via reload..."
        );

        await new Promise((i) => setTimeout(i, 1000)); // Give user some time to process error message in brain
        window.location.reload();
      }

      return false;
    }

    attemptCnt++;

    try {
      Phaser._Game = Phaser.Game;
      Phaser.Game = class Game extends Phaser._Game {
        constructor(...args) {
          const antiRed = "background-color: #10efed";
          const antiYellow = "background-color: #2214e3";
          const antiGreen = "background-color: #e785b8";
          const antiBlue = "background-color: #def283";

          console.log(
            "%c %c %c %c %c Anomaly v0.0.1 (Phaser Exposer) %c https://github.com/greysoh",
            antiRed,
            antiYellow,
            antiGreen,
            antiBlue,
            "background-color: #000000; color: #ffffff",
            "background-color: none;"
          );

          super(...args);
          phaserClientList.push(this);
        }
      };

      console.log("Anomaly: Phaser dumper was successfully injected!");
      console.log(
        "Anomaly: It took " +
          attemptCnt +
          " attempts. Checking for responses..."
      );
      if (!(await validateInjectedCorrectly())) return false;

      return true;
    } catch (e) {
      //
    }

    await new Promise((i) => setTimeout(i, 1));
  }
}

console.log("Anomaly is starting...");

if (await anomalyLdr()) {
  console.log("Anomaly is fully loaded. Handing future execution to 'anomaly/index.mjs'...");
  const game = phaserClientList[0];

  console.log(game);
  await main(game);
}