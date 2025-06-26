import {
  Box,
  Button,
  Container,
  Image,
  Text,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  chakra,
  ModalCloseButton,
  VStack,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import useTownController from '../../../../hooks/useTownController';
import FishDisplayAreaInteractable from '../FishDisplayArea';
import { CatchableFish, GameItem } from '../../../../types/CoveyTownSocket';
import { useInteractable } from '../../../../classes/TownController';
/**
 * A component that will render the TicTacToe board, styled
 */

const StyledFishDisplaySquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'left',
    alignItems: 'center',
    flexBasis: '33%',
    border: '1px solid black',
    height: '31%',
    fontSize: '12px',
    fontfamily: 'AmericanTypewriter-Bold',
    padding: '1%',
    _disabled: {
      opacity: '100%',
    },
  },
});

const StyledDisplayGrid = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '400px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

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

function round(num: number, fractionDigits: number): number {
  return Number(num.toFixed(fractionDigits));
}

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

/**
 * Displays the displayedFish or "No fish displayed yet!" if there isn't one
 */
export function DisplayFish(props: { fish: CatchableFish; player: string }) {
  const space = ' ';
  return (
    <VStack>
      <h1>
        {props.player} is displaying their prized
        {space}
        {props.fish.description}!
      </h1>
      <Image src={fishMap[(props.fish as CatchableFish).name]} htmlHeight={2000} />
      <h1>Rarity: {props.fish.rarity}</h1>
      <h1>Length: {props.fish.length.toFixed(2)} in.</h1>
      <h1>Weight: {props.fish.weight.toFixed(2)} lbs.</h1>
    </VStack>
  );
}

function isFishBetter(newFish: CatchableFish, oldFish: CatchableFish | undefined) {
  if (!oldFish) {
    return true;
  } else if (newFish.score && oldFish.score && newFish.score > oldFish.score) {
    return true;
  } else {
    return false;
  }
}

/**
 * Displays tiles representing each fish in the player's inventory that when clicked attempt to display the corresponding fish.
 * @param props: the fishDisplayArea area interactable that is being interacted with
 */
export function FishDisplayArea(): JSX.Element {
  const townController = useTownController();
  const player = townController.ourPlayer;

  const [playerInventory, setPlayerInventory] = useState<GameItem[]>(player.inventory);
  const [displayedFish, setDisplayedFish] = useState<
    [CatchableFish | undefined, string] | undefined
  >(undefined);

  const toast = useToast();

  useEffect(() => {
    async function getFish() {
      await townController.getDisplayFishFromDB().then(result => {
        setDisplayedFish(result);
      });
    }

    const inventoryChangeListener = () => {
      setPlayerInventory(player.inventory);
    };
    player.addListener('inventoryChanged', inventoryChangeListener);
    if (displayedFish === undefined) getFish();
    return () => {
      player.removeListener('inventoryChanged', inventoryChangeListener);
    };
  }, [playerInventory, player, displayedFish, townController]);

  const handleAddFish = async (fish: CatchableFish) => {
    if (displayedFish && isFishBetter(fish, displayedFish[0])) {
      await townController.addFishToDisplayOnDB(fish, townController.ourPlayer.userName);
      setDisplayedFish([fish, townController.ourPlayer.userName]);
      toast({
        title: 'Fish displayed!',
        description: 'You have the best fish!',
        status: 'info',
      });
    } else {
      toast({
        title: 'Fish not displayed.',
        description: 'Try a better fish!',
        status: 'error',
      });
    }
  };

  let displayFish: JSX.Element;
  if (displayedFish && displayedFish[0]) {
    displayFish = <DisplayFish fish={displayedFish[0]} player={displayedFish[1]}></DisplayFish>;
  } else {
    displayFish = <h1>Be the first to display a fish!</h1>;
  }
  let removeButton: JSX.Element;
  if (displayedFish && displayedFish[1] && townController.ourPlayer.userName === displayedFish[1]) {
    removeButton = (
      <Button
        colorScheme={'red'}
        onClick={() => {
          townController.removeDisplayFishFromDB();
          setDisplayedFish(undefined);
        }}>
        Remove your fish
      </Button>
    );
  } else {
    removeButton = <h1></h1>;
  }

  return (
    <VStack>
      {displayFish}
      <StyledDisplayGrid>
        {playerInventory.map(item => {
          return (
            <StyledFishDisplaySquare
              key={`${item.id}`}
              onClick={() => handleAddFish(item as CatchableFish)}>
              {_renderBox(item)}
            </StyledFishDisplaySquare>
          );
        })}
      </StyledDisplayGrid>
      {removeButton}
    </VStack>
  );
}

/**
 * The ViewingAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function FishDisplayAreaWrapper(): JSX.Element {
  const townController = useTownController();
  const fishDisplayArea = useInteractable<FishDisplayAreaInteractable>('fishDisplayArea');

  const closeModal = useCallback(() => {
    if (fishDisplayArea) {
      townController.interactEnd(fishDisplayArea);
    }
  }, [fishDisplayArea, townController]);

  if (fishDisplayArea) {
    return (
      <Modal isOpen={true} closeOnOverlayClick={false} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{fishDisplayArea.name}</ModalHeader>
          <ModalCloseButton></ModalCloseButton>
          <FishDisplayArea />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
