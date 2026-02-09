const express = require('express');
const proxy = require('express-http-proxy');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.send("No URL provided.");

    return proxy(targetUrl, {
        proxyReqOptDecorator: (proxyReqOpts) => {
            // 1. MASK USER-AGENT & REMOVE TRACKING
            proxyReqOpts.headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
            delete proxyReqOpts.headers['cookie'];
            delete proxyReqOpts.headers['referer'];
            return proxyReqOpts;
        },
        userResHeaderDecorator: (headers) => {
            // 2. UNBLOCK IFRAMES (The "Startpage" Secret)
            // We delete these so the site doesn't tell your browser "don't frame me"
            delete headers['x-frame-options'];
            delete headers['content-security-policy'];
            
            // 3. MASK LOCATION
            headers['server'] = 'Privacy-Gateway';
            return headers;
        }
    })(req, res, next);
});

app.listen(PORT, () => console.log(`Proxy running on ${PORT}`));
