var map,
    screenshotsData;

// Init
screenshotsData = localStorage.getItem('stats__screenshots');
screenshotsData = screenshotsData ? JSON.parse(screenshotsData) : [];

ymaps.ready(function(){
    map = new ymaps.Map('map', {
        center: [50.442565, 30.520585],
        zoom: 3
    });

    ymaps.modules.require(['Heatmap'], function (Heatmap) {
        var data = [];

        screenshotsData.forEach(function(item) {
            data.push([item.location.latitude, item.location.longitude]);
        });

        new Heatmap(data).setMap(map);
    });

});