import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import './Peoplehome.css';

const PeopleHome = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: 'all', // Added industry filter
  });

  const [highlightedTopics, setHighlightedTopics] = useState([]);

  // Simulated data - Replace with actual API call
  useEffect(() => {
    if (filters.industry !== 'all') {
      fetchHighlightedTopics(filters.industry);
    }
  }, [filters.industry]);

  const fetchHighlightedTopics = (industry) => {
    const topics = {
      agriculture: [
        { title: 'Sustainable Farming', description: 'Innovative farming techniques that reduce environmental impact while boosting yields, incorporating organic methods, and using eco-friendly technology.' },
        { title: 'Precision Agriculture', description: 'Using sensors and data analysis to optimize crop yield and reduce waste by applying the right resources at the right time.' },
        { title: 'Agri-Tech Innovations', description: 'Technological advancements such as drones, sensors, and AI are transforming traditional farming, making it more efficient and sustainable.' },
        { title: 'Crop Disease Management', description: 'Utilizing technology for early detection and management of crop diseases, preventing loss and improving food security.' },
        { title: 'Vertical Farming', description: 'Urban farming technique that uses stacked layers to grow crops in controlled environments, maximizing space and reducing resource usage.' },
      ],
      hotelManagement: [
        { title: 'Smart Hotel Solutions', description: 'Integrating IoT and AI to create personalized, efficient guest experiences, from room controls to customer service.' },
        { title: 'Sustainable Hospitality', description: 'Eco-friendly practices like energy-efficient systems, waste reduction, and green certifications help hotels reduce their environmental footprint.' },
        { title: 'Luxury Hospitality Trends', description: 'High-end trends include personalized services, wellness retreats, and experiential travel that cater to modern luxury preferences.' },
      ],
      poultry: [
        { title: 'Poultry Disease Management', description: 'Developing better systems for monitoring and controlling diseases in poultry farms to ensure healthy livestock and higher production rates.' },
        { title: 'Poultry Feed Innovation', description: 'Research into sustainable and nutrient-rich poultry feed options that increase production and minimize environmental impact.' },
        { title: 'Smart Poultry Farming', description: 'Automation and data analytics in poultry farming help monitor health, optimize growth, and improve efficiency in operations.' },
      ],
      hydroponics: [
        { title: 'Hydroponic Farming Basics', description: 'Soil-free growing system that uses nutrient-rich water to grow plants, allowing for year-round farming in various environments.' },
        { title: 'Vertical Hydroponics Systems', description: 'Innovative farming methods that maximize space and resource efficiency by stacking plants vertically in hydroponic systems.' },
        { title: 'Aquaponics Integration', description: 'Combining aquaculture with hydroponics to create a sustainable and symbiotic farming method, where fish waste fertilizes plants.' },
      ],
    };

    setHighlightedTopics(topics[industry] || []);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  };

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="people-page">
      <Container>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="people-content"
        >
          {/* Header Section */}
          <Row className="mb-4">
            <Col>
              <motion.div variants={itemVariants} className="page-header">
                <h1>Industry Topics</h1>
                <p>Explore innovative ideas and trends in various industries</p>
              </motion.div>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col>
              <motion.div variants={itemVariants} className="page-header">
                <h2>Explore Top related ideas</h2>
              </motion.div>
            </Col>
          </Row>


          {/* Industry Dropdown */}
          <Row className="mb-4">
            <Col lg={4}>
              <motion.div variants={itemVariants} className="filter-section">
                <Form.Select
                  value={filters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                >
                  <option value="all">All Industries</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="hotelManagement">Hotel Management</option>
                  <option value="poultry">Poultry</option>
                  <option value="hydroponics">Hydroponics</option>
                </Form.Select>
              </motion.div>
            </Col>
          </Row>

          {/* Display Highlighted Topics */}
          {highlightedTopics.length > 0 && (
            <Row className="mb-4">
              <Col>
                <motion.div variants={itemVariants} className="highlighted-topics">
                  <h2 style={{color:"white"}} >Highlighted Topics</h2>
                  <Row>
                    {highlightedTopics
                      .filter((topic) => topic.title.toLowerCase().includes(searchTerm))
                      .map((topic, index) => (
                        <Col key={index} lg={4} md={6} className="mb-4">
                          <motion.div variants={itemVariants}>
                            <Card className="topic-card">
                              <Card.Body>
                                <Card.Title>{topic.title}</Card.Title>
                                <Card.Text>{topic.description}</Card.Text>
                              </Card.Body>
                            </Card>
                          </motion.div>
                        </Col>
                      ))}
                  </Row>
                </motion.div>
              </Col>
            </Row>
          )}
        </motion.div>
      </Container>
    </div>
  );
};

export default PeopleHome;
