const API_BASE_URL = `http://localhost/wines/assets/api/`; // Change this to your backend path

async function apiFetch(endpoint, method = 'GET', data = null) {
    let url = `${API_BASE_URL}${endpoint}`;

    if (data && method === `GET`) {
        const params = new URLSearchParams(data);
        url += `?${params.toString()}`;
    }
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        },
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        // Check for empty response (e.g., 204 No Content)
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred. Please check the console.');
        return null;
    }
};