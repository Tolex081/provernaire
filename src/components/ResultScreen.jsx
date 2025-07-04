import React, { useRef, useEffect, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import './ResultScreen.css';

const ResultScreen = ({ userProfile, selectedTeam, finalScore, onPlayAgain, onNavigateToLeaderboard, onScoreUpdate }) => {
  const resultCardRef = useRef(null);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const handleScoreUpdate = useCallback(() => {
    if (onScoreUpdate && finalScore !== null) {
      onScoreUpdate({
        username: userProfile.username?.replace(/^@/, ''),
        pfp: userProfile.pfp,
        team: selectedTeam,
        score: finalScore,
        questionNumber: finalScore === 0 ? 0 : Math.ceil(finalScore / 10000),
        completed: finalScore > 0,
        failed: finalScore === 0,
        walkedAway: false,
        timeUp: false
      });
    }
  }, [onScoreUpdate, userProfile, selectedTeam, finalScore]);

  useEffect(() => {
    if (!scoreSubmitted && finalScore !== null) {
      handleScoreUpdate();
      setScoreSubmitted(true);
    }
  }, [scoreSubmitted, finalScore, handleScoreUpdate]);

 const downloadResult = async () => {
  if (resultCardRef.current) {
    try {
      // Add clean-export class
      resultCardRef.current.classList.add('clean-export');

      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        width: 600,
        height: 800,
      });

      // Remove the class after render
      resultCardRef.current.classList.remove('clean-export');

      const link = document.createElement('a');
      link.download = `succinct-trivia-${userProfile.username}-${finalScore}prove.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('❌ Error generating image:', error);
    }
  }
};


  const shareToX = () => {
    const text = `Just won ${finalScore.toLocaleString()} $PROVE tokens playing Succinct Labs Trivia! 🎯🚀 Think you can beat my score?`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Updated handlePlayAgain to navigate to preview screen
  const handlePlayAgain = () => {
    // Call the parent's onPlayAgain function which should navigate to preview
    if (onPlayAgain) {
      onPlayAgain();
    }
  };

  const getResultMessage = () => {
    if (finalScore === 0) {
      return {
        title: "Better Luck Next Time!",
        message: "Don't worry, every expert was once a beginner. Study up on Succinct Labs and try again!",
        emoji: "😅"
      };
    } else if (finalScore < 10000) {
      return {
        title: "Great Start!",
        message: "You're on your way to becoming a Succinct Labs expert!",
        emoji: "🎯"
      };
    } else if (finalScore < 50000) {
      return {
        title: "Impressive Knowledge!",
        message: "You really know your stuff about Succinct Labs!",
        emoji: "🔥"
      };
    } else if (finalScore < 100000) {
      return {
        title: "Succinct Master!",
        message: "Outstanding! You're a true Succinct Labs expert!",
        emoji: "⭐"
      };
    } else {
      return {
        title: "PERFECT GAME!",
        message: "Incredible! You've mastered everything about Succinct Labs!",
        emoji: "🏆"
      };
    }
  };

  const result = getResultMessage();

  return (
    <div className="result-screen">
      {/* 3D Background Animation */}
      <div className="background-animation">
        <div className="floating-shapes celebration">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`shape shape-${i % 6} celebration-shape`}></div>
          ))}
        </div>
        <div className="confetti">
          {[...Array(50)].map((_, i) => (
            <div key={i} className={`confetti-piece confetti-${i % 4}`}></div>
          ))}
        </div>
      </div>

      <div className="result-container">
        <div ref={resultCardRef} className="result-card">
          <div className="result-card-header">
            <div className="succinct-logo">
              <span className="logo-text">Who Wants To Be A Provernaire</span>
              <span className="logo-subtitle">Trivia Challenge</span>
            </div>
          </div>

          <div className="result-card-content">
            <div className="user-info-large">
              <img src={userProfile.pfp} alt="Profile" className="user-pfp-large" />
              <div className="user-details">
                <h2 className="username-large">{userProfile.username}</h2>
                <div 
                  className="team-badge-large" 
                  style={{ backgroundColor: selectedTeam?.color }}
                >
                  {selectedTeam?.name}
                </div>
              </div>
            </div>

            <div className="score-display">
              <div className="result-emoji">{result.emoji}</div>
              <h1 className="final-score">{finalScore.toLocaleString()}</h1>
              <div className="prove-token">$PROVE TOKENS</div>
            </div>

            <div className="result-message">
              <h3 className="result-title">{result.title}</h3>
              <p className="result-text">{result.message}</p>
            </div>

            {finalScore > 0 && (
              <div className="staking-reminder">
                <div className="reminder-icon">💎</div>
                <div className="reminder-text">
                  <strong>Don't forget to stake your $PROVE tokens!</strong>
                  <br />
                  Maximize your rewards in the Succinct ecosystem
                </div>
              </div>
            )}

            <div className="card-footer">
              <div className="succinct-branding">
                <span>Powered by Succinct Labs</span>
                <div className="team-colors">
                  <div className="color-dot" style={{ backgroundColor: '#B753FF' }}></div>
                  <div className="color-dot" style={{ backgroundColor: '#FF955E' }}></div>
                  <div className="color-dot" style={{ backgroundColor: '#B0FF6F' }}></div>
                  <div className="color-dot" style={{ backgroundColor: '#61C3FF' }}></div>
                  <div className="color-dot" style={{ backgroundColor: '#FF54D7' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          <div className="primary-actions">
            <button className="download-button" onClick={downloadResult}>
              <span>Download Result</span>
            </button>
          </div>

          <div className="secondary-actions">
            <button className="play-again-button" onClick={handlePlayAgain}>
              <span>Play Again</span>
            </button>
            
            <button className="home-button" onClick={onNavigateToLeaderboard}>
              <span>Leaderboard</span>
            </button>
          </div>

          {finalScore > 0 && (
            <div className="staking-action">
              <button className="stake-button">
                <span>Stake Your $PROVE Tokens</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ResultScreen;