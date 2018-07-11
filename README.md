[![Build Status](https://travis-ci.org/hand-dot/taskontable.svg?branch=master)](https://travis-ci.org/hand-dot/taskontable)  
[![Greenkeeper badge](https://badges.greenkeeper.io/hand-dot/taskontable.svg)](https://greenkeeper.io/)  
![ogp](https://user-images.githubusercontent.com/24843808/42593160-ab34125e-8586-11e8-911e-99a7d084c638.png)
## Taskontable is To-Do List & Time keeper on Spreadsheet.   
[https://taskontable.com/](https://taskontable.com/)

At the moment, while considering the development of desktop version · mobile version application,  
It exposes the Web version as a beta version.

### Architecture
 * BaaS - [firebase](https://firebase.google.com/)
 * Frontend - [react](https://reactjs.org/)
 * UI - [material-ui](https://material-ui-next.com/) / [handsontable](https://handsontable.com/)

### Run App.

1.Repository clone and library download  
```
$ git clone https://github.com/hand-dot/taskontable.git
$ cd taskontable
$ npm install
```

2.Fill in the setting files  

There is a setting file in [`src/`](https://github.com/hand-dot/taskontable/tree/master/src).    
firebase.js([Firebase](https://firebase.google.com/)), ga.js([GoogleAnalytics](https://developers.google.com/analytics/)), sentry.js([Sentry](https://sentry.io/welcome/))  
Please enter account information in the above file 
Click here for other services [you see](https://github.com/hand-dot/taskontable/wiki/3.%E5%88%A9%E7%94%A8%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9)

3.Launch app on taskontable directory
```
$ npm run start
```

4.This is optional(Do not commit the configuration files).
```
$ git update-index --skip-worktree src/configs/firebase.js
$ git update-index --skip-worktree src/configs/ga.js
$ git update-index --skip-worktree src/configs/sentry.js
$ git update-index --skip-worktree src/configs/sendgrid.js
$ git update-index --skip-worktree src/configs/cloudmessaging.js
```
