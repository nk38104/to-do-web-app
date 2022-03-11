
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require("../modules/date");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");


// ---- DATABASE ----
mongoose.connect("mongodb://localhost:27017/todoDB", { useNewUrlParser: true });

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
    const { newItemName, list } = req.body;
    let redirectPath = (list === "Work") ? "/work" : "/";

    if(newItemName.length > 0) {
        const newItem = new Item({
            name: newItemName
        });

        if (list === "Work") {
            workTasks.push(newItem);
        } else {
            newItem.save();
        }
    }
    
    res.redirect(redirectPath);
});

app.get("/:customListName", function(req, res) {
    const customListName = req.params.customListName;
    
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
    taskId = req.body.checkbox;

    Item.findByIdAndRemove({_id: taskId}, function(err) {
        logMessage = (err) ? err : "Successfully deleted task.";
        console.log(logMessage);
    });

    res.redirect("/");
});


// app.get("/work", function(req, res) {
//     res.render("list", { listTitle: "Work List", tasks: workTasks });
// });


app.listen(3000, function() {
    console.log("Server is listening on port 3000.");
});
