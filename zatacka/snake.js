HoleTracker = function(snake){
    this.minSize = 3 * snake.diameter;
    this.maxSize = 2 * this.minSize;
    this.snake = snake;
    this.inHole = false;
    this.holeEndIn = 0;
    this.noHoleCount = 0;
    this.positions = [];
    this.shouldDrawHole = false;
}

HoleTracker.prototype.update = function(){
    this.shouldDrawHole = false;
    if (!this.inHole){
        this.noHoleCount++;
        if (Math.random() < Math.pow(this.noHoleCount, 1.3) / 20000) {
            this.inHole = true;
            var holeSize = Math.random() * (this.maxSize - this.minSize) + this.minSize;
            this.holeEndIn = Math.round(holeSize / this.snake.speed) + 1;
            this.positions = [[this.snake.old_x, this.snake.old_y]];
        }
    }

    if (this.inHole){
        this.holeEndIn--;
        this.positions.push([this.snake.x, this.snake.y]);
        this.shouldDrawHole = true;
        if (this.holeEndIn < 1){
            this.inHole = false;
            this.noHoleCount = 0;
        }
    }
}

HoleTracker.prototype.getAlpha = function(){
    if (this.inHole) return 1;
    else return 1;
}

HoleTracker.prototype.drawHole = function(){
    ctx.strokeStyle = 'black';
    ctx.lineWidth = this.snake.diameter + 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.positions[1][0], this.positions[1][1]);
    for(var i=2; i<this.positions.length - 1; i++){
        ctx.lineTo(this.positions[i][0], this.positions[i][1]);
    }
    ctx.stroke();
    ctx.strokeStyle = this.snake.color;
    ctx.lineWidth = this.snake.diameter;
    ctx.beginPath();
    ctx.moveTo(this.positions[0][0], this.positions[0][1]);
    ctx.lineTo(this.positions[1][0], this.positions[1][1]);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
        this.positions[this.positions.length - 2][0],
        this.positions[this.positions.length - 2][1]
    );
    ctx.lineTo(
        this.positions[this.positions.length - 1][0],
        this.positions[this.positions.length - 1][1]
    );
    ctx.stroke();
    this.shouldDrawHole = false; // necessary for when snake dies while drawing
    // a hole (otherwise hole keeps getting drawn above white tip)

}

Snake = function(){
    this.x = 50;
    this.y = 50;
    this.old_x = 50;
    this.old_y = 50;
    this.radius = 3;
    this.diameter = this.radius * 2;
    this.speed = 3;
    this.direction = 0;
    this.dead = false;
    this.rotation_speed = Math.PI / 64;
    this.color = "#f00";
    this.holeTracker = new HoleTracker(this);
};

Snake.prototype.draw = function(ctx){
    if (this.dead){
        ctx.strokeStyle = "#fff";
    }
    else {
        ctx.strokeStyle = this.color;
    };
    ctx.lineWidth = this.diameter;
    ctx.lineCap = 'round'; // square, butt(default)
    ctx.beginPath();
    ctx.moveTo(this.old_x, this.old_y);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    if(this.holeTracker.shouldDrawHole){
        this.holeTracker.drawHole();
    }
};

is_in_circle = function(x, y, a, b, r){
    return ((Math.pow(x - a, 2) +
            Math.pow(y - b, 2))
            < Math.pow(r, 2));
}

is_in_line = function(x, y, x1, y1, x2, y2){
    if (x < Math.min(x1, x2)) return false;
    if (x > Math.max(x1, x2)) return false;
    if (y < Math.min(y1, y2)) return false;
    if (y > Math.max(y1, y2)) return false;
    // at this point (x, y) is in the box ((x1,y1), (x2,y2))

    // case of a vertical line
    if (Math.abs(x1 - x2) < 1){
        return (Math.abs(x - (x1+x2)/2) < 1);
    }

    var a = (y2 - y1) / (x2 - x1);
    var b = y1 - a * x1;
    var diff = y - a * x - b;
    return (Math.abs(diff) <= 1);
}

Snake.prototype.isDead = function(){
    // test death
    var check_radius = Math.ceil(this.radius + this.speed);
    var check_size = 2 * check_radius;
    var top_x = Math.round(this.old_x - check_radius),
        top_y = Math.round(this.old_y - check_radius);
    var pix = ctx.getImageData(
            top_x, top_y,
            check_size, check_size).data;

    var dead = false;
    for(var i=0, n = pix.length / 4; i<n; i+=1){
        if ((pix[4*i+3] === 255) &&
            !(
                (pix[4*i] === 0) &&
                (pix[4*i+1] === 0) &&
                (pix[4*i+2] === 0)
            )
        ){
            var x = top_x + (i % check_size) + 0.5;
            // not sure why we need this +0.5 - seems like webkit draws the
            // circles half a pixel off or something :/
            var y = top_y + Math.floor(i/check_size) + 0.5;
            if ((is_in_circle(x, y, this.x, this.y, this.radius + 1) ||
                is_in_line(x, y, this.x, this.y, this.old_x, this.old_y)) &&
                !is_in_circle(x, y, this.old_x, this.old_y, this.radius + 1)) {
                dead = true;
            };
        }
    }
    return dead;
}

Snake.prototype.nextX = function(speed){
    return this.old_x + speed * Math.cos(this.direction);
}

Snake.prototype.nextY = function(speed){
    return this.old_y + speed * Math.sin(this.direction);
}

Snake.prototype.move = function(){
    if (this.dead) return;

    this.old_x = this.x;
    this.old_y = this.y;
    this.x = this.nextX(this.speed);
    this.y = this.nextY(this.speed);

    this.holeTracker.update();

    this.dead = this.isDead();
    if (this.dead){
        snakes_alive--;
        snake_died++;
    }
};

Snake.prototype.turnRight = function(){
    this.direction -= this.rotation_speed;
};
Snake.prototype.turnLeft = function(){
    this.direction += this.rotation_speed;
};

