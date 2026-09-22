import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowRight, Lock, User, Eye, EyeOff } from 'lucide-react';
import useAuthStore from './store/useAuthStore';
import ShinyText from './components/ShinyText';
import Aurora from './components/Aurora';
import Particles from './components/Particles';
import ShapeGrid from './components/ShapeGrid';
import './Login.css';

function Login() {
  const [structuredId, setStructuredId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login, isLoading, error, isAuthenticated, theme, toggleTheme } = useAuthStore();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (structuredId && passcode) {
      await login(structuredId, passcode);
    }
  };

  return (
    <div className={`login-wrapper ${theme}`}>
      {/* Dynamic Backgrounds */}
      <div className="login-bg-layer">
        {isDarkMode ? (
          <Particles
            particleColors={["#ffffff", "#8b5cf6", "#3b82f6"]}
            particleCount={250}
            particleSpread={20}
            speed={0.1}
            particleBaseSize={80}
            moveParticlesOnHover={true}
            alphaParticles={true}
            disableRotation={false}
            pixelRatio={Math.min(window.devicePixelRatio || 1, 2)}
          />
        ) : (
          <ShapeGrid 
            speed={0.4}
            squareSize={40}
            direction='diagonal'
            borderColor="rgba(139, 92, 246, 0.15)"
            hoverFillColor="rgba(139, 92, 246, 0.1)"
            shape='square'
            hoverTrailAmount={2}
          />
        )}
      </div>

      <button
        className="glass-theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="login-glass-card">
        <div className="login-header">
          <ShinyText
            text="NexusOBE Gateway"
            speed={3}
            className="text-4xl font-extrabold tracking-tight login-brand"
            color={isDarkMode ? "#f8fafc" : "#1e293b"}
            shineColor={isDarkMode ? "#c4b5fd" : "#8b5cf6"}
          />
          <p className="login-subtitle">Sign in to continue your journey</p>
        </div>
        
        {error && (
          <div className="premium-error-toast">
            <div className="error-icon">!</div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className={`input-group ${focusedInput === 'id' ? 'focused' : ''}`}>
            <User className="input-icon" size={18} />
            <input 
              type="text" 
              autoComplete="off" 
              name="structuredId" 
              className="premium-input" 
              placeholder="Teacher ID" 
              value={structuredId}
              onChange={(e) => setStructuredId(e.target.value)}
              onFocus={() => setFocusedInput('id')}
              onBlur={() => setFocusedInput(null)}
              required
            />
          </div>
          
          <div className={`input-group ${focusedInput === 'pass' ? 'focused' : ''}`}>
            <Lock className="input-icon" size={18} />
            <input 
              type={showPassword ? 'text' : 'password'}
              autoComplete="off" 
              name="passcode" 
              className="premium-input" 
              placeholder="Passcode" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onFocus={() => setFocusedInput('pass')}
              onBlur={() => setFocusedInput(null)}
              required
            />
            <button 
              type="button" 
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <button 
            type="submit" 
            className="premium-btn group"
            disabled={isLoading}
          >
            <span className="btn-text">{isLoading ? 'Authenticating...' : 'Authenticate'}</span>
            {!isLoading && (
              <ArrowRight className="btn-icon group-hover:translate-x-1 transition-transform" size={18} />
            )}
            <div className="btn-glow"></div>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
