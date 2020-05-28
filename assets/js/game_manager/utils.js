// Used to designate what type of object the spawner will create
const SpawnerType = {
    MONSTER: 'MONSTER',
    CHEST: 'CHEST'
};

// Generate random integer between the minimum and maximum values passed as arguments
function randomNumber(min, max) {
    return Math.floor(Math.random() * max) + min;
}

// This function will receive as parameters an object from the Tiled JSON format, a property name,
// and return the value of this property for this object. This can be done by iterating through the
// object properties until finding the one with the desired name.
function getTiledProperty(obj, property_name) {
    for (var property_index = 0; property_index < obj.properties.length; property_index += 1) {
        var property = obj.properties[property_index];
        if (property.name == property_name) {
            return property.value;
        }
    }
}