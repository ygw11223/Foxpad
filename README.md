# Collaborative-Drawing

## Requirements

- cmake
- imagemagick
- ghostscript
- poppler-utils

## Start server
instructons for installing imagemagick-7: 
```
wget https://www.imagemagick.org/download/ImageMagick.tar.gz
tar xf ImageMagick.tar.gz
cd ImageMagick-7*
./configure
make
make install
sudo ldconfig /usr/local/lib
#chcek if success
identify -version
make check
```
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
