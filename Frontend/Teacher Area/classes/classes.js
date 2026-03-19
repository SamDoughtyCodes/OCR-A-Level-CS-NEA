// Function to hash data
async function hash_func(data) {
    const buffer = new TextEncoder().encode(data);  // Encode the data to a byte array
    const hashBuff = await crypto.subtle.digest("SHA-256", buffer);  // Hash the message
    const hashArr = Array.from(new Uint8Array(hashBuff));  // Generate an array of the hashvalue
    const hashHex = hashArr.map(b => ("00" + b.toString(16)).slice(-2)).join("");  // Convert to hex array
    return hashHex;  // Return the final value
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

            // Call to get the initial set of students
            format_students();
        });
    });
}

// Get the students for a class when the dropdown is updated
const dropdown = document.getElementById("class_drop");
const stud_table = document.getElementById("studs_tb");
const add_studs_butt = document.getElementById("add_stud_butt");

// Function to load members of a class on update of the dropdown
function format_students() {
    // Reset table to base state
    stud_table.innerHTML = "<tr><th>Student</th><th></th><th></th><th>Password resets</th></tr>"

    // Get the ID of the selected class
    let id = dropdown.value;
    fetch(`http://localhost:8000/api/classes/students/${id}`).then(resp => resp.json()).then(studs_json => {
        let studs_html_str = "";  // String which will store new HTML for the page
        studs_json.forEach(student => {
            // String of HTML for this specific student
            let stud_html_fill = `<tr><td>${student.personal.username}</td><td><button id="${student.personal.username}_user_butt" class="stud_user" onclick="usr_upd_func(this)">Change Username</button></td><td><button id="${student.personal.username}_pass_butt" class="stud_pass" onclick="pass_upd_func(this)">Change Password</button></td><td>${student.personal.password_resets}</td></tr>`;
            studs_html_str += stud_html_fill;
        });
        // Fill the HTML for the page
        stud_table.innerHTML += studs_html_str;
    });

    // Update the text which includes class names
    let class_name = dropdown.options[dropdown.selectedIndex].text;
    const add_stud_pop_title = document.getElementById("add_stud_title");
    add_stud_pop_title.innerHTML = `Add students to ${class_name}`;

    const confirm_button = document.getElementById("confirm_add_studs");
    confirm_button.innerHTML = `Add students to ${class_name}`;

    // Remove attribute to make button visiable
    add_studs_butt.removeAttribute("hidden");
}

// Call the function every time the page updates
dropdown.addEventListener("change", format_students);

// Logic for creating a new class
const new_class_popup = document.getElementById("new_class_pop");
const new_class_activate_butt = document.getElementById("new_c_butt");
new_class_activate_butt.addEventListener("click", (e) => {
    e.preventDefault();  // Stop the page from refreshing
    // Make the popup visiable
    new_class_popup.removeAttribute("hidden");
});
// Deal with submission of new class
const new_class_submit = document.getElementById("new_c_sub");
const new_class_name = document.getElementById("c_name_box");
new_class_submit.addEventListener("click", (e) => {
    e.preventDefault();  // Stop the page from refreshing
    // Get the value of the box with the name
    let name_val = new_class_name.value;
    // Validate length 
    if (name_val.length == 0) {
        alert("Please enter a class name!");
    } else {  // If a name has been entered
        // Prepare data for making the API call
        let usr_data = JSON.parse(localStorage.getItem("payload"));
        fetch("http://localhost:8000/api/classes/new", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"name": name_val, "owner_id": null, "owner_name": usr_data.username})
        }).then(resp => {
            alert("Class created!");
            location.reload();  // Refresh the page to update page
        });
    }
});

// - Logic for adding new students - 
// When the button is clicked, the pop up should be made visiable
const add_students_popup = document.getElementById("add_stud_pop");
add_studs_butt.addEventListener("click", (e) => {
    e.preventDefault();  // Stop page refresh when clicked
    add_students_popup.removeAttribute("hidden");  // Make the popup visiable
});

// Refresh the page when the cancel button is pressed
const cancel_add_students = document.getElementById("cancel_add_studs");
cancel_add_students.addEventListener("click", (e) => {
    location.reload();  // Refresh the page
});

// Search box logic
const search_butt = document.getElementById("uname_search_submit");
const search_box = document.getElementById("uname_search_box");
const available_studs = document.getElementById("available_studs");
let studs_added = 0;  // Keep count of the numbre of students which have been selected
search_butt.addEventListener("click", (e) => {
    e.preventDefault();  // Stop the page from refreshing
    let search_val = search_box.value;
    fetch(`http://localhost:8000/api/students/search/${String(search_val)}`).then(res => res.json()).then(j_res => {
        let available_html = `<form id="av_students">`;
        j_res.forEach(stud => {
            available_html += `<label for="${stud}_available">${stud}</label><input type="radio" id="${stud}_available" onchange="set_selected(this)">`;
        });
        available_html += `</form>`;
        available_studs.innerHTML = available_html;
    });
});
const selected_studs = document.getElementById("selected_studs");
// Function which moves a student from available students to selected students
function set_selected(r_butt) {
    available_studs.innerHTML = "";
    let student_user = r_butt.id.slice(0, -10);  // Get the username of the student which has been selected
    let rb_html = `<label for="${student_user}_selected" id="${student_user}_label">${student_user}</label><input type="radio" id="${student_user}_selected" onchange="set_deselected(this)">`
    if (studs_added == 0) {  // If this is the first student, remove the placeholder text
        selected_studs.innerHTML = rb_html;
    } else {  // Otherwise add this item to the form
        selected_studs.innerHTML += rb_html;  // Append the data to the form which has been accessed
    }
    studs_added++;  // Increment the counter to keep track of the number of students
}
// Function which removes students from selected
function set_deselected(r_butt) {
    let rb_elem = document.getElementById(r_butt.id);  // Get the element pressed
    let label_id = rb_elem.id.slice(0, -9) + "_label";  // Get the ID of the label element
    let lab_elem = document.getElementById(label_id);
    rb_elem.remove();
    lab_elem.remove();
}

// Deal with the submission of new students to classes
const new_studs_sub_butt = document.getElementById("confirm_add_studs");
new_studs_sub_butt.addEventListener("click", (e) => {
    e.preventDefault();
    // Get all students to add, and store in an array
    let students = [];
    let labels = selected_studs.querySelectorAll("label");
    for (i = 0; i < labels.length; i++) {
        // Add the student name to the array
        students.push(labels[i].innerText);
    }
    let class_id = dropdown.value;  // Get the ID of the class to add the students to
    let call_data = {"c_id": class_id, "studs": students};  // Format data
    
    // Make API call
    fetch("http://localhost:8000/api/students/add_link", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(call_data)
    }).then(resp => resp.json()).then(j_resp => {
        if (j_resp) {alert("Students added successfully!");}  // If the call was successful
        else {alert("Issue adding students!");}
        location.reload();  // Refresh the page to update any changes
    });
});

// Popup for updating a username
const user_popup = document.getElementById("upd_user_pop");
const inp_value_user = document.getElementById("upd_user_inp");
const user_upd_subbutt = document.getElementById("confirm_upd_uname");
let stud_user = ""; // The username of the student who needs updating
function usr_upd_func(button) {
    user_popup.removeAttribute("hidden");  // Makes the popup visiable
    stud_user = button.id.slice(0, -10);  // Get the current username of the user
};
user_upd_subbutt.addEventListener("click", (e) => {
    e.preventDefault()  // Stop the page from refreshing
    let new_name = inp_value_user.value;  // Get the new username which has been enterred
    
    // Make API call
    fetch("http://localhost:8000/api/students/upd_user", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"id": null, "user": stud_user, "name": new_name})
    }).then(resp => resp.json()).then(j_resp => {
        if (j_resp == true) {
            alert("Username updated successfully!");
        } else {
            alert("Failed to update username");
        }
        location.reload()  // Refresh the page to update changes
    });
})

// Popup for updating a password
const pass_popup = document.getElementById("upd_pass_pop");
const inp_value_pass = document.getElementById("upd_pass_inp");
const upd_pass_subbutt = document.getElementById("confirm_upd_pass");
let stud_to_upd = "";
async function pass_upd_func(button) {
    pass_popup.removeAttribute("hidden");  // Make popup visiable
    stud_to_upd = button.id.slice(0, -10);  // Gets the username of the user to update the password of
}
upd_pass_subbutt.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Being run!");
    let new_pass = inp_value_pass.value;  // Gets the password the user wishes to update

    // Validate password
    let pw_len_check = (new_pass.length >= 8);
    let is_cap = false; let is_low = false; let is_spec = false;
    let specials = ["!", "?", "'", "#", "@", "(", ")", "£", "%", "*", "&"]
    for (let i = 0; i < new_pass.length; i++) {
        // If the character is upper case
        if (new_pass[i] == new_pass[i].toUpperCase()) {is_cap = true;}
        // If the character is lower case
        if (new_pass[i] == new_pass[i].toLowerCase()) {is_low = true;}
        // If the character is special
        if (specials.includes(new_pass[i])) {is_spec = true;}
    }

    // If the password is invalid, return early
    if (!pw_len_check || !is_cap || !is_low || !is_spec) {
        alert("Please ensure the password meets valid criteria!");
        return;
    }

    // Hash the password ready to be stored in the database
    hash_func(new_pass).then(hashed_pass => {
        // Format data for API call
        data = {
            "id": null,
            "user": stud_to_upd,
            "hash": hashed_pass
        };

        // Make API call and handle response
        fetch("http://localhost:8000/api/students/upd_pass", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        }).then(resp => resp.json()).then(j_resp_pass => {
            if (j_resp_pass == true) {
                alert("Password updated successfully!");
            } else {
                alert("Failed to update password");
            }
            location.reload()  // Refresh the page to update changes
        });
    });
});
