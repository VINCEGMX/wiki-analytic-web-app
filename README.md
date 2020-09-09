# Project Title

Wiki analytic web app

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software
1. node.js (following link provide ui installer for different OS)
```
https://nodejs.org/en/download
```
2. npm
```
It is included in the lastest node.js installer
```
3. mongodb (following link provide installation tutorials for different OS)
```
https://docs.mongodb.com/manual/installation/
```
### Deployment
#### Following commands are for Linux based system
#### Make sure currently under the wiki-analytic-web-app dir
1. Install modules
```
npm install
```
2. Give authorities to scripts files (end with .sh)
```
chmod u+x dataimport.sh stringToDate.sh
```
3. Run script dataimport to import dataset to Mongodb
```
./dataimport.sh
```
4. Run script stringToDate to convert String timestamp to Date type (this may take a while)
```
./stringToDate.sh
```
5. Connect to mongodb server (replace the path below to the local mongodb directory)
```
mongod --dbpath path
```

## Running the tests

### Open the repo in code eidtor and make sure the dir is at /Group20
Run index.js with nodejs 
```
node .\index.js
```

### Open browser (recommeded chrome)

Open page with the following link

```
http://localhost:3000/
```

