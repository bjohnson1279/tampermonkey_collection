// Update status in popup
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['isActive'], (result) => {
    const isActive = result.isActive !== false; // Default to true
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = isActive ? 'Active' : 'Inactive';
      statusElement.style.color = isActive ? '#0a0' : '#a00';
    }
  });
});

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'toggleButton') {
    chrome.storage.sync.get(['isActive'], (result) => {
      const newStatus = !(result.isActive !== false);
      chrome.storage.sync.set({ isActive: newStatus }, () => {
        const statusElement = document.getElementById('status');
        if (statusElement) {
          statusElement.textContent = newStatus ? 'Active' : 'Inactive';
          statusElement.style.color = newStatus ? '#0a0' : '#a00';
        }
        // Send message to content script to update its state
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'toggle', isActive: newStatus});
          }
        });
      });
    });
  }
});