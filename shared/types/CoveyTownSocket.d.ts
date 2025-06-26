import InvalidParametersError from "../../../../townservice/src/lib/InvalidParametersError";

export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: TypedInteractable[];
}

export type InteractableType = 'ConversationArea' | 'ViewingArea' | 'TicTacToeArea' | 'FishingArea' | 'TradingArea' | 'FishDisplayArea';
export interface Interactable {
  type: InteractableType;
  id: InteractableID;
  occupants: PlayerID[];
}

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Direction = 'front' | 'back' | 'left' | 'right';

export type PlayerID = string;
export interface Player {
  id: PlayerID;
  userName: string;
  location: PlayerLocation;
};

// base type for GameItems
export interface GameItem {
  id: number;
  description: string;
}

// in the future "GameItem" will likely have to be expanded as a type to include more information
export type PlayerInventory = GameItem[]

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
};

export interface ConversationArea extends Interactable {
  topic?: string;
};
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea extends Interactable {
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export interface FishDisplayArea extends Interactable {
  bestDisplayFish?: DisplayFish;
  displayInventory: DisplayFish[];
}

export type DisplayFish = {
  fish: CatchableFish,
  player: PlayerID
}
export function removeFromDisplay(playerID:PlayerID,fish:CatchableFish, fishDisplayArea:FishDisplayArea){
  if(fishDisplayArea.displayInventory.includes({player:playerID,fish})){
    return fish;
  }
  return undefined;
}



export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER';
/**
 * Base type for the state of a game
 */
export interface GameState {
  status: GameStatus;
} 

/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState {
  winner?: PlayerID;
}
/**
 * Base type for a move in a game. Implementers should also extend MoveType
 * @see MoveType
 */
export interface GameMove<MoveType> {
  playerID: PlayerID;
  gameID: GameInstanceID;
  move: MoveType;
}

export type TicTacToeGridPosition = 0 | 1 | 2;

/**
 * Type for a move in TicTacToe
 */
export interface TicTacToeMove {
  gamePiece: 'X' | 'O';
  row: TicTacToeGridPosition;
  col: TicTacToeGridPosition;
}

/**
 * Type for the state of a TicTacToe game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (x and o)
 * The first player to join the game is x, the second is o
 */
export interface TicTacToeGameState extends WinnableGameState {
  moves: ReadonlyArray<TicTacToeMove>;
  x?: PlayerID;
  o?: PlayerID;
}

export type InteractableID = string;
export type GameInstanceID = string;

/**
 * Type for the result of a game
 */
export interface GameResult {
  gameID: GameInstanceID;
  scores: { [playerName: string]: number };
}

/**
 * Base type for an *instance* of a game. An instance of a game
 * consists of the present state of the game (which can change over time),
 * the players in the game, and the result of the game
 * @see GameState
 */
export interface GameInstance<T extends GameState> {
  state: T;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}

/**
 * Base type for an area that can host a game
 * @see GameInstance
 */
export interface GameArea<T extends GameState> extends Interactable {
  game: GameInstance<T> | undefined;
  history: GameResult[];
}

// FISHING GAME STUFF GOES BELOW HERE
export interface FishingArea extends Interactable {
  rodDepth: number;
  fishDepth: number;
  progress: number;
}

// TRADING AREA STUFF GOES BELOW HERE
export type TradingArea = GameArea

export interface TradingState extends GameState {
  moves: ReadonlyArray<TradingMove>;
  player1?: PlayerID;
  player2?: PlayerID;
  turn: '1' | '2';
  offer1: GameItem[];
  offer2: GameItem[];
  accepted: boolean;
}

export interface TradingMove {
  player: '1' | '2';
  fish: GameItem[];
  accept: boolean;
}


export type CommandID = string;

/**
 * Base type for a command that can be sent to an interactable.
 * This type is used only by the client/server interface, which decorates
 * an @see InteractableCommand with a commandID and interactableID
 */
interface InteractableCommandBase {
  /**
   * A unique ID for this command. This ID is used to match a command against a response
   */
  commandID: CommandID;
  /**
   * The ID of the interactable that this command is being sent to
   */
  interactableID: InteractableID;
  /**
   * The type of this command
   */
  type: string;
}

export type InteractableCommand =  ViewingAreaUpdateCommand | JoinGameCommand | GameMoveCommand<TicTacToeMove> | GameMoveCommand<TradingMove> | TradeCommand | LeaveGameCommand;
export interface ViewingAreaUpdateCommand  {
  type: 'ViewingAreaUpdate';
  update: ViewingArea;
}
export interface FishDisplayUpdateCommand {
  type: 'FishDisplayUpdate',
  update: FishDisplayArea,
}
export interface RetrieveFishFromDisplayCommand {
  type: 'RetrieveFish'
  player: PlayerID;
  fish: CatchableFish 
}
export interface AddFishtoDisplayCommand {
  type: 'AddFish'
  player: PlayerID;
  fish: CatchableFish 
}
export interface JoinGameCommand {
  type: 'JoinGame';
}
export interface LeaveGameCommand {
  type: 'LeaveGame';
  gameID: GameInstanceID;
}
export interface GameMoveCommand<MoveType> {
  type: 'GameMove';
  gameID: GameInstanceID;
  move: MoveType;
}
export interface TradeCommand {
  type: 'TradeCommand';
  gameID: GameInstanceID;
  move: TradingMove;
}

export type InteractableCommandReturnType<CommandType extends InteractableCommand> = 
  CommandType extends JoinGameCommand ? { gameID: string}:
  CommandType extends ViewingAreaUpdateCommand ? undefined :
  CommandType extends GameMoveCommand<TicTacToeMove> ? undefined :
  CommandType extends GameMoveCommand<TradingMove> ? undefined :
  CommandType extends GameMoveCommand<TradeCommand> ? undefined :
  CommandType extends LeaveGameCommand ? undefined :
  CommandType extends RetrieveFishFromDisplayCommand ? {returnFish?:CatchableFish} :
  CommandType extends AddFishtoDisplayCommand ? {wasAdded:boolean} :
  CommandType extends FishDisplayUpdateCommand ? {id:InteractableID} :
  never;

export type InteractableCommandResponse<MessageType> = {
  commandID: CommandID;
  interactableID: InteractableID;
  error?: string;
  payload?: InteractableCommandResponseMap[MessageType];
}

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  commandResponse: (response: InteractableCommandResponse) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
  interactableCommand: (command: InteractableCommand & InteractableCommandBase) => void;
}


export type FishName = 'minnow' | 'salmon' | 'tuna' | 'barracuda' | 'clownfish' | 'shark' | 'narwhal' | 'anglerfish' | 'goldentrout' | 'whale';

export interface CatchableFish extends GameItem{
  /**
   * name of this fish
   */
  name: FishName;

  /**
   * weight of the fish
   */
  weight: number;

  /**
   * length of the fish
   */
  length: number;

  /**
   * rarity of the fish
   */
  rarity: number;

  /**
   * movement speed of the fish
   */
  movementSpeed: number;

  /**
   * calculated score of the fish
   */
  score?: number;
}

export interface UserFishData {
  fishes: CatchableFish[]; // Assuming 'fishes' is an array of fish IDs or names
}