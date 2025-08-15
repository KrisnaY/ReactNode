function logVal(value){
    let error = {};
    
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/

    if(value.username === ""){
        error.username = "username tidak boleh kosong"
    } 
    else {
        error.username = ""
    }

    if(value.password === ""){
        error.password = "Pasword tidak boleh kosong"
    }
    else if(!password_pattern.test(value.password)){
        error.password = "Pasword tidak sama"
    }
    else {
        error.password = ""
    }
    return error;
}

export default logVal