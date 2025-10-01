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
import { PersonCircle } from "react-bootstrap-icons";
import Badge from 'react-bootstrap/Badge';
import Books from './component/books.jsx';
import EditAdmin from './component/EditAdmin.jsx';
import { io } from 'socket.io-client';

function HomeOnepage() {
    const [data, setData] = useState([]);
    const [user, setUser] = useState({
        id: '',
        email: '',
        username: '',
        role: ''
    });

    const [socket, setSocket] = useState(null);

    const [modal, setModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [barang, setBarang] = useState([]);
    const navigate = useNavigate();

    // axios.defaults.withCredentials = true;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token) {
            const decode = jwtDecode(token);
            // console.log("user :", decode)
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

     useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        // console.log(token);
        const newSocket = io(process.env.REACT_APP_API_URL, {
            auth: { token }
        });
        setSocket(newSocket);

        // Listen for real-time updates
        newSocket.on('newBarang', (payload) => {
            const { barang: newBarang } = jwtDecode(payload);
            setBarang(prev => [...prev, newBarang]);
        });
        newSocket.on('updateBarang', (payload) => {
            console.log(payload);
            const { barang: updatedBarang } = jwtDecode(payload);
            console.log(updatedBarang);
            setBarang(prev => prev.map(b => b._id === updatedBarang._id ? updatedBarang : b));
        });
        newSocket.on('deleteBarang', (payload) => {
            const { id } = jwtDecode(payload);
            setBarang(prev => prev.filter(b => b._id !== id));
        });

        newSocket.on('newUser', (payload) => {
            const { user: newUser } = jwtDecode(payload);
            setData(prev => [...prev, newUser]);
        });
        newSocket.on('updateUser', (payload) => {
            const { user: updatedUser } = jwtDecode(payload);
            setData(prev => prev.map(u => u._id === updatedUser._id ? { ...u, ...updatedUser } : u));
            if (user.id === updatedUser._id) {
                setUser(prev => ({ ...prev, ...updatedUser }));
            }
        });
        newSocket.on('deleteUser', (payload) => {
            const deleted = jwtDecode(payload);
            setData(prev => prev.filter(u => u._id !== deleted._id));
            if (user.id === deleted._id) {
                localStorage.removeItem("token");
                navigate('/');
            }
        });

        // fetch
        newSocket.emit('getAllUser', (res) => {
            if (res.success) {
                const { users } = jwtDecode(res.users);
                setData(users);
            }
        });
        if (user.id) {
            newSocket.emit('getBarangById', user.id, (res) => {
                const decodedToken = jwtDecode(res.barang);
                if (res.success) setBarang(decodedToken.barang);
            });
        }

        return () => newSocket.close();
    }, [user.id]);

    // CRUD actions via socket
    const handleDelete = async (id) => {
        if(!window.confirm("Apakah anda yakin menghapus user ini?")) return;
        try {
            if(!socket) return;
            socket.emit('deleteUser', id, (res) => {
                if(res && res.success) {
                    alert('Data berhasil dihapus');
                } else {
                    alert('Gagal menghapus data: ' + res.error);
                }
            });
        } catch (error) {
            console.error("Error menghapus barang:", error);
            alert("Gagal menghapus barang");
        }
    };

    const handleLogout = () => {
        if (socket) {
            socket.emit('logout', (response) => {
                if (response.success) {
                    console.log('Logout successful on server');
                } else {
                    console.error('Server logout failed:', response.error);
                }
                // Always perform client-side logout
                socket.disconnect();
                localStorage.removeItem("token");
                navigate('/');
            });
        }
    };

    const refreshUserFromToken = () => {
        const token = localStorage.getItem('token');
        if(token) {
            const decode = jwtDecode(token);
            setUser({
                id: decode.id,
                email: decode.email,
                username: decode.username,
                role: decode.role
            });
        }
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
            <Navbar bg="dark" expand="lg" sticky="top" variant="dark">
                <Container>
                    <Navbar.Brand as={Link} to="/homeonepage">📚 MyApp</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/homeonepage">Home</Nav.Link>
                            <Nav.Link as={Link} to="/create">Create</Nav.Link>
                        </Nav>
                        {user && user.username && (
                            <Nav className="me-3">
                                <Nav.Link onClick={() => handleProfileClick(user)} style={{ cursor: "pointer" }}>
                                    <PersonCircle size={20} className="me-1" />
                                    {user.username}
                                </Nav.Link>
                            </Nav>
                        )}
                        <Button onClick={handleLogout} variant="outline-light" size="sm">Logout</Button>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="d-flex flex-column align-items-center bg-light min-vh-100 py-4">
                <Container>
                    {user.role === 0 && (
                        <>
                            <h2 className="mb-4 fw-bold text-dark">👥 Manage Users</h2>
                            <div className="row g-4 mb-5">
                                {data.map((u, i) => (
                                    <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <Card className="shadow-sm border-0 h-100">
                                            <Card.Body>
                                                <div className="d-flex align-items-center mb-3">
                                                    <PersonCircle size={40} className="me-2 text-secondary" />
                                                    <div>
                                                        <Card.Title className="mb-0">{u.username}</Card.Title>
                                                        <Card.Subtitle className="text-muted">{u.email}</Card.Subtitle>
                                                    </div>
                                                </div>
                                                <Badge bg={u.role === 0 ? "danger" : "secondary"}>
                                                    {u.role === 0 ? "Admin" : "User"}
                                                </Badge>
                                                <div className="d-flex justify-content-between mt-3">
                                                    <Button onClick={() => handleUpdateClick(u)} variant="outline-primary" size="sm">
                                                        Update
                                                    </Button>
                                                    <Button onClick={() => handleDelete(u._id)} variant="outline-danger" size="sm">
                                                        Delete
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Books Section */}
                    <h2 className="mb-3 fw-bold text-dark">📦 Barang Anda</h2>
                    <div className='bg-white rounded shadow-sm p-3 mb-4'>
                        <Books 
                            data={barang}
                            socket={socket}
                            onInsert={() => {}}
                            onUpdated={() => {}}
                        />
                    </div>

                    {/* Insert Form */}
                    <FormInsert 
                    id={user.id}
                    socket={socket}
                    onInsert={() => {}} />
                </Container>
            </div>
            
            {selectedUser && (
                <>
                    <EditAdmin
                        show={modal}
                        user={selectedUser}
                        socket={socket}
                        onHide={() => setModal(false)}
                        onUpdated={() => {}}
                    />

                    <CenteredModal
                        show={showProfileModal}
                        user={selectedUser}
                        socket={socket}
                        onHide={() => setShowProfileModal(false)}
                        onUpdated={(newToken) => {
                            if (newToken) {
                                refreshUserFromToken(); // This will now read the new token from localStorage
                            }
                        }}
                    />
                </>
            )}
        </>
    );
}

export default HomeOnepage;
