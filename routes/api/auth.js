const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");

const jwtSecret = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? require("../../config/keys").jwtSecret
    : process.env.JWT_SECRET;

//User model
const User = require("../../models/User");

// @route POSt api/auth
// @descr Authenticate user
// @access Public
router.post("/", (req, res) => {
    const { name, password } = req.body;

    if(!name || !password) { 
        return res.status(400).json({msg: "Please provide both name and password"});
    }

    User.findOne({name})
        .then(user => {
            if(!user) {
                return res.status(400).json({msg: "User does not exist"});
            }

            // Validate password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(!isMatch) {
                        return res.status(400).json({msg: "Incorrect password"});
                    }

                    jwt.sign({id: user.id}, jwtSecret, {}, 
                        (err, token) => {
                            res.json({token, user: {id: user.id, name: user.name, isAdmin: user.isAdmin}});
                        }
                    );
                })
        })
})

//So other files can read what's in this file
module.exports = router;