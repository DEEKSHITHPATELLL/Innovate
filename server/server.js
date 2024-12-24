const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
}));
app.use(express.json());

const accountSid = 'ACb9924bf1a9ecedea3dd2344ac79934b1'; // Replace with your Account SID
const authToken = '21ed430bde68402acd582a354b0f8928'; // Replace with your Auth Token
const client = twilio(accountSid, authToken);

app.post('/call', (req, res) => {
  const { phoneNumber } = req.body;

  console.log('Phone number received:', phoneNumber);

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  client.calls
    .create({
      url: 'https://handler.twilio.com/twiml/EHXXXXXXXXXXXXXXXXXXXX', // Replace with a valid TwiML URL
      to: phoneNumber,
      from: '+14173612900', // Replace with your Twilio-verified number
    })
    .then((call) => {
      console.log('Call SID:', call.sid);
      res.status(200).json({ message: 'Call initiated', callSid: call.sid });
    })
    .catch((err) => {
      console.error('Twilio API Error:', err.message, err.code, err.moreInfo);
      res.status(500).json({
        error: 'Failed to initiate call',
        details: err.message,
        twilioCode: err.code,
        moreInfo: err.moreInfo,
      });
    });
});

const PORT = 5050;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
