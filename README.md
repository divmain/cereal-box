# cereal-box

Painless object (de)serialization with simple schemas, optimized for speed (and not encoded size).

## Quick start

```javascript
import { uint, string, json, u8 } from "cereal-box";

const { encode, decode } = codec({
  id: uint,
  url: string,
  method: string,
  headers: {
    accept: string,
    "user-agent": string
  }
});

const encoded = encode({
  id: 2013820,
  url: "/some/path?with=query",
  method: "GET",
  headers: {
    accept: "application/json",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/12.0"
  }
});

console.log(encoded);
// Uint8Array [ 4 0 0 0 124 186 30 0 42 0 0 0 47 0 115 0 111 0 109 0 101 0 47 0 112 0 97 0
// 116 0 104 0 63 0 119 0 105 0 116 0 104 0 61 0 113 0 117 0 101 0 114 0 121 0 0 0 6 0 0 0
// 71 0 69 0 84 0 0 0 176 0 0 0 32 0 0 0 97 0 112 0 112 0 108 0 105 0 99 0 97 0 116 0 105
// 0 111 0 110 0 47 0 106 0 115 0 111 0 110 0 136 0 0 0 77 0 111 0 122 0 105 0 108 0 108 0
// 97 0 47 0 53 0 46 0 48 0 32 0 40 0 88 0 49 0 49 0 59 0 32 0 76 0 105 0 110 0 117 0 120
// 0 32 0 120 0 56 0 54 0 95 0 54 0 52 0 59 0 32 0 114 0 118 0 58 0 49 0 50 0 46 0 48 0 41
// 0 32 0 71 0 101 0 99 0 107 0 111 0 47 0 50 0 48 0 49 0 48 0 48 0 49 0 48 0 49 0 32 0 70
// 0 105 0 114 0 101 0 102 0 111 0 120 0 47 0 49 0 50 0 46 0 48 0 ]

console.log(JSON.stringify(decode(encoded), null, 2));
// {
//   "id": 2013820,
//   "url": "/some/path?with=query",
//   "method": "GET",
//   "headers": {
//     "accept": "application/json",
//     "user-agent": "Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/12.0"
//   }
// }
```

## Valid field types

The following field types are supported:

- `uint`: An unsigned integer.
- `string`: A string.
- `json`: A simple, hierarchical data-structure that can be JSON serialized.
- `u8`: A Uint8Array instance.

Additionally, hierarchical data-structures are supported by passing an object where the values are valid field types.
