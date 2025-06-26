import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableID,
  TownEmitter,
  FishDisplayArea as FishDisplayAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class FishDisplayArea extends InteractableArea {
  private _model: FishDisplayAreaModel;

  /**
   * @returns the current best fish of the display
   */
  public get bestDisplayFish() {
    return this._model.bestDisplayFish;
  }

  /**
   * @returns the current inventory of fish stored in the display
   */
  public get displayInventory() {
    return this._model.displayInventory;
  }

  /**
   * Creates a new ViewingArea
   *
   * @param viewingArea model containing this area's starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, bestDisplayFish, displayInventory }: Omit<FishDisplayAreaModel, 'type'>,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._model = {
      id: this.id,
      bestDisplayFish,
      displayInventory,
      occupants: this.occupantsByID,
      type: 'FishDisplayArea',
    };
  }

  /**
   * Convert this ViewingArea instance to a simple ViewingAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): FishDisplayAreaModel {
    return {
      id: this.id,
      bestDisplayFish: this._model.bestDisplayFish,
      displayInventory: this._model.displayInventory,
      occupants: this.occupantsByID,
      type: 'FishDisplayArea',
    };
  }

  /**
   * Creates a new ViewingArea object that will represent a Viewing Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    townEmitter: TownEmitter,
  ): FishDisplayArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed fishDisplay area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new FishDisplayArea(
      {
        bestDisplayFish: undefined,
        displayInventory: [],
        id: name as InteractableID,
        occupants: [],
      },
      rect,
      townEmitter,
    );
  }

  /**
   * handles fish display area commands. If a player attempts to take a fish from the display it will return the fish as @class{CatchableFish}
   * @param command
   * @returns
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented');
  }
}
