function showLoading(message = "Please wait...") {

    const modal = document.getElementById("loadingModal");
    const text = document.getElementById("loadingMessage");

    text.textContent = message;
    modal.style.display = "flex";

}

function hideLoading() {

    document.getElementById("loadingModal").style.display = "none";

}
