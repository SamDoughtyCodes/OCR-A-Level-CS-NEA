// --- Validate token ---
let token = localStorage.getItem("token");  // Fetch the token from storage
// Check if a token was found
if (token === null) {  // If no token
    // Redirect to login page
    window.location = "/Frontend/login/login.html";
} else {
    // Make API call to validate found token
    let call_url = "http://localhost:8000/api/validate";
    fetch(call_url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(response => {
        if (response.status === 403 || response.status === 401) {
            window.location = "/Frontend/login/login.html";
        } else {
            return response.json();  // Return the promise to cast response
        }
    }).then(json_resp => {  // Once casted, store the payload in local storage
        localStorage.setItem("payload", JSON.stringify(json_resp.payload));
        console.log("Token validated, username: " + json_resp.payload.username);
        
        // Header text
        const header_text = document.getElementById("welc_text");
        const usr_data = JSON.parse(localStorage.getItem("payload"));
        const username = usr_data.username;
        console.log(usr_data, username);
        header_text.innerText = `Welcome, ${username}`;

        // Active tasks text
        const active_text = document.getElementById("a_tasks");
        fetch(`http://localhost:8000/api/tasks/active/${username}`).then(resp => resp.json()).then(j_resp => {
            let num_tasks = j_resp.length;
            active_text.innerHTML = `${String(num_tasks)}<br>Active Tasks`;
        });
    });
}
