namespace.lookup('com.pageforest.pawnpwn.about').define(function (ns) {
    ns.onReady = onReady;

    var server = "http://pawnpwn.pageforest.com/";

    function onReady() {
        handleAppCache();
        if (!location.hash) {
            return;
        }
        $(document.body).addClass('saved');
        var href = "mailto:?subject=" + encodeURIComponent("Let's Play Pawn Pwn") +
            "&body=" + server + encodeURIComponent(location.hash);
        $('#mail-link').attr('href', href);
        var url = server + location.hash;
        $('#url-link').attr('href', url);
        $('#url-link').text(url);
    }

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

});
