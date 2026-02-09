const express = require('express');
const proxy = require('express-http-proxy');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.send("No URL provided.");

    // Parse the host to handle redirects correctly
    const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl);

    return proxy(urlObj.origin, {
        proxyReqPathResolver: () => urlObj.pathname + urlObj.search,
        proxyReqOptDecorator: (proxyReqOpts) => {
            proxyReqOpts.headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
            delete proxyReqOpts.headers['cookie'];
            delete proxyReqOpts.headers['referer'];
            return proxyReqOpts;
        },
        userResHeaderDecorator: (headers, userReq, userRes, proxyReq, proxyRes) => {
            // 1. STRIP IFRAME BLOCKERS
            delete headers['x-frame-options'];
            delete headers['content-security-policy'];

            // 2. INTERCEPT REDIRECTS
            // If the site says "Go to /login", we rewrite it to "://your-proxy.com"
            if (headers['location']) {
                const redirectUrl = new URL(headers['location'], targetUrl).href;
                headers['location'] = `/proxy?url=${encodeURIComponent(redirectUrl)}`;
            }

            return headers;
        }
    })(req, res, next);
});

app.listen(PORT, () => console.log(`Proxy running on ${PORT}`));
