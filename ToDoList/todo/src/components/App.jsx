import React from "react";
import {Routes, Route} from "react-router-dom";
import Homepage from "./Homepage";

function App(){

    return(
        <div>
            <Routes>
                <Route exact path="/" element={<Homepage />}></Route>
            </Routes>
        </div>
    );
}

export default App;
