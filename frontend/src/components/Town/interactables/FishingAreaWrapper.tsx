/* eslint-disable @next/next/no-img-element */
import {
  Container,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import useTownController from '../../../hooks/useTownController';
import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import FishingAreaController from '../../../classes/interactable/FishingAreaController';
import { CatchableFish, InteractableID } from '../../../types/CoveyTownSocket';
import { useFishingAreaController, useInteractable } from '../../../classes/TownController';
import { Context } from 'vm';

const TICK_RATE = 20;
const ROD_SIZE = 25;
const FISH_SIZE = 20;
const WATER_DEPTH = 150;
const PROGRESS_RATE = 1;
const ROD_SPEED = 2;
const FISH_SPEED = 1.25;

export const fishMap = {
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

export function round(num: number, fractionDigits: number): number {
  return Number(num.toFixed(fractionDigits));
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

type GameStatus = 'IN_PROGRESS' | 'WON' | 'LOST';

function Canvas(props: {
  isSpacePressed: boolean;
  rodDepth: number;
  progress: number;
  fishDepth: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = (ctx: Context, rodDepth: number, progress: number, fishDepth: number) => {
    const fish = new Image();
    fish.onload = function () {
      const hook = new Image();
      hook.onload = function () {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const width = ctx.canvas.width;
        // console.log(ctx.canvas.width, ctx.canvas.height);
        // ocean background
        ctx.fillStyle = '#000000';
        ctx.font = '15px Courier New';
        ctx.fillText('How to Play', 2, 15);
        ctx.font = '10px Courier New';
        ctx.fillText('Hold space to raise', 2, 25);
        ctx.fillText('the hook. Keep the', 2, 35);
        ctx.fillText('hook on the fish', 2, 45);
        ctx.fillText('to win!', 2, 55);
        ctx.fillText('Rarer fish are', 2, 75);
        ctx.fillText('quicker and harder', 2, 85);
        ctx.fillText('to catch.', 2, 95);

        ctx.fillStyle = '#0088FF';
        ctx.fillRect(width / 2 - 21, 0, 20, WATER_DEPTH);
        // draws bobber/line
        ctx.fillStyle = '#667788';
        ctx.fillRect(width / 2 - 12, 0, 2, rodDepth + 2);
        ctx.drawImage(
          hook,
          width / 2 - FISH_SIZE - 1,
          clamp(rodDepth, 0, WATER_DEPTH),
          FISH_SIZE - 1,
          FISH_SIZE - 1,
        );
        // draws progress bar background
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(width / 2 + 1, 0, 10, WATER_DEPTH);
        // draws progress bar
        ctx.fillStyle = '#00AA00';
        ctx.fillRect(width / 2 + 1, WATER_DEPTH, 10, -progress);

        ctx.drawImage(
          fish,
          width / 2 - FISH_SIZE - 1,
          clamp(fishDepth, 0, WATER_DEPTH),
          FISH_SIZE,
          FISH_SIZE,
        );
      };
      hook.src = './assets/fishes/hook.png';
    };
    fish.src = './assets/fishes/cod.png';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas == null) return;
    const context = canvas.getContext('2d');
    if (context == null) return;
    let animationFrameId: number;

    //Our draw came here
    const render = () => {
      draw(context, props.rodDepth, props.progress, props.fishDepth);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw]);

  return <canvas ref={canvasRef} {...props} />;
}

function FishingAreaRender({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const fishingAreaController = useFishingAreaController<FishingAreaController>(interactableID);
  const townController = useTownController();
  const fishingArea = useInteractable('fishingArea');

  const startingFishDepth = fishingAreaController.getNewFishDepth(FISH_SIZE, WATER_DEPTH);
  const startingProgress = fishingAreaController.getNewProgress();
  const startingRodDepth = fishingAreaController.getNewRodDepth(startingFishDepth, ROD_SIZE);
  const startingFish = fishingAreaController.getNewFish();
  const [tick, setTick] = useState(0);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [fishDepth, setFishDepth] = useState(startingFishDepth);
  const [progress, setProgress] = useState(startingProgress);
  const [rodDepth, setRodDepth] = useState(startingRodDepth);
  const [gameStatus, setGameStatus] = useState<GameStatus>('IN_PROGRESS');
  const [fishDirection, setFishDirection] = useState(1);
  const [caught, setCaught] = useState(false);
  const [directionTimer, setDirectionTimer] = useState(3);
  const [fish] = useState<CatchableFish>(startingFish);

  let intervalID1: NodeJS.Timeout;
  let intervalID2: NodeJS.Timeout;
  let intervalID3: NodeJS.Timeout;
  let intervalID4: NodeJS.Timeout;

  const updateFrame = () => {
    intervalID1 = setInterval(() => {
      setRodDepth(prevDepth => {
        if (prevDepth + ROD_SIZE < WATER_DEPTH) {
          return clamp(prevDepth + ROD_SPEED, 0, WATER_DEPTH);
        } else {
          return prevDepth;
        }
      });
    }, TICK_RATE);
  };
  const reduceFrame = () => {
    intervalID2 = setInterval(() => {
      setRodDepth(prevDepth => {
        if (prevDepth > 0) {
          return clamp(prevDepth - ROD_SPEED, 0, WATER_DEPTH);
        } else {
          return prevDepth;
        }
      });
    }, TICK_RATE);
  };
  const incrementTick = () => {
    intervalID3 = setInterval(() => {
      setTick(prevTick => prevTick + 1);
    }, TICK_RATE);
  };

  const decrementTimer = () => {
    intervalID4 = setInterval(() => {
      setDirectionTimer(prevTimer => prevTimer - 1);
    }, TICK_RATE);
  };

  const downHandler = (key: KeyboardEvent) => {
    if (key.code === 'Space') {
      setIsSpacePressed(true);
    }
  };
  const upHandler = (key: KeyboardEvent) => {
    if (key.code === 'Space') {
      setIsSpacePressed(false);
    }
  };

  useEffect(() => {
    if (isSpacePressed) {
      reduceFrame();
    } else {
      updateFrame();
    }
    if (gameStatus === 'IN_PROGRESS') {
      // update fish behavior
      // if direction timer is up, change direction
      if (directionTimer == 0) {
        const direction = Math.random();
        if (direction > 0.5) setFishDirection(1);
        else setFishDirection(-1);
        setDirectionTimer(Math.max(Math.round(Math.random() * (8 - fish.rarity ?? 1)) * 3, 40));
      }
      // move fish an amount based on its direction
      if (fishDirection === 1 && fishDepth + FISH_SIZE < WATER_DEPTH) {
        setFishDepth(fishDepth + FISH_SPEED * (fish.movementSpeed ?? 1));
      } else if (fishDirection === -1 && fishDepth > 0) {
        setFishDepth(fishDepth - FISH_SPEED * (fish.movementSpeed ?? 1));
      }

      // check for win condition
      if (progress == WATER_DEPTH) {
        setGameStatus('WON');
      } else if (progress == 0) {
        setGameStatus('LOST');
      }
      incrementTick();
      decrementTimer();

      // change the progress based on the fish and rod
      if (
        progress <= WATER_DEPTH &&
        fishDepth + FISH_SIZE >= rodDepth &&
        fishDepth <= rodDepth + ROD_SIZE
      ) {
        setProgress(clamp(progress + PROGRESS_RATE, 0, WATER_DEPTH));
      } else if (progress > 0) {
        setProgress(clamp(progress - PROGRESS_RATE, 0, WATER_DEPTH));
      }
      window.addEventListener('keydown', downHandler);
      window.addEventListener('keyup', upHandler);
    }

    return () => {
      clearInterval(intervalID1);
      clearInterval(intervalID2);
      clearInterval(intervalID3);
      clearInterval(intervalID4);
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fishingArea, tick]);

  if (gameStatus === 'LOST') {
    return (
      <Container width={'100%'}>
        <h1 style={{ fontSize: 25, textAlign: 'center' }}>
          The fish got away! Better luck next time
        </h1>
      </Container>
    );
  } else if (gameStatus === 'WON') {
    // add fish to players inventory
    if (!caught) {
      townController.ourPlayer.addToDBInventory(fish, townController.friendlyName);
      setCaught(true);
    }
    return (
      <Container width={'100%'}>
        <div>
          <h1 style={{ fontSize: 30, textAlign: 'center' }}>You caught a {fish.name}!</h1>
          <img
            src={fishMap[fish.name]}
            alt={fish.name}
            width={72}
            height={72}
            style={{ margin: 'auto' }}
          />
          <h2 style={{ fontSize: 20, textAlign: 'center' }}>Stats:</h2>
          <h3 style={{ fontSize: 15, textAlign: 'center' }}>Weight: {round(fish.weight, 2)} lbs</h3>
          <h3 style={{ fontSize: 15, textAlign: 'center' }}>
            Length: {round(fish.length, 2)} inches
          </h3>
          <h3 style={{ fontSize: 15, textAlign: 'center' }}>Rarity(1-5): {fish.rarity}</h3>
          <h2 style={{ fontSize: 20, textAlign: 'center' }}>
            Go to the Trading Table to check your inventory
          </h2>
        </div>
      </Container>
    );
  } else {
    return (
      <>
        <Canvas
          isSpacePressed={isSpacePressed}
          rodDepth={rodDepth}
          progress={progress}
          fishDepth={fishDepth}
        />
      </>
    );
  }
}

export default function FishingAreaWrapper(): JSX.Element {
  const fishingArea = useInteractable('fishingArea');

  const townController = useTownController();

  const closeModal = useCallback(() => {
    if (fishingArea) {
      townController.interactEnd(fishingArea);
    }
  }, [townController, fishingArea]);

  if (fishingArea) {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent maxWidth='50%'>
          <ModalHeader>{fishingArea.name}</ModalHeader>
          <ModalCloseButton />
          <FishingAreaRender interactableID={fishingArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
