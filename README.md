# canvas-constructor-server :rocket:

This is a core-distributed micro-service that aims to render canvas-constructor commands in an array series.
It consumes a `JSON` body from a POST request and will return the rendered image if successful with a `200 OK` code,
and with a `JSON` response on why the response failed otherwise.

## Deploying

In release, I highly suggest setting up [NGINX](https://www.nginx.com/) and enabling its g-zip and HTTP/2 options for
increased performance and lower latency, as those can be really slow when done in [node.js](https://nodejs.org/). You
can also set up an `Authorization` password with it so you do not need to touch `canvas-constructor-server`'s code-base.

Alternatively, you may want to modify the code to add pre-made hard-coded templates for increased performance, this
repository serves as a baseline implementation, and may be forked and modified for any specific purpose. If you have
a feature you think it can be useful for anybody, do not hesitate to contribute!

## Contributing

1. Fork it!
1. Create your feature branch: `git checkout -b my-new-feature`
1. Commit your changes: `git commit -am 'Add some feature'`
1. Push to the branch: `git push origin my-new-feature`
1. Submit a pull request!

## Author

**canvas-constructor-server** © [kyranet](https://github.com/kyranet), released under the
[MIT](https://github.com/kyranet/canvas-constructor-server/blob/master/LICENSE) License.
Authored and maintained by kyranet.

> Github [kyranet](https://github.com/kyranet) - Twitter [@kyranet_](https://twitter.com/kyranet_)
