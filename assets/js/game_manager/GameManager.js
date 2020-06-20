class GameManager {
    constructor (scene, mapData) {
        this.scene = scene; // the scene the game manager object is located in
        this.mapData = mapData; // the array of layers that has the game's map data needed for this class

        // these properties keep track of existing objects as they are created
        this.spawners = {};
        this.chests = {};
        this.monsters = {};
        this.players = {};

        // hold spawning location data pulled from the Tiled map's object layer
        this.playerLocations = [];
        this.chestLocations = {};
        this.monsterLocations = {};
    }

    // calls batch of methods defined below in order to get the game manager object performing its purpose
    setup() {
        this.parseMapData();
        this.setupEventListener();
        this.setupSpawners();
        this.spawnPlayer();
    }

    // pulls map data from the passed map object which it uses to populate the container properties above--getTiledProperty is defined in "utils.js"
    parseMapData() {
        this.mapData.forEach ((layer) => {
            // loop selection tree cycles through and chooses the different layers of the map
            if (layer.name === 'player_locations') {
                // player spawn locations pushed to storing array
                layer.objects.forEach ((obj) => {
                    this.playerLocations.push ([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]); // corrected for discrepancy between Tiled and Phaser anchor points
                });
            } else if (layer.name === 'chest_locations') {
                layer.objects.forEach ((obj) => {
                    var spawner = getTiledProperty(obj, 'spawner');
                    // these locations are stored in an object so that each key of the object can be mapped to a particular
                    // spawner ID, allowing the code to track all possible locations associated with it
                    if (this.chestLocations[spawner]) {
                        this.chestLocations[spawner].push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]);
                    } else {
                        this.chestLocations[spawner] = [[obj.x + (obj.width / 2), obj.y - (obj.height / 2)]];
                    }
                });
            } else if (layer.name === 'monster_locations') {
                layer.objects.forEach ((obj) => {
                    var spawner = getTiledProperty(obj, 'spawner');
                    // these locations are stored in an object so that each key of the object can be mapped to a particular
                    // spawner ID, allowing the code to track all possible locations associated with it
                    if (this.monsterLocations[spawner]) {
                        this.monsterLocations[spawner].push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]);
                    } else {
                        this.monsterLocations[spawner] = [[obj.x + (obj.width / 2), obj.y - (obj.height / 2)]];
                    }
                });
            }
        });
        console.log(this.chestLocations);
    }

    setupEventListener() {
        // hears from game scene that a player picked up a chest
        this.scene.events.on('pickUpChest', (chestId, playerId) => {
            // update the spawner
            if (this.chests[chestId]) {
                const { gold } = this.chests[chestId];

                // updating the player's gold
                this.players[playerId].updateGold(gold);
                this.scene.events.emit('updateScore', this.players[playerId].gold);

                // removing the chest--the specific chest stored in a specific spawner, all referenced via key, is made to use its removeObject function
                // which will in turn remove the chest from the spawner's objectsCreated array then run the deleteChest it was passed from the game manager
                // to remove the chest from the game manager's chests array
                this.spawners[this.chests[chestId].spawnerId].removeObject(chestId);
                // game scene is informed that the chest has been removed so that it can now be rendered inactive by the game scene
                this.scene.events.emit('chestRemoved', chestId);
            }
        });
        
        // hears from the game scene that a monster was attacked
        this.scene.events.on('monsterAttacked', (monsterId, playerId) => {
            // update the spawner
            if (this.monsters[monsterId]) {
                const { gold, attack } = this.monsters[monsterId];

                // subtract health from monster model by calling monster model's loseHealth method
                this.monsters[monsterId].loseHealth();

                // check the monster's health and if dead, remove that object
                if (this.monsters[monsterId].health <= 0) {
                     // updating the player's gold
                    this.players[playerId].updateGold(gold);
                    this.scene.events.emit('updateScore', this.players[playerId].gold);

                    // removing the monster, while emitting event to be heard by game scene
                    this.spawners[this.monsters[monsterId].spawnerId].removeObject(monsterId);
                    this.scene.events.emit('monsterRemoved', monsterId);

                    // add bonus health to the player
                    this.players[playerId].updateHealth(2);
                    this.scene.events.emit('updatePlayerHealth', playerId, this.players[playerId].health);
                } else {
                    // update the player's health
                    this.players[playerId].updateHealth(-attack);
                    this.scene.events.emit('updatePlayerHealth', playerId, this.players[playerId].health);

                    // update the monster's health
                    this.scene.events.emit('updateMonsterHealth', monsterId, this.monsters[monsterId].health);

                    // check the player's health, if below 0 have the player respawn
                    if (this.players[playerId].health <= 0) {
                        // update the gold the player has by losing half
                        this.players[playerId].updateGold(parseInt(-this.players[playerId].gold / 2, 10));
                        this.scene.events.emit('updateScore', this.players[playerId].gold);

                        // respawn the player
                        this.players[playerId].respawn();
                        this.scene.events.emit('respawnPlayer', this.players[playerId]);

                    }
                }
            }
        });
    };

    setupSpawners() {
        // config properties that are shared between spawner types (default CHEST will be changed to MONSTER if needed)
        const config = {
            spawnInterval: 3000,
            limit: 3,
            spawnerType: SpawnerType.CHEST,
            id: ''
        };
        let spawner;

        // create chest spawners for each spawner location that was originally obtained from the map data.
        // Each keyed spawner is added to the game manager's spawners array.
        // "Object.keys" creates an array which consists of every key in the passed object. You can then use "forEach"
        // to iterate through every key in the array
        Object.keys(this.chestLocations).forEach((key) => {
            config.id = `chest-${key}`;

            spawner = new Spawner(
                config,
                this.chestLocations[key],
                this.addChest.bind(this),
                this.deleteChest.bind(this)
            );
            this.spawners[spawner.id] = spawner;
        });

        // create monster spawners for each spawner location that was originally obtained from the map data.
        // Each keyed spawner is added to the game manager's spawners array.
        Object.keys(this.monsterLocations).forEach((key) => {
            config.id = `monster-${key}`;
            config.spawnerType = SpawnerType.MONSTER;

            spawner = new Spawner(
                config,
                this.monsterLocations[key],
                this.addMonster.bind(this),
                this.deleteMonster.bind(this),
                this.moveMonsters.bind(this),
            );
            this.spawners[spawner.id] = spawner;
        });
    };

    spawnPlayer() {
        // creates new instance of the PlayerModel class, passing in the array of possible spawn locations
        const player = new PlayerModel(this.playerLocations);
        // stores the new player model object into the players object array, keyed to the UUID stored in the player
        this.players[player.id] = player;
        // emits an event that will be picked up by the scene that was passed into the game manager,
        // along with the player model object to be received by the event listener
        // (to allow the scene to generate a player container with the player model's data)
        this.scene.events.emit('spawnPlayer', player);
    };

    // stores the new chest model in the game manager's chests array, then emits an event heard by the game scene
    addChest(chestId, chest) {
        this.chests[chestId] = chest;
        this.scene.events.emit('chestSpawned', chest);
    }

    // hears that 
    deleteChest(chestId) {
        delete this.chests[chestId];
    }

    addMonster(monsterId, monster) {
        this.monsters[monsterId] = monster;
        this.scene.events.emit('monsterSpawned', monster);
    }

    deleteMonster(monsterId) {
        delete this.monsters[monsterId];
    }

    moveMonsters() {
        this.scene.events.emit('monsterMovement', this.monsters);
    }
};