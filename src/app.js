
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require("../modules/date");
const mongoConfig = require("./config/db_config");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");


// ---- DATABASE ----
mongoose.connect(`mongodb+srv://admin-nk:${mongoConfig.password}@clustertodo.5chyi.mongodb.net/todoDB`, { useNewUrlParser: true });

const itemsSchema = {
    name: { type: String }
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
// ------------------

function seedData() {
    Item.insertMany([
        {
            name: "Welcome to your to-do list!"
        },
        {
            name: "Hit the + button to add a new item."
        },
        {
            name: "<-- Hit this to delete an item."
        }
    ], function(err) {
        logMessage = (err) ? err : "Sucessfully saved default items to database.";
        console.log(logMessage);
    });
}

function isHomePage(listName) {
    return listName === date.getDate();
}

app.get("/", function(req, res) {
    Item.find({}, function(err, tasks) {
        if(err) {
            console.log(err);
        } else if(tasks.length === 0) {
            seedData();
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: date.getDate(),
                tasks: tasks
            });
        }
    });
});

app.post("/", function(req, res) {
    const { newItemName, listName } = req.body;
    const redirectPath = (isHomePage(listName)) ? "/" : `/${listName}`;

    if(newItemName.length > 0) {
        const newItem = new Item({
            name: newItemName
        });

        if (isHomePage(listName)) {
            newItem.save();
        } else {
            List.findOne({ name: listName }, function(err, foundList) {
                foundList.items.push(newItem);
                foundList.save();
            });
        }
    }
    
    res.redirect(redirectPath);
});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);
    
    List.findOne({ name: customListName }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: []
                });
                
                list.save();
                res.redirect(`/${customListName}`);
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    tasks: foundList.items
                });
            }
        }
    });
});

app.post("/delete", function(req, res) {
    const checkedTaskId = req.body.checkbox;
    const listName = req.body.listName;
    const redirectPath = (isHomePage(listName)) ? "/" : `/${listName}`;

    if (isHomePage(listName)) {
        Item.findByIdAndRemove({_id: checkedTaskId}, function(err) {
            const logMessage = (err) ? err : "Successfully deleted task.";
            console.log(logMessage);
        });
    } else {
        List.findOneAndUpdate({ name: listName }, {$pull: { items: { _id: checkedTaskId }}}, function(err) {
            logMessage = (err) ? err : "Successfully deleted task.";
            console.log(logMessage);
        });
    }

    res.redirect(redirectPath);
});


app.listen(process.env.PORT || 3000, function() {
    // console.log("Server is listening on port 3000.");
    console.log("Server started successfully...");
});
