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
        header_text.innerText = `Welcome, ${username}`;

        // Get classes
        fetch(`http://localhost:8000/api/classes/all/${username}`).then(resp => resp.json()).then(json_classes => {
            // Format classes returned into HTML to output
            let html_str = "";
            json_classes.forEach(cl => {
                let cl_str = `<option value="${cl.id}">${cl.name}</option>`;
                html_str += cl_str;
            });

            // Add HTML to page
            const classes_dropdown = document.getElementById("class_drop");
            classes_dropdown.innerHTML = html_str;
        });
    });
}

// Get the students for a class when the dropdown is updated
const dropdown = document.getElementById("class_drop");
const stud_list_div = document.getElementById("students_div");
const add_studs_butt = document.getElementById("add_stud_butt");
dropdown.addEventListener("change", (e) => {
    // Get the ID of the selected class
    let id = dropdown.value;
    fetch(`http://localhost:8000/api/classes/students/${id}`).then(resp => resp.json()).then(studs_json => {
        let studs_html_str = "";  // String which will store new HTML for the page
        studs_json.forEach(student => {
            // String of HTML for this specific student
            let stud_html_fill = `${student.personal.username} <button class="stud_user" onclick="usr_upd_func(this)">Change Username</button><button class="stud_pass" onclick="pas_upd_func(this)">Change Password</button><br>`;
            studs_html_str += stud_html_fill;
        });
        // Fill the HTML for the page
        stud_list_div.innerHTML = studs_html_str;
    });

    // Remove attribute to make button visiable
    add_studs_butt.removeAttribute("hidden");
});

// Function to update the username of a student on button press
function usr_upd_func() {
    
}

// Classes don't show up until an update, so when change needed just
// store all of this in a function which is called by the event listener