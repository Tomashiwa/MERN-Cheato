import GrowingPacker from "./GrowingPacker"

export const binPack = (images, sortOrder, baseWidth, baseHeight) => {
    var packer = new GrowingPacker();   
    var blocks = images;

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
    msort(blockade, sortOrder);

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

    const grownWidth = findMax(findLargestWidth(updatedBlocks),findLargestHeight(updatedBlocks))[0];
    const grownHeight = findMax(findLargestWidth(updatedBlocks),findLargestHeight(updatedBlocks))[1];   
    
    console.log("Packing images...");
    console.log(`grown dimension: ${grownWidth}x${grownHeight}`);
    console.log(`canvas dimension: ${baseWidth}x${baseHeight}`);

    var canvasWidth = grownWidth;
    var canvasHeight = grownHeight;
    if(grownWidth < baseWidth && grownHeight < baseHeight) {
      canvasWidth = baseWidth;
      canvasHeight = baseHeight;
    }   

    return {
      images: updatedBlocks,
      width: canvasWidth,
      height: canvasHeight
    }
}