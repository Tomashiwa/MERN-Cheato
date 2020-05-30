import React, { useContext, useEffect, useReducer } from 'react';
import { ImagesContext, ConfigContext } from "../App"
import { Form, FormGroup, Label, Input, Button } from "reactstrap";

import { binPack } from "../library/BinPack"

import "./css/InputForm.css"

function InputForm() {
    const imagesContext = useContext(ImagesContext);
    const configContext = useContext(ConfigContext);

    const initialState = {
        loadedImages: [],
        arrangement: "generated",
        sortOrder: "largestSide",
        resolution: "a4"
    };

    const reducer = (state, action) => {
        switch(action.attribute) {
            case "loadedImages":
                return {...state, ...{loadedImages: action.value}};
            case "arrangement":
                return {...state, ...{arrangement: action.value}};
            case "sortOrder":
                return {...state, ...{sortOrder: action.value}};
            case "resolution":
                return {...state, ...{resolution: action.value}};
            case "reset":
                return initialState;
            default:
                return state;        
        }
    }

    const [state, dispatch] = useReducer(reducer, initialState);

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
            dispatch({attribute:"loadedImages", value: images})
        }).catch(err => {
            console.log(`Error encountered while loading: ${err}`);
        })
    }

    useEffect(() => {
        const filesInput = document.querySelector("#input-files");
        const arrangeRadios = document.querySelectorAll("input[name='input-arr']");
        const sortRadios = document.querySelectorAll("input[name='input-sort']");
        const resRadios = document.querySelectorAll("input[name='input-res']");
    
        const dispatchArrange = e => dispatch({attribute: "arrangement", value: e.target.value});
        const dispatchSort = e => dispatch({attribute: "sortOrder", value: e.target.value});
        const dispatchRes = e => dispatch({attribute: "resolution", value: e.target.value});

        filesInput.addEventListener("change", loadImages);
        arrangeRadios.forEach(r => r.addEventListener("click", dispatchArrange));
        sortRadios.forEach(r => r.addEventListener("click", dispatchSort));
        resRadios.forEach(r => r.addEventListener("click", dispatchRes));

        return () => {
            filesInput.removeEventListener("change", loadImages);
            arrangeRadios.forEach(r => r.removeEventListener("click", dispatchArrange));
            sortRadios.forEach(r => r.removeEventListener("click", dispatchSort));
            resRadios.forEach(r => r.removeEventListener("click", dispatchRes));
        }
    }, [])

    const submitImages = () => {
        const sortedResult = binPack(state.loadedImages, state.sortOrder, configContext.config.canvasWidth, configContext.config.canvasHeight);
        imagesContext.setImages(sortedResult.images);
        configContext.setConfig({...configContext.config, ...{
            arrangement: state.arrangement,
            sortOrder: state.sortOrder,
            resolution: state.resolution,
            canvasWidth: sortedResult.width,
            canvasHeight: sortedResult.height
        }});
    }

    return (
        <div id="input-form">
            <p>Generate your cheatsheet!</p>

            <Form inline>
                <Label>
                    Images
                    <Input id="input-files" type="file" accept="image/*" multiple />
                </Label>
            </Form><br/>

            <Form inline>
                <Label>Arrangement</Label>
                <FormGroup check>
                    <Label check>
                        <Input type="radio" name="input-arr" value="generated" defaultChecked/>
                        Generated
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label>
                        <Input type="radio" name="input-arr" value="freeForm" disabled/>
                        Free-form
                    </Label>
                </FormGroup>
            </Form><br/>

            <Form inline>
                <Label>Sort by</Label>
                <FormGroup check>
                    <Label check>
                        <Input type="radio" name="input-sort" value="largestSide" defaultChecked/>
                        Largest side
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input type="radio" name="input-sort" value="width"/>
                        Width
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input type="radio" name="input-sort" value="height"/>
                        Height
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input type="radio" name="input-sort" value="area"/>
                        Area
                    </Label>
                </FormGroup>
            </Form><br/>

            <Form inline>
                <Label>Resolution</Label>
                <FormGroup check>
                    <Label check>
                        <Input type="radio" name="input-res" value="a4" defaultChecked/>
                        A4 landscape
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input type="radio" name="input-res" value="custom" disabled/>
                        Custom
                    </Label>
                </FormGroup>
            </Form><br/>

            <Button id="input-btn-arr" color="dark" onClick={submitImages} >Arrange</Button>
        </div>
    )
}

export default InputForm;