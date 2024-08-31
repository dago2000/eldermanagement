function handleCredentialResponse(response) {
    const data = jwt_decode(response.credential);
    console.log('User logged in:', data);

    // Initialize Google API client after login
    initializeGapiClient();

    // Enable the "Add Elder" button after successful login
    document.getElementById('add-elder-btn').disabled = false;
}

function initializeGapiClient() {
    gapi.load('client', () => {
        gapi.client.init({
            apiKey: 'AIzaSyA4fD1PwZ6iEbSRNB2Z3hMxnbOqYtmQQhw',
            clientId: '865517828175-fcaan1ua4bgrf7biungvm99j3lpfgh36.apps.googleusercontent.com',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scope: 'https://www.googleapis.com/auth/drive.file',
        }).then(() => {
            console.log('Google API client initialized.');
        });
    });
}

document.getElementById('add-elder-btn').addEventListener('click', function () {
    addElderForm();
});

function addElderForm() {
    const eldersContainer = document.getElementById('elders-container');

    // Create a new elder form container
    const elderFormContainer = document.createElement('div');
    elderFormContainer.classList.add('elder-form-container');

    // Create the header for the collapsible panel
    const elderFormHeader = document.createElement('div');
    elderFormHeader.classList.add('elder-form-header');

    const elderNameHeader = document.createElement('h3');
    elderNameHeader.textContent = 'New Elder'; // Placeholder for elder name and surname
    elderFormHeader.appendChild(elderNameHeader);

    const elderPhotoThumbnail = document.createElement('img');
    elderPhotoThumbnail.classList.add('elder-photo-thumbnail');
    elderPhotoThumbnail.style.display = 'none'; // Hide initially until a photo is uploaded
    elderFormHeader.appendChild(elderPhotoThumbnail);

    const toggleButton = document.createElement('button');
    toggleButton.classList.add('toggle-elder-btn');
    toggleButton.textContent = 'Expand';
    elderFormHeader.appendChild(toggleButton);

    // Create the content for the collapsible panel
    const elderFormContent = document.createElement('div');
    elderFormContent.classList.add('elder-form-content');

    elderFormContent.innerHTML = `
        <h2>Add Elder Details</h2>
        <div class="elder-details">
            <input type="text" placeholder="Elder's Name" class="elder-name" required>
            <input type="text" placeholder="Elder's Surname" class="elder-surname" required>
            <input type="number" placeholder="Elder's Age" class="elder-age" required>
            <input type="file" class="elder-photo" accept="image/*">
            <img class="photo-preview elder-photo-preview" alt="Elder Photo Preview" style="display:none;">
        </div>

        <h2>Add Medicine Details</h2>
        <div class="medicine-container">
            <div class="medicine-entry">
                <input type="text" placeholder="Medicine Name" class="medicine-name" required>
                <select class="medicine-frequency">
                    <option value="daily">Daily</option>
                    <option value="every-8-hours">Every 8 Hours</option>
                    <option value="every-12-hours">Every 12 Hours</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom Time</option>
                </select>
                <input type="datetime-local" class="medicine-custom-time" style="display:none;">
                <input type="file" class="medicine-photo" accept="image/*">
                <img class="photo-preview medicine-photo-preview" alt="Medicine Photo Preview" style="display:none;">
            </div>
        </div>
        <button class="add-medicine-btn">Add Another Medicine</button>
        <button class="save-btn">Save Elder Details</button>
    `;

    // Append header and content to the form container
    elderFormContainer.appendChild(elderFormHeader);
    elderFormContainer.appendChild(elderFormContent);

    // Append the new elder form to the container
    eldersContainer.appendChild(elderFormContainer);

    // Add event listeners for new buttons and inputs
    elderFormHeader.addEventListener('click', function () {
        toggleElderForm(elderFormContent, toggleButton);
    });

    elderFormContainer.querySelector('.add-medicine-btn').addEventListener('click', function () {
        addMedicineEntry(elderFormContainer.querySelector('.medicine-container'));
    });

    elderFormContainer.querySelector('.save-btn').addEventListener('click', function () {
        saveElderDetails(elderFormContainer, elderNameHeader, elderPhotoThumbnail);
    });

    elderFormContainer.querySelector('.elder-photo').addEventListener('change', function () {
        displayPhotoPreview(this, elderFormContainer.querySelector('.elder-photo-preview'), elderPhotoThumbnail);
    });

    // Event listener for showing custom timestamp input
    elderFormContainer.querySelector('.medicine-frequency').addEventListener('change', function () {
        toggleCustomTimeInput(this);
    });
}

function toggleElderForm(content, button) {
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        button.textContent = 'Collapse';
    } else {
        content.style.display = 'none';
        button.textContent = 'Expand';
    }
}

function addMedicineEntry(container) {
    const newEntry = document.createElement('div');
    newEntry.classList.add('medicine-entry');

    newEntry.innerHTML = `
        <input type="text" placeholder="Medicine Name" class="medicine-name" required>
        <select class="medicine-frequency">
            <option value="daily">Daily</option>
            <option value="every-8-hours">Every 8 Hours</option>
            <option value="every-12-hours">Every 12 Hours</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom Time</option>
        </select>
        <input type="datetime-local" class="medicine-custom-time" style="display:none;">
        <input type="file" class="medicine-photo" accept="image/*">
        <img class="photo-preview medicine-photo-preview" alt="Medicine Photo Preview" style="display:none;">
    `;

    container.appendChild(newEntry);

    // Add event listeners for photo preview and custom time input
    newEntry.querySelector('.medicine-photo').addEventListener('change', function () {
        displayPhotoPreview(this, newEntry.querySelector('.medicine-photo-preview'));
    });

    newEntry.querySelector('.medicine-frequency').addEventListener('change', function () {
        toggleCustomTimeInput(this);
    });
}

function toggleCustomTimeInput(selectElement) {
    const customTimeInput = selectElement.nextElementSibling;
    if (selectElement.value === 'custom') {
        customTimeInput.style.display = 'block';
    } else {
        customTimeInput.style.display = 'none';
    }
}

function displayPhotoPreview(input, previewElement, thumbnailElement = null) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
            if (thumbnailElement) {
                thumbnailElement.src = e.target.result;
                thumbnailElement.style.display = 'inline-block';
            }
        };
        reader.readAsDataURL(file);
    } else {
        previewElement.style.display = 'none';
        if (thumbnailElement) {
            thumbnailElement.style.display = 'none';
        }
    }
}

function saveElderDetails(form, header, thumbnail) {
    const elderName = form.querySelector('.elder-name').value;
    const elderSurname = form.querySelector('.elder-surname').value;
    const elderAge = form.querySelector('.elder-age').value;
    const elderPhoto = form.querySelector('.elder-photo').files[0];

    if (!elderName || !elderSurname || isNaN(elderAge) || elderAge <= 0) {
        alert('Please provide valid elder details (name, surname, and age must be a number).');
        return;
    }

    header.textContent = `${elderName} ${elderSurname}`; // Update header with name and surname

    const medicines = [];
    const medicineEntries = form.querySelectorAll('.medicine-entry');
    medicineEntries.forEach(entry => {
        const medicineName = entry.querySelector('.medicine-name').value;
        const frequency = entry.querySelector('.medicine-frequency').value;
        const customTime = entry.querySelector('.medicine-custom-time').value;
        const medicinePhoto = entry.querySelector('.medicine-photo').files[0];

        if (medicineName) {
            medicines.push({
                name: medicineName,
                frequency: frequency === 'custom' ? `Custom: ${customTime}` : frequency,
                photo: medicinePhoto
            });
        }
    });

    // Upload data to Google Drive
    uploadDataToDrive({ elder: { name: elderName, surname: elderSurname, age: elderAge, photo: elderPhoto }, medicines: medicines });
}

function uploadDataToDrive(data) {
    const fileContent = JSON.stringify(data); // Convert your data to a string
    const file = new Blob([fileContent], { type: 'application/json' });

    const metadata = {
        name: 'ElderData.json',
        mimeType: 'application/json'
    };

    const accessToken = gapi.auth.getToken().access_token; // Get the access token
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: form
    }).then(response => response.json())
        .then(data => {
            console.log('File uploaded to Google Drive with ID:', data.id);
            alert('Elder details saved successfully!');
        });
}
