import * as functions from "firebase-functions";
import * as language from "@google-cloud/language";
import {protos} from "@google-cloud/language";

type IDocument = protos.google.cloud.language.v1.IDocument;

const client = new language.LanguageServiceClient();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const analyzeSentimentString = functions.https.onRequest(
  async (request, resp) => {
    const text = request.body.text;

    const document: IDocument = {
      content: text,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeSentiment({document: document});
    const sentiment = result.documentSentiment;

    functions.logger.log(`Text: ${text}`);
    if (sentiment) {
      functions.logger.log(`Sentiment score: ${sentiment.score}`);
      functions.logger.log(`Sentiment magnitude: ${sentiment.magnitude}`);
      resp
        .status(200)
        .send(
          `Sentiment = ${sentiment.score}; magnitude = ${sentiment.magnitude}`
        );
    } else {
      resp.status(500).send("Cannot analyze sentiment");
    }
  });


export const analyzeSentimentDocument = functions.https.onRequest(
  async (request, resp) => {
    const text = request.body.text;

    const document: IDocument = {
      content: text,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeSentiment({document: document});
    const sentiment = result.documentSentiment;

    functions.logger.log(`Text: ${text}`);
    if (sentiment) {
      functions.logger.log(`Sentiment score: ${sentiment.score}`);
      functions.logger.log(`Sentiment magnitude: ${sentiment.magnitude}`);
      resp
        .status(200)
        .send(
          `Sentiment = ${sentiment.score}; magnitude = ${sentiment.magnitude}`
        );
    } else {
      resp.status(500).send("Cannot analyze sentiment");
    }
  }
);
