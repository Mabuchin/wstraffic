var WS_URL = 'ws://www5445uo.sakura.ne.jp:8080/ws/ifmon/'

var init_ws_Traffic = function(){
  var traffic_chart =Traffic_Chart('traffic_chart', {});
  var ws = new WebSocket(WS_URL);
  console.log('----- WebSocket Open -----')

  ws.onopen = function() {
    ws.send('hello');
  };

  ws.onerror = function(event){
    $("p#error").text('Failed join to the server');
    console.log('Connection faild....')
  };

  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);
    var timestamp = data['timestamp']*1000 + 60 * 9 * 60 * 1000;
    var value = data['traffic_in']
    document.getElementById('traffic_in').innerHTML = convert_bps(value);
    traffic_chart.series[0].addPoint([timestamp, value], true, true);
    value = data['traffic_out']
    document.getElementById('traffic_out').innerHTML = convert_bps(value);
    traffic_chart.series[1].addPoint([timestamp, value], true, true);
    ws.send('hello'); // 次のトラフィック要求
  };
  ws.onclose = function () {
    ws.send('close');
    ws.close();
  };
  window.onbeforeunload = function () {
    ws.send('close');
    ws.close()
  };

}

function convert_bps(plain_bps){
  var short_bps=plain_bps;
  if(plain_bps >= Math.pow(10,9)){
    short_bps = String(plain_bps/Math.pow(10,9)).slice(0,5) + 'G';
  }else if(plain_bps >= Math.pow(10,6)){
    short_bps = String(plain_bps/Math.pow(10,6)).slice(0,5) + 'M';
  }else if(plain_bps >= Math.pow(10,3)){
    short_bps = String(plain_bps/Math.pow(10,3)).slice(0,5) + 'k';
  }
  short_bps = short_bps + 'bps';
  return short_bps;
}

var Traffic_Chart = function(target, initial_data){
    chart = new Highcharts.Chart({
      chart: {
          renderTo: target,
          zoomType: 'xy',
          spacing: [31, 3, 30, 0]
      },
      title: {
          text: 'Traffic Monitor by websocket',
          x: -20 //center
      },
      xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: { // don't display the dummy year
              week: '%Y/%m/%d',
              month: '%Y/%m',
              year: '%Y'
          },
          labels: {step: 1, y: 30, rotation: -0,
            style: {
              fontSize: '14px'
            }
          },
      },
      yAxis: {
          title: {
              text: 'bps'
          },
          opposite: true,
          min:0,
          plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
          }],
          labels: {
            style: {
              fontSize: '14px'
            }
          }
      },
      tooltip: {
          formatter: function() {
                  return '<b>'+ this.series.name +'</b><br/>'+
                  Highcharts.dateFormat('%H:%M', this.x) +': '+ convert_bps(this.y);
          }
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 20,
        y: 0,
        borderWidth: 1,
        floating: true,
        itemStyle: {
          fontSize: '14px'
        }
      },
      series: [
        {
          name: 'in',
          type: 'area',
          data: (function() {
            var data = [], time = (new Date()).getTime() + 60 * 9 * 60 * 1000 , i;
            for (i = -59; i <= 0; i++) {
              data.push({x: time + i * 10000, y: 0});
            }
            return data;
          })()
        }
        ,
        {
          name: 'out',
          type: 'area',
          data: (function() {
            var data = [], time = (new Date()).getTime()+ 60 * 9 * 60 * 1000 , i;
            for (i = -59; i <= 0; i++) {
              data.push({x: time + i * 10000, y: 0});
            }
            return data;
          })()

        }
      ]
    });
    return chart;
};
