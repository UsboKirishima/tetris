import { Tetris, Piece } from "./tetris";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

Piece.sprites = Piece.generateSprites();

const tetris = new Tetris();

let last = performance.now();

function gameLoop() {
    const now = performance.now();
    const dt = now - last;
    last = now;

    tetris.update(dt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tetris.draw(ctx);
    requestAnimationFrame(gameLoop);
}

gameLoop();

window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        tetris.movePieceLeft();
    } else if (event.key === "ArrowRight") {
        tetris.movePieceRight();
    } else if (event.key === "ArrowDown") {
        tetris.hardDrop();
    } else if (event.key === "ArrowUp") {
        tetris.rotatePiece();
    }
});