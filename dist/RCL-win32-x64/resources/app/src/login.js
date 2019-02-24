const electron = require('electron');
const remote = require('electron').remote;
const path = require('path');
const sql = require('mssql');

const config = {
    user: 'admin',
    password: 'password111!',
    server: 'localhost',
    database: 'RCL_Dev',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

const pool1 = new sql.ConnectionPool(config, err => {
	if(err)
		console.log(err);
});

var session = remote.session;

function login () {
	var username = $('#username').val();
	var password = $('#password').val();
    if(username.length > 0){
        if(password.length > 0){
        	const transaction = new sql.Transaction( pool1 );
            transaction.begin(err => {
                var rolledBack = false
         
                transaction.on('rollback', aborted => {
                    // emited with aborted === true
             
                    rolledBack = true
                })
                const request = new sql.Request(transaction);
                request.query("select * from Usuarios where Usuario = '"+ username +"' and Contrasena = '"+ password +"'", (err, result) => {
                    if (err) {
                        if (!rolledBack) {
                            console.log('error en rolledBack Login');
                            transaction.rollback(err => {
                                console.log('error en rolledBack');
                            });
                        }
                    }  else {
                        transaction.commit(err => {
                            // ... error checks
                            console.log("Transaction committed Login.");
                            console.log(result);
                            if(result.recordset.length > 0) {
                                var usuario = result.recordset[0];
                                console.log(usuario);
                                //Cookie Username
                                session.defaultSession.cookies.set({
                                        name:"username",
                                        url: "http://localhost/",
                                        value: usuario.Usuario
                                    },
                                    err => {
                                        console.log(err);
                                    }
                                );
                                //Cookie Name
                                session.defaultSession.cookies.set({
                                        name:"name",
                                        url: "http://localhost/",
                                        value: usuario.Nombre
                                    },
                                    err => {
                                        console.log(err);
                                    }
                                );
                                //Cookie formulaPermiso
                                session.defaultSession.cookies.set({
                                        name:"formula",
                                        url: "http://localhost/",
                                        value: usuario.formulaPermiso
                                    },
                                    err => {
                                        console.log(err);
                                    }
                                );
                                //Cookie fosedePermiso
                                session.defaultSession.cookies.set({
                                        name:"fosede",
                                        url: "http://localhost/",
                                        value: usuario.fosedePermiso
                                    },
                                    err => {
                                        console.log(err);
                                    }
                                );
                                //Cookie usuariosPermiso
                                session.defaultSession.cookies.set({
                                        name:"usuarios",
                                        url: "http://localhost/",
                                        value: usuario.usuariosPermiso
                                    },
                                    err => {
                                        console.log(err);
                                    }
                                );
                                $("#app_root").empty();
                                $("#app_root").load("src/home.html");
                            } else {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Usuario ó contraseña incorrecta.",
                                    duration: 2,
                                    overlay: true
                                });
                            }
                        });
                    }
                });
            }); // fin transaction
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese un valor para la contraseña.",
                duration: 2,
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Ingrese un valor para el usuario.",
            duration: 2,
            overlay: true,
            closeConfirm: true
        });
    }
}