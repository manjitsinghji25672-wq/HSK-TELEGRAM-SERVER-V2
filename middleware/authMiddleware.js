const supabase = require("../config/supabase");

async function authMiddleware(req, res, next) {

    try {

        const sessionToken = req.headers["x-session-token"];

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                message: "Session token missing."
            });
        }

        const { data, error } = await supabase
            .from("active_sessions")
            .select("*")
            .eq("session_token", sessionToken)
            .eq("is_active", true)
            .single();

        if (error || !data) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please login again."
            });
        }

        req.session = data;

        next();

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

}

module.exports = authMiddleware;