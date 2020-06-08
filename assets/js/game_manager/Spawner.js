// a behind-the-scenes object that represents one of the spawners keyed to our tilemap.
// Each generates a certain type of object and holds an array of possible locations where it can spawn things.
class Spawner {
    constructor (config, spawnLocations, addObject, deleteObject, moveObjects) {
        this.id = config.id; // unique ID that will be used to track this spawner in the "spawners" object of the game manager
        this.spawnInterval = config.spawnInterval; // used to check when a respawn may be needed
        this.limit = config.limit; // max number of objects the spawner is allowed to create at any given time
        this.objectType = config.spawnerType; // allows the same spawner class to be used for multiple object types
        this.spawnLocations = spawnLocations; // all possible locations the spawner may spawn objects (parsed from object layer map data)
        
        // interaction between spawner class and game manager class
        this.addObject = addObject;
        this.deleteObject = deleteObject;
        this.moveObjects = moveObjects;

        this.objectsCreated = [];

        this.start();
    }

    // if the number of created objects stored in the "objectsCreated" array is less than the set limit, a new object will be spawned every specified interval
    start() {
        this.interval = setInterval (() => {
            if (this.objectsCreated.length < this.limit) {
                this.spawnObject();
            }
        }, this.spawnInterval);

        // if object spawned was a monster, this starts it moving
        if (this.objectType === SpawnerType.MONSTER) {
            this.moveMonsters();
        }
    }

    // a new object is spawned based on specified type
    spawnObject() {
        if (this.objectType === SpawnerType.CHEST) {
            this.spawnChest();
        } else if (this.objectType === SpawnerType.MONSTER) {
            this.spawnMonster();
        }
    }

    // chooses one of the keyed spawner's possible locations, then generates a new Chest Model associated with it,
    // then stores it in the array of objectsCreated by that spawner. The spawnChest function then
    // uses the type specific add function passed in when the spawner was created in order to
    // store the new chest model object in the game manager's relevant "chests" array
    spawnChest () {
        const location = this.pickRandomLocation();
        const chest = new ChestModel(location[0], location[1], randomNumber(10, 20), this.id);
        this.objectsCreated.push(chest);
        this.addObject(chest.id, chest);
    }

    spawnMonster () {
        const location = this.pickRandomLocation();
        const monster = new MonsterModel(
            location[0],
            location[1],
            randomNumber(10, 20),
            this.id,
            randomNumber(0, 20),
            randomNumber(3, 5),
            1,
        );
        this.objectsCreated.push(monster);
        this.addObject(monster.id, monster);
    }

    // randomly picks one of the spawner's stored possible locations by random index number, but it cannot pick a location identical to one already held by an "objectsCreated" object
    pickRandomLocation() {
        const location = this.spawnLocations[Math.floor(Math.random() * this.spawnLocations.length)];
        const invalidLocation = this.objectsCreated.some((obj) => {
            if (obj.x === location[0] && obj.y === location[1]) {
                return true;
            }
            return false;
        });

        // if first attempt at generating an unused random location fails, this recursive call will keep trying until a valid one is created
        if (invalidLocation) {
            return this.pickRandomLocation();
        }

        return location;
    }

    // triggered when player overlaps actual in-game chest, game scene emits a pickup event, this is heard by game manager which calls this method
    // filters array of created objects to now only includes objects NOT matching the passed ID. The method for deleting, passed in from the game manager,
    // is then called to remove the object from the relevant array in the game manager
    removeObject(id) {
        this.objectsCreated = this.objectsCreated.filter(obj => obj.id !== id);
        this.deleteObject(id);
    }

    moveMonsters() {
        this.moveMonsterInterval = setInterval (() => {
            this.objectsCreated.forEach((monster) => {
                monster.move();
            });

            this.moveObjects();
        }, 1000);
    }
}