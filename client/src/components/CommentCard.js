import React, { useContext, useState, useEffect } from "react";

import userIcon from "../icons/icon-user.svg";
import { Comment, Form, Button } from "semantic-ui-react";
import "./css/CommentCard.css";
import axios from "axios";

import UserContext from "../context/UserContext";

function CommentCard({ isStale, setIsStale, comment }) {
  const { userData } = useContext(UserContext);

  const moment = require("moment");
  const date = comment.datetime;
  const time = moment(date);
  const commentID = comment._id;

  const [isVisible, setIsVisible] = useState(false)
  const [body, setBody] = useState("");


  const isMatchingUser = (userData.isLoaded && userData.user && userData.user.name === comment.user)


  function isCommentPresent() {
    return { comment } !== null;
  }

  const deleteComment = () => {
    axios
      .delete(`/api/comments/${commentID}`)
      .then((e) => setIsStale(!isStale))
      .catch((err) => {
        console.log(`Fail to delete: ${err}`);
      });
  };

  const showTextbox = () => {
    setIsVisible(true);
  }

  useEffect(() => {
    if (isVisible) {
      document.querySelector("#OriginalText").value = comment.body;
    }
  }, [isVisible,comment.body])

  const saveBody = (e) => {
    setBody(e.target.value);
  };


  const editComment = () => {
    const editedComment = body
    axios.put(`/api/comments/${comment._id}`, { body: editedComment })
      .then((res) => {
        setIsVisible(false)
        setIsStale(!isStale)
      })
      .catch(err => {
        console.log(`Fail to edit comment: ${err}`);
      });

  };



  return (
    <div>
      {isCommentPresent() ? (!isVisible ?
        <Comment>
          <Comment.Avatar src={userIcon}></Comment.Avatar>
          <Comment.Content>
            <Comment.Metadata>
              <p>{comment.user}</p>
              <div>{time.format("DD/MM/YY HH:mm")}</div>
            </Comment.Metadata>
            <Comment.Text>{comment.body}</Comment.Text>
            {isMatchingUser ?
              <Comment.Actions>
                <Comment.Action onClick={showTextbox}>Edit</Comment.Action>
                <Comment.Action onClick={deleteComment}>Delete</Comment.Action>
              </Comment.Actions>
              : <div> </div>
            }
          </Comment.Content>
        </Comment>
        : <div><Form>
          <Form.TextArea id="OriginalText" onChange={saveBody} />
          <Button
            id="submitBtn"
            content="Edit Comment"
            labelPosition="left"
            icon="edit"
            primary
            onClick={editComment}
          />
        </Form></div>)
        : (<div></div>
        )}
    </div>
  );
}

export default CommentCard;
