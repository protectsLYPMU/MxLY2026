let timerInterval = null;

let selectedScore = null;

let currentPerformanceID = null;

let hasSubmitted = false;

function loadJudgeInfo() {

    const userJSON =
        localStorage.getItem("user");

    if (!userJSON) {

        window.location.href =
            "login.html";

        return;

    }

    const user =
        JSON.parse(userJSON);

    document.getElementById(
        "judgeName"
    ).textContent = user.name;

}

async function loadState() {

    const result =
        await api("getCurrentState");

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

    const result =
        await api(
            "submitScore",
            {
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

setInterval(
    checkForStateChange,
    2000
);

async function checkForStateChange() {

    const result =
        await api("getCurrentState");

    if (!result.success) {
        return;
    }

    const performanceID =
        Number(
            result.data.performance.PerformanceID
        );

    if (
        currentPerformanceID === null
    ) {

        currentPerformanceID =
            performanceID;

        return;

    }

    if (
        performanceID !==
        currentPerformanceID
    ) {

        currentPerformanceID =
            performanceID;

        resetScore();

        loadState();

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

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadJudgeInfo();

        loadState();

    }
);
