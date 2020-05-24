
import GrowingPacker from "../library/GrowingPacker"
import Packer from "../library/Packer"
import { ImagesContext, ConfigContext } from "../App"
import React, { useEffect,useContext,componentDidMount } from 'react'


function BinPack() {
  const value = useContext(ConfigContext);
  const uploaded = useContext(ImagesContext);
  
  useEffect(()=> {
    const Arrange = document.getElementById("input-btn-arr");
    Arrange.addEventListener("click",run);
    return () => Arrange.removeEventListener("click",run);
});
  
  
  function run()  {
      var packer = new GrowingPacker();   
      var blocks = uploaded.images;
      console.log(uploaded)
      console.log(uploaded.images)
      //console.log(uploaded.images[0].height)
      var num = 0;
      
      function counter() {
        num += 1;
        return num;
      }
      
      const blockade =blocks.map(img => {
        return {
            id: counter(),
            w: img.width, 
            h: img.height      
        };
      });
      console.log(blocks[0])
      console.log(blockade[0])

      function msort(array,type) {
        if (type == "largestSide") {
          array.sort(function(a,b) { return Math.max(b.w, b.h) - Math.max(a.w, a.h); });
        } else if (type == "area") {
          array.sort(function(a,b) { return (b.w * b.h) - (a.w * a.h); });
        } else if (type == "width") {
          array.sort(function(a,b) { return b.w - a.w; });
        } else if (type == "height") {
          array.sort(function(a,b) { return b.h - a.h; });
        }
      }
    
    console.log(value.config.sortOrder)
    msort(blockade,value.config.sortOrder);
    
    packer.fit(blockade);
    
    blockade.sort(function(a,b) { return a.id - b.id; });
    
    for(var i = 0;i < uploaded.images.length;i++) {
      blocks[i].x = blockade[i].fit.x;
      blocks[i].y =blockade[i].fit.y;
    }
   
   
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