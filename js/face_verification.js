const video = document.getElementById("question-video-tag");
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
    video.play();
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

    const displaySize = { width: img.width, height: img.height };

    var timeToVerifyFace = 5;
    console.log(timeToVerifyFace)
    const face_verification_interval = setInterval(async () => {
        // console.log("timeToVerifyFace Remianing =>  ", timeToVerifyFace)
        const single_detections = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
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
            }
        }
        if(timeToVerifyFace == 0){
            clearInterval(face_verification_interval);
            $('#face-check-input').val('Not Verified');
            $('#face-check-input').css('color', '#f00');
            $('#loading-status-face-verification').addClass('d-none');
            $('#loading-status-face-verification-retry').removeClass('d-none');
            $('#loading-status-face-verification-retry').attr('title', `Retry face verification`);
        }
        timeToVerifyFace -= 1;

    }, 1000);
}

$('#loading-status-face-verification-retry').on('click', ()=>{
    verify_face();
})