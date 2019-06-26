module.exports = ({ ANALYTICS, HOST, publicId, username, apikey, bearer }) => `
<!DOCTYPE html>
<html lang="en">
   <head>
      <meta http-equiv="Content-type" content="text/html; charset=utf-8">
      <meta http-equiv="Content-Language" content="en-us">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>jsonbin - A JSON store as a RESTful service</title>
      <link rel="icon" type="image/png" href="/_/img/favicon.png" sizes="144x144">
      <link rel="stylesheet" href="/_/css/man.css">
      ${
      ANALYTICS
      ? `
      <script>
         (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
         (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
         m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
         })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

         ga('create', '${ANALYTICS}', 'auto');
         ga('send', 'pageview');

      </script>
      `
      : ''
      }
   </head>
   <body id="manpage">
      <main>
         <div class="container">
         <div class='mp'>
            <ol class="man-decor man-head man head">
               <li class="tl">jsonbin(1)</li>
               <li class="tc">json RESTful store</li>
               <li class="tr">jsonbin(1)</li>
            </ol>
            <h2 id="name">NAME</h2>

            <p><code>jsonbin.org</code> - A personal JSON store as a RESTful service</p>

            <h2 id="synopsis">SYNOPSIS</h2>

            <p>curl <code>${HOST}/remy/blog</code></p>

            <h2 id="access">Access</h2>

            <p>${publicId ? `You're currently signed in as:</p>

            <ul>
            <li>username: <code>${username}</code></li>

            <li>apikey: <code>${apikey}</code></li>
            </ul>

            <p>All examples below will use these details.` : `To save data, you'll first
            need to <a href="${HOST}/_/login">sign in</a> to get an API key. All examples below
            use <code>example</code> as the username.`}</p>

            <h2 id="description">DESCRIPTION</h2>

            <p><code>jsonbin.org</code> is a personal key/value JSON store as a service. Protected behind
            authentication and API key requests, data is stored as JSON and can be deep
            linked. A permissioning model also allows specific paths to your store to become
            public to share with others.</p>

            <p>The aim of the project is to provide a simplified data store for tinkerers.</p>

            <p><strong>Important:</strong> jsonbin is currently in open beta. If you have questions, please
            get <a href="#author">in touch</a>.</p>

            <h2 id="authentication">Authentication</h2>

            <p>By default all user store data is protected behind auth either via browser sign
            in, or an <code>authorization</code> token. The token is your
            <a href="${HOST}/_/me/apikey"><code>apikey</code></a>. For example:</p>

            <pre><code>curl -X POST ${HOST}/${username}/blog \\
  -H 'authorization: token ${apikey}' \\
  -d '{ url: "https://remysharp.com" }'
</code></pre>

            <p>To use jsonbin in the browser, it's recommended that you use a
            <a href="/_/bearer?path=urls">bearer</a> token with a limited expiry:</p>

            <pre><code>fetch('${HOST}/me/urls', {
  headers: {
    // example uses 1 minute token restricted to 'urls' path
    authorization: 'Bearer ${bearer}',
  }
}).then(res =&gt; res.json()).then(res =&gt; {
  console.log(res);
});
</code></pre>

            <h2 id="endpoints">Endpoints</h2>

            <p>A private namespace URL "<code>_</code>" is used for jsonbin specific endpoints:</p>

            <ul>
            <li><a href="${HOST}/me"><code>/me</code></a> Alias to your <code>/${username}</code> path.</li>

            <li><a href="${HOST}/_/me"><code>/_/me</code></a> Your full profile.</li>

            <li><a href="${HOST}/_/me/apikey"><code>/_/me/apikey</code></a> Your API key.</li>

            <li><a href="${HOST}/_/me/apikey"><code>/_/me/apikey</code></a> <code>DELETE</code> to revoke your current
            key.</li>

            <li><a href="${HOST}/_/me/username"><code>/_/me/username</code></a> Your username.</li>

            <li><a href="${HOST}/_/me/public"><code>/_/me/public</code></a> Your public paths.</li>

            <li><a href="${HOST}/_/me/"><code>/_/me/:path</code></a> Deep link to profile properties.</li>

            <li><a href="${HOST}/_/bearer"><code>/_/bearer(?exp=ms&amp;path=…)</code></a> Generate a bearer token
            (for client use)</li>

            <li><a href="${HOST}/_/help"><code>/_/help</code></a> This page.</li>

            <li><a href="${HOST}/_/version"><code>/_/version</code></a> Current jsonbin version.</li>

            <li><a href="${HOST}/_/login"><code>/_/login</code></a> Auth with github.</li>

            <li><a href="${HOST}/_/logout"><code>/_/logout</code></a> Clear your session.</li>
            </ul>

            <p>The following methods with your <code>authorization</code> header will access your data
            store:</p>

            <ul>
            <li><code>GET</code> return given path mapped to a JSON path.</li>

            <li><code>POST</code> store the payload (supports JSON and files).</li>

            <li><code>PATCH</code> merge the payload with the endpoint.</li>

            <li><code>DELETE</code> store path.</li>
            </ul>

            <p>For example:</p>

            <pre><code>curl -X PATCH \\
  -H 'authorization: token ${apikey}' \\
  -d'{ "topic": "code" }' \\
  ${HOST}/${username}/blog
</code></pre>

            <p>By default all endpoints are private, but you can modify a specific entry point
            to be public by default by changing the permissions:</p>

            <ul>
            <li>PUT <code>/${username}/:path/_perms</code> make the <code>:path</code> public.</li>

            <li>DELETE <code>/${username}/:path/_perms</code> make <code>:path</code> private.</li>

            <li>GET <code>/${username}/:path/_perms</code> check permissions of <code>:path</code>.</li>
            </ul>

            <p>Public endpoints accept <code>GET</code> requests without the <code>authorization</code> header.</p>

            <h2 id="notesonpatch">Notes on PATCH</h2>

            <p>The <code>PATCH</code> method implements the JSON Merge Patch standard
            <a href="https://tools.ietf.org/html/rfc7396">(RFC 7396)</a> when the target endpoint is an
            <code>object</code>. This means if you wish to remove a property from your store, a value
            of <code>null</code> is sent:</p>

            <pre><code>curl -X PATCH \\
  -H 'authorization: token ${apikey}' \\
  -d'{ "title": null }' \\
  ${HOST}/${username}/blog</code></pre>

            <p>The exception is that when the endpoint is an array, a <code>PATCH</code> will <em>always</em>
            push onto the endpoint. If you need to reset the array you can <code>POST</code> to the
            endpoint, or you can <code>DELETE</code> an <a href="#example-with-arrays">individual array element</a>.</p>

            <h2 id="examplestoringfiles">Example storing files</h2>

            <p>You can use jsonbin as a shared clipboard across machines. Creating an alias to
            upload <code>STDIN</code> via <code>curl</code> could be posted to a public URL:</p>

            <pre><code>alias jsonbin="curl -X 'POST' \\
  -H'authorization: token ${apikey}' \\
  -F'content=@-' \\
  ${HOST}/${username}/clipboard"
echo "foo" | jsonbin</code></pre>

            <h2 id="examplewitharrays">Example with arrays</h2>

            <p>As well as objects, arrays are also supported. To delete an array element, it
            should be accessed using the index as per:</p>

            <pre><code>curl -X DELETE ${HOST}/${username}/urls/1
            </code></pre>

            <p>To <code>push</code> a new element, so long as the endpoint contains an array:</p>

            <pre><code>curl -X PATCH ${HOST}/${username}/urls \\
  -d "foo.com"
</code></pre>

            <h2 id="bugs">BUGS</h2>

            <p>This project lives at <a href="https://github.com/remy/jsonbin">jsonbin</a>. Please report
            bugs to <a href="https://github.com/remy/jsonbin/issues">jsonbin/issues</a>.</p>

            <h2 id="author">AUTHOR</h2>

            <p>Remy Sharp &lt;<a href="mailto:remy@leftlogic.com">remy@leftlogic.com</a>&gt;</p>
            <ol class="man-decor man-foot man foot">
               <li class="tl"></li>
               <li class="tc">January 2017</li>
               <li class="tr">jsonbin(1)</li>
            </ol>
         </div>
      </main>
   </body>
</html>
`;
