export default function RenderElemment(ctx, canvas) {

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  const DrawTest = function () {
    this.x = 0;
    this.y = 0;
    this.color = "#ffffff"

    this.draw = function (x, y) {
      ctx.beginPath();
      ctx.fillStyle = this.color; // "rgba(255, 255, 255,0.2)";
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 5;
      ctx.rect(x, y, 50, 50);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      this.x = x;
      this.y = y;
    };

    this.update = function (x, y) {
      this.draw(x, y);
    };
  }

  const Info = function () {
    this.head = {};
    this.config = {};

    this.draw = function () {
      ctx.beginPath();
      
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.font = this.head.font;
      ctx.fillStyle = this.head.titleColor;
      ctx.fillText(this.head.title, this.head.x, this.head.y);

      ctx.setLineDash(this.head.lineDash);
      ctx.lineWidth = this.head.lineWidth;
      ctx.strokeStyle = this.head.lineColor;
      ctx.moveTo(this.head.x, this.head.y + 20);
      ctx.lineTo(this.head.x + 100, this.head.y + 20);
      ctx.stroke();

      for (let i = 0; i < this.config.text.length; i++) {
        ctx.font = this.config.textFont[i];
        ctx.fillStyle = this.config.valueColor[i];
        ctx.fillText(this.config.text[i], this.head.x, this.head.y + this.head.sy);

        ctx.font = this.config.valueFont[i];
        ctx.fillStyle = this.config.valueColor[i];
        ctx.fillText(this.config.value[i], this.head.x + this.head.s, this.head.y + this.head.sy);
        this.head.y += 20;
      }

      ctx.closePath();
    };

    this.update = function (head, config) {
      this.head = head;
      this.config = config;
      this.draw();
    };
  };

  const DrawSquareGreen = function (part) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.fillStyle = '#00FF00';
    ctx.strokeStyle = '#000000';
    ctx.fillRect(part.x, part.y, 10, 10);
    ctx.strokeRect(part.x, part.y, 10, 10);
    ctx.closePath();
  };

  const DrawSquareRed = function (part) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.fillStyle = '#FF0000';
    ctx.strokestyle = '#FFFFFF';
    ctx.fillRect(part.x, part.y, 10, 10);
    ctx.strokeRect(part.x, part.y, 10, 10);
    ctx.closePath();
  };

  return {
    Info,
    DrawTest,
    DrawSquareGreen,
    DrawSquareRed
  }
}
