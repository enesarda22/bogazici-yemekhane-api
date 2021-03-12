require('dotenv').config();
const express = require("express");
const request = require('request');
const mongoose = require("mongoose");
const _ = require("lodash");
const cheerio = require('cheerio');

const app = express();
// mongoose.connect("mongodb+srv://admin-enes:" + process.env.PASSWORD + "@cluster0.drsol.mongodb.net/cafeteriaDB", {
//   useNewUrlParser: true
// });
mongoose.connect("mongodb://localhost:27017/cafeteriaDB", {
  useNewUrlParser: true
});

const foodSchema = new mongoose.Schema({
  name: String,
  category: String,
  cal: String,
  ingredients: [String]
});
const Food = mongoose.model("food", foodSchema);

const mealSchema = new mongoose.Schema({
  foods: [foodSchema]
});
const Meal = mongoose.model("meal", mealSchema);

const daySchema = new mongoose.Schema({
  date: String,
  meals: [mealSchema]
});
const Day = mongoose.model("day", daySchema);

const url = "https://yemekhane.boun.edu.tr/aylik-menu";
const today = new Date().toISOString().slice(0, 10);

function addDay(date, _callback) {

  request(url, function(err, res, body) {
    const $ = cheerio.load(body);
    const day = Number(date.slice(8, 10));
    const dinnerCount = day * 2 - 2;
    const lunchCount = day * 2 - 1;


    Food.find({
      $or: [{
          name: _.startCase($(".views-field.views-field-field-anaa-yemek:eq(" + dinnerCount + ")").text())
        },
        {
          name: _.startCase($(".views-field.views-field-field-yardimciyemek:eq(" + dinnerCount + ")").text())
        },
        {
          name: _.startCase($(".views-field.views-field-field-ccorba:eq(" + dinnerCount + ")").text())
        },
        {
          name: _.startCase($(".views-field.views-field-field-aperatiff:eq(" + dinnerCount + ")").text())
        },
        {
          name: _.startCase($(".views-field.views-field-field-vejetarien:eq(" + dinnerCount + ")").text())
        }
      ]
    }, function(err, foundFoods) {
      const dinnerMeal = new Meal({
        foods: foundFoods
      });

      Food.find({
        $or: [{
            name: _.startCase($(".views-field.views-field-field-anaa-yemek:eq(" + lunchCount + ")").text())
          },
          {
            name: _.startCase($(".views-field.views-field-field-yardimciyemek:eq(" + lunchCount + ")").text())
          },
          {
            name: _.startCase($(".views-field.views-field-field-ccorba:eq(" + lunchCount + ")").text())
          },
          {
            name: _.startCase($(".views-field.views-field-field-aperatiff:eq(" + lunchCount + ")").text())
          },
          {
            name: _.startCase($(".views-field.views-field-field-vejetarien:eq(" + lunchCount + ")").text())
          }
        ]
      }, function(err, foundFoods) {
        const lunchMeal = new Meal({
          foods: foundFoods
        });

        const newDay = new Day({
          date: date,
          meals: [dinnerMeal, lunchMeal]
        });

        newDay.save(function(err) {
          if (!err) {
            console.log("successfully saved");
          }
        });
      });
    });
  });
}

function addFood(category, name, _callback) {
  const route = "https://yemekhane.boun.edu.tr/" + category + "/" + _.kebabCase(name);

  request(route, function(err, res, body) {

    const $ = cheerio.load(body);
    const calories = $(".field-item:eq(0)").text();
    const ingredientsArr = [];

    for (let i = 1; i < $(".field-item").length; i++) {
      ingredientsArr.push($(".field-item:eq(" + i + ")").text());
    }

    Food.findOne({
      name: name
    }, function(err, foundFood) {
      if (!foundFood) {
        const newFood = new Food({
          name: name,
          category: category,
          cal: calories,
          ingredients: ingredientsArr
        });
        newFood.save();
      }
    });

  });
  _callback();
}

function setMonth(_callback) {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  for (let d = new Date(); d <= nextMonth; d.setDate(d.getDate() + 1)) {
    addDay(d.toISOString().slice(0, 10), function() {
      console.log(d + " is successfully set");
    });
  }
  _callback();
}

function setFoods(category, _callback) {
  let urlCategory = "";
  switch (category) {
    case "ana-yemekler":
      urlCategory = "anaa-yemek";
      break;
    case "corbalar":
      urlCategory = "ccorba";
      break;
    case "vejetaryenvegan":
      urlCategory = "vejetarien";
      break;
    case "yardimci-yemekler":
      urlCategory = "yardimciyemek";
      break;
    case "secmeliler":
      urlCategory = "aperatiff";
      break;
    default:
      urlCategory = "anaa-yemek";
  }

  request(url, function(err, res, body) {
    const $ = cheerio.load(body);

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    for (let d = new Date(now.getFullYear(), now.getMonth(), 2); d <= nextMonth; d.setDate(d.getDate() + 1)) {
      const day = Number(d.toISOString().slice(8, 10));

      const dinnerCount = day * 2 - 2;
      const lunchCount = day * 2 - 1;

      const nameDinner = _.startCase($(".views-field.views-field-field-" + urlCategory + ":eq(" + dinnerCount + ")").text());
      const nameLunch = _.startCase($(".views-field.views-field-field-" + urlCategory + ":eq(" + lunchCount + ")").text());

      Food.findOne({
        name: nameDinner
      }, function(err, foundFood) {
        if (!foundFood) {
          addFood(category, nameDinner, function() {
            console.log("succesfully added food");
          });
        }
      });
      Food.findOne({
        name: nameLunch
      }, function(err, foundFood) {
        if (!foundFood) {
          addFood(category, nameLunch, function() {
            console.log("succesfully added food");
          });
        }
      });
    }
  });
  _callback();
}


app.get("/", function(req, res) {
  res.write("GET to /meals\n");
  res.write("to /meals/:date \t");
  res.write("date should be of the form YYYY-MM-DD\n");
  res.write("to /foods\n");
  res.write("to /foods/:category\t");
  res.write("allowed categories are: \"ana-yemekler\", \"corbalar\", \"vejetaryenvegan\", \"yardimci-yemekler\", \"secmeliler\"\n\n");
  res.write("POST to /foods:categories\n");
  res.send();
});

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
            if (foundDays.length === 0) {
              setMonth(function() {
                console.log("succesfully set the month");
                setTimeout(function() {
                  res.redirect("/meals");
                }, 3000);
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
  Day.findOne({
    date: req.params.date
  }, function(err, foundDay) {
    if (foundDay) {
      res.send(foundDay);
    } else {
      res.redirect("/meals");
    }
  });

});

app.get("/foods", function(req, res) {
  Food.find({}, function(err, foundFoods) {
    if (err) {
      res.send(err);
    } else {
      res.send(foundFoods);
    }
  })
});

app.get("/foods/:category", function(req, res) {

  const category = req.params.category

  if (category !== "ana-yemekler" && category !== "corbalar" && category !== "vejetaryenvegan" && category !== "yardimci-yemekler" && category !== "secmeliler") {
    res.redirect("/meals");
  } else {
    Food.find({
      category: category
    }, function(err, foundFoods) {
      if (err) {
        res.send(err);
      } else {
        res.send(foundFoods);
      }
    });
  }

});

app.post("/foods/:category", function(req, res) {

  const category = req.params.category;

  if (category !== "ana-yemekler" && category !== "corbalar" && category !== "vejetaryenvegan" && category !== "yardimci-yemekler" && category !== "secmeliler") {
    res.redirect("/meals");
  } else {
    setFoods(category, function() {
      res.send("succefully updated category " + category);
    });
  }


});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("listening on port 3000");
});
