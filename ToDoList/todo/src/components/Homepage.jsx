import React from "react";

function Homepage(){

    const PORT = "http://localhost:5000";
    const [notes, setNotes] = React.useState([]);
    const dragOverItemIndex = React.useRef(null);
    const dragItemIndex = React.useRef(null);

    function handleAddNotes(event){
        event.preventDefault();
        const value = event.target[0].value;
        let localId = 0;
        (notes.length === 0) ? localId=0 : localId=notes[notes.length-1].position+1;
        const list = [...notes,{data: value, position: localId, isStriked: false}]
        setNotes(list);
        let data = new URLSearchParams();
        data.append("notes", JSON.stringify(list));
        fetch(PORT+"/addList", {method: "post", mode: "cors", body: data, headers: {
            "Cache-Control":"no-cache","Access-Control-Allow-Origin":"*"
        }}).then((res)=>{
            res.text();
            // console.log(res);
        }).then((text)=>{
            //
        }).catch((err)=>{console.log(err)});
    }

    function addStrike(index){
        let element = document.getElementById("note"+index);
        // let y = notes.filter((item, pos)=>{return item.position !== index});
        let x = notes.filter((item, pos)=>{return item.position === index});
        (x[0].isStriked === true) ? x[0].isStriked = false: x[0].isStriked =true;
        let data = new URLSearchParams();
        data.append("notes", JSON.stringify(x[0]));
        fetch(PORT+"/updateStrike", {method: "post", mode: "cors", body: data, headers: {
            "Cache-Control":"no-cache","Access-Control-Allow-Origin":"*"
        }}).then((res)=>{
            res.text();
        }).then((text)=>{
            if(element){
                if(x[0].isStriked === true){
                    document.getElementById("note"+index).style.textDecoration = "line-through";
                }else{
                    document.getElementById("note"+index).style.textDecoration = "none";
                }
            }
        }).catch((err)=>{console.log(err)});
        
    }

    function handleDragStart(event, notesId){
        dragItemIndex.current = notesId;
    }

    function handleDragEnter(event, notesId){
        dragOverItemIndex.current = notesId;
    }

    function handleDragEnd(event){
        let oldNotes = [...notes];
        const currentdragItem = oldNotes.splice(dragItemIndex.current, 1)[0];
        oldNotes.splice(dragOverItemIndex.current, 0, currentdragItem);
        dragItemIndex.current = null;
        dragOverItemIndex.current = null;
        setNotes(oldNotes);
        let data = new URLSearchParams();
        data.append("notes", JSON.stringify(oldNotes));
        fetch(PORT+"/updateList", {method: "post", mode: "cors", body: data, headers: {
            "Cache-Control":"no-cache","Access-Control-Allow-Origin":"*"
        }}).then((res)=>{
            res.text();
        }).then((text)=>{
            // console.log(text);
        }).catch((err)=>{console.log(err)});
    }

    function handleDelete(event, index){
       
        let data = new URLSearchParams();
        data.append("notes", JSON.stringify(index));
        fetch(PORT+"/deleteListItem", {method: "post", mode: "cors", body: data, headers: {
            "Cache-Control":"no-cache","Access-Control-Allow-Origin":"*"
        }}).then(res => res.text())
        .then(txt => {
            makeAPICall();
        }).catch((err)=>{console.log(err)});
    }

    //next thing to do is update strike on refresh from notes
    function displayNotes(){
        let strikeResult = "none";
        return(
            notes.map((note, index)=>{
                const notesId = "note"+note.position;
                (note.isStriked === true) ? strikeResult = "line-through" : strikeResult = "none";
                return(
                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-sx-12 subnote" key={note.position}>
                        <div draggable className="row notes-div"
                            onDragStart={(event)=>{handleDragStart(event, note.position)}}
                            onDragEnter={(event)=>{handleDragEnter(event, note.position)}}
                            onDragEnd={(event)=>{handleDragEnd(event)}}
                            onDragOver={(event)=>{event.preventDefault()}}
                        >
                            <div className="col-12 toDoList-editables-div">
                                <button className="btn strikeBttn" onClick={()=>{addStrike(note.position)}}>✔</button>
                                <button className="btn removeItemBttn" onClick={(event)=>{handleDelete(event, note.position)}}>x</button>
                            </div>
                            <div className="col-12">
                                <p className="toDo-data" id={notesId} style={{"textDecoration": strikeResult}}>{note.data}</p>
                            </div>
                        </div>
                    </div>

                )
            })
        )
    }

    function deleteAllNotes(){
        let data = new URLSearchParams();
        data.append("notes", JSON.stringify("true"));
        fetch(PORT+"/deleteAllListItem", {method: "post", mode: "cors", body: data, headers: {
            "Cache-Control":"no-cache","Access-Control-Allow-Origin":"*"
        }}).then(res => res.text())
        .then(txt => {
            makeAPICall();
        }).catch((err)=>{console.log(err)});
    }

    const makeAPICall = async () => {
        let data = new URLSearchParams();
        data.append("notes", "1");
        fetch(PORT+"/getList", {method: "post", mode: "cors", body: data, headers: {
            "Cache-Control":"no-cache","Access-Control-Allow-Origin":"*"
        }}).then(res => res.text())
        .then(txt => {
            let details = txt;
            if(details){
                let list = [];
                details = JSON.parse(details);
                details.toDoItem.map(item=>{
                    return list.push({
                        data: item.data,
                        position: item.position,
                        isStriked: item.isStriked
                    })
                })
                setNotes(list);
            }
        }).catch((err)=>{console.log(err)});
    }

    React.useEffect(() => {
        makeAPICall();
    }, [])
    
    return(
        <div>
            <section className="header-section">
                <h1 className="brand-name">Tooable</h1>
            </section>
 
            <section className="homepage-section">
                <div className="row homepage-div">
                    <div className="col-12">
                        <form action="" method="post" className="todo-form" onSubmit={(event)=>{handleAddNotes(event)}}>
                            <div className="todo-input-div">
                                <input name="todoInput" type="text" required className="todo-input"/>
                            </div>
                            <button type="submit" className="btn todo-button">add</button>
                            <div className="deleteAll-div">
                                <button className="btn todo-bttn-deleteAll" onClick={()=>{deleteAllNotes()}}>clear all</button>
                            </div>
                        </form>
                    </div>
                    {/* <div className="col-2 deleteAll-div">
                        <button className="btn todo-bttn-deleteAll" onClick={()=>{deleteAllNotes()}}>Clear All</button>
                    </div> */}
                </div>
                <div className="row notes-container">
                    {displayNotes()}
                </div>
            </section>
        </div>
    );
}

export default Homepage;
