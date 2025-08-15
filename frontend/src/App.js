import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './Home';
import Create from './Create';
import Update from "./Update";
import Login from './Login';
import Register from './Register';
import HomeOnepage from './HomeOnepage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/home' element={<Home />}></Route>
        <Route path='/create' element={<Create />}></Route>
        <Route path='/update/:id' element={<Update />}></Route>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/homeonepage' element={<HomeOnepage />}></Route>
      </Routes>
    </BrowserRouter>
  
  );
}

export default App;
