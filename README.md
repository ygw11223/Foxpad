# Foxpad

Foxpad is a web application of collaborative drawing, aiming to provide solutions for those in need of visualization during a conversation. Often times topics and specifics are difficult to convey through words and can be expressed more efficiently through sketches. This application will allow collaborators to join through a url and draw on a shared canvas. Real-time changes will be displayed to all members in the room so that everyone can be on the same “page” to allow for fluid discussion and unanimous understanding.

This project is developed at UC Davis for a 2-quarter computer science and engineering senior design project course(ECS 193AB). The course is instructed by Professor Xin Liu, and this project is mentored by Googler Travis Heppe and Naji Dmeiri.

## Main features

1. Basic drawing capabilities
2. Join canvas room through sharable link 
3. Support multiple contributors
4. Dashboard to view previous canvases
5. Multiple canvases within a room
6. View information of other collaborators in a room
7. Uploading high resolution image/pdf
8. View other users’ pen position
9. Mini viewport to see own view port position on canvas as well as others
10. Hover on edge to move view port
11. Follow another user by click on user card.
12. Mobile version support.

## Browser support

Tested on Google Chrome

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
