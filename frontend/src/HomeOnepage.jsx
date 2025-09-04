import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import CenteredModal from './component/CenteredModal.jsx';
import FormInsert from './component/formInsert.jsx';
import { jwtDecode } from 'jwt-decode';
import Books from './component/books.jsx';
import EditAdmin from './component/EditAdmin.jsx';

function HomeOnepage() {
    const [data, setData] = useState([]);
    const [user, setUser] = useState({
        id: '',
        email: '',
        username: '',
        role: ''
    });
    const [modal, setModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token) {
            const decode = jwtDecode(token);
            console.log(decode)
            setUser({
                id: decode.id,
                email: decode.email,
                username: decode.username,
                role: decode.role
            })
        }else{
            navigate('/');
        }
    }, []);

    const fetchData = () => {
        const token = localStorage.getItem("token");
        axios.get(`${process.env.REACT_APP_API_URL}/`, {
            headers: { "x-access-token": token }
        })
            .then(res => {{
                    console.log(res);
                    const decode = jwtDecode(res.data.encryptedPayload);
                    console.log(decode);
                    setData(decode.data[0]);
                }         
            })
            .catch(err => {
                if(err.response?.status === 401 || err.response?.status === 403){
                    navigate('/')
                }
            });
    };

    const fetchBooks = (uid) => {
        const token = localStorage.getItem('token');
        axios.get(`${process.env.REACT_APP_API_URL}/books/${uid}`, {
            headers: { "x-access-token": token }
        }).then(res => {
            const decode = jwtDecode(res.data.token);
            // console.log(decode)
            setBooks(decode.data);
        }).catch(err => {
            console.log(err);
        })
    }

    useEffect(() => {
        console.log(user);
        if(user.id){
            fetchBooks(user.id);
        }
        if(user.role == 0){
            fetchData()
        }
    }, [user.id]);

    const handleDelete = id => {
        axios.delete(`${process.env.REACT_APP_API_URL}/delete/${id}`, {
            headers: { "x-access-token": localStorage.getItem("token") }
        })
            .then(() => {
                setData(prev => prev.filter(item => item.id !== id));
            })
            .catch(err => console.log(err));
    };

    const handleLogout = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/logout`, {}, { withCredentials: true })
            .then(() => {
                localStorage.removeItem("token");
                navigate('/');
        });
    };

    const handleProfileClick = user => {
        setSelectedUser(user);
        setShowProfileModal(true);
    };

    const handleUpdateClick = user => {
        setSelectedUser(user);
        setModal(true);
    };

    return (
        <>
            <Navbar bg="dark" variant='dark' data-bs-theme="dark">
                <Container>
                    <Navbar.Brand href="#home">Navbar</Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link as={Link} to="/create">Create</Nav.Link>
                    </Nav>
                    {user && user.username && (
                        <Nav>
                        <Nav.Link
                            onClick={() => handleProfileClick(user)}
                            style={{ cursor: "pointer" }}
                        >
                            Signed in as: <strong>{user.username}</strong>
                        </Nav.Link>
                        </Nav>
                    )}
                    <Button onClick={handleLogout} variant="secondary">Logout</Button>
                </Container>
            </Navbar>

            <div className="d-flex flex-column align-items-center bg-primary min-vh-100 py-4">
                <Container>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="text-white">CRUD Cards</h1>
                    </div>

                    {user.role === 0 && 
                        <div className="row g-4 mb-4">
                            {data.map((user, i) => (
                                <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <Card className="shadow-sm">
                                        <Card.Body>
                                            <Card.Title>{user.username}</Card.Title>
                                            <Card.Subtitle className="mb-2 text-muted">{user.email}</Card.Subtitle>
                                            <Card.Text>
                                                Role : {user.role}
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
                    }
                </Container>
                <div>

                </div>
                <div className='w-50 bg-white rounded p-3 mb-4'>
                    <Books 
                        data={books}
                        onInsert={() => fetchBooks(user.id)}
                        onUpdated={() => fetchBooks(user.id)}
                    />
                </div>
            
                

                <FormInsert 
                    onInsert={() => fetchBooks(user.id)}
                />

            </div>
            
            {selectedUser && (
                <>
                    <EditAdmin
                        show={modal}
                        user={selectedUser}
                        onHide={() => setModal(false)}
                        onUpdated={fetchData}
                    />

                    <CenteredModal
                        show={showProfileModal}
                        user={selectedUser}
                        onHide={() => setShowProfileModal(false)}
                        onUpdated={() => fetchBooks(user.id)}
                    />
                </>
            )}
        </>
    );
}

export default HomeOnepage;
