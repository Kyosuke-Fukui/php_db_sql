//原データの指数平滑移動平均値を返す関数
function EMACalc(mArray, mRange) {
  var k = 2 / (mRange + 1);
  // first item is just the same as the first item in the input
  emaArray = [mArray[0]];
  // for the rest of the items, they are computed with the previous one
  for (var i = 1; i < mArray.length; i++) {
    emaArray.push(mArray[i] * k + emaArray[i - 1] * (1 - k));
  }
  return emaArray;
}

//ゴールデンクロス・デッドクロスのシグナル配列を返す関数
var GCDC = function (a, b) {
  var a_b = [];
  for (let i = 0; i < a.length; i++) {
    a_b.push(a[i] - b[i]);
  }
  var gcdc = [0];
  for (let j = 1; j < a.length; j++) {
    if (a_b[j - 1] < 0 && a_b[j] >= 0) {
      gcdc.push(1);
    } else if (a_b[j - 1] > 0 && a_b[j] <= 0) {
      gcdc.push(-1);
    } else {
      gcdc.push(0);
    }
  }
  return gcdc;
};

//分析対象のデータ群を設定する関数
var getDataSet = function (mArray) {
  var p1 = $("#p1").val();
  var p2 = $("#p2").val();
  console.log(p1);
  var rawdata = mArray;
  var ind1 = EMACalc(rawdata, p1); //ここを変えれば様々なインジケータを利用可能
  var ind2 = EMACalc(rawdata, p2);
  var sigarr = GCDC(ind1, ind2); //ここを変えれば様々な投資戦略を利用可能

  return [rawdata, ind1, ind2, sigarr];
};

//静止グラフ作成
async function getGraph_S(xArray, yArray) {
  var dataArrs = getDataSet(yArray);
  var d1 = dataArrs[0];
  var d2 = dataArrs[1];
  var d3 = dataArrs[2];

  var p1 = $("#p1").val();
  var p2 = $("#p2").val();
  var n1 = dataname;
  var n2 = `EMA(${p1})`;
  var n3 = `EMA(${p2})`;

  //期間選択の値を入力
  $(".time1").val(`${xArray[0].slice(0, 10)}T${xArray[0].slice(11)}`);
  $(".time2").val(
    `${xArray[xArray.length - 1].slice(0, 10)}T${xArray[
      xArray.length - 1
    ].slice(11)}`
  );

  var layout = {
    title: {
      text: `${n1}`,
      font: {
        size: 24,
      },
    },
    xaxis: {
      title: `from (${xArray[0]}) to (${xArray[xArray.length - 1]})`,
      type: "date",
      // rangeslider: { range: [xArray] },
    },
  };
  await Plotly.plot(
    "chart",
    [
      { x: xArray, y: d1, name: n1, line: { width: 1, color: "black" } },
      { x: xArray, y: d2, name: n2, line: { width: 1, color: "blue" } },
      { x: xArray, y: d3, name: n3, line: { width: 1, color: "red" } },
    ],
    layout
  );
}

//損益計算
var calcPL = function (xArray, yArray) {
  var sigarr = getDataSet(yArray)[3];
  var PL_tan = 0; //損益率
  var PL_fuku = 1; //損益率（幾何平均）
  var trade = 1; //トレード回数（決済時カウントのため1）
  var shokai = 1; //初回判定フラグ
  var Buy_Price = 0; //買値
  var Sell_Price = 0; //売値
  var posiflg = 0; //ポジション状態（0:ノーポジ、1:買い玉あり、2:売り玉あり）

  //グラフに表示するために設定
  var buyArr = [[], []];
  var sellArr = [[], []];
  var slArr = [[], []];
  var tpArr = [[], []];

  for (let i = 0; i < yArray.length; i++) {
    //買いシグナル点灯時
    if (sigarr[i] === 1) {
      Buy_Price = yArray[i]; //新規買い建て
      buyArr[0].push(xArray[i]); //買い建てのタイミングを配列に記録
      buyArr[1].push(Buy_Price);

      //決済（初回は売値、買値を持っていないのでスルー）
      if (shokai !== 1) {
        PL_tan += (Sell_Price - yArray[i]) / Math.abs(Sell_Price); //売り玉の損益確定
        PL_fuku *= Sell_Price / yArray[i];
        trade += 1; //決済時にトレードカウント
        posiflg = 1;
      } else {
        shokai = 0;
      }
      //売りシグナル点灯時
    } else if (sigarr[i] === -1) {
      Sell_Price = yArray[i]; //新規売り建て
      sellArr[0].push(xArray[i]); //売り建てのタイミングを配列に記録
      sellArr[1].push(Sell_Price);
      //決済
      if (shokai !== 1) {
        PL_tan += (yArray[i] - Buy_Price) / Math.abs(Buy_Price); //買い玉の損益確定
        PL_fuku *= yArray[i] / Buy_Price;
        trade += 1;
        posiflg = -1;
      } else {
        shokai = 0;
      }
    } else {
      //非シグナル時に現在価格が損切/利確ラインを超えた場合、決済（損切利確設定時のみ）
      if ($("#sltp").is(":checked")) {
        var risk = $("#risk").val() / 100;
        var reward = $("#reward").val() / 100;
        //買い建て中のとき
        if (posiflg === 1) {
          if (yArray[i] < Buy_Price * (1 - risk)) {
            PL_tan += (yArray[i] - Buy_Price) / Math.abs(Buy_Price); //買い玉の損益確定
            PL_fuku *= yArray[i] / Buy_Price;
            trade += 1;
            posiflg = 0;
            slArr[0].push(xArray[i]); //損切のタイミングを配列に記録
            slArr[1].push(yArray[i]);
          } else if (yArray[i] > Buy_Price * (1 + reward)) {
            PL_tan += (yArray[i] - Buy_Price) / Math.abs(Buy_Price); //買い玉の損益確定
            PL_fuku *= yArray[i] / Buy_Price;
            trade += 1;
            posiflg = 0;
            tpArr[0].push(xArray[i]); //利確のタイミングを配列に記録
            tpArr[1].push(yArray[i]);
          }
          //売り建て中のとき
        } else if (posiflg === -1) {
          if (yArray[i] > Sell_Price * (1 + risk)) {
            PL_tan += (Sell_Price - yArray[i]) / Math.abs(Sell_Price); //売り玉の損益確定
            PL_fuku *= Sell_Price / yArray[i];
            trade += 1;
            posiflg = 0;
            slArr[0].push(xArray[i]); //損切のタイミングを配列に記録
            slArr[1].push(yArray[i]);
          } else if (yArray[i] < Sell_Price * (1 - reward)) {
            PL_tan += (Sell_Price - yArray[i]) / Math.abs(Sell_Price); //売り玉の損益確定
            PL_fuku *= Sell_Price / yArray[i];
            trade += 1;
            posiflg = 0;
            tpArr[0].push(xArray[i]); //利確のタイミングを配列に記録
            tpArr[1].push(yArray[i]);
          }
        }
      }
    }
  }

  return [
    trade, //トレード回数
    PL_tan * 100, //総損益率（単利）
    (PL_tan / trade) * 100, //平均損益率（算術平均）
    (PL_fuku - 1) * 100, //総損益率（複利）
    (PL_fuku ** (1 / trade) - 1) * 100, //平均損益率（幾何平均）
    buyArr,
    sellArr,
    slArr,
    tpArr,
  ];
};

//検証結果出力
async function plot_PL(xArray, yArray) {
  var TR = calcPL(xArray, yArray)[0];
  var PL_tan = calcPL(xArray, yArray)[1].toFixed(2);
  var AVR_tan = calcPL(xArray, yArray)[2].toFixed(2);
  var PL_fuku = calcPL(xArray, yArray)[3].toFixed(2);
  var AVR_fuku = calcPL(xArray, yArray)[4].toFixed(2);

  $("#pl").html(`<li>トレード回数：${TR}回</li>
  <li>総損益率
    <table style="text-align:center;">
      <tr>
        <td>単利</td>
        <td>再投資利回り</td>
      </tr>   
      <tr>
        <td>${PL_tan}%</td>
        <td>${PL_fuku}%</td>
      </tr>
    </table>
  </li>
  <li>1トレードの平均損益率
    <table style="text-align:center;">
        <tr>
          <td>単利</td>
          <td>再投資利回り</td>
        </tr>   
        <tr>
          <td>${AVR_tan}%</td>
          <td>${AVR_fuku}%</td>
        </tr>
    </table>
  </li>`);

  var buyArr = calcPL(xArray, yArray)[5];
  var sellArr = calcPL(xArray, yArray)[6];
  var slArr = calcPL(xArray, yArray)[7];
  var tpArr = calcPL(xArray, yArray)[8];

  //売買のタイミングをグラフに描画
  await Plotly.plot("chart", [
    {
      x: buyArr[0],
      y: buyArr[1],
      name: "buy",
      mode: "markers",
      type: "scatter",
      line: {
        color: "red",
      },
    },
    {
      x: sellArr[0],
      y: sellArr[1],
      name: "sell",
      mode: "markers",
      type: "scatter",
      line: {
        color: "blue",
      },
    },
    {
      x: slArr[0],
      y: slArr[1],
      name: "stop loss",
      mode: "markers",
      type: "scatter",
      line: {
        color: "orange",
      },
    },
    {
      x: tpArr[0],
      y: tpArr[1],
      name: "take profit",
      mode: "markers",
      type: "scatter",
      line: {
        color: "green",
      },
    },
  ]);
}
//ページ遷移時にグラフ描画
getGraph_S(data_xarray, data_yarray);

$("#backtest").on("click", function () {
  Plotly.purge("chart");
  getGraph_S(data_xarray, data_yarray);
  plot_PL(data_xarray, data_yarray);
});
