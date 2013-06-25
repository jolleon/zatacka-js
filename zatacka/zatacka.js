var Keys = {
    players: [
        {
            LEFT: 81, // q
            RIGHT: 87 // w
        },
        {
            LEFT: 40, // down
            RIGHT: 39, // right
        },
        {
            LEFT: 86, // v
            RIGHT: 66, // b
        },
        {
            LEFT: 221, // ]
            RIGHT: 220, // \
        },
        {
            LEFT: 85, // u
            RIGHT: 73, // i
        },
        {
            LEFT: 90, // z
            RIGHT: 88, // x
        }
    ],

    SPACE: 32
}

var Key = {
  _pressed: {},

  changing: false,

  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },

  onKeydown: function(event) {
    var changing = this.changing;
    if (changing !== false){
        console.log(changing);
        if (event.keyCode === Keys.Space){
            // space cancels change
            changing = false;
            return;
        }
        if (changing.key === 'LEFT'){
            changing.LEFT = event.keyCode;
            $('.keys.p'+changing.player).html(
                keyCodeToString[changing.LEFT] + '<>'
            );
            changing.key = 'RIGHT';
        } else {
            Keys.players[changing.player].LEFT = changing.LEFT;
            Keys.players[changing.player].RIGHT = event.keyCode;
            $('.keys.p'+changing.player).html(
                keyCodeToString[Keys.players[changing.player].LEFT] + ' ' +
                keyCodeToString[Keys.players[changing.player].RIGHT]
            );
            this.changing = false;
        }
        return;
    }

    konami.update(event.keyCode);
    this._pressed[event.keyCode] = true;
  },

  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

var Konami = function(){
    this.keys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    this.state = 0;
    this.update = function(keycode){
        if (keycode === this.keys[this.state]){
            this.state++;
        }
        else {
            this.state = 0;
        }
        if (this.state === this.keys.length){
            this.state = 0;
            console.log("KONAMI");
        }
    }
}

konami = new Konami();


Player = function(){
    this.score = 0;
}

var Config = {
    attrs: {
        players: 2,
        speed: 3,
        size: 3,
        rotation: 3
    },

    readConfig: function(){
        for (attr in this.attrs){
            this.attrs[attr] = parseInt($('input[name='+attr+']:checked').val());
        }
    },

    updateConfigControls: function(){
        for (attr in this.attrs){
            $('input[name='+attr+'][value=' + this.attrs[attr] + ']').prop('checked', true);
        }
        for (var i=0; i<Keys.players.length; i++){
            $('.keys.p'+i).html(
                keyCodeToString[Keys.players[i].LEFT] + ' ' +
                keyCodeToString[Keys.players[i].RIGHT]
            );
        }
    },

    get: function(attr){
        if (attr === 'rotation'){
            return this.get('speed') * this.attrs.rotation * Math.PI / 512;
        }
        else if (attr === 'speed'){
            var s = this.attrs.speed + 2;
            return s * s / 9;
        }
        else {
            return this.attrs[attr];
        }
    }
}

var preparePlayers = function(){
    players = [];
    for (var i=0; i<Config.get('players'); i++){
        players.push(new Player());
    }
}

var pickStartPosition = function(snake) {
    var margin = 50;
    var x, y, tooClose;
    do {
        x = Math.round(Math.random() * (canvas.width - 2 * margin)) + margin;
        y = Math.round(Math.random() * (canvas.height - 2 * margin)) + margin;
        tooClose = false;
        for(var i=0; i < snakes.length; i++){
            if (Math.abs(snakes[i].x - x) < margin) tooClose = true;
            if (Math.abs(snakes[i].y - y) < margin) tooClose = true;
        };
    } while(tooClose);
    snake.x = x;
    snake.old_x = x;
    snake.y = y;
    snake.old_y = y;
    var dirMargin = 50 * snake.speed;
    do {
        snake.direction = Math.random() * 2 * Math.PI;
    }
    while (
        (snake.nextX(dirMargin) < margin) ||
        (snake.nextX(dirMargin) > (canvas.width - margin)) ||
        (snake.nextY(dirMargin) < margin) ||
        (snake.nextY(dirMargin) > (canvas.height - margin))
    );
}

var prepareSnakes = function() {
    snakes = [];
    var colors = ["#f00", "#ff0", "#0f0", "#b0f", "#f80", "#0ff"];
    for(var i=0; i<players.length; i++){
        snakes.push(new Snake());
        snakes[i].radius = Config.get('size');
        snakes[i].diameter = snakes[i].radius * 2;
        snakes[i].speed = Config.get('speed');
        snakes[i].rotation_speed = Config.get('rotation');
        snakes[i].color = colors[i];
        pickStartPosition(snakes[i]);
    }
    snakes_alive = snakes.length;

}

var updateGame = function(){
    for (var i=0; i<players.length; i++){
        if (Key.isDown(Keys.players[i].LEFT)) snakes[i].turnRight();
        if (Key.isDown(Keys.players[i].RIGHT)) snakes[i].turnLeft();
    }

    if (snake_died > 0){
        for (var i=0; i<snakes.length; i++){
            if (!snakes[i].dead){
                players[i].score += snake_died;
            }
        }
        snake_died = 0;
    }

    if (Key.isDown(Keys.SPACE)){
        if (snakes_alive < 2){
            startGame();
        }
    }

    if (snakes_alive > 1){
        for (var i=0; i<snakes.length; i++){
            var snake = snakes[i];
            snake.move();
        };
    }

};

var drawGame = function(){
    if(snakes){
        for (var i=0; i<snakes.length; i++){
            ctx.globalAlpha = snakes[i].holeTracker.getAlpha();
            snakes[i].draw(ctx)
        };
    }

    for (var i=0; i<6; i++){
        var text = i < players.length ? players[i].score : '';
        $("#score"+i).html(text);
    }
};

var mainloop = function() {
    updateGame();
    drawGame();
};
