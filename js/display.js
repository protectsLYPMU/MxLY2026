let timerInterval = null;

let currentPerformanceID = null;

let polling = false;

async function loadState() {

    const result =
        await api("getCurrentState");

    if (!result.success) return;

    const performance =
        result.data.performance;

    currentPerformanceID =
        Number(performance.PerformanceID);

    document.getElementById(
        "segmentName"
    ).textContent =
        performance.segment.SegmentName;

    document.getElementById(
        "candidateNumber"
    ).textContent =
        String(
            performance.candidate.Number
        ).padStart(2,"0");

    document.getElementById(
        "candidateName"
    ).textContent =
        performance.candidate.Name;

    renderTimer(result.data.timer);

}

function renderTimer(timer){

    clearInterval(timerInterval);

    let remaining = timer.remaining;

    displayTimer(remaining);

    if(timer.status !== "Running") return;

    timerInterval = setInterval(()=>{

        remaining--;

        if(remaining <= 0){

            remaining = 0;

            clearInterval(timerInterval);

        }

        displayTimer(remaining);

    },1000);

}

function displayTimer(seconds){

    const m = Math.floor(seconds/60);

    const s = seconds%60;

    document.getElementById("timerDisplay")
      .textContent =
        String(m).padStart(2,"0") +
        ":" +
        String(s).padStart(2,"0");

}

async function checkState(){

    if(polling) return;

    polling = true;

    try{

        const result =
            await api("getCurrentState");

        if(!result.success) return;

        const newID =
            Number(
                result.data.performance.PerformanceID
            );

        if(newID !== currentPerformanceID){
        
            await loadState();
        
            await loadScores();
        
        }else{
        
            renderTimer(result.data.timer);
        
            await loadScores();
        
        }

    }finally{

        polling = false;

    }

}

document.addEventListener(
"DOMContentLoaded",
async()=>{

    await loadState();

    setInterval(
        checkState,
        1000
    );

});

async function loadScores(){

    const result =
        await api("getCurrentPerformanceScores");

    if(!result.success) return;

    renderScores(
        result.data.judgeScores,
        result.data.average
    );

}

function renderScores(judges, average){

    const container =
        document.getElementById("judgeScores");

    container.innerHTML = "";

    judges.forEach((judge,index)=>{

        const card =
            document.createElement("div");

        card.className = "scoreCard";

        card.innerHTML = `
            <span>J${index+1}</span>
            <strong>${judge.score ?? "—"}</strong>
        `;

        container.appendChild(card);

    });

    document.getElementById("averageScore")
      .textContent =
        average.toFixed(2);

}
