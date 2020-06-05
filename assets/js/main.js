// config object lets Phaser know how to run the game that will be generated below
var config = {
    type: Phaser.AUTO, // which renderer to use-- AUTO picks WEBGL, otherwise CANVAS
    width: 800, // browser canvas size
    height: 600,
    // scenes to be added to game--first scene will be run automatically once the game object is created
    scene: [
        BootScene,
        TitleScene,
        GameScene,
        UiScene,
    ],
    // determines physics settings to be used in the game
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                y: 0, // this means things will NOT drop toward the bottom of the canvas
            },
        },
    },

    // render config settings to optimize for pixel art graphics
    pixelArt: true,
    roundPixels: true,
};

// create the overall game object--will accept config and parse its data to create game to specifications therein
var game = new Phaser.Game(config);