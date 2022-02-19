/******************* GLOBAL VARIABLES *******************/
var cameraInputCheck = false,
    audioInputCheck = false,
    audioOutputCheck = false,
    faceVerificationCheck = false;

/******************* HARDWARE CHECK CODE STARTS *******************/

// variables used in hardware check process
let videoSourcesSelect = document.getElementById("video-source");
let audioSourcesSelectInput = document.getElementById("audio-source-input");
let audioSourcesSelectOutput = document.getElementById("audio-source-output");
let videoPlayer = document.getElementById("question-video-tag");
let startInterviewButton = document.getElementById("start-interview-continue");

var totalCameraDevices = 0, totalAudioDevices = 0, totalSpeakerDevices = 0;

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let microphoneStream = null;
let analyserNode = audioCtx.createAnalyser()
let audioData = new Float32Array(analyserNode.fftSize);;
let corrolatedSignal = new Float32Array(analyserNode.fftSize);;
let localMaxima = new Array(10);
const frequencyDisplayElement = document.querySelector('#frequency');
// variables used in hardware check process ends here


// microphone input check
function startPitchDetection(newstream) {
  audioInputCheck = false;
  displayStartInterview();

  $('#loading-status-audio').attr('src', './loading.gif');
  $('#loading-status-audio').attr('title', '');

  microphoneStream = audioCtx.createMediaStreamSource(newstream);
  microphoneStream.connect(analyserNode);

  audioData = new Float32Array(analyserNode.fftSize);
  corrolatedSignal = new Float32Array(analyserNode.fftSize);

  var timeToCheck = 5;
  var check_audio_interval = setInterval(() => {
    analyserNode.getFloatTimeDomainData(audioData);

    let pitch = getAutocorrolatedPitch();
    if (pitch > 0) {
      clearInterval(check_audio_interval);
      $('#loading-status-audio').attr('src', './checked.png');
      $('#loading-status-audio').attr('title', 'Microphone OK');
      audioInputCheck = true;
      displayStartInterview();
    }
    else if(timeToCheck == 0){
      clearInterval(check_audio_interval);
      $('#loading-status-audio').attr('src', './cancel.png');
      $('#loading-status-audio').attr('title', 'Microphone Error');
      audioInputCheck = false;
      displayStartInterview();

    }
    timeToCheck -= 1;
    // frequencyDisplayElement.innerHTML = `${pitch}`;
  }, 1000);
}

function getAutocorrolatedPitch() {
  // First: autocorrolate the signal

  let maximaCount = 0;

  for (let l = 0; l < analyserNode.fftSize; l++) {
    corrolatedSignal[l] = 0;
    for (let i = 0; i < analyserNode.fftSize - l; i++) {
      corrolatedSignal[l] += audioData[i] * audioData[i + l];
    }
    if (l > 1) {
      if ((corrolatedSignal[l - 2] - corrolatedSignal[l - 1]) < 0
        && (corrolatedSignal[l - 1] - corrolatedSignal[l]) > 0) {
        localMaxima[maximaCount] = (l - 1);
        maximaCount++;
        if ((maximaCount >= localMaxima.length))
          break;
      }
    }
  }

  // Second: find the average distance in samples between maxima

  let maximaMean = localMaxima[0];

  for (let i = 1; i < maximaCount; i++)
    maximaMean += localMaxima[i] - localMaxima[i - 1];

  maximaMean /= maximaCount;

  return audioCtx.sampleRate / maximaMean;
}
// microphone input check functions ends here


// select device from list 
videoSourcesSelect.onchange = function () {
  MediaStreamHelper.requestStream().then(function (stream) {
    MediaStreamHelper._stream = stream;
    videoPlayer.srcObject = stream;
  });
};

audioSourcesSelectInput.onchange = function () {
  MediaStreamHelper.requestStream().then(function (stream) {
    MediaStreamHelper._stream = stream;
    videoPlayer.srcObject = stream;

    startPitchDetection(stream);
  });
};

audioSourcesSelectOutput.onchange = function () {
  MediaStreamHelper.requestStream().then(function (stream) {
    MediaStreamHelper._stream = stream;
    videoPlayer.srcObject = stream;
  });
};
// select device from list ends here


// Create Helper to ask for permission and list devices
let MediaStreamHelper = {
  // Property of the object to store the current stream
  _stream: null,
  // This method will return the promise to list the real devices
  getDevices: function () {
    return navigator.mediaDevices.enumerateDevices();
  },
  // Request user permissions to access the camera and video
  requestStream: function () {
    if (this._stream) {
      this._stream.getTracks().forEach(track => {
        track.stop();
      });
    }

    const audioSourceInput = audioSourcesSelectInput.value;
    // const audioSourceOutput = audioSourcesSelectOutput.value;
    const videoSource = videoSourcesSelect.value;
    const constraints = {
      audio: {
        deviceId: audioSourceInput ? { exact: audioSourceInput } : undefined
      },
      video: {
        deviceId: videoSource ? { exact: videoSource } : undefined
      }
    };

    return navigator.mediaDevices.getUserMedia(constraints);
  }
};
// Create Helper to ask for permission and list devices ends here


// Request streams (audio and video), ask for permission and display streams in the video element
MediaStreamHelper.requestStream().then(function (stream) {
  // Store Current Stream
  MediaStreamHelper._stream = stream;

  // Select the Current Streams in the list of devices
  audioSourcesSelectInput.selectedIndex = [...audioSourcesSelectInput.options].findIndex(option => option.text === stream.getAudioTracks()[0].label);
  audioSourcesSelectOutput.selectedIndex = [...audioSourcesSelectOutput.options].findIndex(option => option.text === stream.getAudioTracks()[0].label);
  videoSourcesSelect.selectedIndex = [...videoSourcesSelect.options].findIndex(option => option.text === stream.getVideoTracks()[0].label);

  // Play the current stream in the Video element
  videoPlayer.srcObject = stream;
  startPitchDetection(stream);

  // You can now list the devices using the Helper
  MediaStreamHelper.getDevices().then((devices) => {
    // Iterate over all the list of devices (InputDeviceInfo and MediaDeviceInfo)
    devices.forEach((device) => {
      let option = new Option();
      option.value = device.deviceId;
      // According to the type of media device
      console.log(device);

      switch (device.kind) {
        // Append device to list of Cameras
        case "videoinput":
          option.text = device.label || `Camera ${videoSourcesSelect.length + 1}`;
          videoSourcesSelect.appendChild(option);
          $('#loading-status-camera').attr('src', './checked.png');
          $('#loading-status-camera').attr('title', 'Camera Found');
          totalCameraDevices += 1;
          cameraInputCheck = true;
          break;
        // Append device to list of Microphone
        case "audioinput":
          option.text = device.label || `Microphone ${videoSourcesSelect.length + 1}`;
          audioSourcesSelectInput.appendChild(option);
          totalAudioDevices += 1;
          break;
        case "audiooutput":
          option.text = device.label || `Speaker ${videoSourcesSelect.length + 1}`;
          audioSourcesSelectOutput.appendChild(option);
          $('#loading-status-speaker').attr('src', './checked.png');
          $('#loading-status-speaker').attr('title', 'Speaker Found');
          totalSpeakerDevices += 1;
          audioOutputCheck = true;
          break;
      }
    });
    if (!totalCameraDevices) {
      $('#loading-status-camera').attr('src', './cancel.png');
      $('#loading-status-camera').attr('title', 'No camera found');
    } else {

    }
    if (!totalAudioDevices) {
      $('#loading-status-audio').attr('src', './cancel.png');
      $('#loading-status-audio').attr('title', 'No microphone found');
    } else {

    }
    if (!totalSpeakerDevices) {
      $('#loading-status-speaker').attr('src', './cancel.png');
      $('#loading-status-speaker').attr('title', 'No speaker found');
    } else {

    }
  }).catch(function (e) {
    console.log(e.name + ": " + e.message);
  });
}).catch(function (err) {
  console.error(err);
}); 
// Request streams (audio and video), ask for permission and display streams in the video element ends here
/******************* HARDWARE CHECK CODE ENDS HERE *******************/


/******************* FACE VERIFICATION CHECK CODE STARTS *******************/

const videoFace = document.getElementById("question-video-tag");
var faceMatcher;

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
    faceapi.nets.faceRecognitionNet.loadFromUri('/weights'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/weights')
]).then(startFaceVerification)

async function startFaceVerification() {
    const labeledFaceDescriptors = await loadLabeledImages();
    console.log(labeledFaceDescriptors);
    videoFace.play();
    faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    verify_face();
}

const deepak_image_link = 'https://hive.princetonhive.com/videobucket/getfilestatus?folder=HIVEGRAD&file_name=2022_02_17_184730.jpg'
const labels = ['Deepak']
var img;

function loadLabeledImages() {
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            img = await faceapi.fetchImage(`${deepak_image_link}`)
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            descriptions.push(detections.descriptor);
            console.log(`%cLoaded!`, 'background: #222; color: #0f0; font-size:33px');
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}


/****Event Listeiner for the video****/
function verify_face() {
    $('#face-check-input').val('Verifying');
    $('#face-check-input').css('color', 'rgb(49, 173, 211)');
    $('#loading-status-face-verification').removeClass('d-none');
    $('#loading-status-face-verification').attr('src', './loading.gif');
    $('#loading-status-face-verification').attr('title', `Face verification in Progress \nPlease Wait`);
    $('#loading-status-face-verification-retry').addClass('d-none');
    faceVerificationCheck = false;
    displayStartInterview();

    const displaySize = { width: img.width, height: img.height };

    var timeToVerifyFace = 5;
    console.log(timeToVerifyFace)
    const face_verification_interval = setInterval(async () => {
        // console.log("timeToVerifyFace Remianing =>  ", timeToVerifyFace)
        const single_detections = await faceapi
            .detectSingleFace(videoFace, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks().withFaceDescriptor();
        // const resizedDetections = faceapi.resizeResults(single_detections, displaySize);
        // const single_results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        // results.forEach((result, i) => {
        //     // const box = resizedDetections[i].detection.box;
        //     console.log(result.toString);
        //     // const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        //     // drawBox.draw(canvas)
        // })

        if (single_detections) {
            const bestMatch = faceMatcher.findBestMatch(single_detections.descriptor);
            if(bestMatch.distance < 0.35){
                console.log(`%c Verified! ${bestMatch.distance}`, 'background: #222; color: #0f0');
                $('#face-check-input').val('Verified');
                $('#face-check-input').css('color', '#0f0');
                $('#loading-status-face-verification').removeClass('d-none');
                $('#loading-status-face-verification').attr('src', './checked.png');
                $('#loading-status-face-verification').attr('title', `Face verified as ${labels[0]}`);
                $('#loading-status-face-verification-retry').addClass('d-none');
                clearInterval(face_verification_interval);
                faceVerificationCheck = true;
                displayStartInterview();
            }
        }
        if(timeToVerifyFace == 0){
            clearInterval(face_verification_interval);
            $('#face-check-input').val('Not Verified');
            $('#face-check-input').css('color', '#f00');
            $('#loading-status-face-verification').addClass('d-none');
            $('#loading-status-face-verification-retry').removeClass('d-none');
            $('#loading-status-face-verification-retry').attr('title', `Retry face verification`);
            faceVerificationCheck = false;
            displayStartInterview();
        }
        timeToVerifyFace -= 1;

    }, 1000);
}

$('#loading-status-face-verification-retry').on('click', ()=>{
    verify_face();
})


/******************* FACE VERIFICATION CHECK CODE ENDS HERE *******************/



/******************* START INTERVIEW BUTTON CONDITION *******************/
function displayStartInterview(){
  console.log(cameraInputCheck)
  console.log(audioInputCheck);
  console.log(audioOutputCheck);
  console.log(faceVerificationCheck)
  if(cameraInputCheck && audioInputCheck && audioOutputCheck && faceVerificationCheck){
    console.log('display')
    $('#start_interview_btn').removeClass('d-none');
  }else{
    console.log('hide')
    $('#start_interview_btn').addClass('d-none');
  }
}
/******************* START INTERVIEW BUTTON CONDITION ENDS HERE *******************/
