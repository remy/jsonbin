+name
Deep array coercion

+ setup
{
  "urls": [
    "https://jsonbin.org/_/help",
    "https://jsonbin.org/_/me",
    "https://jsonbin.org/_/logout"
  ]
}


# POST /me/urls/foo/bar
Headers:
  authorization: token ${token}
  Content-Type: application/json

{
  "zoo": true
}

# GET /me/urls/foo
Headers:
  authorization: token ${token}

+ expect
{ "bar": { "zoo": true } }
