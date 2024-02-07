# Sample Authorization server for FCM OAuth in Sinch in-app calling

This is an implementation of an Authorization server, that can be used to quickly get started with FCM push notifications when using Sinch's in-app calling Android SDK.

## Placeholders replacement

To be able to start using  this implementation of an Autorization server, you have to first replace some placeholders with appropriate values.

You can find those placeholders in `./placeholders/*.json` files, together with an explanation on how to fetch the appropriate values:

```text
./placeholders
├── config.json
└── service-account.json
```

* `config.json`:
  * `client_credentials`: `client_id` and `client_secret` that Sinch will use to authenticate against your Authorization server
  * `fcm_config`: the "Project Number" for the FCM project used in your app
* `service-account.json`: a `service-account.json` downloaded by the FCM console of the FCM project used in your app.

## Configuration in Sinch Dashboard

| Sinch Dashboard field           | Value |
| ---                             | ---- |
| **Client Id**                   | `client_id` from `./placeholers/client-credentials.json` |
| **Client Secret**               | `client_secret` from `./placeholers/client-credentials.json` |
| **Scope**                       | `https://www.googleapis.com/auth/firebase.messaging` |
| **Your Auth server URL**        | `https://\<ngrok-id>.ngrok-free.app/oauth/token` |
| **Your FCM token endpoint URL** | `https://\<ngrok-id>.ngrok-free.app/oauth/fcm-token` |
