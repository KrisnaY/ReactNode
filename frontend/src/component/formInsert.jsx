import axios from 'axios';
import React, { useState } from 'react';
import { Button, Form, Card } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';
import { jwtDecode } from 'jwt-decode';


function FormInsert(props) {
    const { onInsert, socket, id } = props; 
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
        if(!socket) return;
        socket.emit('addBarang', {  id: id, data: value }, (res) => {
            if(res && res.success) {
                alert('Data berhasil ditambahkan');
                setValue({
                    namaBarang: '',
                    jmlBarang: '',
                    jenisBarang: ''
                });
                if (onInsert) onInsert();
            } else {
                alert('Gagal menambahkan data: ' + res.error);
            }   
        })
    }

  return (
    <>
        <Card className="shadow-sm border-0">
            <Card.Body>
                <h5 className="mb-3 fw-bold">➕ Tambah Barang</h5>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nama Barang</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Masukkan nama barang" 
                            name='namaBarang'
                            value={value.namaBarang}
                            onChange={handleInput} 
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Jumlah Barang</Form.Label>
                        <Form.Control 
                            type="number" 
                            placeholder="Masukkan jumlah barang" 
                            name='jmlBarang'
                            value={value.jmlBarang}
                            onChange={handleInput} 
                            required
                        />
                    </Form.Group>
                    <Button type="submit" variant="success">
                        <PlusCircle className="me-1" /> Insert
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    </>
  )
}

export default FormInsert