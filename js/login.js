document
  .getElementById("loginBtn")
  .addEventListener(
    "click",
    login
  );

async function login(){

    showLoading("Loading...");
  
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

    hideLoading();
  
    if (!result.success) {
    
        document.getElementById("message").textContent =
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

  
    
    // Redirect based on role
    if (result.data.user.role === "Admin") {
    
        window.location.href = "admin.html";
    
    } else {
    
        window.location.href = "judge.html";
    
    }

}
