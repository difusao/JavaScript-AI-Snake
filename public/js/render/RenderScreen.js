export default function RenderScreen(cv) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.id = cv.id;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function createStyle(canvas) {
        document.body.appendChild(canvas);
        document.body.style.padding = 2;
        document.body.style.margin = 2;
        document.body.style.overflow = 'hidden';
        document.body.style.background = cv.bgcolor;
        document.body.style.position = "absolute";
        document.body.style.left = cv.x;
        document.body.style.top = cv.y;
    }

    function canvasbackground(cvbgcolor, cvfillcolor, x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 10;
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = cvbgcolor;
        this.ctx.strokeStyle = cvfillcolor;
        this.ctx.fillRect(x1, y1, x2, y2);
        this.ctx.strokeRect(x1, y1, x2, y2);
        this.ctx.closePath();
    }

    function canvasclear(cvbgcolor, cvfillcolor, x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = cvbgcolor;
        this.ctx.strokeStyle = cvfillcolor;
        this.ctx.fillRect(x1, y1, x2, y2);
        this.ctx.strokeRect(x1, y1, x2, y2);
        this.ctx.closePath();
    }

    createStyle(canvas);

    return {
        ctx,
        canvas,
        canvasclear,
        canvasbackground,
    }
}




