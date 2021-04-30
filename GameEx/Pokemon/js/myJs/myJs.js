// M-V-C
var model = {
    // attributes
    start: false,
    pause: false,
    level: 1,
    maxTime: 222,
    time: 222,
    score: 0,
    highScores: [],
    gameBoard: [],
    TimerIntervalNumber: 0,
    previousImgId: '',
    // methods
    generateGameBoard: function (rowNum, columnNum, imgNum) {
        var imgNumLimit = Math.floor((rowNum * columnNum) / imgNum) + 1;
        var imgNumList = [];
        var points = [];

        for (let row = 0; row < rowNum + 2; row++) {
            this.gameBoard[row] = [];
            for (let col = 0; col < columnNum + 2; col++) {
                this.gameBoard[row][col] = 0;
                if (row != 0 && row != rowNum + 1 && col != 0 && col != columnNum + 1) {
                    points[row * columnNum + col - 15] = [row, col]; // 15 is columnNum + 2 (first row)
                }
            }
        }
        // console.log(points);
        while (points.length > 0) {
            var randomImgIndex = Math.floor(Math.random() * imgNum) + 1;

            while (imgNumList[randomImgIndex] > imgNumLimit) {
                randomImgIndex = Math.floor(Math.random() * imgNum) + 1;
            }

            for (let i = 0; i < 2; i++) {
                var randomPointIndex = Math.floor(Math.random() * points.length);
                var row = (points[randomPointIndex])[0];
                var col = (points[randomPointIndex])[1];
                this.gameBoard[row][col] = randomImgIndex;
                points = points.filter(point => (point[0] * columnNum + point[1] !== (row * columnNum + col)));
                // console.log('row: ' + row + ', col: ' + col + ', pointIndex: ' + randomPointIndex + ', pointsLength: ' + points.length);
            }

            imgNumList[randomImgIndex] += 1;
        }
        // console.log(this.gameBoard);
    },
    setTimer: function (time) {
        this.maxTime = time;
    },
    resetTimer: function () {
        if (this.pause === false) {
            this.time = this.time - 1;
        }
    },
    checkValue: function (point1, point2) {
        return this.previousImgId !== '' && this.gameBoard[(point1[0])][(point1[1])] === this.gameBoard[(point2[0])][(point2[1])];
    },
    checkLineX: function (x, y1, y2) {
        var minY = y1;
        var maxY = y2;
        if (y1 > y2) {
            maxY = y1;
            minY = y2;
        }
        for (let y = minY + 1; y < maxY; y++) {
            if (this.gameBoard[y][x] !== 0) {
                return false;
            }
        }

        return true;
    },
    checkLineY: function (y, x1, x2) {
        var minX = x1;
        var maxX = x2;
        if (x1 > x2) {
            maxX = x1;
            minX = x2;
        }
        for (let x = minX + 1; x < maxX; x++) {
            if (this.gameBoard[y][x] !== 0) {
                return false;
            }
        }

        return true;
    },
    checkRecX: function (point1, point2) {
        var minPoint = point1, maxPoint = point2;
        if (minPoint[1] > maxPoint[1]) {
            maxPoint = point1;
            minPoint = point2;
        }

        for (let x = minPoint[1] + 1; x <= maxPoint[1]; x++) {
            if (this.gameBoard[(minPoint[0])][x] !== 0) {
                return false;
            }

            if (this.checkLineX(x, minPoint[0], maxPoint[0]) && this.checkLineY(maxPoint[0], x, maxPoint[1])) {
                return true;
            }
        }

        return false;
    },
    checkRecY: function (point1, point2) {
        var minPoint = point1, maxPoint = point2;
        if (minPoint[0] > maxPoint[0]) {
            maxPoint = point1;
            minPoint = point2;
        }

        for (let y = minPoint[0] + 1; y <= maxPoint[0]; y++) {
            if (this.gameBoard[y][(minPoint[1])] !== 0) {
                return false;
            }

            if (this.checkLineY(y, minPoint[1], maxPoint[1]) && this.checkLineX(maxPoint[1], y, maxPoint[0])) {
                return true;
            }
        }

        return false;
    },
    checkMoreLineX: function (point1, point2, type) {
        var minPoint = point1, maxPoint = point2;
        if (minPoint[1] > maxPoint[1]) {
            maxPoint = point1;
            minPoint = point2;
        }

        var x = maxPoint[1] + type;
        var row = minPoint[0];
        var colFinish = maxPoint[1];
        if (type === -1) {
            x = minPoint[1] + type;
            row = maxPoint[0];
            colFinish = minPoint[1];
        }

        if ((this.gameBoard[row][colFinish] !== 0 || minPoint[1] === maxPoint[1]) && this.checkLineX(row, minPoint[1], maxPoint[1])) {
            while (this.gameBoard[minPoint[0]][x] === 0 && this.gameBoard[maxPoint[0]][x] === 0) {
                if (this.checkLineY(x, minPoint[0], maxPoint[0])) {
                    return true;
                }
                x++;
            }
        }
        return false;
    },
    checkMoreLineY: function (point1, point2, type) {
        var minPoint = point1, maxPoint = point2;
        if (minPoint[0] > maxPoint[0]) {
            maxPoint = point1;
            minPoint = point2;
        }

        var y = maxPoint[0] + type;
        var col = minPoint[1];
        var rowFinish = maxPoint[0];
        if (type === -1) {
            y = minPoint[0] + type;
            col = maxPoint[1];
            rowFinish = minPoint[0];
        }
        console.log('col: ' + col + ', rowFinish: ' + rowFinish);
        if ((this.gameBoard[col][rowFinish] !== 0 || minPoint[0] === maxPoint[0]) && this.checkLineY(col, minPoint[0], maxPoint[0])) {
            while (this.gameBoard[y][minPoint[1]] === 0 && this.gameBoard[y][maxPoint[1]] === 0) {
                if (this.checkLineX(y, minPoint[1], maxPoint[1])) {
                    return true;
                }
                y++;
            }
        }
        return false;
    },
    checkPath: function (point1, point2) {
        // situation 1: same y || same x
        if (this.checkLineY(point1[0], point1[1], point2[1])) {
            console.log('same y: ' + point1[0] + ', x1: ' + point1[1] + ', x2: ' + point2[1]);
            return true;
        }
        if (this.checkLineX(point1[1], point1[0], point2[0])) {
            console.log('same x: ' + point1[1] + ', y1: ' + point1[0] + ', y2: ' + point2[0]);
            return true;
        }
        // situation 2: rec
        if (this.checkRecX(point1, point2)) {
            console.log('rec y true!');
            return true;
        }
        if (this.checkRecY(point1, point2)) {
            console.log('rec y true!');
            return true;
        }
        // situation 3: more line
        if (this.checkMoreLineX(point1, point2, 1)) {
            return true;
        }
        if (this.checkMoreLineX(point1, point2, -1)) {
            return true;
        }
        if (this.checkMoreLineY(point1, point2, 1)) {
            return true;
        }
        if (this.checkMoreLineY(point1, point2, -1)) {
            return true;
        }
        return false;
    }
}

var view = {
    addGameBoard: function (gameBoard, imgPath) {
        var rowNum = gameBoard.length;
        var columnNum = gameBoard[0].length;

        for (let row = 1; row < rowNum - 1; row++) {
            for (let col = 1; col < columnNum - 1; col++) {
                var selector = "#" + row;

                switch (col) {
                    case 10:
                        selector += 'a';
                        break;
                    case 11:
                        selector += 'b';
                        break;
                    case 12:
                        selector += 'c';
                        break;
                    case 13:
                        selector += 'd';
                        break;
                    case 14:
                        selector += 'e';
                        break;
                    default:
                        selector += col;
                }

                $(selector).attr('src', imgPath + gameBoard[row][col] + '.png');
            }
        }
    },
    showGameBoard: (time) => {
        $('#gameBoard').fadeIn(time);
    },
    hideGameBoard: function (time) {
        $('#gameBoard').fadeOut(time);
    },
    displayPauseButton: function () {
        $('#startButton').text('Pause');
    },
    displayResumeButton: function () {
        $('#startButton').text('Resume');
    },
    displayLevel: function (activeLevel) {
        for (let level = 1; level < 6; level++) {
            if (level === activeLevel) {
                $('#level' + level).css('background-color', 'blue');
            } else {
                $('#level' + level).css('background-color', '');
            }
        }
    },
    showProgressBarAnimation: function () {
        $('#progressBar').addClass(' progress-bar-animated');
    },
    hideProgressBarAnimation: function () {
        $('#progressBar').removeClass(' progress-bar-animated');
    },
    setProgressBar: (time, maxTime) => {
        $('#progressBar').css('width', Math.floor(370 * (time / maxTime)) + 'px');
        $('#progressDiv').attr('title', time + 's');
    },
    resetProgressBar: () => {
        $('#progressBar').css('width', '370px');
    },
    showAlert: (message) => {
        alert(message);
    },
    hideImageById: (id) => {
        $('#' + id).hide();
    },
    setImgBorder: (imgId) => {
        $('#' + imgId).css('border', '2px solid red');
    },
    resetImgBorder: (imgId) => {
        $('#' + imgId).css('border', '1px solid pink');
    },
    resetScore: (newScore) => {
        $('#scoreButton').text(newScore);
        $('#scoreButton').attr('title', newScore);
    },
    resetStartButton: () => {
        $('#startButton').text('Start');
    }
}

var controller = {
    init: function () {
        view.displayLevel(model.level);
    },
    startTimer: () => {
        model.TimerIntervalNumber = setInterval(() => {
            model.resetTimer();
            view.setProgressBar(model.time, model.maxTime);
            controller.checkTimeOut();
            // console.log('time: ' + model.time + ', level: ' + model.level);
        }, 3000);
    },
    stopTimer: () => {
        clearInterval(model.TimerIntervalNumber);
    },
    startGame: function () {
        model.start = true;
        // model.setTimer();
        model.generateGameBoard(7, 14, 33);
        view.addGameBoard(model.gameBoard, 'img/imgs2/pieces');
        view.showGameBoard(1000);
        view.displayPauseButton();
        view.showProgressBarAnimation();
        controller.startTimer();
    },
    pauseGame: function () {
        model.pause = true;
        view.displayResumeButton();
        view.hideGameBoard(3000);
        view.hideProgressBarAnimation();
        controller.stopTimer();
    },
    resumeGame: function () {
        model.pause = false;
        view.displayPauseButton();
        view.showGameBoard(1000);
        view.showProgressBarAnimation();
        controller.startTimer();
    },
    processStartButton: function () {
        if (model.start === false) {
            controller.startGame();
        } else if (model.pause === false) {
            controller.pauseGame();
        } else {
            controller.resumeGame();
        }
    },
    showScore: function () {
        view.showAlert('Số điểm hiện tại của bạn là ' + model.score);
    },
    showTime: function () {
        view.showAlert('Thời gian còn lại là ' + model.time + ' giây');
    },
    processGamePlay: function (imgId) {
        view.setImgBorder(imgId);

        var previousPoint = convertStringPointToNumPoint(model.previousImgId);
        var currentPoint = convertStringPointToNumPoint(imgId);

        if (model.previousImgId === imgId) { // doubleClick
            // do nothing
        } else if (model.checkValue(previousPoint, currentPoint) && model.checkPath(previousPoint, currentPoint)) {
            model.gameBoard[(previousPoint[0])][(previousPoint[1])] = 0;
            model.gameBoard[(currentPoint[0])][(currentPoint[1])] = 0;
            view.hideImageById(model.previousImgId);
            view.hideImageById(imgId);
            model.previousImgId = '';
            model.score += 1;
            view.resetScore(model.score);
        } else {
            if (model.previousImgId !== '') {
                view.resetImgBorder(model.previousImgId);
            }
            model.previousImgId = imgId;
        }
    },
    checkTimeOut: function () {
        if (model.time === 0) {
            this.stopTimer();
            view.showAlert('Đã hết thời gian!\nSố điểm bạn đạt được là ' + model.score);
            this.newGame();
        }
    },
    newGame: function () {
        model.start = false;
        model.pause = false;
        model.score = 0;
        view.resetScore(model.score);
        view.resetProgressBar();
        view.resetStartButton();
        view.hideGameBoard(5000);
    },

}

// event handler
function handleStartButton() {
    controller.processStartButton();
}

function handleScoreButton() {
    controller.showScore();
}

function handleTimeBar() {
    controller.showTime();
}

function handleGameBoardImage() {
    controller.processGamePlay(this.id);
}

function handleNewGameButton() {
    controller.newGame();
}
// init
function init() {
    $('#startButton').click(handleStartButton);
    $('#scoreButton').click(handleScoreButton);
    $('#progressDiv').click(handleTimeBar);
    $('#gameBoard img').click(handleGameBoardImage);
    $('#newGame').click(handleNewGameButton);

    controller.init();
}

window.onload = init;

// helper function
function convertStringPointToNumPoint(stringPoint) {
    var row = Number.parseInt(stringPoint.charAt(0));
    var col;

    switch (stringPoint.charAt(1)) {
        case 'a':
            col = 10;
            break;
        case 'b':
            col = 11;
            break;
        case 'c':
            col = 12;
            break;
        case 'd':
            col = 13;
            break;
        case 'e':
            col = 14;
            break;
        default:
            col = Number.parseInt(stringPoint.charAt(1))
            break;
    }

    return [row, col];
}
