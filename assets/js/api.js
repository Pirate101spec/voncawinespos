const API_BASE_URL = 'http://localhost/wines/assets/api/'; // Change this to your backend path

async function apiFetch(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer ' + sessionStorage.getItem('token') // For a more secure system
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred. Please check the console.');
        return null;
    }
}
