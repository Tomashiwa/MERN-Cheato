import React, { useState, useEffect, useRef, useContext } from 'react';
import { ImagesContext } from "../App";

import "./css/ImageCanvas.css";

function ImageCanvas() {
    const [width, setWidth] = useState(1122);
    const [height, setHeight] = useState(794);

    const imagesContext = useContext(ImagesContext);
    const canvasRef = useRef(null);

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.clearRect(0, 0, width, height);
        imagesContext.images.forEach(i => context.drawImage(i.element, i.x, i.y));
    }, [imagesContext.images, width, height])

    return (
        <div>
            <canvas className="canvas-img" ref={canvasRef} width={width} height={height}></canvas>        
        </div>
    )
}

export default ImageCanvas
