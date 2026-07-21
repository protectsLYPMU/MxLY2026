const API_URL =
"https://script.google.com/macros/s/AKfycbyZr9TUeTYy_mcSRIghXC6xXkXRbB5FRZ8iAoOtZwQqyzhyBVq1nj52SKszXwEsiL7wrw/exec";

async function api(action,data={}){

    const response = await fetch(API_URL,{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            action,

            ...data

        })

    });

    return await response.json();

}
