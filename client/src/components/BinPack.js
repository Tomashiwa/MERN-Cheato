
import GrowingPacker from "../library/GrowingPacker"
import { ImagesContext, ConfigContext } from "../App"
import React, { useEffect,useContext } from 'react'


function BinPack({setWidth,setHeight}) {
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
      for(var i = 0;i < blockade.length;i++) {
        if (blockade[i].fit) {
          blocks[i].x = blockade[i].fit.x;
          blocks[i].y =blockade[i].fit.y;
        }
      }
    
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
        if(width/1122 > height/794) {
          x = width;
          y = width * (794/1122);
        } else if (height/794 > width,1122) {
          x = height * (1122/794);
          y = height;
        }
        return [x,y];
      }
  
      const canvasWidth = findMax(findLargestWidth(blocks),findLargestHeight(blocks))[0];
      const canvasLength = findMax(findLargestWidth(blocks),findLargestHeight(blocks))[1];
  
      //set the canvas width and height
      function setCanvasSize(width,height) {
        if(width < 1122 && height < 794) {
          setWidth(1122);
          setHeight(794);
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
  }, [value.config, uploaded.images, setHeight, setWidth]);

  return (<div> </div>);
}
  

export default BinPack;