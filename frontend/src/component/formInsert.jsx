import axios from 'axios';
import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'

function FormInsert({onInsert}) {
    const [value, setValue] = useState({
        namaBarang: '',
        jmlBarang: '',
        jenisBarang: ''
    });

    const handleInput = e => {
        setValue(prev => ({...prev, [e.target.name] : e.target.value}))
    }

    const handleSubmit = e => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        axios.post('http://localhost:8000/barang', value, {
            headers: { "x-access-token": token }
        })
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
                    <Form.Label>Nama Barang</Form.Label>
                    <Form.Control type="text" placeholder="masukan nama barang" name='namaBarang'
                    onChange={handleInput} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGroupEmail">
                    <Form.Label>Jumlah Barang</Form.Label>
                    <Form.Control type="text" placeholder="masukan jumlah barang" name='jmlBarang'
                    onChange={handleInput} />
                </Form.Group>
                <Button type="submit">Insert</Button>
            </Form>
        </div>
    </>
  )
}

export default FormInsert