"use strict";

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

  return fetch(`/assets/data/${key}.json`).then(response => {
    store.loading = false;

    if (!response.ok) {
      store.error = "Unable to retrieve " + key
      console.error("Failed to load " + key, response.status);
    } else {
      return response.json().then(data => {
        store.error = null;
        store.data = transform ? transform(data) : data[key];
      });
    }
  })
}
