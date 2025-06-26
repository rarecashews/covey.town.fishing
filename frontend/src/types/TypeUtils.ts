import {
  ConversationArea,
  Interactable,
  TicTacToeGameState,
  ViewingArea,
  GameArea,
  FishingArea,
  TradingState,
  FishDisplayArea,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return interactable.type === 'ConversationArea';
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return interactable.type === 'ViewingArea';
}

export function isTicTacToeArea(
  interactable: Interactable,
): interactable is GameArea<TicTacToeGameState> {
  return interactable.type === 'TicTacToeArea';
}

export function isFishingArea(interactable: Interactable): interactable is FishingArea {
  return interactable.type === 'FishingArea';
}

export function isFishDisplayArea(interactable: Interactable): interactable is FishDisplayArea {
  return interactable.type === 'FishDisplayArea';
}

export function isTradingArea(interactable: Interactable): interactable is GameArea<TradingState> {
  return interactable.type === 'TradingArea';
}
