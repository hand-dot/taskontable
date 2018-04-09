[![Build Status](https://travis-ci.org/hand-dot/taskontable.svg?branch=master)](https://travis-ci.org/hand-dot/taskontable)  
# Taskontable

Taskontableとは？

TaskontableはDavid AllenのGetting Things Doneを独自解釈し作成された、ワークフロー構築のためのLifeHackツールです。  
タスクをシーケンシャルにすることで生産性を向上させ一日をスムーズに進行することができます。  
タスクを直列化し、一つ一つこなしていくことで生産性を向上させることができます。  
終了時刻を常に表示し・各タスクの終了予定時刻に通知をするので高い集中力を保つことができます。  

* どこでも使える  
面倒なデータの同期は不要。  
ログインすればどこでもタスクを一元管理できます。


* 高速に入力する  
テーブルはExcelを扱うように操作が可能。  
コピペはもちろん、現在時刻入力などのショートカットにも対応しています。


* 焦点を絞る  
テーブルにタスクを追加して並び替え直列化する。  
これだけで今日やるべきことは驚くようにシンプルになります。


* 把握する  
テーブルに入力したデータでリアルタイムに終了時刻を表示します。


* アラームを追加する  
タスクの終了予定時刻に通知をします。

![Taskontable](https://user-images.githubusercontent.com/24843808/34078056-1ade29a6-e356-11e7-95c6-baec49181f12.png)


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

[`src/`](https://github.com/hand-dot/taskontable/tree/master/src) 配下に `configs`ディレクトリを作成し、
`firebase.js`を作ってfirebaseの設定情報を記入してください。

3.taskontableディレクトリ上でアプリを起動
```
$ npm run start
```
