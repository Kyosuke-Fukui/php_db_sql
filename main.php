<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="style.css?ver=??">
    <title>Market Backtester</title>
  </head>
  <body>
    <div style="display: flex">
      <div id="chart"></div>
      <div id="box">
        <div>
          短期EMA<input id="p1" type="number" value="5"></input>
          長期EMA<input id="p2" type="number" value="20"></input>
        </div>
        <div>損切利確設定<input id="sltp" type="checkbox" checked="checked"></input></div>
        <div>
          損切<input id="risk" type="number" value="0.3" step="0.1"></input>%
          利確<input id="reward" type="number" value="0.8" step="0.1"></input>%
        </div>
        <button id="backtest">バックテスト</button>
        <div id="pl"></div>      
      </div>
    </div>
    <?php session_start();?>
    <script>//phpからjsへのデータ受け渡し
      let dataname = <?php echo json_encode($_SESSION['dataname']);?>;
      let data_xarray = <?php echo json_encode($_SESSION['time']);?>;
      let data_yarray = <?php echo json_encode($_SESSION['price']);?>;
    </script>
      
    <div id="bottom">
    <form method="post" action="select.php">
      <label>テーブル名：<input type="text" name="table_name" value="EURUSD" style="width:90px"></label><br>
      <div style="margin: 5px auto 0 0 ;">
      <label>from：<input class="time1" type="datetime-local" name="start_time" value="2020-12-14T09:00:00"></label>
      <label>to：<input class="time2" type="datetime-local" name="end_time" value="2021-03-13T06:00:00"></label><br>
      </div>
      <input type="submit" value="グラフ表示" style="margin: 10px auto 0 0;">
    </form>
      <div style= "width:270px; height:50px;">
      <button id="returnbtn"  onclick="location.href='upload.php'">ファイルアップロード画面に戻る</button>
      </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js" ></script>
    <script src="app.js"></script>

  </body>
</html>