import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiTarget, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi';
import './About.css';

const About = () => {
  const features = [
    {
      icon: <FiTarget />,
      title: 'Our Mission',
      description: 'To bridge the gap between innovative startups and potential investors, creating a thriving ecosystem for growth and success.'
    },
    {
      icon: <FiUsers />,
      title: 'Community',
      description: 'Join a vibrant community of entrepreneurs, investors, and industry experts sharing knowledge and opportunities.'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Growth',
      description: 'Access tools, resources, and mentorship to scale your business or investment portfolio effectively.'
    },
    {
      icon: <FiShield />,
      title: 'Trust & Security',
      description: 'We prioritize the security of your data and investments with state-of-the-art protection measures.'
    }
  ];

  return (
    <div className="about-page">
      <div className="about-hero">
        <Container>
          <Row className="justify-content-center">
            <Col md={10} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1>About Innovate</h1>
                <p className="lead">
                  Empowering the Future of Financial Innovation
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="about-content">
        <Row className="justify-content-center mb-5">
          <Col md={10}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2>Our Vision</h2>
              <p>
                At Innovate, we envision a world where great ideas meet the right opportunities. 
                Our platform connects ambitious entrepreneurs with visionary investors, 
                while fostering a community of industry experts who share insights and drive innovation.
              </p>
            </motion.div>
          </Col>
        </Row>

        <Row className="features-grid">
          {features.map((feature, index) => (
            <Col md={6} key={index}>
              <motion.div
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            </Col>
          ))}
        </Row>

        <Row className="justify-content-center mt-5">
          <Col md={10}>
            <motion.div
              className="join-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h2>Join Our Journey</h2>
              <p>
                Whether you're an entrepreneur seeking funding, an investor looking for opportunities,
                or an industry expert wanting to share insights, there's a place for you at Innovate.
              </p>
              <div className="stats">
                <div className="stat-item">
                  <h3>500+</h3>
                  <p>Startups Funded</p>
                </div>
                <div className="stat-item">
                  <h3>₹10M+</h3>
                  <p>Total Investment</p>
                </div>
                <div className="stat-item">
                  <h3>1000+</h3>
                  <p>Active Members</p>
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;
