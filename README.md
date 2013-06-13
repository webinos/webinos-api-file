webinos: File API (incl. Writer, and Directories and System)
============================================================

# Specifications

*   File API <http://www.w3.org/TR/FileAPI/>
*   File API: Writer <http://www.w3.org/TR/file-writer-api/>
*   File API: Directories and System <http://www.w3.org/TR/file-system-api/>

# Shares

We are now introducing the concept of shares, i.e., a shared folder on one of the supported file systems (currently local and dropbox). At the moment, shares are configured in the `config.json`. This will change however, when opinions about configuration of webinos eventually converge.

## Local shares

Sharing a folder from the local file system requires creating a named share including the full path to the folder. Here's an example (excerpt):

```javascript
{ "name" : "file"
, "params" :
  { "local" :
    { "shares" :
      [ { "name" : "desktop"
        , "path" : "/path/to/desktop"
        }
      ]
    }
  }
}
```

## Dropbox shares

In addition to creating a named share including the full path to the folder rooted at the webinos app folder, sharing a folder from a dropbox file system requires an access token, which can be obtained as follows (copied from sintaxi/node-dbox).

### Step 1

Create an app using application credentials provided by dropbox.

```javascript
var dbox = require("dbox")
var app = dbox.app({ "app_key": "38j04m9q86j2zva", "app_secret": "pzl7f411nu6dy4p" })
```

### Step 2

Authorization is a three step process.

a) Get a request token.

```javascript
var request_token
app.requesttoken(function (status, value) {
  request_token = value
})
```

b) Visit the URL to grant authorization.

`https://www.dropbox.com/1/oauth/authorize?oauth_token=#{ request_token.oauth_token }`

c) Generate the access token with the request token.

```javascript
app.accesstoken(request_token, function (status, access_token) {
  console.log(access_token)
})
```

### Step 3

Configure webinos to use the obtained access token and set up the desired shares (excerpt):

```javascript
{ "name" : "file"
, "params" :
  { "dropbox" :
    { "access_token" :
      { "oauth_token_secret" : "a12bc3d4e5fghi6"
      , "oauth_token" : "ab1c2defghijklm"
      , "uid" : "1234567"
      }
    , "shares" :
      [ { "name" : "full"
        , "path" : "/"
        }
      ]
    }
  }
}
```

Generating temporary URLs and serving underlying content from a dropbox file system is delegated to dropbox.
