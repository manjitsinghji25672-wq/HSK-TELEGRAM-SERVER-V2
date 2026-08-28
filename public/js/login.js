console.log("✅ Login JS Loaded");

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter Email and Password.");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerText = "Please Wait...";

    try {

        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const result = await response.json();

        console.log(result);

        if (result.success) {

            alert("✅ Login Successful");

            localStorage.setItem(
                "userEmail",
                result.user.email
        );

            localStorage.setItem(
            "sessionToken",
            result.sessionToken
        );

            window.location.href = "/dashboard.html";

            

            // Dashboard redirect (next step)
            // window.location.href = "/dashboard.html";

        } else {

            alert(result.message);

        }

    } catch (err) {

        console.error(err);

        alert("❌ Server Error");

    } finally {

        loginBtn.disabled = false;
        loginBtn.innerText = "Login";

    }

});