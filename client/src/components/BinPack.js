
import GrowingPacker from "../library/GrowingPacker"
import { ImagesContext, ConfigContext } from "../App"
import React, { useEffect } from 'react'

function BinPack() {
    useEffect(() => {
      var packer = new GrowingPacker();   
      var blocks = [
        { w: 100, h: 100 },
        { w: 100, h: 100 },
        { w:  80, h:  80 },
        { w:  80, h:  80 },
      ];
    
      blocks.sort(function(a,b) { return (b.h < a.h); }); // sort inputs for best results
      packer.fit(blocks);
    
      for(var n = 0 ; n < blocks.length ; n++) {
        var block = blocks[n];
        if (block.fit) {
          console.log(block.w,block.h,block.fit.x,block.fit.y)
        }
      }
    })

    return (<div> </div>);
}


export default BinPack;