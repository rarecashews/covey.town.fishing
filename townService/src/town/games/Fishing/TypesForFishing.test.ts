/* eslint-disable no-new */
import spawnFish from './SpawnRandomFish';
import { CatchableFish, CatchableFishSpawner, NumberInRange } from './TypesForFishing';

describe('NumberInRange tests', () => {
  // invalid contructor input, min under zero, max under min. max under zero,
  describe('constructor tests', () => {
    it('tests min under zero throws Error', () => {
      expect(() => new NumberInRange(0, 10)).toThrowError();
    });

    it('tests max under min throws Error', () => {
      expect(() => new NumberInRange(10, 3)).toThrowError();
    });

    it('set to min if no default value is given', () => {
      expect(new NumberInRange(10, 999999).number).toEqual(10);
    });

    it('set to max if given a value bigger than max', () => {
      expect(new NumberInRange(10, 50, 99).number).toEqual(50);
    });
  });

  describe('set and get number works properly', () => {
    let testNIR0: NumberInRange;
    beforeEach(() => {
      testNIR0 = new NumberInRange(50, 100);
    });

    it('tests that set number will properly set to a number in the range', () => {
      const set = 65;
      testNIR0.number = set;
      expect(testNIR0.number === set).toBe(true);
    });

    it('tests that set number doesnt set above max', () => {
      testNIR0.number = testNIR0.max * 2;
      expect(testNIR0.number === testNIR0.max).toBe(true);
    });
    it('tests that set number doesnt set bellow min', () => {
      testNIR0.number = testNIR0.min - 10;
      expect(testNIR0.number === testNIR0.min).toBe(true);
    });
    it('tests 0 input on setRandom sets number to max', () => {
      expect(testNIR0.setRandomNumWithBias(0)).toBe(testNIR0.max);
    });
    it('tests low input makes average significantly higher', () => {
      const runs = 1000;
      let total = 0;

      for (let i = 0; i < runs; i++) {
        total += testNIR0.setRandomNumWithBias(0.1);
      }
      expect(total / runs > (8 / 10) * testNIR0.max);
    });

    it('tests that high input makes average significantly lower', () => {
      const runs = 1000;
      let total = 0;

      for (let i = 0; i < runs; i++) {
        total += testNIR0.setRandomNumWithBias(10);
      }
      expect(total / runs < (2 / 10) * testNIR0.max);
    });
  });
});
describe('Fishing, CatchableFishSpawner Tests', () => {
  const weightRange = new NumberInRange(1, 10);
  const lengthRange = new NumberInRange(1, 50);
  const fishSpawner0 = new CatchableFishSpawner('fish0', 20, 3, weightRange, lengthRange);

  const rarity = 1;
  const name = 'test..';
  const fishSpawner1 = new CatchableFishSpawner(name, rarity, 3, weightRange, lengthRange);
  let fish0: CatchableFish;
  let fish1: CatchableFish;
  describe('constructor works and rejects bad values', () => {
    describe('constructor rejects bad inputs', () => {
      it('tests that empty name throws', () => {
        expect(() => {
          new CatchableFishSpawner('', 20, 3, weightRange, lengthRange);
        }).toThrowError();
      });

      it('tests that invalid rarity throws', () => {
        expect(() => {
          new CatchableFishSpawner('test', 500, 3, weightRange, lengthRange);
        }).toThrowError();
        expect(() => {
          new CatchableFishSpawner('test', 0, 3, weightRange, lengthRange);
        }).toThrowError();
        expect(() => {
          new CatchableFishSpawner('test', -5, 3, weightRange, lengthRange);
        }).toThrowError();
      });

      it('tests that invalid weight range throws', () => {
        expect(() => {
          new CatchableFishSpawner('test', 50, 4, new NumberInRange(1, 750001), lengthRange);
        }).toThrowError();
        expect(() => {
          new CatchableFishSpawner('test', 50, 4, new NumberInRange(-2, 75), lengthRange);
        }).toThrowError();
      });
      it('tests that invalid length range throws', () => {
        expect(() => {
          new CatchableFishSpawner('test', 50, 4, weightRange, new NumberInRange(2, 360));
        }).toThrowError();
        expect(() => {
          new CatchableFishSpawner('test', 50, 4, weightRange, new NumberInRange(-2, 75));
        }).toThrowError();
      });

      it('tests that invalid speed throw', () => {
        expect(() => {
          new CatchableFishSpawner('test', 50, 11, weightRange, lengthRange);
        }).toThrowError();
        expect(() => {
          new CatchableFishSpawner('test', 50, -11, weightRange, lengthRange);
        }).toThrowError();
      });
    });
  });

  describe('constructor makes spawners with given inputs', () => {
    it('tests that rarity is set correctly', () => {
      expect(fishSpawner1.rarity === rarity).toBe(true);
      expect(fishSpawner1.rarity === rarity + 1).toBe(false);
    });

    it('tests that name is set correctly', () => {
      expect(fishSpawner1.name === `${name}gfdgs`).toBe(false);
    });
  });

  describe('spawn method testing', () => {
    beforeEach(() => {
      fish0 = fishSpawner0.spawn();
      fish1 = fishSpawner0.spawn();
    });
    it('tests that spawned fish are within length and weight ranges', () => {
      expect(fish0.length).toBeLessThanOrEqual(lengthRange.max);
      expect(fish0.length).toBeGreaterThanOrEqual(lengthRange.min);

      expect(fish0.weight).toBeLessThanOrEqual(weightRange.max);
      expect(fish0.weight).toBeGreaterThanOrEqual(weightRange.min);
    });
    it('tests that generated fish are different each time (very unlikely but possible to be same)', () => {
      expect(fish0.length !== fish1.length).toBe(true);
      expect(fish0.weight !== fish1.weight).toBe(true);
      expect(fish0.name === fish1.name).toBe(true);
    });
  });
  describe('SpawnRandomFish method testing suite', () => {
    const fishSpawners = [fishSpawner0, fishSpawner1];
    it('tests spawn chances', () => {
      // fish 0 should be 20x more likely
      let i = 0;
      while (i < 0.95) {
        expect(spawnFish(fishSpawners, i).name === fishSpawner0.name).toBe(true);
        i += 0.01;
      }
      let j = 0.96;
      while (j <= 1) {
        expect(spawnFish(fishSpawners, j).name === fishSpawner1.name).toBe(true);
        j += 0.01;
      }
    });

    describe('tests errors', () => {
      it('tests empty array input throws', () => {
        expect(() => {
          spawnFish([], 0);
        }).toThrowError();
      });

      it('tests invalid random num input throws', () => {
        expect(() => {
          spawnFish(fishSpawners, 2);
        }).toThrowError();
        expect(() => {
          spawnFish(fishSpawners, -2);
        }).toThrowError();
      });
    });
  });
});
