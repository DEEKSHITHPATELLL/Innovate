import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiDollarSign, FiUsers, FiTarget, FiTrendingUp, FiShield, FiGlobe } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const [showPathModal, setShowPathModal] = useState(false);

  const userTypes = [
    {
      title: 'For Funders',
      icon: <FiDollarSign size={40} />,
      description: 'Discover promising startups and make informed investment decisions.',
      color: '#0061ff',
      gradient: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)',
      link: '/login'
    },
    {
      title: 'For Startups',
      icon: <FiTarget size={40} />,
      description: 'Launch and scale your startup with access to funding and resources.',
      color: '#0061ff',
      gradient: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)',
      link: '/startupregister'
    },
    {
      title: 'For Insighters',
      icon: <FiUsers size={40} />,
      description: 'Join our community to share insights and explore innovative ideas.',
      color: '#0061ff',
      gradient: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)',
      link: '/peoplelogin'
    }
  ];

  const features = [
    {
      icon: <FiTrendingUp size={32} />,
      title: 'Data-Driven Insights',
      description: 'Make informed decisions with our advanced analytics and market trends.',
      color: '#0061ff'
    },
    {
      icon: <FiShield size={32} />,
      title: 'Secure Platform',
      description: 'Your data and investments are protected with enterprise-grade security.',
      color: '#0061ff'
    },
    {
      icon: <FiGlobe size={32} />,
      title: 'Global Network',
      description: 'Connect with entrepreneurs and investors from around the world.',
      color: '#0061ff'
    }
  ];

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={7} className="hero-content">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="hero-title">
                  Welcome to <span className="gradient-text">Innovate</span>
                </h1>
                <p className="hero-subtitle">
                  Empowering the next generation of entrepreneurs. Build, fund, and grow your dreams with our comprehensive ecosystem.
                </p>
                <div className="hero-buttons">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button onClick={() => setShowPathModal(true)} className="primary-button">
                      Get Started
                    </button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/about" className="secondary-button">
                      Learn More
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </Col>
            <Col lg={5} className="d-none d-lg-block">
              <motion.div
                className="hero-image-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="hero-image">
                  <div className="namaste-image"></div>
                  <div className="image-overlay"></div>
                  <div className="hero-text">Empowering Innovators 🚀</div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="section-title">Why Choose Innovate</h2>
                <p className="section-subtitle">
                  Experience the future of startup ecosystem with our comprehensive platform
                </p>
              </motion.div>
            </Col>
          </Row>
          <Row>
            {features.map((feature, index) => (
              <Col key={index} md={4}>
                <motion.div
                  className="feature-box"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="feature-icon" style={{ color: feature.color }}>
                    {feature.icon}
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Path Selection Modal */}
      <Modal
        show={showPathModal}
        onHide={() => setShowPathModal(false)}
        centered
        size="lg"
        className="path-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Choose Your Path</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {userTypes.map((type, index) => (
              <Col key={index} md={4}>
                <Link to={type.link} className="path-card-link">
                  <motion.div
                    className="path-card"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="path-icon" style={{ color: type.color }}>
                      {type.icon}
                    </div>
                    <h3>{type.title}</h3>
                    <p>{type.description}</p>
                  </motion.div>
                </Link>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Home;
