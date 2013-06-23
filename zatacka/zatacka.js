var Key = {
  _pressed: {},

  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },

  onKeydown: function(event) {
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


var Keys = {
    players: [
        {
            LEFT: 81, // Q
            RIGHT: 87 // W
        },
        {
            LEFT: 37, // left
            RIGHT: 39, // right
        },
        {
            LEFT: 86, // v
            RIGHT: 66, // b
        },
        {
            LEFT: 221, // ]
            RIGHT: 220, // \
        }
    ],

    SPACE: 32
}

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
            $('#left'+(i+1)).html(keyCodeToString[Keys.players[i].LEFT]);
            $('#right'+(i+1)).html(keyCodeToString[Keys.players[i].RIGHT]);
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
    }
    snakes_alive = snakes.length;

    snakes[1].x = canvas.width - 50;
    snakes[1].y = canvas.height - 50;
    snakes[1].direction = Math.PI;

    if (players.length > 2){
        snakes[2].x = canvas.width - 50;
        snakes[2].direction = Math.PI;
    }

    if (players.length > 3){
        snakes[3].y = canvas.height - 50;
    }
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
            snakes[i].draw(ctx)
        };
    }

    for (var i=0; i<4; i++){
        var text = i < players.length ? players[i].score : '';
        $("#score"+(i+1)).html(text);
    }
};

var mainloop = function() {
    updateGame();
    drawGame();
};
