import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { useEffect } from 'react';

function CenteredModal(props) {
    const { user, onHide, onUpdated } = props;

    const [values, setValues] = useState({
        username: user.username,
        email: user.email,
        password: user.password
    });

    useEffect(() => {
        setValues({
            username: user.username,
            email: user.email,
            password: user.password
        });
    }, [user]);

    const handleInput = e => {
        setValues(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleUpdate = e => {
        e.preventDefault();
        axios.put(`http://localhost:8000/update/${user.id}`, values)
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
                        <label>Username</label>
                        <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={values.username}
                            onChange={handleInput}
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label>Email</label>
                        <input
                            type="text"
                            className="form-control"
                            name="email"
                            value={values.email}
                            onChange={handleInput}
                        />
                        <small id="emailHelp" className="form-text text-muted">
                            We'll never share your email with anyone else.
                        </small>
                    </div>
                    <div className="form-group mb-4">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={values.password}
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

export default CenteredModal;
