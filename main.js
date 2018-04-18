var varGroup = {
    startButton: null, // 开始按钮
    changeButton: null, // 换图按钮
    difficultyButton: null, // 难度级别按钮
    difficultyDegree: 20, // 难度级别数
    recoverButton: null, // 恢复按钮
    blank: { row: 4, col: 4 }, // 空白板块位置
    index: 0, //背景图片索引值
    time: 0, // 时间
    timer: null, // 定时器
    timeDiv: null, // 时间div元素
    stack: [], // 记录拼图板块移动的过程，作恢复用
    map: new Array(), // 把imgDiv放到map中，map是二维数组，直接存储对象，位置从0开始
    isPlaying: false, // 是否游戏中
    isRecover: false, // 是否恢复
    stepNum: 0, // 步数
    stepDiv: null, // 步数div元素
    charArr: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'],
}


window.onload = function () {
    init();
    varGroup.startButton.onclick = function () { startGame(); };
    varGroup.changeButton.onclick = function () { changeImage(); };
    varGroup.difficultyButton.onclick = function () { changeDifficulty(); };
    varGroup.recoverButton.onclick = function () { recover(); };
}

// 初始化函数：获取节点对象，更换拼图图片
function init() {
    gameDiv = document.getElementById('game-div');
    varGroup.startButton = document.getElementById('start');
    varGroup.changeButton = document.getElementById('change');
    varGroup.difficultyButton = document.getElementById('difficulty');
    varGroup.recoverButton = document.getElementById('recover');
    varGroup.timeDiv = document.getElementById('time-div');
    varGroup.stepDiv = document.getElementById('step-div');
    changeImage(); // 初始化默认从第一张图片开始
}

// 更换拼图图片函数，为拼图板块添加类名、id、value和点击事件
function changeImage() {
    if (varGroup.isRecover == true) { // 正在恢复拼图过程中不能更换图片
        return;
    }
    varGroup.stack = [];
    varGroup.isPlaying = false; //还原游戏状态
    gameDiv.innerHTML = ""; //清空拼图板块
    varGroup.blank.row = 4; //还原空白板块位置
    varGroup.blank.col = 4;
    clearInterval(varGroup.timer); //清除定时器
    varGroup.time = 0;
    varGroup.stepNum = 0;
    varGroup.timeDiv.innerHTML = "0";
    varGroup.stepDiv.innerHTML = "0";
    for (var i = 0; i < 4; ++i) //清除map的数据
        varGroup.map[i] = [];
    /*
     * 当需要添加多个dom元素时，
     * 如果先将这些元素添加到DocumentFragment中，
     * 再统一将DocumentFragment添加到页面，
     * 会减少页面渲染dom的次数，效率会明显提升。
     * 如果使用appendChid方法将原dom树中的节点添加到DocumentFragment中时，会删除原来的节点。 
     */
    var frag = document.createDocumentFragment(); //往拼图板块中加图
    if (varGroup.index >= 7) {
        varGroup.index = 0; // 只有7张图片可以换
    }
    for (var i = 0; i < 4; ++i) {
        var rowArr = [];
        for (var j = 0; j < 4; ++j) {
            var imgDiv = document.createElement('div');
            imgDiv.className = "row-" + (i + 1) + " col-" + (j + 1) + " pic" + " b" + (varGroup.index + 1); // top、left值与背景图
            imgDiv.id = "pic" + (i + 1) + "-" + (j + 1); // 背景图片位置
            imgDiv.value = varGroup.charArr[i * 4 + j];
            imgDiv.onclick = (function (i) {
                return function () {
                    move(this, getPos(this)); //添加点击函数,this指向当前imgDiv
                }
            })(i);
            rowArr[j] = imgDiv; //把imgDiv放到map中，map是二维数组，直接存储对象，位置从0开始
            frag.appendChild(imgDiv);
        }
        varGroup.map[i] = rowArr;
    }
    gameDiv.appendChild(frag);
    varGroup.index++; //背景图片翻页
}

function move(element, pos) {
    if (varGroup.isPlaying == false) { // 游戏开始后才能移动板块
        return;
    }
    if ((pos.row + 1 == varGroup.blank.row || pos.row - 1 == varGroup.blank.row) && pos.col == varGroup.blank.col) {
        // 与空白板块同列邻行
        swapClassName(element, varGroup.map[varGroup.blank.row - 1][varGroup.blank.col - 1]);
        swapPosInArr(pos, varGroup.blank);
        pushStack();
        varGroup.blank.row = pos.row; // 更新交换后空白板的位置
        varGroup.blank.col = pos.col;
        varGroup.stepNum++;
        varGroup.stepDiv.innerHTML = varGroup.stepNum;
    } else if (pos.row == varGroup.blank.row && (pos.col + 1 == varGroup.blank.col || pos.col - 1 == varGroup.blank.col)) {
        // 与空白板块同行邻列
        swapClassName(element, varGroup.map[varGroup.blank.row - 1][varGroup.blank.col - 1]);
        swapPosInArr(pos, varGroup.blank);
        pushStack();
        varGroup.blank.row = pos.row; // 更新交换后空白板的位置
        varGroup.blank.col = pos.col;
        varGroup.stepNum++;
        varGroup.stepDiv.innerHTML = varGroup.stepNum;
    } else {
        return;
    }

    if (check()) {
        alert("You Win!\nThe time you cost is : " + varGroup.time + "\nThe setps you cost is : " + varGroup.stepNum);
        varGroup.isPlaying = false;
        varGroup.time = 0;
        varGroup.stepNum = 0;
        clearInterval(varGroup.timer); //清除时间循环
    }
}

//根据ClassName获取位置，返回的位置从(1,1)开始。
function getPos(element) {
    var name = element.className;
    var row = name[name.indexOf("row-") + 4];
    var col = name[name.indexOf("col-") + 4];
    return {
        row: parseInt(row),
        col: parseInt(col)
    }
}

// 与空白板块交换类名
function swapClassName(a, b) {
    var temp = a.className;
    a.className = b.className;
    b.className = temp;
}

// 在二维数组里面交换元素与空白板块的位置
function swapPosInArr(a, b) {
    var temp = varGroup.map[a.row - 1][a.col - 1];
    varGroup.map[a.row - 1][a.col - 1] = varGroup.map[b.row - 1][b.col - 1];
    varGroup.map[b.row - 1][b.col - 1] = temp;
}

function pushStack() {
    var mapString = "";
    for (var i = 0; i < 4; ++i)
        for (var j = 0; j < 4; ++j) {
            mapString += varGroup.map[i][j].value;
        }
    var a = { row: varGroup.blank.row, col: varGroup.blank.col };
    var temp = {
        string: mapString,
        next: a, // 拼图板块移动后的位置
    };
    varGroup.stack.push(temp);
}

// 判断拼图是否完成
function check() {
    for (var i = 0; i < 4; ++i)
        for (var j = 0; j < 4; ++j) {
            if (varGroup.map[i][j].id != ("pic" + (i + 1) + "-" + (j + 1)))
                return false;
        }
    return true;
}

// 开始游戏
function startGame() {
    with (varGroup) { // with 语句用于设置代码在特定对象中的作用域。
        if (isRecover == true) { // 正在恢复拼图过程中不能再开始游戏
            return;
        }
        clearInterval(timer); //清除时间循环
        time = 0;
        stepNum = 0;
        timeDiv.innerHTML = "0";
        stepDiv.innerHTML = "0";
        recoverButton.className = "green-button button"; // 改变类名使得按钮从灰色变成绿色
        isPlaying = true; //把游戏状态改成开始
        timer = setInterval(function () {
            time++;
            timeDiv.innerHTML = time;
        }, 1000);
    }
    random();
}

//随机打乱拼图
function random() {
    with (varGroup) {
        var dirRow = [0, -1, 0, 1]; // 下 左 上 右
        var dirCol = [1, 0, -1, 0];
        for (var k = 0; k < difficultyDegree; ++k) { //执行100次有效的移动
            while (true) {
                var randomDir = Math.floor(Math.random() * 4); // 生成0-3的整数
                var NextRow = blank.row + dirRow[randomDir] - 1; //NextRow从0开始，移动的格子所在行
                var NextCol = blank.col + dirCol[randomDir] - 1; //NextCol从0开始，移动的格子所在列
                if (NextRow > 3 || NextRow < 0 || NextCol > 3 || NextCol < 0) { //如果超出格子则继续
                    continue;
                } else {
                    var target = { row: NextRow, col: NextCol }
                    // 核心代码区-----------------------------
                    var mapString = "";
                    for (var i = 0; i < 4; ++i) {
                        for (var j = 0; j < 4; ++j) {
                            mapString = mapString + map[i][j].value;
                        }
                    }
                    var a = { row: blank.row, col: blank.col };
                    var temp = {
                        string: mapString,
                        next: a, // 拼图板块移动后的位置
                    };
                    var x;
                    for (x = stack.length - 1; x >= 0; --x) {
                        if (stack[x].string == temp.string) {// 删除重复的移动记录
                            var l = stack.length - x;
                            for (var t = 0; t < l; ++t) {
                                stack.pop();
                            }
                        }
                    }
                    if (x < 0) {
                        stack.push(temp);
                    }
                    // 核心代码区-----------------------------
                    swap(target); // 在二维数组里面交换元素与空白板块的位置（包括更新空白板的位置）
                    break;
                }
            }
        }
        // 按照位置分配类名（省去了每次交换就交换类名的麻烦）
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) {
                map[i][j].className = "row-" + (i + 1) + " col-" + (j + 1) + " pic" + " b" + index;
            }
        }
    }
}

// 在二维数组里面交换元素与空白板块的位置（包括更新空白板的位置）
function swap(target) {
    var temp = varGroup.map[target.row][target.col];
    varGroup.map[target.row][target.col] = varGroup.map[varGroup.blank.row - 1][varGroup.blank.col - 1];
    varGroup.map[varGroup.blank.row - 1][varGroup.blank.col - 1] = temp;
    varGroup.blank.row = target.row + 1;
    varGroup.blank.col = target.col + 1;
}

// 更改难度级别
function changeDifficulty() {
    if (varGroup.difficultyDegree == 20) {
        varGroup.difficultyDegree = 100; //执行100次有效的移动
        varGroup.difficultyButton.innerHTML = "Difficult";
        varGroup.difficultyButton.className = "red-button button";
    } else {
        varGroup.difficultyDegree = 20; //执行20次有效的移动
        varGroup.difficultyButton.innerHTML = "Easy";
        varGroup.difficultyButton.className = "green-button button";
    }
}

// 恢复拼图
function recover() {
    with (varGroup) {
        if (isPlaying == false) { // 游戏开始后才能有恢复功能
            return;
        }
        isRecover = true;
        clearInterval(timer); //清除时间
        time = 0;
        stepNum = 0;
        timeDiv.innerHTML = "0";
        stepDiv.innerHTML = "0";
        isPlaying = false;
        var i = stack.length - 1; // 从最后一次移动位置开始恢复
        var timer2 = setInterval(function () {
            if (i < 0) { // 恢复完成
                clearInterval(timer2); // 清除定时器
                isRecover = false; // 恢复初始状态
                recoverButton.className = "gray-button button";
                return;
            }
            var element = map[stack[i].next.row - 1][stack[i].next.col - 1];
            swapClassName(element, map[blank.row - 1][blank.col - 1]);
            swapPosInArr(stack[i].next, blank);
            blank.row = stack[i].next.row;
            blank.col = stack[i].next.col;
            i--;
        }, 100);
    }
}