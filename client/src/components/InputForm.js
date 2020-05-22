import React, { useContext } from 'react';
import { ImagesContext } from "../App"

import { Input, Button } from "reactstrap";

function InputForm() {
    const imagesContext = useContext(ImagesContext);
    
    const loadPreview = images => {
        if(document.querySelector("#ul-preview")) {
            const prevList = document.querySelector("#ul-preview");
            prevList.parentNode.removeChild(prevList);
        }
        
        if(images.length > 0) {
            const ul = document.createElement("ul");
            ul.id = "ul-preview";
            document.querySelector("#input-container").appendChild(ul);
            
            images.forEach(i => {
                const li = document.createElement("li");
                ul.appendChild(li);
                li.appendChild(i);
                const info = document.createElement("div");
                info.innerHTML = `${i.name}: ${i.width} x ${i.height}`;
                li.appendChild(info);
            })
        }
    }

    const submitImages = e => {
        const files = Array.from(e.target.files);

        Promise.all(files.map(file => {
            return (new Promise((resolve, reject) => {
                const img = document.createElement("img");
                img.src = URL.createObjectURL(file);
                img.addEventListener("load", e => {
                    URL.revokeObjectURL(file);
                    resolve(img);
                });
                img.addEventListener("error", reject);
            }));
        }))
        .then(imgs => {
            console.log(`All img elements loaded`);
            // loadPreview(imgs);            
            const images = imgs.map(img => {
                return {
                    element: img, 
                    width: img.width, 
                    height: img.height, 
                    x: 0, 
                    y: 0
                };
            });
            imagesContext.setImages(images);
        }).catch(err => {
            console.log(`Error encountered while loading: ${err}`);
        })
    }

    return (
        <div id="input-container">
            <Input id="input-file" type="file" accept="image/*" multiple onChange={submitImages}/>
            {/* <Button color="dark" onClick={() => imagesContext.images.forEach(i => console.log(`${i.width}, ${i.height}`))} >Arrange</Button> */}
        </div>
    )
}

export default InputForm;