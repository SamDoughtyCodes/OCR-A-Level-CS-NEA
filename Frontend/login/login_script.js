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
        let user = document.getElementById("usr_box").value;
        let pass = document.getElementById("pass_box").value;
        console.log(user, pass);
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
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(credentials)
            }
        )
        .then(response => response.json())  // Cast response to JSON
        .then(data => {  // Process the response with the following function
            if (data.success) {
                localStorage.setItem("token", data.token);
                // Determine if the user is a teacher or a student
                let addr = "http://localhost:8000/api/validate";
                fetch(addr, {
                    headers: {
                        Authorization: 'Bearer ${data.token}'
                    }
                })
                .then(response => response.json())  // Cast response to JSON
                .then(payload => {  // Make API call and handle response
                    localStorage.setItem("payload", payload.payload);
                    if (payload.usr_type == "Student") {
                        window.location = "/Frontend/Student Area/dashboard/stud_dash.html";
                    } else if (payload.usr_type == "Teacher") {
                        window.location = "/Frontend/Teacher Area/dashboard/teach_dash.html";
                    } else {
                        console.log("Issue resolving user type");
                    }
                });
            } else {
                error_box.innerText = data.msg;  // Output an error message
            }
        });
    });
});