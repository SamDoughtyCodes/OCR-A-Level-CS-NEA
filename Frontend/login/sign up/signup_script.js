// Function to hash data
async function hash_func(data) {
    const buffer = new TextEncoder().encode(data);  // Encode the data to a byte array
    const hashBuff = await crypto.subtle.digest("SHA-256", buffer);  // Hash the message
    const hashArr = Array.from(new Uint8Array(hashBuff));  // Generate an array of the hashvalue
    const hashHex = hashArr.map(b => ("00" + b.toString(16)).slice(-2)).join("");  // Convert to hex array
    return hashHex;  // Return the final value
}

// Handle pressing of the back button
const back_butt = document.getElementById("back_butt");
back_butt.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Back button pressed");
    window.location = "/Frontend/login/login.html";
});

// Handle viewing password
const view_butt = document.getElementById("view_pass_butt");
const pass_inp = document.getElementById("pass_box");
view_butt.innerText = "View password";
let pass_hidden = true;
view_butt.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Viewing/hiding password");
    if (pass_hidden) {  // If the password needs to be revealed
        pass_inp.type = "text";
        view_butt.innerText = "Hide Password";
        pass_hidden = false;
    } else {  // If the password needs to be hidden
        pass_inp.type = "password";
        view_butt.innerText = "View Passowrd";
        pass_hidden = true;
    }
})

// Handle account creation
const acc_butt = document.getElementById("sub_butt");
acc_butt.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Create account button pressed");
    const err_box = document.getElementById("err_text");

    // Get DOM objects of fields
    const checked_rad_butt = document.querySelector("input[name='rg_usr_type']:checked");
    const fname_box = document.getElementById("name_box");
    const email_box = document.getElementById("email_box");
    const pword_box = document.getElementById("pass_box");
    
    // Presence check on all fields (except password)
    let is_butt_checked = (checked_rad_butt !== null);
    let is_name_entered = (fname_box.value.length > 0);
    let is_email_entered = (email_box.value.length > 0);

    // If any fields are empty, return early
    if (!is_butt_checked || !is_name_entered || !is_email_entered) {
        err_box.innerText = "Please fill in all fields!";
        return;
    }

    // Check password criteria
    let pw_len_check = (pword_box.value.length >= 8);
    let is_cap = false; let is_low = false; let is_spec = false;
    let specials = ["!", "?", "'", "#", "@", "(", ")", "£", "%", "*", "&"]
    for (let i = 0; i < pword_box.value.length; i++) {
        // If the character is upper case
        if (pword_box.value[i] == pword_box.value[i].toUpperCase()) {is_cap = true;}
        // If the character is lower case
        if (pword_box.value[i] == pword_box.value[i].toLowerCase()) {is_low = true;}
        // If the character is special
        if (specials.includes(pword_box.value[i])) {is_spec = true;}
    }

    // If the password is invalid, return early
    if (!pw_len_check || !is_cap || !is_low || !is_spec) {
        err_box.innerText = "Please ensure the password meets valid criteria!";
        return;
    }

    // Format username for sending to backend
    // Username must be concatinated if there are any spaces
    let username = fname_box.value;
    for (let i = 0; i < username.length; i++) {
        if (username[i] == " ") {  // If there is a space
            // Set the next character to be upper case
            username = username.substring(0, i+1) + username[i+1].toUpperCase() + username.substring(i+2);
        }
    }
    // Remove all spaces from the string
    username = username.replace(/ /g, "");

    // Format data into JSON
    let is_usr_student = (checked_rad_butt.value == "Student");
    let user_creds = {
        "is_student": is_usr_student,
        "email": email_box.value,
        "name": username,
        "hash_pass": await hash_func(pword_box.value)
    }

    // Send data to the API
    fetch(
        "http://localhost:8000/api/newuser",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(user_creds)
        }
    ).then(response => response.json())
    .then(json_resp => {
        console.log(json_resp);
        if (json_resp.success) {
            alert(`Your account was successfully created!\nUsername: ${json_resp.username}\nPlease remember this and your password!`);
            window.location = "/Frontend/login/login.html";
        } else {
            console.log("Failed to create account");
            err_box.innerText = "This email is already in use!";
        }
    });
});