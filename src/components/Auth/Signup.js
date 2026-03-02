import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Auth.css';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
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
            if (!email || !password || !username) {
                throw new Error('Please fill in all fields');
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            setSuccessMessage('Account successfully created! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);

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
                <h2>Create an Account</h2>
                <p className="auth-subtitle">Get started with Personal Finance Tracker</p>

                {error && <div className="auth-error">{error}</div>}
                {successMessage && <div className="auth-success" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '6px', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>{successMessage}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose a username"
                            required
                        />
                    </div>
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
                            placeholder="Create a password"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
