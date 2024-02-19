const request = require("supertest");
const app = require("../src/app");

const VALID_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const VALID_CLIENT_ID = "my-client-id";
const VALID_CLIENT_SECRET = "my-client-secret";
const VALID_GRANT = "client_credentials";
const VALID_FCM_PROJECT_NUMBER = "123456789";

const AUTH_SERVER_URL = "/oauth/token";
const FCM_TOKENS_URL = "/oauth/fcm-token";

// Mock the FCM token factory, to avoid sending real requests to Google.
jest.mock("../src/fcmTokenFactory", () => () => {
  return new Promise((resolve, reject) => {
    resolve({
      expiry_date: Date.now() + 10 * 1000,
      access_token: "dummy-fcm-token",
    });
  });
});

describe("Early rejected requests", () => {
  test("Contenty type not form-urlencoded gives 400", (done) => {
    [AUTH_SERVER_URL, FCM_TOKENS_URL].forEach((e) => {
      request(app)
        .post(e)
        .then((response) => {
          expect(response.statusCode).toBe(400);
          done();
        });
    });
  });

  test("Too many form-urlencoded fields gives 400", (done) => {
    [AUTH_SERVER_URL, FCM_TOKENS_URL].forEach((e) => {
      const tooManyForms = {};
      for (let i = 1; i <= 20; i++) {
        tooManyForms.e = e;
      }
      sendFormRequest(AUTH_SERVER_URL, tooManyForms, null, 401, done);
    });
  });
});

describe("Invalid clientCredential on authServer endpoint", () => {
  test.each([
    { client_id: "wrong", client_secret: VALID_CLIENT_SECRET },
    { client_id: "", client_secret: VALID_CLIENT_SECRET },
    { client_id: "🏝️", client_secret: VALID_CLIENT_SECRET },
    { client_secret: VALID_CLIENT_SECRET },
  ])("Credentials %p gives 401", (credentials, done) => {
    sendFormRequest(AUTH_SERVER_URL, credentials, null, 401, done);
  });
});

describe("Invalid credentials on FcmTokens endpoint", () => {
  test.each([null, "Bearer invalid-token", "Not Bearer"])(
    "Credentials %p gives 401",
    (credentials, done) => {
      sendFormRequest(FCM_TOKENS_URL, {}, credentials, 401, done);
    },
  );
});

describe("Valid clientCredentials, but mandatory fields missing on authServer endpoint", () => {
  const validCredentials = {
    client_id: VALID_CLIENT_ID,
    client_secret: VALID_CLIENT_SECRET,
  };
  test.each([
    {},
    { scope: "wrong-scope" },
    { scope: VALID_SCOPE },
    { scope: VALID_SCOPE, grant_type: "wrong-grant" },
  ])("Incomplete request %p gives 400", (requestFields, done) => {
    sendFormRequest(
      AUTH_SERVER_URL,
      Object.assign({}, requestFields, validCredentials),
      null,
      400,
      done,
    );
  });
});

describe("Valid token from authServer", () => {
  let accessToken;

  beforeAll(async () => {
    const validRequest = {
      client_id: VALID_CLIENT_ID,
      client_secret: VALID_CLIENT_SECRET,
      scope: VALID_SCOPE,
      grant_type: VALID_GRANT,
    };
    accessToken = (
      await sendFormRequest(AUTH_SERVER_URL, validRequest, null, 200, null)
    ).body;
    validateAccessToken(accessToken);
  });

  test("Get a valid FCM token", async () => {
    const fcmToken = (
      await sendFormRequest(
        FCM_TOKENS_URL,
        {
          grant_type: VALID_GRANT,
          fcm_project_number: VALID_FCM_PROJECT_NUMBER,
        },
        accessToken.access_token,
        200,
        null,
      )
    ).body;
    validateAccessToken(fcmToken);
  });

  test.each([
    [{}, 401],
    [{ fcm_project_number: "wrong", grant_type: VALID_GRANT }, 401],
    [
      { fcm_project_number: VALID_FCM_PROJECT_NUMBER, grant_type: "wrong" },
      400,
    ],
  ])(
    "Request %p to FCM token endpoint gives %p",
    (body, expectedResult, done) => {
      sendFormRequest(
        FCM_TOKENS_URL,
        body,
        accessToken.access_token,
        expectedResult,
        done,
      );
    },
  );
});

/*
 * Helper functions
 */

async function sendFormRequest(
  endpoint,
  body,
  bearerToken,
  expectedResponseCode,
  done,
) {
  let req = request(app).post(endpoint);
  if (bearerToken) {
    req = req.set("Authorization", `Bearer ${bearerToken}`);
  }
  req = req.type("form");

  const response = await req.send(body);

  expect(response.statusCode).toBe(expectedResponseCode);
  if (done) {
    done();
  }
  return response;
}

function validateAccessToken(token) {
  expect(token.access_token).toBeDefined();
  expect(token.access_token).not.toBe("");
  expect(token.expires_in).toBeGreaterThan(1);
  expect(token.token_type).toEqual("Bearer");
}
