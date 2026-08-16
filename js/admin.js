async function validateAdminSession() {

    const result = await api("validateSession");

    if (!result.success) {

        localStorage.clear();
        window.location.href = "login.html";
        return false;

    }

    if (result.data.user.role !== "Admin") {

        localStorage.clear();
        window.location.href = "login.html";
        return false;

    }

    return true;

}

let currentTimerDuration = 0;
let timerInterval = null;
let polling = false;

document.addEventListener("DOMContentLoaded", async () => {

    // Check if local session exists
    if (!validateAdmin()) return;

    // Verify session with backend
    const valid = await validateAdminSession();

    if (!valid) return;
    
    // Populate the performance dropdown first
    await loadPerformanceList();

    // Then load the current state
    await loadState();

    // Navigation
    document
        .getElementById("nextBtn")
        .addEventListener("click", nextPerformance);

    document
        .getElementById("prevBtn")
        .addEventListener("click", previousPerformance);

    // Timer controls
    document
        .getElementById("startTimerBtn")
        .addEventListener("click", startTimer);

    document
        .getElementById("pauseTimerBtn")
        .addEventListener("click", pauseTimer);

    document
        .getElementById("resumeTimerBtn")
        .addEventListener("click", resumeTimer);

    document
        .getElementById("stopTimerBtn")
        .addEventListener("click", stopTimer);

    // Jump button
    document
        .getElementById("jumpBtn")
        .addEventListener("click", jumpToPerformance);

    document
          .getElementById("openScoringBtn")
          .addEventListener("click", openScoring);
        
    document
          .getElementById("closeScoringBtn")
          .addEventListener("click", closeScoring);

    // Live polling
    setInterval(pollAdminState, 2000);

});

async function loadState() {

    const result = await api("getCurrentState");

    // Internet temporarily unavailable
    if (result.offline){
        return;
    }

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

    const photo =
    document.getElementById("candidatePhoto");

    photo.src =
        `images/candidates/${performance.candidate.CandidateID}.png`;
    
    photo.onerror = () => {
    
        photo.src =
            "images/candidates/default.png";
    
    };

    const scoringOpen =
        result.data.scoringOpen;
    
    document.getElementById(
        "openScoringBtn"
    ).disabled = scoringOpen;
    
    document.getElementById(
        "closeScoringBtn"
    ).disabled = !scoringOpen;
    
    currentTimerDuration =
    Number(
        performance.segment.TimerSeconds
    );

    renderTimer(
    result.data.timer
    );

    await loadJudgeStatuses();

    document.getElementById(
    "performanceSelect"
).value =
    performance.PerformanceID;

    updateScoringState(
    result.data.scoringOpen
);

}

async function nextPerformance() {
    showLoading("Loading...");

    const result = await api("nextPerformance");

    hideLoading();

    if (!result.success) {
        alert(result.message);
        return;
    }

    await loadState();

}

async function previousPerformance() {

    showLoading("Loading...");

    const result = await api("previousPerformance");

    hideLoading();

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

    showLoading("Loading...");

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

    hideLoading();

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

    showLoading("Loading...");
    
    const result =
        await api("resumeTimer");

    hideLoading();

    if (!result.success) {

        alert(result.message);

        return;
    }

    renderTimer(result.timer);

}

async function stopTimer() {

    showLoading("Loading...");

    clearInterval(timerInterval);

    const result =
        await api("stopTimer");
    
    hideLoading();

    if (!result.success) {

        alert(result.message);

        await loadState();

        return;
    }

    renderTimer(result.timer);

}

async function loadJudgeStatuses() {

    const result =
        await api("getJudgeStatuses");

    if (!result.success) {
        return;
    }

    renderJudgeStatuses(
        result.data
    );

}

function renderJudgeStatuses(judges) {

    const container =
        document.getElementById(
            "judgeStatusContainer"
        );

    container.innerHTML = "";

    judges.forEach(judge => {

        const row =
            document.createElement("div");

        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.marginBottom = "8px";

        const name =
            document.createElement("span");

        name.textContent =
            judge.name;

        const status =
            document.createElement("span");

        if (judge.submitted) {

            status.textContent =
                "✓ Submitted";

            status.style.color =
                "green";

        } else {

            status.textContent =
                "Waiting";

            status.style.color =
                "orange";

        }

        row.appendChild(name);
        row.appendChild(status);

        container.appendChild(row);

    });

}

async function pollAdminState(){

    if (polling) return;

    polling = true;

    try{

        await loadState();

    }finally{

        polling = false;

    }

}

document
  .getElementById("jumpBtn")
  .addEventListener(
    "click",
    jumpToPerformance
  );

async function jumpToPerformance(){
    showLoading("Loading...");

    const performanceID =
        Number(
            document.getElementById("performanceSelect").value
        );

    const result =
        await api(
            "jumpToPerformance",
            { performanceID }
        );

    hideLoading();

    if(!result.success){

        alert(result.message);

        return;

    }

    await loadState();

}

async function loadPerformanceList(){

    const result = await api("getPerformanceList");

    console.log(result);

    if(!result.success){
        alert(result.message);
        return;
    }

    const select = document.getElementById("performanceSelect");
    select.innerHTML = "";

    result.data.forEach(item=>{

        const option = document.createElement("option");

        option.value = String(item.performanceID);
        option.textContent = item.label;

        select.appendChild(option);

    });

}

async function openScoring() {

    showLoading("Loading...");

    const result =
        await api("openScoring");

    hideLoading();

    if(result.success){

        await loadState();

    }

}

async function closeScoring() {

    showLoading("Loading...");

    const result =
        await api("closeScoring");

    hideLoading();

    if(result.success){

        await loadState();

    }

}

function updateScoringState(isOpen) {

    document.getElementById("openScoringBtn").disabled = isOpen;

    document.getElementById("closeScoringBtn").disabled = !isOpen;

    document.getElementById("scoringStatus").textContent =
        isOpen ? "SCORING OPEN" : "SCORING CLOSED";

}

function validateAdmin() {
    const userJSON = localStorage.getItem("user");
    const token = localStorage.getItem("sessionToken");

    if (!userJSON || !token) {
        window.location.href = "login.html";
        return false;
    }

    const user = JSON.parse(userJSON);

    if (user.role !== "Admin") {
        localStorage.clear();
        window.location.href = "login.html";
        return false;
    }

    return true;
}

document
    .getElementById("logoutBtn")
    .addEventListener("click", logout);

async function logout() {

    await api("logout");

    localStorage.clear();

    window.location.href = "login.html";

}
