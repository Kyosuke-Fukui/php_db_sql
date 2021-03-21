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
    <form action="upload.php" method="post" enctype="multipart/form-data">
    <fieldset>
      <legend>CSVファイルアップロード</legend>
        <input type="hidden" name="MAX_FILE_SIZE" value="200000" />
        <input type="file" name="upfile" />
        <input type="submit" value="アップロード" />
    </fieldset>
    </form>  
    <form method="post" action="select.php">
      <fieldset>
      <legend>データ選択</legend>
        <label style="margin: 10px auto 0 0 ;">テーブル名：<input type="text" name="table_name" value="EURUSD" style="width:90px"></label><br>
        <div style="margin: 10px auto 0 0 ;">
        <label>from：<input class="time" type="datetime-local" name="start_time" value="2020-12-14T09:00:00"></label>
        <label>to：<input class="time" type="datetime-local" name="end_time" value="2021-03-13T06:00:00"></label><br>
        <div>
        <input type="submit" value="グラフ表示" style="margin: 10px auto 0 0 ;">
      </fieldset>
    </form>

  </body>
</html>
