import React, { useRef, useEffect } from 'react'
import { Stage, Layer, Rect } from 'react-konva'

import "./css/TestCanvas.css";

function TestCanvas() {
    const stageRef = useRef(null);
    const rectRef = useRef(null);

    useEffect(() => {
        console.log(stageRef.current);
        console.log(rectRef.current);
    })

    return (
        // <Stage ref={stageRef} width={500} height={250}>
        // <Stage ref={stageRef} width={0.5 * 2000} height={0.5 * 1250} scale={{x:0.5, y:0.5}}>
        <div style={{width: 1123, height:794}}>
            <Stage ref={stageRef} width={3508} height={2480} >
                <Layer>
                    <Rect 
                        ref={rectRef} 
                        x={0} 
                        y={0} 
                        width={100} 
                        height={100} 
                        fill="red" 
                        draggable 
                        onDragStart={e => console.log(e)}
                        onDragEnd={e => console.log(e)}/>
                </Layer>
            </Stage>
        </div>

    )
}

export default TestCanvas
