import { CatchableFishSpawner, NumberInRange } from './TypesForFishing';

/**
 * using this file to create all of the fish spawners that may be used in the fishingActivity
 */

const salmonSpawner: CatchableFishSpawner = new CatchableFishSpawner(
  'salmon',
  50,
  5,
  new NumberInRange(10, 30),
  new NumberInRange(15, 45),
);
const sharkSpawner: CatchableFishSpawner = new CatchableFishSpawner(
  'shark',
  10,
  7,
  new NumberInRange(50, 300),
  new NumberInRange(40, 135),
);
const anglerSpawner: CatchableFishSpawner = new CatchableFishSpawner(
  'angler',
  10,
  7,
  new NumberInRange(40, 150),
  new NumberInRange(20, 30),
);
const nemoSpawner: CatchableFishSpawner = new CatchableFishSpawner(
  'clownfish',
  7,
  7,
  new NumberInRange(0.1, 1.3),
  new NumberInRange(1, 7),
);

const ALL_FISH: CatchableFishSpawner[] = [nemoSpawner, sharkSpawner, anglerSpawner, salmonSpawner];

export default ALL_FISH;
