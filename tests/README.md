# Writing tests

If an issue is raised or a PR that adds some functionality, most tests can be written in this bespoke operation test format (below). If there's some additional complicated behaviour required, then you will need to write a full test using tap (see exising tests for examples).

However, if you test can be satified with the follow structure, the operation test is the way to go.

1. Here's my starting store
2. Do some RESTful operation
3. Here's what I expect the store to be

---

## Operation test

The only reqirement is adding a new file to the [operations](operations) test directory. The file extension is `.op` and typically the filename will match an issue number.

The format of the file is as follows:

```text
+ setup
{
  "some": "json"
}

# METHOD url
headers:
  authorization: token ${token}
  etc

["request", "body"]

+ expect
{
  "some": "updated json store"
}
```

For example, the followng operation tests that the `PATCH` successfully removes the property name on the `blog` path.

```text
+ setup
{
  "blog": {
    "name": "foo",
  }
}

# PATCH /me/blog
Headers:
  authorization: token ${token}
  Content-Type: application/json

{ "name": null }

+ expect
{
  "blog": {}
}
```

## Notes

The following headers will be automatically expanded to include real valid tokens:

- `authorization: token ${token}`
- `authorization: bearer ${token}`
- The username for the tests is `test` - which is synonymous with the `/me` path
