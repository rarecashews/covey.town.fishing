import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import {
  Player as PlayerModel,
  PlayerLocation,
  PlayerInventory,
  GameItem,
  CatchableFish,
} from '../types/CoveyTownSocket';
import { db } from './firebase';
// eslint-disable-next-line import/no-extraneous-dependencies
import { getDocs, collection, addDoc, query, deleteDoc } from '@firebase/firestore';
export const MOVEMENT_SPEED = 175;

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
  inventoryChanged: (newInventory: PlayerInventory) => void;
};

export type PlayerGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean /* For the local player, the game scene will calculate the current location, and we should NOT apply updates when we receive events */;
};
export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private _inventory: PlayerInventory;

  private readonly _id: string;

  private readonly _userName: string;

  public gameObjects?: PlayerGameObjects;

  constructor(id: string, userName: string, location: PlayerLocation) {
    super();
    this._id = id;
    this._userName = userName;
    this._location = location;
    this._inventory = [];
  }

  set inventory(newInventory: PlayerInventory) {
    this._inventory = newInventory;
    this.emit('inventoryChanged', newInventory);
  }

  get inventory(): PlayerInventory {
    return this._inventory;
  }

  // adds a GameItem to the player's inventory
  addToInventory(item: GameItem) {
    this._inventory.push(item);
    this.emit('inventoryChanged', this._inventory);
  }

  // updates local player inventory by copying db
  async getFishInvFromDB(townName: string) {
    try {
      const username = this.userName;
      const querySnapshot = await getDocs(
        collection(db, 'towns', townName, 'players', username, 'fishes'),
      );
      this.inventory = [];
      querySnapshot.forEach(doc => {
        if (!this._inventory.some((invFish: GameItem) => invFish.id === doc.data().fish.id)) {
          const fishData = doc.data().fish;
          const catchableFish: CatchableFish = {
            name: fishData.name,
            weight: fishData.weight,
            length: fishData.length,
            rarity: fishData.rarity,
            movementSpeed: fishData.movementSpeed,
            id: fishData.id,
            description: fishData.description,
            score: fishData.score,
          };
          this._inventory.push(catchableFish);
        }
      });
    } catch (e) {
      console.error('Error updating document: ', e);
    }
    return this.inventory;
  }

  // uploads the given fish game item to the db
  addToDBInventory(item: GameItem, townName: string) {
    this._inventory.push(item);
    try {
      const username = this.userName;

      addDoc(collection(db, 'towns', townName, 'players', username, 'fishes'), {
        fish: item,
      });
      console.log('Document written');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
    this.emit('inventoryChanged', this._inventory);
  }

  // Replaces DB inventory with given array of fish
  async replaceDBInventory(items: GameItem[], townName: string) {
    console.log('replaceDBInventory received:', items);
    try {
      await this.clearInventoryDB(townName);
      const username = this.userName;
      for (let i = 0; i < items.length; i++) {
        const currentItem = items[i];
        addDoc(collection(db, 'towns', townName, 'players', username, 'fishes'), {
          fish: currentItem,
        });
      }
    } catch (e) {
      console.error('Error adding document: ', e);
    }
    this.emit('inventoryChanged', this._inventory);
  }

  // removes the player's inventory on the db
  public async clearInventoryDB(townName: string) {
    try {
      const fishCollectionRef = collection(
        db,
        'towns',
        townName,
        'players',
        this.userName,
        'fishes',
      );
      const querySnapshot = await getDocs(query(fishCollectionRef));
      querySnapshot.forEach(async res => {
        await deleteDoc(res.ref);
      });
      console.log('Inventory clear');
    } catch (e) {
      console.error('Error deleting fish inv: ', e);
    }
  }

  // removes a GameItem from the player's inventory
  removeFromInventory(item: GameItem) {
    this._inventory = this._inventory.filter(arrItem => arrItem !== item);
    this.emit('inventoryChanged', this._inventory);
  }

  set location(newLocation: PlayerLocation) {
    this._location = newLocation;
    this._updateGameComponentLocation();
    this.emit('movement', newLocation);
  }

  get location(): PlayerLocation {
    return this._location;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  toPlayerModel(): PlayerModel {
    return { id: this.id, userName: this.userName, location: this.location };
  }

  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite, label } = this.gameObjects;
      if (!sprite.anims) return;
      sprite.setX(this.location.x);
      sprite.setY(this.location.y);
      if (this.location.moving) {
        sprite.anims.play(`misa-${this.location.rotation}-walk`, true);
        switch (this.location.rotation) {
          case 'front':
            sprite.body.setVelocity(0, MOVEMENT_SPEED);
            break;
          case 'right':
            sprite.body.setVelocity(MOVEMENT_SPEED, 0);
            break;
          case 'back':
            sprite.body.setVelocity(0, -MOVEMENT_SPEED);
            break;
          case 'left':
            sprite.body.setVelocity(-MOVEMENT_SPEED, 0);
            break;
        }
        sprite.body.velocity.normalize().scale(175);
      } else {
        sprite.body.setVelocity(0, 0);
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-${this.location.rotation}`);
      }
      label.setX(sprite.body.x);
      label.setY(sprite.body.y - 20);
    }
  }

  static fromPlayerModel(modelPlayer: PlayerModel): PlayerController {
    return new PlayerController(modelPlayer.id, modelPlayer.userName, modelPlayer.location);
  }
}
