+ name
mixed case username

+ setup
{ urls: ['foo.com'] }

# GET /TesT
headers:
  authorization: token ${token}

+ expect
{ urls: ['foo.com'] }
