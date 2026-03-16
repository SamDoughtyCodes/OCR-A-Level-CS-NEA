// Function to find average of user scores
function avg_score(scores) {
    let sum = 0;
    // For each item in scores, add the value to the sum
    scores.forEach(score => {
        sum += score;
    });
    // Divide the sum by the number of scores
    return Math.round(sum / scores.length);
}

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

        // Get all submissions for a student
        let student_data = await fetch(`http://localhost:8000/api/students/${json_resp.payload.username}`);
        let student_json = await student_data.json();  // Cast data from JSON string to JSON
        let stud_subs = student_json["submissions"];  // Get the student submissions
        let recent_subs = [];  // Recent submissions will be added here
        let all_sub_scores = [];  // All scores will be added here

        // Find date 3 weeks ago
        const today = Date.now();
        const comp_date = today - (3*7*24*60*60*1000);  // Subtract 3 weeks worth of milliseconds
        const past_date = new Date(comp_date);  // Store the 3 weeks date as an object
        // Get month and date in the required format
        let month = past_date.getMonth() + 1;  // Adjust for 0-indexing
        if (month < 10) {month = "0" + String(month);}
        else {month = String(month);}

        let day = past_date.getDate();
        if (day < 10) {day = "0" + String(day);}
        else {day = String(day);}

        // Store date as string in YYYYMMDD format
        const past_date_str = `${String(past_date.getFullYear())}${month}${day}`;
        stud_subs.forEach(sub => {  // Compare each submission to the date
            // If the completion date is less than 3 weeks ago
            if (parseInt(past_date_str) <= sub.completion_date) {
                recent_subs.push(sub.score);
            }
            // Add all submission scores to an array
            all_sub_scores.push(sub.score);
        });

        // Calculate averages
        let recent_avg = avg_score(recent_subs);
        let life_avg = avg_score(all_sub_scores);

        // Output averages to site
        const rec_avg_elem = document.getElementById("recent_avg");
        const life_avg_elem = document.getElementById("life_avg");
        rec_avg_elem.innerHTML = `${String(recent_avg)}%<br>Recent Average`;
        life_avg_elem.innerHTML = `${String(life_avg)}%<br>Lifetime Average`;
    });
}
