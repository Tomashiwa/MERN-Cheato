import React, { useState, useEffect, useRef, useContext } from 'react';
import { ImagesContext } from "../App";

import "./css/ImageCanvas.css";

function ImageCanvas() {
    const width = 1122;
    const height = 794;

    const [isDragging, setIsDragging] = useState(false);
    const [clickedImage, setClickedImage] = useState(null);
    const [clickOffset, setClickOffset] = useState({x: 0, y: 0});

    const imagesContext = useContext(ImagesContext);
    const canvasRef = useRef(null);

    // Drawing images when loading has completed
    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.clearRect(0, 0, width, height);
        imagesContext.images.forEach(i => context.drawImage(i.element, i.x, i.y));
    }, [imagesContext.images, width, height])

    //Dragging of images within canvas
    useEffect(() => {
        const handleMouseDown = e => {
            const canvasBound = canvasRef.current.getBoundingClientRect();
            const scaleFactor = canvasBound.width / canvasRef.current.width;
            const clickPos = {x: e.clientX - canvasBound.x, y: e.clientY - canvasBound.y};

            const clickedImages = imagesContext.images.slice().reverse().filter(image => {
                const scaledDimension = {width: image.width * scaleFactor, height: image.height * scaleFactor};
                return clickPos.x >= image.x && clickPos.x <= (image.x + scaledDimension.width) &&
                       clickPos.y >= image.y && clickPos.y <= (image.y + scaledDimension.height);
            })

            if(clickedImages.length > 0) {
                setIsDragging(true);
                setClickedImage(clickedImages[0]);
                setClickOffset({x: clickPos.x - clickedImages[0].x, y: clickPos.y - clickedImages[0].y});
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
                imagesContext.images.forEach(i => context.drawImage(i.element, i.x, i.y));
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
 
    return (
        <div>
            <canvas className="canvas-img" ref={canvasRef} width={width} height={height}></canvas>        
        </div>
    )
}

export default ImageCanvas;
