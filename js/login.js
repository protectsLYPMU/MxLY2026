document
  .getElementById("loginBtn")
  .addEventListener(
    "click",
    login
  );

async function login(){

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const result =
        await api(
            "login",
            {
                username,
                password
            }
        );

    if(!result.success){

        document.getElementById("message")
          .textContent =
            result.message;

        return;

    }

    localStorage.setItem(
        "sessionToken",
        result.data.sessionToken
    );

    localStorage.setItem(
        "user",
        JSON.stringify(result.data.user)
    );

    window.location.href =
        "judge.html";

}
