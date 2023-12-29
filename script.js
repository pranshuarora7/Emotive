const URL = "https://teachablemachine.withgoogle.com/models/PvNUuQ0IO/";
let model, webcam, ctx, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const size = 200;
    const flip = true;

    webcam = new tmPose.Webcam(size, size, flip);
    await webcam.setup();
    await webcam.play();

    const canvas = document.getElementById("canvas");
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");

    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    predictLoop();
}

async function predictLoop() {
    while (true) {
        await predict();
    }
}

async function predict() {
    webcam.update(); // Update the webcam frame
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    drawPose(pose);
}

function drawPose(pose) {
    ctx.drawImage(webcam.canvas, 0, 0);
    if (pose) {
        const minPartConfidence = 0.5;
        tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
}

function displayEmotion() {
    let highestEmotion = "";
    let highestPercentage = -1;

    // Iterate through the predictions to find the emotion with the highest percentage
    for (let i = 0; i < maxPredictions; i++) {
        const prediction = parseFloat(labelContainer.childNodes[i].innerText.split(": ")[1]);
        if (prediction > highestPercentage) {
            highestPercentage = prediction;
            highestEmotion = labelContainer.childNodes[i].innerText.split(": ")[0];
        }
    }

    // Display the dominant emotion
    if (highestEmotion !== "") {
        document.getElementById("emotionResult").innerText = `You are ${highestEmotion}`;
    } else {
        document.getElementById("emotionResult").innerText = "Unable to determine the dominant emotion.";
    }
}

let isDetectionRunning = true;

function stopDetection() {
    isDetectionRunning = false;
    document.getElementById("popup").style.display = "block";
    document.getElementById("emotionResult").style.display = "none"; // Hide the emotion result
}

// Redirect to the popup after 2 seconds of stopping detection
setTimeout(function () {
    if (!isDetectionRunning) {
        document.getElementById("popup").style.display = "block";
        document.getElementById("emotionResult").style.display = "none"; // Hide the emotion result
    }
}, 2000);


init();
