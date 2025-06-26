import { GameArea, GameItem, GameStatus, TradingState } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';
import { NO_GAME_IN_PROGRESS_ERROR, PLAYER_NOT_IN_GAME_ERROR } from './TicTacToeAreaController';

export type TradingEvents = GameEventTypes;

export default class TradingAreaController extends GameAreaController<TradingState, TradingEvents> {
  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  get player1(): PlayerController | undefined {
    const p1 = this._model.game?.state.player1;
    if (p1) {
      return this.occupants.find(eachOccupant => eachOccupant.id === p1);
    }
    return undefined;
  }

  get player2(): PlayerController | undefined {
    const p2 = this._model.game?.state.player2;
    if (p2) {
      return this.occupants.find(eachOccupant => eachOccupant.id === p2);
    }
    return undefined;
  }

  get isOurTurnToAccept(): boolean {
    try {
      if (this.oneOrTwo && !this.isOurTurn) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  get ourOffer(): GameItem[] | undefined {
    let offer;
    try {
      if (this.oneOrTwo === '1') {
        offer = this._model.game?.state.offer1;
      } else {
        offer = this._model.game?.state.offer2;
      }
      return offer;
    } catch (e) {
      return [];
    }
  }

  get theirOffer(): GameItem[] | undefined {
    let offer;
    try {
      if (this.oneOrTwo === '1') {
        offer = this._model.game?.state.offer2;
      } else {
        offer = this._model.game?.state.offer1;
      }
      return offer;
    } catch (e) {
      return [];
    }
  }

  /**
   * Tells us if it is our turn, with our turn being defined by the townController
   */
  get isOurTurn(): boolean {
    if (this.whoseTurn) {
      return this.whoseTurn?.id === this._townController.ourPlayer.id;
    }
    return false;
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Returns the number of trades that have been made in this session
   */
  get moveCount(): number {
    return this._model.game?.state.moves.length || 0;
  }

  get whoseTurn(): PlayerController | undefined {
    const p1 = this.player1;
    const p2 = this.player2;
    if (!p1 || !p2 || this._model.game?.state.status !== 'IN_PROGRESS') {
      return undefined;
    }
    // if (this.moveCount % 2 === 0) {
    //   return p1;
    // } else if (this.moveCount % 2 === 1) {
    //   return p2;
    // } else {
    //   throw new Error('Invalid move count');
    // }
    if (this._model.game.state.turn === '1') {
      return p1;
    } else {
      return p2;
    }
  }

  /**
   * tells us if our player is '1' or '2'
   */
  get oneOrTwo(): '1' | '2' {
    if (this.player1?.id === this._townController.ourPlayer.id) {
      return '1';
    } else if (this.player2?.id === this._townController.ourPlayer.id) {
      return '2';
    }
    throw new Error(PLAYER_NOT_IN_GAME_ERROR);
  }

  get accepted(): boolean {
    if (this._model.game) {
      return this._model.game.state.accepted;
    }
    return false;
  }

  public async makeOffer(fish: GameItem[], accept: boolean) {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    try {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'TradeCommand',
        gameID: instanceID,
        move: {
          fish,
          accept,
          player: this.oneOrTwo,
        },
      });
    } catch (e) {
      console.log('error in makeoffer: ', (e as Error).toString());
    }
    // console.log('await done');
  }

  protected _updateFrom(newModel: GameArea<TradingState>): void {
    // console.log('TradingAreaController _updateFrom called');
    super._updateFrom(newModel);
  }
}
