<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="style.css?ver=??">
    <title>Data select</title>
  </head>
  <body>  
    <button onclick="history.back()">戻る</button>
  </body>
</html>

<?php

if(
    !isset($_POST["table_name"]) || $_POST["table_name"]=="" ||
    !isset($_POST["start_time"]) || $_POST["start_time"]=="" ||
    !isset($_POST["end_time"]) || $_POST["end_time"]==""
){
    echo "入力した値が不正です。";
    exit();
}

$table_name = $_POST["table_name"];
$start_time = $_POST["start_time"];
$end_time = $_POST["end_time"];

//DB接続
try {
$pdo = new PDO('mysql:dbname=market;charset=utf8;host=localhost','root','');
} catch (PDOException $e) {
  exit('データベースに接続できませんでした。'.$e->getMessage());
}

//SQL作成
$stmt = $pdo->prepare("SELECT * FROM ".$table_name." WHERE time BETWEEN :start_time AND :end_time");
$stmt ->bindValue(':start_time',$start_time);
$stmt ->bindValue(':end_time',$end_time);
$status = $stmt->execute();

//配列変換
$time=[];
$price=[];

if($status==false){
  $error = $stmt->errorInfo();
  exit("ErrorQuery:".$error[2]);
}else{
  while( $result = $stmt->fetch(PDO::FETCH_ASSOC)){
    $time[]=$result["time"];
    $price[]=(float)$result["price"];
    }   

session_start();

$_SESSION['dataname']=$table_name;
$_SESSION['time']=$time;
$_SESSION['price']=$price;

header('location: main.php');
}
?>
