import React, { useContext, useEffect, useRef, useState } from 'react';
import { ImagesContext, ConfigContext } from "../App";
import { Button } from "reactstrap";

import Konva from 'konva';
import { Stage, Layer, Image } from 'react-konva';
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

    const [stillImages, setStillImages] = useState([]);
    const [draggedImage, setDraggedImage] = useState(null);
    
    var width = configContext.config.canvasWidth;
    var height = configContext.config.canvasHeight;
    var scaleRatio = {x: CANVAS_VIEW_WIDTH/width, y: CANVAS_VIEW_HEIGHT/height};

    const mouseDown = e => {
        if(e.target !== stageRef.current) {
            const img = e.target;
            img.moveTo(dragLayerRef.current);
            stillLayerRef.current.draw();
            dragLayerRef.current.draw();
            img.startDrag();
        }
    }

    const mouseUp = e => {
        // console.log("Released");
        // console.log(e.target);
    }

    useEffect(() => {
        stageRef.current.on("mousedown", mouseDown);
    }, [])

    useEffect(() => {
        const newStillImages = imagesContext.images.map(givenImage => {
            const img = new Konva.Image({
                image: givenImage.element,
                x: givenImage.x,
                y: givenImage.y
            });
            img.transformsEnabled("position");
            return img;
        });
        setStillImages(newStillImages);
        setDraggedImage(null);

        return () => {
            // stillImages.forEach(image => image.destroy());
            setStillImages([]);
            setDraggedImage(null);
        }
    }, [imagesContext.images])

    useEffect(() => {
        stillImages.forEach(image => {
            image.moveTo(stillLayerRef.current);
        });
        stillLayerRef.current.draw();

        if(draggedImage) {
            draggedImage.moveTo(dragLayerRef.current);    
        }
        dragLayerRef.current.draw();

        return () => {
            stillImages.forEach(image => image.remove());
            if(draggedImage) {
                draggedImage.remove();
            }
        }
    }, [stillImages, draggedImage])

    return (
        <Stage ref={stageRef} width={scaleRatio.x * width} height={scaleRatio.y * height} scale={scaleRatio}>
            <Layer ref={dragLayerRef}></Layer>
            <Layer ref={stillLayerRef}></Layer>
        </Stage>
    )
}

export default ImageCanvas;
