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
	if(err) {
		$("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Error en conección con la base de datos.",
            overlay: true,
            closeConfirm: true
        });
    } else {
        loadElementLists();
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
                var rolledBack = false;
                transaction.on('rollback', aborted => {
                    // emited with aborted === true
                    rolledBack = true;
                });
                const request = new sql.Request(transaction);
                request.query("select * from Usuarios where Usuario = '"+ username +"' and Contrasena = '"+ password +"'", (err, result) => {
                    if (err) {
                        if (!rolledBack) {
                            transaction.rollback(err => {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Error en conección con la tabla de Usuarios.",
                                    overlay: true,
                                    closeConfirm: true
                                });
                            });
                        }
                    }  else {
                        transaction.commit(err => {
                            // ... error checks
                            if(result.recordset.length > 0) {
                                var usuario = result.recordset[0];
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
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Listas.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloListas = result.recordset;
                    } else {
                        arregloListas = [];
                    }
                    var existeManContable = false, existeCuentOperativas = false, existeExcluFOSEDE = false,
                    existePerNaturales = false, existeSubPersonas = false, existeCuentOperativasExternas = false, existeAgencias = false, existeCredito = false, existeDeposito = false;
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
                        else if(arregloListas[i].tipo == 6)
                            existeCuentOperativasExternas = true;
                        else if(arregloListas[i].tipo == 7)
                            existeAgencias = true;
                        else if(arregloListas[i].tipo == 8)
                            existeCredito = true;
                        else if(arregloListas[i].tipo == 9)
                            existeDeposito = true;
                    };
                    var listas = [{nombre: "Manual Contable", tipo: 1},{nombre: "Cuentas Operativas Balance General", tipo: 2},{nombre: "Exclusiones FOSEDE", tipo: 3},{nombre: "Tipo de Personas", tipo: 4},{nombre: "Tipo de Sub-Personas", tipo: 5},{nombre: "Cuentas Operativas de Clientes", tipo: 6},{nombre: "Agencias", tipo: 7},{nombre: "Tipos de Crédito", tipo: 8},{nombre: "Tipos de Depósito", tipo: 9}];
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
                    if(!existeCuentOperativasExternas && arregloListas.length > 0) {
                        createList(listas[5].nombre, listas[5].tipo);
                        contadorBandera++;
                    }
                    if(!existeAgencias && arregloListas.length > 0) {
                        createList(listas[6].nombre, listas[6].tipo);
                        contadorBandera++;
                    }
                    if(!existeCredito && arregloListas.length > 0) {
                        createList(listas[7].nombre, listas[7].tipo);
                        contadorBandera++;
                    }
                    if(!existeDeposito && arregloListas.length > 0) {
                        createList(listas[8].nombre, listas[8].tipo);
                        contadorBandera++;
                    }
                    if(arregloListas.length == 0) {
                        for (var i = 0; i < listas.length; i++) {
                            createList(listas[i].nombre, listas[i].tipo);
                            contadorBandera++;
                        };
                    }
                    if(arregloListas.length == 9) //si ya existen las listas pero verificar si existen los elementos de la lista
                        verifyElementLists();
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
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Listas.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
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
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Listas (nombre, tipo) values ('"+nombre+"', "+tipo+")", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en inserción en la tabla de Listas.",
                            overlay: true,
                            closeConfirm: true
                        });
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
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de ListasVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloElementosDeListas = result.recordset;
                    } else {
                        arregloElementosDeListas = [];
                    }
                    loadLists();
                });
            }
        });
    }); // fin transaction
}
function verifyElementLists () {
    if(arregloListas.length == 9) {
        var hoy = formatDateCreation( new Date() );
        var idListaTipPer = arregloListas.filter(function(object) {
                                return (object.tipo == 4 );
                            });
        if(idListaTipPer.length > 0) {
            for (var j = 0; j < 2; j++) {
                var encontro1 = false, encontro2 = false;
                for (var i = 0; i < arregloElementosDeListas.length; i++) {
                    if(arregloElementosDeListas[i].valor == 'PN' && j == 0) {
                        encontro1 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'PJ' && j == 1) {
                        encontro2 = true;
                        break;
                    }
                };
                if(!encontro1 && j == 0) {
                    createElementList(idListaTipPer[0].ID, "Persona Natural", "PN", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaTipPer[0].ID, nombre: "Persona Natural", valor: "PN", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro2 && j == 1) {
                    createElementList(idListaTipPer[0].ID, "Persona Juridica", "PJ", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaTipPer[0].ID, nombre: "Persona Juridica", valor: "PJ", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
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
                    createElementList(idListaTipSubPer[0].ID, "Sector Financiero", "SF", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaTipSubPer[0].ID, nombre: "Sector Financiero", valor: "SF", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro2 && j == 1) {
                    createElementList(idListaTipSubPer[0].ID, "No Sector Financiero", "NSF", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaTipSubPer[0].ID, nombre: "No Sector Financiero", valor: "NSF", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro3 && j == 2) {
                    createElementList(idListaTipSubPer[0].ID, "Institución Pública", "ISP", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaTipSubPer[0].ID, nombre: "Institución Pública", valor: "ISP", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
            };
        }

        var idListaCred = arregloListas.filter(function(object) {
                                return (object.tipo == 8 );
                            });
        if(idListaCred.length > 0) {
            for (var j = 0; j < 9; j++) {
                var encontro1 = false, encontro2 = false, encontro3 = false, encontro4 = false, encontro5 = false, encontro6 = false,
                    encontro7 = false, encontro8 = false, encontro9 = false;
                for (var i = 0; i < arregloElementosDeListas.length; i++) {
                    if(arregloElementosDeListas[i].valor == 'tarjetaCredito' && j == 0) {
                        encontro1 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'refinanciado' && j == 1) {
                        encontro2 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'readecuado' && j == 2) {
                        encontro3 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'prestamo' && j == 4) {
                        encontro4 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'lineaCredito' && j == 5) {
                        encontro5 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'facilidadLiquidez' && j == 6) {
                        encontro6 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'interes' && j == 7) {
                        encontro7 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'comision' && j == 8) {
                        encontro8 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'creditoInstFinanciera' && j == 9) {
                        encontro9 = true;
                        break;
                    }
                };
                if(!encontro1 && j == 0) {
                    createElementList(idListaCred[0].ID, "Tarjeta de Crédito", "tarjetaCredito", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaCred[0].ID, nombre: "Tarjeta de Crédito", valor: "tarjetaCredito", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro2 && j == 1) {
                    createElementList(idListaCred[0].ID, "Refinanciado", "refinanciado", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaCred[0].ID, nombre: "Refinanciado", valor: "refinanciado", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro3 && j == 2) {
                    createElementList(idListaCred[0].ID, "Readecuado", "readecuado", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaCred[0].ID, nombre: "Readecuado", valor: "readecuado", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro4 && j == 4) {
                    createElementList(idListaCred[0].ID, "Préstamo", "prestamo", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaCred[0].ID, nombre: "Préstamo", valor: "prestamo", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro5 && j == 5) {
                    createElementList(idListaCred[0].ID, "Linea de Crédito", "lineaCredito", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaCred[0].ID, nombre: "Linea de Crédito", valor: "lineaCredito", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro6 && j == 6) {
                    createElementList(idListaCred[0].ID, "Facilidad de Liquidez", "facilidadLiquidez", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaCred[0].ID, nombre: "Facilidad de Liquidez", valor: "facilidadLiquidez", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro7 && j == 7) {
                    createElementList(idListaCred[0].ID, "Interes", "interes", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaCred[0].ID, nombre: "Interes", valor: "interes", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro8 && j == 8) {
                    createElementList(idListaCred[0].ID, "Comisión", "comision", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaCred[0].ID, nombre: "Comisión", valor: "comision", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro9 && j == 9) {
                    createElementList(idListaCred[0].ID, "Crédito Institución Financiera", "creditoInstFinanciera", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaCred[0].ID, nombre: "Crédito Institución Financiera", valor: "creditoInstFinanciera", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
            };
        }


        var idListaDep = arregloListas.filter(function(object) {
                                return (object.tipo == 9 );
                            });
        if(idListaDep.length > 0) {
            for (var j = 0; j < 3; j++) {
                var encontro1 = false, encontro2 = false, encontro3 = false;
                for (var i = 0; i < arregloElementosDeListas.length; i++) {
                    if(arregloElementosDeListas[i].valor == 'CD' && j == 0) {
                        encontro1 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'DA' && j == 1) {
                        encontro2 = true;
                        break;
                    }
                    if(arregloElementosDeListas[i].valor == 'AV' && j == 2) {
                        encontro3 = true;
                        break;
                    }
                };
                if(!encontro1 && j == 0) {
                    createElementList(idListaDep[0].ID, "Certificado de Depósito", "CD", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaDep[0].ID, nombre: "Certificado de Depósito", valor: "CD", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro2 && j == 1) {
                    createElementList(idListaDep[0].ID, "De Ahorro", "DA", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaDep[0].ID, nombre: "De Ahorro", valor: "DA", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
                if(!encontro3 && j == 2) {
                    createElementList(idListaDep[0].ID, "A la Vista", "AV", 0, hoy, '');
                    arregloElementosDeListas.push({idLista: idListaDep[0].ID, nombre: "A la Vista", valor: "AV", saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                }
            };
        }
    }
}

function createElementList (idLista, nombre, valor, saldo, fecha, puesto) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into ListasVariables (idLista, nombre, valor, saldo, fechaCreacion, fechaCaducidad, puesto) values ("+idLista+",'"+nombre+"','"+valor+"',"+saldo+",'"+fecha+"','"+fecha+"','"+puesto+"')", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en inserción en la tabla de ListasVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
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

function formatDateCreation(date) {
    var monthNames = [
        "Ene", "Feb", "Mar",
        "Abr", "May", "Jun", "Jul",
        "Ago", "Sep", "Oct",
        "Nov", "Dec"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return year + '-' + (monthIndex+1) + '-' + day;
}

var cleanup = function () {
    delete window.electron;
    delete window.remote;
    delete window.path;
    delete window.sql;
    delete window.config;
    delete window.pool1;
    delete window.session;
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