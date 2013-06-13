var Key = {
  _pressed: {},

  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },

  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },

  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

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

var preparePlayers = function(){
    players = [];
    for (var i=0; i<3; i++){
        players.push(new Player());
    }
}

var prepareSnakes = function() {
    snakes = [];
    for(var i=0; i<players.length; i++){
        snakes.push(new Snake());
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
    for (var i=0; i<snakes.length; i++){
        snakes[i].draw(ctx)
    };
    $("#score1").html(players[0].score);
    $("#score2").html(players[1].score);
    if (players.length > 2)
        $("#score3").html(players[2].score);
    if (players.length > 3)
        $("#score4").html(players[3].score);
};

var mainloop = function() {
    updateGame();
    drawGame();
};
