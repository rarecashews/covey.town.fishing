import { DisplayFish, FishDisplayArea as FishDisplayAreaModel } from '../../types/CoveyTownSocket';
import TownController from '../TownController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

/**
 * The events that a ViewingAreaController can emit
 */
export type FishDisplayAreaEvents = BaseInteractableEventMap & {
  /**
   * A bestDisplayFishChange event indicated that the fish display should display a different fish.
   * Listeners are passed the new state in the parameter `newFish`
   */
  bestDisplayFishChange: (newFish: DisplayFish | undefined) => void;
  /**
   * A progressChange event indicates that the progress of the video has changed, either
   * due to the user scrubbing through the video, or from the natural progression of time.
   * Listeners are passed the new playback time elapsed in seconds.
   */
  displayInventoryChange: (displayInventory: DisplayFish[]) => void;
};

/**
 * A FishingDisplayAreaController manages the state for a FishingDisplayArea in the frontend app, serving as a bridge between the players fish
 * the backend TownService, ensuring that all players see the same fish displays
 *
 * The FishingDisplayAreaController implements callbacks that handle events from the players and
 * emits updates when the state is updated, @see FishDisplayAreaEvents
 */
export default class FishingDisplayAreaController extends InteractableAreaController<
  FishDisplayAreaEvents,
  FishDisplayAreaModel
> {
  private _townController: TownController;

  private _model: FishDisplayAreaModel;

  /**
   * Constructs a new ViewingAreaController, initialized with the state of the
   * provided viewingAreaModel.
   *
   * @param displayAreaModel The display area model that this controller should represent
   */
  constructor(displayAreaModel: FishDisplayAreaModel, townController: TownController) {
    super(displayAreaModel.id);
    this._townController = townController;
    this._model = displayAreaModel;
  }

  public isActive(): boolean {
    return this._model.bestDisplayFish !== undefined;
  }

  /**
   * Applies updates to this viewing area controller's model, setting the fields
   * isPlaying, elapsedTimeSec and video from the updatedModel
   *
   * @param updatedModel
   */
  protected _updateFrom(): void {
    throw new Error('Method not implemented.');
  }

  /**
   * @returns FishDisplayAreaModel that represents the current state of this ViewingAreaController
   */
  public toInteractableAreaModel(): FishDisplayAreaModel {
    return this._model;
  }
}
