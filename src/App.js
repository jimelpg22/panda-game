import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [pandaPosition, setPandaPosition] = useState({ x: 50, y: 50 });
  const [bamboos, setBamboos] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [powerActive, setPowerActive] = useState(false);
  const [scorePopups, setScorePopups] = useState([]);
  const [timer, setTimer] = useState(60); // 60 seconds per level
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'levelup', 'gameover'

  // Initialize game
  useEffect(() => {
    resetLevel();
    const timerInterval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          setGameStatus('gameover');
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [level]);

  // Create level elements
  const resetLevel = useCallback(() => {
    // Create bamboos
    const newBamboos = [];
    for (let i = 0; i < 5 + level; i++) {
      newBamboos.push({
        id: i,
        x: Math.floor(Math.random() * 80 + 10),
        y: Math.floor(Math.random() * 80 + 10),
        isGolden: false
      });
    }
    
    // Add one golden bamboo
    newBamboos.push({
      id: 'golden',
      x: Math.floor(Math.random() * 80 + 10),
      y: Math.floor(Math.random() * 80 + 10),
      isGolden: true
    });
    
    // Create obstacles
    const newObstacles = [];
    for (let i = 0; i < level; i++) {
      newObstacles.push({
        id: i,
        x: Math.floor(Math.random() * 80 + 10),
        y: Math.floor(Math.random() * 80 + 10),
        width: Math.floor(Math.random() * 50 + 30),
        height: 10
      });
    }
    
    // Create power-ups (speed boost, time bonus)
    const newPowerUps = [];
    if (level > 1) {
      newPowerUps.push({
        id: 'speed',
        x: Math.floor(Math.random() * 80 + 10),
        y: Math.floor(Math.random() * 80 + 10),
        type: 'speed',
      });
      
      newPowerUps.push({
        id: 'time',
        x: Math.floor(Math.random() * 80 + 10),
        y: Math.floor(Math.random() * 80 + 10),
        type: 'time',
      });
    }
    
    setBamboos(newBamboos);
    setObstacles(newObstacles);
    setPowerUps(newPowerUps);
    setPandaPosition({ x: 50, y: 50 });
    setTimer(60 + (level * 10)); // More time for higher levels
    setGameStatus('playing');
  }, [level]);

  // Handle keyboard movement
  useEffect(() => {
    const handleKeyPress = (e) => {
      const speed = powerActive ? 8 : 5;
      
      let newPos = { ...pandaPosition };
      
      switch (e.key) {
        case 'ArrowUp':
          newPos.y = Math.max(0, newPos.y - speed);
          break;
        case 'ArrowDown':
          newPos.y = Math.min(90, newPos.y + speed);
          break;
        case 'ArrowLeft':
          newPos.x = Math.max(0, newPos.x - speed);
          break;
        case 'ArrowRight':
          newPos.x = Math.min(90, newPos.x + speed);
          break;
        case ' ': // Space to restart on game over
          if (gameStatus === 'gameover') {
            setLevel(1);
            setScore(0);
            resetLevel();
          }
          break;
        default:
          break;
      }
      
      // Collision detection with obstacles
      if (!powerActive) {
        const pandaRadius = 30; // Half of panda's size
        
        for (const obstacle of obstacles) {
          const pandaLeft = (newPos.x / 100) * 600 - pandaRadius;
          const pandaRight = (newPos.x / 100) * 600 + pandaRadius;
          const pandaTop = (newPos.y / 100) * 400 - pandaRadius;
          const pandaBottom = (newPos.y / 100) * 400 + pandaRadius;
          
          const obstacleLeft = (obstacle.x / 100) * 600 - obstacle.width / 2;
          const obstacleRight = (obstacle.x / 100) * 600 + obstacle.width / 2;
          const obstacleTop = (obstacle.y / 100) * 400 - obstacle.height / 2;
          const obstacleBottom = (obstacle.y / 100) * 400 + obstacle.height / 2;
          
          if (
            pandaRight > obstacleLeft &&
            pandaLeft < obstacleRight &&
            pandaBottom > obstacleTop &&
            pandaTop < obstacleBottom
          ) {
            // Collision detected, don't update position
            return;
          }
        }
      }
      
      setPandaPosition(newPos);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pandaPosition, powerActive, obstacles, gameStatus, resetLevel]);

  // Check for collisions
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    // Check bamboo collisions
    const remainingBamboos = [...bamboos];
    let levelCompleted = false;
    
    for (let i = bamboos.length - 1; i >= 0; i--) {
      const bamboo = bamboos[i];
      const distance = Math.sqrt(
        Math.pow(pandaPosition.x - bamboo.x, 2) +
        Math.pow(pandaPosition.y - bamboo.y, 2)
      );

      if (distance < 8) {
        // Show score popup
        const newId = Date.now();
        const points = bamboo.isGolden ? 50 : 10;
        
        setScorePopups(prev => [
          ...prev, 
          { 
            id: newId, 
            x: bamboo.x, 
            y: bamboo.y, 
            points: `+${points}` 
          }
        ]);
        
        // Remove popup after animation
        setTimeout(() => {
          setScorePopups(prev => prev.filter(popup => popup.id !== newId));
        }, 1000);
        
        if (bamboo.isGolden) {
          setGameStatus('levelup');
          levelCompleted = true;
          setTimeout(() => {
            setLevel(prev => prev + 1);
          }, 1500);
          setScore(prev => prev + 50);
        } else {
          setScore(prev => prev + 10);
          remainingBamboos.splice(i, 1);
        }
      }
    }
    
    if (!levelCompleted) {
      setBamboos(remainingBamboos);
    }
    
    // Check power-up collisions
    const remainingPowerUps = [...powerUps];
    
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUps[i];
      const distance = Math.sqrt(
        Math.pow(pandaPosition.x - powerUp.x, 2) +
        Math.pow(pandaPosition.y - powerUp.y, 2)
      );

      if (distance < 8) {
        remainingPowerUps.splice(i, 1);
        
        // Apply power-up effect
        if (powerUp.type === 'speed') {
          setPowerActive(true);
          setTimeout(() => setPowerActive(false), 5000);
          
          const newId = Date.now();
          setScorePopups(prev => [
            ...prev, 
            { 
              id: newId, 
              x: powerUp.x, 
              y: powerUp.y, 
              points: 'Speed!' 
            }
          ]);
          setTimeout(() => {
            setScorePopups(prev => prev.filter(popup => popup.id !== newId));
          }, 1000);
        } else if (powerUp.type === 'time') {
          setTimer(prev => prev + 15);
          
          const newId = Date.now();
          setScorePopups(prev => [
            ...prev, 
            { 
              id: newId, 
              x: powerUp.x, 
              y: powerUp.y, 
              points: '+15s' 
            }
          ]);
          setTimeout(() => {
            setScorePopups(prev => prev.filter(popup => popup.id !== newId));
          }, 1000);
        }
      }
    }
    
    setPowerUps(remainingPowerUps);
  }, [pandaPosition, bamboos, powerUps, gameStatus]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className={`game-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="stats">
        <p>Level: {level}</p>
        <p>Score: {score}</p>
        <p>Time: {timer}s</p>
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      
      <div className="game-area">
        {gameStatus === 'gameover' && (
          <div className="game-overlay">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <p>Press Space to Restart</p>
          </div>
        )}
        
        {gameStatus === 'levelup' && (
          <div className="game-overlay level-up">
            <h2>Level {level} Complete!</h2>
            <p>Starting Level {level + 1}...</p>
          </div>
        )}
        
        {/* Panda */}
        <div 
          className={`panda ${powerActive ? 'powered' : ''}`}
          style={{ 
            left: `${pandaPosition.x}%`, 
            top: `${pandaPosition.y}%` 
          }}
        />
        
        {/* Bamboos */}
        {bamboos.map((bamboo) => (
          <div
            key={bamboo.id}
            className={bamboo.isGolden ? 'golden-bamboo' : 'bamboo'}
            style={{
              left: `${bamboo.x}%`,
              top: `${bamboo.y}%`
            }}
          />
        ))}
        
        {/* Obstacles */}
        {obstacles.map((obstacle) => (
          <div
            key={obstacle.id}
            className="wall"
            style={{
              left: `${obstacle.x}%`,
              top: `${obstacle.y}%`,
              width: `${obstacle.width}px`,
              height: `${obstacle.height}px`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
        
        {/* Power-ups */}
        {powerUps.map((powerUp) => (
          <div
            key={powerUp.id}
            className={`power-up ${powerUp.type}`}
            style={{
              left: `${powerUp.x}%`,
              top: `${powerUp.y}%`
            }}
          />
        ))}
        
        {/* Score Popups */}
        {scorePopups.map((popup) => (
          <div
            key={popup.id}
            className="score-popup"
            style={{
              left: `${popup.x}%`,
              top: `${popup.y}%`
            }}
          >
            {popup.points}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App; 