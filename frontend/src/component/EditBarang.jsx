import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useEffect } from 'react';

function EditBarang(props) {
    const { barang, onHide, onUpdated } = props;

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
        const token = localStorage.getItem("token");
        axios.put(`${process.env.REACT_APP_API_URL}/updateBarang/${barang.idBarang}`, values, {
                headers: { "x-access-token": token }
            })
            .then(() => {
                if (onUpdated) onUpdated();
                onHide();
            })
            .catch(err => console.log(err));
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
