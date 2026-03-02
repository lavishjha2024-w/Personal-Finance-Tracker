import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // -- Animation States --
    const [animationState, setAnimationState] = useState('walking'); // walking, dropped, exiting, done
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const hasSeenAnimation = sessionStorage.getItem('hasSeenAuthAnimation');

        if (hasSeenAnimation) {
            // Already saw the animation this session, skip straight to the form
            setAnimationState('done');
            setShowForm(true);
            return;
        }

        // Run the animation sequence on mount
        const dropTimer = setTimeout(() => {
            setAnimationState('dropped');

            const exitTimer = setTimeout(() => {
                setAnimationState('exiting');
                setShowForm(true);
                sessionStorage.setItem('hasSeenAuthAnimation', 'true');

                const doneTimer = setTimeout(() => {
                    setAnimationState('done');
                }, 800);
            }, 800);
        }, 2500);

        return () => {
            clearTimeout(dropTimer);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data.token, data.user);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* 3D Landing Sequence */}
            {(animationState !== 'done' && animationState !== 'hidden') && (
                <div className={`scene ${animationState === 'done' ? 'done' : ''}`}>
                    <div
                        className={`character-wrapper ${animationState === 'exiting' ? 'scene-exit' : ''}`}
                        style={{ animationPlayState: animationState === 'dropped' || animationState === 'exiting' ? 'paused' : 'running' }}
                    >
                        <div
                            className="man"
                            style={{ animationPlayState: animationState === 'dropped' || animationState === 'exiting' ? 'paused' : 'running' }}
                        >👱‍♂️</div>
                        <div className={`bag ${animationState === 'dropped' || animationState === 'exiting' ? 'bag-drop' : ''}`}>💼</div>
                    </div>
                </div>
            )}

            <div className={`auth-card ${showForm ? 'show-form' : ''}`}>
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Login to your dashboard</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
