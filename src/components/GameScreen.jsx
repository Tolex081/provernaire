import React, { useState, useEffect, useCallback } from 'react';
import { questions } from '../data/questions';
import Lifeline from './Lifeline'; // Import the new Lifeline component
import './GameScreen.css'; // Assuming you have a CSS file for styling

const GameScreen = ({ userProfile, selectedTeam, onGameEnd, onScoreUpdate, onNavigateToLeaderboard }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    phoneAddy: true,
    phoneYinger: true,
    askAudience: true
  });
  const [removedAnswers, setRemovedAnswers] = useState([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [hasUpdatedScore, setHasUpdatedScore] = useState(false);

  // Updated prize structure: Question 1 = 1,000, Question 10 = 1,000,000
  const prizeStructure = [
    1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000
  ];

  // Memoized callback for game end to prevent unnecessary re-renders
  const handleGameEnd = useCallback((score) => {
    console.log('🎮 Game ending with score:', score);
    if (onGameEnd) {
      onGameEnd(score);
    }
  }, [onGameEnd]);

  // Memoized callback for score update
  const handleScoreUpdate = useCallback((scoreData) => {
    console.log('📊 Updating score:', scoreData);
    if (onScoreUpdate) {
      onScoreUpdate(scoreData);
    }
  }, [onScoreUpdate]);

  // Timer effect with reduced dependencies
  useEffect(() => {
    let interval;
    
    if (timerActive && timeRemaining > 0 && !isAnswerSubmitted) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            // Time's up!
            setTimerActive(false);
            setIsAnswerSubmitted(true);
            
            // Handle time up scenario
            const gameOverScore = currentQuestion > 0 ? prizeStructure[currentQuestion - 1] : 0;
            
            // Delayed execution to avoid state update conflicts
            setTimeout(() => {
              if (userProfile?.username && selectedTeam) {
                handleScoreUpdate({
                  username: userProfile.username,
                  pfp: userProfile.pfp,
                  team: selectedTeam,
                  score: gameOverScore,
                  questionNumber: currentQuestion + 1,
                  timeUp: true
                });
              }
              handleGameEnd(gameOverScore);
            }, 100);
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, isAnswerSubmitted, currentQuestion, prizeStructure, userProfile, selectedTeam, handleScoreUpdate, handleGameEnd]);

  // Timer restart when moving to new question
  useEffect(() => {
    if (gameQuestions.length > 0 && gameQuestions[currentQuestion] && !isAnswerSubmitted) {
      setTimeRemaining(60);
      setTimerActive(true);
      setHasUpdatedScore(false); // Reset score update flag for new question
    }
  }, [currentQuestion, gameQuestions.length, isAnswerSubmitted]);

  // Initialize game questions
  useEffect(() => {
    console.log('🎯 Initializing game questions...');
    // Select 10 random questions from the pool of 30
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, 10);
    setGameQuestions(selectedQuestions);
  }, []);

  // Update leaderboard only when necessary and avoid infinite loops
  useEffect(() => {
    if (currentQuestion >= 0 && userProfile?.username && selectedTeam && gameQuestions.length > 0 && !hasUpdatedScore) {
      // Current prize is based on current question (0-based index)
      const currentScore = prizeStructure[currentQuestion];
      console.log(`📈 Initial score update for question ${currentQuestion + 1}, score: ${currentScore}`);
      
      handleScoreUpdate({
        username: userProfile.username,
        pfp: userProfile.pfp,
        team: selectedTeam,
        score: currentScore,
        questionNumber: currentQuestion + 1
      });
      
      setHasUpdatedScore(true); // Mark as updated to prevent re-runs
    }
  }, [currentQuestion, userProfile?.username, selectedTeam?.name, gameQuestions.length, hasUpdatedScore, handleScoreUpdate, prizeStructure]);

  const handleAnswerSelect = useCallback((answerIndex) => {
    // Don't allow selection of removed answers or if answer already submitted
    if (removedAnswers.includes(answerIndex) || isAnswerSubmitted) return;
    setSelectedAnswer(answerIndex);
  }, [removedAnswers, isAnswerSubmitted]);

  // Updated submitAnswer function with immediate timer stop
  const submitAnswer = useCallback(() => {
    if (selectedAnswer === null || !gameQuestions[currentQuestion] || isAnswerSubmitted) return;

    console.log(`🎯 Submitting answer ${selectedAnswer} for question ${currentQuestion + 1}`);
    setIsAnswerSubmitted(true);
    setTimerActive(false); // Stop the timer immediately
    
    const correct = gameQuestions[currentQuestion].correctAnswer === selectedAnswer;
    
    // Show result for 2 seconds before proceeding
    setTimeout(() => {
      if (correct) {
        if (currentQuestion === 9) {
          // Game completed successfully
          const finalScore = prizeStructure[currentQuestion];
          console.log('🎉 Game completed! Final score:', finalScore);
          if (userProfile?.username && selectedTeam) {
            handleScoreUpdate({
              username: userProfile.username,
              pfp: userProfile.pfp,
              team: selectedTeam,
              score: finalScore,
              questionNumber: currentQuestion + 1,
              completed: true
            });
          }
          handleGameEnd(finalScore);
        } else {
          // Move to next question
          console.log(`✅ Correct answer! Moving to question ${currentQuestion + 2}`);
          setCurrentQuestion(prev => prev + 1);
          setSelectedAnswer(null);
          setRemovedAnswers([]);
          setIsAnswerSubmitted(false);
          // Timer will restart automatically due to useEffect
        }
      } else {
        // Wrong answer - end game with previous question's prize (or 0 if first question)
        const gameOverScore = currentQuestion > 0 ? prizeStructure[currentQuestion - 1] : 0;
        console.log('❌ Wrong answer! Game over with score:', gameOverScore);
        if (userProfile?.username && selectedTeam) {
          handleScoreUpdate({
            username: userProfile.username,
            pfp: userProfile.pfp,
            team: selectedTeam,
            score: gameOverScore,
            questionNumber: currentQuestion + 1,
            failed: true
          });
        }
        handleGameEnd(gameOverScore);
      }
    }, 2000);
  }, [selectedAnswer, gameQuestions, currentQuestion, isAnswerSubmitted, prizeStructure, userProfile, selectedTeam, handleScoreUpdate, handleGameEnd]);

  // Callback to handle lifeline usage from the Lifeline component
  const handleLifelineUse = useCallback((type) => {
    console.log('Using lifeline:', type);
    setLifelines(prev => ({ ...prev, [type]: false }));
  }, []);

  // Callback to handle removed answers from 50/50 lifeline
  const handleRemovedAnswers = useCallback((answersToRemove) => {
    console.log('🔄 Removing answers:', answersToRemove);
    setRemovedAnswers(answersToRemove);
  }, []);

  // Updated walkAway function with proper timer stop
  const walkAway = useCallback(() => {
    setTimerActive(false);
    setIsAnswerSubmitted(true); // Prevent timer from restarting
    
    // Player walks away with current prize (current question's prize if they haven't answered yet)
    const currentPrize = currentQuestion > 0 ? prizeStructure[currentQuestion - 1] : 0;
    console.log('🚶 Player walking away with:', currentPrize);
    if (userProfile?.username && selectedTeam) {
      handleScoreUpdate({
        username: userProfile.username,
        pfp: userProfile.pfp,
        team: selectedTeam,
        score: currentPrize,
        questionNumber: currentQuestion,
        walkedAway: true
      });
    }
    handleGameEnd(currentPrize);
  }, [currentQuestion, prizeStructure, userProfile, selectedTeam, handleScoreUpdate, handleGameEnd]);

  // Handle leaderboard navigation with logging
  const handleLeaderboardClick = useCallback(() => {
    console.log('🏆 Navigating to leaderboard...');
    if (onNavigateToLeaderboard) {
      onNavigateToLeaderboard();
    } else {
      console.error('❌ onNavigateToLeaderboard function not provided');
    }
  }, [onNavigateToLeaderboard]);



  // Memoized timer functions
  const getTimerColor = useCallback(() => {
    if (timeRemaining > 30) return '#B0FF6F'; // Green
    if (timeRemaining > 15) return '#FF955E'; // Orange
    return '#FF54D7'; // Pink/Red
  }, [timeRemaining]);

  const getTimerText = useCallback(() => {
    if (timeRemaining > 30) return '🟢';
    if (timeRemaining > 15) return '🟡';
    return '🔴';
  }, [timeRemaining]);

  // Early return for loading state
  if (!gameQuestions[currentQuestion]) {
    return (
      <div className="screen-container loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading questions...</div>
        </div>
      </div>
    );
  }

  const question = gameQuestions[currentQuestion];
  const currentPrize = prizeStructure[currentQuestion];
  const timerColor = getTimerColor();
  const timerText = getTimerText();

  // Debug log for current state
  console.log('🎮 GameScreen Render:', {
    currentQuestion: currentQuestion + 1,
    currentPrize,
    timeRemaining,
    timerActive,
    isAnswerSubmitted,
    hasLeaderboardFunction: !!onNavigateToLeaderboard
  });

  return (
    <div className="game-screen">
      {/* 3D Background Animation */}
      <div className="background-animation">
        <div className="floating-shapes">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`shape shape-${i % 4}`}></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="game-header">
        <div className="user-info">
          <img src={userProfile?.pfp || ''} alt="Profile" className="user-pfp" />
          <span className="user-username">{userProfile?.username || 'User'}</span>
          <div 
            className="user-team" 
            style={{ backgroundColor: selectedTeam?.color || '#000' }}
          >
            {selectedTeam?.name || 'Team'}
          </div>
        </div>
        
        <div className="score-info">
          <div className="current-prize">
            {currentPrize?.toLocaleString() || '0'} $PROVE
          </div>
          <div className="question-number">
            Question {currentQuestion + 1} of 10
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="header-actions">
          {/* Leaderboard Button */}
          <button 
            className="leaderboard-button"
            onClick={handleLeaderboardClick}
            type="button"
            title="View Leaderboard"
          >
            <span className="leaderboard-icon">🏆</span>
            <span className="leaderboard-text">Leaderboard</span>
          </button>
         
          
          {/* Compact Lifelines and Timer Section */}
          <div className="lifelines-timer-section">
            {/* Timer Display */}
            <div 
              className={`timer-display ${timeRemaining <= 10 ? 'timer-critical' : ''}`}
              style={{
                color: timerColor,
                borderColor: timerColor,
                boxShadow: `0 10px 10px ${timerColor}33`
              }}
            >
              {timerText} {timeRemaining}s
            </div>
          </div>
        </div>
      </div>

      {/* Prize Ladder with Header - Fixed order: Q1=1000 at bottom, Q10=1000000 at top */}
      <div className="prize-ladder">
        <div className="prize-ladder-header">
          <h4 className="prize-ladder-title">💰 PRIZE LADDER</h4>
        </div>
        {[...prizeStructure].reverse().map((prize, reverseIndex) => {
          const actualIndex = prizeStructure.length - 1 - reverseIndex;
          return (
            <div 
              key={actualIndex} 
              className={`prize-item ${actualIndex === currentQuestion ? 'current' : ''} ${actualIndex < currentQuestion ? 'completed' : ''}`}
            >
              <span className="prize-number">{actualIndex + 1}</span>
              <span className="prize-amount">{prize.toLocaleString()} $PROVE</span>
            </div>
          );
        })}
      </div>

      {/* Question */}
      <div className="question-container">
        <div className="question-card">
          <h2 className="question-text">
            {question.question}
          </h2>
          
          <div className="answers-grid">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`answer-button ${selectedAnswer === index ? 'selected' : ''} ${removedAnswers.includes(index) ? 'removed' : ''} ${isAnswerSubmitted ? (index === question.correctAnswer ? 'correct' : (selectedAnswer === index ? 'incorrect' : '')) : ''}`}
                onClick={() => handleAnswerSelect(index)}
                disabled={removedAnswers.includes(index) || isAnswerSubmitted}
                type="button"
              >
                <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                <span className="answer-text">{option}</span>
              </button>
            ))}
          </div>

          <div className="action-buttons">
            <button 
              className="walk-away-button"
              onClick={walkAway}
              disabled={isAnswerSubmitted || currentQuestion === 0}
              type="button"
            >
              Walk Away
              {currentQuestion > 0 && (
                <span className="walk-away-amount">
                  ({prizeStructure[currentQuestion - 1]?.toLocaleString()} $PROVE)
                </span>
              )}
            </button>
            
            <button 
              className="submit-button"
              onClick={submitAnswer}
              disabled={selectedAnswer === null || isAnswerSubmitted}
              type="button"
            >
              {isAnswerSubmitted ? 'Processing...' : 'Final Answer'}
            </button>
          </div>
          
        </div>

        {/* Lifelines Component */}
        <Lifeline
          lifelines={lifelines}
          onLifelineUse={handleLifelineUse}
          currentQuestion={gameQuestions[currentQuestion]}
          isAnswerSubmitted={isAnswerSubmitted}
          onRemovedAnswers={handleRemovedAnswers}
        />
      </div>
    </div>
  );
};
export default GameScreen;