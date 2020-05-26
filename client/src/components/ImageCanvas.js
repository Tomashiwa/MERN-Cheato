import React, { useState, useEffect, useRef, useContext } from 'react';
import BinPack from "../components/BinPack"
import { ImagesContext } from "../App";
import { Button } from "reactstrap";

import "./css/ImageCanvas.css";

function ImageCanvas() {
    const [width, setWidth] = useState(1122);
    const [height, setHeight] = useState(794);
    const [isDragging, setIsDragging] = useState(false);
    const [clickedImage, setClickedImage] = useState(null);
    const [clickOffset, setClickOffset] = useState({x: 0, y: 0});

    const imagesContext = useContext(ImagesContext);
    const canvasRef = useRef(null);

    // Drawing images when loading has completed
    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.clearRect(0, 0, width, height);
        imagesContext.images
            .filter(i => !i.isRejected)
            .forEach(i => context.drawImage(i.element, i.x, i.y));
    }, [imagesContext.images, width, height])

    //Dragging of images within canvas
    useEffect(() => {
        const handleMouseDown = e => {
            const canvasBound = canvasRef.current.getBoundingClientRect();
            const scaleFactor = canvasBound.width / canvasRef.current.width;
            const clickPos = {x: e.clientX - canvasBound.x, y: e.clientY - canvasBound.y};

            const clickedImages = imagesContext.images.slice().reverse().filter(image => {
                return clickPos.x >= (scaleFactor * image.x) && clickPos.x <= (scaleFactor * (image.x + image.width)) &&
                       clickPos.y >= (scaleFactor * image.y) && clickPos.y <= (scaleFactor * (image.y + image.height));
            })

            if(clickedImages.length > 0) {
                setIsDragging(true);
                setClickedImage(clickedImages[0]);
                setClickOffset({x: clickPos.x - (scaleFactor * clickedImages[0].x), y: clickPos.y - (scaleFactor * clickedImages[0].y)});
            }
        }

        const handleMouseUp = e => {
            setIsDragging(false);
            setClickedImage(null);
            setClickOffset({x:0, y:0});
        }

        const handleMouseMove = e => {
            if(isDragging) {
                const canvasBound = canvasRef.current.getBoundingClientRect();
                const scaleFactor = canvasRef.current.width / canvasBound.width;
                const clickPos = {x: e.clientX - canvasBound.x, y: e.clientY - canvasBound.y};
                clickedImage.x = scaleFactor * (clickPos.x - clickOffset.x);
                clickedImage.y = scaleFactor * (clickPos.y - clickOffset.y);

                const context = canvasRef.current.getContext("2d");
                context.clearRect(0, 0, width, height);
                imagesContext.images
                    .filter(i => !i.isRejected)
                    .forEach(i => context.drawImage(i.element, i.x, i.y));
            }
        }

        const currentCanvas = canvasRef.current;
        currentCanvas.addEventListener("mousedown", handleMouseDown);
        currentCanvas.addEventListener("mousemove", handleMouseMove);        
        currentCanvas.addEventListener("mouseup", handleMouseUp);
        currentCanvas.addEventListener("mouseout", handleMouseUp);
        
        return () => {
            currentCanvas.removeEventListener("mousedown", handleMouseDown);
            currentCanvas.removeEventListener("mousemove", handleMouseMove);        
            currentCanvas.removeEventListener("mouseup", handleMouseUp);
            currentCanvas.removeEventListener("mouseout", handleMouseUp);
        }
    }, [imagesContext.images, isDragging, clickedImage, width, height, clickOffset])

    //Download a scaled down image of the canvas 
    useEffect(() => {
        const downloadBtn = document.querySelector("#canvas-btn-download");
        const download = () => {
            console.log("Download");

            const resizedCanvas = document.createElement("canvas");
            const resizedContext = resizedCanvas.getContext("2d");
            resizedCanvas.width = "1122";
            resizedCanvas.height = "794";

            resizedContext.drawImage(canvasRef.current, 0, 0, 1122, 794);
            
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.href = resizedCanvas.toDataURL();
            a.download = "cheatsheet.jpg";
            a.click();
            document.body.removeChild(a);
        };

        downloadBtn.addEventListener("click", download);
        return () => downloadBtn.removeEventListener("click",download);
    }, [])

    return (
        <div>
            <BinPack setWidth={setWidth} setHeight={setHeight}/>
            <canvas className="canvas-img" ref={canvasRef} width={width} height={height} />
            <Button id="canvas-btn-download" color="dark">Download</Button>
        </div>
    )
}

export default ImageCanvas;
