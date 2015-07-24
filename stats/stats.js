var moscow_map;

ymaps.ready(function(){
    moscow_map = new ymaps.Map('first_map', {
        center: [55.76, 37.64],
        zoom: 10
    });

    ymaps.modules.require(['Heatmap'], function (Heatmap) {
        var data = [[37.782551, -122.445368], [37.782745, -122.444586], [55.76, 37.64]],
            heatmap = new Heatmap(data);

        console.log('xx', heatmap);
        heatmap.setMap(moscow_map);
    });

});