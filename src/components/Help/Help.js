import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './Help.css';

const Help = () => {
    const { startTour } = useOnboarding();
    const features = [
        {
            title: "Dashboard Overview",
            icon: "📊",
            description: "The main landing page of the application. It provides a quick, high-level snapshot of your financial health, combining data from all other sections into easy-to-read summary cards (like Net Worth, Total Assets, Monthly Income, etc.) and quick access to recent transactions."
        },
        {
            title: "Portfolio",
            icon: "💼",
            description: "This section tracks your overall financial holdings. You can add, edit, and view different asset classes you own (like Cash, Stocks, Real Estate, etc.). It displays the current value of your combined assets to give you a clear picture of what you currently have."
        },
        {
            title: "Expenses",
            icon: "💰",
            description: "A detailed tracker for your day-to-day spending. You can log individual expenses here, categorize them (e.g., Food, Rent, Entertainment), and set dates. It helps you see exactly where your money is going."
        },
        {
            title: "Asset Flowchart",
            icon: "📈",
            description: "A visual representation of how your money moves. This flowchart visually connects your income sources to your various assets and expenses, making it easier to understand your overall financial ecosystem at a glance."
        },
        {
            title: "Smart Insights",
            icon: "🤖",
            description: "An AI-driven analysis of your financial data. This feature looks at your spending habits, income, and goals, and provides actionable recommendations and alerts (like warning you if you are spending too much on dining out this month)."
        },
        {
            title: "Goals",
            icon: "🎯",
            description: "Set and track specific financial milestones. Whether you're saving for a vacation, a car, or an emergency fund, you can create a goal here, set a target amount, and log your progress over time visually."
        },
        {
            title: "Analytics",
            icon: "📉",
            description: "Deep dive into your financial history. This section provides detailed charts and graphs comparing your income versus expenses over time, categorizing your spending, and highlighting long-term trends."
        },
        {
            title: "Investments",
            icon: "💎",
            description: "Specifically focuses on your investment portfolio (stocks, bonds, crypto). It tracks the performance, growth, and current market value of your investments separate from your liquid cash or static assets."
        },
        {
            title: "Gamification",
            icon: "🏆",
            description: "Makes managing finances fun! Earn badges, points, and achieve new levels by consistently logging expenses, reaching savings goals, and maintaining healthy financial habits."
        }
    ];

    return (
        <div className="help-container">
            <div className="help-header">
                <h1>How to Use Your Tracker</h1>
                <p>Welcome to the Personal Finance Tracker! Here is a guide to all the features available in the sidebar to help you master your money.</p>
                <button
                    onClick={startTour}
                    className="start-tour-button"
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#4ECDC4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        margin: '1.5rem auto 0'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>🚀</span> Start Interactive Tour
                </button>
            </div>

            <div className="help-grid">
                {features.map((feature, index) => (
                    <div className="help-card" key={index}>
                        <div className="help-card-header">
                            <span className="help-icon">{feature.icon}</span>
                            <h3>{feature.title}</h3>
                        </div>
                        <p className="help-description">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Help;
