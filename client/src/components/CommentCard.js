import React, { useEffect,useRef } from 'react'
import CreatableSelect from "react-select/creatable";

import "./css/CommentCard.css"
import Axios from 'axios';

function CommentCard({form, setForm}) {
  useEffect(() => {
    const commentInput = document.querySelector("pb-cmnt-textarea");
    const setComment = e => setForm({...form, ...{comment: e.target.value}});
    
    commentInput.addEventListener("change", setComment);

    return () => commentInput.removeEventListener("change", setComment);
  }, [form, setForm]);

  useEffect(() => {
    const commentBtn = document.querySelector("btn btn-primary float-xs-right");
    const sendComment = () => {
      axios.post("/api/comment")
    }

    commentBtn.addEventListener("change", sendComment);

    return () => commentInput.removeEventListener("click", sendComment);
  }, [form, setForm]);


  

  

  return <div class="container pb-cmnt-container">
          <div class="row">
            <div class="col-md-6 offset-md-3">
              <div class="card card-info">
                <div class="card-block">
                  <textarea placeholder="Write your comment here!" class="pb-cmnt-textarea"></textarea>
                    <form class="form-inline">
                      <button class="btn btn-primary float-xs-right" type="button">Share</button>
                    </form>
                </div>
              </div>
            </div>
          </div>
        </div>
}

export default CommentCard;

