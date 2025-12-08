document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM is working");
    
    // Handle button to link to sign ups
    const signup_butt = document.getElementById("signup_butt");
    signup_butt.addEventListener("click", (e) => {
        console.log("Signup button press detected");
        e.preventDefault()
        window.location = "/Frontend/login/sign up/signup.html";
    });
});