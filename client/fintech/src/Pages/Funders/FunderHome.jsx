import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Dropdown, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FiFilter, FiDownload, FiTrendingUp, FiUsers, FiDollarSign, FiMoon, FiSun, FiPhone, FiMail, FiMessageSquare, FiSend, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import axios from 'axios';
import toast from 'react-hot-toast';
import './FundersHome.css';
const businessDomains = [
  "Gym",
  "Pharmacy",
  "Electronics Shop",
  "Restaurant",
  "Grocery Store",
  "Coffee Shop"
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
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [fundingAmount, setFundingAmount] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    funderName: '',
    message: '',
    subject: ''
  });
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState('');

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

  const handleFund = (startup) => {
    setSelectedStartup(startup);
    setShowFundingModal(true);
  };

  const handleFundingSubmit = () => {
    if (!fundingAmount || isNaN(fundingAmount) || parseFloat(fundingAmount) <= 0) {
      alert('Please enter a valid funding amount');
      return;
    }

    const updatedStartups = startups.map(startup => {
      if (startup.name === selectedStartup.name) {  
        const currentFunding = parseFloat(startup.funding || 0);
        return {
          ...startup,
          funding: (currentFunding + parseFloat(fundingAmount)).toString()
        };
      }
      return startup;
    });

    setStartups(updatedStartups);
    localStorage.setItem('startups', JSON.stringify(updatedStartups));
    setShowFundingModal(false);
    setFundingAmount('');
    setSelectedStartup(null);
  };

  const downloadStartupPDF = async (startup) => {
    try {
      // Get startups from localStorage to ensure we have the latest data
      const startups = JSON.parse(localStorage.getItem('startups')) || [];
      const startupData = startups.find(s => s.name === startup.name);
      
      if (startupData && startupData.uploadedFile) {
        try {
          // Fetch the file
          const response = await fetch(startupData.uploadedFile);
          const blob = await response.blob();
          
          // Create a download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = startupData.fileName || `${startup.name}_business_plan.pdf`;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Cleanup
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error downloading file:', error);
          alert('Error downloading the file. Please try again.');
        }
      } else {
        alert('No business plan file available for this startup. Please make sure a file was uploaded during registration.');
      }
    } catch (error) {
      console.error('Error accessing startup data:', error);
      alert('Could not access startup data. Please try again.');
    }
  };

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
      
      if (data.businessPlanPdf) {
        doc.text('Business Plan is available - Click "View Business Plan" button to download', 10, 60);
      } else {
        doc.text('No Business Plan PDF available', 10, 60);
      }
      
      doc.save(`${data.name}_profile.pdf`);
    }
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
    setEmailError('');
  };

  const handleSendEmail = async () => {
    if (!emailData.funderName.trim() || !emailData.message.trim() || !emailData.subject.trim()) {
      setEmailError('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      const response = await axios.post('http://localhost:8000/api/startup/send-email', {
        startupEmail: selectedStartup.email,
        funderName: emailData.funderName,
        subject: emailData.subject,
        message: emailData.message
      });

      // Show success message
      toast.success(`Message sent to ${selectedStartup.name}!`, {
        duration: 3000,
        position: 'top-center',
      });
      
      // Close modal and reset form
      setShowEmailModal(false);
      setEmailData({
        funderName: '',
        message: '',
        subject: ''
      });

      // Add to sent messages in localStorage
      const sentMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]');
      sentMessages.push({
        to: selectedStartup.name,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('sentMessages', JSON.stringify(sentMessages));

    } catch (error) {
      console.error('Error:', error);
      toast.error('Could not send message. Please try again.');
    } finally {
      setSending(false);
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
          {[{
            icon: <FiUsers size={24} />, label: "Total Startups", value: startups.length
          }, {
            icon: <FiTrendingUp size={24} />, label: "Domains", value: uniqueDomains.length
          }, {
            icon: <FiDollarSign size={24} />, label: "Total Funding",
            value: `$${groupedDomains.reduce((sum, domain) => sum + (domain.totalFunding || 0), 0).toLocaleString()}`
          }].map((stat, index) => (
            <Col md={4} key={index}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-100">
                <Card className={`stat-card h-100 ${isDarkMode ? "dark" : ""}`}>
                  <Card.Body>
                    <motion.div
                      className="d-flex align-items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="stat-icon">{stat.icon}</div>
                      <div className="ms-3">
                        <h6 className="mb-0">{stat.label}</h6>
                        <motion.h3
                          className="mb-0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {stat.value}
                        </motion.h3>
                      </div>
                    </motion.div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
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
                    <Dropdown.Item onClick={() => setSelectedDomainFilter(null)}>
                      All Domains
                    </Dropdown.Item>
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
          {(selectedDomainFilter ? uniqueDomains.filter(d => d === selectedDomainFilter) : uniqueDomains).map((domainName, index) => (
            <motion.div
              key={domainName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`mb-4 domain-card ${isDarkMode ? "dark" : ""}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>{domainName}</h4>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => generatePDF({
                        name: domainName,
                        startups: startups.filter(s => s.domain === domainName),
                        count: startups.filter(s => s.domain === domainName).length,
                        totalFunding: startups
                          .filter(s => s.domain === domainName)
                          .reduce((sum, s) => sum + parseFloat(s.funding || 0), 0)
                      })}
                    >
                      <FiDownload className="me-2" /> Export PDF
                    </Button>
                  </div>
                  <Row>
                    {startups
                      .filter(startup => startup.domain === domainName)
                      .map(startup => (
                        <Col key={startup.name} md={4} className="mb-3">
                          <Card className="h-100 startup-card">
                            <Card.Body>
                              <Card.Title>{startup.name}</Card.Title>
                              <Card.Text>
                                Current Funding: ${parseFloat(startup.funding || 0).toLocaleString()}
                              </Card.Text>
                              <div className="d-flex flex-column gap-2">
                                <div className="d-flex justify-content-between">
                                  <Button 
                                    variant="primary" 
                                    size="sm" 
                                    onClick={() => handleFund(startup)}
                                  >
                                    <FiDollarSign className="me-1" /> Fund
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => generatePDF(startup, 'startup')}
                                  >
                                    <FiDownload className="me-1" /> Details
                                  </Button>
                                </div>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="contact-btn d-flex align-items-center gap-2"
                                  onClick={() => {
                                    setSelectedStartup(startup);
                                    setShowEmailModal(true);
                                  }}
                                >
                                  <FiMail className="icon" />
                                  <span>Contact Startup</span>
                                </Button>
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => downloadStartupPDF(startup)}
                                  className="w-100"
                                >
                                  <FiDownload className="me-1" /> Explore Business Plan
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
  
        {/* Funding Modal */}
        <Modal show={showFundingModal} onHide={() => setShowFundingModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Fund {selectedStartup?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Enter Funding Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter amount"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowFundingModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleFundingSubmit}>
              Confirm Funding
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Email Modal */}
        <Modal 
          show={showEmailModal} 
          onHide={() => {
            setShowEmailModal(false);
            setEmailError('');
            setEmailData({
              funderName: '',
              message: '',
              subject: ''
            });
          }}
          className="email-modal"
        >
          <Modal.Header closeButton className="border-bottom">
            <Modal.Title className="h5">
              <FiMail className="me-2" />
              Contact {selectedStartup?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {emailError && (
              <Alert variant="danger" className="mb-3">
                {emailError}
              </Alert>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FiUser className="me-2" />
                  Your Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="funderName"
                  placeholder="Enter your name"
                  value={emailData.funderName}
                  onChange={handleEmailChange}
                  className="rounded-3"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FiMessageSquare className="me-2" />
                  Subject
                </Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  placeholder="Enter email subject"
                  value={emailData.subject}
                  onChange={handleEmailChange}
                  className="rounded-3"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FiMessageSquare className="me-2" />
                  Message
                </Form.Label>
                <Form.Control
                  as="textarea"
                  name="message"
                  rows={4}
                  placeholder="Enter your message to the startup"
                  value={emailData.message}
                  onChange={handleEmailChange}
                  className="rounded-3"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-top">
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowEmailModal(false);
                setEmailError('');
                setEmailData({
                  funderName: '',
                  message: '',
                  subject: ''
                });
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendEmail}
              disabled={sending}
              className="d-flex align-items-center gap-2"
            >
              {sending ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FiSend />
                  <span>Send Message</span>
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default FundersHome;