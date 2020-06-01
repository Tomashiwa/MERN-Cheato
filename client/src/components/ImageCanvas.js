import React, { useContext, useEffect, useRef, useState } from 'react';
import { ImagesContext, ConfigContext } from "../App";
import { Button } from "reactstrap";

import Konva from 'konva';
import { Stage, Layer } from 'react-konva';
import "./css/ImageCanvas.css";

export const CANVAS_VIEW_WIDTH = 1123;
export const CANVAS_VIEW_HEIGHT = 794;
export const CANVAS_BASE_WIDTH = 3508;
export const CANVAS_BASE_HEIGHT = 2480;

function ImageCanvas() {
    const imagesContext = useContext(ImagesContext);
    const configContext = useContext(ConfigContext);

    const stageRef = useRef(null);
    const dragLayerRef = useRef(null);
    const stillLayerRef = useRef(null);

    const [drawnImages, setDrawnImages] = useState([]);
    
    var width = configContext.config.canvasWidth;
    var height = configContext.config.canvasHeight;
    var scaleRatio = {x: CANVAS_VIEW_WIDTH/width, y: CANVAS_VIEW_HEIGHT/height};

    // Set true resolution of canvases. Drag canvas is  at a lower res to preserve performance.
    // Opening context menu (ie. right-clicking) of canvas is disabled as "Save Picture As" only captures the drag layer
    useEffect(()=> {
        const stillSceneCanvas = stillLayerRef.current.getCanvas();
        const dragSceneCanvas = dragLayerRef.current.getCanvas();

        stillSceneCanvas.setPixelRatio(CANVAS_BASE_WIDTH / CANVAS_VIEW_WIDTH);
        dragSceneCanvas.setPixelRatio(1.0);
        
        dragSceneCanvas._canvas.addEventListener("contextmenu", e => {e.preventDefault()});
    }, []);

    // Shift the image to an appropriate layer before and after the drag event
    useEffect(() => {
        var draggedImage = null;

        const mouseDown = e => {
            if(!draggedImage && e.target !== stageRef.current) {
                const img = e.target;
                img.moveTo(dragLayerRef.current);
                stillLayerRef.current.draw();
                dragLayerRef.current.draw();
                draggedImage = img;
            }
        }

        const mouseUp = e => {
            if(draggedImage && e.target !== stageRef.current) {
                draggedImage.moveTo(stillLayerRef.current);
                stillLayerRef.current.draw();
                dragLayerRef.current.draw();
                draggedImage = null;
            }
        }

        stageRef.current.on("mousedown", mouseDown);
        stageRef.current.on("mouseup", mouseUp);
    }, [])

    // Updates stillImages when imagesContext updates
    useEffect(() => {
        const newDrawnImages = imagesContext.images.map(givenImage => {
            const img = new Konva.Image({
                image: givenImage.element,
                x: givenImage.x,
                y: givenImage.y,
                draggable: true
            });
            img.transformsEnabled("position");
            return img;
        });

        setDrawnImages(newDrawnImages);

        return () => {
            setDrawnImages([]);
        }
    }, [imagesContext.images])

    // Draw images within Still layer when stillImages updates
    useEffect(() => {
        drawnImages.forEach(image => {
            image.moveTo(stillLayerRef.current);
        });
        stillLayerRef.current.draw();

        return () => {
            drawnImages.forEach(image => image.remove());
        }
    }, [drawnImages])

    //Download a scaled down image of the canvas 
    useEffect(() => {
        const downloadBtn = document.querySelector("#canvas-btn-download");
        const download = () => {            
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.href = stillLayerRef.current.getCanvas()._canvas.toDataURL("image/png", 1.0);
            a.download = "cheatsheet.png";
            a.click();
            document.body.removeChild(a);
        };

        downloadBtn.addEventListener("click", download);
        return () => downloadBtn.removeEventListener("click",download);
    }, [])

    return (
        <div>
            <Stage ref={stageRef} width={scaleRatio.x * width} height={scaleRatio.y * height} scale={scaleRatio}>
                <Layer ref={stillLayerRef}></Layer>
                <Layer ref={dragLayerRef}></Layer>
            </Stage>
            <Button id="canvas-btn-download" color="dark">Download</Button>
        </div>
    )
}

export default ImageCanvas;
