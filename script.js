// Global variables
let isSignedIn = false;
let accessToken = '';

// This function is called when the Google Sign-In button is clicked
function handleCredentialResponse(response) {
    const responsePayload = parseJwt(response.credential);
    console.log("ID: " + responsePayload.sub);
    console.log('Full Name: ' + responsePayload.name);
    console.log('Given Name: ' + responsePayload.given_name);
    console.log('Family Name: ' + responsePayload.family_name);
    console.log("Image URL: " + responsePayload.picture);
    console.log("Email: " + responsePayload.email);

    isSignedIn = true;
    accessToken = response.credential;
    document.getElementById('add-elder-btn').style.display = 'block';
    loadElderData();
}

// Function to parse the JWT token
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Load the Google Drive API
function loadDriveAPI() {
    gapi.load('client', initDriveAPI);
}

// Initialize the Google Drive API
function initDriveAPI() {
    gapi.client.init({
        apiKey: 'AIzaSyA4fD1PwZ6iEbSRNB2Z3hMxnbOqYtmQQhw',
        clientId: '865517828175-fcaan1ua4bgrf7biungvm99j3lpfgh36.apps.googleusercontent.com',
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        scope: 'https://www.googleapis.com/auth/drive.file'
    }).then(function () {
        console.log('Google Drive API initialized');
    }, function(error) {
        console.error('Error initializing Google Drive API:', error);
    });
}

// Load elder data from Google Drive
function loadElderData() {
    gapi.client.drive.files.list({
        q: "name='elders.json'",
        spaces: 'appDataFolder',
        fields: 'files(id, name)'
    }).then(function(response) {
        var files = response.result.files;
        if (files && files.length > 0) {
            // File exists, read its content
            gapi.client.drive.files.get({
                fileId: files[0].id,
                alt: 'media'
            }).then(function(response) {
                var elders = JSON.parse(response.body);
                displayElders(elders);
            });
        } else {
            console.log('No elder data found.');
        }
    });
}

// Display elders
function displayElders(elders) {
    var eldersContainer = document.getElementById('elders-container');
    eldersContainer.innerHTML = '';
    elders.forEach(function(elder) {
        var elderElement = createElderElement(elder);
        eldersContainer.appendChild(elderElement);
    });
}

// Create elder element
function createElderElement(elder) {
    var elderElement = document.createElement('div');
    elderElement.className = 'elder-form-container';
    // ... (create the elder form as before)
    return elderElement;
}

// Save elder data to Google Drive
function saveElderData(elderData) {
    var fileContent = JSON.stringify(elderData);
    var file = new Blob([fileContent], {type: 'application/json'});
    var metadata = {
        'name': 'elders.json',
        'mimeType': 'application/json',
        'parents': ['appDataFolder']
    };

    var form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);

    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({'Authorization': 'Bearer ' + accessToken}),
        body: form
    }).then((res) => {
        console.log('Elder data saved successfully');
        loadElderData(); // Reload the data
    }).catch((error) => {
        console.error('Error saving elder data:', error);
    });
}

// Event listener for the 'Add Elder' button
document.getElementById('add-elder-btn').addEventListener('click', function() {
    addElderForm();
});

// Function to add a new elder form (similar to before, but update to use Google Drive for saving)
function addElderForm() {
    // ... (create the elder form as before)
    // Update the save button event listener to use saveElderData function
}

// Call loadDriveAPI when the page loads
window.onload = loadDriveAPI;
