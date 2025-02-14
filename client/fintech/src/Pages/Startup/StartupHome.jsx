import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiBarChart2, FiMessageSquare } from 'react-icons/fi';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import './StartupHome.css';
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const StartupHome = () => {
  const navigate = useNavigate();
  const [startupInfo, setStartupInfo] = useState({
    location: '',
    domain: '',
  });
  const [prediction, setPrediction] = useState(null);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [survivalStatement, setSurvivalStatement] = useState('');

  useEffect(() => {
    const storedStartups = JSON.parse(localStorage.getItem('startups')) || [];
    if (storedStartups.length > 0) {
      const latestStartup = storedStartups[storedStartups.length - 1];
      setStartupInfo({
        location: latestStartup.location,
        domain: latestStartup.domain,
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStartupInfo({
      ...startupInfo,
      [name]: value,
    });
  };

  const handleCheck = async () => {
    setIsButtonClicked(true);
    setLoading(true);  
    setError('');
    setSurvivalStatement('');
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        'Area Name': startupInfo.location,
        'Business Name': startupInfo.domain,
      });

      let successRate = response.data["Predicted Success Rate"];
      successRate = parseInt(successRate.replace('%', ''), 10);
      setPrediction(successRate);

      const failureRate = 100 - successRate;
      setMarketData({
        successRate,
        failureRate,
        competitorGrowth: Math.random() * 10 + 5,
        marketSize: Math.random() * 500 + 200,
      });

      if (successRate >= 80) {
        setSurvivalStatement('Your startup has a high chance of success! With a predicted success rate above 80%, your business is poised for strong growth and market dominance.');
      } else if (successRate >= 50) {
        setSurvivalStatement('Your startup has a moderate chance of success. With a success rate between 50% and 80%, you might face competition, but there is potential for growth with the right strategies.');
      } else {
        setSurvivalStatement('Your startup may face significant challenges in the market. A success rate below 50% suggests that the business will need strong adjustments and innovation to survive in the market.');
      }

    } catch (error) {
      console.error('Error fetching prediction:', error);
      setError('Error fetching prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToChatbot = () => {
    navigate('/chatbot');
  };

  const features = [
    {
      title: 'View Predictions',
      icon: <FiBarChart2 size={24} />,
      description: 'Check your startup\'s success predictions and analytics',
      action: handleCheck,
      color: '#4F46E5',
    },
    {
      title: 'Get More Information',
      icon: <FiMessageSquare size={24} />,
      description: 'Chat with our AI assistant to get detailed information and guidance',
      action: navigateToChatbot,
      color: '#10B981',
    }
  ];

  const pieChartData = {
    labels: ['Success Rate', 'Failure Rate'],
    datasets: [
      {
        data: [prediction, 100 - prediction],
        backgroundColor: ['#4F46E5', '#FF3D3D'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="auth-container">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-center mb-4">Welcome to Your Startup Dashboard</h1>

          {/* Startup Profile Form */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h3 className="mb-3">Startup Profile</h3>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={startupInfo.location}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Domain</Form.Label>
                      <Form.Control
                        type="text"
                        name="domain"
                        value={startupInfo.domain}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <Row className="g-4">
            {features.map((feature, index) => (
              <Col key={index} md={6}>
                <Card
                  className="h-100 shadow-sm feature-card"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '15px',
                  }}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="rounded-circle p-2 me-3"
                        style={{ background: `${feature.color}20` }}
                      >
                        {React.cloneElement(feature.icon, { color: feature.color })}
                      </div>
                      <h3 className="mb-0 h5">{feature.title}</h3>
                    </div>
                    <Card.Text>{feature.description}</Card.Text>
                    <Button
                      variant="primary"
                      className="mt-auto feature-button"
                      onClick={feature.action}
                      style={{
                        background: feature.color,
                        border: 'none',
                      }}
                    >
                      {feature.title === 'View Predictions' ? 'View Details' : 'Chat Now'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center mt-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mt-4" role="alert">
              {error}
            </div>
          )}

          {/* Prediction Results */}
          {prediction !== null && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4"
            >
              <Card className="shadow-sm">
                <Card.Body>
                  <h3 className="mb-4">Startup Analysis Results</h3>
                  <Row>
                    <Col md={6}>
                      <div className="text-center mb-4">
                        <h4>Success Prediction</h4>
                        <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                          <Pie data={pieChartData} />
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="p-3 rounded bg-light">
                        <h4>Analysis Summary</h4>
                        <p>{survivalStatement}</p>
                        {marketData && (
                          <>
                            <h5 className="mt-3">Market Insights:</h5>
                            <ul>
                              <li>Market Size: ${marketData.marketSize.toFixed(2)} Billion</li>
                              <li>Competitor Growth: {marketData.competitorGrowth.toFixed(1)}% YoY</li>
                            </ul>
                          </>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </div>
  );
};

export default StartupHome;
