document.addEventListener('DOMContentLoaded', function() {
  restoreOptions();

  document.getElementById('save').addEventListener('click', saveOptions);
});

function saveOptions() {
  const yellowThreshold = parseInt(document.getElementById('yellowThreshold').value);
  const redThreshold = parseInt(document.getElementById('redThreshold').value);

  chrome.storage.sync.set({
    yellowThreshold: yellowThreshold,
    redThreshold: redThreshold
  }, function() {
    const status = document.getElementById('status');
    status.textContent = 'Settings saved!';
    setTimeout(() => { status.textContent = ''; }, 2000);
  });
}

function restoreOptions() {
  chrome.storage.sync.get(['yellowThreshold', 'redThreshold'], function(items) {
    document.getElementById('yellowThreshold').value = items.yellowThreshold || 20;
    document.getElementById('redThreshold').value = items.redThreshold || 50;
  });
}
