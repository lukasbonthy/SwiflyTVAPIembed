const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Movie route
app.get('/movie/:id', (req, res) => {
    const movieId = req.params.id;
    const targetUrl = `https://vidsrc.su/embed/movie/${movieId}`; // Embed this URL directly

    // Send HTML response with embedded video player
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Movie Player</title>
            <style>
                html, body {
                    height: 100%;
                    margin: 0;
                    font-family: Arial, sans-serif;
                    overflow: hidden; /* Prevent scrollbars */
                }
                .video {
                    width: 100%;
                    height: 100%;
                    border: none; /* Remove border */
                }
            </style>
        </head>
        <body>
            <iframe class="video" src="${targetUrl}" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
            <script>
                // After the page is loaded, apply sandbox to all iframes
                window.onload = function() {
                    const iframes = document.querySelectorAll('iframe');
                    iframes.forEach(function(iframe) {
                        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
                    });
                };
            </script>
        </body>
        </html>
    `);
});

// TV Episode route
app.get('/tv/:id/:season/:episode', (req, res) => {
    const { id, season, episode } = req.params;
    const videoUrl = `https://vidsrc.su/embed/tv/${id}/${season}/${episode}`; // Embed this URL directly

    // Send HTML response with embedded video player
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TV Episode Player</title>
            <style>
                html, body {
                    height: 100%;
                    margin: 0;
                    font-family: Arial, sans-serif;
                    overflow: hidden; /* Prevent scrollbars */
                }
                .video {
                    width: 100%;
                    height: 100%;
                    border: none; /* Remove border */
                }
            </style>
        </head>
        <body>
            <iframe class="video" src="${videoUrl}" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
            <script>
                // After the page is loaded, apply sandbox to all iframes
                window.onload = function() {
                    const iframes = document.querySelectorAll('iframe');
                    iframes.forEach(function(iframe) {
                        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
                    });
                };
            </script>
        </body>
        </html>
    `);
});
// TV Episode route
app.get('//tv/:id/:season/:episode', (req, res) => {
    const { id, season, episode } = req.params;
    const videoUrl = `https://embed.spencerdevs.xyz/tv/${id}/${season}/${episode}`; // Embed this URL directly

    // Send HTML response with embedded video player
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TV Episode Player</title>
            <style>
                html, body {
                    height: 100%;
                    margin: 0;
                    font-family: Arial, sans-serif;
                    overflow: hidden; /* Prevent scrollbars */
                }
                .video {
                    width: 100%;
                    height: 100%;
                    border: none; /* Remove border */
                }
            </style>
        </head>
        <body>
            <iframe class="video" src="${videoUrl}" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe>
            <script>
                // After the page is loaded, apply sandbox to all iframes
                window.onload = function() {
                    const iframes = document.querySelectorAll('iframe');
                    iframes.forEach(function(iframe) {
                        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
                    });
                };
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
