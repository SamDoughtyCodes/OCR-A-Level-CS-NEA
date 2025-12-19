// Function to hash data
async function hash_func(data) {
    const buffer = new TextEncoder().encode(data);  // Encode the data to a byte array
    const hashBuff = await crypto.subtle.digest("SHA-256", buffer);  // Hash the message
    const hashArr = Array.from(new Uint8Array(hashBuff));  // Generate an array of the hashvalue
    const hashHex = hashArr.map(b => ("00" + b.toString(16)).slice(-2)).join("");  // Convert to hex array
    return hashHex;  // Return the final value
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM is working");
    
    // Handle button to link to sign ups
    const signup_butt = document.getElementById("signup_butt");
    signup_butt.addEventListener("click", (e) => {
        console.log("Signup button press detected");
        e.preventDefault();
        window.location = "/Frontend/login/sign up/signup.html";
    });

    // Handle button to submit the form
    const sub_butt = document.getElementById("sub_butt");
    sub_butt.addEventListener("click", async (e) => {
        console.log("Submit button pressed");
        e.preventDefault();
        const error_box = document.getElementById("err_text");

        // Prescence check for both boxes
        let user = document.getElementById("usr_box").innerText;
        let pass = document.getElementById("pass_box").innerText;
        if (user.length == 0 || pass.length == 0) {
            error_box.innerText = "Please enter all details before logging in!";
            return;  // Exit the function early
        }

        // Generate hash value for password
        let hash_val = await hash_func(pass);

        // Send data to backend endpoint
        let credentials = {"user": user, "hash_value": hash_val}
        fetch(  // Make initial API call
            "http://localhost:8000/api/login",
            {
                method: "POST",
                headers: {"Content-Type": "applications/json"},
                body: JSON.stringify(credentials)
            }
        ).then(response => {  // Process the response with the following function
            data = response.json();
            if (data.success) {
                localStorage.setItem("token", data.token);
                // window.location = "add this later"  // ADD THIS
                // Determine if the user is a teacher or a student
            } else {
                error_box.innerText = data.msg;  // Output an error message
            }
        });
    });
});