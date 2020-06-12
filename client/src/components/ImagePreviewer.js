import React, { useEffect, useRef, useState } from 'react';
import { Button, Spinner } from "reactstrap";

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
    
    const [displayImage, setDisplayImage] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false);
    const isCtrlDownRef = useRef(false);

    const widthRef = useRef(PREVIEWER_BASE_WIDTH);
    const heightRef = useRef(PREVIEWER_BASE_HEIGHT);
    const scaleRatioRef = useRef({x: PREVIEWER_VIEW_WIDTH/widthRef.current, y: PREVIEWER_VIEW_HEIGHT/heightRef.current});

    // Set true resolution of canvases
    useEffect(()=> {
        const sceneCanvas = layerRef.current.getCanvas();
        sceneCanvas.setPixelRatio(PREVIEWER_BASE_WIDTH / PREVIEWER_VIEW_WIDTH);
    }, []);

    //Load display image to previewer
    useEffect(() => {
        var img = new Image();
        img.onload = () => {
            var image = new Konva.Image({
                x: 0,
                y: 0,
                image: img
            });
            image.transformsEnabled("none");

            layerRef.current.add(image);

            zoomFactorRef.current = 1.0;
            stageRef.current.scale({x: zoomFactorRef.current * scaleRatioRef.current.x, y: zoomFactorRef.current * scaleRatioRef.current.y});
            stageRef.current.position({x: 0.0, y: 0.0});
            layerRef.current.draw();

            setDisplayImage(image);
            setHasLoaded(true);
        }
        img.crossOrigin="anonymous";
        img.src = imageURL;
    }, [imageURL]);

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

                const oldScale = {x: zoomFactorRef.current * scaleRatioRef.current.x, y: zoomFactorRef.current * scaleRatioRef.current.y}
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
                    x: zoomFactorRef.current * scaleRatioRef.current.x, 
                    y: zoomFactorRef.current * scaleRatioRef.current.y
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

        const reset = e => {
            zoomFactorRef.current = 1.0;
            stageRef.current.scale({x: zoomFactorRef.current * scaleRatioRef.current.x, y: zoomFactorRef.current * scaleRatioRef.current.y});
            stageRef.current.position({x: 0.0, y: 0.0});
            layerRef.current.draw();
        }

        const download = e => {
            resetBtn.click();
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.href = layerRef.current.getCanvas()._canvas.toDataURL("image/png", 1.0);
            a.download = "cheatsheet.png";
            a.click();
            document.body.removeChild(a);
        }

        resetBtn.addEventListener("click", reset);
        downloadBtn.addEventListener("click", download);

        return () => {
            resetBtn.removeEventListener("click", reset);
            downloadBtn.removeEventListener("click", download);
        }
    }, [scaleRatioRef])

    return (
        <div id="previewer">

            <Stage ref={stageRef} width={PREVIEWER_VIEW_WIDTH} height={PREVIEWER_VIEW_HEIGHT} draggable>
                <Layer ref={layerRef}></Layer>
            </Stage>

            <span id="previewer-toolbar">
                <Button id="previewer-btn-reset">Reset view</Button>
                <Button id="previewer-btn-download">Download</Button>
            </span>

            { hasLoaded ? "" : <Spinner id="previewer-spinner" color="light"/> }
            {/* <Spinner id="previewer-spinner" color="light"/> */}
        </div>
    )
}

export default ImagePreviewer