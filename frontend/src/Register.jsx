import React, { useState } from 'react'
import resVal from './RegisterValidation';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register () {
    const [value, setValue] = useState({
        username: '',
        email:'',
        password: ''
    });

    const navigate = useNavigate();

  const [error, setError] = useState({})

  const handleInput = e => {
    setValue(prev => ({...prev, [e.target.name] : [e.target.value]}));
  }

  const handleSubmit = e => {
    e.preventDefault();
    setError(resVal(value));
    if(error.username === "" && error.email === "" && error.password === ""){
        axios.post('http://localhost:8000/register', value)
        .then(res => {
            console.log(res);
            navigate('/')
        })
        .catch(err => console.log(err));
    }
  }

  return (
    <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
      <div className='p-3 bg-white w-50'>
        <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
                <label >Username</label>
                <input type="text" className="form-control" placeholder='Enter Username' aria-describedby="emailHelp" name="username" 
                onChange={handleInput}/>
                {error.username && <span className='text-danger'>{error.username}</span>}
            </div> 
            <div className="form-group mb-3">
                <label >Email</label>
                <input type="text" className="form-control" placeholder='Enter Email' aria-describedby="emailHelp" name='email' 
                onChange={handleInput}/>
                {error.email && <span className='text-danger'>{error.email}</span>}
            </div>
            <div className="form-group mb-3">
                <label >Password</label>
                <input type="password" className="form-control" id="exampleInputPassword1" name="password" 
                onChange={handleInput}/>
                {error.password && <span className='text-danger'>{error.password}</span>}
            </div>
            <button type="submit" className="btn btn-primary mb-3">Submit</button>
        </form>
      </div>
    </div>
  )
}

export default Register