// src/components/TeamSelection.jsx
import React, { useState } from 'react';
import './TeamSelection.css';

// Define API_BASE_URL for frontend calls.
// On Vercel, it should be an empty string so calls are relative (e.g., /api/teams).
// In local development, it might be 'http://localhost:5000' if you use a local backend.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || ''; // Default to empty string for relative paths

const TeamSelection = ({ teams, onTeamSelect, username, selectedTeam }) => {
  const [isLoading, setIsLoading] = useState(false);

  const saveUserTeam = async (username, team) => {
    try {
      // Construct the full API URL. It must include '/api/' to match vercel.json rewrites.
      const response = await fetch(`${API_BASE_URL}/api/teams`, { // <-- CORRECTED: Ensured '/api' prefix
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          team: {
            name: team.name,
            color: team.color
          },
          pfp: team.leaderImage || null
        }),
      });

      if (!response.ok) {
        // Read response text for better error messages
        const text = await response.text(); 
        throw new Error(`Failed to save team: ${response.status} - ${text}`);
      }

      const data = await response.json();
      console.log('✅ Team selection saved:', data);
      return data;
    } catch (error) {
      console.error('❌ Error saving team:', error.message);
      throw error;
    }
  };

  const handleTeamSelect = async (team) => {
    if (!username || !username.trim()) {
      alert('Please enter a username first!');
      return;
    }

    if (selectedTeam && selectedTeam.name !== team.name) {
      alert(`You already selected ${selectedTeam.name}. Please re-select that to continue.`);
      return;
    }

    try {
      setIsLoading(true);
      await saveUserTeam(username.trim(), team);
      onTeamSelect(team);
    } catch (error) {
      console.error('❌ Failed to save team selection:', error);
      alert('Error saving team selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="screen-container">
      <div className="team-selection">
        <h2>Choose Your Team</h2>

        {isLoading && (
          <div className="loading-indicator">
            <p>Processing team selection...</p>
          </div>
        )}

        <div className="teams-grid">
          {teams.map((team, index) => (
            <button
              key={index}
              className={`team-button ${selectedTeam?.name === team.name ? 'current' : ''}`}
              style={{ backgroundColor: team.color }}
              onClick={() => handleTeamSelect(team)}
              disabled={isLoading}
            >
              <div className="team-leader-image">
                <img
                  src={team.leaderImage}
                  alt={`${team.leaderName || team.name} leader`}
                  className="leader-pfp"
                />
              </div>
              <div className="team-info">
                <span className="team-name">{team.name}</span>
                {team.leaderName && (
                  <span className="leader-name">{team.leaderName}</span>
                )}
              </div>
              {selectedTeam?.name === team.name && (
                <div className="current-indicator">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TeamSelection;
