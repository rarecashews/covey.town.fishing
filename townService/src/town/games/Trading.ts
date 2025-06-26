import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Game from './Game';
import Player from '../../lib/Player';
import { GameMove, TradingMove, TradingState } from '../../types/CoveyTownSocket';

export default class Trading extends Game<TradingState, TradingMove> {
  private _checkForGameEnding(move: TradingMove) {
    if (move.accept) {
      this.state = {
        ...this.state,
        status: 'OVER',
        accepted: true,
      };
    }
  }

  private _validateMove(move: TradingMove) {
    // player tries to make out of turn (this shouldnt happen with button but who knows)
    // if () {
    //   throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    // } else if () {
    //   throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    // }

    // A move is valid only if game is in progress
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
  }

  private _applyMove(move: TradingMove): void {
    // this.state = {
    //   ...this.state,
    //   moves: [...this.state.moves, move],
    // };

    if (!move.accept) {
      if (move.player === '1') {
        this.state = {
          ...this.state,
          turn: '2',
          offer1: move.fish,
        };
      } else {
        this.state = {
          ...this.state,
          turn: '1',
          offer2: move.fish,
        };
      }
    }

    this._checkForGameEnding(move);
  }

  public applyMove(move: GameMove<TradingMove>): void {
    let player: '1' | '2';
    if (move.playerID === this.state.player1) {
      player = '1';
    } else {
      player = '2';
    }

    const cleanMove = {
      player,
      fish: move.move.fish,
      accept: move.move.accept,
    };
    this._validateMove(cleanMove);
    this._applyMove(cleanMove);
  }

  protected _join(player: Player): void {
    if (this.state.player1 === player.id || this.state.player2 === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.player1) {
      this.state = {
        ...this.state,
        player1: player.id,
      };
    } else if (!this.state.player2) {
      this.state = {
        ...this.state,
        player2: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.player1 && this.state.player2) {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
      };
    }
  }

  protected _leave(player: Player): void {
    if (this.state.player1 !== player.id && this.state.player2 !== player.id) {
      return;
    }
    // Handles case where the game has not started yet
    if (this.state.player2 === undefined) {
      this.state = {
        moves: [],
        status: 'WAITING_TO_START',
        turn: '1',
        offer1: [],
        offer2: [],
        accepted: false,
      };
      return;
    }
    if (this.state.player1 === player.id) {
      this.state = {
        ...this.state,
        status: 'OVER',
      };
    } else {
      this.state = {
        ...this.state,
        status: 'OVER',
      };
    }
  }

  public constructor() {
    super({
      status: 'WAITING_TO_START',
      moves: [],
      turn: '1',
      offer1: [],
      offer2: [],
      accepted: false,
    });
  }
}
