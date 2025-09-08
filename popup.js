// who actually reads the code, nerd

// color magic
function interpolateColor(color1, color2, factor) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// badge color
function getBadgeColor(count, yellowThresh, redThresh) {
  const green = '#00FF00';
  const yellow = '#FFFF00';
  const red = '#FF0000';

  if (count <= yellowThresh) {
    if (yellowThresh === 0) return green;
    const factor = count / yellowThresh;
    return interpolateColor(green, yellow, factor);
  } else if (count <= redThresh) {
    if (redThresh === yellowThresh) return yellow;
    const factor = (count - yellowThresh) / (redThresh - yellowThresh);
    return interpolateColor(yellow, red, factor);
  } else {
    return red;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // init values from settings
  chrome.storage.sync.get(['yellowThreshold', 'redThreshold'], function(items) {
    const yellowThresh = items.yellowThreshold || 20;
    const redThresh = items.redThreshold || 50;

    document.getElementById('yellowThresh').value = yellowThresh;
    document.getElementById('redThresh').value = redThresh;
    document.getElementById('yellowValue').textContent = yellowThresh;
    document.getElementById('redValue').textContent = redThresh;

    // yoink tabs
    chrome.tabs.query({}, function(tabs) {
      const tabCount = tabs.length;

      // tab count
      const tabCountElement = document.getElementById('tab-count');
      tabCountElement.textContent = `Total open tabs: ${tabCount}`;

      // make sure color is right
      const color = getBadgeColor(tabCount, yellowThresh, redThresh);
      chrome.action.setBadgeText({ text: tabCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: color });
    });
  });

  // toggle settings
  document.getElementById('toggle-settings').addEventListener('click', function(e) {
    e.preventDefault();
    const settingsDiv = document.getElementById('settings');
    const link = document.getElementById('settings-link');
    if (settingsDiv.style.display === 'none') {
      settingsDiv.style.display = 'block';
      link.style.display = 'none';
    } else {
      settingsDiv.style.display = 'none';
      link.style.display = 'block';
    }
    return false;
  });

  // update sliders
  document.getElementById('yellowThresh').addEventListener('input', function() {
    document.getElementById('yellowValue').textContent = this.value;
  });

  document.getElementById('redThresh').addEventListener('input', function() {
    document.getElementById('redValue').textContent = this.value;
  });

  // save function
  document.getElementById('save-settings').addEventListener('click', function() {
    const yellowThresh = parseInt(document.getElementById('yellowThresh').value);
    const redThresh = parseInt(document.getElementById('redThresh').value);

    chrome.storage.sync.set({
      yellowThreshold: yellowThresh,
      redThreshold: redThresh
    });

    // hide settings
    document.getElementById('settings').style.display = 'none';
    document.getElementById('settings-link').style.display = 'block';

    // update NOW
    chrome.tabs.query({}, function(tabs) {
      const tabCount = tabs.length;
      const color = getBadgeColor(tabCount, yellowThresh, redThresh);
      chrome.action.setBadgeText({ text: tabCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: color });
    });
  });
});
