import { FishName, FishingArea as FishingAreaModel } from '../../types/CoveyTownSocket';
import { CatchableFish as CatchableFish } from '../../types/CoveyTownSocket';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
export type FishingAreaEvents = BaseInteractableEventMap;

export default class FishingAreaController extends InteractableAreaController<
  FishingAreaEvents,
  FishingAreaModel
> {
  private _model: FishingAreaModel;

  getNewFish(): CatchableFish {
    return this.createCatchableFish();
  }

  getNewRodDepth(fishDepth: number, rodSize: number): number {
    return Math.round(this.getRandomNumberInRange(fishDepth - rodSize, fishDepth));
  }

  getNewProgress(): number {
    return 25;
  }

  getNewFishDepth(fishSize: number, maxDepth: number): number {
    return Math.round(this.getRandomNumberInRange(0, maxDepth - fishSize));
  }

  createCatchableFish(): CatchableFish {
    const weightedFishCategories: {
      name: FishName;
      chance: number;
      rarity: number;
      speed: number;
      weight: number;
      length: number;
    }[] = [
      { name: 'minnow', chance: 15, rarity: 1, speed: 0.4, weight: 20, length: 10 },
      { name: 'salmon', chance: 30, rarity: 1, speed: 0.6, weight: 40, length: 30 },
      { name: 'tuna', chance: 42.5, rarity: 2, speed: 0.7, weight: 20, length: 10 },
      { name: 'barracuda', chance: 55, rarity: 2, speed: 1.3, weight: 20, length: 60 },
      { name: 'clownfish', chance: 65, rarity: 3, speed: 0.5, weight: 20, length: 20 },
      { name: 'shark', chance: 75, rarity: 3, speed: 1.1, weight: 50, length: 100 },
      { name: 'narwhal', chance: 82.5, rarity: 4, speed: 1.3, weight: 75, length: 85 },
      { name: 'anglerfish', chance: 90, rarity: 4, speed: 0.7, weight: 80, length: 75 },
      { name: 'goldentrout', chance: 95, rarity: 5, speed: 1.5, weight: 90, length: 110 },
      { name: 'whale', chance: 100, rarity: 5, speed: 1.2, weight: 95, length: 100 },
    ];

    const randomWeight = Math.random() * 100;
    let selectedFish = weightedFishCategories.find(fish => randomWeight <= fish.chance);
    if (!selectedFish) {
      selectedFish = weightedFishCategories[0];
    }
    const baseScore = (selectedFish.length + selectedFish.weight) * selectedFish.rarity;
    const varianceFactor = (Math.random() - 0.5) * 0.4;

    const newFish: CatchableFish = {
      name: selectedFish.name,
      weight: Math.random() * selectedFish.weight,
      length: Math.random() * selectedFish.length,
      rarity: selectedFish.rarity,
      movementSpeed: selectedFish.speed,
      id: Date.now(), // this is temporary, should maybe fix this with a UUID
      description: selectedFish.name,
      score: baseScore + baseScore * varianceFactor,
    };
    return newFish;
  }

  getRandomNumberInRange(min: number, max: number): number {
    if (min > max) {
      throw new Error('Invalid range: min must be less than or equal to max.');
    }

    return Math.random() * (max - min) + min;
  }

  toInteractableAreaModel(): FishingAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'FishingArea',
      rodDepth: 0,
      fishDepth: 0,
      progress: 0,
    };
  }

  protected _updateFrom(newModel: FishingAreaModel): void {
    throw new Error('Method not implemented.' + newModel);
  }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  /**
   * Create a new ConversationAreaController
   * @param id
   */
  constructor(fishingAreaModel: FishingAreaModel) {
    super(fishingAreaModel.id);
    this._model = fishingAreaModel;
  }
}
