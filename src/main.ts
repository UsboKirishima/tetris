import { Asset, SpriteData } from 'kaplay';
import 'kaplay/global';


class Tetris {
    private grid: number[][];
    private activePiece: Piece;
    private nextPiece: Piece;
    private score: number = 0;

    constructor() {
        this.grid = Array.from({ length: 20 }, () => Array(10).fill(0));
    }

    update(dt: number) {
        if (this.activePiece.canMoveDown(this.grid)) {
            this.activePiece.moveDown();
        } else {
            this.placePiece();
            this.clearLines();
            this.spawnPiece();
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.drawGrid(ctx);
        this.activePiece.draw(ctx);
    }

    private placePiece() {
        this.activePiece.cells.forEach(([x, y]) => (this.grid[y][x] = 1));
    }

    private clearLines() {
        this.grid = this.grid.filter(row => row.includes(0));
        while (this.grid.length < 20) this.grid.unshift(Array(10).fill(0));
    }

    private spawnPiece() {
        this.activePiece = this.nextPiece;
        this.nextPiece = Piece.random();
    }

    private drawGrid(ctx: CanvasRenderingContext2D) {
        this.grid.forEach((row, y) => row.forEach((cell, x) => {
            if (cell) {
                ctx.fillStyle = "blue";
                ctx.fillRect(x * 30, y * 30, 30, 30);
            }
        }));
    }
}

class Piece {
    cells: [number, number][];

    constructor(cells: [number, number][]) {
        this.cells = cells;
    }

    static pieceType: Record<string, any> = {
        horizontalL: loadSprite("player", "sprites/player.png", {
            sliceX: 8, 
            sliceY: 8, 
            anims: {
                crack: { from: 0, to: 3, loop: false },
                ghosty: { from: 4, to: 4 },
            },
        })
    }

    moveDown() {
        this.cells = this.cells.map(([x, y]) => [x, y + 1]);
    }

    canMoveDown(grid: number[][]): boolean {
        return this.cells.every(([x, y]) => y + 1 < 20 && grid[y + 1][x] === 0);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "red";
        this.cells.forEach(([x, y]) => ctx.fillRect(x * 30, y * 30, 30, 30));
    }
}

const tetris = new Tetris();
