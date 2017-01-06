## NAME

[`jsonbin.org`](https://jsonbin.org) - A personal JSON store as a RESTful service

## SYNOPSIS

curl `https://jsonbin.org/remy/blog`
<!-- <p>something-on-STDOUT | <code>jsonbin</code></p> -->

To save data, you'll first need to <a href="/_/login">sign in</a> to get an API key.

## DESCRIPTION

`jsonbin.org` is a personal key/value JSON store as a service. Protected behind authentication and API key requests, data is stored as JSON and can be deep linked. A permissioning model also allows specific paths to your store to become public to share with others.

The aim of the project is to provide a simplified data store for tinkerers.

**Important:** jsonbin is currently in open beta. If you have questions, please get [in touch](#author).

## Authentication

By default all user store data is protected behind auth either via browser sign in, or an `authorization` token. The token is your [`apikey`](/_/me/apikey). For example:

```
curl -X POST https://jsonbin.org/remy/blog \
     -H 'Authorization: token abcd-xyz-123' \
     -d '{ url: "https://remysharp.com" }'
```

## Endpoints

A private namespace URL "`_`" is used for jsonbin specific endpoints:

* [`/_/help`](/_/help) This page.
* [`/_/login`](/_/login) Auth with github.
* [`/_/logout`](/_/logout) Clear your session.
* [`/_/me`](/_/me) Your full profile.
* [`/_/me/apikey`](/_/me/apikey) Your API key.
* [`/_/me/apikey`](/_/me/apikey) DELETE to revoke your current key.
* [`/_/me/username`](/_/me/username) Your username.
* [`/_/me/public`](/_/me/public) Your public paths.
* [`/_/me/:path`](/_/me/) Deep link to profile properties.

The following methods with your `authorization` header will access your data store against `https://jsonbin.org/:username/`:

* `GET` return given path mapped to a JSON path.
* `POST` store the payload (supports JSON and files).
* `PATCH` merge the payload with the endpoint.
* `DELETE` store path.

By default all endpoints are private, but you can modify a specific entry point to be public by default by changing the permissions:

* PUT `/:username/:path/_perms` make the `:path` public.
* DELETE `/:username/:path/_perms` make `:path` private.
* GET `/:username/:path/_perms` check permissions of `:path`.

Public endpoints accept `GET` requests without the `authorization` header.

## Example usage

You can use jsonbin as a shared clipboard across machines. Creating an alias to upload `STDIN` via `curl` could be posted to a public URL:

```
alias jsonbin="curl -X 'POST' \
      -H'authorization: token abcd-xyz-123' \
      -F'content=@-' \
      https://jsonbin.org/remy/clipboard"
echo "foo" | jsonbin
```

## BUGS

This project lives at [github/jsonbin](https://github.com/remy/jsonbin). Please report bugs to [github/jsonbin/issues](https://github.com/remy/jsonbin/issues).

## AUTHOR

Remy Sharp &lt;[remy@leftlogic.com](mailto:remy@leftlogic.com)&gt;

## LICENSE

[MIT](https://rem.mit-license.org)
