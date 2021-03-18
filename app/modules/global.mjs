const global = {
  cl: console.log,
  ce: console.error,
  js: JSON.stringify,
  jp: JSON.parse,
  LS: localStorage,
  SS: sessionStorage,
  headers: {
    json: {
      'Accept-Encoding': 'gzip',
      'Sec-Fetch-Dest': 'object',
      'Sec-Fetch-mode': 'same-origin',
      'Sec-Fetch-Site': 'same-origin'
    },
    json_cors: {
      'Accept-Encoding': 'gzip',
      'Sec-Fetch-Dest': 'object',
      'Sec-Fetch-mode': 'cors',
      'Sec-Fetch-Site': 'cross-site'
    },
    css_cors: {
      'Accept-Encoding': 'gzip',
      'Sec-Fetch-Dest': 'style',
      'Sec-Fetch-mode': 'cors',
      'Sec-Fetch-Site': 'cross-site'
    }
  }
}

export { global };
