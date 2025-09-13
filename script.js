document.addEventListener('DOMContentLoaded', () => {
  // --- STATE MANAGEMENT ---
  let entries = [];
  let currentEntryId = null;

  // --- DOM ELEMENTS ---
  const newEntryBtn = document.getElementById('new-entry-btn');
  const searchInput = document.getElementById('search-input');
  const entriesList = document.getElementById('entries-list');
  
  const welcomeView = document.getElementById('welcome-view');
  const readView = document.getElementById('read-view');
  const editView = document.getElementById('edit-view');

  const readTitle = document.getElementById('read-title');
  const readContent = document.getElementById('read-content');
  
  const editTitle = document.getElementById('edit-title');
  const editContent = document.getElementById('edit-content');

  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const editBtn = document.getElementById('edit-btn');
  const deleteBtn = document.getElementById('delete-btn');
  
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // --- CORE FUNCTIONS ---
  const showToast = (message, isSuccess = true) => {
    toastMessage.textContent = message;
    toast.className = `fixed bottom-5 right-5 text-white py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300 opacity-100 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`;
    setTimeout(() => {
      toast.classList.remove('opacity-100');
    }, 3000);
  };

  const switchView = (view) => {
    welcomeView.classList.add('hidden');
    readView.classList.add('hidden');
    editView.classList.add('hidden');
    document.getElementById(view).classList.remove('hidden');
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('wiki-entries', JSON.stringify(entries));
  };

  const loadFromLocalStorage = () => {
    const storedEntries = localStorage.getItem('wiki-entries');
    if (storedEntries) {
      entries = JSON.parse(storedEntries);
    }
  };

  const renderEntriesList = (filter = '') => {
    entriesList.innerHTML = '';
    const filteredEntries = entries
      .filter(entry => entry.title.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => b.id - a.id); // Sort by most recent
    
    if (filteredEntries.length === 0 && filter) {
      entriesList.innerHTML = `<p class="text-gray-500 text-center p-4">No entries found for "${filter}".</p>`;
    } else if (filteredEntries.length === 0) {
      entriesList.innerHTML = `<p class="text-gray-500 text-center p-4">No entries yet. Create one!</p>`;
    } else {
      filteredEntries.forEach(entry => {
        const li = document.createElement('li');
        li.dataset.id = entry.id;
        li.className = `text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer p-3 rounded-lg mb-1 transition-colors ${entry.id === currentEntryId ? 'bg-blue-600 text-white' : ''}`;
        li.textContent = entry.title || 'Untitled Entry';
        li.addEventListener('click', () => {
          displayEntry(entry.id);
        });
        entriesList.appendChild(li);
      });
    }
  };

  const displayEntry = (id) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    currentEntryId = id;
    readTitle.textContent = entry.title;
    readContent.innerHTML = marked.parse(entry.content);
    switchView('read-view');
    renderEntriesList(searchInput.value);
  };

  // --- EVENT HANDLERS ---
  newEntryBtn.addEventListener('click', () => {
    currentEntryId = null;
    editTitle.value = '';
    editContent.value = '';
    switchView('edit-view');
    editTitle.focus();
  });

  saveBtn.addEventListener('click', () => {
    const title = editTitle.value.trim();
    const content = editContent.value;
    
    if (!title) {
      showToast('Title cannot be empty.', false);
      return;
    }

    if (currentEntryId) {
      const entry = entries.find(e => e.id === currentEntryId);
      entry.title = title;
      entry.content = content;
    } else {
      const newEntry = {
        id: Date.now(),
        title,
        content
      };
      entries.push(newEntry);
      currentEntryId = newEntry.id;
    }
    
    saveToLocalStorage();
    renderEntriesList();
    displayEntry(currentEntryId);
    showToast('Entry saved successfully!');
  });
  
  cancelBtn.addEventListener('click', () => {
    if (currentEntryId) {
      displayEntry(currentEntryId);
    } else {
      switchView('welcome-view');
    }
  });

  editBtn.addEventListener('click', () => {
    const entry = entries.find(e => e.id === currentEntryId);
    if (!entry) return;

    editTitle.value = entry.title;
    editContent.value = entry.content;
    switchView('edit-view');
  });

  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this entry?')) {
      entries = entries.filter(e => e.id !== currentEntryId);
      saveToLocalStorage();
      currentEntryId = null;
      renderEntriesList();
      switchView('welcome-view');
      showToast('Entry deleted.', true);
    }
  });

  searchInput.addEventListener('input', (e) => {
    renderEntriesList(e.target.value);
  });
  
  // --- INITIALIZATION ---
  const initialize = () => {
    loadFromLocalStorage();
    renderEntriesList();
    switchView('welcome-view');
  };

  initialize();
});
