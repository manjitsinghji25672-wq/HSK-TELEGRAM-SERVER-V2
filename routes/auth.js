const express = require("express");
const router = express.Router();

const authService = require("../services/authService");

// ==========================
// LOGIN
// ==========================
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and Password are required."
            });

        }

        const result = await authService.login(email, password);

        res.json({
            success: true,
            session: result.session,
            sessionToken: result.sessionToken,
            user: result.user
        });

    } catch (err) {

        res.status(401).json({
            success: false,
            message: err.message
        });

    }

});

module.exports = router;