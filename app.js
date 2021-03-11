const express = require("express");
const ejs = require("ejs");
const HTMLParser = require('node-html-parser');
const request = require('request');
const mongoose = require("mongoose");

const app = express();
mongoose.connect("mongodb://localhost:27017/cafeteriaDB", {
  useNewUrlParser: true
});

const mealSchema = new mongoose.Schema({
  main: String,
  carb: String,
  soup: String,
  app: String,
  veggie: String
});
const Meal = mongoose.model("meal", mealSchema);

const daySchema = new mongoose.Schema({
  date: String,
  meals: [mealSchema]
});
const Day = mongoose.model("day", daySchema);

const url = "https://yemekhane.boun.edu.tr/aylik-menu";
const today = new Date().toISOString().slice(0, 10);
const thisMonth = new Date().toISOString().slice(0, 8);

function findFood(meal, part, day, _callback) {
  let x;
  let y;

  request(url, function(err, res, body) {
    const root = HTMLParser.parse(body);
    switch (meal) {
      case "dinner":
        x = 1;
        break;
      case "lunch":
        x = 2;
        break;
      default:
        x = 1;
    }
    switch (part) {
      case "main":
        y = 7;
        break;
      case "carb":
        y = 11;
        break;
      case "soup":
        y = 5;
        break;
      case "app":
        y = 13;
        break;
      case "veggie":
        y = 9;
        break;

      default:
        y = 7;

    }

    const str = '#aylik_menu-' + thisMonth + day + '-0 > div > div:nth-child(' + x + ') > div > div';
    const foodName = root.querySelector(str).childNodes[1].childNodes[y].childNodes[1].childNodes[0].childNodes[0].rawText;
    _callback(foodName);
  });
}

function addDay(date, _callback) {

  request(url, function(err, res, body) {
    const root = HTMLParser.parse(body);
    const dinnerStr = '#aylik_menu-' + date + '-0 > div > div:nth-child(1) > div > div';
    const dinnerMeal = new Meal({
      main: root.querySelector(dinnerStr).childNodes[1].childNodes[7].childNodes[1].childNodes[0].childNodes[0].rawText,
      carb: root.querySelector(dinnerStr).childNodes[1].childNodes[11].childNodes[1].childNodes[0].childNodes[0].rawText,
      soup: root.querySelector(dinnerStr).childNodes[1].childNodes[5].childNodes[1].childNodes[0].childNodes[0].rawText,
      app: root.querySelector(dinnerStr).childNodes[1].childNodes[13].childNodes[1].childNodes[0].childNodes[0].rawText,
      veggie: root.querySelector(dinnerStr).childNodes[1].childNodes[9].childNodes[1].childNodes[0].childNodes[0].rawText
    });

    const lunchStr = '#aylik_menu-' + date + '-0 > div > div:nth-child(2) > div > div';
    const lunchMeal = new Meal({
      main: root.querySelector(lunchStr).childNodes[1].childNodes[7].childNodes[1].childNodes[0].childNodes[0].rawText,
      carb: root.querySelector(lunchStr).childNodes[1].childNodes[11].childNodes[1].childNodes[0].childNodes[0].rawText,
      soup: root.querySelector(lunchStr).childNodes[1].childNodes[5].childNodes[1].childNodes[0].childNodes[0].rawText,
      app: root.querySelector(lunchStr).childNodes[1].childNodes[13].childNodes[1].childNodes[0].childNodes[0].rawText,
      veggie: root.querySelector(lunchStr).childNodes[1].childNodes[9].childNodes[1].childNodes[0].childNodes[0].rawText
    });

    const newDay = new Day({
      date: date,
      meals: [dinnerMeal, lunchMeal]
    });

    newDay.save();
  });
  _callback();
}

function setMonth(_callback) {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  for (var d = new Date(); d <= nextMonth; d.setDate(d.getDate() + 1)) {
    addDay(d.toISOString().slice(0, 10), function() {
      console.log(d + " is successfully set");
    });
  }
  _callback();
}



//request targeting this month
app.get("/meals", function(req, res) {

  Day.deleteMany({
      date: {
        $lt: today
      }
    },
    function(err) {
      if (!err) {
        Day.find({}, function(err, foundDays) {
          if (err) {
            res.send(err);
          } else {
            if(foundDays.length === 0) {
              setMonth(function() {
                console.log("succesfully set the month");
                setTimeout(function() {
                  res.redirect("/meals");
                },3000);
              });
            } else {
              res.send(foundDays);
            }

          }
        });
      } else {
        console.log(err);
      }
    }
  );

});

//request targeting specific date
app.get("/meals/:date", function(req, res) {
  console.log(req.params.date);
});



app.listen(3000, function() {
  console.log("listening on port 3000");

  findFood("lunch", "veggie", "10", function(foundFood) {
    console.log(foundFood);
  });

});
