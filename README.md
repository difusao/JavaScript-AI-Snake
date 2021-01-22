## AI-Snake
Famous snake game using Neural Networks and Genetic Algorithms.

## Neural Network
> Layers
- Inputs 24 (8 food sensor distances, 8 wall sensor distances, 8 tail sensor distance).
- Hidden 10.
- OutPuts (left, up, right, down)

## Developer Kit
- NodeJS v10.21.0

> Dependencies modules
```sh
"dependencies": {
    "csvtojson": "^2.0.10",
    "express": "^4.8.2",
    "gulp-cli": "^2.3.0",
    "http": "0.0.1-security",
    "nodemon": "^2.0.6",
    "socket.io": "^2.3.0",
    "synaptic": "^1.1.4"
```
```sh
"devDependencies": {
    "browser-sync": "^1.3.3",
    "gulp": "^3.8.7",
    "gulp-nodemon": "^1.0.4"
  }
```
## Setup
> In terminal
```sh
npm i
```

## Run
```sh
nodemon .\bin\server.js
```

## Show in browser
http://127.0.0.1:3000/

## Screenshot

![image1](https://github.com/difusao/AI-Snake/blob/devtools/public/images/image1.png)
