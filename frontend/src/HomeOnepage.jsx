import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
// import formInsert from './component/formInsert.jsx';
import CenteredModal from './component/CenteredModal.jsx';
import FormInsert from './component/formInsert.jsx';

function HomeOnepage() {
    const [data, setData] = useState([]);
    const [modal, setModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            navigate("/");
        }
    }, []);

    const fetchData = () => {
        axios.get('http://localhost:8000/')
            .then(res => {
                console.log(res.data[0]);
                setData(res.data[0]);
            })
            .catch(err => console.log(err));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = id => {
        axios.delete(`http://localhost:8000/delete/${id}`)
            .then(() => {
                // Update UI without reloading page
                setData(prev => prev.filter(item => item.id !== id));
            })
            .catch(err => console.log(err));
    };

    const handleLogout = () => {
        axios.post('http://localhost:8000/logout', {}, { withCredentials: true })
            .then(() => {
            localStorage.removeItem("user");
            navigate('/login');
        });
    };

    const handleUpdateClick = user => {
        setSelectedUser(user);
        setModal(true);
    };

    return (
        <>
            <Navbar bg="dark" data-bs-theme="dark">
                <Container>
                    <Navbar.Brand href="#home">Navbar</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link as={Link} to="/create">Create</Nav.Link>
                    </Nav>
                    <Button onClick={handleLogout} variant="secondary">Logout</Button>
                </Container>
            </Navbar>

            <div className="d-flex flex-column align-items-center bg-primary min-vh-100 py-4">
                <Container>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="text-white">CRUD Cards</h1>
                    </div>

                    <div className="row g-4 mb-4">
                        {data.map((user, i) => (
                            <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <Card className="shadow-sm">
                                    <Card.Body>
                                        <Card.Title>{user.username}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted">{user.email}</Card.Subtitle>
                                        <Card.Text>
                                            <strong>Password:</strong> {user.password}
                                        </Card.Text>
                                        <div className="d-flex justify-content-between">
                                            <Button onClick={() => handleUpdateClick(user)} variant="primary" size="sm">
                                                Update
                                            </Button>
                                            <Button onClick={() => handleDelete(user.id)} variant="danger" size="sm">
                                                Delete
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>
                </Container>
               
                <FormInsert 
                    onInsert={fetchData}
                />
                
            </div>
            
                {selectedUser && (
                    <CenteredModal
                        show={modal}
                        user={selectedUser}
                        onHide={() => setModal(false)}
                        onUpdated={fetchData}
                    />
                )}
            
        </>
    );
}

export default HomeOnepage;
