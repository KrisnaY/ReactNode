import React, {useEffect, useState} from 'react'
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

function Home() {

    const [data, setData] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:8000/')
        .then(res => {
            console.log(res);
            setData(res.data[0])})
        .catch(err => console.log(err));
    }, [])
    
    const handleDelete = id => {
        axios.delete('http://localhost:8000/delete/'+id)
        .then(res => window.location.reload())
        .catch(err => console.log(err));
    }

  return (
    <>
    <Navbar bg="dark" data-bs-theme="dark">
        <Container>
            <Navbar.Brand href="#home">Navbar</Navbar.Brand>
            <Nav className="me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link as={Link} to="/create">Create</Nav.Link>
            </Nav>
        </Container>
    </Navbar>

    <div className="d-flex flex-column align-items-center bg-primary min-vh-100 py-4">
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="text-white">CRUD Cards</h1>
            </div>

            <div className="row g-4">
            {data.map((data, i) => (
                <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>{data.username}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{data.email}</Card.Subtitle>
                            <Card.Text>
                                <strong>Password:</strong> {data.password}
                            </Card.Text>
                            <div className="d-flex justify-content-between">
                                <Button as={Link} to={`/update/${data.id}`} variant="primary" size="sm">
                                Update
                                </Button>
                                <Button onClick={() => handleDelete(data.id)} variant="danger" size="sm">
                                Delete
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            ))}
            </div>
        </Container>
        
        </div>

    </>
  );
}

export default Home