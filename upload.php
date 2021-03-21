<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="style.css?ver=??">
    <title>Csv file upload</title>
  </head>
  <body>  
    <button onclick="history.back()">戻る</button>
  </body>
</html>

<?php
    set_time_limit(300); //最大待ち時間、ファイルの容量が大きい場合は増やす

    //ファイル名確認
    $file_name = $_FILES["upfile"]["name"];
    
    //ファイルの仮アップロード先
    $tmp_path = $_FILES["upfile"]["tmp_name"]; //C:\xampp\tmp\php2816.tmp
    
    //保存先のパスを設定
    $upload_path = "C:/xampp/htdocs/data/";

    //仮のアップロード場所から保存先にファイルを移動
    if (is_uploaded_file($tmp_path)) {
        if (move_uploaded_file($tmp_path,"$upload_path".$file_name)){
        // ファイルが読出可能になるようにアクセス権限を変更
            chmod("$upload_path".$file_name, 0644);
        }
        else {
            echo "ファイルの読み取りが出来ませんでした。";
        }
    }

    //csvのデータをDBに格納

    // ファイルの中身を配列で取得
    //[Date,Timestamp,Open,High,Low,Close,Volume]で1セット（1行目はヘッダー）
    if(file_get_contents("$upload_path".$file_name)== false)
    {
        header("Location: index.php");
    }else
    {
        //ファイルを変数に入れる
        $csv_file = file_get_contents("$upload_path".$file_name);

        //変数を改行毎の配列に変換
        $aryHoge = explode("\n", $csv_file);

        $aryCsv = [];
        foreach($aryHoge as $key => $value){
            if($key == 0) continue; //1行目が見出しなど、取得したくない場合
            if(!$value) continue; //空白行が含まれていたら除外
            $aryCsv[] = explode(",", $value);
        }

        //配列を整形
        $dataarr = [[],[]]; 

        foreach($aryCsv as $key => $value){         
            $dataarr[0][] = substr($aryCsv[$key][0],0,4)."-".substr($aryCsv[$key][0],4,2)."-"
            .substr($aryCsv[$key][0],-2)." ".$aryCsv[$key][1]; 
            $dataarr[1][] = (float)$aryCsv[$key][5]; //Close 
        }
           
        $table_name= substr($file_name,0,-4);

        //テーブル作成
        try {
            // DBへ接続
            $pdo = new PDO("mysql:host=localhost; dbname=market; charset=utf8",
            'root', '');
            // SQL作成
            $sql = "CREATE TABLE ".$table_name." (
            time VARCHAR(30) NOT NULL,
            price VARCHAR(30) NOT NULL
            ) ";
            // SQL実行
            $res = $pdo->prepare($sql);
            $res->execute();
        } catch(PDOException $e) {
            exit('データベースに接続できませんでした。'.$e->getMessage());
        }
        // 接続を閉じる
        $pdo = null;

        //データ挿入
        try {
            // DBへ接続
            $pdo = new PDO("mysql:host=localhost; dbname=market; charset=utf8",
            'root', '');
            // SQL作成
            for ($i = 0; $i < count($dataarr[0]); $i++){
            $sql = "INSERT INTO ".$table_name." (time, price) VALUES(:time, :price)";
            // SQL実行
            $stmt = $pdo->prepare($sql);
            $stmt ->bindValue(':time',$dataarr[0][$i]);
            $stmt ->bindValue(':price',$dataarr[1][$i]);
            $stmt->execute();
            }
            echo "アップロード完了";
        } catch(PDOException $e) {
            exit('データベースに接続できませんでした。'.$e->getMessage());
        }
        // 接続を閉じる
        $pdo = null;   
    } 
    ?>