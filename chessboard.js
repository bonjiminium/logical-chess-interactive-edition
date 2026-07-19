(() => {
  // Use the filled glyph shapes for both sides; CSS supplies the side's color.
  const pieces = {
    K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
  };

  function renderChessboard(element, fen, { arrows = [], highlights = [] } = {}) {
    const ranks = fen.trim().split(/\s+/)[0].split("/");
    if (ranks.length !== 8) throw new Error("FEN must contain eight ranks.");

    const board = document.createElement("div");
    board.className = "chessboard";
    board.setAttribute("role", "img");
    board.setAttribute("aria-label", `Chess position: ${fen}`);

    ranks.forEach((rank, rankIndex) => {
      let fileIndex = 0;
      for (const character of rank) {
        const count = Number(character) || 1;
        for (let i = 0; i < count; i += 1) {
          const square = document.createElement("div");
          square.className = `chessboard__square ${(rankIndex + fileIndex) % 2 ? "dark" : "light"}`;
          if (i === 0 && fileIndex === 0) square.dataset.rank = 8 - rankIndex;
          if (rankIndex === 7) square.dataset.file = "abcdefgh"[fileIndex];
          if (!Number(character)) {
            square.textContent = pieces[character];
            square.classList.add(character === character.toUpperCase() ? "chessboard__piece--white" : "chessboard__piece--black");
          }
          board.append(square);
          fileIndex += 1;
        }
      }
      if (fileIndex !== 8) throw new Error("Each FEN rank must contain eight squares.");
    });

    const squareFor = (coordinate) => {
      const file = coordinate.charCodeAt(0) - "a".charCodeAt(0);
      const rank = 8 - Number(coordinate[1]);
      return board.children[rank * 8 + file];
    };

    highlights.forEach((coordinate) => squareFor(coordinate)?.classList.add("chessboard__square--highlight"));

    if (arrows.length) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "chessboard__arrows");
      svg.setAttribute("viewBox", "0 0 8 8");
      arrows.forEach(({ from, to, color = "#ff9800", dashed = false }) => {
        squareFor(from)?.classList.add("chessboard__square--from");
        squareFor(to)?.classList.add("chessboard__square--to");
        const x1 = from.charCodeAt(0) - "a".charCodeAt(0) + 0.5;
        const y1 = 8 - Number(from[1]) + 0.5;
        const x2 = to.charCodeAt(0) - "a".charCodeAt(0) + 0.5;
        const y2 = 8 - Number(to[1]) + 0.5;
        const distance = Math.hypot(x2 - x1, y2 - y1);
        const unitX = (x2 - x1) / distance;
        const unitY = (y2 - y1) / distance;
        const shaftEndX = x2 - unitX * 0.25;
        const shaftEndY = y2 - unitY * 0.25;
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1); line.setAttribute("y1", y1);
        line.setAttribute("x2", shaftEndX); line.setAttribute("y2", shaftEndY);
        line.setAttribute("stroke", color); line.setAttribute("stroke-width", "0.11");
        line.setAttribute("stroke-linecap", "round");
        if (dashed) line.setAttribute("stroke-dasharray", "0.2 0.12");
        const head = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        const perpendicularX = -unitY * 0.16;
        const perpendicularY = unitX * 0.16;
        head.setAttribute("points", `${x2},${y2} ${shaftEndX + perpendicularX},${shaftEndY + perpendicularY} ${shaftEndX - perpendicularX},${shaftEndY - perpendicularY}`);
        head.setAttribute("fill", color);
        svg.append(line, head);
      });
      board.append(svg);
    }

    element.replaceChildren(board);
  }

  window.renderChessboard = renderChessboard;
})();
