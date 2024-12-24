import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Dropdown, Badge } from 'react-bootstrap';
import { FiFilter, FiDownload, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import './FundersHome.css';

const FundersHome = () => {
  const [startups, setStartups] = useState(() => {
    const storedStartups = localStorage.getItem('startups');
    return storedStartups ? JSON.parse(storedStartups) : [];
  });

  const [selectedDomainFilter, setSelectedDomainFilter] = useState(null);

  const groupStartupsByDomain = () => {
    const domainGroups = startups.reduce((acc, startup) => {
      const domain = startup.domain || 'Uncategorized';
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

  const uniqueDomains = useMemo(() => {
    return [...new Set(startups.map((startup) => startup.domain || 'Uncategorized'))];
  }, [startups]);

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
    <div className="funders-home">
      <Container fluid className="py-4">
        {/* Stats Overview */}
        <Row className="mb-4">
          <Col md={4}>
            <motion.div whileHover={{ scale: 1.02 }} className="h-100">
              <Card className="stat-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="stat-icon">
                      <FiUsers size={24} />
                    </div>
                    <div className="ms-3">
                      <h6 className="mb-0">Total Startups</h6>
                      <h3 className="mb-0">{startups.length}</h3>
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
                        ${groupedDomains.reduce((sum, domain) => sum + domain.totalFunding, 0).toLocaleString()}
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
            <Card className="filter-card">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FiFilter className="me-2" />
                  <h5 className="mb-0">Filter by Domain</h5>
                </div>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-primary" id="domain-filter">
                    {selectedDomainFilter || 'All Domains'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSelectedDomainFilter(null)}>
                      All Domains
                    </Dropdown.Item>
                    {uniqueDomains.map((domain) => (
                      <Dropdown.Item
                        key={domain}
                        onClick={() => setSelectedDomainFilter(domain)}
                      >
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
        {uniqueDomains.map(domainName => (
          <div key={domainName} className="domain-section">
            <h2 className="domain-section-header">{domainName}</h2>
            <Row className="g-4">
              {groupedDomains
                .filter(domain => domain.name === domainName)
                .map((domain) => (
                  <Col key={domain.name} md={6} lg={4}>
                    <motion.div whileHover={{ scale: 1.02 }} className="h-100">
                      <Card className="domain-card h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h4>{domain.name}</h4>
                            <Badge bg="primary" pill>
                              {domain.count} Startups
                            </Badge>
                          </div>
                          <p className="text-muted">
                            Total Funding: ${domain.totalFunding.toLocaleString()}
                          </p>
                          <div className="startup-list">
                            {domain.startups.map((startup) => (
                              <div key={startup.name} className="startup-item mb-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>{startup.name}</span>
                                  <Badge bg="info" pill>
                                    ${parseFloat(startup.funding || 0).toLocaleString()}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 d-flex justify-content-end">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => generatePDF(domain)}
                              className="d-flex align-items-center"
                            >
                              <FiDownload className="me-2" />
                              Export PDF
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
            </Row>
          </div>
        ))}
      </Container>
    </div>
  );
};

export default FundersHome;