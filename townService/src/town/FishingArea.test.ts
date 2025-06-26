import { mock } from 'jest-mock-extended';
import Player from '../lib/Player';
import { InteractableCommand, TownEmitter } from '../types/CoveyTownSocket';
import FishingArea from './FishingArea';

describe('FishingArea', () => {
  const townEmitter = mock<TownEmitter>();
  const testBox = { x: 100, y: 100, width: 100, height: 100 };
  const fishingArea = new FishingArea('test', testBox, townEmitter);
  const ourPlayer = new Player('player', townEmitter);
  fishingArea.add(ourPlayer);
  describe('toModel', () => {
    it('should return the model correctly', () => {
      const model = fishingArea.toModel();
      expect(model).toStrictEqual({ id: 'test', occupants: [ourPlayer.id], type: 'FishingArea' });
    });
  });
  describe('handleCommand', () => {
    const command = { type: 'JoinGame' } as InteractableCommand;
    expect(() => fishingArea.handleCommand(command, ourPlayer)).toThrow('Method not implemented.');
  });
});
