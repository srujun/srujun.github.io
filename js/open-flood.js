(() => {
  const PALETTE = [
    { name: 'Red', hex: '#EF402C' },
    { name: 'Blue', hex: '#0387E7' },
    { name: 'Emerald', hex: '#0E9972' },
    { name: 'Yellow', hex: '#FFCE52' },
    { name: 'Plum', hex: '#8F3F71' },
    { name: 'Amber', hex: '#F7A224' },
  ];

  const SIZE = 12;

  const initGame = (root) => {
    let numColors = 6;
    let initialBoard = [];
    let board = [];
    let moves = 0;
    let autoTimer = null;

    const createRandomBoard = () =>
      Array.from({ length: SIZE }, () =>
        Array.from({ length: SIZE }, () => Math.floor(Math.random() * numColors))
      );

    const cloneBoard = (b) => b.map((row) => row.slice());

    const getFloodedCells = (b) => {
      const target = b[0][0];
      const visited = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
      const queue = [[0, 0]];
      visited[0][0] = true;
      const cells = [];

      while (queue.length > 0) {
        const [r, c] = queue.shift();
        cells.push([r, c]);
        const dirs = [
          [r + 1, c],
          [r - 1, c],
          [r, c + 1],
          [r, c - 1],
        ];
        for (const [nr, nc] of dirs) {
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !visited[nr][nc] && b[nr][nc] === target) {
            visited[nr][nc] = true;
            queue.push([nr, nc]);
          }
        }
      }
      return cells;
    };

    const applyFlood = (b, newColor) => {
      const oldColor = b[0][0];
      if (oldColor === newColor) return false;
      const flooded = getFloodedCells(b);
      for (const [r, c] of flooded) {
        b[r][c] = newColor;
      }
      return true;
    };

    const isSolved = (b) => getFloodedCells(b).length === SIZE * SIZE;

    const pickGreedyColor = (b) => {
      const current = b[0][0];
      let bestColor = -1;
      let bestCount = -1;
      for (let color = 0; color < numColors; color++) {
        if (color === current) continue;
        const test = cloneBoard(b);
        applyFlood(test, color);
        const count = getFloodedCells(test).length;
        if (count > bestCount) {
          bestCount = count;
          bestColor = color;
        }
      }
      return bestColor;
    };

    const stopAuto = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
        autoBtn.textContent = 'Simulate greedy';
      }
    };

    // Build DOM
    root.innerHTML = `
      <div class="of-header">
        <div class="of-title-group">
          <span class="of-title">Open Flood</span>
          <span class="of-stats" aria-live="polite"></span>
        </div>
        <div class="of-controls">
          <button type="button" class="of-btn of-colors-btn" title="Toggle number of colors">6 colors</button>
          <button type="button" class="of-btn of-auto-btn">Simulate greedy</button>
          <button type="button" class="of-btn of-reset-btn">Reset</button>
          <button type="button" class="of-btn of-new-btn">New board</button>
        </div>
      </div>
      <div class="of-body">
        <div class="of-board" role="grid" aria-label="Open Flood game board"></div>
        <div class="of-palette" role="group" aria-label="Choose flood color"></div>
        <div class="of-status" aria-live="polite"></div>
      </div>
    `;

    const statsEl = root.querySelector('.of-stats');
    const boardEl = root.querySelector('.of-board');
    const paletteEl = root.querySelector('.of-palette');
    const statusEl = root.querySelector('.of-status');
    const colorsBtn = root.querySelector('.of-colors-btn');
    const autoBtn = root.querySelector('.of-auto-btn');
    const resetBtn = root.querySelector('.of-reset-btn');
    const newBtn = root.querySelector('.of-new-btn');

    const cellEls = [];
    boardEl.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'of-cell';
        cell.setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}`);
        cell.addEventListener('click', () => {
          stopAuto();
          makeMove(board[r][c]);
        });
        boardEl.appendChild(cell);
        cellEls.push(cell);
      }
    }

    const renderPalette = () => {
      paletteEl.innerHTML = '';
      const current = board[0][0];
      const solved = isSolved(board);
      for (let i = 0; i < numColors; i++) {
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'of-swatch';
        if (i === current) swatch.classList.add('is-current');
        swatch.style.backgroundColor = PALETTE[i].hex;
        swatch.setAttribute('aria-label', `Flood with ${PALETTE[i].name}`);
        swatch.disabled = solved || i === current;
        swatch.addEventListener('click', () => {
          stopAuto();
          makeMove(i);
        });
        paletteEl.appendChild(swatch);
      }
    };

    const render = () => {
      const floodedCount = getFloodedCells(board).length;
      const total = SIZE * SIZE;
      const solved = floodedCount === total;

      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          cellEls[r * SIZE + c].style.backgroundColor = PALETTE[board[r][c]].hex;
        }
      }

      statsEl.textContent = `${moves} ${moves === 1 ? 'move' : 'moves'} · ${floodedCount}/${total}`;
      colorsBtn.textContent = `${numColors} colors`;
      autoBtn.disabled = solved;

      if (solved) {
        statusEl.textContent = `Solved in ${moves} ${moves === 1 ? 'move' : 'moves'}.`;
        statusEl.classList.add('is-solved');
      } else {
        statusEl.textContent = 'Pick a color below (or click any tile) to flood from the top-left.';
        statusEl.classList.remove('is-solved');
      }

      renderPalette();
    };

    const makeMove = (color) => {
      if (isSolved(board)) return;
      if (applyFlood(board, color)) {
        moves += 1;
        render();
        if (isSolved(board)) {
          stopAuto();
        }
      }
    };

    const newGame = () => {
      stopAuto();
      initialBoard = createRandomBoard();
      board = cloneBoard(initialBoard);
      moves = 0;
      render();
    };

    const resetGame = () => {
      stopAuto();
      board = cloneBoard(initialBoard);
      moves = 0;
      render();
    };

    colorsBtn.addEventListener('click', () => {
      numColors = numColors === 6 ? 4 : 6;
      newGame();
    });

    resetBtn.addEventListener('click', resetGame);
    newBtn.addEventListener('click', newGame);

    autoBtn.addEventListener('click', () => {
      if (autoTimer) {
        stopAuto();
        return;
      }
      if (isSolved(board)) return;
      autoBtn.textContent = 'Stop';
      const step = () => {
        if (isSolved(board)) {
          stopAuto();
          return;
        }
        const next = pickGreedyColor(board);
        if (next === -1) {
          stopAuto();
          return;
        }
        makeMove(next);
      };
      step();
      autoTimer = setInterval(step, 320);
    });

    newGame();
  };

  document.querySelectorAll('[data-open-flood]').forEach(initGame);
})();
