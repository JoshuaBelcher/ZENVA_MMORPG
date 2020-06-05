// this class handles all of the properties and methods needed for generating a scene map, reducing scene code clutter
// and allowing for easy reuse in multiple scenes
class Map {
    constructor(scene, key, tileSetName, bgLayerName, blockedLayerName) {
        this.scene = scene; // the scene this map belongs to
        this.key = key; // Tiled JSON file key name
        this.tileSetName = tileSetName; // Tiled Tileset image key name
        this.bgLayerName = bgLayerName; // the name of the layer created in Tiled for the background
        this.blockedLayerName = blockedLayerName; // the name of the layer created in Tiled for the blocked layer
        
        this.createMap();
    } 

    createMap() {
        // create the tile map
        this.map = this.scene.make.tilemap({ key: this.key});

        // add the tileset image to our map
        this.tiles = this.map.addTilesetImage(this.tileSetName, this.tileSetName, 32, 32, 1, 2);

        //create our background
        this.backgroundLayer = this.map.createStaticLayer(this.bgLayerName, this.tiles, 0, 0);
        this.backgroundLayer.setScale(2);

        // create blocked layer
        this.blockedLayer = this.map.createStaticLayer(this.blockedLayerName, this.tiles, 0, 0);
        this.blockedLayer.setScale(2);
        // array value of "-1" means all tiles in the layer will be checked for collisions
        this.blockedLayer.setCollisionByExclusion([-1]);

        // update the world bounds (*2 because layers were scaled up by a factor of 2--see above)
        this.scene.physics.world.bounds.width = this.map.widthInPixels * 2;
        this.scene.physics.world.bounds.height = this.map.heightInPixels * 2;

        // limit the camera to the size of the map
        this.scene.cameras.main.setBounds(0, 0, this.map.widthInPixels * 2, this.map.heightInPixels * 2);
    }
}