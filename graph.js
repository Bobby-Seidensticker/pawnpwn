/*globals namespace console window $*/
/*jslint white: true, browser: true, devel: true, onevar: false
  debug: true, undef: true nomen: true, regexp: true 
  newcap: true, immed: true, maxerr: 100, maxlen: 100*/

namespace.lookup('com.pageforest.graph').defineOnce(function (ns) {
    var dom = namespace.lookup('org.startpad.dom');
    var vector = namespace.lookup('org.startpad.vector');

    function GraphLines(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.size = dom.getSize(canvas);
        this.numPoints = 20;
        this.maxHeight = 10;
        this.pointMultiple = 10;
        this.heightMultiple = 5;

        this.margin = [0, 0];
        this.colors = ['#FFF', '#000'];
        this.axisColor = '#777';
        this.lineWidth = 3;
        this.lineJoin = 'round';
        this.lineCap = 'round';
    }

    GraphLines.methods({
        calcScale: function(lines) {
            var i, j;
            for (i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line.length > this.numPoints) {
                    this.numPoints = this.roundMult(line.length, this.pointMultiple);
                }
                for (j = 0; j < line.length; j++) {
                    // REVIEW: we assume all values are non-negative - make more general
                    if (line[j][1] + 2 > this.maxHeight) {
                        this.maxHeight = line[j][1] + 2;
                    }
                }
                this.maxHeight = this.roundMult(this.maxHeight, this.heightMultiple);
            }

            this.scale = [(this.size[0]) / this.numPoints,
                          (this.size[1]) / this.maxHeight];
        },

        // Convert [index, y-value] to canvas-relative coordinates
        ptScaled: function (pos) {
            var pt = vector.mult(this.scale, pos);
            vector.addTo(pt, this.margin);
            pt[1] = this.size[1] - pt[1];
            return pt;
        },

        moveTo: function(pos) {
            var pt = this.ptScaled(pos);
            this.ctx.moveTo(pt[0], pt[1]);
        },

        lineTo: function(pos) {
            var pt = this.ptScaled(pos);
            this.ctx.lineTo(pt[0], pt[1]);
        },

        draw: function(lines, scaleOnly, colors, lineCap, lineWidth) {
            if (scaleOnly) {
                this.calcScale(lines);
                this.ctx.clearRect(0, 0, this.size[0], this.size[1]);
                return;
            }
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.lineJoin = this.lineJoin;
            this.ctx.lineCap = this.lineCap;
            if (lineWidth) {
                this.ctx.lineWidth = lineWidth;
            }
            if (lineCap) {
                this.ctx.lineCap = lineCap;
            }

            //draw lines
            // REVIEW: Set clipping rect to not draw over axes.
            var i, j;
            for (i = 0; i < lines.length; i++) {
                var line = lines[i];

                this.ctx.beginPath();
                this.moveTo(line[0]);
                for (j = 1; j < line.length; j++) {
                    this.lineTo(line[j]);
                }
                if (colors) {
                    this.ctx.strokeStyle = colors[i];
                } else {
                    this.ctx.strokeStyle = this.colors[i];
                }
                this.ctx.stroke();
            }

            // Draw axes
            var offset = 0;
            this.ctx.beginPath();
            this.moveTo([offset, 0]);
            this.lineTo([offset, this.canvas.height - offset]);
            this.lineTo([this.canvas.width, this.canvas.height - offset]);
            this.ctx.strokeStyle = this.axisColor;
            this.ctx.stroke();
        },

        roundMult: function (x, factor) {
            return Math.ceil(x / factor) * factor;
        }
    });
    ns.extend({
        'GraphLines': GraphLines
    });
});