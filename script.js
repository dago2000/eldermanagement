// Initialize Google API Client
function initClient() {
    gapi.load('client:auth2', function() {
        gapi.auth2.init({
            client_id: '865517828175-fcaan1ua4bgrf7biungvm99j3lpfgh36.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/drive.file'
        }).then(function () {
            console.log('Google API initialized');
        });
    });
}

// Handle successful Google Sign-In
function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    console.log('User signed in:', profile.getName(), profile.getEmail());

    // Show the logout button and enable the "Add Elder" button
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('add-elder-btn').disabled = false;

    // Initialize Google Drive API client
    gapi.client.load('drive', 'v3', function() {
        checkOrCreateElderDataFile();
    });
}

// Sign out function
function signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('add-elder-btn').disabled = true;
    });
}

// Check if the elder data file exists or create a new one
function checkOrCreateElderDataFile() {
    gapi.client.drive.files.list({
        'q': "name = 'elders.json'",
        'spaces': 'drive'
    }).then(function(response) {
        if (response.result.files.length > 0) {
            console.log('Elder data file found:', response.result.files[0]);
        } else {
            console.log('No elder data file found, creating a new one.');
            createElderDataFile();
        }
    });
}

// Create a new elder data file
function createElderDataFile() {
    const fileContent = JSON.stringify({ "elders": [] });
    const file = new Blob([fileContent], { type: 'application/json' });

    const metadata = {
        'name': 'elders.json',
        'mimeType': 'application/json'
    };

    const accessToken = gapi.auth.getToken().access_token;
    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: new FormData().append("metadata", new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
            .append("file", file)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log('Elder data file created:', data);
    });
}

// Initialize the Google API Client Library when the page loads
window.onload = function() {
    initClient();
    document.getElementById('logout-btn').addEventListener('click', signOut);
};
