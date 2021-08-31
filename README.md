![alt logo](https://github.com/LukeAz/Hackerfill/blob/main/docs/logo.png)
# Hackerfill
Web programming school project. Hackerfill is a platform that provides a collection of articles regarding cybersecurity. 
This project can be viewed at https://hackerfill.lukeaz.ml
In case of abuse or malfunction contact me on the email indicated in the profile.

## General info
This project was developed for a school project at Eastern Piedmont University during the web programming course.

## Technologies
Project includes:
* Nodejs programming language
* Express framework for the web server
* JWT token for the authentication system
* Server side rendering using ejs
* Sqlite3 for database
* Markdown editor for creating articles, editing and displaying them
* Using DOMPurify to avoid xss when converting markdown to html
* Using char.js for leaderboard
* Using fontawesome for some icons

# - CONFIGURE THE APPLICATION
Certificates for authentication by JWT and for HTTPS are already in place.

### Generate certificates for JWT authentication
1. enter with the terminal in the /config folder
2. have openssl installed and configured in the path
3. generate certificates with `./generatejwtRS256Key.sh` by bash

### Generate certificates for HTTPS
1. enter with the terminal in the /config folder
2. have openssl installed and configured in the path
3. generate certificates with `./generateMyCa.sh` by bash

### Port used by express
1. open the config.json file located in /config.
2. change the PORT field to the desired port.
3. if you use the docker the command to build the container must contain the correct port forwadding.

### Argon2i Configuration
1. open the config.json file located in /config.
2. modify the argon parameters following the correct specifications indicated on the official site (in case of modification of these parameters it will no longer be possible to access users already registered because the hash of the password saved in the database will no longer be valid).

### Deleting hackerfill.db file
* If the database is deleted it will be automatically initialized and filled (attention: the folders of the articles and the associated materials will not be recreated, for the repopulation by default the articles folder should not be deleted).


# - START THE APPLICATION

### Standard method:
1. have nodejs installed
2. open the terminal and move to the project folder.
3. have gcc compiler installed and then install node-gyp with: `npm install -g node-gyp`.
4. install dependencies with `npm install`.
5. start the application with `npm start`.

### Using the docker from cli:
1. have docker installed.
2. open terminal and move to the project folder.
3. build the container image: `sudo docker build . -t luca/hackerfill`.
4. build the container (it will be started automatically): `sudo docker run -p 3000:3000 --name Hackerfill -d luca/hackerfill`.
5. see running containers: `sudo docker ps`.
6. start container: `docker start [container id]`.
7. shut down container: `docker stop [container id]`.
8. remove container: `docker rm [container id]`.
9. see the built images: `docker images -a`.
10. delete image: `docker rmi luca/hackerfill`.

# - Users

### Here are the users present by default:

| Username  | Password  | Ruolo  |
|---|---|---|
| lukeaz  | Hackerfill_00  | advertiser  |
| radolfo  | Hackerfill_00  | advertiser  |
| giova | Hackerfill_00  | advertiser  |
| granfranco | Hackerfill_00  | advertiser  |
| tommy | Hackerfill_00  | advertiser  |
| giuse |  Hackerfill_00 | advertiser  |
| marcello | Hackerfill_00  | advertiser  |
| paolo |  Hackerfill_00 | advertiser  |
| gianluca | Hackerfill_00  | advertiser  |
| virgilio | Hackerfill_00  | reader  |
| luigi | Hackerfill_00  | reader  |

![alt profile](https://github.com/LukeAz/Hackerfill/blob/main/docs/profile.png?raw=true)
