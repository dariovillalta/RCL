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
var arregloElementosDeListas = [];
var contadorBandera = 0, contadorCreacionesHechas = 0;
var booleanBandera = false;
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
                    if(!existeManContable && arregloListas.length > 0){
                        createList(listas[0].nombre, listas[0].tipo);
                        contadorBandera++;
                    }
                    if(!existeCuentOperativas && arregloListas.length > 0){
                        createList(listas[1].nombre, listas[1].tipo);
                        contadorBandera++;
                    }
                    if(!existeExcluFOSEDE && arregloListas.length > 0){
                        createList(listas[2].nombre, listas[2].tipo);
                        contadorBandera++;
                    }
                    if(!existePerNaturales && arregloListas.length > 0){
                        createList(listas[3].nombre, listas[3].tipo);
                        contadorBandera++;
                    }
                    if(!existeSubPersonas && arregloListas.length > 0) {
                        createList(listas[4].nombre, listas[4].tipo);
                        contadorBandera++;
                    }
                    if(arregloListas.length == 0) {
                        for (var i = 0; i < listas.length; i++) {
                            createList(listas[i].nombre, listas[i].tipo);
                            contadorBandera++;
                        };
                    }
                });
            }
        });
    }); // fin transaction
}

function loadListsSimple () {
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
                    if(contadorCreacionesHechas == contadorBandera && !booleanBandera) {
                        booleanBandera = true;
                        loadElementLists();
                    }
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
                    loadListsSimple();
                    contadorCreacionesHechas++;
                });
            }
        });
    }); // fin transaction
}

function loadElementLists () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Lists Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction Lists Variables");
                    if(result.recordset.length > 0){
                        arregloElementosDeListas = result.recordset;
                    } else {
                        arregloElementosDeListas = [];
                    }
                    if(arregloListas.length == 5)
                        verifyElementLists();
                });
            }
        });
    }); // fin transaction
}
function verifyElementLists () {
    if(arregloListas.length == 5) {
        var idListaTipPer = arregloListas.filter(function(object) {
                                return (object.tipo == 4 );
                            });
        if(idListaTipPer.length > 0) {
            for (var j = 0; j < 2; j++) {
                var encontro1 = false, encontro2 = false;
                for (var i = 0; i < arregloElementosDeListas.length; i++) {
                    if(arregloElementosDeListas[i].valor == 'PN' && j == 0) {
                        alert(cont++);
                        encontro1 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'PJ' && j == 1) {
                        encontro2 = true;
                        break;
                    }
                };
                if(!encontro1 && j == 0) {
                    createElementList(idListaTipPer[0].ID, "Persona Natural", "PN", 0);
                    arregloElementosDeListas.push({idLista: idListaTipPer[0].ID, nombre: "Persona Natural", valor: "PN", saldo: 0});
                }
                if(!encontro2 && j == 1) {
                    createElementList(idListaTipPer[0].ID, "Persona Juridica", "PJ", 0);
                    arregloElementosDeListas.push({idLista: idListaTipPer[0].ID, nombre: "Persona Juridica", valor: "PJ", saldo: 0});
                }
            }
        };

        var idListaTipSubPer = arregloListas.filter(function(object) {
                                return (object.tipo == 5 );
                            });
        if(idListaTipSubPer.length > 0) {
            for (var j = 0; j < 3; j++) {
                var encontro1 = false, encontro2 = false, encontro3 = false;
                for (var i = 0; i < arregloElementosDeListas.length; i++) {
                    if(arregloElementosDeListas[i].valor == 'SF' && j == 0) {
                        encontro1 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'NSF' && j == 1) {
                        encontro2 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'ISP' && j == 2) {
                        encontro3 = true;
                        break;
                    }
                };
                if(!encontro1 && j == 0) {
                    createElementList(idListaTipSubPer[0].ID, "Sector Financiero", "SF", 0);
                    arregloElementosDeListas.push({idLista: idListaTipSubPer[0].ID, nombre: "Sector Financiero", valor: "SF", saldo: 0});
                }
                if(!encontro2 && j == 1) {
                    createElementList(idListaTipSubPer[0].ID, "No Sector Financiero", "NSF", 0);
                    arregloElementosDeListas.push({idLista: idListaTipSubPer[0].ID, nombre: "No Sector Financiero", valor: "NSF", saldo: 0});
                }
                if(!encontro3 && j == 2) {
                    createElementList(idListaTipSubPer[0].ID, "Institución Pública", "ISP", 0);
                    arregloElementosDeListas.push({idLista: idListaTipSubPer[0].ID, nombre: "Institución Pública", valor: "ISP", saldo: 0});
                }
            };
        }
    }
}

function createElementList (idLista, nombre, valor, saldo) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into ListasVariables (idLista, nombre, valor, saldo) values ("+idLista+",'"+nombre+"','"+valor+"',"+saldo+")", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Listas Variables creation automatically');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Creation automatically Listas Variables");
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
    delete window.arregloElementosDeListas;
    delete window.contadorBandera;
    delete window.contadorCreacionesHechas;
    delete window.booleanBandera;
    delete window.loadListsSimple;
    delete window.loadLists;
    delete window.verifyElementLists;
    delete window.loadElementLists;
    delete window.createList;
    delete window.createElementList;
    delete window.cleanup;
};