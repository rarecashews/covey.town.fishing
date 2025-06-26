/* eslint-disable max-classes-per-file */

import InvalidParametersError from '../../../lib/InvalidParametersError';

/**
 * state of the current fishing activity session
 *
 */
export type FishingState = 'Waiting' | 'Hooked' | 'Caught' | 'Escaped';

/**
 * stats of fishing rod. will determine fishing difficulty
 */
export type FishingRod = {
  /**
   * strength of the fishing rod, determines how much overlap the rodDepth and fishDepth need to increase progress.
   */
  Strength: NumberInRange;
  /**
   * speed that progress will increase.
   */
  reelSpeed: NumberInRange;
  /**
   * speed that the rod can moveupwards
   */
  ascent: NumberInRange;

  /**
   * speed that the rod can move downwards
   */
  descent: NumberInRange;
};
/**
 *FishingActivityStatus - Status of a Fishing activity
 */
export type FishingActivityStatus = {
  /**
   * State of current FishingActivity
   */
  state: FishingState;
  /**
   * progress towards catching Fish -default shall be between 0 and 100
   */
  progress: NumberInRange;
  /**
   * current depth of fishing rod
   */
  rodDepth: NumberInRange;
  /**
   * current depth of the fish
   */
  fishDepth: NumberInRange;

  fishingRod: FishingRod;
};

/**
 * fish type for purposes of fishing activity
 */
export type CatchableFish = {
  /**
   * name of this fish
   */
  name: string;

  /**
   * weight of the fish
   */
  weight: number;

  /**
   * length of the fish
   */
  length: number;

  /**
   * rarity of the fish
   */
  rarity: number;

  /**
   * movement speed of the fish
   */
  movementSpeed: number;
};

/**
 * if set to a number greater then the bounds will set to max, if set to a number lower then bounds will set to min
 *
 * default value of number is min unless , until set
 */
export class NumberInRange {
  private _min: number;

  private _max: number;

  private _number: number;

  /**
   * constructs NumberInRange with given min and max values. and optional starting value. else it will start as the minimum value;
   * @param min minimum value this NumberInRange can be set to
   * @param max maximum value this NumberInRange can be set to
   * @param initial Optional, initial value of the number in range
   * @throws InvalidParametersError. when given a max that is lower than min, or min less than or equal to 0;
   */
  public constructor(min: number, max: number, initial?: number) {
    if (min > max || min <= 0) {
      throw new InvalidParametersError(
        'invalid range, min must be lower than max, and both must be above 0',
      );
    }
    this._max = max;
    this._min = min;
    this._number = min;

    if (initial) {
      this._number = this.checkNum(initial);
    }
  }

  /**
   * bias of 0 will always return max value
   * bias of 1 will be nuetral random
   * between 0 and 1 will skew the number higher
   * over 1 will bias the number to the lower end
   * @param bias a number that the rand is raised to the power skewing result higher or lower
   */
  setRandomNumWithBias(bias: number) {
    this.number = Math.abs(Math.random() ** bias * (this._max - this._min + 1) + this._min);
    return this.number;
  }

  set number(number: number) {
    this._number = this.checkNum(number);
  }

  get number(): number {
    return this._number;
  }

  protected checkNum(number: number) {
    if (number >= this._min) {
      return number <= this._max ? number : this._max;
    }
    return this._min;
  }

  get max(): number {
    return this._max;
  }

  get min(): number {
    return this._min;
  }
}

const MAX_EARTH_FISH_WEIGHT = 750000;
const MAX_EARTH_FISH_LENGTH = 350;
const MAX_EARTH_FISH_MOVEMENT_SPEED = 10;
const MAX_FISH_RARITY = 100;
const RANDOM_SPAWN_BIAS = 1.5;

const INVALID_WEIGHT_RANGE_ERROR = `Invalid weight range, min must be greater than 0 and less than max, max cannot be above ${MAX_EARTH_FISH_WEIGHT}`;

const INVALID_LENGTH_RANGE_ERROR = `Invalid length paramenters, minLength must be above 0, and below maxLength, maxLength must be between 1 and ${MAX_EARTH_FISH_LENGTH}`;

const INVALID_FISH_RARITY_ERROR = `should be between 1 and ${MAX_FISH_RARITY}`;
const INVALID_FISHSPEED_ERROR = `Fish movementSpeed should not be more then ${MAX_EARTH_FISH_MOVEMENT_SPEED}`;
const INVALID_FISH_NAME_ERROR = 'Name must be atleast 1 char long';

/**
 * Object with the ability to randomly generate a fish within the parameters given to the constructor
 */
export class CatchableFishSpawner {
  private _name: string;

  private _weightRange: NumberInRange;

  private _lengthRange: NumberInRange;

  private _movementSpeed: number;

  private _rarity: number;

  /**
   * Initializes a @type {CatchableFishSpawner}
   * @param name name of this type of fish
   * @param weightRange @type {NumberInRange} range cannot exeed 750,000 the outer bounds for the weight of the largest whale ever to exist on earth. This may have to be changed if we start fishing on another planet... ?
   * @param lengthRange @type {NumberInRange} denoting the range of possible lengths for this fish
   * @param rarity rarity of fish, must be above 0, higher numbers are more common
   * @param movementSpeed Speed of the fish must be bellow @var {MAX_EARTH_FISH_MOVEMENT_SPEED}
   * @throws InvalidParametersError. when weight limit of 750000lb is broken
   * @throws InvalidParametersError. when length of 350ft limit is broken
   * @throws InvalidParametersError. when rarity, is set below 1 or above 100
   * @throws InvalidParametersError. when the absolute value of the movement speed is above 10
   */
  public constructor(
    name: string,
    rarity: number,
    movementSpeed: number,
    weightRange: NumberInRange,
    lengthRange: NumberInRange,
  ) {
    if (name.length < 1) {
      throw new InvalidParametersError(INVALID_FISH_NAME_ERROR);
    }
    if (weightRange.min < 0 || weightRange.max >= MAX_EARTH_FISH_WEIGHT) {
      throw new InvalidParametersError(INVALID_WEIGHT_RANGE_ERROR);
    }
    if (lengthRange.min < 0 || lengthRange.max > MAX_EARTH_FISH_LENGTH) {
      throw new InvalidParametersError(INVALID_LENGTH_RANGE_ERROR);
    }
    if (rarity <= 0 || rarity >= MAX_FISH_RARITY) {
      throw new InvalidParametersError(INVALID_FISH_RARITY_ERROR);
    }
    if (Math.abs(movementSpeed) >= MAX_EARTH_FISH_MOVEMENT_SPEED) {
      throw new InvalidParametersError(INVALID_FISHSPEED_ERROR);
    }

    this._weightRange = weightRange;
    this._lengthRange = lengthRange;
    this._name = name;
    this._rarity = rarity;
    this._movementSpeed = movementSpeed;
  }

  /**
   * generates a @type {CatchableFish} within the parameters of the Object spawning the fish.
   */
  public spawn(): CatchableFish {
    const catchableFish: CatchableFish = {
      name: this.name,

      weight: this._weightRange.setRandomNumWithBias(RANDOM_SPAWN_BIAS),

      length: this._lengthRange.setRandomNumWithBias(RANDOM_SPAWN_BIAS),

      rarity: this.rarity,

      movementSpeed: this._movementSpeed,
    };

    return catchableFish;
  }

  public get name() {
    return this._name;
  }

  public get rarity() {
    return this._rarity;
  }
}
