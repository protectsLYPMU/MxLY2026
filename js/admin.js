let currentTimerDuration = 0;
let timerInterval = null;

document.addEventListener("DOMContentLoaded", () => {

    loadState();

    document
        .getElementById("nextBtn")
        .addEventListener(
            "click",
            nextPerformance
        );

    document
        .getElementById("prevBtn")
        .addEventListener(
            "click",
            previousPerformance
        );

    document
        .getElementById("startTimerBtn")
        .addEventListener(
            "click",
            startTimer
        );

    document
        .getElementById("pauseTimerBtn")
        .addEventListener(
            "click",
            pauseTimer
        );

    document
        .getElementById("resumeTimerBtn")
        .addEventListener(
            "click",
            resumeTimer
        );

    document
        .getElementById("stopTimerBtn")
        .addEventListener(
            "click",
            stopTimer
        );

});

async function loadState() {

    const result = await api("getCurrentState");

    if (!result.success) {
        alert(result.message);
        return;
    }

    const performance = result.data.performance;

    document.getElementById("segmentName").textContent =
        performance.segment.SegmentName;

    document.getElementById("candidateNumber").textContent =
        performance.candidate.Number;

    document.getElementById("candidateName").textContent =
        performance.candidate.Name;
    
    currentTimerDuration =
    Number(
        performance.segment.TimerSeconds
    );

    renderTimer(
    result.data.timer
    );

}

async function nextPerformance() {

    const result = await api("nextPerformance");

    if (!result.success) {
        alert(result.message);
        return;
    }

    await loadState();

}

async function previousPerformance() {

    const result = await api("previousPerformance");

    if (!result.success) {
        alert(result.message);
        return;
    }

    await loadState();

}

function renderTimer(timer) {

    document.getElementById("timerStatus").textContent =
        timer.status;

    updateTimerDisplay(timer);

}

function updateTimerDisplay(timer) {

    clearInterval(timerInterval);

    let remaining = timer.remaining;

    displayTimer(remaining);

    if (timer.status !== "Running") {
        return;
    }

    timerInterval = setInterval(() => {

        remaining--;

        if (remaining <= 0) {

            remaining = 0;

            clearInterval(timerInterval);

        }

        displayTimer(remaining);

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
    ).textContent = formatted;

}

async function startTimer() {

    if (!currentTimerDuration ||
        currentTimerDuration <= 0) {

        alert(
            "No timer duration is configured for this segment."
        );

        return;
    }

    // Immediately show the timer locally
    renderTimer({
        status: "Running",
        duration: currentTimerDuration,
        remaining: currentTimerDuration,
        endTime:
            Date.now() +
            currentTimerDuration * 1000
    });

    // Tell the backend to officially start the timer
    const result =
        await api("startTimer", {
            seconds: currentTimerDuration
        });

    if (!result.success) {

        clearInterval(timerInterval);

        alert(result.message);

        await loadState();

        return;
    }

    // Correct the local timer using the official server state
    renderTimer(result.timer);

}

async function pauseTimer() {

    // Immediately stop the local countdown
    clearInterval(timerInterval);

    const result =
        await api("pauseTimer");

    if (!result.success) {

        alert(result.message);

        await loadState();

        return;
    }

    // Synchronize with official server state
    renderTimer(result.timer);

}

async function resumeTimer() {

    const result =
        await api("resumeTimer");

    if (!result.success) {

        alert(result.message);

        return;
    }

    renderTimer(result.timer);

}

async function stopTimer() {

    clearInterval(timerInterval);

    const result =
        await api("stopTimer");

    if (!result.success) {

        alert(result.message);

        await loadState();

        return;
    }

    renderTimer(result.timer);

}
