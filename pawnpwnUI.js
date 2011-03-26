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
        // Landscape
        if (w - appbarWidth > h) {
            myScroll = new iScroll('scroller');
            $('body').removeClass('portrait');
            $('body').removeClass('mini-portrait');
            $('body').addClass('landscape');
            
            boardSize = [h, h];
            // if the screen is too small, switch to mini-landscape mode
            if (h <= 400) {
                $('body').addClass('mini-landscape');
                posBoard = [0, 0];
                infoSize = [w - boardSize[0] - 10, boardSize[1] - 10];
                dom.setPos(parts.info, [boardSize[0] + 5, 5]);
                var scale = infoSize[0] / 210;
                if (infoSize[0] > 220) {
                    scale = 1;
                } else {
                    var scale = infoSize[0] / 220;
                }
                $(parts.title).css('line-height', 30 * scale + 'px');
                $(parts.title).css('font-size', 30 * scale);
                dom.setPos(parts.tableDiv, [0, infoSize[1] / 5]);
                dom.setSize(parts.signIn, vector.mult(scale, signInSize));
                dom.setPos(parts.signIn, [infoSize[0] - 79 * scale, 0]);
                
            } else {
                $('body').removeClass('mini-landscape');
                posBoard = [5, 5];
                boardSize = vector.sub(boardSize, [10, 10]);
                infoSize = [w - boardSize[0] - 15, boardSize[1] - appbarHeight + 5];
                dom.setPos(parts.info, [boardSize[0] + 10, appbarHeight]);
                parts.historyGraph.width = infoSize[0];
                parts.historyGraph.height = infoSize[1] * .4;
                $(parts.title).css('font-size', infoSize[1] * .075);
                $(parts.title).css('line-height', infoSize[1] * .075 + 'px');
                dom.setPos(parts.tableDiv, [0, 0]);
                
                var hspace = infoSize[0] - 70;
                var vspace = (infoSize[1] * 0.1 - 35) / 2;
                if (vspace < 0) {
                    vspace = 0;
                }
                dom.setPos(parts.back, [(hspace / 6), vspace]);
                dom.setPos(parts.fwd, [(hspace * 5 / 6) + 35, vspace]);
            }
            dom.setSize(parts.info, infoSize);
            dom.setSize(parts.boardContainer, boardSize);
            dom.setPos(parts.boardContainer, posBoard);
            dom.setPos(parts.divBoard, [0, 0]);
        }
        // Portrait
        else {
            myScroll.destroy();
            $('body').addClass('portrait');
            $('body').removeClass('landscape');
            $('body').removeClass('mini-landscape');
            $(parts.title).css('font-size', '40px');
            $(parts.title).css('line-height', '40px');
            titleHeight = 50;
            dom.setPos(parts.buttons, [0, 0]);
            dom.setPos(parts.title, [0, 3]);
            var sw = w * 1.382;     // Ratio of full board width to squeezed width.
            var sh;
            //mini portrait
            if (h < 550 || w < 450) {
                sh = h - titleHeight;
                $('body').addClass('mini-portrait');
                dom.setPos(parts.info, [0, 0]);
                infoSize = [w, 50];
                dom.setPos(parts.back, [5, 10]);
                dom.setPos(parts.fwd, [5 + 30 + 5, 10]);
                dom.setPos(parts.signIn, [infoSize[0] - signInSize[0] - 5, 10]);
                dom.setSize(parts.signIn, signInSize);
            } else { // regular portrait
                sh  = h - appbarHeight - titleHeight;
                $('body').removeClass('mini-portrait');
                dom.setPos(parts.info, [0, appbarHeight]);
                infoSize = [w, 50];
                var hspace = infoSize[0] - 70;
                dom.setPos(parts.back, [(hspace / 6), 10]);
                dom.setPos(parts.fwd, [(hspace * 5 / 6) + 35, 10]);
            }
            if (sw > sh) {
                boardSize = [sh, sh];
            } else {
                boardSize = [sw, sw];
            }
            posBoard = [(w / 2) - (boardSize[0] / 2), h - boardSize[0]];
            dom.setPos(parts.divBoard, [posBoard[0], 0]);
            dom.setPos(parts.boardContainer, [0, posBoard[1]]);
            dom.setSize(parts.boardContainer, [w, boardSize[1]]);
            dom.setSize(parts.info, infoSize);
            if (w < 370) {
                $(parts.title).css('font-size', (w - 150) * 30 / 170);
            }
        }
        historyGraph = new graph.GraphLines(parts.historyGraph);
        setHistory();
        dom.setSize(parts.divBoard, boardSize);
        changeSize(boardSize[0]);
        
     // somehow this line fixes an iscroll-mini-pawnpwn-board-generation bug
     // Theory: the tableDiv should be display: none.  The bug means that it is visible.  
     // So, by checking to make sure it is display: none, the program wants to cover its own back and say, 
     // "Yup we sure are display none, we were display none the entire time!  
     // It's so silly that you even ask what our display property is, we are totally display: none. LOL!"
        $(parts.tableDiv).css('display');
    }

    // Move the board pieces to reflect a new board size.
    function changeSize(width)
    {
        var scale = width / 575;
        var n;
        posTiles[1] = 90 * scale;
        posTiles[0] = 90 * scale;
        posTiles = [posTiles[0], posTiles[1]];
        wallPicWidth = 11 * scale;
        wallPicLength = 80 * scale;
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
            dom.setSize(parts['p' + x], [pawnSize, pawnSize]);
            pawnLoc = pawnpwn.encode({i: pp.players[x].i, j: pp.players[x].j, wall: false});
            grabbing.pColor = x;
            placePawn(pawnLoc, false);
        }
        flashGrabbing();
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
        if (pp.historyCurrent()) {
            parts.fwd.disabled = true;
        } else {
            parts.fwd.disabled = false;
        }
        if (pp.history.pos > 0) {
            parts.back.disabled = false;
        } else {
            parts.back.disabled = true;
        }

        //set the table
        var move, past;
        var st = '<tr><th scope="col">Move</th><th scope="col">White</th><th scope="col">Black</th></tr>';
        var i;
        for (i = 0; i < pp.history.list.length; i++) {
            move = pp.history.list[i].move;
            if (i < pp.history.pos) {
                if (i % 2 === 0) {
                    st += '<tr><th scope="row">' + (i / 2 + 1) + '.</th><td>' + move + '</td>';
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

        myScroll.refresh();
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
                    $("#" + grabbing.wallHome).attr('src', 'images/wallgolden.png');
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
        //onResize();
        // manageScore();
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
                    "' src='images/wallgolden.png' alt='wall' style=' top:" +
                    home[1] + "px; left:" + home[0] + "px;'></img>";
            }
        }
        var wTop = posTiles[1] + 8 * (tileWidth + wallWidth);
        var bTop = posTiles[1];
        var pawnLeft = posTiles[0] + 4 * (tileWidth + wallWidth);
        st += "<img class='board' id='imgBoard' src='images/boardgolden.png'" +
            "alt='board'></img>";
        st += "<img class='pawn' id='p0' src='images/white.png'" +
            "alt='WhitePawn' style=' top:" + wTop + "px; left:" +
            pawnLeft + "px;'></img>";
        st += "<img class='pawn' id='p1' src='images/black.png'" +
            "alt='BlackPawn' style=' top:" + bTop + "px; left:" +
            pawnLeft + "px;'></img>";
        $('#divBoard').html(st);
        parts = dom.bindIDs();
    }
    var myScroll;
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
        
        historyGraph = new graph.GraphLines(parts.historyGraph);
        //add event handlers
        $('h1').bind('click', function() {
            var str = 'http://pawnpwn.pageforest.com/about.html/';
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
        //var backgroundcolor = "#444444";//current
        var tilecolor = "#9e9e9e";//golden
        //var tilecolor = "#888888";//current
        var wallcolor = "#ffffff";//golden
        //var wallcolor = "#dddddd";//current
        $('body').css('background-color', backgroundcolor);
        $('h1').css('color', wallcolor);
        $('#tableDiv').css('background-color', tilecolor);
    }

    function buttonControl(dir) {
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
        buttonControl('back');
    }

    function onFwdButton() {
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
                return;
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
            $('#signIn').attr('src', 'images/sign-in.png');
            return;
        }
        $('#signIn').attr('src', 'images/my-docs.png');
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

