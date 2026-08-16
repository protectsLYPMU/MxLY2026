let polling = false;

async function loadResults() {

    const result =
        await api("getLiveResults");

    if(result.offline){
    return;
    }

    if (!result.success) {
        return;
    }

    renderResults(result.data);

}

function renderResults(results) {

    const body =
        document.getElementById("resultsBody");

    body.innerHTML = "";

    results.forEach(candidate => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${candidate.rank}</td>
            <td>${candidate.candidateNumber}</td>
            <td>${candidate.candidateName}</td>
            <td>${candidate.average.toFixed(2)}</td>
            <td>${candidate.submitted}</td>
        `;

        body.appendChild(row);

    });

}

async function pollResults() {

    if (polling) return;

    polling = true;

    try {

        await loadResults();

    } finally {

        polling = false;

    }

}

document.addEventListener(
    "DOMContentLoaded",
    async ()=>{

        await loadResults();

        setInterval(
            pollResults,
            2000
        );

    }
);
