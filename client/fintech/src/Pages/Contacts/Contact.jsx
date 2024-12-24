import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import emailjs from 'emailjs-com';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await emailjs.send(
        'service_f0ezpfp',
        'template_qwbt7el',
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          message: formData.message,
        },
        'ofqExGLMCI4QjxMiU'
      );

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="contact-card border-0 shadow-lg">
                <Card.Body className="p-5">
                  <Row>
                    <Col lg={5}>
                      <div className="contact-info mb-4 mb-lg-0">
                        <h2 className="mb-4">Get in Touch</h2>
                        <p className="text-muted mb-4">
                          Have questions about investing or starting up? We're here to help!
                        </p>

                        <div className="contact-details">
                          <div className="d-flex align-items-center mb-3">
                            <div className="contact-icon">
                              <FiMail />
                            </div>
                            <div className="ms-3">
                              <h6 className="mb-1">Email</h6>
                              <p className="mb-0 text-muted">support@fintech.com</p>
                            </div>
                          </div>

                          <div className="d-flex align-items-center mb-3">
                            <div className="contact-icon">
                              <FiPhone />
                            </div>
                            <div className="ms-3">
                              <h6 className="mb-1">Phone</h6>
                              <p className="mb-0 text-muted">+1 (555) 123-4567</p>
                            </div>
                          </div>

                          <div className="d-flex align-items-center">
                            <div className="contact-icon">
                              <FiMapPin />
                            </div>
                            <div className="ms-3">
                              <h6 className="mb-1">Location</h6>
                              <p className="mb-0 text-muted">
                                123 FinTech Street, Silicon Valley, CA 94025
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col lg={7}>
                      <div className="contact-form">
                        <h3 className="mb-4">Send us a Message</h3>
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              placeholder="Enter your name"
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder="Enter your email"
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="Enter your phone number"
                            />
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label>Message</Form.Label>
                            <Form.Control
                              as="textarea"
                              name="message"
                              value={formData.message}
                              onChange={handleChange}
                              required
                              rows={4}
                              placeholder="Enter your message"
                            />
                          </Form.Group>

                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                            className="d-flex align-items-center"
                          >
                            {isSubmitting ? (
                              'Sending...'
                            ) : (
                              <>
                                <FiSend className="me-2" />
                                Send Message
                              </>
                            )}
                          </Button>

                          {submitStatus === 'success' && (
                            <div className="text-success mt-3">
                              Message sent successfully!
                            </div>
                          )}

                          {submitStatus === 'error' && (
                            <div className="text-danger mt-3">
                              Failed to send message. Please try again.
                            </div>
                          )}
                        </Form>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contact;
