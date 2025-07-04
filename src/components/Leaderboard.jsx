<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './Leaderboard.css';

const Leaderboard = ({ 
  leaderboardData = [], 
  onBackToGame, 
  userProfile, 
  selectedTeam,
  isVisible = true,
  onBack 
}) => {
  const [sortedData, setSortedData] = useState([]);
  const [filterBy, setFilterBy] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  
  // Use refs to avoid dependency issues
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const initialFetchDone = useRef(false);

  // Memoize static values to prevent re-renders
  const colors = useMemo(() => ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'], []);

  // Get valid image URL - memoized to prevent re-creation
  const getValidImageUrl = useCallback((pfp, username) => {
    if (!pfp || pfp.startsWith('blob:') || pfp === '/default-avatar.png') {
      const colorIndex = username.charCodeAt(0) % colors.length;
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${colors[colorIndex].slice(1)}&color=fff&size=50`;
    }
    return pfp;
  }, [colors]);

  // Process and deduplicate data - stable function
  const processLeaderboardData = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    const uniqueData = [];
    const seenUsernames = new Set();
    
    const sorted = [...data].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    sorted.forEach(player => {
      if (!seenUsernames.has(player.username)) {
        seenUsernames.add(player.username);
        uniqueData.push(player);
      }
    });
    
    return uniqueData;
  }, []);

  // Fetch leaderboard data - stable function with minimal dependencies
  const fetchLeaderboard = useCallback(async (isBackgroundRefresh = false) => {
  if (!mountedRef.current) return;

  try {
    if (!isBackgroundRefresh && !hasInitiallyLoaded) {
      setIsLoading(true);
    } else if (isBackgroundRefresh) {
      setIsRefreshing(true);
    }

    setError(null);

    // ✅ Use environment variable (CRA format)
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    const endpoint = `${API_BASE_URL}/players`;

    const res = await fetch(endpoint);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('📊 Leaderboard data received:', data);

    if (!mountedRef.current) return;

    const processedData = processLeaderboardData(data);
    setSortedData(processedData);
    setLastUpdated(new Date());

    if (!hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
      initialFetchDone.current = true;
    }
  } catch (err) {
    console.error('❌ Error fetching leaderboard:', err);
    if (!mountedRef.current) return;

    setError(err.message);

    if (leaderboardData && leaderboardData.length > 0 && !hasInitiallyLoaded) {
      console.log('📋 Using fallback data from props:', leaderboardData);
      const processedData = processLeaderboardData(leaderboardData);
      setSortedData(processedData);
      setLastUpdated(new Date());
      setHasInitiallyLoaded(true);
      initialFetchDone.current = true;
    }
  } finally {
    if (mountedRef.current) {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }
}, [processLeaderboardData, leaderboardData, hasInitiallyLoaded]);

  // Setup auto-refresh with cleanup
  useEffect(() => {
    if (!isVisible) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only do initial fetch if we haven't loaded before or if data is empty
    if (!initialFetchDone.current || sortedData.length === 0) {
      fetchLeaderboard(false);
    }
    
    // Setup auto-refresh every 60 seconds
    intervalRef.current = setInterval(() => {
      if (mountedRef.current && isVisible) {
        fetchLeaderboard(true); // Always background refresh for interval
      }
    }, 60000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible]); // Removed fetchLeaderboard from dependencies

  // Handle cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Use fallback data when not visible - separate effect with proper dependencies
  useEffect(() => {
    if (!isVisible && !hasInitiallyLoaded && leaderboardData && leaderboardData.length > 0) {
      console.log('📋 Using fallback data from props:', leaderboardData);
      const processedData = processLeaderboardData(leaderboardData);
      setSortedData(processedData);
      setIsLoading(false);
      setLastUpdated(new Date());
      setHasInitiallyLoaded(true);
      initialFetchDone.current = true;
    }
  }, [isVisible, leaderboardData, hasInitiallyLoaded, processLeaderboardData]);

  // Memoize filtered and sorted data to prevent unnecessary recalculations
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...sortedData];
    
    switch (filterBy) {
      case 'team':
        filtered = filtered.filter(entry => 
          entry.team && selectedTeam && entry.team.name === selectedTeam.name
        );
        break;
      case 'completed':
        filtered = filtered.filter(entry => entry.completed === true);
        break;
      default:
        break;
    }
    
    filtered.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (b.questionNumber || 0) - (a.questionNumber || 0);
    });
    
    return filtered;
  }, [sortedData, filterBy, selectedTeam]);

  // Memoize current user data
  const currentUserData = useMemo(() => {
    const currentUserEntry = filteredAndSortedData.find(entry => 
      entry.username === userProfile?.username
    );
    const currentUserRank = currentUserEntry ? 
      filteredAndSortedData.findIndex(entry => entry.username === userProfile?.username) + 1 : null;
    
    return { currentUserEntry, currentUserRank };
  }, [filteredAndSortedData, userProfile?.username]);

  // Memoize team stats to prevent recalculation
  const teamStats = useMemo(() => {
    const stats = {};
    sortedData.forEach(entry => {
      if (entry.team) {
        const teamName = entry.team.name;
        if (!stats[teamName]) {
          stats[teamName] = {
            name: teamName,
            color: entry.team.color,
            totalScore: 0,
            playerCount: 0,
            avgScore: 0,
            topScore: 0
          };
        }
        stats[teamName].totalScore += entry.score || 0;
        stats[teamName].playerCount += 1;
        stats[teamName].topScore = Math.max(stats[teamName].topScore, entry.score || 0);
      }
    });

    Object.values(stats).forEach(team => {
      team.avgScore = Math.round(team.totalScore / team.playerCount);
    });

    return Object.values(stats).sort((a, b) => b.totalScore - a.totalScore);
  }, [sortedData]);

  // Stable functions that don't need useCallback
  const getRankStyling = (index) => {
    switch (index) {
      case 0:
        return { 
          icon: '👑', 
          class: 'rank-first',
          gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
          glow: '#FFD700'
        };
      case 1:
        return { 
          icon: '🥈', 
          class: 'rank-second',
          gradient: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)',
          glow: '#C0C0C0'
        };
      case 2:
        return { 
          icon: '🥉', 
          class: 'rank-third',
          gradient: 'linear-gradient(135deg, #CD7F32, #B87333)',
          glow: '#CD7F32'
        };
      default:
        return { 
          icon: `#${index + 1}`, 
          class: 'rank-other',
          gradient: 'linear-gradient(135deg, #6B73FF, #000DFF)',
          glow: '#6B73FF'
        };
    }
  };

  const getStatusBadge = (entry) => {
  // ✅ Only mark as millionaire if completed all
  if (entry.completed && entry.score >= 1000000) {
    return { text: 'PROVERNAIRE', class: 'status-completed', icon: '💎' };
  } else if (entry.failed) {
    return { text: 'ELIMINATED', class: 'status-failed', icon: '💥' };
  } else if (entry.walkedAway) {
    return { text: 'WALKED AWAY', class: 'status-walked', icon: '🚶' };
  } else if (entry.timeUp) {
    return { text: 'TIME UP', class: 'status-timeout', icon: '⏰' };
  } else {
    return { text: 'IN PROGRESS', class: 'status-progress', icon: '🎮' };
  }
};


  // Stable back handler
  const handleBackClick = useCallback(() => {
    if (onBackToGame) {
      onBackToGame();
    } else if (onBack) {
      onBack();
    }
  }, [onBackToGame, onBack]);

  // Memoize last updated text
  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - lastUpdated) / 1000);
    
    if (diffInSeconds < 60) {
      return `Updated ${diffInSeconds} seconds ago`;
    } else {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      return `Updated ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
  }, [lastUpdated]);

  // Loading state - ONLY show on very first load
  if (isLoading && !hasInitiallyLoaded) {
    return (
      <div className="leaderboard-screen">
        <div className="background-animation">
          <div className="floating-shapes">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`shape shape-${i % 4}`}></div>
            ))}
          </div>
        </div>
        <div className="loading-content">
          <div className="loading-spinner">🎮</div>
          <div className="loading-text">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  // Error state - only show if we have an error AND no data AND haven't loaded before
  if (error && sortedData.length === 0 && !hasInitiallyLoaded) {
    return (
      <div className="leaderboard-screen">
        <div className="background-animation">
          <div className="floating-shapes">
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`shape shape-${i % 3}`}></div>
            ))}
          </div>
        </div>
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Failed to load leaderboard</h3>
          <p>{error}</p>
          <button onClick={() => fetchLeaderboard(false)}>Retry</button>
          {handleBackClick && (
            <button onClick={handleBackClick} style={{ marginLeft: '10px' }}>
              Back to Game
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-screen">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-shapes">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`shape shape-${i % 4}`}></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="leaderboard-header">
        <button 
          className="back-button"
          onClick={handleBackClick}
          type="button"
        >
          <span className="back-icon">←</span>
          <span className="back-text">Back to Game</span>
        </button>
        
        <div className="header-title">
          <h1 className="leaderboard-title">🏆 LEADERBOARD</h1>
          <p className="leaderboard-subtitle">Who Wants to Be a Provernaire</p>
          {userProfile && (
            <p className="current-user">Playing as: @{userProfile.username}</p>
          )}
          
          <div className="refresh-info">
            {isRefreshing && (
              <span className="refresh-indicator">
                🔄 Updating...
              </span>
            )}
            {lastUpdated && !isRefreshing && (
              <span className="last-updated">
                {lastUpdatedText}
              </span>
            )}
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{sortedData.length}</span>
            <span className="stat-label">Total Players</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {sortedData.filter(e => e.completed).length}
            </span>
            <span className="stat-label">PROVERNAIRE</span>
          </div>
        </div>
      </div>

      {/* User Performance Card */}
      {currentUserData.currentUserEntry && (
        <div className="user-performance-card">
          <div className="performance-header">
            <h3>Your Performance</h3>
            <div className="user-rank">
              Rank #{currentUserData.currentUserRank}
            </div>
          </div>
          <div className="performance-content">
            <img 
              src={getValidImageUrl(currentUserData.currentUserEntry.pfp, currentUserData.currentUserEntry.username)} 
              alt="Your profile" 
              className="performance-pfp"
              onError={(e) => {
                e.target.src = getValidImageUrl(null, currentUserData.currentUserEntry.username);
              }}
            />
            <div className="performance-details">
              <div className="performance-score">
                {(currentUserData.currentUserEntry.score || 0).toLocaleString()} $PROVE
              </div>
              <div className="performance-info">
  <span 
    className="performance-team"
    style={{ color: currentUserData.currentUserEntry.team?.color }}
  >
    {currentUserData.currentUserEntry.team?.name || 'No Team'}
  </span>
</div>

            </div>
            <div className="performance-status">
              {(() => {
                const status = getStatusBadge(currentUserData.currentUserEntry);
                return (
                  <span className={`status-badge ${status.class}`}>
                    {status.icon} {status.text}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="leaderboard-filters">
        <button 
          className={`filter-button ${filterBy === 'all' ? 'active' : ''}`}
          onClick={() => setFilterBy('all')}
          type="button"
        >
          🌍 All Players ({sortedData.length})
        </button>
        <button 
          className={`filter-button ${filterBy === 'team' ? 'active' : ''}`}
          onClick={() => setFilterBy('team')}
          type="button"
          disabled={!selectedTeam}
        >
          👥 My Team ({sortedData.filter(p => p.team && selectedTeam && p.team.name === selectedTeam.name).length})
        </button>
        <button 
  className={`filter-button ${filterBy === 'completed' ? 'active' : ''}`}
  onClick={() => setFilterBy('completed')}
  type="button"
>
  💎 PROVERNAIRES({sortedData.filter(p => p.completed && p.score >= 1000000).length})
</button>

      </div>

      {/* Main Content */}
      <div className="leaderboard-content">
        {/* Top 3 Podium */}
        {filteredAndSortedData.length >= 3 && (
          <div className="podium-section">
            <h3 className="section-title">🥇 Hall of Fame</h3>
            <div className="podium">
              {/* Second Place */}
              {filteredAndSortedData[1] && (
                <div className="podium-position second">
                  <div className="podium-player">
                    <img 
                      src={getValidImageUrl(filteredAndSortedData[1].pfp, filteredAndSortedData[1].username)} 
                      alt={filteredAndSortedData[1].username}
                      className="podium-pfp"
                      onError={(e) => {
                        e.target.src = getValidImageUrl(null, filteredAndSortedData[1].username);
                      }}
                    />
                    <div className="podium-info">
                      <div className="podium-username">@{filteredAndSortedData[1].username}</div>
                      <div className="podium-score">
                        {(filteredAndSortedData[1].score || 0).toLocaleString()} $PROVE
                      </div>
                      <div 
                        className="podium-team"
                        style={{ backgroundColor: filteredAndSortedData[1].team?.color }}
                      >
                        {filteredAndSortedData[1].team?.name || 'No Team'}
                      </div>
                    </div>
                  </div>
                  <div className="podium-rank">🥈</div>
                  <div className="podium-height second-height"></div>
                </div>
              )}

              {/* First Place */}
              <div className="podium-position first">
                <div className="crown-animation">👑</div>
                <div className="podium-player">
                  <img 
                    src={getValidImageUrl(filteredAndSortedData[0].pfp, filteredAndSortedData[0].username)} 
                    alt={filteredAndSortedData[0].username}
                    className="podium-pfp"
                    onError={(e) => {
                      e.target.src = getValidImageUrl(null, filteredAndSortedData[0].username);
                    }}
                  />
                  <div className="podium-info">
                    <div className="podium-username">@{filteredAndSortedData[0].username}</div>
                    <div className="podium-score">
                      {(filteredAndSortedData[0].score || 0).toLocaleString()} $PROVE
                    </div>
                    <div 
                      className="podium-team"
                      style={{ backgroundColor: filteredAndSortedData[0].team?.color }}
                    >
                      {filteredAndSortedData[0].team?.name || 'No Team'}
                    </div>
                  </div>
                </div>
                <div className="podium-rank">🥇</div>
                <div className="podium-height first-height"></div>
              </div>

              {/* Third Place */}
              {filteredAndSortedData[2] && (
                <div className="podium-position third">
                  <div className="podium-player">
                    <img 
                      src={getValidImageUrl(filteredAndSortedData[2].pfp, filteredAndSortedData[2].username)} 
                      alt={filteredAndSortedData[2].username}
                      className="podium-pfp"
                      onError={(e) => {
                        e.target.src = getValidImageUrl(null, filteredAndSortedData[2].username);
                      }}
                    />
                    <div className="podium-info">
                      <div className="podium-username">@{filteredAndSortedData[2].username}</div>
                      <div className="podium-score">
                        {(filteredAndSortedData[2].score || 0).toLocaleString()} $PROVE
                      </div>
                      <div 
                        className="podium-team"
                        style={{ backgroundColor: filteredAndSortedData[2].team?.color }}
                      >
                        {filteredAndSortedData[2].team?.name || 'No Team'}
                      </div>
                    </div>
                  </div>
                  <div className="podium-rank">🥉</div>
                  <div className="podium-height third-height"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Rankings List */}
        <div className="rankings-section">
          <h3 className="section-title">📊 Full Rankings</h3>
          <div className="rankings-list">
            {filteredAndSortedData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎮</div>
                <div className="empty-title">
                  {sortedData.length === 0 
                    ? "No players have joined yet!" 
                    : "No players in this category!"}
                </div>
                <div className="empty-subtitle">
                  {sortedData.length === 0 
                    ? "Be the first to play and claim the top spot" 
                    : "Switch to 'All Players' to see everyone."}
                </div>
                {error && (
                  <p className="error-hint">
                    Connection error: {error}
                  </p>
                )}
              </div>
            ) : (
              filteredAndSortedData.map((entry, index) => {
                const rankStyle = getRankStyling(index);
                const status = getStatusBadge(entry);
                const isCurrentUser = entry.username === userProfile?.username;
                
                return (
                  <div 
                    key={`${entry._id || entry.username}-${entry.score}-${index}`}
                    className={`ranking-item ${rankStyle.class} ${isCurrentUser ? 'current-user' : ''}`}
                    style={{
                      background: rankStyle.gradient,
                      boxShadow: `0 4px 20px ${rankStyle.glow}33`
                    }}
                  >
                    <div className="ranking-rank">
                      {rankStyle.icon}
                    </div>
                    
                    <img 
                      src={getValidImageUrl(entry.pfp, entry.username)} 
                      alt={entry.username}
                      className="ranking-pfp"
                      onError={(e) => {
                        e.target.src = getValidImageUrl(null, entry.username);
                      }}
                    />
                    
                    <div className="ranking-info">
                      <div className="ranking-username">
                        @{entry.username}
                        {isCurrentUser && <span className="you-badge">YOU</span>}
                      </div>
                      <div className="ranking-details">
  <span 
    className="ranking-team"
    style={{ color: entry.team?.color }}
  >
    {entry.team?.name || 'No Team'}
  </span>
</div>

                    </div>
                    
                    <div className="ranking-score">
                      <div className="score-amount">
                        {(entry.score || 0).toLocaleString()}
                      </div>
                      <div className="score-currency">$PROVE</div>
                    </div>
                    
                    <div className="ranking-status">
                      <span className={`status-badge ${status.class}`}>
                        {status.icon} {status.text}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Team Statistics */}
        {teamStats.length > 0 && (
          <div className="team-stats-section">
            <h3 className="section-title">Team Performance</h3>
            <div className="team-stats-grid">
              {teamStats.map((team, index) => (
                <div 
                  key={team.name}
                  className="team-stat-card"
                  style={{
                    borderColor: team.color,
                    boxShadow: `0 4px 20px ${team.color}33`
                  }}
                >
                  <div className="team-stat-header">
                    <div 
                      className="team-stat-color"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <h4 className="team-stat-name">{team.name}</h4>
                    <div className="team-stat-rank">#{index + 1}</div>
                  </div>
                  <div className="team-stat-metrics">
                    <div className="team-metric">
                      <span className="metric-value">{team.totalScore.toLocaleString()}</span>
                      <span className="metric-label">Total Score</span>
                    </div>
                    <div className="team-metric">
                      <span className="metric-value">{team.avgScore.toLocaleString()}</span>
                      <span className="metric-label">Avg Score</span>
                    </div>
                    <div className="team-metric">
                      <span className="metric-value">{team.playerCount}</span>
                      <span className="metric-label">Players</span>
                    </div>
                    <div className="team-metric">
                      <span className="metric-value">{team.topScore.toLocaleString()}</span>
                      <span className="metric-label">Best Score</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="stats-footer">
        <div className="stat-item">
          <span className="stat-number">{sortedData.length}</span>
          <span className="stat-label">Total Players</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{sortedData.filter(p => p.completed).length}</span>
          <span className="stat-label">Winners</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {sortedData.length > 0 ? Math.max(...sortedData.map(p => p.score || 0)).toLocaleString() : '0'}
          </span>
          <span className="stat-label">Highest Score</span>
        </div>
      </div>
    </div>
  );
};

=======
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './Leaderboard.css';

const Leaderboard = ({ 
  leaderboardData = [], 
  onBackToGame, 
  userProfile, 
  selectedTeam,
  isVisible = true,
  onBack 
}) => {
  const [sortedData, setSortedData] = useState([]);
  const [filterBy, setFilterBy] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  
  // Use refs to avoid dependency issues
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const initialFetchDone = useRef(false);

  // Memoize static values to prevent re-renders
  const colors = useMemo(() => ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'], []);

  // Get valid image URL - memoized to prevent re-creation
  const getValidImageUrl = useCallback((pfp, username) => {
    if (!pfp || pfp.startsWith('blob:') || pfp === '/default-avatar.png') {
      const colorIndex = username.charCodeAt(0) % colors.length;
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${colors[colorIndex].slice(1)}&color=fff&size=50`;
    }
    return pfp;
  }, [colors]);

  // Process and deduplicate data - stable function
  const processLeaderboardData = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    const uniqueData = [];
    const seenUsernames = new Set();
    
    const sorted = [...data].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    sorted.forEach(player => {
      if (!seenUsernames.has(player.username)) {
        seenUsernames.add(player.username);
        uniqueData.push(player);
      }
    });
    
    return uniqueData;
  }, []);

  // Fetch leaderboard data - stable function with minimal dependencies
  const fetchLeaderboard = useCallback(async (isBackgroundRefresh = false) => {
  if (!mountedRef.current) return;

  try {
    if (!isBackgroundRefresh && !hasInitiallyLoaded) {
      setIsLoading(true);
    } else if (isBackgroundRefresh) {
      setIsRefreshing(true);
    }

    setError(null);

    // ✅ Use environment variable (CRA format)
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    const endpoint = `${API_BASE_URL}/players`;

    const res = await fetch(endpoint);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('📊 Leaderboard data received:', data);

    if (!mountedRef.current) return;

    const processedData = processLeaderboardData(data);
    setSortedData(processedData);
    setLastUpdated(new Date());

    if (!hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
      initialFetchDone.current = true;
    }
  } catch (err) {
    console.error('❌ Error fetching leaderboard:', err);
    if (!mountedRef.current) return;

    setError(err.message);

    if (leaderboardData && leaderboardData.length > 0 && !hasInitiallyLoaded) {
      console.log('📋 Using fallback data from props:', leaderboardData);
      const processedData = processLeaderboardData(leaderboardData);
      setSortedData(processedData);
      setLastUpdated(new Date());
      setHasInitiallyLoaded(true);
      initialFetchDone.current = true;
    }
  } finally {
    if (mountedRef.current) {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }
}, [processLeaderboardData, leaderboardData, hasInitiallyLoaded]);

  // Setup auto-refresh with cleanup
  useEffect(() => {
    if (!isVisible) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only do initial fetch if we haven't loaded before or if data is empty
    if (!initialFetchDone.current || sortedData.length === 0) {
      fetchLeaderboard(false);
    }
    
    // Setup auto-refresh every 60 seconds
    intervalRef.current = setInterval(() => {
      if (mountedRef.current && isVisible) {
        fetchLeaderboard(true); // Always background refresh for interval
      }
    }, 60000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible]); // Removed fetchLeaderboard from dependencies

  // Handle cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Use fallback data when not visible - separate effect with proper dependencies
  useEffect(() => {
    if (!isVisible && !hasInitiallyLoaded && leaderboardData && leaderboardData.length > 0) {
      console.log('📋 Using fallback data from props:', leaderboardData);
      const processedData = processLeaderboardData(leaderboardData);
      setSortedData(processedData);
      setIsLoading(false);
      setLastUpdated(new Date());
      setHasInitiallyLoaded(true);
      initialFetchDone.current = true;
    }
  }, [isVisible, leaderboardData, hasInitiallyLoaded, processLeaderboardData]);

  // Memoize filtered and sorted data to prevent unnecessary recalculations
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...sortedData];
    
    switch (filterBy) {
      case 'team':
        filtered = filtered.filter(entry => 
          entry.team && selectedTeam && entry.team.name === selectedTeam.name
        );
        break;
      case 'completed':
        filtered = filtered.filter(entry => entry.completed === true);
        break;
      default:
        break;
    }
    
    filtered.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (b.questionNumber || 0) - (a.questionNumber || 0);
    });
    
    return filtered;
  }, [sortedData, filterBy, selectedTeam]);

  // Memoize current user data
  const currentUserData = useMemo(() => {
    const currentUserEntry = filteredAndSortedData.find(entry => 
      entry.username === userProfile?.username
    );
    const currentUserRank = currentUserEntry ? 
      filteredAndSortedData.findIndex(entry => entry.username === userProfile?.username) + 1 : null;
    
    return { currentUserEntry, currentUserRank };
  }, [filteredAndSortedData, userProfile?.username]);

  // Memoize team stats to prevent recalculation
  const teamStats = useMemo(() => {
    const stats = {};
    sortedData.forEach(entry => {
      if (entry.team) {
        const teamName = entry.team.name;
        if (!stats[teamName]) {
          stats[teamName] = {
            name: teamName,
            color: entry.team.color,
            totalScore: 0,
            playerCount: 0,
            avgScore: 0,
            topScore: 0
          };
        }
        stats[teamName].totalScore += entry.score || 0;
        stats[teamName].playerCount += 1;
        stats[teamName].topScore = Math.max(stats[teamName].topScore, entry.score || 0);
      }
    });

    Object.values(stats).forEach(team => {
      team.avgScore = Math.round(team.totalScore / team.playerCount);
    });

    return Object.values(stats).sort((a, b) => b.totalScore - a.totalScore);
  }, [sortedData]);

  // Stable functions that don't need useCallback
  const getRankStyling = (index) => {
    switch (index) {
      case 0:
        return { 
          icon: '👑', 
          class: 'rank-first',
          gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
          glow: '#FFD700'
        };
      case 1:
        return { 
          icon: '🥈', 
          class: 'rank-second',
          gradient: 'linear-gradient(135deg, #C0C0C0, #A0A0A0)',
          glow: '#C0C0C0'
        };
      case 2:
        return { 
          icon: '🥉', 
          class: 'rank-third',
          gradient: 'linear-gradient(135deg, #CD7F32, #B87333)',
          glow: '#CD7F32'
        };
      default:
        return { 
          icon: `#${index + 1}`, 
          class: 'rank-other',
          gradient: 'linear-gradient(135deg, #6B73FF, #000DFF)',
          glow: '#6B73FF'
        };
    }
  };

  const getStatusBadge = (entry) => {
  // ✅ Only mark as millionaire if completed all
  if (entry.completed && entry.score >= 1000000) {
    return { text: 'PROVERNAIRE', class: 'status-completed', icon: '💎' };
  } else if (entry.failed) {
    return { text: 'ELIMINATED', class: 'status-failed', icon: '💥' };
  } else if (entry.walkedAway) {
    return { text: 'WALKED AWAY', class: 'status-walked', icon: '🚶' };
  } else if (entry.timeUp) {
    return { text: 'TIME UP', class: 'status-timeout', icon: '⏰' };
  } else {
    return { text: 'IN PROGRESS', class: 'status-progress', icon: '🎮' };
  }
};


  // Stable back handler
  const handleBackClick = useCallback(() => {
    if (onBackToGame) {
      onBackToGame();
    } else if (onBack) {
      onBack();
    }
  }, [onBackToGame, onBack]);

  // Memoize last updated text
  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - lastUpdated) / 1000);
    
    if (diffInSeconds < 60) {
      return `Updated ${diffInSeconds} seconds ago`;
    } else {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      return `Updated ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
  }, [lastUpdated]);

  // Loading state - ONLY show on very first load
  if (isLoading && !hasInitiallyLoaded) {
    return (
      <div className="leaderboard-screen">
        <div className="background-animation">
          <div className="floating-shapes">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`shape shape-${i % 4}`}></div>
            ))}
          </div>
        </div>
        <div className="loading-content">
          <div className="loading-spinner">🎮</div>
          <div className="loading-text">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  // Error state - only show if we have an error AND no data AND haven't loaded before
  if (error && sortedData.length === 0 && !hasInitiallyLoaded) {
    return (
      <div className="leaderboard-screen">
        <div className="background-animation">
          <div className="floating-shapes">
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`shape shape-${i % 3}`}></div>
            ))}
          </div>
        </div>
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Failed to load leaderboard</h3>
          <p>{error}</p>
          <button onClick={() => fetchLeaderboard(false)}>Retry</button>
          {handleBackClick && (
            <button onClick={handleBackClick} style={{ marginLeft: '10px' }}>
              Back to Game
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-screen">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-shapes">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`shape shape-${i % 4}`}></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="leaderboard-header">
        <button 
          className="back-button"
          onClick={handleBackClick}
          type="button"
        >
          <span className="back-icon">←</span>
          <span className="back-text">Back to Game</span>
        </button>
        
        <div className="header-title">
          <h1 className="leaderboard-title">🏆 LEADERBOARD</h1>
          <p className="leaderboard-subtitle">Who Wants to Be a Provernaire</p>
          {userProfile && (
            <p className="current-user">Playing as: @{userProfile.username}</p>
          )}
          
          <div className="refresh-info">
            {isRefreshing && (
              <span className="refresh-indicator">
                🔄 Updating...
              </span>
            )}
            {lastUpdated && !isRefreshing && (
              <span className="last-updated">
                {lastUpdatedText}
              </span>
            )}
          </div>
        </div>

        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{sortedData.length}</span>
            <span className="stat-label">Total Players</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {sortedData.filter(e => e.completed).length}
            </span>
            <span className="stat-label">PROVERNAIRE</span>
          </div>
        </div>
      </div>

      {/* User Performance Card */}
      {currentUserData.currentUserEntry && (
        <div className="user-performance-card">
          <div className="performance-header">
            <h3>Your Performance</h3>
            <div className="user-rank">
              Rank #{currentUserData.currentUserRank}
            </div>
          </div>
          <div className="performance-content">
            <img 
              src={getValidImageUrl(currentUserData.currentUserEntry.pfp, currentUserData.currentUserEntry.username)} 
              alt="Your profile" 
              className="performance-pfp"
              onError={(e) => {
                e.target.src = getValidImageUrl(null, currentUserData.currentUserEntry.username);
              }}
            />
            <div className="performance-details">
              <div className="performance-score">
                {(currentUserData.currentUserEntry.score || 0).toLocaleString()} $PROVE
              </div>
              <div className="performance-info">
  <span 
    className="performance-team"
    style={{ color: currentUserData.currentUserEntry.team?.color }}
  >
    {currentUserData.currentUserEntry.team?.name || 'No Team'}
  </span>
</div>

            </div>
            <div className="performance-status">
              {(() => {
                const status = getStatusBadge(currentUserData.currentUserEntry);
                return (
                  <span className={`status-badge ${status.class}`}>
                    {status.icon} {status.text}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="leaderboard-filters">
        <button 
          className={`filter-button ${filterBy === 'all' ? 'active' : ''}`}
          onClick={() => setFilterBy('all')}
          type="button"
        >
          🌍 All Players ({sortedData.length})
        </button>
        <button 
          className={`filter-button ${filterBy === 'team' ? 'active' : ''}`}
          onClick={() => setFilterBy('team')}
          type="button"
          disabled={!selectedTeam}
        >
          👥 My Team ({sortedData.filter(p => p.team && selectedTeam && p.team.name === selectedTeam.name).length})
        </button>
        <button 
  className={`filter-button ${filterBy === 'completed' ? 'active' : ''}`}
  onClick={() => setFilterBy('completed')}
  type="button"
>
  💎 PROVERNAIRES({sortedData.filter(p => p.completed && p.score >= 1000000).length})
</button>

      </div>

      {/* Main Content */}
      <div className="leaderboard-content">
        {/* Top 3 Podium */}
        {filteredAndSortedData.length >= 3 && (
          <div className="podium-section">
            <h3 className="section-title">🥇 Hall of Fame</h3>
            <div className="podium">
              {/* Second Place */}
              {filteredAndSortedData[1] && (
                <div className="podium-position second">
                  <div className="podium-player">
                    <img 
                      src={getValidImageUrl(filteredAndSortedData[1].pfp, filteredAndSortedData[1].username)} 
                      alt={filteredAndSortedData[1].username}
                      className="podium-pfp"
                      onError={(e) => {
                        e.target.src = getValidImageUrl(null, filteredAndSortedData[1].username);
                      }}
                    />
                    <div className="podium-info">
                      <div className="podium-username">@{filteredAndSortedData[1].username}</div>
                      <div className="podium-score">
                        {(filteredAndSortedData[1].score || 0).toLocaleString()} $PROVE
                      </div>
                      <div 
                        className="podium-team"
                        style={{ backgroundColor: filteredAndSortedData[1].team?.color }}
                      >
                        {filteredAndSortedData[1].team?.name || 'No Team'}
                      </div>
                    </div>
                  </div>
                  <div className="podium-rank">🥈</div>
                  <div className="podium-height second-height"></div>
                </div>
              )}

              {/* First Place */}
              <div className="podium-position first">
                <div className="crown-animation">👑</div>
                <div className="podium-player">
                  <img 
                    src={getValidImageUrl(filteredAndSortedData[0].pfp, filteredAndSortedData[0].username)} 
                    alt={filteredAndSortedData[0].username}
                    className="podium-pfp"
                    onError={(e) => {
                      e.target.src = getValidImageUrl(null, filteredAndSortedData[0].username);
                    }}
                  />
                  <div className="podium-info">
                    <div className="podium-username">@{filteredAndSortedData[0].username}</div>
                    <div className="podium-score">
                      {(filteredAndSortedData[0].score || 0).toLocaleString()} $PROVE
                    </div>
                    <div 
                      className="podium-team"
                      style={{ backgroundColor: filteredAndSortedData[0].team?.color }}
                    >
                      {filteredAndSortedData[0].team?.name || 'No Team'}
                    </div>
                  </div>
                </div>
                <div className="podium-rank">🥇</div>
                <div className="podium-height first-height"></div>
              </div>

              {/* Third Place */}
              {filteredAndSortedData[2] && (
                <div className="podium-position third">
                  <div className="podium-player">
                    <img 
                      src={getValidImageUrl(filteredAndSortedData[2].pfp, filteredAndSortedData[2].username)} 
                      alt={filteredAndSortedData[2].username}
                      className="podium-pfp"
                      onError={(e) => {
                        e.target.src = getValidImageUrl(null, filteredAndSortedData[2].username);
                      }}
                    />
                    <div className="podium-info">
                      <div className="podium-username">@{filteredAndSortedData[2].username}</div>
                      <div className="podium-score">
                        {(filteredAndSortedData[2].score || 0).toLocaleString()} $PROVE
                      </div>
                      <div 
                        className="podium-team"
                        style={{ backgroundColor: filteredAndSortedData[2].team?.color }}
                      >
                        {filteredAndSortedData[2].team?.name || 'No Team'}
                      </div>
                    </div>
                  </div>
                  <div className="podium-rank">🥉</div>
                  <div className="podium-height third-height"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Rankings List */}
        <div className="rankings-section">
          <h3 className="section-title">📊 Full Rankings</h3>
          <div className="rankings-list">
            {filteredAndSortedData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎮</div>
                <div className="empty-title">
                  {sortedData.length === 0 
                    ? "No players have joined yet!" 
                    : "No players in this category!"}
                </div>
                <div className="empty-subtitle">
                  {sortedData.length === 0 
                    ? "Be the first to play and claim the top spot" 
                    : "Switch to 'All Players' to see everyone."}
                </div>
                {error && (
                  <p className="error-hint">
                    Connection error: {error}
                  </p>
                )}
              </div>
            ) : (
              filteredAndSortedData.map((entry, index) => {
                const rankStyle = getRankStyling(index);
                const status = getStatusBadge(entry);
                const isCurrentUser = entry.username === userProfile?.username;
                
                return (
                  <div 
                    key={`${entry._id || entry.username}-${entry.score}-${index}`}
                    className={`ranking-item ${rankStyle.class} ${isCurrentUser ? 'current-user' : ''}`}
                    style={{
                      background: rankStyle.gradient,
                      boxShadow: `0 4px 20px ${rankStyle.glow}33`
                    }}
                  >
                    <div className="ranking-rank">
                      {rankStyle.icon}
                    </div>
                    
                    <img 
                      src={getValidImageUrl(entry.pfp, entry.username)} 
                      alt={entry.username}
                      className="ranking-pfp"
                      onError={(e) => {
                        e.target.src = getValidImageUrl(null, entry.username);
                      }}
                    />
                    
                    <div className="ranking-info">
                      <div className="ranking-username">
                        @{entry.username}
                        {isCurrentUser && <span className="you-badge">YOU</span>}
                      </div>
                      <div className="ranking-details">
  <span 
    className="ranking-team"
    style={{ color: entry.team?.color }}
  >
    {entry.team?.name || 'No Team'}
  </span>
</div>

                    </div>
                    
                    <div className="ranking-score">
                      <div className="score-amount">
                        {(entry.score || 0).toLocaleString()}
                      </div>
                      <div className="score-currency">$PROVE</div>
                    </div>
                    
                    <div className="ranking-status">
                      <span className={`status-badge ${status.class}`}>
                        {status.icon} {status.text}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Team Statistics */}
        {teamStats.length > 0 && (
          <div className="team-stats-section">
            <h3 className="section-title">Team Performance</h3>
            <div className="team-stats-grid">
              {teamStats.map((team, index) => (
                <div 
                  key={team.name}
                  className="team-stat-card"
                  style={{
                    borderColor: team.color,
                    boxShadow: `0 4px 20px ${team.color}33`
                  }}
                >
                  <div className="team-stat-header">
                    <div 
                      className="team-stat-color"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <h4 className="team-stat-name">{team.name}</h4>
                    <div className="team-stat-rank">#{index + 1}</div>
                  </div>
                  <div className="team-stat-metrics">
                    <div className="team-metric">
                      <span className="metric-value">{team.totalScore.toLocaleString()}</span>
                      <span className="metric-label">Total Score</span>
                    </div>
                    <div className="team-metric">
                      <span className="metric-value">{team.avgScore.toLocaleString()}</span>
                      <span className="metric-label">Avg Score</span>
                    </div>
                    <div className="team-metric">
                      <span className="metric-value">{team.playerCount}</span>
                      <span className="metric-label">Players</span>
                    </div>
                    <div className="team-metric">
                      <span className="metric-value">{team.topScore.toLocaleString()}</span>
                      <span className="metric-label">Best Score</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="stats-footer">
        <div className="stat-item">
          <span className="stat-number">{sortedData.length}</span>
          <span className="stat-label">Total Players</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{sortedData.filter(p => p.completed).length}</span>
          <span className="stat-label">Winners</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {sortedData.length > 0 ? Math.max(...sortedData.map(p => p.score || 0)).toLocaleString() : '0'}
          </span>
          <span className="stat-label">Highest Score</span>
        </div>
      </div>
    </div>
  );
};

>>>>>>> ebbaf7b42d1bfb69b875a560428d6b4509af66af
export default Leaderboard;