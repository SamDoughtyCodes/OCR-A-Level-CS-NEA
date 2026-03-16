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
    }).then(async json_resp => {  // Once casted, store the payload in local storage
        localStorage.setItem("payload", JSON.stringify(json_resp.payload));
        console.log("Token validated, username: " + json_resp.payload.username);

        // Fill the placeholder text in the header
        const welc_text = document.getElementById("header_welc_text");
        const xp_text = document.getElementById("header_xp_text");
        welc_text.innerHTML = `Welcome, ${json_resp.payload.username}`;
        xp_text.innerHTML = `${String(json_resp.payload.xp)}XP`;

        let all_incomplete = [];

        // Get the active tasks for the student
        let active = await fetch(`http://localhost:8000/api/students/active/${json_resp.payload.username}`);
        let json_active = await active.json();
        let number_active = json_active.length;
        json_active.forEach(element => {all_incomplete.push(element);});

        // Get the inactive tasks for the student
        let inactive = await fetch(`http://localhost:8000/api/students/past/${json_resp.payload.username}`);
        let json_inactive = await inactive.json();
        let number_inactive = json_inactive.length;
        json_inactive.forEach(element => {all_incomplete.push(element);});

        // Update placeholders
        const active_tasks = document.getElementById("tt_active");
        active_tasks.innerHTML = `${String(number_active)}<br>Active Tasks`;
        const overdue_tasks = document.getElementById("tt_overdue");
        overdue_tasks.innerHTML = `${String(number_inactive)}<br>Overdue Tasks`;

        //TODO: Add code to distinguish between overdue and past tasks,
        //      this can literally just be checking against the student's submissions
    });
}
