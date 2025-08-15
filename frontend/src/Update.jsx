import axios from 'axios';
import React, {useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom';

function Update() {

    const {id} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/get/'+id)
        .then(res => {
            setValue({...values, username: res.data[0][0].username, email: res.data[0][0].email, password: res.data[0][0].password})
        })
        .catch(err => {
            console.log(err)
        });
    }, [])

    const [values, setValue] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleInput = e => {
        setValue(prev => ({...prev, [e.target.name] : [e.target.value]}));
    }

    const handleUpdate = e => {
        e.preventDefault();
        axios.put('http://localhost:8000/update/'+id, values)
        .then(res => {
            console.log(res)
            navigate('/home');
        })
        .catch(err => {
            console.log(err);
        })
    }

  return (
    <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
        <div className='w-50 bg-white rounded p-3'>
            <form onSubmit={handleUpdate}>
                <h2>Update User</h2>
                <div className="form-group mb-4">
                    <label >Username</label>
                    <input type="text" className="form-control" name="username" aria-describedby="emailHelp" value={values.username}
                    onChange={handleInput}/>
                </div>
                <div className="form-group mb-4">
                    <label >Email</label>
                    <input type="text" className="form-control" name="email" aria-describedby="emailHelp" value={values.email}
                    onChange={handleInput}/>
                    <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
                </div>
                <div className="form-group mb-4">
                    <label >Password</label>
                    <input type="password" className="form-control" name='password' value={values.password}
                    onChange={handleInput}/>
                </div>
                <button type="submit" class="btn btn-primary">Update</button>
            </form>
        </div>
    </div>
  )
}

export default Update