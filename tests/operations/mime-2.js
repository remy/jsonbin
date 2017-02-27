+name
x-www-form-urlencoded "[]"

+setup
{ urls: ['foo.com'] }

# PATCH /me/urls
headers:
  authorization: token ${token}
  Content-Type: application/x-www-form-urlencoded

[]

+expect
{ urls: ['foo.com', []] }
