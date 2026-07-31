document.addEventListener("DOMContentLoaded", () => {

    loadState();

    document
        .getElementById("nextBtn")
        .addEventListener("click", nextPerformance);

    document
        .getElementById("prevBtn")
        .addEventListener("click", previousPerformance);

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
