const API_GATEWAY_URL = 'YOUR_API_URL'; // change this with your actual API Gateway URL

async function submitFeedback() {
  const name = document.getElementById('username').value.trim();
  const feedback = document.getElementById('feedback').value.trim();
  const fileInput = document.getElementById('file');
  const responseDiv = document.getElementById('response');

  if (!name || !feedback || fileInput.files.length === 0) {
    responseDiv.style.color = 'red';
    responseDiv.innerHTML = 'Please fill in all fields and choose a file.';
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64Data = reader.result.split(',')[1];

    const payload = {
      name,
      feedback,
      filename: file.name,
      contentType: file.type,
      fileData: base64Data,
    };

    try {
      const res = await fetch(`${API_GATEWAY_URL}/form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        responseDiv.style.color = 'green';
        responseDiv.innerHTML = 'Feedback submitted successfully!';
        document.getElementById('username').value = '';
        document.getElementById('feedback').value = '';
        document.getElementById('file').value = '';
        loadFeedbacks();
      } else {
        responseDiv.style.color = 'red';
        responseDiv.innerHTML = 'Error: ' + result.error;
      }
    } catch (err) {
      responseDiv.style.color = 'red';
      responseDiv.innerHTML = 'Error: ' + err.message;
    }
  };

  reader.readAsDataURL(file);
}

async function loadFeedbacks() {
  const container = document.getElementById('feedback-container');

  try {
    const res = await fetch(`${API_GATEWAY_URL}/items`);
    const result = await res.json();
    const data = result.items || result;

    console.log('API result:', result);
    console.log('Parsed data:', data);

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = 'No feedback submitted yet.';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
  <tr>
    <th>Name</th>
    <th>Feedback</th>
    <th>Filename</th>
    <th>Image</th>
  </tr>
`;

    data.forEach((item) => {
      const name = item.name || '';
      const feedback = item.feedback || '';
      const filename = item.filename || '';
      const imageUrl = item.imageUrl || '';

      const row = document.createElement('tr');
      row.innerHTML = `
    <td>${name}</td>
    <td>${feedback}</td>
    <td>${filename}</td>
    <td>
      ${imageUrl ? `<img src="${imageUrl}" alt="${filename}" style="max-height: 100px;" />` : ''}
    </td>
  `;
      table.appendChild(row);
    });

    container.innerHTML = '';
    container.appendChild(table);
  } catch (err) {
    container.innerHTML = 'Error: ' + err.message;
  }
}

loadFeedbacks();
