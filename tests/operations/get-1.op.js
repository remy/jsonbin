+ setup
{ urls: ['foo.com'] }

# GET /test
headers:
  authorization: token ${token}

+ expect
{ urls: ['foo.com'] }
