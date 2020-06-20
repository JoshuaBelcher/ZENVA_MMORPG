class Monster extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, key, frame, id, health, maxHealth) {
        super(scene, x, y, key, frame);
        this.scene = scene;
        this.id = id;
        this.health = health;
        this.maxHealth = maxHealth;

        //enable physics
        this.scene.physics.world.enable(this);
        //set immovable if another object collides with our monster
        this.setImmovable(false);
        // scale our monster
        this.setScale(2);
        // collide with world bounds
        this.setCollideWorldBounds(true);
        // add the monster to our existing scene
        this.scene.add.existing(this);
        // update the origin, this allows the health bar to be oriented properly in relation to the monster
        this.setOrigin(0);

        this.createHealthBar();
    }

    // uses Phaser's built-in graphics to generate a health bar for visually indicating monster health
    createHealthBar() {
        this.healthBar = this.scene.add.graphics();
        // the logic below, for updating the health bar's actual display, is now separated from the creation of the bar above
        this.updateHealthBar();
    }

    updateHealthBar() {
        this.healthBar.clear(); // clears all graphics that have been drawn so that they can be redrawn for the update
        this.healthBar.fillStyle(0xffffff, 1); // sets fill color and opacity of background bar
        this.healthBar.fillRect(this.x, this.y - 8, 64, 5); // sets coordinates of background bar slightly above monster and dimensions
        this.healthBar.fillGradientStyle(0xff0000, 0xffffff,4); // gives the  next bar a hue gradient
        this.healthBar.fillRect(this.x, this.y - 8, 64 * (this.health / this.maxHealth), 5); // overlay bar with length proportional to current health point ratio
    }

    updateHealth(health) {
        this.health = health;
        this.updateHealthBar();
    }

    makeActive() {
        this.setActive(true);
        this.setVisible(true);
        this.body.checkCollision.none = false;
        // redraws the previously cleared health bar graphic
        this.updateHealthBar();
    }

    makeInactive() {
        this.setActive(false);
        this.setVisible(false);
        this.body.checkCollision.none = true;
        // clears out the drawn health bar graphic
        this.healthBar.clear();
    }

    update() {
        this.updateHealthBar();
    }
}