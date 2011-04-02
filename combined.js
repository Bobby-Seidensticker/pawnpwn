
namespace.lookup('com.pageforest.aboutpawnpwn').defineOnce(function (ns) {
    
    function onResize() {
        if (window.innerWidth > 700) {
            $('body').addClass('wide');
        } else {
            $('body').removeClass('wide');
        }
    }
    
    function onReady() {
        var game, str;
        if (location.hash) {
            str = '<p>To start playing, send them an <a href="mailto:?subject=Let\'s%20Play%20Pawn%20Pwn&body=http://pawnpwn.pageforest.com/%23' + game + 
                '">email</a>.  Or get them this link another way:</p>';
            $('#linkh').attr('href', location.origin + '/' + location.hash);
            $('#linkh').html(location.origin + '/' + location.hash);
        } else {
            str = '<p>After you log in and create a game, this sentence will be' +
                ' a handy mailto link as well as the address itself, in case you\'re in fullscreen mode.  This is what the link to your game will look like: </p>';
            $('#linkh').attr('href', location.origin + '#yourusername-1234/');
        }
        $('#linkp').html(str);
        $(window).bind('resize', function(){setTimeout(function(){ onResize(); }, 0)});
        onResize();
    }
    
    ns.extend({
        'onReady': onReady
    });
});
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
        this.axisColor = '#9e9e9e';
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
            var offset = 2;
            this.ctx.fillStyle = this.axisColor;
            this.ctx.fillRect(0, 0, offset, this.canvas.height);
            this.ctx.fillRect(0, this.canvas.height - offset, this.canvas.width, offset);
        },

        roundMult: function (x, factor) {
            return Math.ceil(x / factor) * factor;
        }
    });
    ns.extend({
        'GraphLines': GraphLines
    });
});/**
 * 
 * Find more about the scrolling function at
 * http://cubiq.org/iscroll
 *
 * Copyright (c) 2010 Matteo Spinelli, http://cubiq.org/
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 * 
 * Version 3.7.1 - Last updated: 2010.10.08
 * 
 */

(function(){
function iScroll (el, options) {
	var that = this, i;
	that.element = typeof el == 'object' ? el : document.getElementById(el);
	that.wrapper = that.element.parentNode;

	that.element.style.webkitTransitionProperty = '-webkit-transform';
	that.element.style.webkitTransitionTimingFunction = 'cubic-bezier(0,0,0.25,1)';
	that.element.style.webkitTransitionDuration = '0';
	that.element.style.webkitTransform = translateOpen + '0,0' + translateClose;

	// Default options
	that.options = {
		bounce: has3d,
		momentum: has3d,
		checkDOMChanges: true,
		topOnDOMChanges: false,
		hScrollbar: has3d,
		vScrollbar: has3d,
		fadeScrollbar: isIthing || !isTouch,
		shrinkScrollbar: isIthing || !isTouch,
		desktopCompatibility: false,
		overflow: 'auto',
		snap: false,
		bounceLock: false,
		scrollbarColor: 'rgba(0,0,0,0.5)',
		onScrollEnd: function () {}
	};
	
	// User defined options
	if (typeof options == 'object') {
		for (i in options) {
			that.options[i] = options[i];
		}
	}

	if (that.options.desktopCompatibility) {
		that.options.overflow = 'hidden';
	}
	
	that.onScrollEnd = that.options.onScrollEnd;
	delete that.options.onScrollEnd;
	
	that.wrapper.style.overflow = that.options.overflow;
	
	that.refresh();

	window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', that, false);

	if (isTouch || that.options.desktopCompatibility) {
		that.element.addEventListener(START_EVENT, that, false);
		that.element.addEventListener(MOVE_EVENT, that, false);
		that.element.addEventListener(END_EVENT, that, false);
	}
	
	if (that.options.checkDOMChanges) {
		that.element.addEventListener('DOMSubtreeModified', that, false);
	}
}

iScroll.prototype = {
	x: 0,
	y: 0,
	enabled: true,

	handleEvent: function (e) {
		var that = this;
		
		switch (e.type) {
			case START_EVENT:
				that.touchStart(e);
				break;
			case MOVE_EVENT:
				that.touchMove(e);
				break;
			case END_EVENT:
				that.touchEnd(e);
				break;
			case 'webkitTransitionEnd':
				that.transitionEnd();
				break;
			case 'orientationchange':
			case 'resize':
				that.refresh();
				break;
			case 'DOMSubtreeModified':
				that.onDOMModified(e);
				break;
		}
	},
	
	onDOMModified: function (e) {
		var that = this;

		// (Hopefully) execute onDOMModified only once
		if (e.target.parentNode != that.element) {
			return;
		}

		setTimeout(function () { that.refresh(); }, 0);

		if (that.options.topOnDOMChanges && (that.x!=0 || that.y!=0)) {
			that.scrollTo(0,0,'0');
		}
	},

	refresh: function () {
		var that = this,
			resetX = that.x, resetY = that.y,
			snap;
		
		that.scrollWidth = that.wrapper.clientWidth;
		that.scrollHeight = that.wrapper.clientHeight;
		that.scrollerWidth = that.element.offsetWidth;
		that.scrollerHeight = that.element.offsetHeight;
		that.maxScrollX = that.scrollWidth - that.scrollerWidth;
		that.maxScrollY = that.scrollHeight - that.scrollerHeight;
		that.directionX = 0;
		that.directionY = 0;

		if (that.scrollX) {
			if (that.maxScrollX >= 0) {
				resetX = 0;
			} else if (that.x < that.maxScrollX) {
				resetX = that.maxScrollX;
			}
		}
		if (that.scrollY) {
			if (that.maxScrollY >= 0) {
				resetY = 0;
			} else if (that.y < that.maxScrollY) {
				resetY = that.maxScrollY;
			}
		}

		// Snap
		if (that.options.snap) {
			that.maxPageX = -Math.floor(that.maxScrollX/that.scrollWidth);
			that.maxPageY = -Math.floor(that.maxScrollY/that.scrollHeight);

			snap = that.snap(resetX, resetY);
			resetX = snap.x;
			resetY = snap.y;
		}

		if (resetX!=that.x || resetY!=that.y) {
			that.setTransitionTime('0');
			that.setPosition(resetX, resetY, true);
		}
		
		that.scrollX = that.scrollerWidth > that.scrollWidth;
		that.scrollY = !that.options.bounceLock && !that.scrollX || that.scrollerHeight > that.scrollHeight;

		// Update horizontal scrollbar
		if (that.options.hScrollbar && that.scrollX) {
			that.scrollBarX = that.scrollBarX || new scrollbar('horizontal', that.wrapper, that.options.fadeScrollbar, that.options.shrinkScrollbar, that.options.scrollbarColor);
			that.scrollBarX.init(that.scrollWidth, that.scrollerWidth);
		} else if (that.scrollBarX) {
			that.scrollBarX = that.scrollBarX.remove();
		}

		// Update vertical scrollbar
		if (that.options.vScrollbar && that.scrollY && that.scrollerHeight > that.scrollHeight) {
			that.scrollBarY = that.scrollBarY || new scrollbar('vertical', that.wrapper, that.options.fadeScrollbar, that.options.shrinkScrollbar, that.options.scrollbarColor);
			that.scrollBarY.init(that.scrollHeight, that.scrollerHeight);
		} else if (that.scrollBarY) {
			that.scrollBarY = that.scrollBarY.remove();
		}
	},

	setPosition: function (x, y, hideScrollBars) {
		var that = this;
		
		that.x = x;
		that.y = y;

		that.element.style.webkitTransform = translateOpen + that.x + 'px,' + that.y + 'px' + translateClose;

		// Move the scrollbars
		if (!hideScrollBars) {
			if (that.scrollBarX) {
				that.scrollBarX.setPosition(that.x);
			}
			if (that.scrollBarY) {
				that.scrollBarY.setPosition(that.y);
			}
		}
	},
	
	setTransitionTime: function(time) {
		var that = this;
		
		time = time || '0';
		that.element.style.webkitTransitionDuration = time;
		
		if (that.scrollBarX) {
			that.scrollBarX.bar.style.webkitTransitionDuration = time;
			that.scrollBarX.wrapper.style.webkitTransitionDuration = has3d && that.options.fadeScrollbar ? '300ms' : '0';
		}
		if (that.scrollBarY) {
			that.scrollBarY.bar.style.webkitTransitionDuration = time;
			that.scrollBarY.wrapper.style.webkitTransitionDuration = has3d && that.options.fadeScrollbar ? '300ms' : '0';
		}
	},
		
	touchStart: function(e) {
		var that = this,
			matrix;
		
		if (!that.enabled) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		
		that.scrolling = true;		// This is probably not needed, but may be useful if iScroll is used in conjuction with other frameworks

		that.moved = false;
		that.distX = 0;
		that.distY = 0;

		that.setTransitionTime('0');

		// Check if the scroller is really where it should be
		if (that.options.momentum || that.options.snap) {
			matrix = new WebKitCSSMatrix(window.getComputedStyle(that.element).webkitTransform);
			if (matrix.e != that.x || matrix.f != that.y) {
				document.removeEventListener('webkitTransitionEnd', that, false);
				that.setPosition(matrix.e, matrix.f);
				that.moved = true;
			}
		}

		that.touchStartX = isTouch ? e.changedTouches[0].pageX : e.pageX;
		that.scrollStartX = that.x;

		that.touchStartY = isTouch ? e.changedTouches[0].pageY : e.pageY;
		that.scrollStartY = that.y;

		that.scrollStartTime = e.timeStamp;

		that.directionX = 0;
		that.directionY = 0;
	},
	
	touchMove: function(e) {
		if (!this.scrolling) {
			return;
		}

		var that = this,
			pageX = isTouch ? e.changedTouches[0].pageX : e.pageX,
			pageY = isTouch ? e.changedTouches[0].pageY : e.pageY,
			leftDelta = that.scrollX ? pageX - that.touchStartX : 0,
			topDelta = that.scrollY ? pageY - that.touchStartY : 0,
			newX = that.x + leftDelta,
			newY = that.y + topDelta;

		//e.preventDefault();
		e.stopPropagation();	// Stopping propagation just saves some cpu cycles (I presume)

		that.touchStartX = pageX;
		that.touchStartY = pageY;

		// Slow down if outside of the boundaries
		if (newX >= 0 || newX < that.maxScrollX) {
			newX = that.options.bounce ? Math.round(that.x + leftDelta / 3) : (newX >= 0 || that.maxScrollX>=0) ? 0 : that.maxScrollX;
		}
		if (newY >= 0 || newY < that.maxScrollY) { 
			newY = that.options.bounce ? Math.round(that.y + topDelta / 3) : (newY >= 0 || that.maxScrollY>=0) ? 0 : that.maxScrollY;
		}

		if (that.distX + that.distY > 5) {			// 5 pixels threshold

			// Lock scroll direction
			if (that.distX-3 > that.distY) {
				newY = that.y;
				topDelta = 0;
			} else if (that.distY-3 > that.distX) {
				newX = that.x;
				leftDelta = 0;
			}

			that.setPosition(newX, newY);
			that.moved = true;
			that.directionX = leftDelta > 0 ? -1 : 1;
			that.directionY = topDelta > 0 ? -1 : 1;
		} else {
			that.distX+= Math.abs(leftDelta);
			that.distY+= Math.abs(topDelta);
//			that.dist+= Math.abs(leftDelta) + Math.abs(topDelta);
		}
	},
	
	touchEnd: function(e) {
		if (!this.scrolling) {
			return;
		}

		var that = this,
			time = e.timeStamp - that.scrollStartTime,
			point = isTouch ? e.changedTouches[0] : e,
			target, ev,
			momentumX, momentumY,
			newDuration = 0,
			newPositionX = that.x, newPositionY = that.y,
			snap;

		that.scrolling = false;

		if (!that.moved) {
			that.resetPosition();

			if (isTouch) {
				// Find the last touched element
				target = point.target;
				while (target.nodeType != 1) {
					target = target.parentNode;
				}

				// Create the fake event
				ev = document.createEvent('MouseEvents');
				ev.initMouseEvent('click', true, true, e.view, 1,
					point.screenX, point.screenY, point.clientX, point.clientY,
					e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
					0, null);
				ev._fake = true;
				target.dispatchEvent(ev);
			}

			return;
		}

		if (!that.options.snap && time > 250) {			// Prevent slingshot effect
			that.resetPosition();
			return;
		}

		if (that.options.momentum) {
			momentumX = that.scrollX === true
				? that.momentum(that.x - that.scrollStartX,
								time,
								that.options.bounce ? -that.x + that.scrollWidth/5 : -that.x,
								that.options.bounce ? that.x + that.scrollerWidth - that.scrollWidth + that.scrollWidth/5 : that.x + that.scrollerWidth - that.scrollWidth)
				: { dist: 0, time: 0 };

			momentumY = that.scrollY === true
				? that.momentum(that.y - that.scrollStartY,
								time,
								that.options.bounce ? -that.y + that.scrollHeight/5 : -that.y,
								that.options.bounce ? (that.maxScrollY < 0 ? that.y + that.scrollerHeight - that.scrollHeight : 0) + that.scrollHeight/5 : that.y + that.scrollerHeight - that.scrollHeight)
				: { dist: 0, time: 0 };

			newDuration = Math.max(Math.max(momentumX.time, momentumY.time), 1);		// The minimum animation length must be 1ms
			newPositionX = that.x + momentumX.dist;
			newPositionY = that.y + momentumY.dist;
		}

		if (that.options.snap) {
			snap = that.snap(newPositionX, newPositionY);
			newPositionX = snap.x;
			newPositionY = snap.y;
			newDuration = Math.max(snap.time, newDuration);
		}

		that.scrollTo(newPositionX, newPositionY, newDuration + 'ms');
	},

	transitionEnd: function () {
		var that = this;
		document.removeEventListener('webkitTransitionEnd', that, false);
		that.resetPosition();
	},

	resetPosition: function () {
		var that = this,
			resetX = that.x,
		 	resetY = that.y;

		if (that.x >= 0) {
			resetX = 0;
		} else if (that.x < that.maxScrollX) {
			resetX = that.maxScrollX;
		}

		if (that.y >= 0 || that.maxScrollY > 0) {
			resetY = 0;
		} else if (that.y < that.maxScrollY) {
			resetY = that.maxScrollY;
		}
		
		if (resetX != that.x || resetY != that.y) {
			that.scrollTo(resetX, resetY);
		} else {
			if (that.moved) {
				that.onScrollEnd();		// Execute custom code on scroll end
				that.moved = false;
			}

			// Hide the scrollbars
			if (that.scrollBarX) {
				that.scrollBarX.hide();
			}
			if (that.scrollBarY) {
				that.scrollBarY.hide();
			}
		}
	},
	
	snap: function (x, y) {
		var that = this, time;

		if (that.directionX > 0) {
			x = Math.floor(x/that.scrollWidth);
		} else if (that.directionX < 0) {
			x = Math.ceil(x/that.scrollWidth);
		} else {
			x = Math.round(x/that.scrollWidth);
		}
		that.pageX = -x;
		x = x * that.scrollWidth;
		if (x > 0) {
			x = that.pageX = 0;
		} else if (x < that.maxScrollX) {
			that.pageX = that.maxPageX;
			x = that.maxScrollX;
		}

		if (that.directionY > 0) {
			y = Math.floor(y/that.scrollHeight);
		} else if (that.directionY < 0) {
			y = Math.ceil(y/that.scrollHeight);
		} else {
			y = Math.round(y/that.scrollHeight);
		}
		that.pageY = -y;
		y = y * that.scrollHeight;
		if (y > 0) {
			y = that.pageY = 0;
		} else if (y < that.maxScrollY) {
			that.pageY = that.maxPageY;
			y = that.maxScrollY;
		}

		// Snap with constant speed (proportional duration)
		time = Math.round(Math.max(
				Math.abs(that.x - x) / that.scrollWidth * 500,
				Math.abs(that.y - y) / that.scrollHeight * 500
			));
			
		return { x: x, y: y, time: time };
	},

	scrollTo: function (destX, destY, runtime) {
		var that = this;

		if (that.x == destX && that.y == destY) {
			that.resetPosition();
			return;
		}

		that.moved = true;
		that.setTransitionTime(runtime || '350ms');
		that.setPosition(destX, destY);

		if (runtime==='0' || runtime=='0s' || runtime=='0ms') {
			that.resetPosition();
		} else {
			document.addEventListener('webkitTransitionEnd', that, false);	// At the end of the transition check if we are still inside of the boundaries
		}
	},
	
	scrollToPage: function (pageX, pageY, runtime) {
		var that = this, snap;

		if (!that.options.snap) {
			that.pageX = -Math.round(that.x / that.scrollWidth);
			that.pageY = -Math.round(that.y / that.scrollHeight);
		}

		if (pageX == 'next') {
			pageX = ++that.pageX;
		} else if (pageX == 'prev') {
			pageX = --that.pageX;
		}

		if (pageY == 'next') {
			pageY = ++that.pageY;
		} else if (pageY == 'prev') {
			pageY = --that.pageY;
		}

		pageX = -pageX*that.scrollWidth;
		pageY = -pageY*that.scrollHeight;

		snap = that.snap(pageX, pageY);
		pageX = snap.x;
		pageY = snap.y;

		that.scrollTo(pageX, pageY, runtime || '500ms');
	},

	scrollToElement: function (el, runtime) {
		el = typeof el == 'object' ? el : this.element.querySelector(el);

		if (!el) {
			return;
		}

		var that = this,
			x = that.scrollX ? -el.offsetLeft : 0,
			y = that.scrollY ? -el.offsetTop : 0;

		if (x >= 0) {
			x = 0;
		} else if (x < that.maxScrollX) {
			x = that.maxScrollX;
		}

		if (y >= 0) {
			y = 0;
		} else if (y < that.maxScrollY) {
			y = that.maxScrollY;
		}

		that.scrollTo(x, y, runtime);
	},

	momentum: function (dist, time, maxDistUpper, maxDistLower) {
		var friction = 2.5,
			deceleration = 1.2,
			speed = Math.abs(dist) / time * 1000,
			newDist = speed * speed / friction / 1000,
			newTime = 0;

		// Proportinally reduce speed if we are outside of the boundaries 
		if (dist > 0 && newDist > maxDistUpper) {
			speed = speed * maxDistUpper / newDist / friction;
			newDist = maxDistUpper;
		} else if (dist < 0 && newDist > maxDistLower) {
			speed = speed * maxDistLower / newDist / friction;
			newDist = maxDistLower;
		}
		
		newDist = newDist * (dist < 0 ? -1 : 1);
		newTime = speed / deceleration;

		return { dist: Math.round(newDist), time: Math.round(newTime) };
	},
	
	destroy: function (full) {
		var that = this;

		window.removeEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', that, false);		
		that.element.removeEventListener(START_EVENT, that, false);
		that.element.removeEventListener(MOVE_EVENT, that, false);
		that.element.removeEventListener(END_EVENT, that, false);
		document.removeEventListener('webkitTransitionEnd', that, false);

		if (that.options.checkDOMChanges) {
			that.element.removeEventListener('DOMSubtreeModified', that, false);
		}

		if (that.scrollBarX) {
			that.scrollBarX = that.scrollBarX.remove();
		}

		if (that.scrollBarY) {
			that.scrollBarY = that.scrollBarY.remove();
		}
		
		if (full) {
			that.wrapper.parentNode.removeChild(that.wrapper);
		}
		
		return null;
	}
};

function scrollbar (dir, wrapper, fade, shrink, color) {
	var that = this,
		doc = document;
	
	that.dir = dir;
	that.fade = fade;
	that.shrink = shrink;
	that.uid = ++uid;

	// Create main scrollbar
	that.bar = doc.createElement('div');

	that.bar.style.cssText = 'position:absolute;top:0;left:0;-webkit-transition-timing-function:cubic-bezier(0,0,0.25,1);pointer-events:none;-webkit-transition-duration:0;-webkit-transition-delay:0;-webkit-transition-property:-webkit-transform;z-index:10;background:' + color + ';' +
		'-webkit-transform:' + translateOpen + '0,0' + translateClose + ';' +
		(dir == 'horizontal' ? '-webkit-border-radius:3px 2px;min-width:6px;min-height:5px' : '-webkit-border-radius:2px 3px;min-width:5px;min-height:6px');

	// Create scrollbar wrapper
	that.wrapper = doc.createElement('div');
	that.wrapper.style.cssText = '-webkit-mask:-webkit-canvas(scrollbar' + that.uid + that.dir + ');position:absolute;z-index:10;pointer-events:none;overflow:hidden;opacity:0;-webkit-transition-duration:' + (fade ? '300ms' : '0') + ';-webkit-transition-delay:0;-webkit-transition-property:opacity;' +
		(that.dir == 'horizontal' ? 'bottom:2px;left:2px;right:7px;height:5px' : 'top:2px;right:2px;bottom:7px;width:5px;');

	// Add scrollbar to the DOM
	that.wrapper.appendChild(that.bar);
	wrapper.appendChild(that.wrapper);
}

scrollbar.prototype = {
	init: function (scroll, size) {
		var that = this,
			doc = document,
			pi = Math.PI,
			ctx;

		// Create scrollbar mask
		if (that.dir == 'horizontal') {
			if (that.maxSize != that.wrapper.offsetWidth) {
				that.maxSize = that.wrapper.offsetWidth;
				ctx = doc.getCSSCanvasContext("2d", "scrollbar" + that.uid + that.dir, that.maxSize, 5);
				ctx.fillStyle = "rgb(0,0,0)";
				ctx.beginPath();
				ctx.arc(2.5, 2.5, 2.5, pi/2, -pi/2, false);
				ctx.lineTo(that.maxSize-2.5, 0);
				ctx.arc(that.maxSize-2.5, 2.5, 2.5, -pi/2, pi/2, false);
				ctx.closePath();
				ctx.fill();
			}
		} else {
			if (that.maxSize != that.wrapper.offsetHeight) {
				that.maxSize = that.wrapper.offsetHeight;
				ctx = doc.getCSSCanvasContext("2d", "scrollbar" + that.uid + that.dir, 5, that.maxSize);
				ctx.fillStyle = "rgb(0,0,0)";
				ctx.beginPath();
				ctx.arc(2.5, 2.5, 2.5, pi, 0, false);
				ctx.lineTo(5, that.maxSize-2.5);
				ctx.arc(2.5, that.maxSize-2.5, 2.5, 0, pi, false);
				ctx.closePath();
				ctx.fill();
			}
		}

		that.size = Math.max(Math.round(that.maxSize * that.maxSize / size), 6);
		that.maxScroll = that.maxSize - that.size;
		that.toWrapperProp = that.maxScroll / (scroll - size);
		that.bar.style[that.dir == 'horizontal' ? 'width' : 'height'] = that.size + 'px';
	},
	
	setPosition: function (pos) {
		var that = this;
		
		if (that.wrapper.style.opacity != '1') {
			that.show();
		}

		pos = Math.round(that.toWrapperProp * pos);

		if (pos < 0) {
			pos = that.shrink ? pos + pos*3 : 0;
			if (that.size + pos < 7) {
				pos = -that.size + 6;
			}
		} else if (pos > that.maxScroll) {
			pos = that.shrink ? pos + (pos-that.maxScroll)*3 : that.maxScroll;
			if (that.size + that.maxScroll - pos < 7) {
				pos = that.size + that.maxScroll - 6;
			}
		}

		pos = that.dir == 'horizontal'
			? translateOpen + pos + 'px,0' + translateClose
			: translateOpen + '0,' + pos + 'px' + translateClose;

		that.bar.style.webkitTransform = pos;
	},

	show: function () {
		if (has3d) {
			this.wrapper.style.webkitTransitionDelay = '0';
		}
		this.wrapper.style.opacity = '1';
	},

	hide: function () {
		if (has3d) {
			this.wrapper.style.webkitTransitionDelay = '350ms';
		}
		this.wrapper.style.opacity = '0';
	},
	
	remove: function () {
		this.wrapper.parentNode.removeChild(this.wrapper);
		return null;
	}
};

// Is translate3d compatible?
var has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
	// Device sniffing
	isIthing = (/iphone|ipad/gi).test(navigator.appVersion),
	isTouch = ('ontouchstart' in window),
	// Event sniffing
	START_EVENT = isTouch ? 'touchstart' : 'mousedown',
	MOVE_EVENT = isTouch ? 'touchmove' : 'mousemove',
	END_EVENT = isTouch ? 'touchend' : 'mouseup',
	// Translate3d helper
	translateOpen = 'translate' + (has3d ? '3d(' : '('),
	translateClose = has3d ? ',0)' : ')',
	// Unique ID
	uid = 0;

// Expose iScroll to the world
window.iScroll = iScroll;
})();/*globals namespace console window $*/
/*jslint white: true, browser: true, devel: true, onevar: false
  debug: true, undef: true nomen: true, regexp: true 
  newcap: true, immed: true, maxerr: 100, maxlen: 100*/

  /* history must be in the format {
   *    pos: 0;
   *    list: [{'game specific move data'}, {'...'}, ...];
   * }
   */

namespace.lookup('com.pageforest.move-controller').defineOnce(function (ns) {
    var base = namespace.lookup('org.startpad.base');

    function MoveController(ui, history) {
        this.ui = ui;
        this.history = history;
    }

    MoveController.methods({
        merge: function (newHistory, fnComplete) {
            var self = this;
            var n, shortestList;
            var longestPrefix = 0;
            shortestList = Math.min(this.history.list.length, newHistory.list.length);
            if (this.history.pos < shortestList) {
                shortestList = this.history.pos;
            }
            for (n = 0; n < shortestList; n++) {
                if (base.isEqual(this.history.list[n], newHistory.list[n])) {
                    longestPrefix = n + 1;
                } else {
                    break;
                }
            }
            console.log("longestPrefix: " + longestPrefix + " this.history.pos: " + this.history.pos +
                " this.history.list.length: " + this.history.list.length +  " newHistory.pos: " + newHistory.pos +
                " newHistory.list.length: " + newHistory.list.length);
            this.ui.setMovePos(longestPrefix, true, function () {
                self.ui.appendMoves(newHistory);
                self.ui.setMovePos(newHistory.pos, true, fnComplete);
            });
        }
    });
    ns.extend({
        'MoveController': MoveController
    });
});
/*globals namespace console window $ */
/*jslint white: true, browser: true, devel: true
  debug: true, undef: true nomen: true, regexp: true
  newcap: true, immed: true, maxerr: 100, maxlen: 100 */


// A PawnPwnGame object is a purely abstract Pawn Pwn board.
// It controls all game data for the user interface

namespace.lookup('com.pageforest.pawnpwn').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client');
    var util = namespace.util;

    var vCode = 118;
    var hCode = 104;
    var letterOffset = 97;
    var numberOffset = 49;

    function newAction(i, j, wall) {
        return {
            i: i,
            j: j,
            wall: wall
        };
    }
    // color: 0 for white 1 for black
    function newPlayer(player) {
        var homeRow;
        var goalRow;
        if (player === 0) {
            homeRow = 8;
            goalRow = 0;

        }
        if (player === 1) {
            homeRow = 0;
            goalRow = 8;
        }
        return {
            i: 4,
            j: homeRow,
            walls: 10,
            score: 8,
            goalRow: goalRow
        };
    }

    function decode(str) { //converts a move string to a action object
        var i, j;
        var wall = false;
        if (str.length === 4) {
            if (str.charCodeAt(0) === vCode) {
                wall = "v";
            } else if (str.charCodeAt(0) === hCode) {
                wall = "h";
            }
            i = str.charCodeAt(2) - letterOffset;
            j = str.charCodeAt(3) - numberOffset;
        } else if (str.length === 2) {
            i = str.charCodeAt(0) - letterOffset;
            j = str.charCodeAt(1) - numberOffset;
        }
        return {
            i: i,
            j: j,
            wall: wall
        };
    }

    function encode(action) { //converts action object to a move string
        var str = '';
        if (action.wall) {
            str = action.wall + '-';
        }
        str += String.fromCharCode((action.i + letterOffset), (action.j + numberOffset));
        return str;
    }

    function Queue() {
        this.rg = [];
        this.iIn = 0;
        this.iOut = 0;
    }

    Queue.methods({
        push: function (item) {
            this.rg[this.iIn++] = item;
        },

        pop: function () {
            if (this.iIn === this.iOut) {
                return null;
            }
            return this.rg[this.iOut++];
        },

        fEmpty: function () {
            return this.iIn === this.iOut;
        }
    });

    function PawnPwnGame() {
        this.walls = {};
        this.players = [];
        this.history = {pos: 0, list: []};
        this.memo = {};
        this.track = [[1, 0], [-1, 0], [0, -1]];
    }

    PawnPwnGame.methods({
        init: function () {
            this.vWalls = [];
            this.hWalls = [];
            var i, j;
            for (i = 0; i < 9; i++) {
                this.vWalls[i] = [];
                this.hWalls[i] = [];
                for (j = 0; j < 9; j++) {
                    this.vWalls[i][j] = false;
                    this.hWalls[i][j] = false;
                }
            }
            this.players[0] = newPlayer(0);
            this.players[1] = newPlayer(1);
            this.history = {pos: 0, list: []};
            this.buildTrack();
        },

        getState: function () {
            return {
                players: this.players,
                walls: this.walls,
                history: this.history
            };
        },

        setState: function (json) {
            this.players = json.players;
            this.walls = json.walls;
            this.history = json.history;
        },

        // "e3" is a player move to the e3 square.
        // "v-e4" is a vertical wall with top section directly
        // to the right of the e4 square.
        // "h-d6" is a horizontal wall with left section directly below the d6 square.
        // bypass is a bool used by the changeHistoryPos fn to skip over isValidMove.
        move: function (str, from, bypass) {
            var p = this.history.pos % 2;
            var n;
            if (from) {
                if (from[0] === 'w') {
                    if (p !== parseInt(from[1], 10)) {
                        throw new Error("wall chosen from wrong side");
                    }
                    for (n = 0; n < this.history.pos; n++) {
                        if (this.history.list[n].from === from) {
                            throw new Error("wall already claimed");
                        }
                    }
                } else {
                    var f = decode(from);
                    var player = this.players[p];
                    if (player.i !== f.i || player.j !== f.j) {
                        throw new Error("move given a 'from' that is not the previous position");
                    }
                }
            } else {
                throw new Error("no 'from' var in qg.move call");
            }

            var action = decode(str);
            if (!bypass && !this.isValidMove(str)) {
                return false;
            }
            if (!bypass && !this.historyCurrent()) {
                this.history.list = this.history.list.slice(0, this.history.pos);
            }
            var turn = this.history.pos % 2;
            if (action.wall) {
                this.walls[str] = true;
                this.players[turn].walls--;
                this.memo = {};
            } else {
                this.players[turn].i = action.i;
                this.players[turn].j = action.j;
            }
            var score = this.breadthFirstSearch();
            for (n = 0; n < 2; n++) {
                this.players[n].score = score[n];
            }
            this.history.list[this.history.pos] = {
                move: str,
                score: this.getScore(),
                from: from
            };
            this.history.pos++;
            this.buildTrack();
            return true;
        },

        buildTrack: function () {
            var onPawn, moves, n;
            var turn = this.history.pos % 2;
            var opTurn = (this.history.pos + 1) % 2;
            var i = this.players[turn].i;
            var j = this.players[turn].j;
            var oi = this.players[opTurn].i;
            var oj = this.players[opTurn].j;
            moves = this.getReachableMoves(encode({i: i, j: j, walls: false}));
            onPawn = moves.indexOf(encode({i: oi, j: oj, wall: false}));
            if (onPawn !== -1) {
                moves = moves.concat(this.getReachableMoves(moves[onPawn]));
                delete moves[onPawn];
                delete moves[moves.indexOf(encode({i: i, j: j, wall: false}))];
            }
            this.track = [];
            var list = [], move, index, angles = [], c;
            var player = this.players[this.history.pos % 2];
            for (n = 0; n < moves.length; n++) {
                if (moves[n] === undefined) {
                    continue;
                }
                move = decode(moves[n]);
                list[list.length] = [move.i - player.i, move.j - player.j];
                angles[angles.length] = Math.atan2(-list[list.length - 1][1],
                    list[list.length - 1][0]) - Math.PI / 2;
                if (angles[angles.length - 1] >= 0) {
                    angles[angles.length - 1] -= Math.PI * 2;
                }
            }
            var highIndex, high;
            for (c = 0; c < angles.length; c++) {
                high = -99;
                for (n = 0; n < angles.length; n++) {
                    if (angles[n] > high) {
                        high = angles[n];
                        highIndex = n;
                    }
                }
                angles[highIndex] = -100;
                this.track[c] = list[highIndex];
            }
        },

        //is input string a valid move?  Returns true/false
        isValidMove: function (str) {
            if (this.memo[str]) {
                return true;
            }
            if (this.memo[str] === false) {
                return false;
            }
            var action = decode(str);
            var wallType = ["v", "h"];
            var wallArrayI = [];
            var wallArrayJ = [];
            wallArrayI[0] = [0, 0, 0];
            wallArrayJ[0] = [1, -1, 0];
            wallArrayI[1] = [1, -1, 0];
            wallArrayJ[1] = [0, 0, 0];
            var turn = this.history.pos % 2;
            var opTurn = (this.history.pos + 1) % 2;
            var i = this.players[turn].i;
            var j = this.players[turn].j;
            var oi = this.players[opTurn].i;
            var oj = this.players[opTurn].j;
            var k, n, moves, move, adjMoves;
            var onPawn;
            if (action.wall === false) {
                moves = this.getReachableMoves(encode({i: i, j: j, walls: false}));
                onPawn = moves.indexOf(encode({i: oi, j: oj, wall: false}));
                if (onPawn !== -1) {
                    moves = moves.concat(this.getReachableMoves(moves[onPawn]));
                    delete moves[onPawn];
                    delete moves[moves.indexOf(encode({i: i,
                        j: j, wall: false}))];
                }
                if (moves.indexOf(str) !== -1) {
                    return true;
                }
                return false;
            }
            if (this.players[turn].walls === 0) {
                return false;
            }
            for (k = 0; k < 2; k++) {
                if (action.wall === wallType[k]) {
                    if (this.walls[encode({i: action.i, j: action.j, 
                        wall: wallType[(k + 1) % 2]})]) {
                        this.memo[str] = false;
                        return false;
                    }
                    for (n = 0; n < 3; n++) {
                        if (this.walls[encode({i: (action.i + wallArrayI[k][n]),
                            j: (action.j + wallArrayJ[k][n]),
                            wall: wallType[k]})]) {
                            this.memo[str] = false;
                            return false;
                        }
                    }
                    this.walls[str] = true;
                    if (this.breadthFirstSearch() !== false) {
                        delete this.walls[str];
                        this.memo[str] = true;
                        return true;
                    } else {
                        delete this.walls[str];
                        this.memo[str] = false;
                        return false;
                    }
                }
            }
        },

        //accepts a string position and returns a list of valid pawn moves
        //checks if the move is off the board and if walls are in the way
        //does not check if the other pawn is in the way
        getReachableMoves: function (str, dirOnly)
        {
            //dir: 0 up 1 right 2 down 3 left
            //if pos + dir is off the board then return false
            var start = decode(str);
            var letter = ['h', 'v', 'h', 'v'];
            var diWall = [[-1, 0], [0, 0], [-1, 0], [-1, -1]];
            var djWall = [[-1, -1], [-1, 0], [0, 0], [-1, 0]];
            var di = [0, 1, 0, -1];
            var dj = [-1, 0, 1, 0];
            var w, i, j;
            var moves = [];
            var direction; //0: up, 1: right, 2: down, 3: left
            for (direction = 0; direction < 4; direction++) {
                i = start.i + di[direction];
                j = start.j + dj[direction];
                if (i > 8 || i < 0 || j > 8 || j < 0) {
                    continue;
                }
                if (this.walls[encode({i: start.i + diWall[direction][0],
                    j: start.j + djWall[direction][0], wall: letter[direction]})] ||
                    this.walls[encode({i: start.i + diWall[direction][1],
                    j: start.j + djWall[direction][1], wall: letter[direction]})]) {
                    continue;
                }
                if (dirOnly == undefined) {
                    moves[moves.length] = encode({i: i, j: j, wall: false});
                } else {
                    moves[moves.length] = direction;
                }
            }
            return moves;
        },

        //takes in a string move position ex: "e4" and returns
        //whether or not both players can reach their goal rows
        //returns the players current scores
        breadthFirstSearch: function () {
            var i, k, win, score, pos, moves, start, queue, scoreMap;
            var valid = [false, false];
            var bestScore = [100, 100];
            for (k = 0; k < 2; k++) {
                scoreMap = {};
                start = encode({i: this.players[k].i, j: this.players[k].j, wall: false});
                queue = new Queue();
                queue.push([start, 0]);
                scoreMap[start] = 0;
                while (!queue.fEmpty()) {
                    pos = queue.pop();
                    moves = this.getReachableMoves(pos[0]);
                    score = pos[1];
                    for (i = 0; i < moves.length; i++) {
                        if (scoreMap[moves[i]] || scoreMap[moves[i]] === 0) {
                            continue;
                        }
                        queue.push([moves[i], score + 1]);
                        scoreMap[moves[i]] = score + 1;
                    }
                }
                for (i = 0; i < 9; i++) {
                    win = encode({i: i, j: this.players[k].goalRow, wall: false});
                    if (scoreMap[win] >= 0 && scoreMap[win] < bestScore[k]) {
                        bestScore[k] = scoreMap[win];
                    }
                }
            }
            if (bestScore[0] == 100 || bestScore[1] == 100) {
                return false;
            }
            return bestScore;
        },

        // changes the history to where pos specifies
        changeHistoryPos: function (pos) {
            var count, move, i, from;
            var totalLength = this.history.list.length;
            if (pos === this.history.pos) {
                return false;
            }
            if (pos < this.history.pos) {
                count = this.history.pos - pos;
                for (i = 0; i < count; i++) {
                    this.unMove();
                }
            }
            if (pos > this.history.pos) {
                count = pos - this.history.pos;
                for (i = 0; i < count; i++) {
                    move = this.history.list[this.history.pos].move;
                    from = this.history.list[this.history.pos].from;
                    this.move(move, from, true);
                }
            }
            this.buildTrack();
            return this.history;
        },

        unMove: function () {
            this.history.pos--;
            var action = this.history.list[this.history.pos];
            var move = decode(action.move);
            var from = decode(action.from);
            var turn = this.history.pos % 2;
            if (move.wall) {
                delete this.walls[encode(move)];
                this.players[turn].walls++;
                return;
            }
            this.players[turn].i = from.i;
            this.players[turn].j = from.j;
            if (this.history.pos === 0) {
                this.players[0].score = 8;
                this.players[1].score = 8;
            } else {
                this.players[0].score = this.history.list[this.history.pos - 1].score[0];
                this.players[1].score = this.history.list[this.history.pos - 1].score[1];
            }
        },

        historyCurrent: function () {
            if (this.history.list.length === this.history.pos) {
                return true;
            } else {
                return false;
            }
        },

        getScore: function () {
            return [this.players[0].score, this.players[1].score];
        },

        currentPlayer: function () {
            return (this.history.pos % 2);
        },

        isGameOver: function () {
            var s = this.getScore();
            if (s[0] === 0 || s[1] === 0) {
                return true;
            }
            return false;
        }

    });
    ns.extend({
        'PawnPwnGame': PawnPwnGame,
        'encode': encode,
        'decode': decode,
        'newPlayer': newPlayer
    });
});



/*globals namespace console window $*/
/*jslint white: true, browser: true, devel: true, onevar: false
  debug: true, undef: true nomen: true, regexp: true
  newcap: true, immed: true, maxerr: 100, maxlen: 100 */

namespace.lookup('com.pageforest.pawnpwnUI').defineOnce(function (ns) {
    var clientLib = namespace.lookup('com.pageforest.client');
    var pawnpwn = namespace.lookup('com.pageforest.pawnpwn');
    var moveController = namespace.lookup('com.pageforest.move-controller');
    var graph = namespace.lookup('com.pageforest.graph');
    var vector = namespace.lookup('org.startpad.vector');
    var dom = namespace.lookup('org.startpad.dom');
    var util = namespace.util;

    var letterOffset = 97;
    var numberOffset = 48;
    var vCode = 118;
    var hCode = 104;
    var windowSize = [0, 0];    // actual window size used for detecting useless onResize events
    
    var grabbing = {
        valid: false,        // true when holding a piece
        wall: false,         // false when no valid wall move around, move string when there is
        wallHome: false,     // html id for piece held
        orient: "v",         // 'v' or 'h'
        pMove: false,        // move string for appropriate pawn move
        pColor: false,       // 0 or 1 for white/black
        pos: [0, 0],         // coordinates of the piece held
        offset: []           // x and y difference when grabbing a pawn
    };
    var hovering = false;    // hovering == html code for wall or pawn div
    // or false if mouse is not over a grabable piece

    var animateSpeed = 300;  // ms
    var parts;               // contains dom elements of everything on page
    var freezeUI = false;          // used to lock the UI, for back/fwd button, loading, and gameover
    var historyGraph;

    // following variables are relative to the size of the board
    // and are changed in changeSize() called on resize events
    var posBoard = [];        // Position of the board in page coordinates
    var posTiles = [];        // Position of the tiles in board coordinates
    var pawnCenter = [];      // [x, y] of 1/2 tile width
    var tileSpacing = [];     // [dx, dy] of inter-tile distance
    var wallDragH = [];       // Horizontal wall drag point offset
    var wallDragV = [];       // Vertical wall drag point offset
    var wallStash = [[], []]; // Rects for wall grabbing areas
    var tileWidth, wallWidth, boardWidth;
    var wallLength, wallPicWidth, wallPicLength, pawnSize;

    var wMod;        // wMod is the width modifier for scoring the current wall dragging position
    var lMod;        // lMod is the length modifier
    var vMod, hMod;  // vMod and hMod are the vertical and horizontal rectangle transforms
    var scoreBias = 100;      // score bias for keeping the original orientation
    var scoreThresh = 600;    // score threshold for allowing a legal wall drop

    var wallHome = {};     //contains coordinates for each wall initial state
    var maxSpeed = 0.50;   //px per ms
    var wallSpeed;        //current speed of piece
    var wallSpeedLimit = 5;

    
    var timesBoardSizeModified = 0;
    
    function handleAppCache() {
        if (typeof applicationCache == 'undefined') {
            return;
        }

        if (applicationCache.status == applicationCache.UPDATEREADY) {
            applicationCache.swapCache();
            location.reload();
            return;
        }

        applicationCache.addEventListener('updateready', handleAppCache, false);
    }

    
 // find the apropriate board style based on the w and h of the window, the width of the movelist and the height of the title
 // 1: board on left, graph on right with title above graph.  2: board on left, graph next, movelist next with title above movelist
 // 3: title above board, extra space below board if necessary.  4: title above board, graph fills space below board
 // 5: board top left, graph below board same width, movelist on right with title above it
    function findBoardStyle(w, h, movelistWidth, titleHeight, minGraphSize) {
        var boardSpace;
        if (w > 600 && h > 700) {
            // try boardstyle 5
            if (h / (w - movelistWidth) > boardRatio) {   // is there room on the bottom for the graph?
                return 5;
            }
         // try 1 and 2, if leftover space on right is big enough, do 2, else do 1
            if (w - h / boardRatio > movelistWidth + minGraphSize[0]) {
                return 2;
            }
            return 1;
        }
     // is there extra space on the bottom?
        if (h / w > boardRatio) {
         // if there is enough for a graph do 4 else do 3
            if (h - titleHeight - w * boardRatio > 120) {
                return 4;
            }
            return 3;
        }
     // how much left over width is there?
        var leftoverwidth = w - h / boardRatio;
        if (leftoverwidth < minGraphSize[0]) {
         // if there isn't enough room for a sidebar
            return 3;
        }
     // if there is enough room for a movelist and graph do 2, else do 1
        if (leftoverwidth > movelistWidth + minGraphSize[0]) {
            return 2;
        }
        return 1;
    }
    
    var boardRatio = 1.370; // actually 1.382 but this number gives better horizontal margins
    // Handle window resize event
    function onResize() {
        var h, w, size;
        var appbarHeight = 35, appbarWidth = 170;
        var signInSize = [79, 30];

        var titleHeight;
        var boardSize = [];
        var infoSize = [], infoMargin;
        var horizMargin = 15;

        h = window.innerHeight;
        w = window.innerWidth;
        if (windowSize[0] == w && windowSize[1] == h) {
            return;
        }
        windowSize = [w, h];
        var boardStyle;
        //appbar or not
        var appbar = 0;
        $('body').addClass('noAppBar');
        $('body').css('margin-top', 0);
        if (w > 525 && h > 450) {
            appbar = 40;
            h -= 35;
            $('body').removeClass('noAppBar');
            $('body').css('margin-top', '35px');
        }
        var boardSize = [];
        var boardSpace = [];           //size of space board resides in.  Might be != to boardSize in style 3 and 5
        var graphSize = [];
        var movelistSize = [];
        
        var wTemp, hTemp;
        var widthConst, heightConst;

        var movelistWidth = 175;
        var minGraphSize = [200, 150];
        var titleHeight = 40;             //contains title: Pawn Pwn, width: movelistWidth
        var aboutHeight = 30;             //contains about and sign-in/my-docs buttons, width: movelistWidth
        var divButtonsHeight = 30;        //contains fwd and back buttons, width: movelistWidth
        var m = 5;                        //margin
        var gradw = 10;                   //width of the gradient seperator bar
        
        var boardStyle = findBoardStyle(w, h, movelistWidth, titleHeight, minGraphSize);

        
        
        $('body').css('height', h);
        $('body').removeClass('five');
        $('body').removeClass('four');
        $('body').removeClass('three');
        $('body').removeClass('two');
        $('body').removeClass('one');
        if (boardStyle == 5) {
            $('body').addClass('five');
            boardSpace = [w - gradw - m - movelistWidth - m, h];
            graphSize[0] = boardSpace[0];
            if (h - boardSpace[0] * boardRatio < (minGraphSize[1] + gradw)) {        // if there is less than 150 px of room for the graph, must shrink board for min graph size
                boardSpace[1] = h - minGraphSize[1] - gradw;
                boardSize = [boardSpace[1] / boardRatio, boardSpace[1]];
                graphSize = [boardSpace[0], minGraphSize[1]];
            } else {
                boardSpace[1] = boardSpace[0] * boardRatio;
                boardSize = boardSpace;
                graphSize[1] = h - boardSpace[1] - gradw;
            }
            dom.setPos(parts.gradientv, [boardSpace[0], -appbar]);
            dom.setPos(parts.gradienth, [0, boardSpace[1]]);
            dom.setPos(parts.gradientCorner, [boardSpace[0], boardSpace[1]]);
            movelistSize = [movelistWidth, h - titleHeight - m - aboutHeight - m - divButtonsHeight - m];
            dom.setPos(parts.board, [boardSpace[0] / 2 - boardSize[0] / 2, 0]);
            dom.setPos(parts.graph, [m, boardSpace[1] + gradw + m]);
            dom.setPos(parts.title, [boardSpace[0] + gradw + m, 0]);
            dom.setPos(parts.aboutsi, [boardSpace[0] + gradw + m, titleHeight])
            dom.setPos(parts.movelist, [boardSpace[0] + gradw + m, titleHeight + m + aboutHeight]);
            dom.setPos(parts.buttons, [boardSpace[0] + gradw + m, titleHeight + m + aboutHeight + m + movelistSize[1]]);
        }
        if (boardStyle == 4) {
            $('body').addClass('four');
            var th4 = aboutHeight + 2;
            boardSize = [w - 2, (w - 2) * boardRatio];
            graphSize = [w, h - boardSize[1] - th4 - m - divButtonsHeight - gradw];
            dom.setPos(parts.board, [0, th4]);
            dom.setPos(parts.title, [0, 0]);
            dom.setPos(parts.aboutsi, [boardSize[0] - movelistWidth - m, m]);
            dom.setPos(parts.buttons, [boardSize[0] / 2 - movelistWidth / 2, boardSize[1] + th4]);
            
            dom.setPos(parts.gradienth, [0, boardSize[1] + th4 + divButtonsHeight + m]);
            dom.setPos(parts.graph, [m, boardSize[1] + th4 + m + divButtonsHeight + gradw + m]);
            
        }
        if (boardStyle == 3) {
            $('body').addClass('three');
            var th3 = aboutHeight + 2;
            boardSize = [w, h - th3 - divButtonsHeight - m];
            dom.setPos(parts.board, [0, th3]);
            dom.setPos(parts.title, [0, 0]);
            dom.setPos(parts.aboutsi, [boardSize[0] - movelistWidth - m, m]);
            dom.setPos(parts.buttons, [boardSize[0] / 2 - movelistWidth / 2, boardSize[1] + th3]);
        }
        if (boardStyle == 2) {
            //left to right, board gradbar, m, graph, m, movelist, m
            //top to bottom, appbar, title, m, about, m, movelist, m, divbuttons, m
            var graphOffset = 3;  //necessary in order to align walls of board with axis of graph
            if (appbar == 0) {
                titleHeight = 5;                
            }
            $('body').addClass('two');
            boardSize = [h / boardRatio, h];
            graphSize = [w - boardSize[1] / boardRatio - gradw - m - movelistWidth - m, h - graphOffset];
            movelistSize = [movelistWidth, h - titleHeight - m - aboutHeight - m - divButtonsHeight - m];
            dom.setPos(parts.board, [0, 0]);
            dom.setPos(parts.gradientv, [boardSize[1] / boardRatio, -appbar]);
            dom.setPos(parts.graph, [boardSize[1] / boardRatio + gradw + m, m + graphOffset]);
            dom.setPos(parts.title, [boardSize[1] / boardRatio + gradw + m + graphSize[0], 0]);
            dom.setPos(parts.aboutsi, [boardSize[1] / boardRatio + gradw + m + graphSize[0], titleHeight])
            dom.setPos(parts.movelist, [boardSize[1] / boardRatio + gradw + m + graphSize[0], titleHeight + m + aboutHeight]);
            dom.setPos(parts.buttons, [boardSize[1] / boardRatio + gradw + m + graphSize[0], titleHeight + m + aboutHeight + m + movelistSize[1]]);
        }
        if (boardStyle == 1) {
            $('body').addClass('one');
            if (appbar == 0) {
                titleHeight = 5;
            }
            boardSize = [h / boardRatio, h];
            graphSize = [w - boardSize[0] - gradw, h - titleHeight - m - aboutHeight - m - divButtonsHeight - m];
            dom.setPos(parts.board, [0, 0]);
            dom.setPos(parts.gradientv, [boardSize[0], -appbar]);
            dom.setPos(parts.graph, [boardSize[0] + gradw + m, m + titleHeight + m + aboutHeight + m]);
            dom.setPos(parts.title, [boardSize[0] + gradw + m + graphSize[0] / 2 - movelistWidth / 2, 0]);
            dom.setPos(parts.aboutsi, [boardSize[0] + gradw + m + graphSize[0] - movelistWidth - m - m, titleHeight])
            dom.setPos(parts.movelist, [boardSize[0] + gradw + m + graphSize[0], titleHeight + m + aboutHeight]);
            dom.setPos(parts.buttons, [boardSize[0] + gradw + graphSize[0] / 2 - movelistWidth / 2, titleHeight + m + aboutHeight + m + graphSize[1]]);
        }
        dom.setSize(parts.gradientv, [10, h + appbar]);
        if (boardStyle == 5) {
            dom.setSize(parts.gradienth, [boardSpace[0], 10]);
        } else {
            dom.setSize(parts.gradienth, [w, 10]);
        }
        
        dom.setSize(parts.board, boardSize);
        dom.setSize(parts.graph, graphSize);
        var historyGraphSize = vector.sub(graphSize, [10, 10]);
        parts.historyGraph.width = historyGraphSize[0];
        parts.historyGraph.height = historyGraphSize[1];
        
        dom.setSize(parts.movelist, movelistSize);
        dom.setSize(parts.tableDiv, movelistSize);

        historyGraph = new graph.GraphLines(parts.historyGraph);
        setHistory();
        if (boardStyle !== 3 || boardSize[1] / boardSize[0] < boardRatio) {
            dom.setPos(parts.divBoard, [boardSize[0] / 2 - boardSize[1] / 2 + 5, 5]);
            changeSize(boardSize[1] - 10, appbar);
            return;
        }
        
        dom.setPos(parts.divBoard, [boardSize[0] / 2 - (boardSize[0] * boardRatio - 10) / 2, 5]);
        changeSize(boardSize[0] * boardRatio - 10, appbar);
        
        
        /*dom.setSize(parts.divBoard, boardSize);
        
     // somehow this line fixes an iscroll-mini-pawnpwn-board-generation bug
     // Theory: the tableDiv should be display: none.  The bug means that it is visible.  
     // So, by checking to make sure it is display: none, the program wants to cover its own back and say, 
     // "Yup we sure are display none, we were display none the entire time!  
     // It's so silly that you even ask what our display property is, we are totally display: none. LOL!"
        $(parts.tableDiv).css('display');*/
    }

    // Move the board pieces to reflect a new board size.
    function changeSize(width, appbar)
    {
        var scale = width / 575;
        var n;
        posBoard = [parseFloat(parts.divBoard.style.left) + parseFloat(parts.board.style.left), parseFloat(parts.divBoard.style.top) + parseFloat(parts.board.style.top)];
        if (appbar) {
            posBoard[1] += appbar;
        }
        posTiles[1] = 90.1 * scale;
        posTiles[0] = 90.3 * scale;
        posTiles = [posTiles[0], posTiles[1]];
        wallPicWidth = 11 * scale;
        wallPicLength = 81 * scale;
        tileWidth = 35 * scale;
        pawnCenter = vector.mult(0.5, [tileWidth, tileWidth]);
        wallWidth = 10 * scale;
        wallLength = 80 * scale;
        wallDragH = [wallLength - 0.5 * tileWidth, 0.5 * wallWidth];
        wallDragV = [0.5 * wallWidth, wallLength - 0.5 * tileWidth];
        boardWidth = 9 * tileWidth + 8 * wallWidth;
        for (n = 0; n < 2; n++) {
            wallStash[(n + 1) % 2] = [0, n * (posTiles[1] + boardWidth + wallWidth), width,
                                      n * (posTiles[1] + boardWidth + wallWidth) + wallLength];
        }
        tileSpacing = [wallWidth + tileWidth, wallWidth + tileWidth];
        pawnSize = 35 * scale;
        wMod = 10 * scale;
        lMod = 18 * scale;
        vMod = [-wMod, lMod, wMod, -lMod];
        hMod = [lMod, -wMod, -lMod, wMod];
        scoreBias = 80 * Math.pow(scale, 2) * 10 / 15;
        scoreThresh = 400 * Math.pow(scale, 2) * 10 / 15;
        maxSpeed = 0.50 * scale;
        var x, y, wall, str, pawn;
        setWallHome();
        // REVIEW: Would be nice to just change the global style
        // using:
        // rule = document.styleSheets[1].cssRules['IMG.wall'];
        // rule.style.width = ....
        $(parts.imgBoard).css('width', width);
        $(parts.imgBoard).css('height', width);
        onMouseUp();
        var i, used = false;
        var pawnLoc;
        for (x = 0; x < 2; x++) {    
            for (y = 0; y < 10; y++) {
                wall = 'w' + x + '_' + y;
                for (i = 0; i < pp.history.pos; i++) {
                    if (pp.history.list[i].from == wall) {
                        used = i;
                        break;
                    }
                }
                if (used !== false) {
                    grabbing.wallHome = wall;
                    placeWall(pp.history.list[used].move, false);
                    if (pp.history.list[used].move[0] == 'v') {
                        dom.setSize(parts[wall], [wallPicWidth, wallPicLength]);
                    } else {
                        dom.setSize(parts[wall], [wallPicLength, wallPicWidth]);
                    }
                    used = false;
                    continue;
                }
                dom.setPos(parts[wall], wallHome[wall]);
                dom.setSize(parts[wall], [wallPicWidth, wallPicLength]);
            }
            dom.setSize(parts['p' + x + 'pic'], [pawnSize, pawnSize]);
            pawnLoc = pawnpwn.encode({i: pp.players[x].i, j: pp.players[x].j, wall: false});
            grabbing.pColor = x;
            placePawn(pawnLoc, false);
        }
        flashGrabbing();
        var yourmoveleft = posTiles[0] - wallWidth;
        dom.setPos(parts.yourmove1, [yourmoveleft, posTiles[1] - wallLength - wallWidth + 3]);
        dom.setPos(parts.yourmove0, [yourmoveleft, posTiles[1] + boardWidth + wallWidth]);
        var json = getDoc();
    }


    // Returns:
    // { i: column number
    //   j : row number
    //   k: 0 (main tile), 1 (right channel), 2 (bottom channel), 3 (channel intersection)}
    function ptTile(pos)
    {
        pos = vector.sub(pos, posBoard);
        vector.subFrom(pos, posTiles);
        var n;
        var d = [];
        for (n = 0; n < 2; n++) {
            d[n] = pos[n] % tileSpacing[n];
        }
        var i = Math.round((pos[0] - d[0]) / tileSpacing[0]);
        var j = Math.round((pos[1] - d[1]) / tileSpacing[1]);
        var k;
        if (d[1] > tileWidth) {
            if (d[0] > tileWidth) {
                k = 3;
            } else {
                k = 1;
            }
        } else if (d[0] > tileWidth) {
            k = 2;
        } else {
            k = 0;
        }
        return {
            i: i,
            j: j,
            k: k
        };
    }

    // Takes pt from current dragging wall position and
    // determines orientation and proper drop location.
    function ptWall(pos) {
        var pt = ptTile(pos);
        var walls = [];
        var wall, i, j, x;
        var check = [['h', -1, -1], ['h', 0, -1], ['h', 1, -1], ['h', -1, 0],
                     ['h', 0, 0], ['h', 1, 0], ['v', -1, -1], ['v', -1, 0],
                     ['v', -1, 1], ['v', 0, -1], ['v', 0, 0], ['v', 0, 1]];

        for (x = 0; x < check.length; x++) {
            i = pt.i + check[x][1];
            j = pt.j + check[x][2];
            wall = check[x][0];
            if (i >= 0 && i <= 7 && j >= 0 && j <= 7) {
                walls[walls.length] = {i: i, j: j, wall: wall};
            }
        }

        // takes a move object, always a wall and returns a rect
        // tl = top left, br = bottom right
        function wallRect(wall) {
            var tl = [wall.i * tileSpacing[0], wall.j * tileSpacing[1]];
            vector.addTo(tl, posBoard, posTiles);
            var br = [];
            if (wall.wall == 'v') {
                tl[0] += tileWidth;
                br[0] = tl[0] + wallWidth;
                br[1] = tl[1] + wallLength;
            }
            if (wall.wall == 'h') {
                tl[1] += tileWidth;
                br[0] = tl[0] + wallLength;
                br[1] = tl[1] + wallWidth;
            }
            return tl.concat(br);
        }

        var vRect = [pos[0] - wallDragV[0], pos[1] - wallDragV[1],
                     pos[0] + wallDragV[0], pos[1] + wallLength - wallDragV[1]];
        vector.addTo(vRect, vMod);
        var hRect = [pos[0] - wallDragH[0], pos[1] - wallDragH[1],
                     pos[0] + wallLength - wallDragH[0], pos[1] + wallDragH[1]];
        vector.addTo(hRect, hMod);
        
        var score = [];
        for (x = 0; x < walls.length; x++) {
            wall = wallRect(walls[x]);
            if (walls[x].wall == 'v') {
                score[x] = vector.area(vector.rcClipToRect(vRect, wall));
            } else {
                score[x] = vector.area(vector.rcClipToRect(hRect, wall));
            }
            if (walls[x].wall == grabbing.orient) {
                score[x] += scoreBias;
            }
        }

        var xBest;
        var highScore = 0;
        for (x = 0; x < walls.length; x++) {
            if (score[x] > highScore &&
                score[x] > scoreThresh &&
                pp.isValidMove(pawnpwn.encode(walls[x]))) {
                xBest = x;
                highScore = score[x];
            }
        }
        if (xBest === undefined) {
            return false;
        }
        return pawnpwn.encode(walls[xBest]);
    }

    function ptPawnMove(pos) {
        var pt = ptTile(pos);
        if (pt.k !== 0) {
            return false;
        }
        var move = pawnpwn.encode({i: pt.i, j: pt.j, wall: false});
        if (pp.isValidMove(move)) {
            return move;
        }
        return false;
    }

    // Find which wall to take from home supply.
    function ptWallHome(pos) {
        pos = vector.sub(pos, posBoard);
        var n, player;
        if (pp.currentPlayer() === 0 && vector.ptInRect(pos, wallStash[0])) {
            player = 0;
        } else if (pp.currentPlayer() === 1 && vector.ptInRect(pos, wallStash[1])) {
            player = 1;
        } else {
            return false;
        }
        var xStart = posTiles[0] - wallWidth - pawnCenter[0];
        var wall = Math.floor((pos[0] - xStart) / tileSpacing[0]);
        var str = 'w' + player + '_' + wall;
        for (n = 0; n < pp.history.pos; n++) {
            if (pp.history.list[n].from == str || wall < 0 || wall > 9) {
                return false;
            }
        }
        return str;
    }

    // moveWall(current orientation, desired orientation,
    //   x relative to top left corner of board.png, y...
    //   when x is not given, flips the wall only
    function moveWall(orient, orientN, pos) {
        if (orient != orientN) {
            if (orientN == "h") {
                dom.setSize(parts[grabbing.wallHome], [wallPicLength, wallPicWidth]);
            } else if (orientN == "v") {
                dom.setSize(parts[grabbing.wallHome], [wallPicWidth, wallPicLength]);
            }
            orient = orientN;
        }
        if (pos === undefined) {
            return;
        }
        if (orient == "h") {
            pos = vector.sub(pos, wallDragH);
        } else {
            pos = vector.sub(pos, wallDragV);
        }
        vector.subFrom(pos, posBoard);
        dom.setPos(parts[grabbing.wallHome], pos);
    }

    // places pawn in proper spot
    function placePawn(str, animate) {
        var action = pawnpwn.decode(str);
        var pos = vector.mult([action.i, action.j], tileSpacing);
        pos = vector.add(pos, posTiles);
        if (animate) {
            $(parts['p' + grabbing.pColor]).animate({left: pos[0], top: pos[1]}, 100);
            return;
        }
        dom.setPos(parts['p' + grabbing.pColor], pos);
    }

    // places wall in proper spot
    function placeWall(str, animate) {
        var action = pawnpwn.decode(str);
        var l, t;
        var pos = vector.mult([action.i, action.j], tileSpacing);
        pos = vector.add(pos, posTiles);
        if (action.wall == "v") {
            pos[0] += tileWidth;
        }
        if (action.wall == "h") {
            pos[1] += tileWidth;
        }
        if (animate) {
            $(parts[grabbing.wallHome]).animate({left: pos[0], top: pos[1]}, animateSpeed);
            return;
        }
        dom.setPos(parts[grabbing.wallHome], pos);
    }

    // mouseMove event handler
    function getHovering(e) {
        if (freezeUI === true) {
            hovering = "";
            return;
        }
        var loc = ptTile(e.x - posTiles[0], e.y - posTiles[1]);
        var k;
        for (k = 0; k < 2; k++) {
            if (loc.k === 0 && loc.i == pp.players[k].i &&
                loc.j == pp.players[k].j) {
                hovering = "p" + k;
                return;
            }
        }
        hovering = ptWallHome(e.x, e.y);
        return;
    }

    function closestTrack(x, y) {
        var index;
        var minScore = 10;
        var score;
        var vectAngle = Math.atan2(-y, x) - Math.PI / 2;

        if (vectAngle >= 0) {
            vectAngle -= Math.PI * 2;
        }
        var n;
        var trackAngle;
        for (n = 0; n < pp.track.length; n++) {
            trackAngle = Math.atan2(-pp.track[n][1], pp.track[n][0]) - Math.PI / 2;
            if (trackAngle >= 0) {
                trackAngle -= Math.PI * 2;
            }
            score = Math.abs(vectAngle - trackAngle);
            if (score > Math.PI) {
                score = (Math.PI * 2) - score;
            }
            if (score < minScore) {
                minScore = score;
                index = n;
            }
        }
        return vector.copy(pp.track[index]);
    }

    // Return the move vector for a pawn given the relative mouse coordinates.
    function mouseToPawn(x, y) {
        var dist = tileSpacing[0];
        var track = closestTrack(x, y);
        // Maximum endpoint along track
        track = vector.mult(track, dist);
        var magTrack2 = vector.magnitude2(track);
        
        // Projection of mouse along track line
        // track . mouse = |track| |mouse| cos(theta)
        // scalar = |mouse| cos(theta) / |track|
        var scalar = vector.dotProduct(track, [x, y]) / magTrack2;
        if (scalar < 0) {
            scalar = 0;
        }
        if (scalar < 1) {
            track = vector.mult(track, scalar);
        }
        return track;
    }

    var mousePos = [0, 0];
    var refreshTime = 50;             // ms

    // Used to animate pawn and wall piece movement during a drag operation.
    function onDrag() {
        if (!grabbing.valid) {
            return;
        }
        var vect = vector.sub(mousePos, grabbing.pos);
        var dist = Math.sqrt(vector.magnitude2(vect));
        if (grabbing.pColor === false) {
            wallSpeed = dist / boardWidth * 100;
            /*$(parts.title).html(Math.floor(wallSpeed));    //speedometer for calibrating wallSpeed limit for cancel 
            if (wallSpeed > wallSpeedLimit) {
                $(parts.title).css('color', 'red');
            } else {
                $(parts.title).css('color', '#8FAAAA');
            }*/
            vector.addTo(grabbing.pos, vector.mult(vect, 0.35));
            grabbing.wall = ptWall(grabbing.pos);
            if (grabbing.wall === false) {
                //  if the wall being dragged is in the wall bank area, flip it to vertical
                if (grabbing.pos[1] < 3.5 * tileWidth || grabbing.pos[1] > boardWidth + 3.5 * tileWidth) {
                    moveWall(grabbing.orient, 'v', grabbing.pos);
                    grabbing.orient = 'v';
                    return;
                }
                moveWall(grabbing.orient, grabbing.orient, grabbing.pos);
            } else {
                moveWall(grabbing.orient, grabbing.wall[0], grabbing.pos);
                grabbing.orient = grabbing.wall[0];
            }
            return;
        }
        grabbing.pMove = ptPawnMove(mousePos);
        /*if (grabbing.pMove.length == 2) {
            console.log(grabbing.pMove);
        }*/
        if (dist <= maxSpeed * refreshTime) {
            grabbing.pos = vector.copy(mousePos);
            dom.setPos(parts['p' + grabbing.pColor], vector.sub(vector.sub(grabbing.pos, pawnCenter), posBoard));
            return;
        }
        vector.addTo(grabbing.pos, vector.mult(vect, maxSpeed * refreshTime / dist));
        dom.setPos(parts['p' + grabbing.pColor], vector.sub(vector.sub(grabbing.pos, pawnCenter), posBoard));
    }

    function flashGrabbing() {
        grabbing = { valid: false, wall: false, wallHome: false, orient: "v",
            pMove: false, pColor: false, pos: [0, 0], offset: [] };
    }
    
    function onMouseMove(event) {
        event.preventDefault();

        if (!grabbing.valid) {
            return;
        }
        var touch = false;
        // Convert touch events to grab the event from a single "finger"
        if (event.originalEvent && event.originalEvent.touches &&
            event.originalEvent.touches.length) {
            event = event.originalEvent.touches[0];
            touch = true;
        }

        posMouse = [event.pageX, event.pageY];

        // Wall grabbing
        if (grabbing.pColor === false) {
            mousePos = posMouse;
            if (touch) {
                vector.subFrom(mousePos, [0, 60]);
            }
        }
        // Pawn grabbing
        else {
            vector.subFrom(posMouse, grabbing.offset);
            var p = pp.players[pp.currentPlayer()];
            var pawn = posPawn(p.i, p.j);
            var difference = vector.sub(posMouse, pawn);
            var k = mouseToPawn(difference[0], difference[1]);
            mousePos = vector.add(k, pawn);
        }
    }

    // Return the center of a pawn in page coordinates
    function posPawn(i, j) {
        return vector.add(posBoard, posTiles, vector.mult([i, j], tileSpacing), pawnCenter);
    }

    // Decide if we are near a pawn - set grabbing.offset if true.
    function pawnNear(posMouse) {
        if (freezeUI === true) {
            return false;
        }
        var p = pp.players[pp.currentPlayer()];
        pos = posPawn(p.i, p.j);
        var d = Math.sqrt(vector.distance2(posMouse, pos));
        if (d < 1.5 * tileWidth) {
            grabbing.offset = vector.sub(posMouse, pos);
            return true;
        }
        return false;
    }

    function onMouseDown(event)
    {
        if (freezeUI) {
            console.log("onMouseDown called when freezeUI == true");
            return;
        }
        // event.which is 0 for touch, 1 for left mouse
        if (event.which && event.which > 1) {
            return;
        }
        event.preventDefault();
        if (event.originalEvent && event.originalEvent.touches &&
            event.originalEvent.touches.length) {
            event = event.originalEvent.touches[0];
        }
        var posMouse = [event.pageX, event.pageY];
        if (pawnNear(posMouse)) {
            hovering = "p" + pp.currentPlayer();
        } else {
            hovering = ptWallHome(posMouse);
        }
        if (!hovering) {
            return;
        }
        var l = 0, t = 0, pgY;

        if (hovering[2] == "_") {
            mousePos = [event.pageX, event.pageY];
            grabbing.pos = vector.add(wallHome[hovering], wallDragV, posBoard);
            grabbing.valid = true;
            grabbing.wallHome = hovering;
            grabbing.orient = "v";
            hovering = false;
            $('#' + grabbing.wallHome).addClass('grabbing');
            return;
        }
        if (hovering[0] === "p" && parseInt(hovering[1], 10) === pp.currentPlayer()) {
            mousePos = vector.sub([event.pageX, event.pageY], grabbing.offset);
            var player = pp.players[pp.currentPlayer()];
            grabbing.pos = posPawn(player.i, player.j);
            grabbing.valid = true;
            grabbing.pColor = parseInt(hovering[1], 10);
            hovering = false;
            $('#p' + grabbing.pColor).addClass('grabbing');
        }
    }

    // currently broken with pp.history changed to {pos: n, list: [{},{},{}]} format, takes history and creates a table out of it
    function setHistory() {
        //set the table
        var move, past;
        var st = '<tr><th scope="maincol"></th><th scope="col">White</th><th scope="col">Black</th></tr>';
        var i;
        for (i = 0; i < pp.history.list.length; i++) {
            move = pp.history.list[i].move;
            if (i < pp.history.pos) {
                if (i % 2 === 0) {
                    st += '<tr><th scope="row">' + (i / 2 + 1) + '. </th><td>' + move + '</td>';
                } else {
                    st += '<td>' + move + '</td></tr>';
                }
                continue;
            }
            if (i % 2 === 0) {
                st += '<tr><th scope="past">' + (i / 2 + 1) + '.</th><td scope="past">' + move + '</td>';
            } else {
                st += '<td scope="past">' + move + '</td></tr>';
            }
        }
        $(parts.historyTable).html(st);
        $(parts.moveNum).html('Move ' + (Math.floor(pp.history.pos / 2) + 1));

        myScroll.refresh();  // possibly don't need this
        // set the graph
        var i, j;
        var lines = [[[0, 8]], [[0, 8]]];
        var pos = pp.history.pos;
        var list = pp.history.list;
        // Set the scale regardless of where in history
        for (i = 0; i < 2; i++) {
            for (j = 0; j < pp.history.list.length; j++) {
                lines[i][j + 1] = [j + 1, list[j].score[i]];
            }
        }
        var scaleOnly = true;
        historyGraph.draw(lines, scaleOnly);
        // Draw the lines for past moves
        lines = [[[0, 8]], [[0, 8]]];
        for (i = 0; i < 2; i++) {
            for (j = 0; j < pos; j++) {
                lines[i][j + 1] = [j + 1, list[j].score[i]];
            }
        }
        historyGraph.draw(lines);
        if (pp.historyCurrent()) {
            return;
        }
        // Draw the skinny lines for future moves
        if (pos > 0) {
            lines = [[], []];
        } else {
            lines = [[[0, 8]], [[0, 8]]];
        }
        for (i = 0; i < 2; i++) {
            if (pos !== 0) {
                lines[i][0] = [pos, list[pos - 1].score[i]];
            }
            for (j = 1; j < list.length - pos + 1; j++) {
                lines[i][j] = [pos + j, list[pos + j - 1].score[i]];
            }
        }
        //historyGraph.draw(lines, false, false, 'butt', 1);
        //historyGraph.draw(lines, false, ['#999', '#666'], 'butt');
        historyGraph.draw(lines, false, false, 'butt', 1);
    }

    function onMouseUp(event) {
        if (!grabbing.valid) {
            return;
        }
        var l, t, location, moveMade = false;
        l = grabbing.pos[0] - posBoard[0] - posTiles[0];
        t = grabbing.pos[1] - posBoard[1] - posTiles[1];

        if (grabbing.wallHome) {
            $('#' + grabbing.wallHome).removeClass('grabbing');
            if (grabbing.wall && wallSpeed < wallSpeedLimit) {
                placeWall(grabbing.wall, true);
                pp.move(grabbing.wall, grabbing.wallHome, false);
                moveMade = true;
            } else {
                if (grabbing.orient == "h") {
                    $("#" + grabbing.wallHome).css('width', wallPicWidth);
                    $("#" + grabbing.wallHome).css('height', wallPicLength);
                    $("#" + grabbing.wallHome).attr('src', 'images/wall.png');
                }
                var home = wallHome[grabbing.wallHome];
                $("#" + grabbing.wallHome).animate({left: home[0],
                    top: home[1]}, 500);
            }
            flashGrabbing();
        }
        if (grabbing.pColor !== false) {
            $('#p' + grabbing.pColor).removeClass('grabbing');
            if (grabbing.pMove) {
                var player = pp.players[grabbing.pColor];
                var from = pawnpwn.encode({i: player.i, j: player.j, wall: false});
                pp.move(grabbing.pMove, from, false);
                placePawn(grabbing.pMove, true);
                moveMade = true;
            } else {
                placePawn(pawnpwn.encode({i: pp.players[grabbing.pColor].i,
                    j: pp.players[grabbing.pColor].j, wall: false}), true);
            }
            var score = pp.getScore();
            freezeUI = pp.isGameOver();
            if (score[0] === 0) {
                alert("White wins!");
            } else if (score[1] === 0) {
                alert("Black wins!");
            }
            flashGrabbing();
        }
        if (moveMade) {
            setHistory();
            ns.client.checkDoc();
            if (ns.client.username != undefined) {
                ns.client.setDirty();
                ns.client.save();
            }
        }
        flashGrabbing();
    }

    function setWallHome() {
        var i, x, y;
        for (i = 0; i < 10; i++) {
            x = posTiles[0] - wallWidth + i * tileSpacing[0];
            wallHome["w0_" + i] = [x, posTiles[1] + boardWidth + wallWidth];
            wallHome["w1_" + i] = [x, 3];
        }
    }

    function init() {
        var st = '';
        $('#divBoard').html(st);
        var x, y, home;
        setWallHome();
        for (y = 0; y < 2; y++) {
            for (x = 0; x < 10; x++) {
                home = wallHome["w" + y + "_" + x];
                st += "<img class='wall'id='w" + y + "_" + x +
                    "' src='images/wall.png' alt='wall' style=' top:" +
                    home[1] + "px; left:" + home[0] + "px;'></img>";
            }
        }
        var wTop = posTiles[1] + 8 * (tileWidth + wallWidth);
        var bTop = posTiles[1];
        var pawnLeft = posTiles[0] + 4 * (tileWidth + wallWidth);
        st += "<img class='board' id='imgBoard' src='images/board.png'" +
            "alt='board'></img>";
        st += "<div class=divPawn id=p0><img id=p0pic class=pawn src='images/white.png'" +
            "alt='WhitePawn' style=' top:" + wTop + "px; left:" +
            pawnLeft + "px;'></img><div id=yourmovep0 class=yourmovep></div></div>";
        st += "<div class=divPawn id=p1><img id=p1pic class=pawn src='images/black.png'" +
            "alt='BlackPawn' style=' top:" + bTop + "px; left:" +
            pawnLeft + "px;'></img><div id=yourmovep1 class=yourmovep></div></div>";
        st += "<div id=yourmove1 class=yourmove></div><div id=yourmove0 class=yourmove></div>";
        $('#divBoard').html(st);
        parts = dom.bindIDs();
    }
    var myScroll;
    function fadeout(turn) {
        $(parts['yourmove' + turn]).animate({opacity: 0}, 700);
        $(parts['yourmovep' + turn]).animate({opacity: 0}, 700);
    }
    function fadein() {
        if (!freezeUI) {
            var turn = pp.history.pos % 2;
            $(parts['yourmove' + turn]).animate({opacity: 0.4}, 300, fadeout.fnArgs(turn));
            $(parts['yourmovep' + turn]).animate({opacity: 0.4}, 300);
        }
    }
    
    function onReady()
    {
        if (!addEventListener) {
            $('body').addClass('fail');
            $('body').html("You're using a really old browser!  Upgrade to " +
                "<a href='http://www.mozilla.com/en-US/firefox/'>Mozilla Firefox</a>, " +
                "<a href='http://www.google.com/chrome'>Google Chrome</a>, " +
                "<a href='http://windows.microsoft.com/en-us/internet-explorer/products/ie/home'>Internet Explorer 9</a>.  " +
                "Note that if you are using a version of Windows that is unable to use IE 9 (XP and below), you " +
                "should use Chrome or Firefox because Pawn Pwn will not work on IE 8 and below.");
            return;
        }
        myScroll = new iScroll('scroller');
        handleAppCache();
        pp = new pawnpwn.PawnPwnGame();
        pp.init();
        mc = new moveController.MoveController(ns, pp.history);
        init();
        //add event handlers
        $(parts.about).bind('click', function() {
            var str = '/about.html/';
            if (location.hash) {
                str += location.hash;
            }
            window.open(str);
        });
        $("#divBoard").bind('mousemove touchmove', onMouseMove);
        $(document).bind('mouseup touchend touchcancel', onMouseUp);
        $("#divBoard").bind('mousedown touchstart', onMouseDown);
        $("#back").bind('click', onBackButton);
        $("#fwd").bind('click', onFwdButton);
        $(document).bind('touchmove', function (event) {
            event.preventDefault();
        });
        $(window).bind('resize', function(){setTimeout(function(){ onResize(); }, 0)});
        
        var yourmovetimer = setInterval(fadein, 10000);
        
        /*$(window).bind('orientationchange', function (event) {
            event.preventDefault();
        });*/
        
        setInterval(onDrag, refreshTime); // constantly running, controls piece dragging
        
        ns.client = new clientLib.Client(ns);
        ns.client.addAppBar();
        $('#pfAppBarBox').css('z-index', '1002');
        $('#pfAppPanel').css('z-index', '1001');
        
        $('.sign-in').click(controlSignIn);
        onUserChange(ns.client.username);
        
        ns.client.poll();
        onResize();
        ns.client.saveInterval = 0;
        ns.client.autoLoad = true;
        
        var backgroundcolor = "#616161";//golden
        var tilecolor = "#9e9e9e";//golden
        var wallcolor = "#ffffff";//golden
        $('body').css('background-color', backgroundcolor);
        $('h1').css('color', wallcolor);
        $('#tableDiv').css('background-color', tilecolor);
    }

    function buttonControl(dir) {
        console.log(dir + ' button clicked');
        if (freezeUI && !pp.isGameOver()) {
            console.log(dir + " button clicked, but UI is frozen");
            return;
        }
        if (dir == 'back' && pp.history.pos === 0 ||
            dir == 'fwd' && pp.historyCurrent()) {
            console.log(dir + " button clicked, but history is at limit");
            return;
        }
        console.log("going " + dir + " from " + pp.history.pos);
        var newPos;
        if (dir == 'back') {
            newPos = pp.history.pos - 1;
        }
        if (dir == 'fwd') {
            newPos = pp.history.pos + 1;
        }
        freezeUI = true;
        setMovePos(newPos, true, function() {
            freezeUI = false;
            setHistory();
            ns.client.checkDoc();
            if (ns.client.username != undefined) {
                ns.client.setDirty();
                ns.client.save();
            }
        });
    }
    
    function onBackButton() {
        console.log('back button clicked');
        buttonControl('back');
    }

    function onFwdButton() {
        console.log('fwd button clicked');
        buttonControl('fwd');
    }

    // animates a given number of moves in the past.
    // Uses a timer so animations happen one at a time.
    function setMovePos(pos, animate, fnComplete)
    {
        if (grabbing.valid) {
            onMouseUp();
        }
        setHistory();
        var n, moveIndex, turn, str, wall, home, loc, player;
        if (pos == pp.history.pos) {
            if (fnComplete == undefined) {
                throw new Error("setMovePos called without an fnComplete function");
            }
            fnComplete();
            flashGrabbing();
            return;
        }
        var action, move;
        if (pos < pp.history.pos) {
            pp.changeHistoryPos(pp.history.pos - 1);
            action = pp.history.list[pp.history.pos];
            if (action.move.length === 4) {
                grabbing.wallHome = action.from;
                home = wallHome[grabbing.wallHome];
                moveWall('h', 'v');
                if (animate) {
                    $(parts[grabbing.wallHome]).animate({left: home[0], top: home[1]},
                        animateSpeed, setMovePos.fnArgs(pos, animate, fnComplete));
                } else {
                    dom.setPos(parts[grabbing.wallHome], [home[0], home[1]]);
                    setMovePos(pos, animate, fnComplete);
                    return;
                }
            }
            if (action.move.length === 2) {
                player = pp.players[pp.history.pos % 2];
                loc = vector.add(posTiles, vector.mult([player.i, player.j], tileSpacing));
                if (animate) {
                    $(parts['p' + (pp.history.pos % 2)]).animate({left: loc[0], top: loc[1]},
                        animateSpeed, setMovePos.fnArgs(pos, animate, fnComplete));
                } else {
                    dom.setPos(parts['p' + (pp.history.pos % 2)], loc);
                    setMovePos(pos, animate, fnComplete);
                    return;
                }
            }
        } else {  // go forward in history
            action = pp.history.list[pp.history.pos];
            move = pawnpwn.decode(action.move);
            pp.changeHistoryPos(pp.history.pos + 1);
            if (move.wall) {
                grabbing.wallHome = action.from;
                // home = wallHome[grabbing.wallHome];
                moveWall('v', action.move[0]);
                loc = vector.add(posTiles, vector.mult([move.i, move.j], tileSpacing));
                if (move.wall == "v") {
                    loc[0] += tileWidth;
                }
                if (move.wall == "h") {
                    loc[1] += tileWidth;
                }
                if (animate) {
                    $(parts[grabbing.wallHome]).animate({left: loc[0], top: loc[1]},
                        animateSpeed, setMovePos.fnArgs(pos, animate, fnComplete));
                } else {
                    dom.setPos(parts[grabbing.wallHome], loc);
                    setMovePos(pos, animate, fnComplete);
                    return;
                }
            }
            if (move.wall === false) {
                var p = (pp.history.pos - 1) % 2;
                player = pp.players[p];
                loc = vector.add(posTiles, vector.mult([player.i, player.j], tileSpacing));
                if (animate) {
                    $(parts['p' + p]).animate({left: loc[0], top: loc[1]},
                        animateSpeed, setMovePos.fnArgs(pos, animate, fnComplete));
                } else {
                    dom.setPos(parts['p' + p], loc);
                    setMovePos(pos, animate, fnComplete);
                    return;
                }
            }
        }
    }

    function controlSignIn() {
        if (ns.client.username == undefined) {
            ns.client.signIn(ns.client.username);
            return;
        }
        window.open('http://pageforest.com/docs/');
    }

    function onUserChange(username) {
        if (username == undefined) {
            $('#signIn').attr('src', 'images/signin30.png');
            return;
        }
        $('#signIn').attr('src', 'images/mydocs30.png');
    }
    
    function appendMoves(newHistory) {
        pp.history.list = newHistory.list;
    }

    function setDoc(json)
    {
        if (!freezeUI) {
            freezeUI = true;
            mc.merge(json.blob.game.history, function () {
                freezeUI = false;
                setHistory();
            });
        } else {
            console.log("setDoc called when UI frozen");
        }
        grabbing.wallHome = '';
    }
    // Convert your current state to JSON with blob properties.
    // These will then be saved to pageforest's storage.

    //This function is called whenever your document is be reloaded.
    function getDoc()
    {
        return {
            readers: ['public'],
            writers: ['public'],
            blob: {title: 'Pawn Pwn Game', version: 3, game: pp.getState()}
        };
    }

    ns.extend({
        'onReady': onReady,
        'getDoc': getDoc,
        'setDoc': setDoc,
        'setMovePos': setMovePos,
        'appendMoves': appendMoves,
        'grabbing': grabbing,
        'wallHome': wallHome,
        'parts': parts,
        'onResize': onResize,
        'onUserChange': onUserChange
    });
});

