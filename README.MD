# Description

This repo contains source code for five Firebase functions that demonstrate how [Google Cloud Natural Language API](https://cloud.google.com/natural-language/docs/quickstarts) can be used. For a detailed walk-through of each Google Cloud Natural Language API (hereinafter referred to as GCP NLP API), please refer to [this video](https://www.youtube.com/watch?v=GBdds3Vuk1w&t=9s). This project serves as the course project for CAP6776 Information Retrieval, offered by Florida Atlantic University in Fall 2021, taught by Dr. Dingding Wang.

# Set up

Follow the steps below to set up a local Firebase emulator to test the GCP NLP APIs.

1. Download this repo. All subsequent steps assume that we are under the root of the project folder.
    ```bash
    git clone ??
    ```
2. Create a new Firebase project via Firebase console. **Suppose the newly created project is called `gcp-nlp-demo`**. Under root, run `firebase login` to login the account that is used to create the project.
3. Within Firebase console, go to _Project settings => Service accounts_, and click _Generate new private key_. Save the credential JSON file and move it under `./functions/gcp-nlp-demo-firebase-adminsdk.json`. **NOTE: this file contains private key. It must NEVER be shared or committed in git**
4. Under `./functions`, create a file `.env` with the following content.
    ```
    GOOGLE_APPLICATION_CREDENTIALS="./gcp-nlp-demo-firebase-adminsdk.json"
    FIREBASE_STORAGE_EMULATOR_HOST="localhost:9199"
    GCLOUD_PROJECT="gcp-nlp-demo"
    ENV=dev
    ```
5. Install [Firebase CLI](https://firebaseopensource.com/projects/firebase/firebase-tools/#installation)
6. Under `./functions`, install all the relevant dependencies.
    ```bash
    npm install
    ```
7. Under root, set up Firebase emulator by running `firebase init emulators`. Choose to emulate both Firebase function and storage.
8. Under `./functions`, build the JavaScript files from TypeScript. Run `npm run build` for one time build. Run `npm run build:watch` for active building. The second approach is recommended if change is frequently made to the source code, which is `./functions/src/index.ts` by the way.
9. Under `./functions`, run `export $(grep -v '^#' .env | xargs)` to export the `.env` file content as environment variables.
10. Under root, run `firebase use gcp-nlp-demo`.
11. Under root, run `firebase emulators:start --import ./emulator` to start the emulator for both Firebase function and storage. The storage automatically loads the files from `./emulator`. If everything goes as planned, we shall see five functions deployed to `http://localhost:5001/gcp-nlp-demo`
12. Check the emulator UI for storage to make sure the sample texts have been loaded. There are four sample texts under `sentiment`, three under `classify`, and one under `entity`.

# Usage

In a new shell, examine each GCP NLP APIs as demonstrated below.

* Analyze Sentiment
  - String: this version passes the text as the body of the POST call. Only suitable for small strings.
    ```bash
    curl -X POST -H "Content-Type:application/json" http://localhost:5001/gcp-nlp-demo/us-central1/analyzeSentimentString -d '{"text": "I love this movie."}'
    ```
  - Document: this version reads a document saved in the cloud storage associated with the Firebase project. It is the recommended way to handle large scale text. All the other functions are based on reading documents instead of strings from the query body.
    ```bash
    curl http://localhost:5001/gcp-nlp-demo/us-central1/analyzeSentimentDocument\?filename\=sentiment/mixed.txt
    ```
* Analyze Entity Document
    ```bash
    curl http://localhost:5001/gcp-nlp-demo/us-central1/analyzeEntityDocument\?filename\=entity/news.txt
    ```
* Analyze Syntax Document
    ```bash
    curl http://localhost:5001/gcp-nlp-demo/us-central1/analyzeSyntaxDocument\?filename\=entity/news.txt
    ```
* Analyze Entity Sentiment Document
    ```bash
    curl http://localhost:5001/gcp-nlp-demo/us-central1/analyzeEntitySentimentDocument\?filename\=entity/news.txt
    ```
* Classify Content Document
    ```bash
    curl http://localhost:5001/gcp-nlp-demo/us-central1/classifyContentDocument\?filename\=classify/sports.txt
    ```

Since there is no restriction on which text needs to be passed to which API, one can try all sorts of texts to examine the strengths and weaknesses of GCP NLP API.
