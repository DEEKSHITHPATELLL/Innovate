import React, { useState } from 'react';
import './DialPad.css'; // Custom styles for dial pad

const DialPad = () => {
  const [phoneNumber, setPhoneNumber] = useState(''); // State to track phone number

  // Function to handle button clicks and update the phone number
  const handleButtonClick = (value) => {
    if (phoneNumber.length < 15) { // Limit to 15 characters
      setPhoneNumber(phoneNumber + value);
    }
  };

  // Function to clear the phone number
  const clearNumber = () => setPhoneNumber('');

  // Function to delete the last character
  const backspace = () => setPhoneNumber(phoneNumber.slice(0, -1));

  return (
    <div className="dial-pad-container">
      <h2>Dial Pad</h2>

      {/* Display of the current phone number */}
      <div className="phone-display">
        {phoneNumber || 'Enter a Number'}
      </div>

      {/* Dial pad buttons */}
      <div className="dial-buttons">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((btn) => (
          <button 
            key={btn} 
            className="dial-button" 
            onClick={() => handleButtonClick(btn.toString())}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Action buttons (Call, Backspace, Clear) */}
      <div className="dial-actions">
        {/* Call Button */}
        <a href={`tel:${phoneNumber}`} className="call-button" onClick={(e) => {
          if (!phoneNumber) {
            e.preventDefault();
            alert('Please enter a phone number to call.');
          }
        }}>
          📞 Call
        </a>

        {/* Backspace Button */}
        <button className="backspace-button" onClick={backspace}>
          ⌫ Backspace
        </button>

        {/* Clear Button */}
        <button className="clear-button" onClick={clearNumber}>
          🗑️ Clear
        </button>
      </div>
    </div>
  );
};

export default DialPad;
