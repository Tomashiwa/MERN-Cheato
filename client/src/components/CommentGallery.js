import CommentCard from "../components/CommentCard";
import { Button, Comment, Form, Header } from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";

import React, { useState, useEffect } from "react";
import mongoose from "mongoose";
import axios from "axios";

function CommentGallery({ userID, sheetID }) {
    const [comments, setComments] = useState(null);
    const [body, setBody] = useState("");
    const [isStale, setIsStale] = useState(false);


    function isCommentPresent() {
        return comments !== null && comments.length !== 0;
    }

    // useEffect(() => {
    //   const commentInput = document.querySelector("#CommentText");
    //   const setComment = (e) => {
    //     console.log({ ...form, ...{ comment: e.target.value } });
    //   };

    //   commentInput.addEventListener("change", setComment);

    //   return () => commentInput.removeEventListener("change", setComment);
    // }, [form, setForm]);

    // useEffect(() => {
    //   const CommentBtn = document.querySelector("#submitBtn");
    //   console.log(CommentBtn);

    //   const submitComment = () => {
    //     const newComment = {
    //       user: userID,
    //       datetime: Date.now(),
    //       cheatsheet: mongoose.Types.ObjectId("5ef5df41e0cc7a1bb8e3a84a"),
    //       body: form.comment,
    //     };

    //     console.log(form);
    //     console.log(form.comment);
    //     console.log(newComment);
    //     axios.post("/api/comments/", newComment).catch((err) => {
    //       console.log(Fail to post comments: ${err});
    //     });
    //   };
    //   CommentBtn.addEventListener("click", submitComment);

    //   return () => {
    //     CommentBtn.removeEventListener("click", submitComment);
    //   };
    // }, []);

    useEffect(() => {
        axios
            .get(`/api/comments/bySheet/${sheetID}`)
            .then((res) => {
                setComments(res.data);
            })
            .catch((err) => {
                console.log(`Fail to fetch comments: ${err}`);
            });
    }, [isStale,sheetID]);

    const saveBody = e => {
        setBody(e.target.value);
    }

    const submitComment = () => {
        const newComment = {
            user: userID,
            datetime: Date.now(),
            cheatsheet: mongoose.Types.ObjectId(sheetID),
            body: body
        }

        axios.post("/api/comments", newComment)
            .then(
                res => {
                    setIsStale(!isStale);
                })
            .catch(err => console.log`(Error: ${err})`);
    }

    return (
        <div>
            <Form>
                <Form.TextArea id="CommentText" onChange={saveBody} />
                <Button
                    id="submitBtn"
                    content="Submit Comment"
                    labelPosition="left"
                    icon="edit"
                    primary
                    onClick={submitComment}
                />
            </Form>
            <Comment.Group>
                <Header as="h3" dividing>
                    Comments
        </Header>
                {isCommentPresent() ? (
                    comments.map((word, index) => <CommentCard key={index} comment={word} isStale = {isStale} setIsStale = {setIsStale}/>)
                ) : (
                        <div></div>
                    )}
            </Comment.Group>
        </div>
    );
}
export default CommentGallery;
