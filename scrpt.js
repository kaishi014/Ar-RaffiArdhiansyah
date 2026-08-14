        // Game State Variables
        let currentMode = 'medium';
        let currentLevel = 1;
        let selectedCell = null;
        let noteMode = false;
        let mistakes = 0;
        let maxMistakes = 3;
        let timerInterval = null;
        let secondsElapsed = 0;
        let unlockedLevels = { easy: 1, medium: 1, hard: 1 };

        // Current Active Puzzle Data
        let boardSize = 9;
        let boxRows = 3;
        let boxCols = 3;
        let solutionBoard = [];
        let initialBoard = [];
        let currentBoard = [];
        let notesBoard = [];

        // Sample seeds generator (Generates valid puzzles)
        function generatePuzzle(mode, level) {
            boardSize = mode === 'easy' ? 6 : 9;
            boxRows = mode === 'easy' ? 2 : 3;
            boxCols = mode === 'easy' ? 3 : 3;

            let givenCount = 0;
            if (mode === 'easy') givenCount = 14;
            else if (mode === 'medium') givenCount = 30;
            else if (mode === 'hard') givenCount = 22; // Minimal clues for hard

            // Base complete layout for 6x6 or 9x9
            let sol = [];
            if (boardSize === 6) {
                const base = [
                    [1,2,3, 4,5,6],
                    [4,5,6, 1,2,3],
                    [2,3,1, 5,6,4],
                    [5,6,4, 2,3,1],
                    [3,1,2, 6,4,5],
                    [6,4,5, 3,1,2]
                ];
                sol = shiftPuzzle(base, level, 6);
            } else {
                const base = [
                    [1,2,3, 4,5,6, 7,8,9],
                    [4,5,6, 7,8,9, 1,2,3],
                    [7,8,9, 1,2,3, 4,5,6],
                    [2,3,1, 5,6,4, 8,9,7],
                    [5,6,4, 8,9,7, 2,3,1],
                    [8,9,7, 2,3,1, 5,6,4],
                    [3,1,2, 6,4,5, 9,7,8],
                    [6,4,5, 9,7,8, 3,1,2],
                    [9,7,8, 3,1,2, 6,4,5]
                ];
                sol = shiftPuzzle(base, level, 9);
            }

            // Create puzzle mask with desired sparse clues
            let init = JSON.parse(JSON.stringify(sol));
            let totalCells = boardSize * boardSize;
            let cellsToRemove = totalCells - givenCount;

            // Pseudo-random deterministic removal based on level
            let seed = level * 17;
            let indices = Array.from({length: totalCells}, (_, i) => i);
            
            // Simple shuffle with seed
            for (let i = indices.length - 1; i > 0; i--) {
                let j = Math.floor((seed = (seed * 9301 + 49297) % 233280) / 233280 * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }

            for (let i = 0; i < cellsToRemove; i++) {
                let idx = indices[i];
                let r = Math.floor(idx / boardSize);
                let c = idx % boardSize;
                init[r][c] = 0;
            }

            return { solution: sol, initial: init };
        }

        // Helper to vary puzzles per level
        function shiftPuzzle(base, offset, size) {
            let res = JSON.parse(JSON.stringify(base));
            let shift = (offset - 1) % size;
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    res[r][c] = ((base[r][c] - 1 + shift) % size) + 1;
                }
            }
            return res;
        }

        // Elements
        const boardEl = document.getElementById('board');
        const numpadEl = document.getElementById('numpad');
        const modeSelect = document.getElementById('modeSelect');
        const levelSelect = document.getElementById('levelSelect');
        const timerEl = document.getElementById('timer');
        const mistakesEl = document.getElementById('mistakes');
        const btnNote = document.getElementById('btnNote');
        const modal = document.getElementById('modal');

        // Initialize Level Dropdown
        function updateLevelDropdown() {
            levelSelect.innerHTML = '';
            for (let i = 1; i <= 20; i++) {
                let opt = document.createElement('option');
                opt.value = i;
                let isLocked = i > unlockedLevels[currentMode];
                opt.textContent = `Level ${i}` + (isLocked ? ' 🔒' : '');
                opt.disabled = isLocked;
                if (i === currentLevel) opt.selected = true;
                levelSelect.appendChild(opt);
            }
        }

        // Start Game
        function initGame() {
            const data = generatePuzzle(currentMode, currentLevel);
            solutionBoard = data.solution;
            initialBoard = data.initial;
            currentBoard = JSON.parse(JSON.stringify(initialBoard));
            notesBoard = Array.from({ length: boardSize }, () => 
                Array.from({ length: boardSize }, () => [])
            );

            mistakes = 0;
            selectedCell = null;
            updateMistakesDisplay();
            resetTimer();
            startTimer();

            // Set grid layouts
            boardEl.className = `sudoku-board grid-${boardSize}`;
            numpadEl.className = `numpad grid-${boardSize}`;

            renderBoard();
            renderNumpad();
            modal.classList.remove('show');
        }

        function renderBoard() {
            boardEl.innerHTML = '';
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.row = r;
                    cell.dataset.col = c;

                    const val = currentBoard[r][c];
                    const isGiven = initialBoard[r][c] !== 0;

                    if (isGiven) {
                        cell.classList.add('given');
                        cell.textContent = val;
                    } else if (val !== 0) {
                        cell.classList.add('user-entered');
                        cell.textContent = val;
                        if (val !== solutionBoard[r][c]) {
                            cell.classList.add('incorrect');
                        }
                    } else if (notesBoard[r][c].length > 0) {
                        const notesGrid = document.createElement('div');
                        notesGrid.className = 'notes-grid';
                        for (let n = 1; n <= boardSize; n++) {
                            const noteNum = document.createElement('div');
                            noteNum.className = 'note-num';
                            noteNum.textContent = notesBoard[r][c].includes(n) ? n : '';
                            notesGrid.appendChild(noteNum);
                        }
                        cell.appendChild(notesGrid);
                    }

                    cell.addEventListener('click', () => selectCell(r, c));
                    boardEl.appendChild(cell);
                }
            }
            highlightCells();
        }

        function renderNumpad() {
            numpadEl.innerHTML = '';
            for (let i = 1; i <= boardSize; i++) {
                const btn = document.createElement('button');
                btn.className = 'num-btn';
                btn.textContent = i;
                btn.addEventListener('click', () => handleInput(i));
                numpadEl.appendChild(btn);
            }
        }

        function selectCell(r, c) {
            selectedCell = { r, c };
            highlightCells();
        }

        function highlightCells() {
            const cells = boardEl.querySelectorAll('.cell');
            cells.forEach(cell => {
                cell.classList.remove('selected', 'highlighted', 'same-number');
                if (!selectedCell) return;

                const r = parseInt(cell.dataset.row);
                const c = parseInt(cell.dataset.col);
                const selR = selectedCell.r;
                const selC = selectedCell.c;

                // Same Box check
                const isSameBox = Math.floor(r / boxRows) === Math.floor(selR / boxRows) &&
                                 Math.floor(c / boxCols) === Math.floor(selC / boxCols);

                if (r === selR && c === selC) {
                    cell.classList.add('selected');
                } else if (r === selR || c === selC || isSameBox) {
                    cell.classList.add('highlighted');
                }

                // Highlight same numbers
                const selVal = currentBoard[selR][selC];
                if (selVal !== 0 && currentBoard[r][c] === selVal) {
                    cell.classList.add('same-number');
                }
            });
        }

        function handleInput(num) {
            if (!selectedCell) return;
            const { r, c } = selectedCell;

            // Don't modify given cells
            if (initialBoard[r][c] !== 0) return;

            if (noteMode) {
                // Toggle Note
                currentBoard[r][c] = 0; // Clear value if note mode
                const idx = notesBoard[r][c].indexOf(num);
                if (idx > -1) {
                    notesBoard[r][c].splice(idx, 1);
                } else {
                    notesBoard[r][c].push(num);
                }
            } else {
                // Value Input
                notesBoard[r][c] = []; // Clear notes
                if (currentBoard[r][c] === num) {
                    currentBoard[r][c] = 0; // Erase on re-click
                } else {
                    currentBoard[r][c] = num;
                    if (num !== solutionBoard[r][c]) {
                        mistakes++;
                        updateMistakesDisplay();
                        if (mistakes >= maxMistakes) {
                            endGame(false);
                        }
                    } else {
                        checkWin();
                    }
                }
            }
            renderBoard();
        }

        function eraseCell() {
            if (!selectedCell) return;
            const { r, c } = selectedCell;
            if (initialBoard[r][c] !== 0) return;
            currentBoard[r][c] = 0;
            notesBoard[r][c] = [];
            renderBoard();
        }

        function giveHint() {
            if (!selectedCell) return;
            const { r, c } = selectedCell;
            if (initialBoard[r][c] !== 0) return;

            currentBoard[r][c] = solutionBoard[r][c];
            notesBoard[r][c] = [];
            renderBoard();
            checkWin();
        }

        function updateMistakesDisplay() {
            let hearts = '';
            for (let i = 0; i < maxMistakes; i++) {
                hearts += i < (maxMistakes - mistakes) ? '♥' : '♡';
            }
            mistakesEl.textContent = hearts;
        }

        function checkWin() {
            for (let r = 0; r < boardSize; r++) {
                for (let c = 0; c < boardSize; c++) {
                    if (currentBoard[r][c] !== solutionBoard[r][c]) return;
                }
            }
            endGame(true);
        }

        function endGame(isWin) {
            clearInterval(timerInterval);
            const title = document.getElementById('modalTitle');
            const desc = document.getElementById('modalDesc');
            const btn = document.getElementById('btnModalAction');

            if (isWin) {
                title.textContent = "LEVEL SELESAI!";
                title.className = "modal-title win";
                desc.textContent = `Hebat! Kamu menyelesaikan level ini dalam ${timerEl.textContent}`;
                btn.textContent = "Level Berikutnya";
                
                // Unlock next level
                if (currentLevel < 20) {
                    unlockedLevels[currentMode] = Math.max(unlockedLevels[currentMode], currentLevel + 1);
                    updateLevelDropdown();
                }
            } else {
                title.textContent = "GAME OVER";
                title.className = "modal-title lose";
                desc.textContent = "Kamu sudah salah 3 kali pada level ini.";
                btn.textContent = "Coba Lagi";
            }

            modal.classList.add('show');
        }

        // Timer Functions
        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                secondsElapsed++;
                const m = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
                const s = String(secondsElapsed % 60).padStart(2, '0');
                timerEl.textContent = `${m}:${s}`;
            }, 1000);
        }

        function resetTimer() {
            clearInterval(timerInterval);
            secondsElapsed = 0;
            timerEl.textContent = "00:00";
        }

        // Event Listeners
        modeSelect.addEventListener('change', (e) => {
            currentMode = e.target.value;
            currentLevel = 1;
            updateLevelDropdown();
            initGame();
        });

        levelSelect.addEventListener('change', (e) => {
            currentLevel = parseInt(e.target.value);
            initGame();
        });

        btnNote.addEventListener('click', () => {
            noteMode = !noteMode;
            btnNote.classList.toggle('active', noteMode);
        });

        document.getElementById('btnErase').addEventListener('click', eraseCell);
        document.getElementById('btnHint').addEventListener('click', giveHint);
        document.getElementById('btnRestart').addEventListener('click', initGame);

        document.getElementById('btnModalAction').addEventListener('click', () => {
            if (document.getElementById('modalTitle').classList.contains('win') && currentLevel < 20) {
                currentLevel++;
                updateLevelDropdown();
            }
            initGame();
        });

        // Keyboard Support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= String(boardSize)) {
                handleInput(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                eraseCell();
            } else if (e.key === 'n' || e.key === 'N') {
                btnNote.click();
            } else if (selectedCell) {
                let { r, c } = selectedCell;
                if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
                if (e.key === 'ArrowDown') r = Math.min(boardSize - 1, r + 1);
                if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
                if (e.key === 'ArrowRight') c = Math.min(boardSize - 1, c + 1);
                selectCell(r, c);
            }
        });

        // Initialize On Load
        updateLevelDropdown();
        initGame();
