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
    const [isCtrlDown, setIsCtrlDown] = useState(false);

    var width = configContext.config.canvasWidth;
    var height = configContext.config.canvasHeight;
    var scaleRatio = {x: CANVAS_VIEW_WIDTH/width, y: CANVAS_VIEW_HEIGHT/height};

    const zoomFactorRef = useRef(1.0);

    const drawLayers = () => {
        dragLayerRef.current.draw();
        stillLayerRef.current.draw();
    }

    // Set true resolution of canvases. Drag canvas is  at a lower res to preserve performance.
    useEffect(()=> {
        const stillSceneCanvas = stillLayerRef.current.getCanvas();
        const dragSceneCanvas = dragLayerRef.current.getCanvas();

        stillSceneCanvas.setPixelRatio(CANVAS_BASE_WIDTH / CANVAS_VIEW_WIDTH);
        dragSceneCanvas.setPixelRatio(1.0);
    }, []);

    // Shift the image to an appropriate layer before and after the drag event
    useEffect(() => {
        var draggedImage = null;

        const dragImageStart = e => {
            if(e.evt.button === 0 && !draggedImage && e.target !== stageRef.current) {
                draggedImage = e.target;
                draggedImage.moveTo(dragLayerRef.current);                
                drawLayers();
            }
        }

        const dragImageEnd = e => {
            if(e.evt.button === 0 && draggedImage && e.target !== stageRef.current) {
                draggedImage.moveTo(stillLayerRef.current);
                draggedImage = null;
                drawLayers();
            }
        }

        const stage = stageRef.current;
        stage.on("mousedown", dragImageStart);
        stage.on("mouseup", dragImageEnd);

        return () => {
            stage.off("mousedown", dragImageStart);
            stage.off("mouseup", dragImageEnd);
        }
    }, [drawnImages])

    // Updates drawnImage when imagesContext updates
    useEffect(() => {
        const newDrawnImages = imagesContext.images.map(givenImage => {
            const img = new Konva.Image({
                image: givenImage.element,
                x: givenImage.x,
                y: givenImage.y,
                draggable: true,
            });
            img.transformsEnabled("position");
            img.cache();
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

        const ctrlDown = e => {
            if(e.ctrlKey) {
                setIsCtrlDown(true);
            }
        }

        const ctrlUp = e => {
            if(!e.ctrlKey) {
                setIsCtrlDown(false);
            }
        }

        const zoom = e => {
            const scrollValue = e.evt.deltaY;

            if(isCtrlDown && scrollValue !== 0) {
                e.evt.preventDefault();

                const oldScale = {x: zoomFactorRef.current * scaleRatio.x, y: zoomFactorRef.current * scaleRatio.y}
                const pointer = stageRef.current.getPointerPosition();

                const pointerRelativePos = {
                    x: (pointer.x - stageRef.current.x()) / oldScale.x,
                    y: (pointer.y - stageRef.current.y()) / oldScale.y
                }

                const zoomIncrement = 0.1;

                if(scrollValue < 0) {
                    zoomFactorRef.current += zoomIncrement;
                } else if(scrollValue > 0) {
                    zoomFactorRef.current = zoomFactorRef.current > 1.0 
                        ? zoomFactorRef.current - zoomIncrement
                        : zoomFactorRef.current;
                }

                const newScale = {
                    x: zoomFactorRef.current * scaleRatio.x, 
                    y: zoomFactorRef.current * scaleRatio.y
                };
                const newPos = {
                    x: pointer.x - pointerRelativePos.x * newScale.x,
                    y: pointer.y - pointerRelativePos.y * newScale.y
                };

                stageRef.current.scale(newScale);
                stageRef.current.position(newPos);
                stageRef.current.batchDraw();
            }
        }

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
        stage.on("wheel", zoom);
        window.addEventListener("keydown", ctrlDown);
        window.addEventListener("keyup", ctrlUp);
        window.addEventListener("click", closeImageMenu);

        return () => {
            forwardBtn.removeEventListener("click", layerUp);
            backwardBtn.removeEventListener("click", layerDown);
            toFrontBtn.removeEventListener("click", layerToFront);
            toBackBtn.removeEventListener("click", layerToBack);

            stage.off("contextmenu", imageMenu);
            stage.off("wheel", zoom);
            window.removeEventListener("keydown", ctrlDown);
            window.removeEventListener("keyup", ctrlUp);
            window.removeEventListener("click", closeImageMenu);
        }
    }, [drawnImages, isCtrlDown, scaleRatio])

    return (
        <div>
            <div>
                {/* <Stage ref={stageRef} width={scaleRatio.x * width} height={scaleRatio.y * height} scale={ scaleRatio}> */}
                <Stage ref={stageRef} width={scaleRatio.x * width} height={scaleRatio.y * height} scale={{x: zoomFactorRef.current * scaleRatio.x, y: zoomFactorRef.current * scaleRatio.y}} draggable>
                    <Layer ref={stillLayerRef}></Layer>
                    <Layer ref={dragLayerRef}></Layer>
                </Stage>
            </div>

            <div id="canvas-context-menu" ref={contextMenuRef}>
                <div>
                    <button id="canvas-btn-forward">Bring forward</button>
                    <button id="canvas-btn-backward">Bring backward</button>
                    <button id="canvas-btn-front">Bring to front</button>
                    <button id="canvas-btn-back">Bring to back</button>
                </div>
            </div>

            <Button id="canvas-btn-download" color="dark">Download</Button>
            <Button id="canvas-btn-upload" color="dark">Upload</Button>
        </div>
    )
}

export default ImageCanvas;
