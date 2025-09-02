import axios from 'axios';
import React, { useEffect, useState } from 'react';
import validation from './LoginValidation';
import { Link, useNavigate } from 'react-router-dom';
import logVal from './LoginValidation';

function Login() {

  const [value, setValue] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState({})

  const handleInput = e => {
    setValue(prev => ({...prev, [e.target.name] : [e.target.value]}));
  }
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/facebook`;
   }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "true" || params.get("facebook") === "true") {
      axios.get(`${process.env.REACT_APP_API_URL}/verify`, { withCredentials: true })
        .then(res => {
          localStorage.setItem("token", res.data.token);
          navigate("/homeonepage");
        })
        .catch(err => {
          console.error("Google login fetch failed", err);
        });
    }
  }, [navigate]);

  const handleSubmit = e => {
    e.preventDefault();
    setError(logVal(value));
    if(error.username === "" && error.password === ""){
      axios.post(`${process.env.REACT_APP_API_URL}/login`, value)
      .then(res => {
        localStorage.setItem("token", res.data.token);
        // console.log(res);
        navigate('/homeonepage')
      })
      .catch(err => alert(err.response?.data?.message || "Login failed"));
    }
  }

  return (
    <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
      <div className='p-3 bg-white w-50'>
        <form onSubmit={handleSubmit}>
          <div class="form-group mb-3">
            <label htmlfor="username">Username</label>
            <input type="text" class="form-control"  placeholder="Enter username" name='username'
            onChange={handleInput}/>
            {error.username && <span className='text-danger'>{error.username}</span>}
          </div>
          <div class="form-group mb-3">
            <label htmnlfor="password">Password</label>
            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" name='password'
            onChange={handleInput}/>
            {error.password && <span className='text-danger'>{error.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary mb-3">Submit</button>
          {/* <button type="submit" className="btn btn-primary mb-3">Submit</button> */}
          <button type="button" onClick={handleGoogleLogin} className="btn btn-danger mb-3 w-100">
            Login with Google
          </button>
          <button type="button" onClick={handleFacebookLogin} className="btn btn-danger mb-3 w-100">
            Login with Facebook
          </button>
          <Link to="/register" className='btn btn-default border w-100 bg-light rounded-0'>Register</Link>
          {/* <Link to="/register" className='btn btn-default border w-100 bg-light rounded-0'>Register</Link> */}
        </form>
      </div>
    </div>
  );
}

export default Login;