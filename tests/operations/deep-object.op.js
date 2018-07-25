+name
Deep object insert

+ setup
{
  a: {
    b: {
      c: {
        x: 1,
        y: 2,
        z: 3
      }
    }
  }
}


# POST /me/a/o/w
Headers:
  authorization: token ${token}
  Content-Type: application/json

{
  "l": "bird"
}

# GET /me/
Headers:
  authorization: token ${token}

+ expect
{
  a: {
    o: {
      w: {
        l: "bird"
      }
    },
    b: {
      c: {
        x: 1,
        y: 2,
        z: 3
      }
    }
  }
}
