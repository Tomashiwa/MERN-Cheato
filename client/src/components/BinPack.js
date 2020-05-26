
import GrowingPacker from "../library/GrowingPacker"
import Packer from "../library/Packer"
import { ImagesContext, ConfigContext } from "../App"
import React, { useEffect,useContext,props } from 'react'


function BinPack({setWidth,setHeight}) {
  const value = useContext(ConfigContext);
  const uploaded = useContext(ImagesContext);
  
  
  useEffect(()=> {
    run();
    //const Arrange = document.getElementById("input-btn-arr");
    //Arrange.addEventListener("click",run);
    //return () => Arrange.removeEventListener("click",run);
  }, [uploaded.images]);
  
  function run() {
      var packer = new GrowingPacker();   
      var blocks = uploaded.images;
  
      var num = 0;
      
      function counter() {
        num += 1;
        return num;
      }
      
      const blockade = blocks.map(img => {
        return {
            id: counter(),
            w: img.width, 
            h: img.height      
        };
      });
      
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
    
    msort(blockade,value.config.sortOrder);
    
    packer.fit(blockade);
    
    blockade.sort(function(a,b) { return a.id - b.id; });
    
    
    
    for(var i = 0;i < blockade.length;i++) {
      if (blockade[i].fit) {
      blocks[i].x = blockade[i].fit.x;
      blocks[i].y =blockade[i].fit.y;
      }
    }
  
  var sortByX = null;  
  var sortByY = null;
  
  function findLargestWidth(array) {
    sortByX = array.sort(function(a,b) { return (b.x + b.width) - (a.x + a.width) });
    if(sortByX.length !== 0) {
      return sortByX[0].x + sortByX[0].width;
    } else {
      return null;
    }
  }
  
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
  
  function findMax(width,height) {
    if(width > height) {
      x = width;
      y = width * (794/1122);
       } else if (height > width) {
      x = height * (1122/794);
      y = height;
    }
    return [x,y];
  }

  const canvasWidth = findMax(findLargestWidth(blocks),findLargestHeight(blocks))[0];
  const canvasLength = findMax(findLargestWidth(blocks),findLargestHeight(blocks))[1];


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
  
  filterDrawing(canvasWidth,canvasLength,blocks);
  */
  /* const final =blockade.map(block => {
      return {
          w: block.w, 
          h: block.h, 
          x: block.fit.x,
          y: block.fit.y
          
      };
    });

    //console.log(final[0].id,final[0].x,final[0].y);
    //onsole.log(final[1].id,final[1].x,final[1].y);
    //console.log(final[2].w,final[2].x,final[2].y);
    //console.log(final[3].w,final[3].x,final[3].y);
    
      for(var n = 0 ; n < blockade.length ; n++) {
        var blockades = blockade[n];
        if (blockades.fit) {
          //console.log(blockades.id,blockades.w,blockades.h,blockades.fit.x,blockades.fit.y)
        }
      }
   */
  }
  
  
  return (<div> </div>);
}

export default BinPack;