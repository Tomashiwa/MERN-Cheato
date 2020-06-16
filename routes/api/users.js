const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtSecret = require("../../config/keys").jwtSecret;

//User model
const User = require("../../models/User");
const { response } = require("express");

// @route GET api/users
// @descr Get all users
// @access Public
// By entering into this file, the path is already in "/api/users". So, only "/" is required
router.get("/", (req, res) => {
    // Mongo query
    User.find()
        .sort({name: -1})
        .then(users => res.json(users));
});

// @route POST api/users
// @descr Create a user
// @access Public
router.post("/register", (req, res) => {
    const {name, password, isAdmin} = req.body;

    if(!name || !password) {
        return res.status(400).json({msg: "Please provide both name and password."});
    }

    //Check if there's an existing user with that name before creating it
    User.findOne({name})
        .then(user => {
            if(user) {
                return res.status(400).json({msg: "This name is being used, please consider other possible names."});
            }
            
            const newUser = new User({
                name,
                password,
                bookmarks: [],
                isAdmin
            });
            
            //Hashes password and save the user to backend
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) {
                        return res.status(400).json({msg: "Error encountered when hashing password"});
                    }

                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => {
                            jwt.sign({id: user.id}, jwtSecret, {}, 
                                (err, token) => {
                                    res.json({token, user: {id: user.id, name: user.name, isAdmin: user.isAdmin}});
                                }
                            );
                        })
                })
            })
        })
});

router.post("/tokenIsValid", (req, res) => {
    const token = req.header("x-auth-token");
    if(!token) {
        return res.json({isValid: false,  msg: "Token not found"});
    }

    const verified = jwt.verify(token, jwtSecret);
    if(!verified) {
        return res.json({isValid: false, msg: "Invalid Token"});
    }

    User.findById(verified.id)
        .then(user => {
            if(!user) {
                return res.json({isValid: false, msg: "No user found with the given id"});
            }

            return res.json({
                isValid: true, 
                msg: "Token is valid", 
                user: {id: user._id, name: user.name, isAdmin: user.isAdmin}
            }); 
        });
});

// @route DELETE api/users
// @descr Delete a user
// @access Public
router.delete("/:id", (req, res) => {
    User.findById(req.params.id)
        .then(users => users.remove().then(() => res.json({success: true})))
        .catch(err => res.status(404).json({success: false}));
});

//So other files can read what's in this file
module.exports = router;