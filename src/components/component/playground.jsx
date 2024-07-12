import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';

const GRAVITY = 0.6;
const JUMP_STRENGTH = -10;
const PIPE_WIDTH = 80;
const PIPE_GAP = 200;
const PIPE_SPEED = 3;
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const MIN_PIPE_HEIGHT = 50;
const PIPE_SPACING = 300;

const titles = [
    { score: 0, title: "Chick in the Egg" },
    { score: 10, title: "Newly Hatched Chick" },
    { score: 20, title: "Backyard Adventurer" },
    { score: 30, title: "Neighborhood Celebrity" },
    { score: 40, title: "Town's Favorite" },
    { score: 50, title: "Local Legend" },
    { score: 60, title: "National Idol" },
    { score: 70, title: "Global Superstar" },
    { score: 80, title: "Legendary Aviator" },
    { score: 90, title: "Space-faring Chicken" },
    { score: 100, title: "Guardian of the Galaxy" }
];

const getTitle = (score) => {
    for (let i = titles.length - 1; i >= 0; i--) {
        if (score >= titles[i].score) {
            return titles[i].title;
        }
    }
    return titles[0].title;
};

const FlappyChicken = () => {
    const [gameSize, setGameSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [birdPosition, setBirdPosition] = useState(gameSize.height / 2);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [birdRotation, setBirdRotation] = useState(0);
    const [pipes, setPipes] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setGameSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const generatePipe = useCallback((xPosition) => {
        const maxPipeHeight = gameSize.height - PIPE_GAP - MIN_PIPE_HEIGHT;
        const height = Math.random() * (maxPipeHeight - MIN_PIPE_HEIGHT) + MIN_PIPE_HEIGHT;
        return { x: xPosition, height: height };
    }, [gameSize.height]);

    const initializePipes = useCallback(() => {
        const initialPipes = [];
        for (let i = 0; i < 20; i++) {
            initialPipes.push(generatePipe(gameSize.width + i * PIPE_SPACING));
        }
        return initialPipes;
    }, [gameSize.width, generatePipe]);

    const jump = useCallback(() => {
        if (!gameStarted) {
            setGameStarted(true);
            setPipes(initializePipes());
        }
        if (!gameOver) {
            setBirdVelocity(JUMP_STRENGTH);
            setBirdRotation(-45);
        }
    }, [gameStarted, gameOver, initializePipes]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space') {
                jump();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('touchstart', jump);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('touchstart', jump);
        };
    }, [jump]);

    useEffect(() => {
        if (gameStarted && !gameOver) {
            const gameLoop = setInterval(() => {
                setBirdPosition((prevPosition) => {
                    const newPosition = prevPosition + birdVelocity;
                    if (newPosition > gameSize.height - BIRD_HEIGHT || newPosition < 0) {
                        setGameOver(true);
                        return prevPosition;
                    }
                    return newPosition;
                });

                setBirdVelocity((prevVelocity) => prevVelocity + GRAVITY);

                setBirdRotation((prevRotation) => {
                    if (prevRotation < 90) {
                        return prevRotation + 4;
                    }
                    return 90;
                });

                setPipes((prevPipes) => {
                    const newPipes = prevPipes.map((pipe) => ({
                        ...pipe,
                        x: pipe.x - PIPE_SPEED,
                    })).filter((pipe) => pipe.x > -PIPE_WIDTH);

                    if (newPipes.length < 20) {
                        const lastPipe = newPipes[newPipes.length - 1];
                        newPipes.push(generatePipe(lastPipe.x + PIPE_SPACING));
                    }

                    return newPipes;
                });

                setScore((prevScore) => {
                    const passedPipe = pipes.find((pipe) => pipe.x + PIPE_WIDTH <= gameSize.width / 2 && pipe.x + PIPE_WIDTH > gameSize.width / 2 - PIPE_SPEED);
                    return passedPipe ? prevScore + 1 : prevScore;
                });

                // Collision detection
                pipes.forEach((pipe) => {
                    if (
                        (birdPosition < pipe.height || birdPosition + BIRD_HEIGHT > pipe.height + PIPE_GAP) &&
                        pipe.x < gameSize.width / 2 + BIRD_WIDTH / 2 && pipe.x + PIPE_WIDTH > gameSize.width / 2 - BIRD_WIDTH / 2
                    ) {
                        setGameOver(true);
                    }
                });
            }, 20);

            return () => clearInterval(gameLoop);
        }
    }, [gameStarted, gameOver, birdPosition, birdVelocity, pipes, gameSize, generatePipe]);

    const restartGame = () => {
        setBirdPosition(gameSize.height / 2);
        setBirdVelocity(0);
        setBirdRotation(0);
        setPipes([]);
        setGameStarted(false);
        setScore(0);
        setGameOver(false);
    };

    return (
        <div
            className="relative overflow-hidden w-screen h-screen min-h-screen max-h-screen min-w-screen max-w-screen bg-blue-500"
            onClick={jump}
            style={{
                background: 'linear-gradient(180deg, #4dc9ff 0%, #74e7ff 100%)',
            }}
        >
            <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.5' d='M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom', backgroundSize: 'contain' }} />
            {pipes.map((pipe, index) => (
                <React.Fragment key={index}>
                    <svg className="absolute" style={{ left: pipe.x, top: 0, width: PIPE_WIDTH, height: pipe.height }}>
                        <rect width={PIPE_WIDTH} height={pipe.height} fill="url(#pipeGradient)" />
                        <rect width={PIPE_WIDTH} height="20" fill="url(#pipeGradient)" /> {/*#43a047*/}
                    </svg>
                    <svg className="absolute" style={{ left: pipe.x, top: pipe.height + PIPE_GAP, width: PIPE_WIDTH, height: gameSize.height - pipe.height - PIPE_GAP }}>
                        <rect width={PIPE_WIDTH} height={gameSize.height - pipe.height - PIPE_GAP} fill="url(#pipeGradient)" />
                        <rect y={gameSize.height - pipe.height - PIPE_GAP - 20} width={PIPE_WIDTH} height="20" fill="url(#pipeGradient)" /> {/*#43a047*/}
                    </svg>
                </React.Fragment>
            ))}
            <div
                className="absolute text-5xl transform -scale-x-100"
                style={{
                    left: gameSize.width / 2 - BIRD_WIDTH / 2,
                    top: birdPosition,
                    width: BIRD_WIDTH,
                    height: BIRD_HEIGHT,
                    transition: 'transform 0.1s',
                    transform: `translateY(-50%) rotate(${birdRotation}deg) scaleX(-1)`,
                }}
            >
                🐓
            </div>
            <div className="absolute top-4 right-4 text-4xl font-bold text-white drop-shadow-md">
                {score}
            </div>
            {!gameStarted && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
                    <h1 className="text-6xl font-bold mb-8 animate-pulse text-center justify-center">Flappy Chicken</h1>
                    <p className="text-2xl mb-8">Tap or Press Space Key to Start</p>
                    <div className="text-7xl animate-bounce">🐓</div>
                </div>
            )}
            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white">
                    <div className="text-6xl mb-8 font-bold text-center justify-center">
                        GAME OVER
                    </div>
                    <div className="text-4xl mb-4 text-center justify-center">
                        Score: {score}
                    </div>
                    <div className="text-3xl mb-8 text-center justify-center">
                        Title: {getTitle(score)}
                    </div>
                    <Button
                        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded text-2xl hover:bg-blue-600 transition-colors"
                        onClick={restartGame}
                    >
                        Restart
                    </Button>
                </div>
            )}
            <svg width="0" height="0">
                <defs>
                    <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2e7d32" />
                        <stop offset="50%" stopColor="#4caf50" />
                        <stop offset="100%" stopColor="#2e7d32" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default FlappyChicken;