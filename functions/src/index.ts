/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from "firebase-functions";
import * as language from "@google-cloud/language";
import {protos} from "@google-cloud/language";
// import * as admin from "firebase-admin";

type IDocument = protos.google.cloud.language.v1.IDocument;

const client = new language.LanguageServiceClient();

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
    const filename = request.query.filename;
    const bucketName = process.env.FIREBASE_CONFIG ?
      JSON.parse(process.env.FIREBASE_CONFIG).storageBucket :
      "";
    const document: IDocument = {
      gcsContentUri: `gs://${bucketName}/${filename}`,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeSentiment({document: document});
    const sentiment = result.documentSentiment;

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


export const analyzeEntityDocument = functions.https.onRequest(
  async (request, resp) => {
    const filename = request.query.filename;
    const bucketName = process.env.FIREBASE_CONFIG ?
      JSON.parse(process.env.FIREBASE_CONFIG).storageBucket :
      "";
    const document: IDocument = {
      gcsContentUri: `gs://${bucketName}/${filename}`,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeEntities({document: document});
    if (result.entities) {
      const entities = result.entities
        .sort((e1, e2) => e2.salience - e1.salience) // sort descending
        .map((entity) => ({
          name: entity.name,
          type: entity.type,
          salience: entity.salience,
        }));
      resp.status(200).send(JSON.stringify(entities));
    } else {
      resp.status(500).send("Cannot analyze sentiment");
    }
  }
);

export const analyzeSyntaxDocument = functions.https.onRequest(
  async (request, resp) => {
    const filename = request.query.filename;
    const bucketName = process.env.FIREBASE_CONFIG ?
      JSON.parse(process.env.FIREBASE_CONFIG).storageBucket :
      "";
    const document: IDocument = {
      gcsContentUri: `gs://${bucketName}/${filename}`,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeSyntax(
      {document: document, encodeType: "UTF8"},
    );
    if (result.tokens) {
      const tokens = result.tokens.map((token) => ({
        text: token?.text?.content,
        morphology: {
          tag: token?.partOfSpeech?.tag,
          case: token?.partOfSpeech?.case,
          tense: token?.partOfSpeech?.tense,
        },
      }));
      resp.status(200).send(JSON.stringify(tokens));
    } else {
      resp.status(500).send("Cannot analyze sentiment");
    }
  }
);
