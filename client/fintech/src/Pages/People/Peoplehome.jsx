import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './Peoplehome.css';

const PeopleHome = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: 'all',
  });

  const [highlightedTopics, setHighlightedTopics] = useState([]);

  useEffect(() => {
    if (filters.industry !== 'all') {
      fetchHighlightedTopics(filters.industry);
    }
  }, [filters.industry]);

  const fetchHighlightedTopics = (industry) => {
    const topics = {
      agriculture: [
        {
          title: 'Sustainable Farming',
          description: 'Innovative farming techniques that reduce environmental impact while boosting yields, incorporating organic methods, and using eco-friendly technology.',
          image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Precision Agriculture',
          description: 'Using sensors and data analysis to optimize crop yield and reduce waste by applying the right resources at the right time.',
          image: 'https://www.bearingtips.com/wp-content/uploads/2021/06/SMB320-Agricultural-drone.jpg'
        },
        {
          title: 'Agri-Tech Innovations',
          description: 'Technological advancements such as drones, sensors, and AI are transforming traditional farming, making it more efficient and sustainable.',
          image: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/201909/agri_tech.jpeg'
        },
      ],
      hotelManagement: [
        {
          title: 'Smart Hotel Solutions',
          description: 'Integrating IoT and AI to create personalized, efficient guest experiences, from room controls to customer service.',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Sustainable Hospitality',
          description: 'Eco-friendly practices like energy-efficient systems, waste reduction, and green certifications help hotels reduce their environmental footprint.',
          image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80'
        },
        {
          title: 'Luxury Hospitality Trends',
          description: 'High-end trends include personalized services, wellness retreats, and experiential travel that cater to modern luxury preferences.',
          image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
        },
      ],
      poultry: [
        {
          title: 'Poultry Disease Management',
          description: 'Developing better systems for monitoring and controlling diseases in poultry farms to ensure healthy livestock and higher production rates.',
          image: 'https://afrimash.com/wp-content/uploads/2022/01/image-90-1024x576-1.jpg'
        },
        {
          title: 'Poultry Feed Innovation',
          description: 'Research into sustainable and nutrient-rich poultry feed options that increase production and minimize environmental impact.',
          image: 'https://d1lg8auwtggj9x.cloudfront.net/images/shutterstock_1814333030.width-820.jpg'
        },
        {
          title: 'Smart Poultry Farming',
          description: 'Automation and data analytics in poultry farming help monitor health, optimize growth, and improve efficiency in operations.',
          image: 'https://i.ytimg.com/vi/Mmp-jZ39fWQ/maxresdefault.jpg'
        },
      ],
      hydroponics: [
        {
          title: 'Hydroponic Farming Basics',
          description: 'Soil-free growing system that uses nutrient-rich water to grow plants, allowing for year-round farming in various environments.',
          image: 'https://th.bing.com/th/id/OIP.vLbAPLl4HLK0D9lR12aiyAHaEK?w=1920&h=1080&rs=1&pid=ImgDetMain'
        },
        {
          title: 'Vertical Hydroponics Systems',
          description: 'Innovative farming methods that maximize space and resource efficiency by stacking plants vertically in hydroponic systems.',
          image: 'https://i0.wp.com/www.futurefarms.in/wp-content/uploads/2018/09/image1.jpg?fit=1600%2C1064&ssl=1'
        },
        {
          title: 'Aquaponics Integration',
          description: 'Combining aquaculture with hydroponics to create a sustainable and symbiotic farming method, where fish waste fertilizes plants.',
          image: 'https://www.treehugger.com/thmb/Qjuj1WvktlSfBBlrFHcuGgBhCag=/2070x1449/filters:fill(auto,1)/GettyImages-142873284-7afec7706c2a4997841bde2792c7ff6b.jpg'
        },
      ],
    };

    setHighlightedTopics(topics[industry] || []);
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
          <Row className="mb-4">
            <Col>
              <motion.div variants={itemVariants} className="page-header">
                <h1>Industry Topics</h1>
                <p>Explore innovative ideas and trends in various industries</p>
              </motion.div>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col lg={4} className="mx-auto">
              <motion.div variants={itemVariants} className="filter-section">
                <Form.Select
                  value={filters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                >
                  <option value="all">Select an Industry</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="hotelManagement">Hotel Management</option>
                  <option value="poultry">Poultry</option>
                  <option value="hydroponics">Hydroponics</option>
                </Form.Select>
              </motion.div>
            </Col>
          </Row>

          {highlightedTopics.length > 0 && (
            <Row className="mb-4">
              <Col>
                <motion.div variants={itemVariants} className="highlighted-topics">
                  <h2>Highlighted Topics</h2>
                  <Row>
                    {highlightedTopics.map((topic, index) => (
                      <Col key={index} lg={4} md={6} className="mb-4">
                        <motion.div variants={itemVariants}>
                          <Card className="topic-card">
                            <Card.Img variant="top" src={topic.image} alt={topic.title} />
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