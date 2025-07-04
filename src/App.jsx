
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import TeamSelection from './components/TeamSelection';
import PreviewScreen from './components/PreviewScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import AnimatedBackground from './components/AnimatedBackground';
import Leaderboard from './components/Leaderboard';
import TeamLeader1 from './assets/Yinger2.png';
import TeamLeader2 from './assets/Advaith3.jpg';
import TeamLeader3 from './assets/fake.jpg';
import TeamLeader4 from './assets/zkdan.jpg';
import TeamLeader5 from './assets/lsquare.jpg';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const App = () => {
  const [gameState, setGameState] = useState('login');
  const [userProfile, setUserProfile] = useState({ username: '', pfp: '' });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [players, setPlayers] = useState([]);
  const [isCheckingUserTeam, setIsCheckingUserTeam] = useState(false);

  const teams = [
    { name: "Team Pink", leaderName: "Yinger", leaderImage: TeamLeader1, color: "#FF54D7" },
    { name: "Team Blue", leaderName: "Addy", leaderImage: TeamLeader2, color: "#61C3FF" },
    { name: "Team Green", leaderName: "fakedev9999", leaderImage: TeamLeader3, color: "#B0FF6F" },
    { name: "Team Purple", leaderName: "zkDan", leaderImage: TeamLeader4, color: "#B753FF" },
    { name: "Team Orange", leaderName: "Lsquared²", leaderImage: TeamLeader5, color: "#FF955E" }
  ];

  const checkUserTeam = async (username) => {
    if (!username?.trim()) return null;
    try {
      const cleanUsername = username.replace(/^@/, '').trim();
      const response = await fetch(`${API_BASE_URL}/api/teams/${encodeURIComponent(cleanUsername)}`);
      if (response.ok) {
        const data = await response.json();
        const fullTeam = teams.find(t => t.name === data.team.name || t.name === data.team);
        return { team: fullTeam || null };
      }
      return null;
    } catch (error) {
      console.error('❌ Error checking user team:', error);
      return null;
    }
  };

  const saveUserTeam = async (username, team) => {
    if (!username?.trim() || !team) return false;
    try {
      const cleanUsername = username.replace(/^@/, '').trim();
      const payload = {
        username: cleanUsername,
        team: { name: team.name, color: team.color },
        pfp: userProfile.pfp || null
      };
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Error saving user team:', error);
      return false;
    }
  };

  const handleLogin = async (userData) => {
    const newUserProfile = {
      username: userData.username,
      pfp: userData.previewUrl || userData.pfp || `https://via.placeholder.com/150/333/fff?text=${userData.username?.[0] || "U"}`
    };
    setUserProfile(newUserProfile);

    setIsCheckingUserTeam(true);
    const result = await checkUserTeam(newUserProfile.username);
    setIsCheckingUserTeam(false);

    if (result?.team) {
      setSelectedTeam(result.team);
      setGameState('preview');
    } else {
      setGameState('teamSelect');
    }
  };

  const handleTeamSelect = async (team) => {
    const previouslySelected = selectedTeam;

    if (previouslySelected) {
      if (previouslySelected.name === team.name) {
        setSelectedTeam(team);
        setGameState('preview');
        return;
      } else {
        alert(`You already selected ${previouslySelected.name}. Please re-select that to continue.`);
        return;
      }
    }

    setSelectedTeam(team);

    if (userProfile?.username) {
      try {
        const saved = await saveUserTeam(userProfile.username, team);
        if (!saved) {
          console.warn('⚠️ Failed to save team selection');
        }
      } catch (error) {
        console.error('❌ Error during team save:', error);
      }
    }

    setGameState('preview');
  };

  const handleChangeTeam = () => setGameState('teamSelect');
  const handleStartGame = () => setGameState('playing');

  const handleGameEnd = (score) => {
    setFinalScore(score);
    setGameState('finished');
  };

  const handlePlayAgain = () => {
    setFinalScore(0);
    setGameState('preview');
  };

  const handleScoreUpdate = async (scoreData) => {
    setPlayers(prev => {
      const updated = [...prev];
      const index = updated.findIndex(p => p.username === scoreData.username);
      if (index !== -1) {
        updated[index] = { ...updated[index], ...scoreData, timestamp: Date.now() };
      } else {
        updated.push({ ...scoreData, timestamp: Date.now() });
      }
      return updated.sort((a, b) => b.score - a.score);
    });

    try {
      await fetch(`${API_BASE_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: scoreData.username?.replace(/^@/, ''),
          pfp: scoreData.pfp || '',
          team: scoreData.team?.name || scoreData.team || '',
          score: scoreData.score || 0,
          questionNumber: scoreData.questionNumber || 0,
          completed: !!scoreData.completed,
          failed: !!scoreData.failed,
          walkedAway: !!scoreData.walkedAway,
          timeUp: !!scoreData.timeUp,
          timestamp: Date.now()
        })
      });
    } catch (err) {
      console.error('❌ Failed to save score to MongoDB:', err);
    }
  };

  const handleNavigateToLeaderboard = () => setGameState('leaderboard');

  const handleBackFromLeaderboard = () => {
    if (finalScore > 0) {
      setGameState('finished');
    } else {
      setGameState('playing');
    }
  };

  useEffect(() => {
    if (gameState === 'leaderboard') {
      const fetchLeaderboard = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/players`);
          const data = await res.json();
          setPlayers(data);
        } catch (err) {
          console.error('❌ Error fetching leaderboard:', err);
        }
      };
      fetchLeaderboard();
    }
  }, [gameState]);

  const renderCurrentScreen = () => {
    if (isCheckingUserTeam) {
      return (
        <div className="loading-screen">
          <div className="loading-message">
            <h2>Loading your team selection...</h2>
            <div className="loading-spinner"></div>
          </div>
        </div>
      );
    }

    switch (gameState) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'teamSelect':
        return (
          <TeamSelection
            teams={teams}
            onTeamSelect={handleTeamSelect}
            userProfile={userProfile}
            username={userProfile.username}
            selectedTeam={selectedTeam}
          />
        );
      case 'preview':
        return (
          <PreviewScreen
            selectedTeam={selectedTeam}
            userProfile={userProfile}
            onStartGame={handleStartGame}
            onChangeTeam={handleChangeTeam}
          />
        );
      case 'playing':
        return (
          <GameScreen
            selectedTeam={selectedTeam}
            userProfile={userProfile}
            onGameEnd={handleGameEnd}
            onScoreUpdate={handleScoreUpdate}
            onNavigateToLeaderboard={handleNavigateToLeaderboard}
          />
        );
      case 'finished':
        return (
          <ResultScreen
            finalScore={finalScore}
            selectedTeam={selectedTeam}
            userProfile={userProfile}
            onPlayAgain={handlePlayAgain}
            onScoreUpdate={handleScoreUpdate}
            onNavigateToLeaderboard={handleNavigateToLeaderboard}
          />
        );
      case 'leaderboard':
        return (
          <Leaderboard
            players={players}
            currentUser={userProfile}
            isVisible={true}
            onBack={handleBackFromLeaderboard}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="app">
      <AnimatedBackground teams={teams} />
      <div className="content">{renderCurrentScreen()}</div>
    </div>
  );
};

export default App;
