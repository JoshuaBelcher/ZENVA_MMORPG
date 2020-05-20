var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
    },
};

var game = new Phaser.Game(config);

function preload(){
    this.load.image('button1', 'assets/images/ui/blue_button01.png');
    this.load.spritesheet('items', 'assets/images/items.png', {frameWidth: 32, frameHeight: 32});
};

function create(){
    var button = this.add.image(100, 100, 'button1');
    button.setOrigin(0.5,0.5);

    this.add.sprite(300, 100, 'button1');

    this.add.image(300, 300, 'items', 0);
};