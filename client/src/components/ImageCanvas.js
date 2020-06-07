import React, { useContext, useEffect, useRef, useState } from 'react';
import { ImagesContext, ConfigContext } from "../App";
import { Button } from "reactstrap";

import Konva from 'konva';
import { Stage, Layer } from 'react-konva';

// import axios from "axios";
// import uuid from "uuid";

import "./css/ImageCanvas.css";
import { binPack } from '../library/BinPack';

export const CANVAS_VIEW_WIDTH = 1123;
export const CANVAS_VIEW_HEIGHT = 794;
export const CANVAS_BASE_WIDTH = 3508;
export const CANVAS_BASE_HEIGHT = 2480;

function ImageCanvas({setBlob}) {
    const imagesContext = useContext(ImagesContext);
    const configContext = useContext(ConfigContext);

    const stageRef = useRef(null);
    const dragLayerRef = useRef(null);
    const stillLayerRef = useRef(null);

    const contextMenuRef = useRef(null);
    const importMenuRef = useRef(null);
    const sortMenuRef = useRef(null);
    const viewMenuRef = useRef(null);

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
        // const downloadBtn = document.querySelector("#canvas-btn-download");
        // const download = () => {            
        //     const a = document.createElement("a");
        //     document.body.appendChild(a);
        //     a.href = stillLayerRef.current.getCanvas()._canvas.toDataURL("image/png", 1.0);
        //     a.download = "cheatsheet.png";
        //     a.click();
        //     document.body.removeChild(a);
        // };

        // downloadBtn.addEventListener("click", download);
        // return () => downloadBtn.removeEventListener("click",download);
    }, [])

    //Upload cheatsheet to backend
    useEffect(() => {
        // const uploadBtn = document.querySelector("#canvas-btn-upload");
        
        // const saveToDb = url => {
        //     const newCheatsheet = {
        //         file: url,
        //         user: 0,
        //         school: "nus",
        //         module: "cs1101s",
        //         description: "nil",
        //         datetime: Date.now(),
        //         rating: 0,
        //         comments: []
        //     }

        //     axios.post("/api/cheatsheets", newCheatsheet)
        //         .catch(err => console.log((err)));
        // }

        // const upload = event => {
        //     const canvas = stillLayerRef.current.getCanvas()._canvas;
            
        //     canvas.toBlob(blob => {
        //         const formData = new FormData();
        //         formData.append("file", blob, `cheatsheet-${uuid.v4()}.png`);
        //         axios.post("/upload", formData)
        //             .then(res => {
        //                 console.log(res.data.data.Location);
        //                 saveToDb(res.data.data.Location);
        //             })
        //             .catch(err => console.log(err));    
        //     })
        // };

        // uploadBtn.addEventListener("click", upload);
        // return () => uploadBtn.removeEventListener("click", upload);
    }, [])

    //Zooming and layer changing
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

    //Importing images
    useEffect(() => {
        const importMenuBtn = document.querySelector("#canvas-btn-menu-import");
        const importBtn = document.querySelector("#canvas-btn-import");
        const importArrangeBtn = document.querySelector("#canvas-btn-import-arrange");
        const input = document.querySelector("#canvas-input-import");
        const arrangedInput = document.querySelector("#canvas-input-import-arrange");

        const importMenu = e => {
            const rect = importMenuBtn.getBoundingClientRect();
            importMenuRef.current.style.display = "initial";
            importMenuRef.current.style.top = rect.top + rect.height + window.scrollY + "px";
            importMenuRef.current.style.left = rect.left + window.scrollX + "px";
        }

        const closeImportMenu = e => {
            if(importMenuRef.current.style.display === "initial" && e.target !== importMenuBtn) {
                importMenuRef.current.style.display = "none";
            }
        }

        const importFiles = e => {
            input.click();
        };

        const importArrangedFiles = e => {
            arrangedInput.click();
        }

        const loadImages = e => {
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
                const images = imgs.map(img => {
                    return {
                        element: img, 
                        width: img.width, 
                        height: img.height, 
                        x: 0, 
                        y: 0,
                        isRejected: false
                    };
                });
                imagesContext.setImages(images);
            }).catch(err => {
                console.log(`Error encountered while loading: ${err}`);
            })
        };

        const loadArrangedImages = e => {
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
                const images = imgs.map(img => {
                    return {
                        element: img, 
                        width: img.width, 
                        height: img.height, 
                        x: 0, 
                        y: 0,
                        isRejected: false
                    };
                });

                const sortedResult = binPack(images, configContext.config.sortOrder, CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT);
                imagesContext.setImages(sortedResult.images);
                configContext.setConfig({...configContext.config, ...{
                    canvasWidth: sortedResult.width,
                    canvasHeight: sortedResult.height
                }});
            }).catch(err => {
                console.log(`Error encountered while loading: ${err}`);
            })
        }

        window.addEventListener("click", closeImportMenu);
        importMenuBtn.addEventListener("click", importMenu);
        importBtn.addEventListener("click", importFiles);
        importArrangeBtn.addEventListener("click", importArrangedFiles);
        input.addEventListener("change", loadImages);
        arrangedInput.addEventListener("change", loadArrangedImages);

        return () => {
            window.removeEventListener("click", closeImportMenu);
            importMenuBtn.removeEventListener("click", importMenu);
            importBtn.removeEventListener("click", importFiles);
            importArrangeBtn.removeEventListener("click", importArrangedFiles);
            input.removeEventListener("change", loadImages);
            arrangedInput.removeEventListener("change", loadArrangedImages);
        };
    }, [imagesContext, configContext]);

    //Sorting images
    useEffect(() => {
        const sortMenuBtn = document.querySelector("#canvas-btn-menu-sort");
        const sortLargestSideBtn = document.querySelector("#canvas-btn-sort-largestside");
        const sortWidthBtn = document.querySelector("#canvas-btn-sort-width");
        const sortHeightBtn = document.querySelector("#canvas-btn-sort-height");
        const sortAreaBtn = document.querySelector("#canvas-btn-sort-area");

        const sortMenu = e => {
            const rect = sortMenuBtn.getBoundingClientRect();
            sortMenuRef.current.style.display = "initial";
            sortMenuRef.current.style.top = rect.top + rect.height + window.scrollY + "px";
            sortMenuRef.current.style.left = rect.left + window.scrollX + "px";
        }

        const closeSortMenu = e => {
            if(sortMenuRef.current.style.display === "initial" && e.target !== sortMenuBtn) {
                sortMenuRef.current.style.display = "none";
            }
        }

        const sortLargestSide = e => {
            const sortedResult = binPack(imagesContext.images, "largestSide", CANVAS_BASE_WIDTH, CANVAS_BASE_HEIGHT);
            imagesContext.setImages(sortedResult.images);
            configContext.setConfig({...configContext.config, ...{
                sortOrder: "largestSide"
            }});
        };

        const sortWidth = e => {
            const sortedResult = binPack(imagesContext.images, "width", CANVAS_BASE_WIDTH, CANVAS_VIEW_HEIGHT);
            imagesContext.setImages(sortedResult.images);
            configContext.setConfig({...configContext.config, ...{
                sortOrder: "width"
            }});
        }

        const sortHeight = e => {            
            const sortedResult = binPack(imagesContext.images, "height", CANVAS_BASE_WIDTH, CANVAS_VIEW_HEIGHT);
            imagesContext.setImages(sortedResult.images);
            configContext.setConfig({...configContext.config, ...{
                sortOrder: "height"
            }});
        }

        const sortArea = e => {
            const sortedResult = binPack(imagesContext.images, "area", CANVAS_BASE_WIDTH, CANVAS_VIEW_HEIGHT);
            imagesContext.setImages(sortedResult.images);
            configContext.setConfig({...configContext.config, ...{
                sortOrder: "area"
            }});
        }

        sortMenuBtn.addEventListener("click", sortMenu);
        window.addEventListener("click", closeSortMenu);
        sortLargestSideBtn.addEventListener("click", sortLargestSide);
        sortWidthBtn.addEventListener("click", sortWidth);
        sortHeightBtn.addEventListener("click", sortHeight);
        sortAreaBtn.addEventListener("click", sortArea);

        return () => {
            sortMenuBtn.removeEventListener("click", sortMenu);
            window.removeEventListener("click", closeSortMenu);
            sortLargestSideBtn.removeEventListener("click", sortLargestSide);
            sortWidthBtn.removeEventListener("click", sortWidth);
            sortHeightBtn.removeEventListener("click", sortHeight);
            sortAreaBtn.removeEventListener("click", sortArea);
        }
    }, [imagesContext, configContext])

    //Setting resolution
    useEffect(() => {
        const viewMenuBtn = document.querySelector("#canvas-btn-menu-view");
        const resetBtn = document.querySelector("#canvas-btn-view-reset");
        const resetPosBtn = document.querySelector("#canvas-btn-view-resetpos");
        const resetZoomBtn = document.querySelector("#canvas-btn-view-resetzoom");

        const viewMenu = e => {
            const rect = viewMenuBtn.getBoundingClientRect();
            viewMenuRef.current.style.display = "initial";
            viewMenuRef.current.style.top = rect.top + rect.height + window.scrollY + "px";
            viewMenuRef.current.style.left = rect.left + window.scrollX + "px";
        };

        const closeViewMenu = e => {
            if(viewMenuRef.current.style.display === "initial" && e.target !== viewMenuBtn) {
                viewMenuRef.current.style.display = "none";
            }
        };

        const reset = e => {
            zoomFactorRef.current = 1.0;
            stageRef.current.scale({x: zoomFactorRef.current * scaleRatio.x, y: zoomFactorRef.current * scaleRatio.y});
            stageRef.current.position({x: 0.0, y: 0.0});
            stageRef.current.batchDraw();
        }

        const resetPos = e => {
            stageRef.current.position({x: 0.0, y: 0.0});
            stageRef.current.batchDraw();
        }

        const resetZoom = e => {
            zoomFactorRef.current = 1.0;
            stageRef.current.scale({x: zoomFactorRef.current * scaleRatio.x, y: zoomFactorRef.current * scaleRatio.y});
            stageRef.current.batchDraw();
        }

        viewMenuBtn.addEventListener("click", viewMenu);
        window.addEventListener("click", closeViewMenu);
        resetBtn.addEventListener("click", reset);
        resetPosBtn.addEventListener("click", resetPos);
        resetZoomBtn.addEventListener("click", resetZoom);

        return () => {
            viewMenuBtn.removeEventListener("click", viewMenu);
            window.removeEventListener("click", closeViewMenu);
            resetBtn.removeEventListener("click", reset);
            resetPosBtn.removeEventListener("click", resetPos);
            resetZoomBtn.removeEventListener("click", resetZoom);
        }
    }, [scaleRatio])

    //Saving canvas blob data to be uploaded later
    useEffect(() => {
        const canvas = stillLayerRef.current.getCanvas()._canvas;
        return () => {
            if(drawnImages.length > 0) {
                console.log(`saving blob with ${drawnImages.length} images`);
                canvas.toBlob(blob => setBlob(blob));
            }
        };
    }, [drawnImages, setBlob])

    return (
        <div>
            <span id="canvas-toolbar">
                <Button id="canvas-btn-menu-import">Import</Button>
                <input id="canvas-input-import-arrange" type="file" accept="image/*" multiple style={{display: "none"}} />
                <input id="canvas-input-import" type="file" accept="image/*" multiple style={{display: "none"}} />
                <Button id="canvas-btn-menu-sort">Sort by</Button>
                <Button id="canvas-btn-menu-view">View</Button>
            </span>

            <div>
                <Stage ref={stageRef} width={scaleRatio.x * width} height={scaleRatio.y * height} scale={{x: zoomFactorRef.current * scaleRatio.x, y: zoomFactorRef.current * scaleRatio.y}} draggable>
                    <Layer ref={stillLayerRef}></Layer>
                    <Layer ref={dragLayerRef}></Layer>
                </Stage>
            </div>

            <div id="canvas-import-menu" ref={importMenuRef}>
                <div>
                    <button id="canvas-btn-import-arrange">Import files and arrange</button>
                    <button id="canvas-btn-import">Import files</button>
                </div>
            </div>

            <div id="canvas-sort-menu" ref={sortMenuRef}>
                <div>
                    <button id="canvas-btn-sort-largestside">Largest side</button>
                    <button id="canvas-btn-sort-width">Width</button>
                    <button id="canvas-btn-sort-height">Height</button>
                    <button id="canvas-btn-sort-area">Area</button>
                </div>
            </div>

            <div id="canvas-view-menu" ref={viewMenuRef}>
                <div>
                    <button id="canvas-btn-view-reset">Reset all</button>
                    <button id="canvas-btn-view-resetpos">Reset position</button>
                    <button id="canvas-btn-view-resetzoom">Reset zoom</button>
                </div>
            </div>

            <div id="canvas-context-menu" ref={contextMenuRef}>
                <div>
                    <button id="canvas-btn-forward">Bring forward</button>
                    <button id="canvas-btn-backward">Bring backward</button>
                    <button id="canvas-btn-front">Bring to front</button>
                    <button id="canvas-btn-back">Bring to back</button>
                </div>
            </div>

            {/* <Button id="canvas-btn-download" color="dark">Download</Button>
            <Button id="canvas-btn-upload" color="dark">Upload</Button> */}
        </div>
    )
}

export default ImageCanvas;
