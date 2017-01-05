# NAME

jsonbin.org - A personal JSON store as a RESTful service

## SYNOPSIS

```
$ curl https://jsonbin.org/:user/public
```

First [sign in](https://jsonbin.org/_/login) to get an API key.

## DESCRIPTION

jsonbin.org is a personal key/value JSON store as a service. Protected behind authentication and API key requests, data is stored as JSON and can be deep linked. A permissioning model also allows specific paths to your store become public to share with others.

The aim of the project is to provide a simplified data store for tinkerers.

**Important**: jsonbin is currently in open beta. If you have questions, please get in touch.

## AUTHENTICATION

By default all user store data is protected behind auth either via browser sign in, or an authorization token. The token is [your apikey](https://jsonbin.org/_/me/apikey). For example:

```
curl -X POST https://jsonbin.org/blog \
     -H 'Authorization: token abcd-xyz-123' \
     -d '{ url: "https://remysharp.com" }'
```

## ENDPOINTS

A private namespace URL "`_`" is used for jsonbin specific endpoints:

* [`/_/help`](https://jsonbin.org/_/help) This page.
* [`/_/login`](https://jsonbin.org/_/login) Auth with github.
* [`/_/logout`](https://jsonbin.org/_/logout) Clear your session.
* [`/_/me`](https://jsonbin.org/_/me) Your full profile.
* [`/_/me/apikey`](https://jsonbin.org/_/me/apikey) Your API key
* [`/_/me/apikey`](https://jsonbin.org/_/me/apikey) DELETE to revoke your current key
* [`/_/me/username`](https://jsonbin.org/_/me/username) Your username
* [`/_/me/public`](https://jsonbin.org/_/me/public) Your public paths
* [`/_/me/:path`](https://jsonbin.org/_/me/:path) Deep link to profile properties

The following methods with your authorization header will access your data store:

* `GET` return given path mapped to a JSON path
* `POST` store the payload (supports JSON and files)
* `PATCH` merge the payload with the endpoint
* `DELETE` store path

By default all endpoints are private, but you can modify a specific entry point to be public by default by changing the permissions:

* `PUT /:path/_perms` make the :path public
* `DELETE /:path/_perms` make :path private
* `GET /:path/_perms` check permissions of :path

Public endpoints accept GET requests without the authorization header, but require your username as the root of the endpoint, such as:

    curl https://jsonbin.org/remy/blog

## AUTHOR

Remy Sharp <remy@leftlogic.com>

## LICENSE

[MIT](https://rem.mit-license.org)
