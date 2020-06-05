// an object used to represent a specific, created chest behind-the-scenes.
// Contains the data that will be used to create an in-game chest object (made from Chest.js class)
class ChestModel {
    constructor (x, y, gold, spawnerId) {
        this.id = `${spawnerId}-${uuid.v4()}`;
        this.spawnerId = spawnerId;
        this.x = x;
        this.y = y;
        this.gold = gold;
    }
}