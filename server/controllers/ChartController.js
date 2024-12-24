let conversationState = {}; // Global object to track states per user/session

exports.handleChat = (req, res) => {
  const { message, sessionId } = req.body;

  // Initialize state for the session if not present
  if (!conversationState[sessionId]) {
    conversationState[sessionId] = { step: 1 }; // Start at step 1
  }

  let reply = "I didn't understand that.";
  let waitingForFile = false;

  // Retrieve current step and conversation data for this session
  const currentStep = conversationState[sessionId].step;

  console.log(`Session ID: ${sessionId}, Current Step: ${currentStep}, Message: ${message}`);

  switch (currentStep) {
    case 1: // Greeting
      if (message.toLowerCase() === "hi") {
        reply = "Hello! How can I help you?";
        conversationState[sessionId].step = 2; // Move to the next step
      } else {
        reply = "Please start by saying 'Hi' to begin the conversation.";
      }
      break;

    case 2: // Sharing ideas with funders
      if (
        message.toLowerCase().includes("share my ideas") ||
        message.toLowerCase().includes("funders") ||
        message.toLowerCase().includes("ideas")
      ) {
        reply = "I will connect you with funders. Please upload your ideas here.";
        waitingForFile = true; // Prompt for file upload
        conversationState[sessionId].step = 3; // Move to the next step
      } else {
        reply =
          "Please tell me how you'd like to proceed. You can say something like 'I want to share my ideas with the funders.'";
      }
      break;

      case 3: // File uploaded
  if (
    message.toLowerCase().includes("uploaded") ||
    message.toLowerCase().includes("done")
  ) {
    // Explicitly set the specific prompting step
    conversationState[sessionId].step = 4;
    
    // Directly set the reply to ask for name
    
    // Ensure you're sending the response
    return res.json({ reply, waitingForFile: false });
  } else {
    reply = "Please confirm that you've uploaded the file or say 'done' when completed.";
    return res.json({ reply, waitingForFile: true });
  }
  // Remove the break statement
    case 4: // Collecting Name
      if (message.trim()) { // Save user's name
        reply = `Thank you, Please specify the domain of your idea.`;
        conversationState[sessionId].step = 5; // Move to the next step
      } else {
        reply = "Please provide your name.";
      }
      break;

    case 5: // Collecting Location
      if (message.trim()) {
        conversationState[sessionId].location = message; // Save user's location
        reply = "Got it! Finally, please enter your name.";
        conversationState[sessionId].step = 6; // Move to the next step
      } else {
        reply = "Please provide your location.";
      }
      break;

    case 6: // Collecting Domain
      if (message.trim()) { // Save user's domain
        conversationState[sessionId].name=message; // Retrieve user's name
        reply = `Thank you, ${message} for your interest! We will connect you with funders soon. 😊`;
        delete conversationState[sessionId]; // Reset the state after completion
      } else {
        reply = "Please specify the domain of your idea.";
      }
      break;

    default:
      reply = "I didn't understand that.";
      break;
  }

  // Respond with the appropriate reply and file upload state
  res.json({ reply, waitingForFile });
};