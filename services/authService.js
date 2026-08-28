const supabase = require("../config/supabase");
const crypto = require("crypto");

async function login(email, password) {

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw error;
    }

    const sessionToken = crypto.randomUUID();

// Old active sessions inactive
await supabase
    .from("active_sessions")
    .update({
        is_active: false,
        last_seen: new Date().toISOString()
    })
    .eq("email", email)
    .eq("is_active", true);

    // New session
    const { error: sessionError } = await supabase
        .from("active_sessions")
        .insert({
            id: crypto.randomUUID(),
            email: data.user.email,
            session_token: sessionToken,
            device_name: "Dashboard",
            login_time: new Date().toISOString(),
            last_seen: new Date().toISOString(),
            is_active: true
        });

if (sessionError) {
    console.error("Session Insert Error:", sessionError);
    throw sessionError;
}

return {
    ...data,
    sessionToken
};
}

module.exports = {
    login
};