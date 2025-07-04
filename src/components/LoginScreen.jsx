<<<<<<< HEAD
import React, { useState } from 'react';
import './LoginScreen.css'; // Assuming you have a CSS file for styling

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleLogin = () => {
    if (username.trim() && profilePicture) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Image = reader.result; // This is a data:image/... string
        const cleanUsername = username.trim().replace(/^@/, '');

        const userData = {
          username: cleanUsername,
          pfp: base64Image,
          previewUrl: previewUrl
        };

        onLogin(userData);
      };

      reader.readAsDataURL(profilePicture); // Convert File to base64 string
    } else {
      alert('Please enter a username and upload a profile picture');
    }
  };

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
          {/* Header */}
          <h1 className="login-title">Who Wants To Be A Provernaire</h1>
          <p className="login-subtitle">
            Test your knowledge and win <span style={{ color: '#B0FF6F', fontWeight: 'bold' }}>$PROVE</span> tokens!
          </p>

          {/* Form */}
          <div style={{ marginBottom: '32px' }}>
            {/* Username Input */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="username" style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your X username"
                style={{
                  width: '70%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '16px',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </div>

            {/* Profile Picture Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="pfp" style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Profile Picture
              </label>
              <input
                id="pfp"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{
                  width: '70%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
              />

              {/* Preview */}
              {previewUrl && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #B753FF'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Login Button */}
          <button onClick={handleLogin} className="login-button">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
=======
import React, { useState } from 'react';
import './LoginScreen.css'; // Assuming you have a CSS file for styling

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleLogin = () => {
    if (username.trim() && profilePicture) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Image = reader.result; // This is a data:image/... string
        const cleanUsername = username.trim().replace(/^@/, '');

        const userData = {
          username: cleanUsername,
          pfp: base64Image,
          previewUrl: previewUrl
        };

        onLogin(userData);
      };

      reader.readAsDataURL(profilePicture); // Convert File to base64 string
    } else {
      alert('Please enter a username and upload a profile picture');
    }
  };

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
          {/* Header */}
          <h1 className="login-title">Who Wants To Be A Provernaire</h1>
          <p className="login-subtitle">
            Test your knowledge and win <span style={{ color: '#B0FF6F', fontWeight: 'bold' }}>$PROVE</span> tokens!
          </p>

          {/* Form */}
          <div style={{ marginBottom: '32px' }}>
            {/* Username Input */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="username" style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your X username"
                style={{
                  width: '70%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '16px',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </div>

            {/* Profile Picture Upload */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="pfp" style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Profile Picture
              </label>
              <input
                id="pfp"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{
                  width: '70%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
              />

              {/* Preview */}
              {previewUrl && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #B753FF'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Login Button */}
          <button onClick={handleLogin} className="login-button">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
>>>>>>> ebbaf7b42d1bfb69b875a560428d6b4509af66af
