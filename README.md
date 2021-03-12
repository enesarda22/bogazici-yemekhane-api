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

|                  | GET                                          | POST             |
| ---------------- | -------------------------------------------- | ---------------- |
| /meals           | fetches all meals until the end of the month | -                |
| /foods           | fetches all                                  | -                |
| /meals/:date     | fetches all meals in specified day           | -                |
| /foods/:category | fetches all foods in specified category      | updates category |

### Example site

https://bogazici-yemekhane-api.herokuapp.com/

https://bogazici-yemekhane-api.herokuapp.com/foods

https://bogazici-yemekhane-api.herokuapp.com/meals
