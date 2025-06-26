import { CatchableFishSpawner, CatchableFish } from './TypesForFishing';

// used to generate random fish from list of fish
type CatchableFishSpawnerCumulative = {
  fishSpawner: CatchableFishSpawner;
  cumulativeRarity: number;
};
/**
 * spawns a fish randomly from of of the given list of fish spawners.
 * @param possibleFish list of names of fish that could potentially be spawned.
 * @returns generates a @type {CatchableFish} from one of the possible @type {CatchableFishSpawner} given as input
 * @throws error if the fish spawner list is incorrect
 */
export default function spawnFish(
  possibleFish: CatchableFishSpawner[],
  random: number,
): CatchableFish {
  if (possibleFish.length < 1) {
    throw new Error('No Valid CatchableFishSpawner Given to spawnFish method');
  }
  if (random < 0 || random > 1) {
    throw new Error('Random number must be between 0 and 1');
  }

  // initializes possible fish array with cumulative rarities.
  const possibleFishCumulative: CatchableFishSpawnerCumulative[] = [
    { fishSpawner: possibleFish[0], cumulativeRarity: possibleFish[0].rarity },
  ];

  for (let i = 1; i < possibleFish.length; i++) {
    possibleFishCumulative[i] = {
      fishSpawner: possibleFish[i],
      cumulativeRarity: possibleFishCumulative[i - 1].cumulativeRarity + possibleFish[i].rarity,
    };
  }

  const spawnDiceRoll =
    random * possibleFishCumulative[possibleFishCumulative.length - 1].cumulativeRarity;

  let i = 0;
  while (i < possibleFishCumulative.length) {
    if (spawnDiceRoll <= possibleFishCumulative[i].cumulativeRarity) {
      break;
    }
    i++;
  }

  return possibleFishCumulative[i].fishSpawner.spawn();
}
