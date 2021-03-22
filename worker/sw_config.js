const baseDigest = 'OUxSoXJYTk/QcCd82Pmy57V89fi7IIKrKjNVMp34arKqM13EdoZ0UKOm4UADWQ47+9jFdBNOqOyUq+V3q2ijfg==',
origin = location.origin,
base = new Response('<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><script src="./modules/blotter.js"></script><script src="./main.mjs" type="module"></script></head></html>', {
  status: 200,
  statusText: 'ok',
  headers: {
    "Content-Length": "157",
    "Content-Security-Policy": "",
    "Content-Type": "text/html; charset=utf-8",
    "Digest": "sha3-512="+ baseDigest,
    "ETag": baseDigest,
    "Feature-Policy": "accelerometer 'none';autoplay 'none';camera 'none';document-domain 'none';encrypted-media 'none';fullscreen 'none';geolocation 'none';gyroscope 'none';magnetometer 'none';microphone 'none';xr-spatial-tracking 'none';usb 'none'; sync-xhr 'self';picture-in-picture 'none';payment 'none';midi 'none';",
    "Origin": origin,
    "Server": "anon",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "TK": "N",
    "X-Content-Type-Options": "nosniff",
    "X-DNS-Prefetch-Control":"off",
    "X-Frame-Options":"DENY",
    "X-XSS-Protection": "1; mode=block"
  }
}),
reject = new Response(null, {
  status: 405,
  statusText: 'Method Not Allowed'
})
