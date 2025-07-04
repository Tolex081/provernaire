import React from 'react';
import './PreviewScreen.css'; // Assuming you have a CSS file for styling

const PreviewScreen = ({ userProfile, selectedTeam, onStartGame, onChangeTeam, teamLocked }) => {
  return (
    <div className="app">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-shapes">
          <div className="shape shape-0"></div>
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="screen-container">
        <div className="login-screen">
          <div className="succinct-logo" style={{ marginBottom: '32px' }}>
            <span className="logo-text">Who Wants To Be A Provernaire</span>
            <span className="logo-subtitle">Test your knowledge and win $PROVE tokens!</span>
          </div>

          {/* User Info Display */}
          <div className="user-info-large" style={{ marginBottom: '30px' }}>
            <img
              src={userProfile.pfp}
              alt="Profile"
              className="user-pfp-large"
            />
            <div>
              <h2 className="username-large">{userProfile.username}</h2>
              <div 
                className="user-team-display"
                style={{ 
                  backgroundColor: selectedTeam?.color,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  color: '#000',
                  fontWeight: 'bold',
                  marginTop: '8px',
                  display: 'inline-block'
                }}
              >
                {selectedTeam?.name}
              </div>
            </div>
          </div>

          {/* Game Instructions */}
          <div style={{ marginBottom: '40px', textAlign: 'left', maxWidth: '600px', margin: '0 auto 40px' }}>
            <h3 style={{ fontSize: '24px', color: '#ffffff', marginBottom: '20px', textAlign: 'center' }}>
              Game Rules
            </h3>
            
            <div style={{ fontSize: '16px', color: '#d1d5db', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#B0FF6F' }}> Objective:</strong> Answer 10 questions correctly to win the grand prize of 1,000,000 $PROVE tokens!
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#FF54D7' }}>Prize Structure:</strong> Each correct answer increases your prize money. Wrong answer = game over!
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#B753FF' }}>🛟 Lifelines:</strong> You have 4 lifelines to help you:
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  <li><strong>50/50:</strong> Removes 2 wrong answers</li>
                  <li><strong>Phone Addy:</strong> Get the correct answer</li>
                  <li><strong>Phone Yinger:</strong> Get the correct answer</li>
                  <li><strong>Ask Audience:</strong> See how the audience voted</li>
                </ul>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#FF955E' }}> Walk Away:</strong> You can walk away at any time with your current prize (except on question 1).
              </div>
              
            </div>
          </div>

        

          {/* Start Game Button */}
          <button
            onClick={onStartGame}
            className="login-button"
            style={{ 
              fontSize: '20px', 
              padding: '20px 40px',
              width: 'auto',
              display: 'inline-block',
              background: 'linear-gradient(45deg, #B753FF, #FF54D7)',
              boxShadow: '0 8px 32px rgba(183, 83, 255, 0.3)',
              transform: 'scale(1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 12px 40px rgba(183, 83, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 32px rgba(183, 83, 255, 0.3)';
            }}
          >
             Start Game
          </button>


        </div>
      </div>
    </div>
  );
};
export default PreviewScreen;