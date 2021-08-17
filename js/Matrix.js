class Matrix {
    constructor (columns, rows, mines) {
        this.columns = columns; // количество колонок
        this.rows = rows; // количество столбцов
        this.mines = mines; // количество мин

        this.matrix = []; // массив матрицы
        var idCounter = 1; // id для строки
        for (var y=0; y<rows; y++) {
            var row = []; // массив строка
            
            for (var x=0; x<columns; x++) {
                row.push({ // добавляем в массив строки свойства
                    id: idCounter++, // каждой строке даем id от 1 и далее
                    left: false, // нажата ли на ячейке левая кнопка мыши
                    right: false, // нажата ли на ячейке правая кнопка мыши
                    show: false, // открыта ли ячейка
                    flag: false, // ячейка может содержать флаг
                    mine: false, // ячейка может содержать мину
                    poten: false, // ячейка может потенциально содержать мину
                    number: 0, // ячейка может содержать число мин вокруг 
                    x: x, // координата х
                    y: y // координата у
                });
            }
            this.matrix.push(row); // добавляем строки в массив матрицы 
        }

        // цикл столько раз, сколько хотим мин
        for (var i=0; i<mines; i++) {
            var cell = this.getRandomFreeCell(); // берем сучайную ячейку
            var cells = this.getAroundCells (cell.x, cell.y); //запрашиваем окружающие ячейки
            cell.mine = true; // в случайно взятую ячейку вставляем мину
            for (var cell of cells) { 
                cell.number ++; // окружающим ячейкам увеличиваем номер
            }
        }    
    }

    // находим случайную еще свободную от мины клетку
    getRandomFreeCell () {
        var freeCells = []; // массив ячеек, где нет мин

        // цикл по всей матрице
        for (var y=0; y<this.matrix.length; y++) {
            for (var x=0; x<this.matrix[y].length; x++) {
                var cell =  this.matrix[y][x];
                if (!cell.mine) {
                    freeCells.push(cell); // если в ячейке еще нет мины, кладем ячейку в массив
                }
            }
        }

        var index = Math.floor(Math.random()*freeCells.length); // случайное число от 0 до числа=количество_свободных_ячеек
        return freeCells[index]; // возвращает ячейку по этому индексу
    }

    // возвращает ячейку по Х и У
    getCell (x, y) {
        if (!this.matrix[y] || !this.matrix[y][x]) { // если такой ячейки нет
            return false;
        }
        return this.matrix[y][x]; // возвращаем ячейку, если такая есть
    }

    // возвращает ячейки вокруг данной ячейки
    getAroundCells (x, y) {
        var cells = []; // массив всех ячеек вокруг ячейки с данным Х и У
    
        for (var dx=-1; dx<=1; dx++) { // dx и dy - отклонения по х и у соответственно
            for (var dy=-1; dy<=1; dy++) {
                if (dx===0 && dy===0) { // если отклонение невозможно, т.е. ячейка угловая, крайняя и т.п.
                    continue;
                }
                var cell = this.getCell(x+dx, y+dy); // находим ячейку по координатам
                if (cell) {
                    cells.push(cell); // и добавляем ячейку в массив, сели таковая была найдена
                }
            }
        }
        return cells; // возвращаем массив
    }

    // ищет ячейки по id
    getCellById (id) {
        for (var y=0; y<this.matrix.length; y++) {
            for (var x=0; x<this.matrix[y].length; x++) {
                var cell = this.matrix[y][x];
                if (cell.id === id) { // если id совпадает с id, который передан этой функции
                    return cell;
                }       
            }
        }
        return false;
    }

    // превращает матрицу в DOM-дерево
    matrixToHtml () {
        var gameElement = document.createElement('div'); // это будет игровое поле
        gameElement.classList.add('sapper'); 
        gameElement.oncontextmenu = () => false; //запретили вызов контекстного меню при правом клике

        for (var y=0; y<this.matrix.length; y++) {
            var rowElement = document.createElement('div'); // это будут строки
            rowElement.classList.add('row');
    
            for (var x=0; x<this.matrix[y].length; x++) {
                var cell = this.matrix[y][x]; // берем ячейку матрицы
                var imgElement = document.createElement('img'); // кладем картинку в ячейку
                imgElement.draggable = false; //запретили перетаскивание картинок
                imgElement.oncontextmenu = () => false; //запретили вызов контекстного меню при правом клике
                imgElement.setAttribute('data-cell-id', cell.id); // картинке задаем атрибут data-cell-id, чтобы при клике на ячейку понять, какой у нее id и найти ее в матрице
                imgElement.classList.add('img');

                // для адаптива
                var sizeVal = document.getElementById('fieldSize').value; // значение ползунка
                if (sizeVal == 1) {
                        rowElement.classList.add('row1');
                        imgElement.classList.add('img1');    
                } else if (sizeVal == 2) {
                        rowElement.classList.add('row2');
                        imgElement.classList.add('img2');     
                } else if (sizeVal == 3) {
                        rowElement.classList.add('row3');
                        imgElement.classList.add('img3');
                }
                rowElement.append(imgElement);
    
                // в зависимости от того, какие свойства имеет ячейка, задаем атрибут src
                if (cell.flag) {
                    imgElement.src = 'img/flag.svg'; // флаг
                    continue;
                } else if (cell.poten) {
                    imgElement.src = 'img/poten.svg'; // потенциально заминированные
                    continue;
                } else if (!cell.show) {
                    imgElement.src = 'img/none.svg'; // закрытая
                    continue;
                } else if (cell.mine) {
                    imgElement.src = 'img/mine.svg'; // мина
                    continue;
                } else if (cell.number) {
                    imgElement.src = 'img/' + cell.number + '.svg'; // число
                    continue;
                }
                imgElement.style.background = '#c0c0c0'; // пустая
            }

            gameElement.append(rowElement);   
        }    
        return gameElement; // возвращаем все поле
    }

    // вспомогательная функция для удаления свойства poten
    forEach (handler) {
        for (var y=0; y<this.matrix.length; y++) {
            for (var x=0; x<this.matrix[y].length; x++) {
                handler(this.matrix[y][x]); // эта функция принимает в качестве аргументов все элементы матрицы
            }
        }
    }

    // 
    showSpread (x, y) {
        var cell =  this.getCell (x, y); // ячейка
     
        if (cell.flag || cell.number || cell.mine) { // если это ячейка с числом или флагом или миной
            return;
        }
     
        this.forEach(x => x._marked = false); // добавляем всем элементам свойство _marked, необходимое для маркировки
     
        cell._marked = true; // маркируем текущую ячейку
        var flag = true; 
        while (flag) { // пока "поднят flag", идем по элементам матрицы 
            flag = false; // "опускаем flag"
            for (var y=0; y<this.matrix.length; y++) {
                for (var x=0; x<this.matrix[y].length; x++) { 
                    var cell = this.matrix[y][x];
                    if (!cell._marked || cell.number) { // если ячейка НЕ замаркирована или это ячейка с числом, то пропускаем и продолжаем цикл
                        continue;
                    }
     
                    var cells = this.getAroundCells (x, y); // берем окружающие ячейки
                    for (var cell of cells) {
                        if (cell._marked) {  // если ячейка уже замаркирована, то пропускаем и продолжаем цикл
                            continue;
                        }
                        if (!cell.flag && !cell.mine) { // если в ячейке нет флага или мины, то маркируем ее
                            cell._marked = true;
                            flag = true; // "поднимаем флаг"
                        }
                    }
                }
            }
        }
     
        this.forEach(x => {  
             if (x._marked) { // если у ячейки есть свойство _marked, показываем ее
                 x.show = true; 
             }
             delete x._marked; // в конце удаляем свойство _marked
         });
    }

    // проверяет, выиграл ли игрок
    get isWin () {
        var flags = []; // массив флагов
        var mines = []; // массив мин
        var closed = []; // массив закрытых ячеек

        this.forEach(cell => { // ищем ячейки со свойствами флаг, мина, не открыта - и добавляем в соответствующие массивы
            if (cell.flag) {
                flags.push(cell);
            }
            if (cell.mine) {
                mines.push(cell);
            }
            if (!cell.show) {
                closed.push(cell);
            }

        })

        if (closed.length == mines.length) { // число закрытых ячеек = числу мин - победа
            return true;
        }

        if (flags.length !== mines.length) { // число флагов НЕ = числу мин - НЕ победа
            return false;
        }

        for (var cell of mines) {
            if (!cell.flag) {  // флаги не совпадают с минами - НЕ победа
                return false;
            }
        }

        for (var y=0; y<this.matrix.length; y++) {
            for (var x=0; x<this.matrix[y].length; x++) {
                var cell = this.matrix[y][x];

                if (!cell.mine && !cell.show) { // если осталась закрытая ячейка и под ней нет мины - НЕ победа
                    return false;
                } 
            }
        }

        // иначе - победа
        return true;
    }

    // проверяет, проиграл ли игрок
    get isLosing () {
        for (var y=0; y<this.matrix.length; y++) {
            for (var x=0; x<this.matrix[y].length; x++) {
                var cell = this.matrix[y][x];

                if (cell.mine && cell.show) { // если открыли ячейку с миной - проигрыш
                    return true;
                }
            }
        }
        // иначе НЕ проигрыш
        return false;
    }
}

