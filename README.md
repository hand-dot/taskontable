[![Build Status](https://travis-ci.org/hand-dot/taskontable.svg?branch=master)](https://travis-ci.org/hand-dot/taskontable)  
![head](https://user-images.githubusercontent.com/24843808/38695957-c07a2db0-3ec8-11e8-88b0-ce060cfdf5ef.png)  

## Problem  

### ”開発者のタスク・時間管理による心理的な負担”  

* 働き方が多様・複雑化しタスクとタイムボックスの管理に心理的な負担を感じている。
* タスクを管理する非生産的な作業が一定発生している。  
  
この問題を解決するために開発されたアプリです。  
  
## Solution  

### ”最も速くワークフローを構築できるライフハックツール”  

* 今日のタスクが自動的に構築され、タイムボックスを管理。
* 既存の運用はそのままに、クリエイティブに集中できるから生産性を高められる。
  
## Product  

### エクセルライクなシンプルなUI 
![1](https://user-images.githubusercontent.com/24843808/38694790-8a48efcc-3ec5-11e8-9f2c-91e281aed644.png)
  
### プラグイン&カスタムスクリプト 
![2](https://user-images.githubusercontent.com/24843808/38694789-8a224908-3ec5-11e8-918e-bae981e328f9.png)  

### コラボレーション(開発予定)  
  チームや仲間と1つのワークシートを共有することができます。
  
### グラフレポート(開発予定)  
  振り返りをさまざまなグラフで分析することができます。  
   
   
   ------------------------------------
現時点ではデスクトップ版・モバイル版アプリの開発を視野に入れつつ、
ベータ版としてWeb版を公開しながら要件定義・開発を行っています。

技術要素
 * バックエンド - [firebase](https://firebase.google.com/)
 * フロントエンド - [react](https://reactjs.org/)
 * UI - [material-ui](https://material-ui-next.com/) / [handsontable](https://handsontable.com/)

### アプリ起動

1.レポジトリのクローンとライブラリのダウンロード
```
$ git clone https://github.com/hand-dot/taskontable.git
$ cd taskontable
$ npm install
```

2.設定ファイルの作成と記入

[`src/`](https://github.com/hand-dot/taskontable/tree/master/src) 配下に `configs`ディレクトリがあります。  
このディレクトリに存在する firebase.js([Firebase](https://firebase.google.com/)), ga.js([GoogleAnalytics](https://developers.google.com/analytics/)), sentry.js([Sentry](https://sentry.io/welcome/))のアカウント情報を記入してください。  
その他の利用しているサービスについては[こちら](https://github.com/hand-dot/taskontable/wiki/3.%E5%88%A9%E7%94%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9)を参照してください。

3.taskontableディレクトリ上でアプリを起動
```
$ npm run start
```
