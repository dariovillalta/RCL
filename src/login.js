const electron = require('electron');
const remote = require('electron').remote;
const path = require('path');
const sql = require('mssql');

const config = {
    user: 'SA',
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
    else {
        loadLists();
    }
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
                                cleanup();
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


//////Creacion de LISTAS
var arregloListas = [];
function loadLists () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Listas", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Listas');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed Listas");
                    console.log(result);
                    if(result.recordset.length > 0){
                        arregloListas = result.recordset;
                    } else {
                        arregloListas = [];
                    }
                    var existeManContable = false, existeCuentOperativas = false, existeExcluFOSEDE = false,
                    existePerNaturales = false, existeSubPersonas = false;
                    for (var i = 0; i < arregloListas.length; i++) {
                        if(arregloListas[i].tipo == 1)
                            existeManContable = true;
                        else if(arregloListas[i].tipo == 2)
                            existeCuentOperativas = true;
                        else if(arregloListas[i].tipo == 3)
                            existeExcluFOSEDE = true;
                        else if(arregloListas[i].tipo == 4)
                            existePerNaturales = true;
                        else if(arregloListas[i].tipo == 5)
                            existeSubPersonas = true;
                    };
                    var listas = [{nombre: "Manual Contable", tipo: 1},{nombre: "Cuentas Operativas", tipo: 2},{nombre: "Exclusiones FOSEDE", tipo: 3},{nombre: "Tipo de Personas", tipo: 4},{nombre: "Tipo de Sub-Personas", tipo: 5}];
                    if(arregloListas.length == 0) {
                        for (var i = 0; i < listas.length; i++) {
                            createList(listas[i].nombre, listas[i].tipo);
                        };
                    }
                    if(!existeManContable && arregloListas.length > 0)
                        createList(listas[0].nombre, listas[0].tipo);
                    if(!existeCuentOperativas && arregloListas.length > 0)
                        createList(listas[1].nombre, listas[1].tipo);
                    if(!existeExcluFOSEDE && arregloListas.length > 0)
                        createList(listas[2].nombre, listas[2].tipo);
                    if(!existePerNaturales && arregloListas.length > 0)
                        createList(listas[3].nombre, listas[3].tipo);
                    if(!existeSubPersonas && arregloListas.length > 0)
                        createList(listas[4].nombre, listas[4].tipo);
                });
            }
        });
    }); // fin transaction
}

function createList (nombre, tipo) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("insert into Listas (nombre, tipo) values ('"+nombre+"', "+tipo+")", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        console.log('error en Listas creation automatically');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Listas creation automatically");
                });
            }
        });
    }); // fin transaction
}

var cleanup = function () {
    delete window.electron;
    delete window.remote;
    delete window.path;
    delete window.sql;
    delete window.config;
    delete window.pool1;
    delete window.login;
    delete window.arregloListas;
    delete window.loadLists;
    delete window.cleanup;
};