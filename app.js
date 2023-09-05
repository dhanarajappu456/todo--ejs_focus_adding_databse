const bodyParser = require("body-parser");
const express = require("express");
const date = require(__dirname + "/date.js");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

const workItems = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connect to db
mongoose.connect("mongodb+srv://admin-dhanaraj:Test123@cluster0.w6qzkle.mongodb.net/todolistDB");
//create schema then , create the model out of that schema
const itemSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("item", itemSchema);
//create the default document
const item1 = new Item({ name: "item1" });
const item2 = new Item({ name: "item2" });
const item3 = new Item({ name: "item3" });

const listSchema = {
  name: String,
  itemList: [itemSchema],
};

const List = new mongoose.model("list", listSchema);

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "work-List", itemsList: workItems });
// });

app.get("/", function (req, res) {
  let day = date.getDay();
  console.log(day);
  const itemList = Item.find({})
    .then((found) => {
      if (found.length === 0) {
        const defaultItem = [item1, item2, item3];

        Item.insertMany(defaultItem)
          .then((res) => console.log("success  inserting defaullt docs"))
          .catch((err) => console.log("there is error"));
        res.redirect("/");
      }
      else{

      res.render("list", { listTitle: "Today", itemsList: found });

      }
    })
    .catch((err) => console.log("there is error", err));
});

app.get("/:listName", (req, res) => {
  const custListName = _.capitalize(req.params.listName);
  console.log("list name:", req.params.listName);
  // to avoid  the favicon request
  if (custListName !== "Favicon.ico") {
    List.findOne({ name: custListName })
      .then((foundListObject) => {
        if (!foundListObject) {
          const list = new List({
            name: custListName,
            itemList: [item1, item2, item3],
          });

          list.save();
          //redirect
          //to this same endpoint
          res.redirect("/" + custListName);
        } else {
          res.render("list", {
            listTitle: custListName,
            itemsList: foundListObject.itemList,
          });
        }
      })
      .catch((err) => console.log("result not found", err));
  }
});
//handles both today and custom list
app.post("/", function (req, res) {
  const listName = req.body.buttonname;
  const itemName = req.body.textname;

  if (listName === "Today") {
    const item = new Item({
      name: itemName,
    });

    item.save();
    res.redirect("/");
  } else {
    const listDoc = List.findOneAndUpdate(
      { name: listName },
      { $push: { itemList: { name: itemName } } },
      { new: true }
    )
      .then((foundList) => {
        console.log(foundList);
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log("error...", err);
      });
  }
});

app.post("/delete", (req, res) => {
  const checkeItemId = req.body.checks;
  const checkListName = req.body.listName;
  console.log(
    req.body,
    "checkitemid",
    checkeItemId,
    "checklistName",
    checkListName
  );

  //delete the doc from the item collection
  if (checkListName === "Today") {
    Item.findByIdAndRemove(checkeItemId)
      .then((removed) => console.log("removed the item,", removed))
      .catch((err) => {
        conosle.log("error happened", err);
      });

    res.redirect("/");
  }
  // remove the  item from the list of the  doc  representing custom todo list
  else {
    List.findOneAndUpdate(
      { name: checkListName },
      { $pull: { itemList: { _id: checkeItemId } } }
    )
      .then((removed) => {
        console.log("removed", removed, "from", "list");
      })
      .catch((err) => {
        console.log(err);
      });

    res.redirect("/" + checkListName);
  }
});

app.post("/work", function (req, res) {
  items.push(req.body.textname);

  res.redirect("/work");
});
app.listen(3000, function () {
  console.log("server running on port  3000");
});
