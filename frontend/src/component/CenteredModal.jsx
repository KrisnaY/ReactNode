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
        password: user.password,
        oldpassword: user.oldpassword,
        role: user.role
    });

    useEffect(() => {
        setValues({
            username: user.username,
            email: user.email,
            password: user.password,
            oldpassword: user.oldpassword,
            role: user.role
        });
    }, [user]);

    const handleInput = e => {
        setValues(prev => ({...prev, [e.target.name]: e.target.value
        }));
    };

    const handleUpdate = e => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        axios.put(`${process.env.REACT_APP_API_URL}/update/${user.id}`, values, {
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
                    </div>
                    <div className="form-group mb-4">
                        <label>new Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="password"
                            onChange={handleInput} />
                    </div>
                    <div className="form-group mb-4">
                            <label>Confirm Old Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="oldpassword"
                                onChange={handleInput} />
                        </div>
                    <div className="form-group mb-4">
                        <label>Role</label>
                        <input
                            type="text"
                            className="form-control"
                            name="role"
                            value={values.role}
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
