# Strapi plugin TikTok Auth Mobile

TikTok Auth Mobile helps you to create TikTok authentication for your Android and iOS users.

It uses the official TikTok API [get-user-info](https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info) to get the user profile and create a Strapi user based on that information.

*NOTE*: Since an email is required to create a user in Strapi, this plugin creates a pseudo-email like `${user.union_id}@tiktok.com` for users who logged in/registered using this plugin.

# How it works

TikTok Authentication happens on the device via `Continue with TikTok` button and then the client application should send `access_token` to the server.

Because TikTok does not expose a publicly available JWKS (JSON Web Key Set) URL in the same way that authentication providers like Google or Apple do, this plugin coudnot validate recived token. Instead of token validation plugin uses this token to fetch user info from TikTok official API [get-user-info](https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info).

If TikTok API returns a user user for provided `access_token`, then a Strapi user will be created.

If the user is already in the database, an authenticated session for the user is established.

More info can be found here: https://developers.tiktok.com/doc/login-kit-manage-user-access-tokens/


# Features

- Ability to authenticate users via mobile devices using TikTok API
- JWT Authentication for users using strapi default user-permission collection
- Secure

# Activate the Plugin

Add the following in `config/plugins.js` of you strapi application:

```js
module.exports = {
  'tiktok-auth-mobile': {
    enabled: true
  },
};
```


# Configuration

1. Create a TikTok app from the [TikTok developers portal](https://developers.tiktok.com/apps).

2. Select Platforms: Android and iOS, configure required option for both platform.

3. Add `Login Kit` Product and set Redirect URI both platform.

4. Add `user.info.profile` into Scopes.

5. If you are using sandbox mode, then add a TikTok user accounts into Sandbox settings -> Target Users.


# How to use

### Authenticate User

The client retrieves a TikTok `access_token` when the user selects a TikTok Account.

After a user successfully signs in, send the user's `access_token` to your server using HTTPS.
Then, on the server, we are fetching the user profile information and use this information to establish a session (issue a jwt) or create a new account.

```js
    {
        method: 'POST',
        path: 'YOUR_STRAPI_BACKEND_URL/api/tiktok-auth-mobile/connect',
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
        "message": "User not exist.",
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
