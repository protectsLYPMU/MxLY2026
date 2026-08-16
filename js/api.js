const API_URL =
"https://script.google.com/macros/s/AKfycbyZr9TUeTYy_mcSRIghXC6xXkXRbB5FRZ8iAoOtZwQqyzhyBVq1nj52SKszXwEsiL7wrw/exec";

let apiOnline = true;

async function api(action, data = {}) {

    const token =
        localStorage.getItem("sessionToken");

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action,
                sessionToken: token,
                ...data
            })
        });

        const result = await response.json();

        setConnectionStatus(true);

        return result;

    } catch (err) {

        console.error(err);

        setConnectionStatus(false);

        return {
            success: false,
            offline: true,
            message: "Connection lost"
        };

    }

}
