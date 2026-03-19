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

        // Add the insight on progress
        const insight_ph = document.getElementById("insight");
        if (recent_avg >= life_avg) {
            insight_ph.innerHTML = "You're improving!<br>Well done!";
        } else {
            insight_ph.innerHTML = "Nice work,<br>keep it up!";
        }

        // Store active and past tasks
        let active = await (await fetch(`http://localhost:8000/api/students/active/${json_resp.payload.username}`)).json()
        let past = await (await fetch(`http://localhost:8000/api/students/past/${json_resp.payload.username}`)).json()
        let number_active = active.length;
        let number_past = past.length;

        // Combine arrays into one
        let all_tasks = [...active, ...past];

        // Get IDs of tasks for each submission
        let sub_t_ids = [];
        stud_subs.forEach(sub => {sub_t_ids.push(sub.task_id);});
        
        // Iterate over all tasks
        let all_incomplete = []
        all_tasks.forEach(task => {
            // If the task has been submitted
            if (sub_t_ids.includes(task.t_id)) {
                // Alter counters based on type of task
                if (active.includes(task)) {number_active -= 1;}
                else if (past.includes(task)) {number_past -= 1;}
            } else {  // If the task needs to be output
                all_incomplete.push(task);
            }
        });
        
        // Update placeholders
        const active_tasks = document.getElementById("tt_active");
        active_tasks.innerHTML = `${String(number_active)}<br>Active Tasks`;
        const overdue_tasks = document.getElementById("tt_overdue");
        overdue_tasks.innerHTML = `${String(number_past)}<br>Overdue Tasks`;

        // Displaying tasks to the screen
        const tasks_div = document.getElementById("tt_tasks_container");
        let html_str = "";
        const t = new Date();  // Represents today as a date object
        let t_month_str = (t.getMonth() < 9) ? "0" + String(t.getMonth()+1) : String(t.getMonth()+1);
        let t_day_str = (t.getDate() < 10) ? "0" + String(t.getDate()) : String(t.getDate());
        let t_comp_val = parseInt(t.getFullYear() + t_month_str + t_day_str);
        all_incomplete.forEach(task => {
            let date_str;
            if (t_comp_val > task.due) {  // If the task is overdue
                date_str = '<mark class="od_style">OVERDUE</mark>';
            } else {  // If the due date has not yet passed
                let d = String(task.due);  // Store due date
                date_str = `Due ${d.slice(6)}/${d.slice(4, 6)}/${d.slice(0, 4)}`;
            }
            html_str += `<button id="${task.c_id}_butt" onclick="tasks_redirect_func(this)">${task.class}<br>${task.name}<br>${date_str}</button>`;
        });
        tasks_div.innerHTML = html_str;  // Apply changes

        // Onclick function for active tasks
    });
}

// Deal with clicks of task buttons
function tasks_redirect_func(button) {
    // Extract the task ID from the button ID
    let t_id = button.id.slice(0, -5);
    localStorage.setItem("ttc", t_id);  // Store the ID

    // Redirect user to page to complete task
    window.location = "/Frontend/Student Area/tasks/complete.html";
}

// Links to other pages for buttons
const i_study_butt = document.getElementById("ind_study_butt");
i_study_butt.addEventListener("click", (e) => {
    // Redirect the user to indipendant study
    e.preventDefault();
    window.location = "/Frontend/Student Area/study/study.html";
});

const lead_butt = document.getElementById("lead_butt");
lead_butt.addEventListener("click", (e) => {
    // Redirect to the leaderboards page
    e.preventDefault();
    window.location = "/Frontend/Student Area/leaderboards/leads.html";
});

const t_hist_butt = document.getElementById("history_butt");
t_hist_butt.addEventListener("click", (e) => {
    // Redirect to the tasks page
    e.preventDefault();
    window.location = "/Frontend/Student Area/tasks/history.html";
});
