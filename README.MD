# Strapi plugin TikTok Auth Mobile

TikTok Auth Mobile helps you to create TikTok authentication for your Android and iOS users.

It uses the official TikTok API [get-user-info](https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info) to get the user profile and create a Strapi user based on that information.

*NOTE*: Since an email is required to create a user in Strapi, this plugin creates a pseudo-email like `${user.union_id}@tiktok.com` for users who logged in/registered using this plugin.

# How it works

TikTok Authentication happens on the device via the `Continue with TikTok` button and then the client application should send `code` to the server. The server will retrieve `access_token` for the user with code from Tiktok API and send redirect to universal link that is associated with your app, passing the `access-token` in query parameters. And then the client application should send `access_token` to the server.

Because TikTok does not expose a publicly available JWKS (JSON Web Key Set) URL in the same way that authentication providers like Google or Apple do, this plugin is not able to validate received token. Instead of token validation plugin uses this token to fetch user info from TikTok official API [get-user-info](https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info).

If TikTok API returns a user user for provided `access_token`, then a Strapi user will be created.

If the user is already in the database, an authenticated session for the user is established.

More info can be found here: https://developers.tiktok.com/doc/login-kit-manage-user-access-tokens/


# Features

- Ability to authenticate users via mobile devices using TikTok API
- JWT Authentication for users using Strapi default user-permission collection
- Secure

# Activate the Plugin

Add the following in `config/plugins.js` of you Strapi application:

```js
module.exports = {
  'tiktok-auth-mobile': {
    enabled: true
  },
};
```


# Configuration

https://developers.tiktok.com/doc/getting-started-create-an-app

1. Create a TikTok app from the [TikTok developers portal](https://developers.tiktok.com/apps).

2. Select Platforms: Android and iOS or Web, configure required options for both platforms

3. Add `Login Kit` Product and set Redirect URI for all your platforms. Redirect URI is the link e.g. https://api.example.com/api/tiktok-auth-mobile/callback, where api.example.com is the domain where your strapi app is deployed, and /api/tiktok-auth-mobile/callback - is the path to endpoint in the plugin that will handle obtaining tiktok access_token from it's API. 

4. Add `user.info.profile` into Scopes (it also should contain `user.info.profile`).

5. If you are using sandbox mode, then add a TikTok user account into Sandbox settings -> Target Users (https://developers.tiktok.com/doc/add-a-sandbox).

6. In your strapi .env file make sure to add variables from .env.example:

```sh
# your TikTok Developer App key and secret https://developers.tiktok.com/apps
CLIENT_KEY="your-key"
CLIENT_SECRET="your-secret"

# url that will receive access token on client
# where example.com - is the associated domain for your app
# and /redirect is a specific path that will handle sending access_token to the server to authenticate
REDIRECT_APP_URL="https://example.com/redirect"

# your strapi server url
STRAPI_URL="https://api.example.com"
```


# How to use

### Obtain the authorization code in your app 

Here you can find instructions for your platform: https://developers.tiktok.com/doc/login-kit-overview

### Fetch an access token using an authorization code

After obtaining the authorization code it will redirect to https://api.example.com/api/tiktok-auth-mobile/callback, providing scopes, state, code to the callback endpoint, so it will use them to get the access token from https://open.tiktokapis.com/v2/oauth/token/ OAuth endpoint. Do not forget to set your env variables (CLIENT_KEY, CLIENT_SECRET, REDIRECT_APP_URL, STRAPI_URL), otherwise the plugin will not work and demand you to set them. The Client Key and Client Secret can be obtained when setting your TikTok Developer App. The STRAPI_URL is the domain where your Strapi app is deployed (localhost is not accepted). And REDIRECT_APP_URL is the universal link for handling access_token, that your app can open. 

After obtaining the access_token it will send it in the query parameter access_token back to your app, and your app will be able to open the link https://example.com/redirect?access_token=***********.

https://developers.tiktok.com/doc/oauth-user-access-token-management

If there was an error during obtaining token, it will redirect to your app with parameter error, which will contain error description.

https://example.com/redirect?error=***********

You can handle this in your app, show it to the user, allow them to try again.

### Authenticate User

The client retrieves a TikTok `access_token` via the universal link https://example.com/redirect?access_token=***********.

Send the user's `access_token` to your server using HTTPS.
Then, on the server, we fetch the user profile information and use this information to establish a session (issue a JWT) or create a new account.

In this example https://api.example.com - is the url for your strapi server.

```js
    {
        method: 'POST',
        path: 'https://api.example.com/api/tiktok-auth-mobile/connect',
        data: {
          access_token: TOKEN
        }
    }
```

The example response:

```json
{
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzUzMDc5Njk2LCJleHAiOjE3NTU2NzE2OTZ9.KhfAmvlGnx_ghWRBzKvvBn70gdpfgeG-bHMFe1XsLik",
    "user": {
        "id": 4,
        "documentId": "z6249d07b3m9oexz7f9u0ntd",
        "username": "user1262767453070",
        "email": "0cc3832e-4f61-5958-89b5-8bb8ae9b6225@tiktok.com",
        "provider": "tiktok",
        "confirmed": true,
        "blocked": false,
        "createdAt": "2025-07-21T06:34:56.292Z",
        "updatedAt": "2025-07-21T06:34:56.292Z",
        "publishedAt": "2025-07-21T06:34:56.293Z"
    }
}
```

If the TikTok user does not exist, an error will be returned:

```json
{
    "data": null,
    "error": {
        "status": 400,
        "name": "ApplicationError",
        "message": "User does not exist.",
        "details": {}
    }
}
```

If the TikTok API rejects the `access_token`, an error will be returned:

```json
{
    "data": null,
    "error": {
        "status": 400,
        "name": "ApplicationError",
        "message": "Failed to fetch TikTok user: Request failed with status code 401",
        "details": {}
    }
}
```

If the TikTok API returns some error, an error will be returned:
See: https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info#response (error: Error Object)

```json
{
    "data": null,
    "error": {
        "status": 400,
        "name": "ApplicationError",
        "message": "Some error description from TikTok API",
        "details": {}
    }
}
```


# Report Bugs/Issues

Any bugs/issues you may face can be submitted as issues in the Github repo.
