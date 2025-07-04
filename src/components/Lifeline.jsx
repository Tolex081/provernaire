<<<<<<< HEAD
import React, { useState, useCallback } from 'react';
import './Lifeline.css'; // You'll need to create this CSS file

const Lifeline = ({ 
  lifelines, 
  onLifelineUse, 
  currentQuestion, 
  isAnswerSubmitted,
  onRemovedAnswers 
}) => {
  const [showLifelineMenu, setShowLifelineMenu] = useState(false);
  const [showLifelineResult, setShowLifelineResult] = useState(null);

  const handleLifeline = useCallback((type) => {
    if (!lifelines[type] || !currentQuestion) return;

    // Update lifelines state in parent
    onLifelineUse(type);
    setShowLifelineMenu(false); // Close menu after selection

    switch (type) {
      case 'fiftyFifty': {
        const correctAnswer = currentQuestion.correctAnswer;
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== correctAnswer);
        const shuffledWrong = wrongAnswers.sort(() => Math.random() - 0.5);
        const toRemove = shuffledWrong.slice(0, 2);
        
        // Send removed answers back to parent
        onRemovedAnswers(toRemove);
        
        setShowLifelineResult({
          type: '50/50',
          message: `Removed options ${String.fromCharCode(65 + toRemove[0])} and ${String.fromCharCode(65 + toRemove[1])}`
        });
        break;
      }
      
      case 'phoneAddy':
        setShowLifelineResult({
          type: 'Phone Addy',
          message: "Ahhhh that's easy! The answer is " + String.fromCharCode(65 + currentQuestion.correctAnswer) + " 🎯"
        });
        break;
      
      case 'phoneYinger':
        setShowLifelineResult({
          type: 'Phone Yinger',
          message: "Banger! That's easy! Go with " + String.fromCharCode(65 + currentQuestion.correctAnswer) + " 🔥"
        });
        break;
      
      case 'askAudience': {
        const votes = [10, 15, 15, 20]; // Base votes
        const correctIdx = currentQuestion.correctAnswer;
        
        // 60% chance the audience gets it right
        if (Math.random() < 0.6) {
          votes[correctIdx] = 60;
          const remaining = 40;
          const otherIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
          let remainingVotes = remaining;
          
          otherIndices.forEach((idx, i) => {
            if (i === otherIndices.length - 1) {
              votes[idx] = remainingVotes;
            } else {
              const vote = Math.floor(Math.random() * (remainingVotes - (otherIndices.length - i - 1) * 5)) + 5;
              votes[idx] = vote;
              remainingVotes -= vote;
            }
          });
        } else {
          // Audience is wrong - distribute votes more evenly
          const shuffledIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
          votes[shuffledIndices[0]] = 35;
          votes[shuffledIndices[1]] = 30;
          votes[shuffledIndices[2]] = 20;
          votes[shuffledIndices[3]] = 15;
        }
        
        setShowLifelineResult({
          type: 'Ask Audience',
          message: `Audience votes: A(${votes[0]}%) B(${votes[1]}%) C(${votes[2]}%) D(${votes[3]}%)`
        });
        break;
      }
      
      default:
        break;
    }

    setTimeout(() => setShowLifelineResult(null), 4000);
  }, [lifelines, currentQuestion, onLifelineUse, onRemovedAnswers]);

  return (
    <>
      {/* Lifeline Result */}
      {showLifelineResult && (
        <div className="lifeline-result">
          <div className="lifeline-result-content">
            <h3 className="lifeline-result-title">{showLifelineResult.type}</h3>
            <p className="lifeline-result-message">{showLifelineResult.message}</p>
          </div>
        </div>
      )}

      {/* Lifelines Section */}
      <div className="lifelines-section">
        <button
          className="lifelines-trigger"
          onClick={() => setShowLifelineMenu(!showLifelineMenu)}
          disabled={isAnswerSubmitted}
          type="button"
          title="Open Lifelines Menu"
        >
          <span className="lifelines-text">Lifelines Available</span>
          <span className="lifelines-count">
            {Object.values(lifelines).filter(Boolean).length}
          </span>
        </button>

        {/* Lifelines Menu */}
        {showLifelineMenu && (
          <div className="lifelines-menu">
            <div className="lifelines-menu-header">
              <span>Choose a Lifeline</span>
              <button 
                className="close-menu"
                onClick={() => setShowLifelineMenu(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            
            <div className="lifelines-options">
              <button
                className={`lifeline-option ${!lifelines.fiftyFifty ? 'used' : ''}`}
                onClick={() => handleLifeline('fiftyFifty')}
                disabled={!lifelines.fiftyFifty || isAnswerSubmitted}
                type="button"
              >
                <span className="lifeline-icon">⚡</span>
                <div className="lifeline-info">
                  <span className="lifeline-name">50/50</span>
                  <span className="lifeline-desc">Remove 2 wrong answers</span>
                </div>
                {!lifelines.fiftyFifty && <span className="used-badge">USED</span>}
              </button>
              
              <button
                className={`lifeline-option ${!lifelines.phoneAddy ? 'used' : ''}`}
                onClick={() => handleLifeline('phoneAddy')}
                disabled={!lifelines.phoneAddy || isAnswerSubmitted}
                type="button"
              >
                <span className="lifeline-icon">📞</span>
                <div className="lifeline-info">
                  <span className="lifeline-name">Phone Addy</span>
                  <span className="lifeline-desc">Get expert help</span>
                </div>
                {!lifelines.phoneAddy && <span className="used-badge">USED</span>}
              </button>
              
              <button
                className={`lifeline-option ${!lifelines.phoneYinger ? 'used' : ''}`}
                onClick={() => handleLifeline('phoneYinger')}
                disabled={!lifelines.phoneYinger || isAnswerSubmitted}
                type="button"
              >
                <span className="lifeline-icon">📞</span>
                <div className="lifeline-info">
                  <span className="lifeline-name">Phone Yinger</span>
                  <span className="lifeline-desc">Call a friend</span>
                </div>
                {!lifelines.phoneYinger && <span className="used-badge">USED</span>}
              </button>
              
              <button
                className={`lifeline-option ${!lifelines.askAudience ? 'used' : ''}`}
                onClick={() => handleLifeline('askAudience')}
                disabled={!lifelines.askAudience || isAnswerSubmitted}
                type="button"
              >
                <span className="lifeline-icon">👥</span>
                <div className="lifeline-info">
                  <span className="lifeline-name">Ask Audience</span>
                  <span className="lifeline-desc">See audience votes</span>
                </div>
                {!lifelines.askAudience && <span className="used-badge">USED</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

=======
import React, { useState, useCallback } from 'react';
import './Lifeline.css'; // You'll need to create this CSS file

const Lifeline = ({ 
  lifelines, 
  onLifelineUse, 
  currentQuestion, 
  isAnswerSubmitted,
  onRemovedAnswers 
}) => {
  const [showLifelineMenu, setShowLifelineMenu] = useState(false);
  const [showLifelineResult, setShowLifelineResult] = useState(null);

  const handleLifeline = useCallback((type) => {
    if (!lifelines[type] || !currentQuestion) return;

    // Update lifelines state in parent
    onLifelineUse(type);
    setShowLifelineMenu(false); // Close menu after selection

    switch (type) {
      case 'fiftyFifty': {
        const correctAnswer = currentQuestion.correctAnswer;
        const wrongAnswers = [0, 1, 2, 3].filter(i => i !== correctAnswer);
        const shuffledWrong = wrongAnswers.sort(() => Math.random() - 0.5);
        const toRemove = shuffledWrong.slice(0, 2);
        
        // Send removed answers back to parent
        onRemovedAnswers(toRemove);
        
        setShowLifelineResult({
          type: '50/50',
          message: `Removed options ${String.fromCharCode(65 + toRemove[0])} and ${String.fromCharCode(65 + toRemove[1])}`
        });
        break;
      }
      
      case 'phoneAddy':
        setShowLifelineResult({
          type: 'Phone Addy',
          message: "Ahhhh that's easy! The answer is " + String.fromCharCode(65 + currentQuestion.correctAnswer) + " 🎯"
        });
        break;
      
      case 'phoneYinger':
        setShowLifelineResult({
          type: 'Phone Yinger',
          message: "Banger! That's easy! Go with " + String.fromCharCode(65 + currentQuestion.correctAnswer) + " 🔥"
        });
        break;
      
      case 'askAudience': {
        const votes = [10, 15, 15, 20]; // Base votes
        const correctIdx = currentQuestion.correctAnswer;
        
        // 60% chance the audience gets it right
        if (Math.random() < 0.6) {
          votes[correctIdx] = 60;
          const remaining = 40;
          const otherIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
          let remainingVotes = remaining;
          
          otherIndices.forEach((idx, i) => {
            if (i === otherIndices.length - 1) {
              votes[idx] = remainingVotes;
            } else {
              const vote = Math.floor(Math.random() * (remainingVotes - (otherIndices.length - i - 1) * 5)) + 5;
              votes[idx] = vote;
              remainingVotes -= vote;
            }
          });
        } else {
          // Audience is wrong - distribute votes more evenly
          const shuffledIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
          votes[shuffledIndices[0]] = 35;
          votes[shuffledIndices[1]] = 30;
          votes[shuffledIndices[2]] = 20;
          votes[shuffledIndices[3]] = 15;
        }
        
        setShowLifelineResult({
          type: 'Ask Audience',
          message: `Audience votes: A(${votes[0]}%) B(${votes[1]}%) C(${votes[2]}%) D(${votes[3]}%)`
        });
        break;
      }
      
      default:
        break;
    }

    setTimeout(() => setShowLifelineResult(null), 4000);
  }, [lifelines, currentQuestion, onLifelineUse, onRemovedAnswers]);

  return (
    <>
      {/* Lifeline Result */}
      {showLifelineResult && (
        <div className="lifeline-result">
          <div className="lifeline-result-content">
            <h3 className="lifeline-result-title">{showLifelineResult.type}</h3>
            <p className="lifeline-result-message">{showLifelineResult.message}</p>
          </div>
        </div>
      )}

      {/* Lifelines Section */}
      <div className="lifelines-section">
        <button
          className="lifelines-trigger"
          onClick={() => setShowLifelineMenu(!showLifelineMenu)}
          disabled={isAnswerSubmitted}
          type="button"
          title="Open Lifelines Menu"
        >
          <span className="lifelines-text">Lifelines Available</span>
          <span className="lifelines-count">
            {Object.values(lifelines).filter(Boolean).length}
          </span>
        </button>

        {/* Lifelines Menu */}
        {showLifelineMenu && (
          <div className="lifelines-menu">
            <div className="lifelines-menu-header">
              <span>Choose a Lifeline</span>
              <button 
                className="close-menu"
                onClick={() => setShowLifelineMenu(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            
            <div className="lifelines-options">
              <button
                className={`lifeline-option ${!lifelines.fiftyFifty ? 'used' : ''}`}
                onClick={() => handleLifeline('fiftyFifty')}
                disabled={!lifelines.fiftyFifty || isAnswerSubmitted}
                type="button"
              >
                <span className="lifeline-icon">⚡</span>
                <div className="lifeline-info">
                  <span className="lifeline-name">50/50</span>
                  <span className="lifeline-desc">Remove 2 wrong answers</span>
                </div>
                {!lifelines.fiftyFifty && <span className="used-badge">USED</span>}
              </button>
              
              <button
                className={`lifeline-option ${!lifelines.phoneAddy ? 'used' : ''}`}
                onClick={() => handleLifeline('phoneAddy')}
                disabled={!lifelines.phoneAddy || isAnswerSubmitted}
                type="button"
              >
                <span className="lifeline-icon">📞</span>
                <div className="lifeline-info">
                  <span className="lifeline-name">Phone Addy</span>
                  <span className="lifeline-desc">Get expert help</span>
                </div>
                {!lifelines.phoneAddy && <span className="used-badge">USED</span>}
              </button>
              
              <button
                className={`lifeline-option ${!lifelines.phoneYinger ? 'used' : ''}`}
                onClick={() => handleLifeline('phoneYinger')}
                disabled={!lifelines.phoneYinger || isAnswerSubmitted}
                type="button"
              >
                <span className="lifeline-icon">📞</span>
                <div className="lifeline-info">
                  <span className="lifeline-name">Phone Yinger</span>
                  <span className="lifeline-desc">Call a friend</span>
                </div>
                {!lifelines.phoneYinger && <span className="used-badge">USED</span>}
              </button>
              
              <button
                className={`lifeline-option ${!lifelines.askAudience ? 'used' : ''}`}
                onClick={() => handleLifeline('askAudience')}
                disabled={!lifelines.askAudience || isAnswerSubmitted}
                type="button"
              >
                <span className="lifeline-icon">👥</span>
                <div className="lifeline-info">
                  <span className="lifeline-name">Ask Audience</span>
                  <span className="lifeline-desc">See audience votes</span>
                </div>
                {!lifelines.askAudience && <span className="used-badge">USED</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

>>>>>>> ebbaf7b42d1bfb69b875a560428d6b4509af66af
export default Lifeline;