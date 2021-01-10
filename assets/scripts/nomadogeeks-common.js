"use strict";

// See https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch(e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
    }
}

const hasStorage = storageAvailable("localStorage");
const build = document.querySelector("body").getAttribute("data-build");

export function loadFromStorage(key) {
  if (hasStorage) {
    try {
      const existingDataTimestamp = localStorage.getItem(key + ":timestamp");
      const existingData = localStorage.getItem(key);

      if (existingDataTimestamp == build && existingData) {
        console.debug(`${key} loaded from storage`);
        return JSON.parse(existingData);
      }
    } catch (e) {
      console.err("Unable to load data from storage", e);
    }
  }
}

export function storeData(key, data) {
  if (hasStorage) {
    try {
      localStorage.setItem(key + ":timestamp", build);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.err(`Unable to store ${key} in storage`, e);
    }
  }
}

export function debounce(callback, delay) {
  let timeout;
  return function () {
    const self = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      callback.apply(self, args);
    }, delay);
  };
}

export function fetchData (store, key, transform) {
  store.loading = true;
  const existingData = loadFromStorage(key);

  if (existingData) {
    store.data = existingData;
    store.error = null;
    store.loading = false;
    return Promise.resolve();
  }

  return fetch(`/assets/data/${key}.json`).then(response => {
    store.loading = false;

    if (!response.ok) {
      store.error = "Unable to retrieve " + key
      console.error("Failed to load " + key, response.status);
    } else {
      return response.json().then(data => {
        store.error = null;
        store.data = transform ? transform(data) : data[key];
        storeData(key, store.data);
      });
    }
  })
}
