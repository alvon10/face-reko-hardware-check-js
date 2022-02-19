$("#select_camp_txt").show();
var campainIdSelfAss;
$("#self_ass_ddl").on("change", function () {
    campainIdSelfAss = $(this).val();
    console.log(campainIdSelfAss)
    if ($(this).val() != "") {
        $.ajax({
            url: "https://service.princetonvidya.com/hg_transaction/api/User/GetEventDetails?Campaign_id=" + $(this).val(),
            method: "GET",
            success: function (response) {
                console.log(response.data);
                get_question(response.data.campaignid);
                $("#event_id").val(response.data.campaignid);
                $("#event_name").val(response.data.campaignname);
                $("#event_desc").val(response.data.description);
                $("#main-interview-page").show();

                $("#start_interview_btn").removeClass('d-none');
                $('#questionText').html('You selected: ' + $('#self_ass_ddl option:selected').text());

                var campaignIntroVideo = "https://hive.princetonhive.com/videobucket/getfilestatus?folder=HIVEGRAD&file_name=Campaign_Intro_Video.mp4";
                $('#question-video-tag source').attr('src', campaignIntroVideo);
                $('#question-video-tag')[0].load();
                $('#question-video-tag')[0].play();
                $("#question-video-tag").prop('muted', true);
            }
        });
    }
    else {
        $("#start_interview_btn").addClass('d-none');
        $('#questionText').html('Welcome! Please select a campaign to continue.');

        var selectCampaignVideoUrl = "https://hive.princetonhive.com/videobucket/getfilestatus?folder=HIVEGRAD&file_name=Select_Campaign.mp4";
        $('#question-video-tag source').attr('src', selectCampaignVideoUrl);
        $('#question-video-tag')[0].load();
        $('#question-video-tag')[0].play();
        $("#question-video-tag").prop('muted', true);
    }
});

/*$(document).ready(function () {
    get_question();
});*/

var totalQuestionData, totalQuestionCount, totalQuestionNumber, currentQuestionIdx = -1, currentQuestionNumber, currentAnswerDuration;

async function get_question(camp_id) {
    // StarLoader();
    var url = "https://service.princetonvidya.com/hg_transaction/api/User/GetCampaignQuestions?camp_id=" + camp_id;
    await fetch(url)
        .then(response => response.json())
        .then(responseJson => {
            totalQuestionData = responseJson.data;
            if (totalQuestionData.length == 0) {
                console.log('no questions left for answering');
            }
            console.log('totalQuestionData', totalQuestionData);
            totalQuestionNumber = totalQuestionData.at(-1).sequence;
            totalQuestionCount = totalQuestionData.length;
            $('#totalQuestion').html(totalQuestionNumber);
            // removeLoader();
        });
}

var pageData = {
    startPage: {
        adminSide: `
            <video id="leftVideo" class="video-aiexplore" controls loop>
                <source id="adminvideo" src=""
                    type="video/mp4">
            </video>
            <div id="questionText" class="questionText">
            </div>
        `,
        userSide: `
            <div class="answer_record_startVideo">
                <div class="answer_record_recordStart" onclick="startFrame()">
                    <i class="fas fa-video"></i> Record video
                </div>
            </div>
        `,
    },
    recordingPage: {
        adminSide: `
            <video id="leftVideo" class="video-aiexplore" controls loop>
            
                <source src="./assets/ai-vid_GET/assets/matt_1_muted.mp4"
                    type="video/mp4">
            </video>
            <div id="questionText" class="questionText">
            </div>
        `,
        userSide: `
            <div id="answer_record_userModal" class="userModal">
                <div>GET READY</div>
                <div id="answer_record_recordCounter">5</div>
            </div>
            <video id="answer_record_gum" autoplay muted playsinline></video>
            <div id="addData" class="w-100">
                <div>
                    <button id="answer_record_record"></button>
                    <div id="answer_record_counter">Hit <span id="span1">RECORD</span> to start!</div>
                </div>
            </div>
        `,
    },
    readyPage: {
        adminSide: `
            <video id="leftVideo" class="video-aiexplore" controls
                 loop>
                <source src="./assets/ai-vid_GET/assets/matt_1_muted.mp4"
                    type="video/mp4">
            </video>
            <div id="questionText" class="questionText">
            </div>
        `,
        userSide: `
                <video height="100%" width="100%" id="answer_record_readyVideo" autoplay loop>
                </video>
                <div id="answer_record_sendMessage">
                    <div>Like it?</div>
                    <div id="answer_record_sendMessageChoice">
                    <div id="answer_record_choiceYes">Yes</div>
                    <div id="answer_record_choiceNo">No</div>
                    </div>
                </div>
        `,
    },
    userDetailPage: {
        adminSide: `
            <video id="leftVideo" class="video-aiexplore" controls
                 loop>
                <source src="./assets/ai-vid_GET/assets/matt_1_muted.mp4"
                    type="video/mp4">
            </video>
            <div id="questionText" class="questionText">
            </div>
        `,
        userSide: `
            <div class="answer_record_startVideo">
                <div><input id="username" type="text" placeholder="Name" required/></div>
                <div><input id="userEmail" type="email" placeholder="Email" required/></div>
                <div><button id="detailSubmitButton" type="submit">Submit</button></div>
                <div id="already_done" style="color:red; opacity:0;">You have alread submitted</button></div>
            </div>
        `,
    },
    downloadpage: {
        adminSide: `
    <video id="leftVideo" class="video-aiexplore" controls
        loop>
        <source src="./assets/ai-vid_GET/assets/matt_1_muted.mp4"
            type="video/mp4">
    </video>
    <div id="questionText" class="questionText">
    </div>
`,
        userSide: `
    <div class="answer_record_startVideo">
    <div class="answer_record_recordStart" >
        <a onclick="return verifyUser()" ><span style="color:white">Click to Download</span></a>
    </div>
    
</div>
        `,
    },
    uploadingPage: `
        <div class="confirmPage">
            <div class="confirmText">
                Uploading Data. Please wait ...
            </div>
        </div>
    `,
    thankyouPage: `
        <div class="confirmPage">
            <div class="confirmText">
                Thank you for uploading the video, the report will take about 4-5 minutes to show.
            </div>
    `,
    thankyouDownloadPage: `
        <div class="confirmPage">answer_record_container
            <div class="confirmText">
                Thank you! Please check your email to view PDF.
            </div>
        <div class="confirmChoice">
        <div id="noBtn" class="confirmBtn">
            Back
        </div>
    `,
};

var video_url = "";
var counter = 1;
var recordData = "";
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;
var videoStream;
var courseid;
var questionMsg = "";
var answerRecorderTimer;
var videoFiles, tempOldSelectedVideo;

function secFormatter(rawSeconds) {
    var finalMins = Math.floor(rawSeconds / 60);
    var finalSecs = rawSeconds - finalMins * 60;

    var finalTime;

    if (rawSeconds >= 60) {
        if (finalSecs < 10) {
            finalSecs = "0" + finalSecs;
        }
        finalTime = finalMins.toString() + ":" + finalSecs.toString();
    } else {
        finalTime = finalSecs.toString() + " s";
    }


    var finalTimeDis = `<span id="${(rawSeconds > 10) ? 'span2' : 'span3'}">${finalTime}</span>`;
    console.log(finalTimeDis);
    return finalTimeDis;

}


function recordedDataUpload() {
    document.getElementById("answer_record_container").innerHTML = pageData.uploadingPage;
    if (recordData !== "") {
        var hguuid = document.getElementById("parti_uuid").value;
        var emailid = document.getElementById("parti_email").value;
        var formdata = new FormData();
        formdata.append("filedata", recordData);
        // formdata.append("uploadtype", 'upload');
        formdata.append("filetype", 'aadhaar');
        //var url = "https://hive.princetonhive.com/hgvdo/video";

        $.ajax({
            // url: "https://hive.princetonhive.com/hgvdo/video",
            url: "http://127.0.0.1:8000/recordfiles",
            data: formdata,
            processData: false,
            contentType: false,
            mode: "no-cors",
            type: 'POST',
            success: function (data) {
                // var data = JSON.parse(data);
                data = data
                video_url = data.fileurl;
                if (data.msg == "success") {
                    console.log(video_url);
                    $("#main-interview-page").hide();
                    removeLoader();
                    swal(
                        '',
                        'Thankyou for answering',
                        'success'
                    ).then(function () {
                        window.location.href = "/selfassessment";
                    });
                }
                else {
                    window.location = "selfassessment";
                }
            }
        });
    }
};


function stopRecording() {
    if (mediaRecorder.state === "inactive") {
        return;
    }
    mediaRecorder.stop();
    if (videoStream.getTracks() !== undefined) {
        videoStream.getTracks().forEach(function (track) {
            track.stop();
        });
        clearInterval(answerRecorderTimer);
    }
    var readyState = document.createElement("div");
    readyState.id = "readyState";
    readyState.style.width = "100%";
    readyState.innerHTML = pageData.readyPage.userSide;
    document.getElementById("answer_record_UserSide").replaceWith(readyState);
    var yesChoice = document.getElementById("answer_record_choiceYes");
    var noChoice = document.getElementById("answer_record_choiceNo");
    noChoice.onclick = () => {
        startPage();
        reset_question_modal();
    }
    var answer_record_readyVideo = document.getElementById("answer_record_readyVideo");
    var type = (recordedBlobs[0] || {}).type;
    recordData = new Blob(recordedBlobs, { type });
    answer_record_readyVideo.src = window.URL.createObjectURL(recordData);
    yesChoice.onclick = () => recordedDataUpload();
    recordedDataUpload();

}


function startFrame() {
    console.log('started frame')
    var answer_record_container = document.getElementById("answer_record_container");
    var videoDiv = document.getElementById("answer_record_UserSide");
    videoDiv.innerHTML = pageData.recordingPage.userSide;
    var addData = document.getElementById("addData");

    var mediaSource = new MediaSource();
    mediaSource.addEventListener("sourceopen", handleSourceOpen, false);
    /*    var answer_record_close = document.getElementById("answer_record_close");
        answer_record_close.onclick = () => {
            startPage();
            reset_question_modal("true");
        }*/
    var gumVideo = document.querySelector("video#answer_record_gum");

    var recordButton = document.querySelector("button#answer_record_record");
    toggleRecording();
    recordButton.onclick = toggleRecording;
    var isSecureOrigin =
        location.protocol === "https:" || location.host.includes("localhost");

    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: { width: 1280, height: 720, frameRate: { ideal: 15, max: 30 } },
        })
        .then(function (stream) {
            // console.log("getUserMedia() got stream: ", stream);
            window.stream = stream;
            videoStream = stream;
            gumVideo.srcObject = stream;
        })
        .catch(function (err) {
            console.log(err.name + ": " + err.message);
        });

    function handleSourceOpen(event) {
        // console.log("MediaSource opened");
        sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        // console.log("Source buffer: ", sourceBuffer);
    }

    function handleDataAvailable(event) {
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    }

    function handleStop(event) {
        // console.log("Recorder stopped: ", event);
        // console.log("Recorded Blobs: ", recordedBlobs);
    }

    function toggleRecording() {
        // clearInterval(intervalId);
        if (recordButton.innerHTML === "") {
            document.getElementById("answer_record_userModal").style.display = "flex";
            var count = 4;
            var counterId;
            setTimeout(function () {
                var answer_record_recordCounter = document.getElementById("answer_record_recordCounter");
                answer_record_recordCounter.innerHTML = count;
                count--;

                counterId = setInterval(function () {
                    var answer_record_recordCounter = document.getElementById("answer_record_recordCounter");
                    answer_record_recordCounter.innerHTML = count;
                    count--;
                }, 1000);
            }, 500);
            setTimeout(function () {
                startRecording();
                document.getElementById("answer_record_userModal").style.display = "none";
                clearInterval(counterId);
                recordButton.innerHTML = '<i class="fas fa-stop"></i>';
                var counter = document.getElementById("answer_record_counter");
                var digit = currentAnswerDuration;
                answerRecorderTimer = setInterval(function () {
                    var getCounterDisplayData = secFormatter(digit);
                    // counter.innerHTML = dis;
                    counter.innerHTML = getCounterDisplayData;
                    if (digit === 0) {
                        stopRecording();
                        recordButton.innerHTML = "";
                    }
                    digit -= 1;
                }, 1000);
            }, 4500);
        } else {
            stopRecording();
            recordButton.innerHTML = "";
        }
    }

    function startRecording() {
        var options = { mimeType: "video/webm", bitsPerSecond: 2500000 };
        recordedBlobs = [];
        try {
            mediaRecorder = new MediaRecorder(window.stream, options);
        } catch (e0) {
            // console.log("Unable to create MediaRecorder with options Object: ", e0);
            try {
                options = { mimeType: "video/webm,codecs=vp9", bitsPerSecond: 2500000 };
                mediaRecorder = new MediaRecorder(window.stream, options);
            } catch (e1) {
                // console.log("Unable to create MediaRecorder with options Object: ", e1);
                try {
                    options = "video/vp8"; // Chrome 47
                    mediaRecorder = new MediaRecorder(window.stream, options);
                } catch (e2) {
                    alert(
                        "MediaRecorder is not supported by this browser.\n\n" +
                        "Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags."
                    );
                    // console.error("Exception while creating MediaRecorder:", e2);
                    return;
                }
            }
        }
        recordButton.innerHTML = '<i class="fas fa-stop"></i>';
        mediaRecorder.onstop = handleStop;
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start(10); // collect 10ms of data
    }

}

function startPage() {
    clearInterval(answerRecorderTimer);
    //video_url = "";
    if (videoStream !== undefined) {
        videoStream.getTracks().forEach(function (track) {
            track.stop();
        });
    }
    recordData = "";
    //userEmail = "";
    //username = "";
    var answer_record_UserSide = document.createElement("div");
    answer_record_UserSide.id = "answer_record_UserSide";
    var contain = document.getElementById("answer_record_container");
    contain.innerHTML = "";
    if (questionMsg == "download") {
        document.getElementById("adminvideo").src =
            "./assets/ai-vid_GET/assets/21stCenturySkillsVideo.mp4";
        answer_record_UserSide.innerHTML = pageData.downloadpage.userSide;
    } else {
        answer_record_UserSide.innerHTML = pageData.startPage.userSide;
    }

    contain.appendChild(answer_record_UserSide);
}

function changeQuestion() {
    console.log("in changequestion");
    currentQuestionIdx += 1;
    if (currentQuestionIdx >= totalQuestionCount) {
        alert('inteview over');
    }
    var questionVideoUrlLeft = totalQuestionData[currentQuestionIdx].q_video;
    var questionText = totalQuestionData[currentQuestionIdx].q_text;
    currentAnswerDuration = parseInt(totalQuestionData[currentQuestionIdx].q_duration);
    currentQuestionNumber = parseInt(totalQuestionData[currentQuestionIdx].sequence);
    console.log(questionVideoUrlLeft);
    $('#currentQuestion').html(currentQuestionNumber);

    $('#question-video-tag source').attr('src', questionVideoUrlLeft);
    $('#question-video-tag')[0].load();
    $('#question-video-tag')[0].play();
    $("question-video-tag").prop('muted', false);

    $('#questionText').html(questionText);

    startFrame();
}

$('#start_interview_btn').on('click', function () {
    $("#self_ass_ddl").prop("disabled", true);
    changeQuestion();
});

