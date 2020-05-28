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
    
        this.createGroups();
    
        this.createInput();

        this.createGameManager();

    }

    update() {
        if (this.player) {
            this.player.update(this.cursors)
        };
    }

    createAudio() {
        this.goldPickupAudio = this.sound.add('goldSound', {loop: false});
    }

    createPlayer(location) {
        this.player = new Player(this, location[0] * 2, location[1] * 2, 'characters', 0)
    }

    createGroups() {
        // create a chests group
        this.chests = this.physics.add.group();

    }

    spawnChest(chestObject) {        
        // game will first try to set the newly spawned chest to be the first one in the chests array that was rendered inactive by player pickup
        let chest = this.chests.getFirstDead();
        
        // if no inactive chests exist in the chests array, a new chest will be generated. If an old one is reused, its position is updated to the new random location.
        if (!chest) {
            const chest = new Chest(this, chestObject.x * 2, chestObject.y * 2, 'items', 0, chestObject.gold, chestObject.id);
            // add chest to chests group
            this.chests.add(chest);
        } else {
            chest.coins = chestObject.gold;
            chest.id = chestObject.id;
            chest.setPosition(chestObject.x * 2, chestObject.y * 2);
            chest.makeActive();
        }

    }

    createInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    addCollisions() {
        // checks for collisions between the player and the tiled blocked layer
        this.physics.add.collider(this.player, this.map.blockedLayer);
        // checks for overlaps between the player and the chest game objects
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
        // send alert that chest has been picked up so it can be deleted by the Game Manager
        this.events.emit('pickUpChest', chest.id);
    }   

    createMap() {
        this.map = new Map (this, 'map', 'background', 'background', 'blocked');
    }

    createGameManager() {
        this.events.on('spawnPlayer', (location) => {
            this.createPlayer(location);
            this.addCollisions();
        });

        this.events.on('chestSpawned', (chest) => {
            this.spawnChest(chest);
        });

        this.gameManager = new GameManager (this, this.map.map.objects);
        this.gameManager.setup();
    }
}