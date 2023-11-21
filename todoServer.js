const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.static("todo/public"));

const PORT = 5000;
app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    next();
})

app.route("/addList")
.post(async (req, res)=>{
    const list = req.body;
    let newList = await addListToDatabase(list);
    console.log("AFTER:");
    console.log(newList);
    res.send(newList);
})

app.route("/updateList")
.post((req, res)=>{
    const list = req.body;
    switchPositionInDB(list);
    res.send("Done");
})

app.route("/updateStrike")
.post((req, res)=>{
    const list = req.body;
    updateStrikeInDB(list);
    res.send("Done");
})


app.route("/getList")
.post(async (req, res)=>{
    let list = req.body.notes;
    list = JSON.parse(list);
  
    const toDo = mongoose.model("todo", toDoSchema);
    let userDoc = await toDo.findOne(
        {toDo_ID:1}
    );
    res.send(userDoc);
})

app.route("/deleteListItem")
.post(async (req, res)=>{
    const list = req.body;
    deleteItemFromDB(list);
    res.send("Done");
})

app.route("/deleteAllListItem")
.post(async (req, res)=>{
    deleteAllItemFromDB();
    res.send("Done");
})

app.listen(PORT, (req, res)=>{
    console.log("Listening to port ", PORT);
})



async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/ToDoDB");
}

mongoose.connection.on("error",(err)=>{
    console.log("Error in mongoose connection!!! Error: ",err);
})
mongoose.connection.on("connected",()=>{
    console.log("Mongoose is connected!!!");
})

main().catch((err)=>{console.log(err)});

const toDoSchema = new mongoose.Schema({
    toDo_ID:Number,
    toDoItem:[{
        data: String,
        position: Number,
        isStriked: Boolean
    }]
})

const toDo = mongoose.model("todo", toDoSchema);

async function addListToDatabase(list){
    list = list.notes;
    list = JSON.parse(list);

    let toDoList = await toDo.findOne(
        {toDo_ID: 1}
    );
    console.log(list);
    if(toDoList){
        toDoList.toDoItem.push({
            data: list[list.length-1].data,
            position: list[list.length-1].position,
            isStriked: list[list.length-1].isStriked
        })

        toDoList = toDoList.save();
    }else{
        console.log("NOT FOUND");
        toDoList = new toDo({
            toDo_ID : 1,
        })
        toDoList.toDoItem.push({
            data: list[list.length-1].data,
            position: list[list.length-1].position,
            isStriked: list[list.length-1].isStriked
        })
        toDoList.save();
    }
    return toDoList.toDoItem;
}

async function switchPositionInDB(list){
    list = list.notes;
    list = JSON.parse(list);

    await toDo.findOneAndUpdate(
        {toDo_ID:1},
        {$set: {toDoItem: list}},
        {upsert: true}
    ).then((upDatedDocument)=>{
        if(upDatedDocument)  return upDatedDocument;
        else {
            console.log("No document matches the provided query.");
        }

    }).catch(err=>{console.log(err)})
}

async function deleteItemFromDB(list){
    list = list.notes;
    list = JSON.parse(list);
    console.log(list);
    await toDo.findOneAndUpdate(
        {toDo_ID:1},
        {$pull: {toDoItem: {position:list} }},
        {upsert: true}
    ).then((upDatedDocument)=>{
        if(upDatedDocument)  return upDatedDocument;
        else {
            console.log("No document matches the provided query.");
        }

    }).catch(err=>{console.log(err)})
}

async function updateStrikeInDB(list){
    list = list.notes;
    list = JSON.parse(list);

    await toDo.findOneAndUpdate(
        {toDo_ID:1, "toDoItem.position":list.position},
        {$set: {"toDoItem.$.position": list.position, "toDoItem.$.data": list.data, "toDoItem.$.isStriked": list.isStriked}},
        {upsert: true}
    ).then((upDatedDocument)=>{
        if(upDatedDocument)  return upDatedDocument;
        else {
            console.log("No document matches the provided query.");
        }

    }).catch(err=>{console.log(err)})
}

async function deleteAllItemFromDB(){
  
    await toDo.findOneAndUpdate(
        {toDo_ID:1},
        {$set: {toDoItem: []}},
        {upsert: true}
    ).then((upDatedDocument)=>{
        if(upDatedDocument)  return upDatedDocument;
        else {
            console.log("No document matches the provided query.");
        }

    }).catch(err=>{console.log(err)})

}