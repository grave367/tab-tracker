// color interpolate
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

// badge update
function updateBadge() {
  chrome.storage.sync.get(['yellowThreshold', 'redThreshold'], function(items) {
    const yellowThresh = items.yellowThreshold || 20;
    const redThresh = items.redThreshold || 50;

    chrome.tabs.query({}, function(tabs) {
      const tabCount = tabs.length;
      const color = getBadgeColor(tabCount, yellowThresh, redThresh);
      chrome.action.setBadgeText({ text: tabCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: color });
    });
  });
}

// do the thing on startup
chrome.runtime.onStartup.addListener(updateBadge);
chrome.runtime.onInstalled.addListener(updateBadge);

// also only do thing when newtab
chrome.tabs.onCreated.addListener(updateBadge);
chrome.tabs.onRemoved.addListener(updateBadge);

// do thing on settings change
chrome.storage.onChanged.addListener(function(changes) {
  if (changes.yellowThreshold || changes.redThreshold) {
    updateBadge();
  }
});
