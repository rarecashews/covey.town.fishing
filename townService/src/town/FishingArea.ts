import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class FishingArea extends InteractableArea {
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): FishingArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed fishingarea area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new FishingArea(name, rect, broadcastEmitter);
  }

  public constructor(id: string, coordinates: BoundingBox, townEmitter: TownEmitter) {
    super(id, coordinates, townEmitter);
  }

  public toModel(): Interactable {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'FishingArea',
    };
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }
}
