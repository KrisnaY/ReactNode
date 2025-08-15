import axios from 'axios';
import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'

function FormInsert({onInsert}) {
    const [value, setValue] = useState({
        username: '',
        email : '',
        password : ''
    });

    const handleInput = e => {
        setValue(prev => ({...prev, [e.target.name] : e.target.value}))
    }

    const handleSubmit = e => {
        e.preventDefault();
        axios.post('http://localhost:8000/user', value)
        .then(res => {
            if (onInsert) onInsert()
            console.log(res);
        })
        .catch(err => console.log(err));
    }

  return (
    <>
        <div className='w-50 bg-white rounded p-3'>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formGroupUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" placeholder="Enter username" name='username'
                    onChange={handleInput} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" name='email'
                    onChange={handleInput} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" name='password' 
                    onChange={handleInput}/>
                </Form.Group>
                <Button type="submit">Insert</Button>
            </Form>
        </div>
    </>
  )
}

export default FormInsert