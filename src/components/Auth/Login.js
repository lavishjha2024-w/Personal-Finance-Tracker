import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // -- Animation States --
    const [animationState, setAnimationState] = useState('walking');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const hasSeenAnimation = sessionStorage.getItem('hasSeenAuthAnimation');
        if (hasSeenAnimation) {
            setAnimationState('done');
            setShowForm(true);
            return;
        }

        const dropTimer = setTimeout(() => {
            setAnimationState('dropped');

            setTimeout(() => {
                setAnimationState('exiting');
                setShowForm(true);
                sessionStorage.setItem('hasSeenAuthAnimation', 'true');

                setTimeout(() => {
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
            const { data } = await axios.post(
                `${API_BASE_URL}/api/login`,
                { email, password }
            );

            login(data.token, data.user);
            navigate('/');

        } catch (err) {
            setError(
                err.response?.data?.details ||
                err.response?.data?.error ||
                err.message ||
                'Login failed'
            );
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
