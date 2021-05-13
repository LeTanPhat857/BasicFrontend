// M-V-C
var model = {
    // attributes
    start: false,
    pause: false,
    sound: true,
    level: 5,
    maxTime: 88,
    time: 88,
    score: 0,
    highScores: [],
    gameBoard: [],
    timerIntervalNumber: 0,
    previousImgId: '',
    levelIntervalNumber: 0,

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

        if (this.checkLineX(minPoint[1], minPoint[0], maxPoint[0]) && this.checkLineY(maxPoint[0], minPoint[1], maxPoint[1])) {
            return true;
        }

        for (let x = minPoint[1] + 1; x <= maxPoint[1]; x++) {
            if (this.gameBoard[(minPoint[0])][x] !== 0) {
                return false;
            }

            if (this.checkLineX(x, minPoint[0], maxPoint[0]) && this.checkLineY(maxPoint[0], x, maxPoint[1])) {
                // view.drawLineY(minPoint[0], x, minPoint[1]);
                // view.drawLineX(x, minPoint[0], maxPoint[0]);
                // view.drawLineXY(maxPoint[0], x, maxPoint[1], 'y');
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

        if (this.checkLineX(maxPoint[1], minPoint[0], maxPoint[0]) && this.checkLineY(minPoint[0], minPoint[1], maxPoint[1])) {
            return true;
        }

        for (let y = minPoint[0] + 1; y <= maxPoint[0]; y++) {
            if (this.gameBoard[y][(minPoint[1])] !== 0) {
                return false;
            }

            if (this.checkLineY(y, minPoint[1], maxPoint[1]) && this.checkLineX(maxPoint[1], y, maxPoint[0])) {
                // view.drawLineX(minPoint[1], y, minPoint[1]);
                // view.drawLineY(y, minPoint[1], maxPoint[1]);
                // view.drawLineXY(maxPoint[1], y, maxPoint[0], 'x');
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
        // console.log('row: ' + row + ', colFinish: ' + colFinish +', type: ' + type);
        // console.log('check first point: ' + (this.gameBoard[row][colFinish] !== 0));
        // console.log('check line from min point to first point: ' + this.checkLineY(row, minPoint[1], maxPoint[1]));
        // console.log('------------------------------------------------');
        if ((minPoint[1] === maxPoint[1] || this.gameBoard[row][colFinish] === 0) && this.checkLineY(row, minPoint[1], maxPoint[1])) {
            // console.log('check next min point: ' + (this.gameBoard[minPoint[0]][x] === 0));
            // console.log('check next max point: ' + (this.gameBoard[maxPoint[0]][x] === 0));
            while (0 <= x && x < this.gameBoard[0].length && this.gameBoard[minPoint[0]][x] === 0 && this.gameBoard[maxPoint[0]][x] === 0) {
                if (this.checkLineX(x, minPoint[0], maxPoint[0])) {
                    // view.drawLineX(x, minPoint[0], maxPoint[0]);
                    // view.drawLineY(minPoint[0], minPoint[1], x);
                    // view.drawLineXY(maxPoint[0], maxPoint[1], x);

                    return true;
                }
                x += type;
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
        // console.log('col: ' + col + ', rowFinish: ' + rowFinish +', type: ' + type);
        // console.log('check first point: ' + (this.gameBoard[rowFinish][col] !== 0));
        // console.log('check line from min point to first point: ' + this.checkLineX(col, minPoint[0], maxPoint[0]));
        // console.log('------------------------------------------------');
        if ((minPoint[0] === maxPoint[0] || this.gameBoard[rowFinish][col] === 0) && this.checkLineX(col, minPoint[0], maxPoint[0])) {
            // console.log('check next min point: ' + (this.gameBoard[y][minPoint[1]] === 0));
            // console.log('check next max point: ' + (this.gameBoard[y][maxPoint[1]] === 0));
            while (0 <= y && y < this.gameBoard.length && this.gameBoard[y][minPoint[1]] === 0 && this.gameBoard[y][maxPoint[1]] === 0) {
                if (this.checkLineY(y, minPoint[1], maxPoint[1])) {
                    // view.drawLineY(y, minPoint[1], maxPoint[1]);
                    // view.drawLineX(minPoint[1], minPoint[0], y);
                    // view.drawLineXY(maxPoint[1], maxPoint[0], y, 'x');

                    return true;
                }
                y += type;
            }
        }
        return false;
    },
    checkPath: function (point1, point2) {
        // situation 1: same y || same x
        if (point1[0] === point2[0] && this.checkLineY(point1[0], point1[1], point2[1])) {
            console.log('same y: ' + point1[0] + ', x1: ' + point1[1] + ', x2: ' + point2[1]);
            // view.drawLineY(point1[0], point1[1], point2[1]);
            // view.drawLineXY(point1[0], point1[1], point2[1], 'y');
            return true;
        }
        if (point1[1] === point2[1] && this.checkLineX(point1[1], point1[0], point2[0])) {
            console.log('same x: ' + point1[1] + ', y1: ' + point1[0] + ', y2: ' + point2[0]);
            // view.drawLineX(point1[1], point1[0], point2[0]);
            // view.drawLineXY(point1[1], point1[0], point2[0], 'x');
            return true;
        }
        // situation 2: rec
        if (this.checkRecX(point1, point2)) {
            console.log('rec x true!');
            return true;
        }
        if (this.checkRecY(point1, point2)) {
            console.log('rec y true!');
            return true;
        }
        // situation 3: more line
        if (this.checkMoreLineX(point1, point2, 1)) {
            console.log('more line x type = 1');
            return true;
        }
        if (this.checkMoreLineX(point1, point2, -1)) {
            console.log('more line x type = -1');
            return true;
        }
        if (this.checkMoreLineY(point1, point2, 1)) {
            console.log('more line y type = 1');
            return true;
        }
        if (this.checkMoreLineY(point1, point2, -1)) {
            console.log('more line y type = -1');
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
        $('#gameBoard').slideDown(time);
    },
    hideGameBoard: function (time) {
        $('#gameBoard').slideUp(time);
    },
    resetGameBoard: function (time) {
        $('#gameBoard').fadeOut(time);
        $('#gameBoard img').css('border', '1px solid pink');
        $('#gameBoard img').show();
    },
    changeStartButtonName: (newName) => {
        $('#startButton').text(newName);
    },
    displayLevelButton: function (activeLevel) {
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
        $('#progressDiv').attr('title', 'time');
    },
    showAlert: (modalTitle, modalBody) => {
        $('#modal .modal-title').html(modalTitle);
        $('#modal .modal-body').html(modalBody);
        $('#modal').modal('show');
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
    setScore: (newScore) => {
        $('#scoreButton').text(newScore);
        $('#scoreButton').attr('title', newScore);
    },
    resetScore: () => {
        $('#scoreButton').text('Score');
        $('#scoreButton').attr('title', 'score');
    },
    resetLevelEffect: () => {
        $('#gameBoard').removeClass('rain');
        $('#gameBoard .row').removeClass('justify-content-between').addClass('justify-content-center');
        $('#gameBoard .img').css('width', '50px');
        $('#gameBoard img').css('background-color', '');
    },
    drawLineX: function (x, y1, y2) {
        $('#d2').removeClass('d-none');
        $('#d2').css('height', 60 * Math.abs(y1 - y2) + 'px');
        $('#d2').css('width', '10px');
        $('#d2').css('top', (-40 - 60 * (7 - Math.min(y1, y2))) + 'px');
        $('#d2').css('left', (175 + 50 * x) + 'px');
        setTimeout(() => {
            $('#d2').addClass('d-none');
        }, 300);
    },
    drawLineY: function (y, x1, x2) {
        $('#d1').removeClass('d-none');
        $('#d1').css('width', (50 * Math.abs(x1 - x2) + 'px'));
        $('#d1').css('height', '10px');
        $('#d1').css('top', (-35 - 60 * (7 - y)) + 'px');
        $('#d1').css('left', (180 + 50 * Math.min(x1, x2)) + 'px');
        setTimeout(() => {
            $('#d1').addClass('d-none');
        }, 300);
    },
    drawLineXY: function (xy, yx1, yx2, type) {
        if (type === 'x') {
            $('#d3').removeClass('d-none');
            $('#d3').css('height', 60 * Math.abs(yx1 - yx2) + 'px');
            $('#d3').css('width', '10px');
            $('#d3').css('top', (-40 - 60 * (7 - Math.min(yx1, yx2))) + 'px');
            $('#d3').css('left', (175 + 50 * xy) + 'px');
            setTimeout(() => {
                $('#d3').addClass('d-none');
            }, 300);
        }

        if (type === 'y') {
            $('#d3').removeClass('d-none');
            $('#d3').css('width', (50 * Math.abs(yx1 - yx2) + 'px'));
            $('#d3').css('height', '10px');
            $('#d3').css('top', (-35 - 60 * (7 - xy)) + 'px');
            $('#d3').css('left', (180 + 50 * Math.min(yx1, yx2)) + 'px');
            setTimeout(() => {
                $('#d3').addClass('d-none');
            }, 300);
        }
    },
    changeSoundButtonName: (newName) => {
        $('#sound').text(newName)
    }
}

var controller = {
    init: function () {
        view.displayLevelButton(model.level);
    },
    startTimer: function () {
        model.timerIntervalNumber = setInterval(() => {
            model.resetTimer();
            view.setProgressBar(model.time, model.maxTime);
            this.checkTimeOut();
            this.checkWin();
            // console.log('time: ' + model.time + ', level: ' + model.level);
        }, 3000);
    },
    stopTimer: function () {
        clearInterval(model.timerIntervalNumber);
    },
    startGame: function () {
        model.start = true;
        // model.setTimer();
        model.generateGameBoard(7, 14, 33);
        view.addGameBoard(model.gameBoard, 'img/imgs2/pieces');
        view.showGameBoard(1000);
        view.changeStartButtonName('Pause');
        view.showProgressBarAnimation();
        this.startTimer();

        if (model.level !== 1) {
            this.startLevelEffect(model.level);
        }
    },
    pauseGame: function () {
        model.pause = true;
        view.changeStartButtonName('Resume');
        view.hideGameBoard(3000);
        view.hideProgressBarAnimation();
        this.stopTimer();
        this.stopLevelEffect();
    },
    resumeGame: function () {
        model.pause = false;
        view.changeStartButtonName('Pause');
        view.showGameBoard(1000);
        view.showProgressBarAnimation();
        this.startTimer();
        this.startLevelEffect(model.level);
    },
    processStartButton: function () {
        if (model.start === false) {
            this.startGame();
        } else if (model.pause === false) {
            this.pauseGame();
        } else {
            this.resumeGame();
        }
    },
    showScore: function () {
        view.showAlert('Điểm', 'Số điểm hiện tại của bạn là ' + model.score);
    },
    showTime: function () {
        view.showAlert('Thời gian', 'Thời gian còn lại là ' + model.time + ' giây');
    },
    processGamePlay: function (imgId) {
        this.playSound('click');

        view.setImgBorder(imgId);

        var previousImgId = model.previousImgId;
        var previousPoint = convertStringPointToNumPoint(previousImgId);
        var currentPoint = convertStringPointToNumPoint(imgId);

        if (model.previousImgId === imgId) { // doubleClick
            // do nothing
            this.playSound('false');
        } else if (model.checkValue(previousPoint, currentPoint) && model.checkPath(previousPoint, currentPoint)) {
            this.playSound('true');
            model.gameBoard[(previousPoint[0])][(previousPoint[1])] = 0;
            model.gameBoard[(currentPoint[0])][(currentPoint[1])] = 0;
            // setTimeout(() => {
                view.hideImageById(previousImgId);
                view.hideImageById(imgId);
            // }, 300);
            model.previousImgId = '';
            model.score += 1;
            view.setScore(model.score);
            // console.log('\n');
        } else {
            if (previousImgId !== '') {
                view.resetImgBorder(previousImgId);
            }
            model.previousImgId = imgId;
        }
    },
    checkTimeOut: function () {
        if (model.time === 0) {
            this.playSound('timeout');
            view.showAlert('Hết giờ', 'Đã hết thời gian!<br/>Số điểm bạn đạt được là ' + model.score);
            this.newGame();
        }
    },
    newGame: function () {
        this.stopTimer();
        this.stopLevelEffect();
        model.start = false;
        model.pause = false;
        model.score = 0;
        model.time = 88;
        view.resetScore();
        view.resetProgressBar();
        view.changeStartButtonName('Start');
        view.hideProgressBarAnimation();
        view.resetGameBoard(500);
    },
    imgOver: function (imgId) {
        view.setImgBorder(imgId);
    },
    imgOut: function (imgId) {
        if (imgId !== model.previousImgId) {
            view.resetImgBorder(imgId);
        }
    },
    checkWin: function () {
        if (model.score === 49) {
            this.playSound('win');
            var score = model.score + model.time * model.level;
            view.showAlert('Chúc mừng', 'Bạn đã hoàn thành lượt chơi!<br/>Thời gian còn lại là ' + model.time + ' giây!<br/>Số điểm đạt được là ' + score + ' điểm!');
            this.checkHighScores(score);
            this.newGame();
        }
    },
    showHighScores: function () {
        var highScoresNotification = '';
        for (let index = 0; index < model.highScores.length; index++) {
            highScoresNotification += model.highScores[index][0] + ' <-> ' + model.highScores[index][1] + '\n';
        }
        if (highScoresNotification === '') {
            view.showAlert('Điểm cao', 'Hoàn thành lượt chơi và ghi lại kỉ lục của bạn!');
        } else {
            view.showAlert('Điểm cao (Thời gian <-> Điểm)', highScoresNotification);
        }
    },
    checkHighScores: function (score) {
        var date = new Date();
        var dateString = date.getHours() + ':' + date.getMinutes() + '  ' + date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
        if (model.highScores.length === 0) {
            model.highScores.push([dateString, score]);
        } else {
            for (let index = 0; index < model.highScores.length; index++) {
                if (model.highScores[index][1] < score) {
                    model.highScores.splice(index, 0, [dateString, score]);
                }
            }
        }
    },
    startLevelEffect: function (level) {
        this.levelEffect(level)
        model.levelIntervalNumber = setInterval(() => {
            console.log(level);
            this.levelEffect(level);
        }, 10000);
    },
    stopLevelEffect: function () {
        window.clearInterval(model.levelIntervalNumber);
        view.resetLevelEffect();
    },
    levelEffect: function (level) {
        switch (level) {
            case 2:
                console.log('run level 2');
                $('#gameBoard').fadeTo(1000, 0.8).delay(1000).fadeTo(1000, 0.5).delay(3000).fadeTo(1000, 0.8).delay(2000).fadeTo(1000, 1);
                break;
            case 3:
                console.log('run level 3');
                $('#gameBoard').fadeTo(1000, 0.8);
                var i = 1;
                var temp = setInterval(() => {
                    console.log('run interval level 3')
                    $(('#row' + i)).fadeTo(500, 0).fadeTo(500, 1);
                    $(('#row' + (model.gameBoard.length - i - 1))).fadeTo(500, 0).fadeTo(500, 1);
                    i++;
                }, 1000);
                setTimeout(() => {
                    clearInterval(temp);
                    $('#gameBoard').fadeTo(1000, 1);
                }, 9000);
                break;
            case 4:
                console.log('run level 4');
                $(('#gameBoard .row')).hide();
                var isChanged = false;
                if (isChanged === false) {
                    $('#gameBoard .img').css('width', '60px');
                    $('#gameBoard img').css('background-color', 'lightpink');
                    for (let row = 1; row < model.gameBoard.length - 1; row++) {
                        for (let col = 1; col < model.gameBoard[0].length - 1; col++) {
                            var imgId = convertNumPointToStringPoint(row, col);
                            if (model.gameBoard[row][col] !== 0) {
                                $('#' + imgId).attr('src', 'img/imgs1/' + model.gameBoard[row][col] + '.png');
                            }
                        }
                    }
                }
                $(('#gameBoard .row')).removeClass('justify-content-center').addClass('justify-content-between').fadeIn(1000).fadeTo(1000, 0.6).delay(5000).fadeTo(1000, 1);
                break;
            case 5:
                console.log('run level 5');
                $(('#gameBoard .row')).hide();
                var isChanged = false;
                if (isChanged === false) {
                    $('#gameBoard').addClass('rain');
                    $('#gameBoard .img').css('width', '60px');
                    for (let row = 1; row < model.gameBoard.length - 1; row++) {
                        for (let col = 1; col < model.gameBoard[0].length - 1; col++) {
                            var imgId = convertNumPointToStringPoint(row, col);
                            if (model.gameBoard[row][col] !== 0) {
                                $('#' + imgId).attr('src', 'img/imgs1/' + model.gameBoard[row][col] + '.png');
                            }
                        }
                    }
                }
                $(('#gameBoard .row')).removeClass('justify-content-center').addClass('justify-content-between').fadeIn(1000).fadeTo(3000, 0.9).fadeTo(500, 0.3).fadeTo(500, 0.9).fadeTo(3000, 0.9).fadeTo(500, 0.3).fadeTo(500, 0.9);
                break;
        }
    },
    changeLevel: function (level) {
        view.showAlert('Độ khó', 'Bạn đã chọn độ khó ' + level + '<br/>Nhấn Start để chinh phục thử thách!');
        switch (level) {
            case '1':
                model.level = 1;
                break;
            case '2':
                model.level = 2;
                break;
            case '3':
                model.level = 3;
                break;
            case '4':
                model.level = 4;
                break;
            case '5': // liên tục đổi hai hệ hình, chớp tắt nền đen, xoay icon
                model.level = 5;
                break;
        }
        this.newGame();
        view.displayLevelButton(model.level);
    },
    playSound: function (soundType) {
        if (model.sound === true) {
            switch (soundType) {
                case 'click':
                    clickSound.play();
                    break;
                case 'true':
                    trueSound.play();
                    break;
                case 'false':
                    falseSound.play();
                    break;
                case 'timeout':
                    timeoutSound.play();
                    break;
                case 'win':
                    winSound.play();
                    break;
            }
        }
    },
    changeSound: function () {
        if (model.sound === true) {
            model.sound = false;
            view.changeSoundButtonName('Start sound');
        } else {
            model.sound = true;
            view.changeSoundButtonName('End sound');
        }
    }
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

function handleGameBoardImgClick() {
    controller.processGamePlay(this.id);
}

function handleNewGameButton() {
    controller.newGame();
}

function handleGameBoardImgOver() {
    controller.imgOver(this.id);
}

function handleGameBoardImgOut() {
    controller.imgOut(this.id);
}

function handleHighScoreButton() {
    controller.showHighScores();
}

function handleLevelButton() {
    controller.changeLevel(this.value);
}

function handleSoundButton() {
    controller.changeSound();
}

// init
function init() {
    $('#startButton').click(handleStartButton);
    $('#scoreButton').click(handleScoreButton);
    $('#progressDiv').click(handleTimeBar);
    $('#gameBoard img').click(handleGameBoardImgClick);
    $('#gameBoard img').mouseover(handleGameBoardImgOver);
    $('#gameBoard img').mouseout(handleGameBoardImgOut);
    $('#newGame').click(handleNewGameButton);
    $('#highScores').click(handleHighScoreButton);
    $('#levels ul button').click(handleLevelButton);
    $('#sound').click(handleSoundButton);

    controller.init();
}

window.onload = init;

// audio files
const clickSound = new Audio('./sound/Pikaaaa.mp3');
const trueSound = new Audio('./sound/PikachuSoundEffect.mp3');
const falseSound = new Audio('./sound/PikaScream.mp3');
const timeoutSound = new Audio('./sound/PikaPikapikaPikachuu.mp3');
const winSound = new Audio('./sound/TaDa-SoundBible.com.mp3');

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

function convertNumPointToStringPoint(row, col) {
    switch (col) {
        case 10:
            col = 'a';
            break;
        case 11:
            col = 'b';
            break;
        case 12:
            col = 'c';
            break;
        case 13:
            col = 'd';
            break;
        case 14:
            col = 'e';
            break;
    }

    return row + '' + col;
}
