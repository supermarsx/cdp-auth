# cdp-auth

A CEF Client (Chrome/Chromium) CDP authentication automation tool for mRemoteNG. Allows you to auto fill forms and login to some types of login forms automagically and using Chrome inside in mRemoteNG.

## Known bugs/limitations
- Remote debug port has to be set manually, might be solved through some sort of passthrough app in between cef and mremoteng
- Doens't handle element ids or names with commas
- Doesn't handle iframe ids with commas
- Doesn't handle usernames or with commas
- Sometimes startup is slow
- Sometimes `field_id` mode bugs out and can't login

## Quick start

1. Download the latest `cdp-auth` [release](https://github.com/supermarsx/cdp-auth/releases)
2. Download cef client binary (if you don't have it yet) you can get this one from the [official source](https://github.com/chromiumembedded/cef), [spotifycdn mirror](https://github.com/chromiumembedded/cef) [my github mirror](https://github.com/supermarsx/mirror-cef_binary_155.3.13)
3. Extract `cdp-auth`to a folder and cef client to another
4. Configure cef client as an external tool 
    cef client should be passed the following arguments: 
    `--remote-allow-origins=* --ignore-certificate-errors --remote-debugging-port=%PORT% --url=data:text/html;base64,PHA+PHNwYW4gc3R5bGU9J2ZvbnQtZmFtaWx5OiAiTHVjaWRhIENvbnNvbGUiLCBNb25hY28sIG1vbm9zcGFjZTsgZm9udC1zaXplOiAxOHB4Oyc+V2FpdGluZyBmb3IgQ0RQIGNvbm5lY3Rpb24uLi48L3NwYW4+PC9wPg==`
    pick "try to integrate" (Very important if you want it to be embedded on a tab inside mremoteng)
    the base64 message will show a nice "Waiting for CDP connection..." instead of going to google
    `ignore-certificate-errors` will allow to bypass the certificate errors automagically and open a remote debugging port on the specified port parameter on the connection.
5. Configure `cdp-auth` as an external tool and pass the following arguments: `%PORT% %HOSTNAME% %USERFIELD% %PASSWORD%`
6. Optionally configure `cdp-auth-passthrough` so console window stays hidden on execute (Recommended)
7. Configure connections like
    - Hostname/IP: Full url with protocol and port like: https://examplemgmt.com:9000
    - Port: Remote debug port (has to be unqiue to each connection, minor thing i couldn't see a workaround)   
    - Password: User password as normal   
    - Protocol: External Tool   
    - External Tool: (whatever you set as your cef client)   
    - External Tool Before: (whatever you set as your cdp-auth)   
    - User field: Depending on the type of authentication this field will look differently (refer to types of authentication)
   
9. Enjoy
    
### Types of authentication
Your "User Field" will look differently depending on the type of login form:

--

Basic Authentication: `basic_auth`: Basic authentication the uses a small box on top of the browser, common in some routers and switches
- format: `basic_auth,USERNAME`
- example: `basic_auth,admin`

--

Form Field ID: `field_id`: Form authentication using username and password input IDs
- format: `field_id,USERNAME,USERNAMEFIELDID,PASSWORDFIELDID`
- example: `field_id,administrator,usernameField,passwordField`

--

Form Field Name: `field_name`: Form authentication using username and password input names
- format: `field_name,USERNAME,USERNAMEFIELDNAME,PASSWORDFIELDNAME`
- example: `field_name,administrator,user,pass`

--

Form Field ID (typed): `field_id_typing`: Form authentication using username and password input IDs but values are "typed" in (Alternative when `field_id` doesn't work)
- format: `field_id_typing,USERNAME,USERNAMEFIELDID,PASSWORDFIELDID`
- example: `field_id_typing,administrator,usernameField,passwordField`

--

Form Field ID on Iframe: `field_id+iframe`: Form authentication using username and password input IDs when they're inside an iframe ID
- format: `field_id+iframe,USERNAME,USERNAMEFIELDID,PASSWORDFIELDID,IFRAMEID`
- example: `field_id+iframe,administrator,usernameField,passwordField,loginFrame`


You'll need to check the specific form you want to login using Inspect and see what type of form it is and whats the most adequate solution.

## Getting started with source
1. Clone the repository
2. Install modules using ` npm install `
3. .…
4. Profit?

You can do npm start and pass arguments with it, you should because it doesn't really work otherwise.

Also you might need to recreate the `sea` folder and `dist` folder inside of it for the build to be successful.

`cdp-auth-passthrough.au3` is a small passthrough that hide the SEA console window on launch, very useful when not debugging to avoid pesky windows popping up.

### Auxiliary npm scripts
```
  "scriptsComments": {
    "start": "Run cdp-auth with arguments (recommended for debugging)",
    "tsbuild":  "Clean build typescript to javascript",
    "esbuild": "Create a commonjs version of the app to be built into a SEA",
    "sea-build": "Executes the builder script",
    "sea-build-full": "Run all necessary build steps"
  },
```

## License
Distributed under MIT License. See `license.md` for more information.
