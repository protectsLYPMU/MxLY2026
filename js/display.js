let timerInterval = null;

let currentPerformanceID = null;

let polling = false;

async function loadState() {

    const result =
        await api("getCurrentState");

    if(result.offline){
    return;
    }

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

    const photo =
    document.getElementById("candidatePhoto");

    photo.src =
        `images/candidates/${performance.candidate.CandidateID}.png`;
    
    photo.onerror = () => {
    
        photo.src =
            "images/candidates/default.png";
    
    };

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

    judges.forEach((judge, index) => {

        const card =
            document.createElement("div");

        card.className = "scoreCard";

        card.innerHTML = `
            <div class="scoreValue">
                ${judge.score ?? "—"}
            </div>

            <div class="scoreLabel">
                ${judge.name || `Judge ${String.fromCharCode(65 + index)}`}
            </div>
        `;

        container.appendChild(card);

    });

    document.getElementById("averageScore").textContent =
        average.toFixed(2);

}
