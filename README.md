# Sample Authorization server for FCM OAuth in Sinch in-app calling

This is an implementation of an Authorization server, that can be used to quickly get started with FCM push notifications when using Sinch's in-app calling Android SDK.

## Overview

This authorization server is implemented as a Node application, and makes use of the Google credentials included in a `service-account.json` file to mint short-lived OAuth tokens valid for FCM usage.

For more details on how this authorization servers interacts with Sinch platform, see the [Guide for migration to FCM v1](https://developers.sinch.com/docs/in-app-calling/android/migration-to-fcm-v1/) on Sinch website.

To start using this sample and allow Sinch placing calls to Android devices, you essentially have to follow 5 simple steps:

1. provide your OAuth configuration and Google credentials by replacing placeholder values;
2. execute the authorization server locally on your machine;
3. make your application public on the internet;
4. update your FCM configuration to [Sinch Dashboard](https://dashboard.sinch.com/voice/apps);
5. test!

## 1) Placeholders replacement

To be able to start using  this implementation of an Autorization server, you have to first replace some placeholders with appropriate values.

You can find those placeholders in `./placeholders/*.json` files:

```text
./placeholders
├── config.json
└── service-account.json
```

Each of those files includes a detailed explanation on how to fetch the appropriate values for each placeholder; as a summary, the values to be replaced are:

* in `config.json`:
  * `client_credentials`: `client_id` and `client_secret` that Sinch will use to authenticate against your Authorization server
    * if you haven't provided any OAuth configuration to Sinch via [Sinch Dashboard](https://dashboard.sinch.com/voice/apps), `client_id` and `client_secret` are arbitrary strings;
    * if you have already provided an OAuth configuration to Sinch via [Sinch Dashboard](https://dashboard.sinch.com/voice/apps), `client_id` and `client_secret` in `placeholders/config.json` have to match "Client ID" and "Client Secret" in the Dashboard
  * `fcm_config`: the "Project Number" of the FCM project used in your Android app (available in the "FCM Console" of your FCM project)
* `service-account.json`: a `service-account.json` downloaded from the FCM console of the FCM project used in your app.

**NOTE**: you won't be able to successfully start the authorization server if all placeholders haven't been replaced.

## 2) Execute the authorization server on your machine

The authorization server is a Node application, and can be executed directly via `npm`, or as a Docker container (the methods are equivalent).

To execute the authorization server via `npm`:

* `npm install`
* `npm run start`

To execute the authorization server as a Docker container:

* `docker compose up --build`

To verify the application is running as expected, you can run 

## 3) Make your application public on the internet

The authorization server will listen on port `1000`application will 

### Mapping of placeholders and Sinch Dashbaord fields

| Sinch Dashboard field           | Value |
| ---                             | ---- |
| **Client Id**                   | `client_id` from `./placeholers/client-credentials.json` |
| **Client Secret**               | `client_secret` from `./placeholers/client-credentials.json` |
| **Scope**                       | `https://www.googleapis.com/auth/firebase.messaging` |
| **Your Auth server URL**        | `https://\<ngrok-id>.ngrok-free.app/oauth/token` |
| **Your FCM token endpoint URL** | `https://\<ngrok-id>.ngrok-free.app/oauth/fcm-token` |
