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
    setValue(prev => ({...prev, [e.target.name] : e.target.value}));
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
    // const token = localStorage.getItem('token')
    if (params.get("google") === "true" || params.get("facebook") === "true") {
      axios.get(`${process.env.REACT_APP_API_URL}/verify`, { 
        withCredentials: true
       })
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
      <div className='p-3 bg-white w-50 rounded'>
        <form onSubmit={handleSubmit}>
          <label htmlFor=''>Username</label>
          <div class="form-floating mb-3">
            <input type="text" class="form-control"  placeholder="Enter username" name='username'
            onChange={handleInput}/>
            {error.username && <span className='text-danger'>{error.username}</span>}
            <label htmlfor="username mb-3">Username</label>
          </div>
          <div class="form-floating mb-3">
            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" name='password'
            onChange={handleInput}/>
            {error.password && <span className='text-danger'>{error.password}</span>}
            <label htmnlfor="password">Password</label>
          </div>
          <div className='d-flex justify-content-center'>
            <button type="submit" className="btn btn-primary mb-3">Login</button>
          </div>
          
          <div className='text-center'>
            <a href='/register' className=''>Register</a>
          </div>
          <div className='text-center'>OR</div>
          <div className='text-center mb-3'>Login with</div>
          <div className='d-flex justify-content-center mb-3'>
            <button type='button' className='btn btn-light border border-dark d-flex justify-content-center me-3' onClick={handleGoogleLogin}>
              <svg type='button' xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-google">
                <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
              </svg>
            </button>
            <button type='button' width="16" height="16" className='btn btn-light border border-dark d-flex justify-content-center' onClick={handleFacebookLogin}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-facebook" >
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H8.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
              </svg>
            </button>
          </div>
          {/* <button type="submit" className="btn btn-primary mb-3">Submit</button> */}
          {/* <Link to="/register" className='btn btn-default border w-100 bg-light rounded-0'>Register</Link> */}
          {/* <Link to="/register" className='btn btn-default border w-100 bg-light rounded-0'>Register</Link> */}
        </form>
      </div>
    </div>
  );
}

export default Login;