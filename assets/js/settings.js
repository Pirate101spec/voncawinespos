document.addEventListener('DOMContentLoaded', async () => {
    const settingsTab = document.getElementById('settingsTab');
    const storeNameInput = document.getElementById('storeName');
    const taxRateInput = document.getElementById('taxRate');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    if (!settingsTab) return;

    async function fetchSettings() {
        const response = await apiFetch('get_settings.php');
        if (response && response.success) {
            storeNameInput.value = response.settings.storeName;
            taxRateInput.value = response.settings.taxRate;
        }
    }

    saveSettingsBtn.addEventListener('click', async () => {
        const settingsData = {
            storeName: storeNameInput.value,
            taxRate: taxRateInput.value,
        };
        const response = await apiFetch('update_settings.php', 'POST', settingsData);
        if (response && response.success) {
            alert("Settings saved successfully.");
        } else {
            alert("Failed to save settings.");
        }
    });

    fetchSettings();
});
