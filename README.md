# Taskontable

スプレッドシート上のタスクマネージャ

 * クラウド上でタスクを管理
 * 見積・実績をリアルタイムに計算し終了時刻を見ることができる
 * エクセルと同じ感覚で効率的に入力が可能
![Taskontable](https://user-images.githubusercontent.com/24843808/33806651-c641de84-de0e-11e7-9f0f-f4047b37154b.png)

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

[`src/`](https://github.com/hand-dot/taskontable/tree/master/src) 配下に `confings`ディレクトリを作成し、
`firebase.js`を作ってfirebaseの設定情報を記入してください。

3.taskontableディレクトリ上でアプリを起動
```
$ npm run start
```
