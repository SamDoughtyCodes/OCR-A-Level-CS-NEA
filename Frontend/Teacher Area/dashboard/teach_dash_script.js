// Function to find the average score of a class
function avg(scores) {
    let sum = 0;
    scores.forEach(element => {
        sum += parseFloat(element);
    });
    return (sum / scores.length);
}

// Funtion to access the task to review and redirect to new page
function comp_task_redirect(butt) {
    let butt_html = butt.innerHTML;

    // Iterate over the contents to get the class name and task name
    let class_name = null;
    let task_name = null;
    let tn_start_i = null;  // Variable to store the index of the start of the task name
    for (let i = 0; i < butt_html.length - 2; i++) {
        // Get the class name and the character where the task name begins
        if (butt_html.slice(i, i+4) == "</p>") {
            class_name = butt_html.slice(3, i);
            tn_start_i = i + 7;  // Holds the first character of the task name
            break;
        }
    }
    for (let ii = tn_start_i; ii < butt_html.length - 2; ii++) {
        if (butt_html.slice(ii, ii+4) == "</p>") {
            task_name = butt_html.slice(tn_start_i, ii);
            break;
        }
    }
    let data = {"class": class_name, "task": task_name};
    localStorage.setItem("ttr", JSON.stringify(data));
    window.location = "/Frontend/Teacher Area/tasks/tasks.html";
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
    }).then(json_resp => {  // Once casted, store the payload in local storage
        localStorage.setItem("payload", JSON.stringify(json_resp.payload));
        console.log("Token validated, username: " + json_resp.payload.username);
        
        // Header text
        const header_text = document.getElementById("welc_text");
        const usr_data = JSON.parse(localStorage.getItem("payload"));
        const username = usr_data.username;
        console.log(usr_data, username);
        header_text.innerText = `Welcome, ${username}`;

        //TODO: FIX THIS, ISSUE WITH PASSING OF ID ON BACKEND, CUASES FATAL SERVER ERROR
        // Active tasks text
        const active_text = document.getElementById("a_tasks");
        fetch(`http://localhost:8000/api/tasks/active/${username}`).then(resp => resp.json()).then(j_resp => {
            let num_tasks = j_resp.length;
            active_text.innerHTML = `${String(num_tasks)}<br>Active Tasks`;
        });

        // Average Student Score
        // Get the scores for all submissions for that teacher
        const avg_text = document.getElementById("avg_score");
        fetch(`http://localhost:8000/api/submissions/${username}`).then(resp => resp.json()).then(sub_j_resp => {
            let scores = [];  // Declare an empty array to store all the scores 
            sub_j_resp.forEach(submission => {  // Iterate over each submission returned from the API
                scores.push(submission.score);  // Add each score to the array
            });
            let avg_score = avg(scores);  // Calculate the average score
            avg_text.innerHTML = `${String(avg_score)}%<br>Average Student Score`;  // Update the dashboard text with the score

        
            // Percentage of scores submitted on time
            // Get the text element needed
            const ot_text = document.getElementById("ot_tasks");
            // Get all tasks for the user to compare to all submissions
            fetch(`http://localhost:8000/api/tasks/all/${username}`).then(resp => resp.json()).then(task_j_resp => {
                let ot_sum = 0;  // Sum of the number of on time submissions
                sub_j_resp.forEach(submission => {  // Iterate over every submission
                    let task_id = submission.task_id;  // Get the task ID to search for
                    for (let task of task_j_resp) {  // Iterate over tasks
                        let c_task_id = task.id;  // Get the task ID of the current task
                        // If the submission and task id match, check if it was submitted on time
                        if (c_task_id == task_id) {
                            // Get the submission date
                            let db_sub_date = String(submission.completion_date);
                            let sub_date = new Date(`${db_sub_date.slice(0, 4)}-${db_sub_date.slice(4, 6)}-${db_sub_date.slice(6)}`);

                            // Get the due date for the task
                            let db_due_date = String(task.due_date);
                            let due_date = new Date(`${db_due_date.slice(0, 4)}-${db_due_date.slice(4, 6)}-${db_due_date.slice(6)}`);

                            // Compare dates
                            if (due_date >= sub_date) { // If submitted on time
                                ot_sum += 1;
                            }

                            // As task for sub has been found, don't check any more tasks
                            break;
                        }
                    }
                });

                let perc_ot = (ot_sum / sub_j_resp.length) * 100;
                ot_text.innerHTML = `${String(perc_ot)}%<br>Submitted On Time`;
            });
        });

        // Output completed tasks
        // Get the div which will contain output
        const to_review_div = document.getElementById("tasks_content");
        // Get all completed tasks
        fetch(`http://localhost:8000/api/tasks/complete/${username}`).then(resp => resp.json()).then(review_j_resp => {
            // Format each task into a html block
            all_html = [];
            review_j_resp.forEach(task => {
                // Get info required to output
                let class_name = task.class_name;
                let task_name = task.name;
                let due_date = new Date(`${String(task.due).slice(0, 4)}-${String(task.due).slice(4, 6)}-${String(task.due).slice(6)}`);

                // Format task into html
                let html = `<button class="review_task" onclick="comp_task_redirect(this)"><p>${class_name}</p><p>${task_name}</p><p>Due ${due_date.toString().slice(0, 10)}<p></button>`;
                all_html.push(html);
            });
            // Set contnets of div to be the tasks due
            to_review_div.innerHTML = all_html.join(" ");
        });
    });
}

// - Event Listeners -
const see_more_button = document.getElementById("overview_sm_butt");
see_more_button.addEventListener("click", (e) => {
    e.preventDefault();  // Prevent the page from refreshing
    window.location = "/Frontend/Teacher Area/analysis/analysis.html";  // Redirect to analysis page
});

const qa_tasks_button = document.getElementById("qacts_tasks_butt");
qa_tasks_button.addEventListener("click", (e) => {
    e.preventDefault();  // Prevent the page from refreshing
    localStorage.setItem("ttr", "none");  // Set the task to review, ttr
    window.location = "/Frontend/Teacher Area/tasks/tasks.html";  // Redirect to tasks page
});

const qa_class_button = document.getElementById("qacts_class_butt");
qa_class_button.addEventListener("click", (e) => {
    e.preventDefault();  // Prevent page from refreshing
    window.location = "/Frontend/Teacher Area/classes/classes.html";  // Redirect to classes page
});
