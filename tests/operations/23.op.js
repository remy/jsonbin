+ setup
{
  "urls": [
    "https://jsonbin.org/_/help",
    "https://jsonbin.org/_/me",
    "https://jsonbin.org/_/logout"
  ],
  "gettingStarted": "check out the *help*, and try 'curl https://jsonbin.org/<my account ID> -H \"authorization: token <my token>\"'"
}


# POST /me
Headers:
  authorization: token ${token}
  Content-Type: application/json

[{
  "value": "Hello",
  "done": false
},
{
  "value": "Hello2",
  "done": false
}]

# POST /me/demo
Headers:
  authorization: token ${token}
  Content-Type: application/json

[{
  "something": "else",
}]

# GET /me/demo
Headers:
  authorization: token ${token}

+ expect
[{
  "something": "else"
}]
