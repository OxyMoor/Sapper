window.onhashchange=switchToStateFromURLHash;

        var SPAState={}; // ключ - параметр, значение - название страницы

        function switchToStateFromURLHash() {
            var URLHash=window.location.hash;

            var stateJSON=decodeURIComponent(URLHash.substr(1));

            if ( stateJSON!="" )
            SPAState=JSON.parse(stateJSON); // если JSON непустой, читаем из него состояние и отображаем
            else
            SPAState={pagename:'main'}; // иначе показываем главную страницу

            switch ( SPAState.pagename ) {
            case 'main':
                document.querySelector('.innerWrap').innerHTML = `<div class="settings">
                    <label class="field-size-label">Сложность:</label>
                    <div class="settings-buttons">
                        <button class="field-size-button"id="lessButton">-</button>
                        <input type="range" class="field-size-range" name="size" id="fieldSize" value="2" min="1" max="3">
                        <button class="field-size-button" id="moreButton">+</button>    
                    </div>  
                    <button id='restart' class="restart-button">Начать заново</button> 
                    <div id="app"></div>`
                
                // сразу делаем размер поля
                setSize();
                break;
            case 'info':
                document.querySelector('.innerWrap').innerHTML = `
                    <h1>Игра "Сапер"</h1>
                    <h2>Цель игры:</h2> 
                    <p>
                       Игровое поле разделено на смежные ячейки, некоторые из которых «заминированы». 
                        Количество мин известно. Необходимо открыть все 
                        ячейки, не содержащие мины.
                    </p>
                    <h2>Правила игры:</h2>
                    <p>
                     Игрок открывает ячейки (левая кнопка мыши), стараясь не открыть ячейку с миной. 
                        Открыв ячейку с миной, он проигрывает.  
                    </p>
                    <p>
                        Если под открытой ячейкой мины нет, то в ней 
                        появляется число, показывающее, сколько ячеек, соседствующих с только что открытой, «заминировано». 
                        Используя эти числа, игрок пытается рассчитать расположение мин, однако иногда некоторые ячейки 
                        всё же приходится открывать наугад. При нажатии на ячейку с числом одновременно левой и правой 
                        кнопками мыши будут подсвечены потенциально «заминированные» ячейки вокруг данной.
                    </p>
                    <p>
                        Если под соседними ячейками тоже нет мин, то открывается некоторая «не заминированная» 
                        область до ячеек, в которых есть цифры. «Заминированные» ячейки игрок может пометить
                        флажком (поставить/снять флаг - левая кнопка мыши), 
                        чтобы случайно не открыть их.
                    </p>
                    <p>
                        Открыв все «не заминированные» ячейки, игрок выигрывает.
                    </p>
                    <p>
                    <h2>Игровое поле:</h2>
                    </p>
                    <ul class="level-list">
                        <li>Легкий вариант: 25 ячеек, 5 мин</li>
                        <li>Средний вариант: 100 ячеек, 30 мин</li>
                        <li>Сложный вариант: 400 ячеек, 100 мин</li>
                    </ul>
                    <button class="back">Вернуться к игре</button>
                `;
                console.log('info')
                // клик "вернуться к игре" - будет открыта страница с игрой
                document.querySelector('.back').addEventListener('click', switchToMain);
                break;
            }
        }

        function switchToState(newState) {
            location.hash=encodeURIComponent(JSON.stringify(newState));
        }
        function switchToMain() {
            switchToState( { pagename:'main' } );
        }
        function switchToAbout(event) { 
            event.preventDefault();
            switchToState( { pagename:'info'} );
        }
        // переключаемся в состояние, которое сейчас прописано в закладке УРЛ
        switchToStateFromURLHash();

        // клик "об игре" - будет открыта страница с правилами
        document.querySelector('.about-game-button').addEventListener('click', switchToAbout);
        