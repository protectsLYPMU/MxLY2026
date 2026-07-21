const API_URL =
"https://script.google.com/macros/s/AKfycbyZr9TUeTYy_mcSRIghXC6xXkXRbB5FRZ8iAoOtZwQqyzhyBVq1nj52SKszXwEsiL7wrw/exec";

async function api(action, data = {}) {

  const token = localStorage.getItem("sessionToken");

  try {

    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action,
        sessionToken: token,
        ...data
      })
    });

    return await response.json();

  } catch (err) {

    console.error(err);

    return {
      success: false,
      message: err.message
    };

  }

}
