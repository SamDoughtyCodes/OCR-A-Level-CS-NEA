// Function to find the average score of a class
function avg(scores) {
    let sum = 0;
    scores.forEach(element => {
        sum += parseFloat(element);
    });
    return (sum / scores.length);
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

        //TODO: FIX THIS, ISSUE WITH PASSING OF ID ON BACKEND
        // // Active tasks text
        // const active_text = document.getElementById("a_tasks");
        // fetch(`http://localhost:8000/api/tasks/active/${username}`).then(resp => resp.json()).then(j_resp => {
        //     let num_tasks = j_resp.length;
        //     active_text.innerHTML = `${String(num_tasks)}<br>Active Tasks`;
        // });

        // Average Student Score
        // Get the scores for all submissions for that teacher
        const avg_text = document.getElementById("avg_score");
        fetch(`http://localhost:8000/api/submissions/${username}`).then(resp => resp.json()).then(j_resp => {
            let scores = [];  // Declare an empty array to store all the scores 
            j_resp.forEach(submission => {  // Iterate over each submission returned from the API
                scores.push(submission.score);  // Add each score to the array
            });
            let avg_score = avg(scores);  // Calculate the average score
            avg_text.innerHTML = `${String(avg_score)}%<br>Average Student Score`;  // Update the dashboard text with the score
        });
    });
}
