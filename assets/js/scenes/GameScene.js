class GameScene extends Phaser.Scene{
    constructor() {
        super('Game');
    }

    init () {
        // starts scene alongside existing scene, as opposed to "start" method which shuts down existing first
        this.scene.launch('Ui');
    }

    create() {
        this.goldPickupAudio = this.sound.add('goldSound', {loop: false});
    
        this.chest = new Chest(this, 300, 300, 'items', 0);
    
        this.wall = this.physics.add.image(500, 100, 'button1');
        this.wall.setImmovable();
    
        this.player = new Player(this, 32, 32, 'characters', 0)
    
        this.physics.add.collider(this.player, this.wall);
        this.physics.add.overlap(this.player, this.chest, this.collectChest, null, this);
    
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        this.player.update(this.cursors);
    }

    collectChest(player, chest) {
        // play gold pickup sound
        this.goldPickupAudio.play();
        // update the score in the UI
        this.events.emit('updateScore', chest.coins);
        // destroy the chest game object
        chest.destroy();
    }
}