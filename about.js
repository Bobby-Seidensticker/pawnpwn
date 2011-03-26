
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
            game = location.hash.slice(1);
            str = '<p>To start playing, send them an <a href="mailto:?subject=Let\'s%20Play%20Pawn%20Pwn&body=http://pawnpwn.pageforest.com/%23' + game + 
                '">email</a>.  Or get them this link another way:</p>';
            $('#linkh').html('http://pawnpwn.pageforest.com/#' + game);
        } else {
            str = '<p>After you log in and create a game, this sentence will be' +
                ' a handy mailto link as well as the address itself, in case you\'re in fullscreen mode.  This is what the link to your game will look like: </p>';
            $('#linkh').html('http://pawnpwn.pageforest.com/#yourusername-1234/');
        }
        $('#linkp').html(str);
        $(window).bind('resize', function(){setTimeout(function(){ onResize(); }, 0)});
        onResize();
    }
    
    ns.extend({
        'onReady': onReady
    });
});
