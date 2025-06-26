import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  InteractableType,
  InteractableCommand,
  InteractableCommandReturnType,
  TradingState,
  GameInstance,
  TradingMove,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import Trading from './Trading';

export default class TradingArea extends GameArea<Trading> {
  protected getType(): InteractableType {
    return 'TradingArea';
  }

  private _stateUpdated(updatedState: GameInstance<TradingState>) {
    if (updatedState.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { player1, player2 } = updatedState.state;
        if (player1 && player2) {
          const p1Name =
            this._occupants.find(eachPlayer => eachPlayer.id === player1)?.userName || player1;
          const p2Name =
            this._occupants.find(eachPlayer => eachPlayer.id === player2)?.userName || player2;
          this._history.push({
            gameID,
            scores: {
              [p1Name]: 1,
              [p2Name]: 1,
            },
          });
        }
      }
    }
    // console.log('emitting area changed');
    this._emitAreaChanged();
    // console.log('done emitting area changed');
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    // console.log('handleCommand in tradingArea recieves: ', command);
    if (command.type === 'TradeCommand') {
      const move = command.move as TradingMove;
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      game.applyMove({
        playerID: player.id,
        gameID: game.id,
        move,
      });
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No game in progress, make a new one
        game = new Trading();
        this._game = game;
      }
      game.join(player);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(command.type);
  }
}
