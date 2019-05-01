# Collaborative-Drawing

## Requirements

- cmake
- [imagemagick](https://imagemagick.org/script/install-source.php)

## Start server

First build front end.
```
cd client
npm i && npm run build
```
Then go back to root directory and run server.
```
cd ..
npm i && npm start
```
The server will listen to port 3000.

Visit http://host:3000 and start drawing!
