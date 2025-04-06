export type PieceType =
    | "l_left"
    | "l_right"
    | "long"
    | "s1"
    | "s2"
    | "square"
    | "t";

export class Tetris {
    private grid: (PieceType | null)[][];
    private activePiece: Piece;
    private nextPiece: Piece;
    private score: number = 0;
    private dropTimer: number = 0;
    private dropInterval: number = 1000;
    private gameOver: boolean = false;

    constructor() {
        this.grid = Array.from({ length: 20 }, () => Array(10).fill(null));
        this.nextPiece = Piece.random();
        this.activePiece = Piece.random();
    }

    update(dt: number) {
        if (this.gameOver) return;

        this.dropTimer += dt;
        if (this.dropTimer >= this.dropInterval) {
            this.dropTimer = 0;
            if (this.activePiece.canMoveDown(this.grid)) {
                this.activePiece.moveDown();
            } else {
                this.placePiece();
                this.clearLines();
                this.spawnPiece();
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.drawGrid(ctx);
        if (!this.gameOver) {
            this.activePiece.drawGhost(ctx, this.grid);
            this.activePiece.draw(ctx);
            ctx.fillStyle = "white";
            ctx.font = "20px sans-serif";
            ctx.fillText(`Score: ${this.score}`, 10, 30);
            ctx.fillText("Next:", 200, 30);
            this.nextPiece.drawPreview(ctx, 200, 50);
        } else {
            ctx.fillStyle = "white";
            ctx.font = "32px sans-serif";
            ctx.fillText("GAME OVER", 30, 300);
        }
    }

    private placePiece() {
        this.activePiece.cells.forEach(([x, y]) => {
            if (y >= 0 && y < 20 && x >= 0 && x < 10) {
                this.grid[y][x] = this.activePiece.type;
            }
        });
    }

    private clearLines() {
        let cleared = 0;
        this.grid = this.grid.filter(row => {
            if (row.every(cell => cell !== null)) {
                cleared++;
                return false;
            }
            return true;
        });
        while (this.grid.length < 20) {
            this.grid.unshift(Array(10).fill(null));
        }
        this.score += cleared * 100;
        this.dropInterval = Math.max(100, 1000 - Math.floor(this.score / 1000) * 100);
    }

    private spawnPiece() {
        this.activePiece = this.nextPiece;
        this.nextPiece = Piece.random();

        if (!this.activePiece.canSpawn(this.grid)) {
            this.gameOver = true;
        }
    }

    private drawGrid(ctx: CanvasRenderingContext2D) {
        this.grid.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell !== null) {
                    Piece.drawBlock(ctx, x, y, cell);
                }
            });
        });
    }

    movePieceLeft() {
        if (this.activePiece.canMoveLeft(this.grid)) {
            this.activePiece.moveLeft();
        }
    }

    movePieceRight() {
        if (this.activePiece.canMoveRight(this.grid)) {
            this.activePiece.moveRight();
        }
    }

    rotatePiece() {
        this.activePiece.rotate(this.grid);
    }

    hardDrop() {
        while (this.activePiece.canMoveDown(this.grid)) {
            this.activePiece.moveDown();
        }
        this.placePiece();
        this.clearLines();
        this.spawnPiece();
    }
}

export class Piece {
    cells: [number, number][];
    type: PieceType;
    static sprites: Record<PieceType, HTMLCanvasElement>;

    constructor(cells: [number, number][], type: PieceType) {
        this.cells = cells;
        this.type = type;
    }

    static generateSprites(): Record<PieceType, HTMLCanvasElement> {
        const colors: Record<PieceType, string> = {
            l_left: "#FFA500",   // Orange
            l_right: "#0000FF",  // Blue
            long: "#00FFFF",     // Cyan
            s1: "#00FF00",       // Green
            s2: "#FF0000",      // Red
            square: "#FFFF00",   // Yellow
            t: "#AA00FF"        // Purple
        };

        const sprites: Partial<Record<PieceType, HTMLCanvasElement>> = {};
        const size = 30;

        Object.entries(colors).forEach(([type, color]) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;
            
            ctx.fillStyle = color;
            ctx.fillRect(1, 1, size-2, size-2);
            
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, size-2, size-2);
            
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.strokeRect(3, 3, size-6, size-6);
            
            sprites[type as PieceType] = canvas;
        });

        return sprites as Record<PieceType, HTMLCanvasElement>;
    }

    static random(): Piece {
        const pieces: { type: PieceType; shape: [number, number][] }[] = [
            { type: "long", shape: [[3, -1], [4, -1], [5, -1], [6, -1]] },
            { type: "s1", shape: [[4, -1], [5, -1], [5, 0], [6, 0]] },
            { type: "s2", shape: [[4, 0], [5, 0], [5, -1], [6, -1]] },
            { type: "l_left", shape: [[4, -1], [4, 0], [5, 0], [6, 0]] },
            { type: "l_right", shape: [[4, 0], [5, 0], [6, 0], [6, -1]] },
            { type: "t", shape: [[4, 0], [5, 0], [5, -1], [6, 0]] },
            { type: "square", shape: [[5, -1], [5, 0], [6, -1], [6, 0]] },
        ];
        const r = pieces[Math.floor(Math.random() * pieces.length)];
        return new Piece(r.shape, r.type);
    }

    moveDown() {
        this.cells = this.cells.map(([x, y]) => [x, y + 1]);
    }

    moveUp() {
        this.cells = this.cells.map(([x, y]) => [x, y - 1]);
    }

    moveLeft() {
        this.cells = this.cells.map(([x, y]) => [x - 1, y]);
    }

    moveRight() {
        this.cells = this.cells.map(([x, y]) => [x + 1, y]);
    }

    canMoveDown(grid: (PieceType | null)[][]): boolean {
        return this.cells.every(([x, y]) => {
            const newY = y + 1;
            return newY < 20 && (newY < 0 || grid[newY][x] === null);
        });
    }

    canMoveLeft(grid: (PieceType | null)[][]): boolean {
        return this.cells.every(([x, y]) => {
            const newX = x - 1;
            return newX >= 0 && (y < 0 || grid[y][newX] === null);
        });
    }

    canMoveRight(grid: (PieceType | null)[][]): boolean {
        return this.cells.every(([x, y]) => {
            const newX = x + 1;
            return newX < 10 && (y < 0 || grid[y][newX] === null);
        });
    }

    rotate(grid: (PieceType | null)[][]) {
        const centerX = this.cells.reduce((sum, [x]) => sum + x, 0) / this.cells.length;
        const centerY = this.cells.reduce((sum, [, y]) => sum + y, 0) / this.cells.length;

        const newCells = this.cells.map(([x, y]) => {
            const relX = x - centerX;
            const relY = y - centerY;
            return [Math.round(centerX + -relY), Math.round(centerY + relX)];
        });

        const isValid = newCells.every(([x, y]) => 
            x >= 0 && x < 10 && y < 20 && (y < 0 || grid[y][x] === null));

        if (isValid) {
            this.cells = newCells;
        }
    }

    canSpawn(grid: (PieceType | null)[][]): boolean {
        return this.cells.every(([x, y]) => {
            return y < 20 && x >= 0 && x < 10 && (y < 0 || grid[y][x] === null);
        });
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.cells.forEach(([x, y]) => {
            Piece.drawBlock(ctx, x, y, this.type);
        });
    }

    drawGhost(ctx: CanvasRenderingContext2D, grid: (PieceType | null)[][]) {
        let dropDistance = 0;
        while (this.canMoveDown(grid)) {
            dropDistance++;
            this.moveDown();
        }
        
        ctx.save();
        ctx.globalAlpha = 0.3;
        this.cells.forEach(([x, y]) => {
            Piece.drawBlock(ctx, x, y, this.type);
        });
        ctx.restore();
        
        while (dropDistance > 0) {
            this.moveUp();
            dropDistance--;
        }
    }

    drawPreview(ctx: CanvasRenderingContext2D, x: number, y: number) {
        this.cells.forEach(([cx, cy]) => {
            Piece.drawBlock(ctx, x/30 + cx - 2, y/30 + cy + 1, this.type);
        });
    }

    static drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, type: PieceType) {
        const sprite = Piece.sprites[type];
        if (sprite) {
            ctx.drawImage(sprite, x * 30, y * 30);
        } else {
            ctx.fillStyle = "gray";
            ctx.fillRect(x * 30, y * 30, 30, 30);
        }
    }
}