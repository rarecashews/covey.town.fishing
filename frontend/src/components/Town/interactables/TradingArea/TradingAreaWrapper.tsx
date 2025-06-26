import {
  useToast,
  Box,
  Button,
  Container,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  chakra,
  Text,
  Image,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import useTownController from '../../../../hooks/useTownController';
import { useCallback, useEffect, useState } from 'react';
import GameAreaInteractable from '../GameArea';
import {
  CatchableFish,
  GameItem,
  GameStatus,
  InteractableID,
  PlayerInventory,
} from '../../../../types/CoveyTownSocket';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import TradingAreaController from '../../../../classes/interactable/TradingAreaController';
import React from 'react';
import Interactable from '../../Interactable';
import GameArea from '../GameArea';

const fishMap = {
  salmon: '/assets/fishes/salmon.png',
  whale: '/assets/fishes/whale.png',
  shark: '/assets/fishes/shark.png',
  anglerfish: '/assets/fishes/anglerfish.png',
  clownfish: '/assets/fishes/clownfish.png',
  narwhal: '/assets/fishes/horned.png',
  minnow: '/assets/fishes/minnow.png',
  tuna: '/assets/fishes/tuna.png',
  goldentrout: '/assets/fishes/goldentrout.png',
  barracuda: '/assets/fishes/barracuda.png',
};

export type InventoryProps = {
  gameAreaController: TradingAreaController;
  inventory: PlayerInventory;
};

function round(num: number, fractionDigits: number): number {
  return Number(num.toFixed(fractionDigits));
}

const StyledInventorySquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33%',
    border: '1px solid black',
    height: '33%',
    // fontSize: '20px',
    _disabled: {
      opacity: '100%',
    },
  },
});

const StyledTradingSquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33%',
    border: '1px solid black',
    height: '50%',
    // fontSize: '20px',
    _disabled: {
      opacity: '100%',
    },
  },
});

const StyledInventoryGrid = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '400px',
    padding: '5px',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
  },
});

const StyledTradeGrid = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '200px',
    padding: '5px',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
  },
});

function _renderBox(item: GameItem): JSX.Element {
  return (
    <Box>
      <Image src={fishMap[(item as CatchableFish).name]} />
      <Text fontSize={'lg'}>{(item as CatchableFish).name}</Text>
      <Text fontSize={'sm'}> weight: {round((item as CatchableFish).weight, 2)} </Text>
      <Text fontSize={'sm'}> length: {round((item as CatchableFish).length, 2)} </Text>
      <Text fontSize={'sm'}> rarity: {round((item as CatchableFish).rarity, 2)} </Text>
    </Box>
  );
}

async function offerTrade(gameAreaController: TradingAreaController, ourOffer: GameItem[]) {
  try {
    // console.log('making offer');
    await gameAreaController.makeOffer(ourOffer, false);
    // console.log('made offer');
  } catch (e) {
    console.log('Having trouble making the offer :(');
    console.log(e);
  }
}

async function acceptTrade(gameAreaController: TradingAreaController) {
  await gameAreaController.makeOffer([], true);
}

function TradingArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController = useInteractableAreaController<TradingAreaController>(interactableID);
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const interactable = useInteractable(interactableID);
  const townController = useTownController();

  townController.ourPlayer.getFishInvFromDB(townController.friendlyName);

  const toast = useToast();
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [joiningGame, setJoiningGame] = useState(false);
  const [currentInv, setCurrentInv] = useState<PlayerInventory>([]);
  const [ourOffer, setOurOffer] = useState<GameItem[]>([]);
  const [isOurTurn, setIsOurTurn] = useState(gameAreaController.isOurTurn);
  const [theirOffer, setTheirOffer] = useState<GameItem[]>([]);
  const [offered, setOffered] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tradeAccepted, setTradeAccepted] = useState(false);

  const closeModal = useCallback(() => {
    if (gameAreaController) {
      toast({
        title: 'Trade Accepted',
        description: '',
        status: 'success',
      });
      townController.interactEnd(interactable as Interactable);
      const controller = townController.getGameAreaController(gameArea as GameArea);
      controller.leaveGame();
    }
  }, [gameAreaController, toast, townController, interactable]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateInventory = async () => {
    try {
      const inv = await townController.ourPlayer.getFishInvFromDB(townController.friendlyName);
      console.log('Inventory updated successfully:', townController.ourPlayer.userName, inv);
      setCurrentInv(inv);
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const acceptedFunc = async () => {
    if (gameAreaController.accepted && !tradeAccepted) {
      console.log('inside accepted');
      console.log('curinv:', currentInv);
      console.log('their offer:', gameAreaController.theirOffer || []);
      const newInv = currentInv.concat(gameAreaController.theirOffer || []);
      console.log('new inv:', newInv);
      // console.log('accepted trade:', townController.ourPlayer.userName, [
      //   ...currentInv,
      //   ...(gameAreaController.theirOffer || []),
      // ]);
      await townController.ourPlayer.replaceDBInventory(newInv, townController.friendlyName);
      setCurrentInv(newInv);
      setTheirOffer([]);
      setOurOffer([]);
      setLoaded(false);
      setTradeAccepted(true);
      closeModal();
    }
  };

  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setIsOurTurn(gameAreaController.isOurTurn);
      setTheirOffer(gameAreaController.theirOffer || []);
      setOffered(!gameAreaController.isOurTurnToAccept);

      if (gameAreaController.accepted) {
        acceptedFunc().catch(console.log);
      }
    };

    const onGameEnd = () => {
      toast({
        title: 'Trade Accepted',
        description: '',
        status: 'success',
      });
    };

    if (!loaded) {
      updateInventory();
      setLoaded(true);
    }

    gameAreaController.addListener('gameUpdated', updateGameState);
    gameAreaController.addListener('gameEnd', onGameEnd);

    return () => {
      // console.log('leaving');
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [townController, gameAreaController, isOurTurn, loaded, acceptedFunc, toast, updateInventory]);

  let tradeButtons = (
    <>
      <Button
        disabled={!isOurTurn}
        onClick={async () => {
          await offerTrade(gameAreaController, ourOffer);
          console.log('curinv:', currentInv);
          console.log('their offer:', theirOffer);
        }}>
        Offer Trade
      </Button>
      <Button
        colorScheme='green'
        disabled={!(isOurTurn && offered)}
        onClick={async () => {
          console.log('curinv:', currentInv);
          console.log('their offer:', theirOffer);
          await acceptTrade(gameAreaController);
        }}>
        Accept Trade
      </Button>
    </>
  );

  let gameStatusText = <></>;
  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = (
      <>
        {gameAreaController.whoseTurn === townController.ourPlayer
          ? 'Your'
          : gameAreaController.whoseTurn?.userName + "'s"}{' '}
        turn to offer a trade
      </>
    );
  } else {
    let joinGameButton = <></>;
    if (
      (gameAreaController.status === 'WAITING_TO_START' && !gameAreaController.isPlayer) ||
      gameAreaController.status === 'OVER'
    ) {
      joinGameButton = (
        <Button
          onClick={async () => {
            setJoiningGame(true);
            try {
              setTradeAccepted(false);
              await gameAreaController.joinGame();
            } catch (err) {
              toast({
                title: 'Error joining game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningGame(false);
          }}
          isLoading={joiningGame}
          disabled={joiningGame}>
          Start Trading
        </Button>
      );
      tradeButtons = <></>;
    }
    gameStatusText = (
      <b>
        Game {gameStatus === 'WAITING_TO_START' ? 'not yet started' : 'over'}. {joinGameButton}
      </b>
    );
  }

  return (
    <Container maxWidth='100%'>
      <Grid templateRows='repeat(2, 1fr)' templateColumns='repeat(2, 1fr)' gap={4}>
        <GridItem rowSpan={2} colSpan={1}>
          <h1>Your Inventory</h1>
          <h3>Contains {currentInv.length} items</h3>
          <Box overflowY='auto' maxHeight='100%'>
            <StyledInventoryGrid>
              {currentInv.map(item => {
                return (
                  <StyledInventorySquare
                    disabled={!isOurTurn}
                    key={`${item.id}`}
                    onClick={() => {
                      setCurrentInv(currentInv.filter(selected => selected.id != item.id));
                      const newOffer = [item, ...ourOffer];
                      setOurOffer(newOffer);
                      setOffered(false);
                    }}>
                    {_renderBox(item)}
                  </StyledInventorySquare>
                );
              })}
            </StyledInventoryGrid>
          </Box>
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <h1>Your Offer</h1>
          <Box overflowY='auto' maxHeight='100%'>
            <StyledTradeGrid>
              {ourOffer.map(item => {
                return (
                  <StyledTradingSquare
                    disabled={!isOurTurn}
                    key={`${item.id}`}
                    onClick={() => {
                      setOurOffer(ourOffer.filter(selected => selected.id != item.id));
                      const newInv = [item, ...currentInv];
                      setCurrentInv(newInv);
                      setOffered(false);
                    }}>
                    {_renderBox(item)}
                  </StyledTradingSquare>
                );
              })}
            </StyledTradeGrid>
          </Box>
        </GridItem>
        <GridItem rowSpan={1} colSpan={1}>
          <h1>Their Offer</h1>
          <Box overflowY='auto' maxHeight='100%'>
            <StyledTradeGrid>
              {theirOffer.map(item => {
                return (
                  <StyledTradingSquare disabled={true} key={`${item.id}`}>
                    {_renderBox(item)}
                  </StyledTradingSquare>
                );
              })}
            </StyledTradeGrid>
          </Box>
        </GridItem>
      </Grid>
      {gameStatusText}
      <br />
      {tradeButtons}
    </Container>
  );
}

export default function TradingAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && (gameArea.getData('type') === 'Trading' || gameArea.name.includes('Trading'))) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent maxWidth='50%'>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <TradingArea interactableID={gameArea.name} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
