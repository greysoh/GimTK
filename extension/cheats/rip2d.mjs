let shouldShutDown = false;
let isRunning = false;

const bindings = {
  questionContainerClass: "sc-ZGJVz cQIELY flex-column",
  questionSkipperClass: "sc-qVkRw fsDuQq",
  questionTopicClass: "sc-qVkRw fsDuQq",
  isIncorrectClass: "sc-fIXfXT hHQoIA"
}

const answerList = {};

function doButtonBindings(functionCall) {
  const elem = document.getElementsByClassName(bindings.questionSkipperClass);
  if (elem.length < 5) return;

  if (!elem[1].onclick) elem[1].onclick = functionCall;
  if (!elem[2].onclick) elem[2].onclick = functionCall;
  if (!elem[3].onclick) elem[3].onclick = functionCall;
  if (!elem[4].onclick) elem[4].onclick = functionCall;
}

function waitUntilResultScreen() {
  return new Promise(async(resolve, reject) => {
    while (true) {
      const elem = document.getElementsByClassName(bindings.questionSkipperClass);
      if (elem.length < 5) {
        return resolve();
      }

      await new Promise((i) => setTimeout(i, 100));
    }
  }); 
}

function findButtonWithName(name) {
  // I'm lazy
  let cnt = 0;
  
  for (const elem of document.getElementsByClassName(bindings.questionSkipperClass)) {
    if (cnt == 0) {
      cnt++;
      continue;
    }

    if (elem.innerText == name) return cnt;

    cnt++;
  }

  return null;
}

export async function rip2D(msgApi) {
  console.log("RipGraphicalMode x GimTk");
  console.log("is starting up...");

  if (isRunning) {
    shouldShutDown = true;
    isRunning = false;

    return;
  }

  isRunning = true;

  while (true) {
    if (document.getElementsByClassName(bindings.questionContainerClass).length == 0) {
      await new Promise((i) => setTimeout(i, 2000));
      continue;
    }
    
    const questionTopic = document.getElementsByClassName(bindings.questionTopicClass)[0];
    const questionName = questionTopic.innerText;

    console.log("Running iteration...", questionName, answerList);

    if (shouldShutDown) return;

    if (document.getElementsByClassName(bindings.isIncorrectClass).length != 0) {
      console.log("User clicked incorrect answer");

      await new Promise((i) => setTimeout(i, 5000));
      await msgApi.sendKey("enter");
      continue;
    }

    if (answerList[questionName]) {
      const element = findButtonWithName(answerList[questionName]);
      if (!element) throw new Error("Lost count! Cannot continue!");

      console.log("Going to answer '%s'", answerList[questionName]);
      await msgApi.sendKey(`${element}`);
    } else {
      doButtonBindings((e) => {
        if (document.getElementsByClassName(bindings.isIncorrectClass).length == 0) {
          answerList[questionName] = e.target.innerText;
        }
      });

      await waitUntilResultScreen();
      await msgApi.sendKey("enter");
    }

    await new Promise((i) => setTimeout(i, 600));
  }
}