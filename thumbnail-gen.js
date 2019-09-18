'use strict';

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.genThumbnail = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {

    function hsl(h, s, l) {
      return `hsl(${h * 360 | 0},${s * 100}%,${l * 100}%)`;
    }

    function drawParagraph(ctx, text, x, y, stroke) {
      const words = text.split(' ');
      let str = words.shift();
      do {
        const word = words.shift() || '';
        const newStr = `${str} ${word}`;
        const m = ctx.measureText(newStr);
        if (m.width > 1000 || !word) {
          if (stroke) {
            ctx.strokeText(str, x, y);
          } else {
            ctx.fillText(str, x, y);
          }
          y += 100;
          str = word;
        } else {
          str = newStr;
        }
      } while (str);
    }

    function drawShadowedParagraph(ctx, text, x, y) {
      const color = ctx.fillStyle;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'black';
      drawParagraph(ctx, text, x + 15, y + 15, true);
      drawParagraph(ctx, text, x + 15, y + 15);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 15;
      drawParagraph(ctx, text, x, y, true);
      ctx.fillStyle = color;
      drawParagraph(ctx, text, x, y);
    }

    return function genThumbnail(options) {
      const {backgroundImage, canvas, text} = options;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(backgroundImage, 0, 0);

      let s = 0;
      for (let i = 0; i < text.length; ++i) {
        s += text.codePointAt(i);
      }

      ctx.font = 'bold 100px sans-serif';
      ctx.fillStyle = hsl(s / 100 % 1, 1, 0.4);
      drawShadowedParagraph(ctx, text, 100, 120);
    };
}));