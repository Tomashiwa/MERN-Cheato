class GrowingPacker {
    fit(blocks) {
        var n, node, block, len = blocks.length;
        var w = len > 0 ? blocks[0].w : 0;
        var h = len > 0 ? blocks[0].h : 0;
        this.root = { x: 0, y: 0, w: w, h: h };
        for (n = 0; n < len ; n++) {
          block = blocks[n];
          node = this.findNode(this.root, block.w, block.h)
          if (node)
            block.fit = this.splitNode(node, block.w, block.h);
          else
            block.fit = this.growNode(block.w, block.h);
        }
    }

    findNode(root, w, h) {
        if (root.used)
          return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
        else if ((w <= root.w) && (h <= root.h))
          return root;
        else
          return null;
    }

    splitNode(node, w, h) {
        node.used = true;
        node.down  = { x: node.x,     y: node.y + h, w: node.w,     h: node.h - h };
        node.right = { x: node.x + w, y: node.y,     w: node.w - w, h: h          };
        return node;
    }

    growNode(w, h) {
        var canGrowDown  = (w <= this.root.w);
        var canGrowRight = (h <= this.root.h);
    
        var shouldGrowRight = canGrowRight && (this.root.h >= (this.root.w + w)); 
        var shouldGrowDown  = canGrowDown  && (this.root.w >= (this.root.h + h)); 
    
        if (shouldGrowRight)
          return this.growRight(w, h);
        else if (shouldGrowDown)
          return this.growDown(w, h);
        else if (canGrowRight)
         return this.growRight(w, h);
        else if (canGrowDown)
          return this.growDown(w, h);
        else
          return null;
    }

    growRight(w, h) {
        this.root = {
            used: true,
            x: 0,
            y: 0,
            w: this.root.w + w,
            h: this.root.h,
            down: this.root,
            right: { x: this.root.w, y: 0, w: w, h: this.root.h }
          };
          var node = this.findNode(this.root, w, h);
          if (node)
            return this.splitNode(node, w, h);
          else
            return null;
    }

    growDown(w, h) {
        this.root = {
            used: true,
            x: 0,
            y: 0,
            w: this.root.w,
            h: this.root.h + h,
            down:  { x: 0, y: this.root.h, w: this.root.w, h: h },
            right: this.root
          };
          var node = this.findNode(this.root, w, h);
          if (node)
            return this.splitNode(node, w, h);
          else
            return null;
    }
}

export default GrowingPacker;