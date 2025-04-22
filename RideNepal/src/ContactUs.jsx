import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Send, ArrowLeft } from 'react-feather';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real application, you would send this data to your backend
      // For now, we'll simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus({
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'Something went wrong. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }
  };

  return (
    <div className="contact-container">
      {/* Header */}
      <header className="contact-header">
        <div className="contact-header-content">
          <Link to="/home" className="contact-back-button">
            <ArrowLeft size={24} />
          </Link>
          <h1>Contact Us</h1>
        </div>
      </header>

      <div className="contact-content">
        {/* Information Section */}
        <section className="contact-info-section">
          <h2>Get in Touch</h2>
          <p className="contact-intro">
            Have questions or need assistance? Our team is here to help. Reach out through any of the following channels.
          </p>

          <div className="contact-info-cards">
            <div className="contact-info-card">
              <MapPin className="contact-info-icon" size={28} />
              <h3>Our Location</h3>
              <p>123 Durbar Marg</p>
              <p>Kathmandu, Nepal</p>
            </div>

            <div className="contact-info-card">
              <Phone className="contact-info-icon" size={28} />
              <h3>Phone Number</h3>
              <p>+977 9456784590</p>
              <p>Monday-Friday, 9AM-6PM</p>
            </div>

            <div className="contact-info-card">
              <Mail className="contact-info-icon" size={28} />
              <h3>Email Address</h3>
              <p>support@ridenepal.com</p>
              <p>info@ridenepal.com</p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="contact-form-section">
          <h2>Send a Message</h2>
          
          {submitStatus && (
            <div className={`contact-status-message ${submitStatus.success ? 'success' : 'error'}`}>
              {submitStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this regarding?"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here..."
                rows="5"
                required
              />
            </div>

            <button 
              type="submit" 
              className="contact-submit-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  Send Message <Send size={16} />
                </>
              )}
            </button>
          </form>
        </section>
      </div>

      {/* Footer */}
      <footer className="contact-footer">
        <div className="contact-footer-content">
          <div className="contact-footer-links">
            <Link to="/home" className="home-c">Home</Link>
            <Link to="/about" className="about-us">About Us</Link>
            <Link to="/help" className="help">Help</Link>
          </div>
          <p className="contact-copyright">© 2023 RideNepal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs; 