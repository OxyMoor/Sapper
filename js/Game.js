class Game {
    constructor (args) {
        this.el = args.el;
        this.running = true; // здесь хранится состояние игры: запущена ли она
        this.matrix = new Matrix(args.columns, args.rows, args.mines);
        this.update(); // обновляет поле
    }

    update () {
        if (!this.running) {
            return;
        }
        var gameElement = this.matrix.matrixToHtml ();
       
        this.el.innerHTML = '';
        this.el.append(gameElement);

        // нашли все ячейки
        this.el
            .querySelectorAll('img')
            .forEach(imgElement => { // и на каждую из них вешаем обработчик события
                imgElement.addEventListener('mousedown', mouseDownHandler.bind(this));
                imgElement.addEventListener('mouseup', mouseUpHandler.bind(this));
                imgElement.addEventListener('mouseleave', mouseLeaveHandler.bind(this));
        });

        if (this.matrix.isLosing) { // если произошло поражение
            var los = document.createElement('div'); // далаем блок поверх игрового поля и стилизуем его
            los.classList.add('los');
            var finalText = document.createElement('span'); // внутри блока - спан с текстом 'ВЗРЫВ!'
            finalText.innerHTML = 'ВЗРЫВ!' 
            finalText.classList.add('final-text');
            los.append(finalText);
            document.querySelector('.sapper').append(los);
            this.running = false; // останавливаем игру
            window.navigator.vibrate([100, 50, 100, 50, 100]); // виброотклик

            var clickAudioLose=new Audio; // звук взрыва
            clickAudioLose.src="http://cd.textfiles.com/mmplatinum/SOUNDS/WAV/MOREWAV2/BLAM.WAV";
            clickAudioLose.play();
        }
        if (this.matrix.isWin) { // если произошла победа - то же самое, другой текст
            this.running = false;
            var win = document.createElement('div');
            win.classList.add('win');
            var finalText = document.createElement('span');
            finalText.innerHTML = 'ПОБЕДА!'
            finalText.classList.add('final-text');
            win.append(finalText);
            document.querySelector('.sapper').append(win);
            this.running = false;
            window.navigator.vibrate([100, 50, 100, 50, 100]);

            var clickAudioWin=new Audio; // и звук - овации
            clickAudioWin.src="http://www.taur.net/~ottercomics/ottertunes/oishow/sfx/encore_b.wav";
            clickAudioWin.play(); 
        }
    }

    // вспомогательные функции для обработки кликов по ячейкам
    leftHandler (cell) { // левая кнопка
        if (cell.show || cell.flag) { // если ячейка открыта или заминирована, ничего не делать
            return;
        }
        cell.show = true; // иначе открываем ячейку
    
        this.matrix.showSpread(cell.x, cell.y);  

        window.navigator.vibrate(20);
    }
    rightHandler (cell) { // правая кнопка
        if (!cell.show) { // если ячейка закрыта, то поднимаем, то опускаем флаг
            cell.flag = !cell.flag;
        }
    }
    bothHandler (cell) { // обе кнопки
        if (!cell.show || !cell.number) { // если ячейка закрыта или пустая(в ней нет цифры)
            return;
        }
        var cells = this.matrix.getAroundCells(cell.x, cell.y); // берем окружающие ячейки
        var flags = cells.filter(x => x.flag).length; // фильтруем ячейки по наличию флага, считаем, сколько ячеек с флагом
    
        if (flags === cell.number) { // если количество флагов совпадает с числом на ячейке, то необходимо открыть их
            cells
                .filter(x => !x.flag && !x.show) // фильтруем: нет флага, ячейка закрыта
                .forEach(cell => {  // каждую такую ячейку - открываем
                    cell.show = true;
                    this.matrix.showSpread (cell.x, cell.y);
                });
        }
        else { // иначе подсвечиваем ячейки с потенциальными минами
            cells
                .filter(x => !x.flag && !x.show) // фильтруем: нет флага, ячейка закрыта
                .forEach(cell => cell.poten = true); // для каждой такой ячейки ставим свойство poten
        }
    }
}

function mouseDownHandler (event) {
    var {cell, left, right} = getInfo.call (this, event); // данной конструкцией сразу подтаскиваем из объекта те, значения, которые нам интересны: cell, left, right (иначе пришлось бы обращаться еще и к объекту)
    if (left) { // нажата левая кнопка
        cell.left = true;
    }
    if (right) { // нажата правая кнопка
        cell.right = true;
    }
    if (cell.left && cell.right) { // если левая и правая кнопки мыши нажаты, вызываем bothHandler
        this.bothHandler(cell);
    }

    this.update(); //вызываем эту функцию, чтобы обновлялись наши картиночки
}


function mouseUpHandler (event) {
    var {cell, left, right} = getInfo.call (this, event);
    // нужно убедиться, какие кнопки именно мы сейчас нажали
    var both = cell.right && cell.left && (left || right); // обе: правая и левая прожаты + отпущена левая или правая
    var leftMouse = !both && cell.left && left; // левая: не обе + левая кнопка прожата + левая отпущена
    var rightMouse = !both && cell.right && right; // правая: не обе + правая кнопка прожата + правая отпущена

    // если отпущена клавиша после того, как были нажаты обе
    if (both) {
        this.matrix.forEach(x => x.poten = false); // у всех элементов убираем свойство poten
    }

    if (left) {
        cell.left = false; // возвращаем свойство в исходное положение

        if(!cell.mine) {
            var clickAudioLeft=new Audio; // звук открытия ячейки
            clickAudioLeft.src="https://dight310.byu.edu/media/audio/FreeLoops.com/2/2/Clonk%20Electro%20Hit-20520-Free-Loops.com.mp3";
            clickAudioLeft.play(); 
        }   
    }
    if (right) {
        cell.right = false; // возвращаем свойство в исходное положение

        var clickAudioRight=new Audio; // звук установки флага 
        clickAudioRight.src="http://www.wonko.info/wOnKoBUZZ/samplesRus/tuba/tap3.wav";
        clickAudioRight.play(); 
    }
    if (leftMouse) {
        this.leftHandler (cell);
    } 
    else if (rightMouse) {
        this.rightHandler (cell); 
    }

    this.update();
}

// убирает у ячейки свойства right и left, когда мышь ушла с нее
function mouseLeaveHandler (event) {
    var {cell, left, right} = getInfo.call (this, event);
    cell.left = false;
    cell.right = false;

    this.update();
}

// возвращает объект с информацией, какая кнопка мыши нажата
function getInfo (event) {
    var element = event.target; // элемент, над которым произошло событие
    var cellId = parseInt(element.getAttribute('data-cell-id')); // берем у ячейки атрибут data-cell-id, причем он возвращается в виде строки, а нам надо число, поэтому добавляем parseInt
    return {
        left: event.which===1 || event.type === 'singleTap',
        right: event.which===3 || event.type === 'doubleTap',
        cell: this.matrix.getCellById(cellId)
    }
}

// изменяет размер поля ВИЗУАЛЬНО и количество мин в зависимости от значения ползунка
function setSize () {
    var sizeVal; // длина/ширина поля
    var minesVal; // количество мин

    document.getElementById('moreButton').addEventListener('click', moreLevel); // слушаем событие клик по кнопке "+"

    function moreLevel (event) {
        document.getElementById('fieldSize').value++; // увеличиваем значение ползунка и вызываем sizing
        sizing();
    }

    document.getElementById('lessButton').addEventListener('click', lessLevel); // слушаем событие клик по кнопке "-"

    function lessLevel (event) {
        document.getElementById('fieldSize').value--; // уменьшаем значение ползунка и вызываем sizing
        sizing();
    }

    document.getElementById('fieldSize').addEventListener('change', sizing); // у ползунка слушаем событие change

    // меняет настройки для размера поля и числа мин
    function sizing (event) {  
        sizeVal = document.getElementById('fieldSize').value; // значение ползунка

        if (sizeVal == 1) {
            fieldSize = 5;
            minesVal = 5;
        } else if (sizeVal == 2) {
            fieldSize = 10;
            minesVal = 30;
        } else if (sizeVal == 3) {
            fieldSize = 20;
            minesVal = 100;
        }
        // создаем новый объект класса Game с заданным количеством строк, столбцов и мин
        game = new Game ({
            el: document.querySelector('#app'),
            rows: fieldSize,
            columns: fieldSize, 
            mines: minesVal
        })  
    }

    sizing();
    

    // пересоздаем новый объект класса Game с заданным количеством строк, столбцов и мин по клику на кнопку "начать заново"
    document
        .getElementById('restart')
        .addEventListener('click', () => 
            game = new Game ({
                el: document.querySelector('#app'),
                rows: fieldSize,
                columns: fieldSize, 
                mines: minesVal
            })
        );
}

// функция предупреждение о потере данных при закрытии/перезагрузке страницы
window.onbeforeunload = function (EO) {
    EO=EO||window.event;
    EO.returnValue='Уже уходите? Прогресс будет потерян';
};

// АНИМАЦИИ
// нашли блок для информации об игре
var interesting = document.querySelector('.interesting-div');

// по нажатию на кнопку "об игре" берем данные из текстового файла спомощью ajax и кладем его в соответствующий блок
document.querySelector('.interesting-button').addEventListener('click', animMore);
function animMore() {
    $.ajax("http://fe.it-academy.by/Sites/0033095/project/interesting.txt",
        { type:'GET', dataType:'text', success:dataLoaded, error:errorHandler }
    );
}
function dataLoaded(data) { 
    interesting.innerHTML=data;
    requestAnimationFrame(anim);
    function anim() { // анимация разворачивания блока от высоты 0 до auto  
        interesting.style.position='absolute';
        interesting.style.height='auto';
        var targetHeight=interesting.offsetHeight;
        // возвращаем назад все установки
        interesting.style.height='0px';
        interesting.style.position='';
        // и в следующий Idle запустим анимацию
        requestAnimationFrame(function () {   
                interesting.style.height=targetHeight + 40 +"px"; 
                interesting.style.top='121px'; 
                interesting.style.visibility='visible';
                interesting.style.paddingTop='20px';
                interesting.style.paddingBottom='20px';
            });
        document.querySelector('.close').addEventListener('click', animLess);
    }
}
function errorHandler(jqXHR,statusStr,errorStr) {
    alert(statusStr+' '+errorStr);
}

requestAnimationFrame(animLess); // анимация сворачивания блока 
function animLess() {
    requestAnimationFrame(function() { 
        interesting.style.height='0px'; 
        interesting.style.visibility='hidden';
        interesting.style.paddingTop='0px';
        interesting.style.paddingBottom='0px';
    });
}

// свайп
document.addEventListener('touchstart', handleTouchStart);
document.addEventListener('touchmove', handleTouchMove);

let x1 = null;
let y1 = null;
function handleTouchStart (event) {
    const firstTouch = event.touches[0];
    x1 = firstTouch.clientX; // координата х, где началось касание
    y1 = firstTouch.clientY; // координата у, где началось касание
}
function handleTouchMove (event) {
    if (!x1 || !y1) {
        return false;
    } else {
        let x2 = event.touches[0].clientX; // координата х, где закончилось касание
        let y2 = event.touches[0].clientY; // координата у, где закончилось касание
        // расстояние, которое прошел палец по Х и У:
        let xDiff = x2-x1;
        let yDiff = y2-y1;
        if (Math.abs(xDiff)<Math.abs(yDiff) && yDiff>0) { // был свайп вниз
            animMore();
        } else if  (Math.abs(xDiff)<Math.abs(yDiff) && yDiff<0) { // был свайп вверх
            requestAnimationFrame(animLess);
        }            
    }  
    x1 = null;
    y1 = null;
}