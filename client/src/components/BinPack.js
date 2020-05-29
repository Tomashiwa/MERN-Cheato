
import GrowingPacker from "../library/GrowingPacker"
import { ImagesContext, ConfigContext } from "../App"
import React, { useEffect,useContext } from 'react'


function BinPack({baseWidth, baseHeight, setWidth,setHeight}) {
  const value = useContext(ConfigContext);
  const uploaded = useContext(ImagesContext);  
  
  useEffect(()=> {
    function run() {
      var packer = new GrowingPacker();   
      var blocks = uploaded.images;
    
      //var for counter
      var num = 0;
      
      //counter for image
      function counter() {
          num += 1;
          return num;
        }
      //creating a blockade array of the images 
      const blockade = blocks.map(img => {
        return {
          id: counter(),
          w: img.width, 
          h: img.height      
          };
        });
      
      //sorting orders  
      function msort(array,type) {
        if (type === "largestSide") {
          array.sort(function(a,b) { return Math.max(b.w, b.h) - Math.max(a.w, a.h); });
        } else if (type === "area") {
          array.sort(function(a,b) { return (b.w * b.h) - (a.w * a.h); });
        } else if (type === "width") {
          array.sort(function(a,b) { return b.w - a.w; });
        } else if (type === "height") {
          array.sort(function(a,b) { return b.h - a.h; });
        }
      }
      
      //running the sort
      msort(blockade,value.config.sortOrder);
      
      //running the fit function
      packer.fit(blockade);
      
      //sort the blocks array based on id
      blockade.sort(function(a,b) { return a.id - b.id; });
      
      
      //set the x and y of images
      const updatedBlocks = new Array(blocks.length);
      for(var i = 0; i < blockade.length; i++) {
        if(blockade[i].fit) {
          updatedBlocks[i] = {
            element: blocks[i].element,
            width: blocks[i].width,
            height: blocks[i].height,
            x: blockade[i].fit.x,
            y: blockade[i].fit.y,
            isRejected: blocks[i].isRejected
          };
        } else {
          updatedBlocks[i] = {
            element: blocks[i].element,
            width: blocks[i].width,
            height: blocks[i].height,
            x: blocks[i].x,
            y: blocks[i].y,
            isRejected: blocks[i].isRejected
          };
        }
      }

      uploaded.images = updatedBlocks;
      // uploaded.setImages(updatedBlocks);

      // for(var i = 0;i < blockade.length;i++) {
      //   if (blockade[i].fit) {
      //     blocks[i].x = blockade[i].fit.x;
      //     blocks[i].y =blockade[i].fit.y;
      //   }
      // }
    
      var sortByX = null;  
      var sortByY = null;
      
      // find the width of canvas needed
      function findLargestWidth(array) {
        sortByX = array.sort(function(a,b) { return (b.x + b.width) - (a.x + a.width) });
        if(sortByX.length !== 0) {
          return sortByX[0].x + sortByX[0].width;
        } else {
          return null;
        }
      }
      
      //find the height of canvas needed
      function findLargestHeight(array) {
        sortByY = array.sort(function(a,b) { return (b.y + b.height) - (a.y + a.height) });
        if(sortByY.length !== 0) {
          return sortByY[0].y + sortByY[0].height;
        } else {
          return null;
        }
      }
     
      var x = 0;
      var y = 0;
      
      //calulate the height and width of the canvas based on A4 aspect ratio
      function findMax(width,height) {
        if(width/baseWidth > height/baseHeight) {
          x = width;
          y = width * (baseHeight/baseWidth);
        } else if (height/baseHeight > width/baseWidth) {
          x = height * (baseWidth/baseHeight);
          y = height;
        }
        return [x,y];
      }
  
      const canvasWidth = findMax(findLargestWidth(blocks),findLargestHeight(blocks))[0];
      const canvasLength = findMax(findLargestWidth(blocks),findLargestHeight(blocks))[1];
  
      //set the canvas width and height
      function setCanvasSize(width,height) {
        if(width < baseWidth && height < baseHeight) {
          setWidth(baseWidth);
          setHeight(baseHeight);
        } else {
          setWidth(width);
          setHeight(height);
        }
      }  
      
      setCanvasSize(canvasWidth,canvasLength);
    
    /* function filterDrawing(width,height,array) {
      for(var i = 0;i < array.length;i++) {
        if(array[i].x > width && array[i].y > height) {
          array[i].isRejected = true;
        }
      }
    }
    */
    } 
    run();
  }, [value.config, uploaded, uploaded.images, baseHeight, baseWidth,  setHeight, setWidth]);

  return (<div> </div>);
}
  

export default BinPack;