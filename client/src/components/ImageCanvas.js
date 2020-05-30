import React, { useContext } from 'react';
import { ImagesContext, ConfigContext } from "../App";
import { Button } from "reactstrap";

import { Stage, Layer, Image } from 'react-konva';
import "./css/ImageCanvas.css";

export const CANVAS_BASE_WIDTH = 3508;
export const CANVAS_BASE_HEIGHT = 2480;

function ImageCanvas() {
    const imagesContext = useContext(ImagesContext);
    const configContext = useContext(ConfigContext);

    var width = configContext.config.canvasWidth;
    var height = configContext.config.canvasHeight;

    const dragEnd = e => {
        const dragImg = e.target.attrs.image;
        const dragToPos = e.target._lastPos;
        const newImages = imagesContext.images.map(image => {
            return image.element === dragImg
                ? {...image, ...{x: dragToPos.x, y: dragToPos.y}}
                : {...image}
        });
        imagesContext.setImages(newImages);
    };

    return (
        <div>
            <Stage width={width} height={height}>
                <Layer>
                    {
                        imagesContext.images.map((image, index) => {
                            return <Image 
                                key={index}
                                image={image.element}
                                transformsEnabled="position"
                                x={image.x}
                                y={image.y}
                                draggable
                                onDragEnd={dragEnd} />
                        })
                    }
                </Layer>
            </Stage>
            
            <Button id="canvas-btn-download" color="dark">Download</Button>
        </div>
    )
}

export default ImageCanvas;
