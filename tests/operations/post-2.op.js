+ name
Request raw numbers (akin to res.send(1000))

+ setup
{ urls: ['foo.com'] }

# POST /test/foo
headers:
  authorization: token ${token}

{ "bar": 100000 }

# GET /test/foo/bar
headers:
  authorization: token ${token}

+ expect
100000
