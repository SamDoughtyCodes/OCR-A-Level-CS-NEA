// Handle pressing of the back button
const back_butt = document.getElementById("back_butt");
back_butt.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Back button pressed");
    window.location = "/Frontend/login/login.html";
});

// Handle account creation
const acc_butt = document.getElementById("sub_butt");
acc_butt.addEventListener("click", (e) => {
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
    let is_name_entered = (fname_box.innerText.length > 0);
    let is_email_entered = (email_box.innerText.length > 0);

    // If any fields are empty, return early
    if (is_butt_checked || is_name_entered || is_email_entered) {
        err_box.innerText = "Please fill in all fields!";
        return;
    }

    // Check password criteria
    let pw_len_check = (pword_box.innerText.length >= 8);
    let is_cap = false; let is_low = false; let is_spec = false;
    let specials = ["!", "?", "'", "#", "@", "(", ")", "£", "%", "*", "&"]
    for (let char in pword_box.innerText) {
        // If the character is upper case
        if (char == char.toUpperCase()) {is_cap = true;}
        // If the character is lower case
        else if (char == char.toLowerCase()) {is_low = true;}
        // If the character is special
        else if (specials.includes(char)) {is_spec = true;}
    }

    // If the password is invalid, return early
    if (!pw_len_check || !is_cap || !is_low || !is_spec) {
        err_box.innerText = "Please ensure the password meets valid criteria!";
        return;
    }
});