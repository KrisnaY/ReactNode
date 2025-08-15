function resVal(value){
    let error = {};

    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/

    if(value.username === ""){
        error.username = "username tidak boleh kosong"
    }
    else {
        error.username = ""
    }

    if(value.email === ""){
        error.email = "email tidak boleh kosong"
    }
    else if(!email_pattern.test(value.email)){
        error.email = "email tidak sesuai"
    }  
    else {
        error.email = ""
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

export default resVal