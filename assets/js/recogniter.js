const video = document.getElementById("video");

function start_video() {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(
    "assets/resources/face-api/models"
  ),
  faceapi.nets.faceLandmark68Net.loadFromUri(
    "assets/resources/face-api/models"
  ),
  faceapi.nets.faceRecognitionNet.loadFromUri(
    "assets/resources/face-api/models"
  ),
  faceapi.nets.faceExpressionNet.loadFromUri(
    "assets/resources/face-api/models"
  ),
  faceapi.nets.ageGenderNet.loadFromUri(
    "assets/resources/face-api/models"
  )
]).then(start_video());

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  const displaySize = { width: video.width, height: video.height };
  document.getElementById("detector-content").append(canvas);
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizeDetection = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizeDetection);
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetection);
    faceapi.draw.drawFaceExpressions(canvas, resizeDetection);
  }, 100);
});
