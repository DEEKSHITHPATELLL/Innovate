import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiDollarSign, FiUsers, FiTarget } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const userTypes = [
    {
      title: 'For Funders',
      icon: <FiDollarSign size={32} />,
      description: 'Discover promising startups and make informed investment decisions.',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      link: '/login'
    },
    {
      title: 'For Startups',
      icon: <FiTarget size={32} />,
      description: 'Launch and scale your startup with access to funding and resources.',
      color: '#047857',
      gradient: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
      link: '/startuplogin'
    },
    {
      title: 'For Insighters',
      icon: <FiUsers size={32} />,
      description: 'Join our community to share insights and explore innovative ideas.',
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      link: '/peoplelogin'
    }
  ];

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={8} className="mx-auto text-center">
              <motion.h1 
                variants={itemVariants}
                initial="hidden"
                animate="visible" 
                className="hero-title"
              >
                Welcome to FinTech Hub
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="hero-subtitle"
              >
                Connecting innovative startups with visionary investors. Build, fund, and grow your dreams with our comprehensive ecosystem.
              </motion.p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* User Types Section */}
      <section className="user-types-section py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center mb-5">
              <motion.h2 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="section-title"
              >
                Choose Your Path
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="section-subtitle"
              >
                Select the role that best fits your journey
              </motion.p>
            </Col>
          </Row>
          <Row className="g-4">
            {userTypes.map((type, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <Link to={type.link} className="text-decoration-none">
                    <Card className="h-100 border-0 shadow-lg">
                      <div style={{ height: '8px', background: type.gradient }} />
                      <Card.Body className="p-4">
                        <div 
                          className="icon-wrapper mb-4 d-inline-flex align-items-center justify-content-center rounded-circle"
                          style={{
                            width: '80px',
                            height: '80px',
                            background: `${type.color}15`,
                            color: type.color
                          }}
                        >
                          {type.icon}
                        </div>
                        <h3 className="card-title">{type.title}</h3>
                        <p className="card-description">{type.description}</p>
                        <div className="card-action">Get Started →</div>
                      </Card.Body>
                    </Card>
                  </Link>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center mb-5">
              <motion.h2 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="section-title"
              >
                Why Choose Us
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="section-subtitle"
              >
                Experience the power of our comprehensive platform
              </motion.p>
            </Col>
          </Row>
          <Row className="g-4">
            {[
              {
                icon: <FiDollarSign size={32} />,
                title: 'Smart Investment',
                description: 'Make data-driven investment decisions with our advanced analytics',
                color: '#10B981'
              },
              {
                icon: <FiTarget size={32} />,
                title: 'Growth Support',
                description: 'Access resources and mentorship to scale your startup effectively',
                color: '#047857'
              },
              {
                icon: <FiUsers size={32} />,
                title: 'Community',
                description: 'Connect with a network of entrepreneurs, investors, and experts',
                color: '#059669'
              }
            ].map((feature, index) => (
              <Col key={index} md={4}>
                <motion.div 
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className="text-center p-4"
                >
                  <div 
                    className="feature-icon mb-4 mx-auto d-flex align-items-center justify-content-center"
                    style={{ color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="h4 mb-3">{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
