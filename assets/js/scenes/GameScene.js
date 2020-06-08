// after loading assets, boot scene finishes by starting this scene, our main game scene, 
//at least for this given "level," "stage," "zone," etc.
class GameScene extends Phaser.Scene{
    constructor() {
        super('Game');
    }

    init () {
        // "launch" starts scene alongside existing scene, as opposed to "start" method which shuts down existing scene first
        // ensures our Ui scene runs in parallel with our Game scene since both need to be viewed by player at all times
        this.scene.launch('Ui');
    }

    // automatically called after scene start and init() and preload()-N/A here-, which generates the game scenes essential processes
    create() {
        // map rendered first in order so that player/monsters/chests, etc. won't be hidden behind it
        this.createMap();

        this.createAudio();
    
        this.createGroups();
    
        this.createInput();

        this.createGameManager();

    }

    // automatically called once per game step to update the player container's position based on keyboard input--only if player already exists in scene
    update() {
        if (this.player) {
            this.player.update(this.cursors)
        };
    }

    // takes the sounds assets that were preloaded in the boot scene then adds them, by '' key name, into this scene's sound manager
    // uses config object parameter to determine if sound is looped and volume level
    createAudio() {
        this.goldPickupAudio = this.sound.add('goldSound', {loop: false, volume: 0.3});
        this.playerAttackAudio = this.sound.add('playerAttack', {loop: false, volume: 0.01});
        this.playerDamageAudio = this.sound.add('playerDamage', {loop: false, volume: 0.2});
        this.playerDeathAudio = this.sound.add('playerDeath', {loop: false, volume: 0.2});
        this.monsterDeathAudio = this.sound.add('enemyDeath', {loop: false, volume: 0.2});
    }

    // generates an instance of the Player Container class in our scene--"PlayerModel" will be the class passed in as argument
    createPlayer(playerObject) {
        this.player = new PlayerContainer(
            this,
            playerObject.x * 2,
            playerObject.y * 2,
            'characters',
            0,
            playerObject.health,
            playerObject.maxHealth,
            playerObject.id,
            this.playerAttackAudio,

        )
    }

    // creates arcade physics game objects groups to house chests and monsters
    createGroups() {
        // create a chests group
        this.chests = this.physics.add.group();

        // create a monsters group
        this.monsters = this.physics.add.group();
        this.monsters.runChildUpdate = true; // will ensure update() method of monsters group objects is called

    }

    spawnChest(chestObject) {        
        // game will first try to set the newly spawned chest to be the first one in the chests array that was rendered inactive by player pickup
        let chest = this.chests.getFirstDead();
        
        // if no inactive chests exist in the chests array, a new chest will be generated. If an old one is reused, its position is updated to the new random location.
        if (!chest) {
            chest = new Chest(this, chestObject.x * 2, chestObject.y * 2, 'items', 0, chestObject.gold, chestObject.id);
            // add chest to chests group
            this.chests.add(chest);
        } else {
            chest.coins = chestObject.gold;
            chest.id = chestObject.id;
            chest.setPosition(chestObject.x * 2, chestObject.y * 2);
            chest.makeActive();
        }

    }

    spawnMonster(monsterObject) {    
    // game will first try to set the newly spawned monster to be the first one in the monsters array that was rendered inactive by player slaying
        let monster = this.monsters.getFirstDead();
        
        // if no inactive monsters exist in the monsters array, a new monster will be generated. If an old one is reused, its position is updated to the new random location.
        if (!monster) {
            monster = new Monster(
                this,
                monsterObject.x,
                monsterObject.y,
                'monsters',
                monsterObject.frame,
                monsterObject.id,
                monsterObject.health,
                monsterObject.maxHealth,
            );
            // add monster to monsters group
            this.monsters.add(monster);
            monster.setCollideWorldBounds(true);
        } else {
            monster.id = monsterObject.id;
            monster.health = monsterObject.health;
            monster.maxHealth = monsterObject.maxHealth;
            monster.setTexture('monsters', monsterObject.frame);
            monster.setPosition(monsterObject.x, monsterObject.y);
            monster.makeActive();
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
        // checks for collisions between the monster group and the tiled blocked layer
        this.physics.add.collider(this.monsters, this.map.blockedLayer);
        // checks for overlaps between the player's weapon and the monster game objects
        this.physics.add.overlap(this.player.weapon, this.monsters, this.enemyOverlap, null, this);
    }

    enemyOverlap(weapon, enemy) {
        if (this.player.playerAttacking && !this.player.swordHit) {
            this.player.swordHit = true;
            this.events.emit('monsterAttacked', enemy.id, this.player.id);
        }
    }

    // called when addCollisions detects an overlap of player and chest
    collectChest(player, chest) {
        // play gold pickup sound
        this.goldPickupAudio.play();
        
        // send alert that chest has been picked up so it can be deleted by the Game Manager
        this.events.emit('pickUpChest', chest.id, player.id);
    }   

    // generate a new instance of Map class for this scene
    createMap() {
        this.map = new Map (this, 'map', 'background', 'background', 'blocked');
    }

    createGameManager() {
        this.events.on('spawnPlayer', (playerObject) => {
            this.createPlayer(playerObject);
            this.addCollisions();
        });

        // hears when a chest model is spawned by the game manager, upon which it adds a new Chest class physics object to the scene
        this.events.on('chestSpawned', (chest) => {
            this.spawnChest(chest);
        });

        this.events.on('monsterSpawned', (monster) => {
            this.spawnMonster(monster);
        });

        // once it hears that chest has been removed from the Game Manager and spawner, the relevant chest is located, by ID,
        // in the chests group and rendered inactive, storing it for future use
        this.events.on('chestRemoved', (chestId) => {
            this.chests.getChildren().forEach((chest) => {
                if (chest.id === chestId) {
                    chest.makeInactive();
                }
            });
        });

        this.events.on('monsterRemoved', (monsterId) => {
            this.monsters.getChildren().forEach((monster) => {
                if (monster.id === monsterId) {
                    monster.makeInactive();
                    this.monsterDeathAudio.play();
                }
            });
        });

        this.events.on('updateMonsterHealth', (monsterId, health) => {
            this.monsters.getChildren().forEach((monster) => {
                if (monster.id === monsterId) {
                    monster.updateHealth(health);
                }
            });
        });

        this.events.on('monsterMovement', (monsters) => {
            this.monsters.getChildren().forEach((monster) => {
                Object.keys(monsters).forEach((monsterId) => {
                    if (monster.id === monsterId) {
                        this.physics.moveToObject(monster, monsters[monsterId], 40);
                    }
                });
            });
        });

        this.events.on('updatePlayerHealth', (playerId, health) => {
            if (health < this.player.health) {
                this.playerDamageAudio.play();
            }
            this.player.updateHealth(health);
        });

        this.events.on('respawnPlayer', (playerObject) => {
            this.playerDeathAudio.play();
            this.player.respawn(playerObject);
        });

        // creates a new game manager object by passing in the current scene and the array of tilemap object layers
        // contained in the map object created above
        this.gameManager = new GameManager (this, this.map.map.objects);
        this.gameManager.setup();
    }
}