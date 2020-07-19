import React, { useEffect, useRef, useState } from 'react';

import Button from 'reactstrap/lib/Button';
import Spinner from 'reactstrap/lib/Spinner';

import Konva from "konva";
import { Stage, Layer } from "react-konva";

import "./css/ImagePreviewer.css";

export const PREVIEWER_VIEW_WIDTH = 1123;
export const PREVIEWER_VIEW_HEIGHT = 794;
export const PREVIEWER_BASE_WIDTH = 3508;
export const PREVIEWER_BASE_HEIGHT = 2480;

function ImagePreviewer({imageURL}) {
    const stageRef = useRef(null);
    const layerRef = useRef(null);
    const zoomFactorRef = useRef(1.0);
    const resizeFactorRef = useRef(1.0);
    
    const [displayImage, setDisplayImage] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const isCtrlDownRef = useRef(false);

    const widthRef = useRef(PREVIEWER_BASE_WIDTH);
    const heightRef = useRef(PREVIEWER_BASE_HEIGHT);
    const scaleRatioRef = useRef({x: PREVIEWER_VIEW_WIDTH/widthRef.current, y: PREVIEWER_VIEW_HEIGHT/heightRef.current});

    // Set dimension and resolution of canvases
    useEffect(()=> {
        const previewer = document.querySelector("#previewer");

        if(previewer) {
            resizeFactorRef.current = previewer.clientWidth / PREVIEWER_VIEW_WIDTH;
    
            stageRef.current.setWidth(previewer.clientWidth);
            stageRef.current.setHeight(PREVIEWER_VIEW_HEIGHT * (previewer.clientWidth / PREVIEWER_VIEW_WIDTH));
            stageRef.current.scale({
                x: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.x, 
                y: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.y
            });
            stageRef.current.batchDraw();
    
            const sceneCanvas = layerRef.current.getCanvas();
            sceneCanvas.setPixelRatio(PREVIEWER_BASE_WIDTH / PREVIEWER_VIEW_WIDTH);
        }
    }, []);

    // Change stage's dimension on window resize event 
    useEffect(() => {
        const resize = e => {
            const previewer = document.querySelector("#previewer");
            resizeFactorRef.current = previewer.clientWidth / PREVIEWER_VIEW_WIDTH;
            
            stageRef.current.setWidth(previewer.clientWidth);
            stageRef.current.setHeight(PREVIEWER_VIEW_HEIGHT * resizeFactorRef.current);
            stageRef.current.scale({
                x: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.x, 
                y: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.y
            });
            stageRef.current.batchDraw();
        }

        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    })

    //Load image onto previewer and adjust previewer's scaling to fit the image's dimension
    useEffect(() => {
        if(displayImage !== null) {
            var img = new Image();
            img.onload = () => {
                displayImage.setImage(img);

                const width = displayImage.attrs.image.width;
                const height = displayImage.attrs.image.height;

                if(height > width) {
                    heightRef.current = displayImage.attrs.image.height;
                    widthRef.current = displayImage.attrs.image.height * (PREVIEWER_BASE_WIDTH / PREVIEWER_BASE_HEIGHT);
    
                } else {
                    widthRef.current = displayImage.attrs.image.width;
                    heightRef.current = displayImage.attrs.image.width * (PREVIEWER_BASE_HEIGHT / PREVIEWER_BASE_WIDTH);
                }

                scaleRatioRef.current = {x: PREVIEWER_VIEW_WIDTH/widthRef.current, y: PREVIEWER_VIEW_HEIGHT/heightRef.current};

                zoomFactorRef.current = 1.0;
                stageRef.current.scale({
                    x: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.x, 
                    y: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.y
                });
                stageRef.current.position({x: 0.0, y: 0.0});
                layerRef.current.draw();
            }

            img.crossOrigin = "anonymous";
            img.src = imageURL;// + "?noCache=" + Math.random().toString();
        } else {
            Konva.Image.fromURL(imageURL, image => {
            // Konva.Image.fromURL(imageURL + "?noCache=" + Math.random().toString(), image => {
                image.transformsEnabled("none");
                image.setAbsolutePosition({x: 0, y: 0});
                
                layerRef.current.add(image);

                const width = image.attrs.image.width;
                const height = image.attrs.image.height;

                if(height > width) {
                    heightRef.current = image.attrs.image.height;
                    widthRef.current = image.attrs.image.height * (PREVIEWER_BASE_WIDTH / PREVIEWER_BASE_HEIGHT);
    
                } else {
                    widthRef.current = image.attrs.image.width;
                    heightRef.current = image.attrs.image.width * (PREVIEWER_BASE_HEIGHT / PREVIEWER_BASE_WIDTH);
                }

                scaleRatioRef.current = {x: PREVIEWER_VIEW_WIDTH/widthRef.current, y: PREVIEWER_VIEW_HEIGHT/heightRef.current};

                zoomFactorRef.current = 1.0;
                stageRef.current.scale({
                    x: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.x, 
                    y: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.y
                });
                stageRef.current.position({x: 0.0, y: 0.0});
                layerRef.current.draw();
    
                setHasLoaded(true);
                setDisplayImage(image);
            });
        }
    }, [imageURL, displayImage]);

    //Zooming
    useEffect(() => {
        const ctrlDown = e => {
            if(e.ctrlKey) {
                isCtrlDownRef.current = true;
            }
        }

        const ctrlUp = e => {
            if(!e.ctrlKey) {
                isCtrlDownRef.current = false;
            }
        }

        const zoom = e => {
            const scrollValue = e.evt.deltaY;

            if(isCtrlDownRef.current && scrollValue !== 0) {
                e.evt.preventDefault();

                const oldScale = {
                    x: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.x, 
                    y: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.y
                };
                const pointer = stageRef.current.getPointerPosition();

                const pointerRelativePos = {
                    x: (pointer.x - stageRef.current.x()) / oldScale.x,
                    y: (pointer.y - stageRef.current.y()) / oldScale.y
                }

                const zoomIncrement = 0.25;

                if(scrollValue < 0) {
                    zoomFactorRef.current += zoomIncrement;
                } else if(scrollValue > 0) {
                    zoomFactorRef.current = zoomFactorRef.current > 1.0 
                        ? zoomFactorRef.current - zoomIncrement
                        : zoomFactorRef.current;
                }

                const newScale = {
                    x: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.x, 
                    y: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.y
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

        const stage = stageRef.current;
        window.addEventListener("keydown", ctrlDown);
        window.addEventListener("keyup", ctrlUp);
        stage.on("wheel", zoom);

        return () => {
            window.removeEventListener("keydown", ctrlDown);
            window.removeEventListener("keyup", ctrlUp);
            stage.off("wheel", zoom);
        }
    }, [isCtrlDownRef, scaleRatioRef])

    //Disable context menu
    useEffect(() => {
        const preventContextMenu = e => e.evt.preventDefault();
        const stage = stageRef.current;
        stage.on("contextmenu", preventContextMenu);
        return () => stage.off("contextmenu", preventContextMenu);
    }, [])

    //Reset zoom and position
    useEffect(() => {
        const resetBtn = document.querySelector("#previewer-btn-reset");
        const downloadBtn = document.querySelector("#previewer-btn-download");
        const previewer = document.querySelector("#previewer");

        const reset = e => {
            zoomFactorRef.current = 1.0;
            resizeFactorRef.current = previewer.clientWidth / PREVIEWER_VIEW_WIDTH;
            stageRef.current.setWidth(previewer.clientWidth);
            stageRef.current.setHeight(PREVIEWER_VIEW_HEIGHT * (previewer.clientWidth / PREVIEWER_VIEW_WIDTH));
            stageRef.current.scale({
                x: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.x, 
                y: zoomFactorRef.current * resizeFactorRef.current * scaleRatioRef.current.y
            });
            stageRef.current.position({x: 0.0, y: 0.0});
            layerRef.current.draw();
        }

        const download = e => {
            fetch(imageURL)
            // fetch(imageURL + "?noCache=" + Math.random().toString())
                .then(response => {
                    return response.blob();
                })
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "Cheatsheet.png";
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                })
                .catch(err => {
                    console.log(err);
                })
        }

        if(downloadBtn && resetBtn) {
            resetBtn.addEventListener("click", reset);
            downloadBtn.addEventListener("click", download);

        }

        return () => {
            resetBtn.removeEventListener("click", reset);
            downloadBtn.removeEventListener("click", download);
        }
    }, [scaleRatioRef, imageURL])

    return (
        <div id="previewer">
            <Stage ref={stageRef} draggable>
                <Layer ref={layerRef}></Layer>
            </Stage>

            <span id="previewer-toolbar">
                <Button id="previewer-btn-reset">Reset view</Button>
                <Button id="previewer-btn-download">Download</Button>
            </span>

            { hasLoaded ? "" : <Spinner id="previewer-spinner" color="light"/> }
        </div>
    )
}

export default ImagePreviewer
