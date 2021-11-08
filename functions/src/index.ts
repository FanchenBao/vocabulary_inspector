/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from "firebase-functions";
import * as language from "@google-cloud/language";
import {protos} from "@google-cloud/language";
import * as admin from "firebase-admin";

type IDocument = protos.google.cloud.language.v1.IDocument;

const client = new language.LanguageServiceClient();
admin.initializeApp({
  projectId: "vocabulary-inspector",
});
// Ensure that when local emulator is used, where process.env.ENV is set,
// we use default-bucket.
const bucketName = process.env.ENV === undefined ? (
  process.env.FIREBASE_CONFIG ?
    JSON.parse(process.env.FIREBASE_CONFIG).storageBucket :
    "") : "default-bucket";

/**
Read text data from the the given filename that is stored in a bucket

All bucket-related API reference:
https://googleapis.dev/nodejs/storage/latest/Bucket.html

The method to read file from bucket comes from here:
https://stackoverflow.com/a/65845602/9723036

@param {string} filename Name of the file to be accessed
@return {Promise<string>} The content of the file as a string.
 */
const readStorageFile = async (filename: string): Promise<string> => {
  let buf = "";
  return await new Promise((resolve, reject) => {
    admin
      .storage()
      .bucket(bucketName)
      .file(filename)
      .createReadStream({validation: false})
      .on("error", reject)
      .on("data", (d) => (buf += d))
      .on("end", () => resolve(buf));
  });
};

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
          JSON.stringify({
            sentiment: sentiment.score,
            magnitude: sentiment.magnitude,
          })
        );
    } else {
      resp.status(500).send("Cannot analyze sentiment");
    }
  });


export const analyzeSentimentDocument = functions.https.onRequest(
  async (request, resp) => {
    const filename = request.query.filename as string;
    if (!filename) {
      resp.status(500).send("Must supply a filename");
      return;
    }
    const text = await readStorageFile(filename);
    const document: IDocument = {
      content: text,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeSentiment({document: document});
    const sentiment = result.documentSentiment;

    if (sentiment) {
      functions.logger.log(`Sentiment score: ${sentiment.score}`);
      functions.logger.log(`Sentiment magnitude: ${sentiment.magnitude}`);
      resp.status(200).send(
        JSON.stringify({
          sentiment: sentiment.score,
          magnitude: sentiment.magnitude,
        })
      );
    } else {
      resp.status(500).send("Cannot analyze sentiment");
    }
  }
);


export const analyzeEntityDocument = functions.https.onRequest(
  async (request, resp) => {
    const filename = request.query.filename as string;
    if (!filename) {
      resp.status(500).send("Must supply a filename");
      return;
    }
    const text = await readStorageFile(filename);
    const document: IDocument = {
      content: text,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeEntities({document: document});
    if (result.entities) {
      const entities = result.entities
        .sort((e1, e2) => {
          if (e1?.salience && e2?.salience) {
            return e2.salience - e1.salience;
          }
          return 0;
        }) // sort descending
        .map((entity) => ({
          name: entity.name,
          type: entity.type,
          salience: entity.salience,
        }));
      resp.status(200).send(JSON.stringify(entities));
    } else {
      resp.status(500).send("Cannot analyze entity");
    }
  }
);

export const analyzeSyntaxDocument = functions.https.onRequest(
  async (request, resp) => {
    const filename = request.query.filename as string;
    if (!filename) {
      resp.status(500).send("Must supply a filename");
      return;
    }
    const text = await readStorageFile(filename);
    const document: IDocument = {
      content: text,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeSyntax(
      {document: document, encodingType: "UTF8"},
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
      resp.status(500).send("Cannot analyze syntax");
    }
  }
);

export const analyzeEntitySentimentDocument = functions.https.onRequest(
  async (request, resp) => {
    const filename = request.query.filename as string;
    if (!filename) {
      resp.status(500).send("Must supply a filename");
      return;
    }
    const text = await readStorageFile(filename);
    const document: IDocument = {
      content: text,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeEntitySentiment({
      document: document,
    });
    if (result.entities) {
      const entities = result.entities.map((entity) => ({
        name: entity.name,
        type: entity.type,
        score: entity.sentiment?.score,
        magnitude: entity.sentiment?.magnitude,
      }));
      resp.status(200).send(JSON.stringify(entities));
    } else {
      resp.status(500).send("Cannot analyze entity sentiment");
    }
  }
);

export const classifyContentDocument = functions.https.onRequest(
  async (request, resp) => {
    const filename = request.query.filename as string;
    if (!filename) {
      resp.status(500).send("Must supply a filename");
      return;
    }
    const text = await readStorageFile(filename);
    const document: IDocument = {
      content: text,
      type: "PLAIN_TEXT",
    };

    // Detects the sentiment of the text
    const [classification] = await client.classifyText({
      document: document,
    });
    if (classification.categories) {
      const categories = classification.categories.map((cat) => ({
        name: cat.name,
        confidence: cat.confidence,
      }));
      resp.status(200).send(JSON.stringify(categories));
    } else {
      resp.status(500).send("Cannot classify article");
    }
  }
);
