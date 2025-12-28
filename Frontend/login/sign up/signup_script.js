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

    // Presence check on all fields
    const radio_group = document.getElementsByName("rg_usr_type");
    
});