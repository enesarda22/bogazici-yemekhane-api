# bogazici-yemekhane-api
A RESTful api of bogazici university cafeteria menu.

## Technologies

- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com)

## Setup

> This project requires [Node.js](https://nodejs.org/en/) to build, if you don't have node installed on your device, please refer to installation instructions [here](https://nodejs.org/en/download/).

### Install dependencies

```bash
npm i
```

## Use

Setup a mongodb server and run app.js typing

```bash
node app.js
```

A get request to https://localhost:3000/meals fetches all the meals until the end of the month.

A get request to https://localhost:3000/meals/:date fetches meals for the specified date. Date should of the form: YYYY-MM-DD
