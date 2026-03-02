import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './Help.css';

const Help = () => {
    const { startTour } = useOnboarding();
    const navigate = useNavigate();

    const handleStartTour = () => {
        navigate('/');
        // Small delay to allow navigation and component mount before starting tour
        setTimeout(() => {
            startTour();
        }, 100);
    };
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

    const faqs = [
        {
            question: "Is my financial data secure?",
            answer: "Yes, all data is currently stored locally on your device or linked uniquely to your account, ensuring maximum privacy and security."
        },
        {
            question: "How do I add a new expense category?",
            answer: "When logging a new expense, you can type a custom category name. The tracker will remember it for future transactions."
        },
        {
            question: "Can I export my financial data?",
            answer: "Currently, data is managed within the app for a streamlined experience. Data export features (like CSV or PDF) are planned for future updates."
        },
        {
            question: "How does the Gamification system work?",
            answer: "You earn badges and points by consistently tracking your finances, hitting savings milestones, and maintaining streaks. Check your dashboard to view your progress!"
        },
        {
            question: "What happens if I forget my password?",
            answer: "Since data is handled securely and locally, there is no remote password recovery. Please ensure you remember your login credentials."
        },
        {
            question: "Can I track multiple bank accounts?",
            answer: "Yes! You can add multiple assets in the Portfolio section and label them individually as separate accounts (e.g., 'Checking Account 1', 'Savings Account')."
        },
        {
            question: "How does the Smart Insights feature work?",
            answer: "Smart Insights acts as your automated financial advisor. It analyzes your spending patterns against your income to highlight potential issues, such as unusually high spending in a category compared to previous months."
        },
        {
            question: "Are there different currencies supported?",
            answer: "Currently, the app defaults to standard currency notation, but it supports tracking numbers consistently regardless of your default global currency."
        },
        {
            question: "What is the Asset Flowchart?",
            answer: "The flowchart is a powerful tool under 'Analytics' that visually builds a diagram showing exactly how money flows from your Income sources, through your Accounts (Assets), and into your Expenses. It helps you quickly spot your biggest incoming and outgoing sinks."
        }
    ];

    return (
        <div className="help-container">
            <div className="help-header">
                <h1>How to Use Your Tracker</h1>
                <p>Welcome to the Personal Finance Tracker! Here is a guide to all the features available in the sidebar to help you master your money.</p>
                <button
                    onClick={handleStartTour}
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

            <div className="faq-section">
                <h2>❓ Frequently Asked Questions</h2>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div className="faq-item" key={index}>
                            <h4>{faq.question}</h4>
                            <p>{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Help;
