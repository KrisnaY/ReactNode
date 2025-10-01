import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useEffect } from 'react';

function EditBarang(props) {
    const { barang, onHide, onUpdated, socket } = props;

    const [values, setValues] = useState({
        namaBarang: barang.namaBarang,
        jmlBarang: barang.jmlBarang
    });

    useEffect(() => {
        setValues({
            namaBarang : barang.namaBarang,
            jmlBarang : barang.jmlBarang
        });
    }, [barang]);

    const handleInput = e => {
        setValues(prev => ({...prev, [e.target.name]: e.target.value
        }));
    };

    const handleUpdate = e => {
        e.preventDefault();
        
        if(!socket) return;
        socket.emit('updateBarang', { id: barang._id, data: values }, (res) => {
            if(res && res.success) {
                alert('Data berhasil diupdate');
                if (onUpdated) onUpdated();
                onHide();
            } else {
                alert('Gagal mengupdate data: ' + res.error);
            }
        });
    };

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <h2>Edit Data</h2>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleUpdate}>
                    <div className="form-group mb-4">
                        <label>Nama Barang</label>
                        <input
                            type="text"
                            className="form-control"
                            name="namaBarang"
                            value={values.namaBarang}
                            onChange={handleInput}
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label>Jumlah Barang</label>
                        <input
                            type="text"
                            className="form-control"
                            name="jmlBarang"
                            value={values.jmlBarang}
                            onChange={handleInput}
                        />
                    </div>
                    
                    <Modal.Footer>
                        <Button type="submit">Edit</Button>
                    </Modal.Footer>
                </form>
            </Modal.Body>
        </Modal>
    );
}

export default EditBarang;
