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

    return function genThumbnail(options) {
      const {
        backgroundImage,
        canvas,
        text,
      } = options;

      function relativeOffset(offset) {
        return [
          offset[0] >= 0 ? offset[0] : backgroundImage.width  + offset[0],
          offset[1] >= 0 ? offset[1] : backgroundImage.height + offset[1],
        ];
      }

      const ctx = canvas.getContext('2d');
      ctx.drawImage(backgroundImage, 0, 0);

      for (const t of text) {
        const {
          text,
          font,
          verticalSpacing, // 100
          offset,  // 100, 120
          shadowOffset,  // 15
          strokeWidth,  // 15
          textWrapWidth,  // 1000
          color,
          textAlign,
        } = t;

        function makeHueFromStr(text) {
          let s = 0;
          for (let i = 0; i < text.length; ++i) {
            s += text.codePointAt(i);
          }
          return s / 100 % 1;
        }


        function drawParagraph(ctx, text, x, y, stroke) {
          const words = text.split(' ');
          let str = words.shift();
          do {
            const word = words.shift() || '';
            const newStr = `${str} ${word}`;
            const m = ctx.measureText(newStr);
            if (m.width > textWrapWidth || !word) {
              let cut = '';
              while (str.length) {
                const m = ctx.measureText(str);
                if (m.width <= textWrapWidth) {
                  break;
                }
                cut = `${str[str.length - 1]}${cut}`;
                str = str.substr(0, str.length - 1);
              }
              if (stroke) {
                ctx.strokeText(str, x, y);
              } else {
                ctx.fillText(str, x, y);
              }
              y += verticalSpacing;
              if (cut) {
                str = cut;
                words.push(word);
              } else {
                str = word;
              }
            } else {
              str = newStr;
            }
          } while (str);
        }

        function drawShadowedParagraph(ctx, text, x, y) {
          const color = ctx.fillStyle;
          ctx.strokeStyle = 'black';
          ctx.fillStyle = 'black';
          drawParagraph(ctx, text, x + shadowOffset[0], y + shadowOffset[1], true);
          drawParagraph(ctx, text, x + shadowOffset[0], y + shadowOffset[1], false);
          ctx.strokeStyle = 'white';
          ctx.lineWidth = strokeWidth;
          drawParagraph(ctx, text, x, y, true);
          ctx.fillStyle = color;
          drawParagraph(ctx, text, x, y);
        }
        
        ctx.font = font;
        ctx.fillStyle = color || hsl(makeHueFromStr(text), 1, 0.4);
        ctx.textAlign = textAlign;
        drawShadowedParagraph(ctx, text, ...relativeOffset(offset));
      }
    };
}));