import React, { useContext, useEffect, useRef, useState } from 'react';
import { ImagesContext, ConfigContext } from "../App";
import { Button } from "reactstrap";

import Konva from 'konva';
import { Stage, Layer } from 'react-konva';

import axios from "axios";
import uuid from "uuid";

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
    const contextMenuRef = useRef(null);

    const [drawnImages, setDrawnImages] = useState([]);
    
    var width = configContext.config.canvasWidth;
    var height = configContext.config.canvasHeight;
    var scaleRatio = {x: CANVAS_VIEW_WIDTH/width, y: CANVAS_VIEW_HEIGHT/height};

    const drawLayers = () => {
        dragLayerRef.current.draw();
        stillLayerRef.current.draw();
    }

    // Set true resolution of canvases. Drag canvas is  at a lower res to preserve performance.
    // Opening context menu (ie. right-clicking) of canvas is disabled as "Save Picture As" only captures the drag layer
    useEffect(()=> {
        const stillSceneCanvas = stillLayerRef.current.getCanvas();
        const dragSceneCanvas = dragLayerRef.current.getCanvas();

        stillSceneCanvas.setPixelRatio(CANVAS_BASE_WIDTH / CANVAS_VIEW_WIDTH);
        dragSceneCanvas.setPixelRatio(1.0);
    }, []);

    // Shift the image to an appropriate layer before and after the drag event
    useEffect(() => {
        var draggedImage = null;

        const mouseDown = e => {
            if(e.evt.button === 0 && !draggedImage && e.target !== stageRef.current) {
                draggedImage = e.target;
                draggedImage.moveTo(dragLayerRef.current);                
                drawLayers();
            }
        }

        const mouseUp = e => {
            if(e.evt.button === 0 && draggedImage && e.target !== stageRef.current) {
                draggedImage.moveTo(stillLayerRef.current);
                draggedImage = null;
                drawLayers();
            }
        }

        const stage = stageRef.current;
        stage.on("mousedown", mouseDown);
        stage.on("mouseup", mouseUp);

        return () => {
            stage.off("mousedown", mouseDown);
            stage.off("mouseup", mouseUp);
        }
    }, [drawnImages])

    // Updates drawnImage when imagesContext updates
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
        drawLayers();

        return () => {
            drawnImages.forEach(image => image.remove());
        }
    }, [drawnImages])

    //Add downloading of cheatsheets to a button 
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

    //Upload cheatsheet to backend
    useEffect(() => {
        const uploadBtn = document.querySelector("#canvas-btn-upload");
        
        const saveToDb = url => {
            const newCheatsheet = {
                file: url,
                user: 0,
                school: "nus",
                module: "cs1101s",
                description: "nil",
                datetime: Date.now(),
                rating: 0,
                comments: []
            }

            axios.post("/api/cheatsheets", newCheatsheet)
                .catch(err => console.log((err)));
        }

        const upload = event => {
            const canvas = stillLayerRef.current.getCanvas()._canvas;
            
            canvas.toBlob(blob => {
                const formData = new FormData();
                formData.append("file", blob, `cheatsheet-${uuid.v4()}.png`);
                axios.post("/upload", formData)
                    .then(res => {
                        console.log(res.data.data.Location);
                        saveToDb(res.data.data.Location);
                    })
                    .catch(err => console.log(err));    
            })
        };

        uploadBtn.addEventListener("click", upload);
        return () => uploadBtn.removeEventListener("click", upload);
    }, [])

    useEffect(() => {
        var clickedImage = null;

        const zoomIn = e => {
            console.log("zoom into canvas");
        };

        const zoomOut = e => {
            console.log("zoom out of canvas");
        };

        const layerUp = e => {
            clickedImage.moveUp();
            drawLayers();
        };

        const layerDown = e => {
            clickedImage.moveDown();
            drawLayers();
        };

        const layerToFront = e => {
            clickedImage.moveToTop();
            drawLayers();
        }

        const layerToBack = e => {
            clickedImage.moveToBottom();
            drawLayers();
        }

        const imageMenu = e => {
            e.evt.preventDefault();
            if(e.target !== stageRef.current) {
                clickedImage = e.target;
                contextMenuRef.current.style.display = "initial";
                contextMenuRef.current.style.top = e.evt.pageY + 4 + "px";
                contextMenuRef.current.style.left = e.evt.pageX + 4 + "px";
            }
        }

        const closeImageMenu = e => {
            contextMenuRef.current.style.display = "none";
        }

        const forwardBtn = document.querySelector("#canvas-btn-forward");
        const backwardBtn = document.querySelector("#canvas-btn-backward");
        const toFrontBtn = document.querySelector("#canvas-btn-front");
        const toBackBtn = document.querySelector("#canvas-btn-back");

        forwardBtn.addEventListener("click", layerUp);
        backwardBtn.addEventListener("click", layerDown);
        toFrontBtn.addEventListener("click", layerToFront);
        toBackBtn.addEventListener("click", layerToBack);

        const stage = stageRef.current;
        stage.on("contextmenu", imageMenu);
        window.addEventListener("click", closeImageMenu);

        return () => {
            forwardBtn.removeEventListener("click", layerUp);
            backwardBtn.removeEventListener("click", layerDown);
            toFrontBtn.removeEventListener("click", layerToFront);
            toBackBtn.removeEventListener("click", layerToBack);

            stage.off("contextmenu", imageMenu);
            window.removeEventListener("click", closeImageMenu);
        }
    }, [drawnImages])

    return (
        <div>
            <div>
                <Stage ref={stageRef} width={scaleRatio.x * width} height={scaleRatio.y * height} scale={scaleRatio}>
                    <Layer ref={stillLayerRef}></Layer>
                    <Layer ref={dragLayerRef}></Layer>
                </Stage>
            </div>

            <div id="canvas-context-menu" ref={contextMenuRef}>
                <div>
                    <button id="canvas-btn-forward">Bring forward</button>
                    <button id="canvas-btn-backward">Bring backward</button>
                    <button id="canvas-btn-front">Bring to front</button>
                    <button id="canvas-btn-back">Bring to end</button>
                </div>
            </div>

            <Button id="canvas-btn-download" color="dark">Download</Button>
            <Button id="canvas-btn-upload" color="dark">Upload</Button>
        </div>
    )
}

export default ImageCanvas;
