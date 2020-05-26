class GameScene extends Phaser.Scene{
    constructor() {
        super('Game');
    }

    init () {
        // starts scene alongside existing scene, as opposed to "start" method which shuts down existing first
        this.scene.launch('Ui');
        this.score = 0;
    }

    create() {
        this.createMap();

        this.createAudio();
    
        this.createChests();
    
        this.createPlayer();
    
        this.addCollisions();
    
        this.createInput();

    }

    update() {
        this.player.update(this.cursors);
    }

    createAudio() {
        this.goldPickupAudio = this.sound.add('goldSound', {loop: false});
    }

    createPlayer() {
        this.player = new Player(this, 32, 32, 'characters', 0)
    }

    createChests() {
        // create a chests group
        this.chests = this.physics.add.group();
        // create chest positions array
        this.chestPositions = [[100, 100], [200, 200], [300, 300], [400, 400], [500, 500]]
        // specify the max number of chests we can have
        this.maxNumberOfChests = 3;
        // spawn a chest
        for (let i = 0; i < this.maxNumberOfChests; i += 1) {
            this.spawnChest();
        }
    }

    spawnChest() {
        // generate random location selected from those stored in the array
        const location = this.chestPositions[Math.floor(Math.random() * this.chestPositions.length)];
        
        // game will first tyr to set the newly spawned chest to be the first one in the chests array that was rendered inactive by player pickup
        let chest = this.chests.getFirstDead();
        
        // if no inactive chests exist in the chests array, a new chest will be generated. If an old one is reused, its position is updated to the new random location.
        if (!chest) {
            const chest = new Chest(this, location[0], location[1], 'items', 0);
            // add chest to chests group
            this.chests.add(chest);
        } else {
            chest.setPosition(location[0], location[1]);
            chest.makeActive();
        }

    }

    createInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    addCollisions() {
        this.physics.add.collider(this.player, this.wall);
        this.physics.add.overlap(this.player, this.chests, this.collectChest, null, this);
    }

    collectChest(player, chest) {
        // play gold pickup sound
        this.goldPickupAudio.play();
        // update our score
        this.score += chest.coins;
        // update the score in the UI
        this.events.emit('updateScore', this.score);
        // make chest game object inactive
        chest.makeInactive();
        // spawn a new chest
        this.time.delayedCall(1000, this.spawnChest, [], this);
    }

    createMap() {
        // create the tile map
        this.map = this.make.tilemap({ key: 'map'});
        // add the tileset image to our map
        this.tiles = this.map.addTilesetImage('background', 'background', 32, 32, 1, 2);
        //create our background
        this.backgroundLayer = this.map.createStaticLayer('background', this.tiles, 0, 0);
        this.backgroundLayer.setScale(2);
        // create blocked layer
        this.blockedLayer = this.map.createStaticLayer('blocked', this.tiles, 0, 0);
        this.blockedLayer.setScale(2);
    }
}