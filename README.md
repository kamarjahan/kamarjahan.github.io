<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KAMARJAHAN SEARCH ENGINE</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body style="background-image: url('background.jpg'); background-size: cover;">
    <div class="container">
        <h1 style="color: red;">KAMARJAHAN SEARCH ENGINE</h1>
        <div class="search-container">
            <input type="text" id="search-input" placeholder="Search the web..." onkeyup="searchOnEnter(event)">
            <a id="search-button" href="#" onclick="searchGoogle()">Search</a>
        </div>
        <div class="google-services">
            <a href="https://www.youtube.com" class="service-button">
                <img src="youtube-logo.png" alt="YouTube Logo">
                YouTube
            </a>
            <a href="https://mail.google.com" class="service-button">
                <img src="gmail-logo.png" alt="Gmail Logo">
                Gmail
            </a>
            <a href="https://drive.google.com" class="service-button">
                <img src="drive-logo.png" alt="Google Drive Logo">
                Drive
            </a>
            <a href="https://www.google.com" class="service-button">
                <img src="google-logo.png" alt="Google Logo">
                Google
            </a>
        </div>
    </div>

    <script>
        function searchOnEnter(event) {
            if (event.key === "Enter") {
                searchGoogle();
            }
        }

        function searchGoogle() {
            const searchInput = document.getElementById('search-input').value;
            const searchQuery = encodeURIComponent(searchInput);
            const googleSearchURL = `https://www.google.com/search?q=${searchQuery}`;
            window.location.href = googleSearchURL;
        }
    </script>
</body>
</html>
