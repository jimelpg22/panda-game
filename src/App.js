import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pandaPosition, setPandaPosition] = useState({ x: 50, y: 50 });
  const [bamboos, setBamboos] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  // Initialize bamboos
  useEffect(() => {
    createBamboos();
  }, [level]);

  // Create bamboos for the level
  const createBamboos = () => {
    const newBamboos = [];
    // Create regular bamboos
    for (let i = 0; i < 5; i++) {
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
    setBamboos(newBamboos);
  };

  // Handle keyboard movement
  useEffect(() => {
    const handleKeyPress = (e) => {
      const speed = 5;
      switch (e.key) {
        case 'ArrowUp':
          setPandaPosition(prev => ({
            ...prev,
            y: Math.max(0, prev.y - speed)
          }));
          break;
        case 'ArrowDown':
          setPandaPosition(prev => ({
            ...prev,
            y: Math.min(90, prev.y + speed)
          }));
          break;
        case 'ArrowLeft':
          setPandaPosition(prev => ({
            ...prev,
            x: Math.max(0, prev.x - speed)
          }));
          break;
        case 'ArrowRight':
          setPandaPosition(prev => ({
            ...prev,
            x: Math.min(90, prev.x + speed)
          }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Check for collisions
  useEffect(() => {
    const checkCollisions = () => {
      bamboos.forEach((bamboo, index) => {
        const distance = Math.sqrt(
          Math.pow(pandaPosition.x - bamboo.x, 2) +
          Math.pow(pandaPosition.y - bamboo.y, 2)
        );

        if (distance < 8) {
          if (bamboo.isGolden) {
            setLevel(prev => prev + 1);
            setScore(prev => prev + 50);
          } else {
            setScore(prev => prev + 10);
            setBamboos(prev => prev.filter((_, i) => i !== index));
          }
        }
      });
    };

    checkCollisions();
  }, [pandaPosition, bamboos]);

  return (
    <div className="game-container">
      <div className="stats">
        <p>Level: {level}</p>
        <p>Score: {score}</p>
      </div>
      <div className="game-area">
        {/* Panda */}
        <div 
          className="panda"
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
      </div>
    </div>
  );
}

export default App; 