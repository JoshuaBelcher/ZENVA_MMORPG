// this first scene is run automatically by the Phaser.Game object when it is created--will call init(), preload(), and create() in that order--
// we can define in our class what these methods will actually do
class BootScene extends Phaser.Scene{
    // constructor function is the method called when creating a new instance of the class--in this case, it will
    // use "super" to employ the constructor function defined in the parent Phaser.Scene class that the BootScene is derived from
    constructor() {
        super('Boot'); // "Boot" is the key that will be used to reference the scene constructed by this function
    }

    // loader plugin is used to load game assets
    preload(){
        // load images
        this.loadImages();
        // load spritesheets
        this.loadSpriteSheets();
        // load audio
        this.loadAudio();
        // load tilemap
        this.loadTileMap();
    }

    loadImages() {
        this.load.image('button1', 'assets/images/ui/blue_button01.png');
        this.load.image('button2', 'assets/images/ui/blue_button02.png');
        // load the tileset image that was used to create the tilemap that will be loaded shortly
        this.load.image('background', 'assets/level/background-extruded.png');
    }

    loadSpriteSheets() {
        this.load.spritesheet('items', 'assets/images/items.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('characters', 'assets/images/characters.png', {frameWidth: 32, frameHeight: 32});
        // this.load.spritesheet('ryann', 'assets/images/SKRyann-0001.gif', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('monsters', 'assets/images/monsters.png', {frameWidth: 32, frameHeight: 32});
    }

    loadAudio() {
        this.load.audio('goldSound', ['assets/audio/Pickup.wav']);
        this.load.audio('enemyDeath', ['assets/audio/EnemyDeath.wav']);
        this.load.audio('playerAttack', ['assets/audio/PlayerAttack.wav']);
        this.load.audio('playerDamage', ['assets/audio/PlayerDamage.wav']);
        this.load.audio('playerDeath', ['assets/audio/PlayerDeath.wav']);
    }

    loadTileMap() {
        // map made in Tiled in JSON format
        this.load.tilemapTiledJSON('map', 'assets/level/large_level.json');
    }

    // after loading is complete, this is called to close our boot scene then start our main game scene
    create() {
        this.scene.start('Game');
    }
}