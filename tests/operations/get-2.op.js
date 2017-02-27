+ setup
{ urls: ['foo.com'] }

# GET /me
headers:
  authorization: token ${token}

+ expect
{ urls: ['foo.com'] }
