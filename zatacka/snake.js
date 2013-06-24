HoleTracker = function(snake){
    this.minSize = 3 * snake.diameter;
    this.maxSize = 2 * this.minSize;
    this.snake = snake;
    this.inHole = false;
    this.holeEndIn = 0;
    this.noHoleCount = 0;
}

HoleTracker.prototype.update = function(){
    if (!this.inHole){
        this.noHoleCount++;
        if (Math.random() < this.noHoleCount / 2000) {
            this.inHole = true;
            var holeSize = Math.random() * (this.maxSize - this.minSize) + this.minSize;
            this.holeEndIn = Math.round(holeSize / this.snake.speed);
        }
    }

    if (this.inHole){
        this.holeEndIn--;
        if (this.holeEndIn < 1){
            this.inHole = false;
            this.noHoleCount = 0;
        }
    }
}

HoleTracker.prototype.getAlpha = function(){
    if (this.inHole) return 0;
    else return 1;
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
        if (pix[4*i+3] === 255){
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

