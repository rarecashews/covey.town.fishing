import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { GameResult, GameStatus } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import GameAreaController from './GameAreaController';
import TradingAreaController from './TradingAreaController';

describe('TradingAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });

  function tradingAreaControllerWithProp({
    _id,
    history,
    undefinedGame,
    status,
  }: {
    _id?: string;
    history?: GameResult[];
    undefinedGame?: boolean;
    status?: GameStatus;
  }) {
    const id = _id || nanoid();
    const players = [];
    players.push(ourPlayer.id);
    const ret = new TradingAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'TradingArea',
        game: undefinedGame
          ? undefined
          : {
              id,
              players: players,
              state: {
                status: status || 'IN_PROGRESS',
                moves: [],
                player1: undefined,
                player2: undefined,
                turn: '1',
                offer1: [],
                offer2: [],
                accepted: false,
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }
  describe('isActive', () => {
    it('should return true if the game is in progress', () => {
      const controller = tradingAreaControllerWithProp({
        status: 'IN_PROGRESS',
      });
      expect(controller.isActive()).toBe(true);
    });
    it('should return false if the game is not in progress', () => {
      const controller = tradingAreaControllerWithProp({
        status: 'OVER',
      });
      expect(controller.isActive()).toBe(false);
    });
  });
  describe('getStatus', () => {
    it('should return the status of the game if the game is in progress', () => {
      const controller = tradingAreaControllerWithProp({
        status: 'IN_PROGRESS',
      });
      expect(controller.status).toBe('IN_PROGRESS');
    });
    it('should return the status of the game if the game is over', () => {
      const controller = tradingAreaControllerWithProp({
        status: 'OVER',
      });
      expect(controller.status).toBe('OVER');
    });
    it('should return WAITING_TO_START if the game is not defined', () => {
      const controller = tradingAreaControllerWithProp({
        undefinedGame: true,
      });
      expect(controller.status).toBe('WAITING_TO_START');
    });
  });
  describe('updateFrom', () => {
    it('should call super._updateFrom', () => {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore - we are testing spying on a private method
      const spy = jest.spyOn(GameAreaController.prototype, '_updateFrom');
      const controller = tradingAreaControllerWithProp({});
      const model = controller.toInteractableAreaModel();
      controller.updateFrom(model, otherPlayers.concat(ourPlayer));
      expect(spy).toHaveBeenCalled();
    });
  });
});
