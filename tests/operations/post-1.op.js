+ setup
{ urls: ['foo.com'] }

# POST /test/foo/bar
headers:
  authorization: token ${token}

{ "testing": true }

+ expect
{
        urls: ['foo.com'],
        foo: {
          bar: {
            testing: true
          }
        }
      }
