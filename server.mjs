import express from "express";
import Alexa, { SkillBuilders } from 'ask-sdk-core';
import morgan from "morgan";
import { ExpressAdapter } from 'ask-sdk-express-adapter';
import mongoose from 'mongoose';
import axios from "axios";

mongoose.connect('mongodb+srv://raheel:baig8911@cluster0.bmry1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');

const Usage = mongoose.model('Usage', {
  skillName: String,
  clientName: String,
  createdOn: { type: Date, default: Date.now },
});

const app = express();
app.use(morgan("dev"))
const PORT = process.env.PORT || 3000;


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = 'Fallback intent: Sorry, I had trouble doing what you asked. Please try again.';
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {

    var newUsage = new Usage({
      skillName: "Room booking skill",
      clientName: "saylani class",
    }).save();

    const speakOutput = 'Welcome to my Room Booking app, how may i help you';
    const reprompt = 'I am your virtual assistant. you can ask for book room';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(reprompt)
      .withSimpleCard("Room Booking app", speakOutput)
      .getResponse();
  }
};

const bookingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'bookingIntent';
          },
          handle(handlerInput) {
            const book = Alexa.getSlotValue(handlerInput.requestEnvelope);
            const selection = handlerInput.requestEnvelope.request.intent.confirmationStatus
            console.log(selection);
            if (selection === "DENIED") {
              return handlerInput.responseBuilder
                  .speak("ok cancelled")
                  //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                  .getResponse();
              
            }
        const speakOutput = 'your room is booked, Thank you for visit!';
        return handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse();
    }
};
const skillBuilder = SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    bookingIntentHandler
  )
  .addErrorHandlers(
    ErrorHandler
  )
const skill = skillBuilder.create();
const adapter = new ExpressAdapter(skill, false, false);

app.post('/api/v1/webhook-alexa', adapter.getRequestHandlers());

app.use(express.json())
app.get('/profile', (req, res, next) => {
  res.send("this is a profile");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);