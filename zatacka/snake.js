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

Snake.prototype.move = function(){
    if (this.dead) return;

    this.old_x = this.x;
    this.old_y = this.y;
    this.x = this.old_x + this.speed * Math.cos(this.direction);
    this.y = this.old_y + this.speed * Math.sin(this.direction);

    // test death
    var check_radius = Math.ceil(this.radius + this.speed);
    var check_size = 2 * check_radius;
    var top_x = Math.round(this.old_x - check_radius),
        top_y = Math.round(this.old_y - check_radius);
    var pix = ctx.getImageData(
            top_x, top_y,
            check_size, check_size).data;

    for(var i=0, n = pix.length / 4; i<n; i+=1){
        if (pix[4*i+3] !== 0){
            var x = top_x + (i % check_size) + 0.5;
            // not sure why we need this +0.5 - seems like webkit draws the
            // circles half a pixel off or something :/
            var y = top_y + Math.floor(i/check_size) + 0.5;
            if ((is_in_circle(x, y, this.x, this.y, this.radius + 1) ||
                is_in_line(x, y, this.x, this.y, this.old_x, this.old_y)) &&
                !is_in_circle(x, y, this.old_x, this.old_y, this.radius + 1)) {
                this.dead = true;
            };
        }
    }
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

