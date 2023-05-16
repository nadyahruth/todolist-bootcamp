//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash')
const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const uri = "mongodb+srv://nadyahahmed:Frigo.031220@atlascluster.tvty4ot.mongodb.net/todolistDB?retryWrites=true&w=majority"

async function run(){
  await mongoose.connect(uri);
  console.log("You are now connected to MongoDB!");
}
run();
  //Create Schema
  const itemsSchema =  new mongoose.Schema({
    item: String,
  })
  const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
  });
//Create model
const Item = mongoose.model("Item", itemsSchema)
const List = mongoose.model("List", listSchema);
//Create Documents (items)
const item1 =  new Item({
  item:"Welcome to your ToDo list"
})
const item2 =  new Item({
  item:"Add item by pressing +"
})
const item3 =  new Item({
  item:"Hit this to delete"
})
const defaultItems = [item1,item2,item3];





// mongoose.connection.close().then(function(){
//   process.exit(0)
// })

app.get("/", function(req, res) {


  Item.find().then(function(foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems)
      res.redirect("/")
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

const item = new Item({
  item: itemName
})

if(listName === "Today"){
  item.save()
  res.redirect("/")
}else{
  List.findOne({name: listName}).then(function(foundList){
    // console.log(foundList)
    foundList.items.push(item)
    foundList.save();
    res.redirect("/"+ listName)
  })
}

});

app.post("/delete", function(req,res){
  const checkedItemId = _.capitalize(req.body.checkbox)
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(){
      res.redirect("/")
      console.log("Deleted Checked Item")
    
      })
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}).then(function(foundList){
res.redirect("/" + listName)
    })
  }


  
})
 //dynamically adding new lists
app.get("/:customListName", function(req,res){
  //get the name the usesr writes in the url
  const customListName = _.capitalize(req.params.customListName)
  //find if the list exists?
 List.findOne({name: customListName}).then(function(foundList){
  //if it doesnt, create one and redirect to that page 
  if(!foundList){
    const list = new List({
      name: customListName,
      items: defaultItems,
    });
    list.save()
  res.redirect("/"+ customListName)
  //if it does, open the page 
  }else{
    res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
  }
 })

  
  
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
