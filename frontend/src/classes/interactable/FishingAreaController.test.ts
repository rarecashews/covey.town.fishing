import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { CatchableFish, InteractableType } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import FishingAreaController from './FishingAreaController';

describe('FishingAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });

  const players = [ourPlayer.id];
  const model = {
    id: nanoid(),
    type: 'FishingArea' as InteractableType,
    occupants: players,
    rodDepth: 0,
    fishDepth: 0,
    progress: 0,
  };
  const fishingAreaController = new FishingAreaController(model);

  describe('createCatchableFish', () => {
    const fishes = [] as CatchableFish[];
    beforeEach(() => {
      for (let i = 0; i < 100; i++) {
        fishes.push(fishingAreaController.createCatchableFish());
      }
    });
    it('should have a correct FishName', () => {
      fishes.map(fish =>
        expect([
          'minnow',
          'salmon',
          'tuna',
          'barracuda',
          'clownfish',
          'shark',
          'narwhal',
          'anglerfish',
          'goldentrout',
          'whale',
        ]).toContain(fish.name),
      );
    });
    it('should have a valid weight', () => {
      fishes.map(fish => expect(fish.weight).toBeGreaterThan(0));
    });
    it('should have a valid length', () => {
      fishes.map(fish => expect(fish.length).toBeGreaterThan(0));
    });
    it('should have a correct rarity', () => {
      fishes.map(fish => expect([0, 1, 2, 3, 4, 5]).toContain(fish.rarity));
    });
    it('should have a valid speed', () => {
      fishes.map(fish => expect(fish.movementSpeed).toBeGreaterThan(0));
      fishes.map(fish => expect(fish.movementSpeed).toBeLessThanOrEqual(3));
    });
    it('should have a valid score', () => {
      fishes.map(fish => expect(fish.score).toBeGreaterThan(0));
    });
  });
  describe('getNewRodDepth', () => {
    const depths = [] as number[];
    beforeEach(() => {
      for (let i = 0; i < 100; i++) {
        depths.push(fishingAreaController.getNewRodDepth(50, 20));
      }
    });
    it('should be a valid depth', () => {
      depths.map(depth => expect(depth).toBeGreaterThanOrEqual(30));
      depths.map(depth => expect(depth).toBeLessThanOrEqual(50));
    });
  });
  describe('getNewProgress', () => {
    it('should return the correct value', () => {
      expect(fishingAreaController.getNewProgress()).toBe(25);
    });
  });
  describe('getNewFishDepth', () => {
    const depths = [] as number[];
    beforeEach(() => {
      for (let i = 0; i < 100; i++) {
        depths.push(fishingAreaController.getNewFishDepth(20, 100));
      }
    });
    it('should be a valid depth', () => {
      depths.map(depth => expect(depth).toBeGreaterThanOrEqual(0));
      depths.map(depth => expect(depth).toBeLessThanOrEqual(80));
    });
  });
  describe('getRandomNumberInRange', () => {
    const numbers = [] as number[];
    beforeEach(() => {
      for (let i = 0; i < 100; i++) {
        numbers.push(fishingAreaController.getRandomNumberInRange(0, 100));
      }
    });
    it('should return a number in the correct range', () => {
      numbers.map(number => expect(number).toBeGreaterThanOrEqual(0));
      numbers.map(number => expect(number).toBeLessThanOrEqual(100));
    });
  });
});
