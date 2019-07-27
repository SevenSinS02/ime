import fetch from 'isomorphic-fetch';
const LOCAL_STORAGE_KEY = 'hunthostel-auth';

export const get = (uri) =>
  fetch(uri, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    }
  })
    .then(checkStatus)
    .then(parseJson);

export const post = (
  uri,
  body,
  header // console.log(uri, body);
) =>
  fetch(uri, {
    method: 'POST',
    headers: header
      ? Object.assign(
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          header
        )
      : {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
    body: JSON.stringify(body)
  })
    .then(checkStatus)
    .then(parseJson);

export const put = (uri, body, header) =>
  // console.log(uri, body);
  fetch(uri, {
    method: 'PUT',
    headers: header
      ? Object.assign(
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          header
        )
      : {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
    body: JSON.stringify(body)
  })
    .then(checkStatus)
    .then(parseJson);

export const remove = (uri, body, header) =>
  // console.log(uri, body);
  fetch(uri, {
    method: 'DELETE',
    headers: header
      ? Object.assign(
          {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          header
        )
      : {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
    body: JSON.stringify(body)
  }).then(checkStatus);

export const setToken = (token) => localStorage.setItem(LOCAL_STORAGE_KEY, token);

export const getToken = () => {
  const useLocalStorage = typeof localStorage !== 'undefined';
  if (useLocalStorage) {
    const token = localStorage.getItem(LOCAL_STORAGE_KEY);
    return token;
  }
};

function checkStatus(response) {
  return response;
}

function parseJson(response) {
  return response.json();
}
