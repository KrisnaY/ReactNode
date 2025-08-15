import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function Create() {
    const [value, setValue] = useState({
        username: '',
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleSubmit = e =>{
        e.preventDefault();
        axios.post('http://localhost:8000/user', value)
        .then(res => {
         console.log(res);
         navigate('/home')   
        })
        .catch(err => console.log(err));
    }

  return (
    <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
        <div className='w-50 bg-white rounded p-3'>
            <form onSubmit={handleSubmit}>
                <h2>Tambah User</h2>
                <div className="form-group mb-4">
                    <label >Username</label>
                    <input type="text" className="form-control" placeholder='Enter Username' aria-describedby="emailHelp" onChange={e => setValue({...value, username: e.target.value})}/>
                </div>
                <div className="form-group mb-4">
                    <label >Email</label>
                    <input type="text" className="form-control" placeholder='Enter Email' aria-describedby="emailHelp" onChange={e => setValue({...value, email: e.target.value})}/>
                    <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
                </div>
                <div className="form-group mb-4">
                    <label >Password</label>
                    <input type="password" className="form-control" id="exampleInputPassword1" onChange={e => setValue({...value, password: e.target.value})}/>
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
        </div>
    </div>
  )
}

export default Create