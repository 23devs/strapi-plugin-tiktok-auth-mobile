## Auth user via `access_token`

```sh
curl --location 'http://localhost:1337/api/tiktok-auth-mobile/connect' \
--header 'Content-Type: application/json' \
--data '{
  "access_token": "act.Rz3cannGjQoFv5KmF4i6Ppi0IDPpLHBYotvAgfTyF3B5Q63fGHXLqVByiOJD!4815.e1"
}'
```

Response:

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
