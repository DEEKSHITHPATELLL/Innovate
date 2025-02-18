import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Dropdown, Badge } from 'react-bootstrap';
import { FiFilter, FiDownload, FiTrendingUp, FiUsers, FiDollarSign, FiMoon, FiSun, FiPhone, FiMail, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import './FundersHome.css';
const businessDomains = [
  "Gym",
  "Pharmacy",
  "Electronics Shop",
  "Restaurant",
  "Grocery Store"
];
const FundersHome = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  const [startups, setStartups] = useState(() => {
    const storedStartups = localStorage.getItem('startups');
    return storedStartups ? JSON.parse(storedStartups) : [];
  });

  const [selectedDomainFilter, setSelectedDomainFilter] = useState(null);
  const [hoveredDomain, setHoveredDomain] = useState(null);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const groupStartupsByDomain = () => {
    const domainGroups = startups.reduce((acc, startup) => {
      const domain = businessDomains.includes(startup.domain) ? startup.domain : 'Other';
      if (!acc[domain]) {
        acc[domain] = {
          name: domain,
          startups: [],
          count: 0,
          totalFunding: 0,
        };
      }
      acc[domain].startups.push(startup);
      acc[domain].count++;
      acc[domain].totalFunding += parseFloat(startup.funding || 0);
      return acc;
    }, {});
    return Object.values(domainGroups);
  };

  const groupedDomains = useMemo(() => {
    const domainGroups = groupStartupsByDomain();
    return selectedDomainFilter
      ? domainGroups.filter((domain) => domain.name === selectedDomainFilter)
      : domainGroups;
  }, [startups, selectedDomainFilter]);

  const uniqueDomains = useMemo(() => businessDomains, []);

  const generatePDF = (data, type = 'domain') => {
    const doc = new jsPDF();
    if (type === 'domain') {
      doc.setFontSize(18);
      doc.text(`Startups in Domain: ${data.name}`, 10, 20);
      doc.setFontSize(14);
      doc.text(`Startups: ${data.count}`, 10, 30);
      doc.text(`Total Funding: $${data.totalFunding.toLocaleString()}`, 10, 40);
      let yOffset = 50;
      data.startups.forEach((startup) => {
        doc.text(`Startup: ${startup.name}`, 10, yOffset);
        doc.text(`Funding: $${parseFloat(startup.funding || 0).toLocaleString()}`, 10, yOffset + 10);
        yOffset += 20;
      });
      doc.save(`${data.name}_startups.pdf`);
    } else if (type === 'startup') {
      doc.setFontSize(18);
      doc.text(`Startup: ${data.name}`, 10, 20);
      doc.setFontSize(14);
      doc.text(`Funding: $${parseFloat(data.funding || 0).toLocaleString()}`, 10, 30);
      doc.text(`Domain: ${data.domain || 'Uncategorized'}`, 10, 40);
      doc.save(`${data.name}_profile.pdf`);
    }
  };

  return (
    <div className={`funders-home ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <Container fluid className="py-4">
        {/* Theme Toggle */}
        <motion.div
          className="theme-toggle"
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
        </motion.div>

        {/* Stats Overview with Enhanced Animations */}
        <Row className="mb-4">
          <Col md={4}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-100">
              <Card className={`stat-card h-100 ${isDarkMode ? "dark" : ""}`}>
                <Card.Body>
                  <motion.div
                    className="d-flex align-items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="stat-icon">
                      <FiUsers size={24} />
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-0">Total Startups</h6>
                      <motion.h3
                        className="mb-0"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {startups.length}
                      </motion.h3>
                    </div>
                  </motion.div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          <Col md={4}>
            <motion.div whileHover={{ scale: 1.02 }} className="h-100">
              <Card className="stat-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="stat-icon">
                      <FiTrendingUp size={24} />
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-0">Domains</h6>
                      <h3 className="mb-0">{uniqueDomains.length}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          <Col md={4}>
            <motion.div whileHover={{ scale: 1.02 }} className="h-100">
              <Card className="stat-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="stat-icon">
                      <FiDollarSign size={24} />
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-0">Total Funding</h6>
                      <h3 className="mb-0">
                        ${groupedDomains.reduce((sum, domain) => sum + (domain.totalFunding || 0), 0).toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Filter Section */}
        <Row className="mb-4">
          <Col>
            <Card className={`filter-card ${isDarkMode ? "dark" : ""}`}>
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FiFilter className="me-2" />
                  <h5 className="mb-0">Filter by Domain</h5>
                </div>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-primary" id="domain-filter">
                    {selectedDomainFilter || "All Domains"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSelectedDomainFilter(null)}>All Domains</Dropdown.Item>
                    {businessDomains.map((domain) => (
                      <Dropdown.Item key={domain} onClick={() => setSelectedDomainFilter(domain)}>
                        {domain}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Domain Sections */}
        <AnimatePresence>
          {uniqueDomains.map((domainName, index) => (
            <motion.div
              key={domainName}
              className="domain-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="domain-header">
                <h2 className="domain-section-header">{domainName}</h2>
                <Badge bg={isDarkMode ? "info" : "primary"} pill className="domain-count">
                  {groupedDomains.find(d => d.name === domainName)?.count || 0} Startups
                </Badge>
              </div>
              
              <Row className="g-4">
                {groupedDomains
                  .filter((domain) => domain.name === domainName)
                  .map((domain) => (
                    domain.startups.map((startup, startupIndex) => (
                      <Col key={`${startup.name}-${startupIndex}`} md={6} lg={4}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="h-100"
                        >
                          <Card className={`startup-card h-100 ${isDarkMode ? "dark" : ""}`}>
                            <Card.Body>
                              <div className="startup-header">
                                <h4>{startup.name}</h4>
                                <Badge bg={isDarkMode ? "info" : "primary"} pill>
                                  {domainName}
                                </Badge>
                              </div>
                              
                              <div className="startup-details">
                                <div className="detail-item">
                                  <FiUsers className="detail-icon" />
                                  <span>Founder: {startup.founderName || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <FiDollarSign className="detail-icon" />
                                  <span>Funding: ${parseFloat(startup.funding || 0).toLocaleString()}</span>
                                </div>
                                {startup.email && (
                                  <div className="detail-item clickable">
                                    <FiMail className="detail-icon" />
                                    <a href={`mailto:${startup.email}`} className="contact-link">
                                      <span>Email: {startup.email}</span>
                                    </a>
                                  </div>
                                )}
                                {startup.phone && (
                                  <div className="detail-item clickable">
                                    <FiPhone className="detail-icon" />
                                    <div className="contact-options">
                                      <a href={`tel:${startup.phone}`} className="contact-link phone">
                                        <span>{startup.phone}</span>
                                        <FiPhone className="action-icon" />
                                      </a>
                                      <a href={`sms:${startup.phone}`} className="contact-link sms">
                                        <FiMessageSquare className="action-icon" />
                                      </a>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="communication-actions">
                                {startup.phone && (
                                  <>
                                    <a
                                      href={`tel:${startup.phone}`}
                                      className="comm-button call"
                                      title="Call"
                                    >
                                      <FiPhone />
                                    </a>
                                    <a
                                      href={`sms:${startup.phone}`}
                                      className="comm-button message"
                                      title="Message"
                                    >
                                      <FiMessageSquare />
                                    </a>
                                  </>
                                )}
                                {startup.email && (
                                  <a
                                    href={`mailto:${startup.email}`}
                                    className="comm-button email"
                                    title="Email"
                                  >
                                    <FiMail />
                                  </a>
                                )}
                              </div>
                              
                              <div className="startup-actions mt-3">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => generatePDF(startup, 'startup')}
                                  className="d-flex align-items-center"
                                >
                                  <FiDownload className="me-2" />
                                  Export Details
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </motion.div>
                      </Col>
                    ))
                  ))}
              </Row>
            </motion.div>
          ))}
        </AnimatePresence>
      </Container>
    </div>
  );
};
export default FundersHome;
