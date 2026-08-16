let timerInterval = null;

let selectedScore = null;

let currentPerformanceID = null;

let hasSubmitted = false;
let isPolling = false;

function loadJudgeInfo(){

    const userJSON =
        localStorage.getItem("user");

    if(!userJSON){

        window.location.href =
            "login.html";

        return;

    }

    const user =
        JSON.parse(userJSON);

    document.getElementById("judgeName")
      .textContent =
        user.name;

}

async function loadState() {

    const result =
        await api("getCurrentState");

    if(result.offline){
    return;
    }

    if (!result.success) {

        alert(result.message);

        return;

    }

    const performance =
        result.data.performance;

    currentPerformanceID =
        Number(
            performance.PerformanceID
        );

    document.getElementById(
        "segmentName"
    ).textContent =
        performance.segment.SegmentName;

    document.getElementById(
        "candidateNumber"
    ).textContent =
        performance.candidate.Number;

    document.getElementById(
        "candidateName"
    ).textContent =
        performance.candidate.Name;

    const photo =
        document.getElementById("candidatePhoto");
    
    photo.src =
        `images/candidates/${performance.candidate.CandidateID}.png`;
    
    photo.onerror = () => {
    
        photo.src =
            "images/candidates/default.png";
    
    };

    renderTimer(
        result.data.timer
    );

}

function renderTimer(timer) {

    clearInterval(timerInterval);

    let remaining =
        timer.remaining;

    displayTimer(remaining);

    if (timer.status !== "Running") {
        return;
    }

    timerInterval =
        setInterval(() => {

            remaining--;

            if (remaining <= 0) {

                remaining = 0;

                clearInterval(
                    timerInterval
                );

            }

            displayTimer(
                remaining
            );

        }, 1000);

}

function displayTimer(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;

    const formatted =
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0");

    document.getElementById(
        "timerDisplay"
    ).textContent =
        formatted;

}

function selectScore(score) {

    selectedScore =
        Number(score);

    document.getElementById(
        "selectedScore"
    ).textContent =
        selectedScore;

    document.getElementById(
        "submitScoreBtn"
    ).disabled = false;

}

document
    .querySelectorAll(
        "#scoreButtons button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectScore(
                    button.dataset.score
                );

            }
        );

    });

async function submitScore() {


    if (selectedScore === null) {
        return;
    }

    const sessionToken =
        localStorage.getItem("sessionToken");

    if (!sessionToken) {

        document.getElementById(
            "scoreMessage"
        ).textContent =
            "No active session. Please log in again.";

        return;
    }

    showLoading("Loading...");

    const result =
        await api(
            "submitScore",
            {
                sessionToken: sessionToken,
                score: selectedScore
            }
        );

    if (!result.success) {

        document.getElementById(
            "scoreMessage"
        ).textContent =
            result.message;

        return;
    }

    hideLoading();

    hasSubmitted = true;

    document.getElementById(
        "scoreMessage"
    ).textContent =
        "Score submitted successfully.";

    document.getElementById(
        "submitScoreBtn"
    ).disabled = true;

    document
        .querySelectorAll(
            "#scoreButtons button"
        )
        .forEach(button => {

            button.disabled = true;

        });

}

document
    .getElementById(
        "submitScoreBtn"
    )
    .addEventListener(
        "click",
        submitScore
    );

async function checkForStateChange() {

    if (isPolling) return;

    isPolling = true;

    try {

        const result = await api("getCurrentState");

        if (!result.success) return;

        // Always keep the timer synchronized
        renderTimer(result.data.timer);

        const performanceID =
            Number(result.data.performance.PerformanceID);

        if (currentPerformanceID === null) {
            currentPerformanceID = performanceID;
            return;
        }

        // Only reload the page state when the candidate changes
        if (performanceID !== currentPerformanceID) {

            currentPerformanceID = performanceID;

            resetScore();

            await loadState();

            await loadMyScore();

        }

    } finally {

        isPolling = false;

    }

}

function resetScore() {

    selectedScore = null;

    hasSubmitted = false;

    document.getElementById(
        "selectedScore"
    ).textContent = "None";

    document.getElementById(
        "scoreMessage"
    ).textContent = "";

    document.getElementById(
        "submitScoreBtn"
    ).disabled = true;

    document
        .querySelectorAll(
            "#scoreButtons button"
        )
        .forEach(button => {

            button.disabled = false;

        });

}

async function loadMyScore() {

    const result =
        await api("getMyScore");

    if (!result.success) {
        return;
    }

    if (result.data.hasSubmitted) {

        selectedScore =
            result.data.score;

        hasSubmitted = true;

        document.getElementById(
            "selectedScore"
        ).textContent =
            result.data.score;

        document.getElementById(
            "scoreMessage"
        ).textContent =
            "Score already submitted.";

        document.getElementById(
            "submitScoreBtn"
        ).disabled = true;

        document
            .querySelectorAll(
                "#scoreButtons button"
            )
            .forEach(button => {

                button.disabled = true;

            });

        document
                .querySelectorAll(
                    "#scoreButtons button"
                )
                .forEach(button => {
            
                    if (
                        Number(button.dataset.score) ===
                        result.data.score
                    ) {
            
                        button.style.fontWeight = "bold";
            
                    }
            
                });

    }

}

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        loadJudgeInfo();

        await loadState();

        await loadMyScore();

        setInterval(
            checkForStateChange,
            2000
        );

    }
);

document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    logout
  );

async function logout(){

    await api("logout");

    localStorage.removeItem("sessionToken");
    localStorage.removeItem("user");

    window.location.href =
        "login.html";

}

function updateScoringState(isOpen) {

    if (hasSubmitted) return;

    document
        .querySelectorAll("#scoreButtons button")
        .forEach(button => {
            button.disabled = !isOpen;
        });

    document.getElementById("submitScoreBtn").disabled =
        !isOpen || selectedScore === null;

    document.getElementById("scoreMessage").textContent =
        isOpen ? "" : "Waiting for scoring to open.";

}
