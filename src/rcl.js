const electron = require('electron');
const remote = require('electron').remote;
const sql = require('mssql');
const nodemailer = require('nodemailer');

var user = getUser();
var password = getPassword();
var server = getServer();
var database = getDataBase();

const myWorker = new Worker("src/loading.js");

const config = {
    user: user,
    password: password,
    server: server,
    database: database,
    stream: true,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}
/*const config = {
    user: 'SA',
    password: 'password111!',
    server: 'localhost',
    database: 'RCL_Dev',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}*/

var session = remote.session;

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
		console.log('pool loaded');
        loadVariablesMainDB();
        loadVariables();
        loadVariableVariables();
        loadAllRules();
        //loadAllTotes();
        loadFosede();
        loadEmails();
        loadAlerts();
	}
});

/*var session = remote.session;

session.defaultSession.cookies.get({}, (error, cookies) => {
    var permisosVariables = false;
    for (var i = 0; i < cookies.length; i++) {
        if(cookies[i].name == "name"){
            $("#nameUser").text(cookies[i].value);
            $("#navbar_name").text(cookies[i].value);
        } else if(cookies[i].name == "formula"){
            if(cookies[i].value == "1")
                permisosVariables = true;
        } else if(cookies[i].name == "fosede"){
            if(cookies[i].value == "1")
                permisosVariables = true;
        }else if(cookies[i].name == "usuarios"){
            if(cookies[i].value == "0")
                $("#userLabel").hide();
        }
    };
    if(!permisosVariables)
        $("#varLabel").hide();
});*/

/* *************** ORDEN ***************
*   1)Traer sub-variables              *
*   2)Traer Variables                  *
*   3)Traer Formula                    *
*   4)Traer Formula de Variables       *
*   5)crear arreglo de variables y sub *
*/

var arregloVariables = [];  //todas las variables que existen en la tabla de VariablesFormula
var arregloVariablesDeVariables = [];   //todas las sub-variables que existen en la tabla de VariablesDeVariablesFormula
var variablesDeEquacion = [];   //las variables que fueron encontradas de la formula solo palabra
var variablesSolas = [];   //las variables de la tabla VariablesFormula que se encuentran en variablesDeEquacion
var subvariablesSolas = [];   //las subvariables de la tabla VariablesDeVariablesFormula que se encuentran en variablesSolas
var variablesDeSubVariablesSolas = [];   //las subvariables de las subvariables, las variables de reglas
var variablesAgrupadas = [];   //variables agrupadas por 0:Activos, 1:Depositos, 2:Prestamos
var reglasActivos = [];   //arreglo de reglas correspondiente a la posicion de la sub-var en el arreglo de variablesAgrupadas[0]
var contadorActivosReglas = 0;   //contador para entrar a dividir las reglas de los activos
var contadorDepositosReglas = 0;   //contador para entrar a dividir las reglas de los activos
var contadorPrestamosReglas = 0;   //contador para entrar a dividir las reglas de los activos
var activosInstanciasIncisos = [];   //arreglo de codigo de instanciacion de iniciso eje: [alac30, alac60, rcl30, rcl60]
var activosInstanciasSubVariables = [];   //arreglo de codigo de instanciacion de iniciso eje: [[alac130, alac230][], [alac160, alac260][]]
var activosInstanciasVarReglas = [];   //arreglo de arreglos de codigo de instanciaciones de las variables de las reglas de los incisos eje: [ [[a,b]][], [[a,b]][] ]
var activosCuerpo = [];   //arreglo de codigo de instrucciones adentro de for
var activosAlgebraica = [];   //arreglo de codigo de operaciones operaciones algebraicas algebraicas
var activosAsignacionesIncisos = [];  //arreglo codigo de asignaciones a variables. eje alac = alac1+alac2
var activosAsignacionesSubVariables = [];   //arreglo codigo de asignaciones a sub-variables. eje alac1 = var1+var2
var entroActivosGetRules = false;   //bandera para validar que fueron traidas las reglas de activos necesarias
var entroDepositosGetRules = false;   //bandera para validar que fueron traidas las reglas de depositos necesarias
var entroPrestamosGetRules = false;   //bandera para validar que fueron traidas las reglas de prestamos necesarias
var proyecciones = [];  //tipo de proyecciones a calcular
var entroActivosGetFromTable = false;   //bandera para validar que fueron traidas los valores de la tabla de activos
var entroDepositosGetFromTable = false;   //bandera para validar que fueron traidas los valores de la tabla de depositos
var entroPrestamosGetFromTable = false;   //bandera para validar que fueron traidas los valores de la tabla de prestamos
var depositosInstanciasIncisos = [];   //arreglo de codigo de instanciacion de iniciso eje: [finmin30, finmin, rcl30, rcl60]
var depositosInstanciasSubVariables = [];   //arreglo de codigo de instanciacion de iniciso eje: [[finmin130, finmin230][], [alac160, alac260][]]
var depositosCuerpo = [];   //arreglo de codigo de instrucciones adentro de for
var depositosAsignacionesIncisos = [];  //arreglo codigo de asignaciones a variables. eje finmin = finmin1+finmin2
var arregloReglas = []; //arreglo que contiene todas las reglas
var prestamosInstanciasIncisos = [];   //arreglo de codigo de instanciacion de iniciso eje: [eet30, eet60, rcl30, rcl60]
var prestamosInstanciasSubVariables = [];   //arreglo de codigo de instanciacion de iniciso eje: [[eet130, eet230][], [alac160, alac260][]]
var prestamosCuerpo = [];   //arreglo de codigo de instrucciones adentro de for
var prestamosAsignacionesIncisos = [];  //arreglo codigo de asignaciones a variables. eje eet = eet1+eet2
var arregloCuentas = [];    //arreglo de totales de cuentas
var arregloMonedas = [];    //arreglo que contiene el nombre de las monedas
var arregloAgencias = [];    //arreglo que contiene el nombre de las agencias
var totalesClientes = [];    //arreglo que contiene el total por cliente
var montoFosedeGlobal;
var equacionVariables = '';
var equacionSubVariablesConPadres = '';
var equacionSubVariables = '';
var equacionVarReglas = '';
var equacionVarCuentas = '';
var fechaSeleccionada;
var arregloVarDeVarFormula = [];
var arregloActivos = [];
var arregloDepositos = [];
var arregloPrestamos = [];
var arregloDeFiltros = [];
var arregloDeReglas = [];
var arregloCuentaAlgebraica = [];   //arreglo de cuentas que son operaciones algebraicas. EJE: 113-11702
var formulaGlobal = '';
var contadorEntrarCreateFunctionsArray = 0;
var contadorFuncionPrint = 0;
var totalesRCL = [];    //arreglo que guarda el total por proyeccion
var totalesRCLCorreos = [];    //arreglo que guarda el total por proyeccion
var arreglodeListas = [];   //arreglo que guarda las variables de las listas
var arreglodeCuenOpClientes = [];   //arreglo de cuentas operativas de clientes
var banderaLlamadasListas = 0;   //total de listas a entrar
var entradasLlamadasListas = 0;   //total de veces que ha entrado a importar listas
var minimoRCL = 0;  //valor minimo del RCL requerido por la CNBS
var arregloDeCorreos = [];  //valor que contiene las direcciones de correo electronicos y su respectivo porcentaje a enviar
var arregloDeAlertas = [];  //valor que contiene las  alertas para enviar a direcciones de correo electronicos
var tieneFiltroDepositos = false;   //var para ver si las reglas tienen filtro en depositos
var tieneFiltroPrestamos = false;   //var para ver si las reglas tienen filtro en prestamos

$('#fechaRCL').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});

var diaRCL = 0;

function loadFosede () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from FOSEDE", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de FOSEDE.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        montoFosedeGlobal = result.recordset;
                    } else {
                        montoFosedeGlobal = [];
                    }
                });
            }
        });
    }); // fin transaction
}

function loadAllTotes () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Totales ", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Totales.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        var fechaInicial, fechaFinal;
                        for (var i = 0; i < result.recordset.length; i++) {
                            if(i == 0)
                                fechaInicial = new Date(result.recordset[i].fecha.getUTCFullYear(), result.recordset[i].fecha.getUTCMonth(), result.recordset[i].fecha.getUTCDate());
                            if(i == result.recordset.length-1)
                                fechaFinal = new Date(result.recordset[i].fecha.getUTCFullYear(), result.recordset[i].fecha.getUTCMonth(), result.recordset[i].fecha.getUTCDate());
                        };
                        var diferencia = fechaFinal.getMonth() - fechaInicial.getMonth();
                        diferencia = diferencia * 31;
                        var fechasAdd = fechaFinal.getDate() - fechaInicial.getDate();
                        diaRCL = diferencia + fechasAdd + 1;
                        console.log(diaRCL);
                    } else {
                        diaRCL = 0;
                    }
                });
            }
        });
    }); // fin transaction
}

function loadAllRules () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Reglas ", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de variablePadre.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloReglas = result.recordset;
                    } else {
                        arregloReglas = [];
                    }
                });
            }
        });
    }); // fin transaction
}

function loadRules (id, i, j, k, tipo) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Reglas where variablePadre = "+id+" and esFiltro = 'false'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de Reglas.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0) {
                        if(tipo == 1) {
                            if(reglasActivos[i] == undefined)
                                reglasActivos[i] = [];
                            if(reglasActivos[i][j] == undefined)
                                reglasActivos[i][j] = [];
                            if(reglasActivos[i][j][k] == undefined)
                                reglasActivos[i][j][k] = [];
                            reglasActivos[i][j][k] = result.recordset;
                        } else if(tipo == 2) {
                            if(reglasActivos[i] == undefined)
                                reglasActivos[i] = [];
                            if(reglasActivos[i][j] == undefined)
                                reglasActivos[i][j] = [];
                            if(reglasActivos[i][j][k] == undefined)
                                reglasActivos[i][j][k] = [];
                            reglasActivos[i][j][k] = result.recordset;
                            if(!tieneFiltroDepositos) {
                                for (var q = 0; q < result.recordset.length; q++) {
                                    if(result.recordset[q].filtro != -1) {
                                        tieneFiltroDepositos = true;
                                        break;
                                    }
                                };
                            }
                        } else if(tipo == 3) {
                            if(reglasActivos[i] == undefined)
                                reglasActivos[i] = [];
                            if(reglasActivos[i][j] == undefined)
                                reglasActivos[i][j] = [];
                            if(reglasActivos[i][j][k] == undefined)
                                reglasActivos[i][j][k] = [];
                            reglasActivos[i][j][k] = result.recordset;
                            if(!tieneFiltroPrestamos) {
                                for (var q = 0; q < result.recordset.length; q++) {
                                    if(result.recordset[q].filtro != -1) {
                                        tieneFiltroPrestamos = true;
                                        break;
                                    }
                                };
                            }
                        }
                    } else {
                        if(tipo == 1) {
                            if(reglasActivos[i] == undefined)
                                reglasActivos[i] = [];
                            if(reglasActivos[i][j] == undefined)
                                reglasActivos[i][j] = [];
                            if(reglasActivos[i][j][k] == undefined)
                                reglasActivos[i][j][k] = [];
                            reglasActivos[i][j][k] = [];
                        } else if(tipo == 2) {
                            if(reglasActivos[i] == undefined)
                                reglasActivos[i] = [];
                            if(reglasActivos[i][j] == undefined)
                                reglasActivos[i][j] = [];
                            if(reglasActivos[i][j][k] == undefined)
                                reglasActivos[i][j][k] = [];
                            reglasActivos[i][j][k] = [];
                        } else if(tipo == 3) {
                            if(reglasActivos[i] == undefined)
                                reglasActivos[i] = [];
                            if(reglasActivos[i][j] == undefined)
                                reglasActivos[i][j] = [];
                            if(reglasActivos[i][j][k] == undefined)
                                reglasActivos[i][j][k] = [];
                            reglasActivos[i][j][k] = [];
                        }
                    }
                    if(tipo == 1) {
                        contadorActivosReglasDespues++;
                    } else if(tipo == 2) {
                        contadorDepositosReglasDespues++;
                    } else if(tipo == 3) {
                        contadorPrestamosReglasDespues++;
                    }
                    if(tipo == 1 && contadorActivosReglasDespues == contadorActivosReglasAntes) {
                        entroActivosGetRules = true;
                        divideAssetsRules();
                    } else if(tipo == 2 && contadorDepositosReglasDespues == contadorDepositosReglasAntes) {
                        entroDepositosGetRules = true;
                        divideDepositsRules();
                    } else if(tipo == 3 && contadorPrestamosReglasDespues == contadorPrestamosReglasAntes) {
                        entroPrestamosGetRules = true;
                        divideCreditRules();
                    }
                });
            }
        });
    }); // fin transaction
}

function loadVariablesMainDB () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from Variables", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de Variables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        var formulaMATHLIVE;
                        if(result.recordset[0].formula.length > 0){
                            formulaMATHLIVE = result.recordset[0].formulaMATHLIVE;
                            formulaGlobal = result.recordset[0].formula;
                        } else {
                            formulaMATHLIVE = null;
                            formulaGlobal = '';
                        }
                        if(formulaMATHLIVE != null)
                            $("#formulas").text("$$"+formulaMATHLIVE+"$$");
                        else{
                            $("#formulas").text("$$f(x)$$");
                        }
                        MathLive.renderMathInDocument();
                        montoFosedeGlobal = result.recordset;

                        /*if(result.recordset[0].fullLogo.length > 0){
                            $("#fullLogo").attr("src",result.recordset[0].fullLogo);
                        }
                        if(result.recordset[0].smallLogo.length > 0){
                            $("#smallLogo").attr("src",result.recordset[0].smallLogo);
                        }*/

                        minimoRCL = result.recordset[0].minimoRCL;
                    } else {
                        $("#formulas").text("$$f(x)$$");
                        MathLive.renderMathInDocument();
                        montoFosedeGlobal = [];
                    }
                });
            }
        });
    }); // fin transaction
}

function loadVariables () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from FormulaVariables", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de FormulaVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        arregloVariables = result.recordset;
                    } else{
                        arregloVariables = [];
                    }
                });
            }
        });
    }); // fin transaction
}

function loadVariableVariables () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from VariablesdeVariablesFormula", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de VariablesdeVariablesFormula.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        arregloVariablesDeVariables = result.recordset;
                    } else{
                        arregloVariablesDeVariables = [];
                    }
                });
            }
        });
    }); // fin transaction
}

function loadAssets () {
    var fechaSeleccionada = $("#fechaRCL").datepicker('getDate');
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true
        });
        const request = new sql.Request(transaction);
        request.query("select * from Activos where fecha = '"+formatDateCreation(fechaSeleccionada)+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de Activos.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        arregloActivos = result.recordset;
                        console.log('Adding Date arregloActivos...');
                        for (var i = 0; i < arregloActivos.length; i++) {
                            arregloActivos[i].fecha = new Date(arregloActivos[i].fecha.getUTCFullYear(), arregloActivos[i].fecha.getUTCMonth(), arregloActivos[i].fecha.getUTCDate());
                        };
                    } else {
                        arregloActivos = [];
                    }
                    console.log('arregloActivos');
                    console.log(arregloActivos);
                    entroActivosGetFromTable = true;
                    if(variablesAgrupadas[1].length > 0)
                        loadDeposits();
                    else if(variablesAgrupadas[2].length > 0)
                        loadCredit();
                    else
                        createMethods();
                });
            }
        });
    }); // fin transaction
}

function loadDeposits () {
    var fechaSeleccionada = $("#fechaRCL").datepicker('getDate');
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true
        });
        const request = new sql.Request(transaction);
        request.query("select * from Depositos where fecha = '"+formatDateCreation(fechaSeleccionada)+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de Depósitos.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        arregloDepositos = result.recordset;
                        console.log('Adding Date arregloDepositos...');
                        for (var i = 0; i < arregloDepositos.length; i++) {
                            arregloDepositos[i].fecha = new Date(arregloDepositos[i].fecha.getUTCFullYear(), arregloDepositos[i].fecha.getUTCMonth(), arregloDepositos[i].fecha.getUTCDate());
                        };
                    } else {
                        arregloDepositos = [];
                    }
                    entroDepositosGetFromTable = true;
                    console.log('Grouping arregloDepositos...');
                    if(tieneFiltroDepositos) {
                        for (var i = 0; i < arregloDeFiltros.length; i++) {
                            if(arregloDeFiltros[i].variables.localeCompare('2') == 0) {
                                window['arregloDepositos'+arregloDeFiltros[i].ID] = [];
                                for (var j = 0; j < arregloDepositos.length; j++) {
                                    addToArrayDeposits (arregloDeFiltros[i].ID, arregloDeFiltros[i].campoObjetivo, arregloDepositos[j]);
                                };
                            }
                        };
                    }
                    console.log('arregloDepositos');
                    console.log(arregloDepositos);
                    if(variablesAgrupadas[2].length > 0)
                        loadCredit();
                    else {
                        createMethods();
                    }
                });
            }
        });
    }); // fin transaction
}

function loadCredit () {
    var fechaSeleccionada = $("#fechaRCL").datepicker('getDate');
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true
        });
        const request = new sql.Request(transaction);
        request.query("select * from Prestamos where fecha = '"+formatDateCreationSingleDigits(fechaSeleccionada)+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de Préstamos.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        arregloPrestamos = result.recordset;
                        console.log('Adding Date arregloPrestamos...');
                        for (var i = 0; i < arregloPrestamos.length; i++) {
                            arregloPrestamos[i].fecha = new Date(arregloPrestamos[i].fecha.getUTCFullYear(), arregloPrestamos[i].fecha.getUTCMonth(), arregloPrestamos[i].fecha.getUTCDate());
                            arregloPrestamos[i].fechaInicio = new Date(arregloPrestamos[i].fechaInicio.getUTCFullYear(), arregloPrestamos[i].fechaInicio.getUTCMonth(), arregloPrestamos[i].fechaInicio.getUTCDate());
                            arregloPrestamos[i].fechaFinal = new Date(arregloPrestamos[i].fechaFinal.getUTCFullYear(), arregloPrestamos[i].fechaFinal.getUTCMonth(), arregloPrestamos[i].fechaFinal.getUTCDate());
                        };
                    } else {
                        arregloPrestamos = [];
                    }
                    entroPrestamosGetFromTable = true;
                    console.log('Grouping arregloPrestamos...');
                    if(tieneFiltroPrestamos) {
                        for (var i = 0; i < arregloDeFiltros.length; i++) {
                            if(arregloDeFiltros[i].variables.localeCompare('3') == 0) {
                                window['arregloPrestamos'+arregloDeFiltros[i].ID] = [];
                                for (var j = 0; j < arregloPrestamos.length; j++) {
                                    addToArrayCredits (arregloDeFiltros[i].ID, arregloDeFiltros[i].campoObjetivo, arregloPrestamos[j]);
                                };
                            }
                        };
                    }
                    console.log('arregloPrestamos');
                    console.log(arregloPrestamos);
                    createMethods();
                });
            }
        });
    }); // fin transaction
}

function loadLists () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Listas where tipo != 1 and tipo != 2 and tipo != 7", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de FormulaVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        banderaLlamadasListas = result.recordset.length;
                        for (var i = 0; i < result.recordset.length; i++) {
                            if(result.recordset[i].tipo == 6) {
                                loadListsCuentasClientes(result.recordset[i].ID);
                            } else {
                                loadListsVariables(result.recordset[i].ID);
                            }
                        };
                    }
                });
            }
        });
    }); // fin transaction
}

function loadListsCuentasClientes (id) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables where idLista = "+id, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de FormulaVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    if(result.recordset.length > 0) {
                        arreglodeCuenOpClientes = result.recordset;
                    }
                    entradasLlamadasListas++;
                    verificarBanderaListas();
                });
            }
        });
    }); // fin transaction
}

function loadListsVariables (id) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables where idLista = "+id, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de FormulaVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        $.merge( arreglodeListas, result.recordset );
                    }
                    console.log('arreglodeListas')
                    console.log(arreglodeListas)
                    entradasLlamadasListas++;
                    verificarBanderaListas();
                });
            }
        });
    }); // fin transaction
}

function loadFilter () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Reglas where esFiltro = '"+true+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de FormulaVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        arregloDeFiltros = result.recordset;
                    } else {
                        arregloDeFiltros = [];
                    }
                    loadLists();
                });
            }
        });
    }); // fin transaction
}

function addToArrayDeposits (id, field, newObject) {
    binaryInsert(newObject, window['arregloDepositos'+id], field)
}

function addToArrayCredits (id, field, newObject) {
    binaryInsert(newObject, window['arregloPrestamos'+id], field);
}

function binaryInsert(value, array, field, startVal, endVal){
    var length = array.length;
    var start = typeof(startVal) != 'undefined' ? startVal : 0;
    var end = typeof(endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
    var m = start + Math.floor((end - start)/2);
    if(length == 0) {
        array.push(value);
        return;
    }
    if(value[field] == array[m][field]){
        array[m].saldo+=value.saldo;
        return;
    }
    if(value[field] > array[end][field]){
        array.splice(end + 1, 0, value);
        return;
    }
    if(value[field] < array[start][field]) {//!!
        array.splice(start, 0, value);
        return;
    }
    if(start >= end){
        return;
    }
    if(value[field] < array[m][field]){
        binaryInsert(value, array, field, start, m - 1);
        return;
    }
    if(value[field] > array[m][field]){
        binaryInsert(value, array, field, m + 1, end);
        return;
    }
    //we don't insert duplicates
}

function loadEmails () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Correos", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de FormulaVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    if(result.recordset.length > 0) {
                        arregloDeCorreos = result.recordset;
                    } else {
                        arregloDeCorreos = [];
                    }
                });
            }
        });
    }); // fin transaction
}

function loadAlerts () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from EnviarCorreos", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conneción con tabla de enviarcorreos.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    arregloDeAlertas = result.recordset;
                });
            }
        });
    }); // fin transaction
}























//	**********		Calculo RCL		**********
function checkFormulaExists () {
    proyecciones = [];
    reglasActivos = [];
    $("input[name='dias']:checked").each(function() {
        proyecciones.push($(this).val());
    });
    if(proyecciones.length > 0) {
        //fechaSeleccionada = $("#fechaRCL").datepicker('getDate');
        fechaSeleccionada = new Date($("#fechaRCL").datepicker('getDate').getFullYear(), $("#fechaRCL").datepicker('getDate').getMonth(), $("#fechaRCL").datepicker('getDate').getDate());
        console.log('fechaSeleccionada = '+fechaSeleccionada)
        if (Object.prototype.toString.call(fechaSeleccionada) === "[object Date]") {
            if (isNaN(fechaSeleccionada.getTime())) {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Ingrese una fecha valida para tomar los valores de la tabla.",
                    overlay: true,
                    closeConfirm: true
                });
            } else {
                if (formulaGlobal.length > 0) {
                    variablesDeEquacion = [];
                    /*variablesSolas = [];
                    subvariablesSolas = [];
                    variablesDeSubVariablesSolas = [];
                    variablesAgrupadas = [];
                    activosInstanciasIncisos = [];
                    activosInstanciasSubVariables = [];
                    activosInstanciasVarReglas = [];
                    reglasActivos = [];
                    activosCuerpo = [];
                    activosAlgebraica = [];
                    activosAsignacionesIncisos = [];
                    activosAsignacionesSubVariables = [];
                    depositosInstanciasIncisos = [];
                    depositosInstanciasSubVariables = [];
                    depositosCuerpo = [];
                    depositosAsignacionesIncisos = [];
                    arregloReglas = [];
                    prestamosInstanciasIncisos = [];
                    prestamosInstanciasSubVariables = [];
                    prestamosCuerpo = [];
                    prestamosAsignacionesIncisos = [];
                    arregloActivos = []*/
                    variablesDeEquacion = [];
                    variablesSolas = [];
                    subvariablesSolas = [];
                    variablesDeSubVariablesSolas = [];
                    variablesAgrupadas = [];
                    reglasActivos = [];
                    contadorActivosReglas = 0;
                    contadorDepositosReglas = 0;
                    contadorPrestamosReglas = 0;
                    activosInstanciasIncisos = [];
                    activosInstanciasSubVariables = [];
                    activosInstanciasVarReglas = [];
                    activosCuerpo = [];
                    activosAlgebraica = [];
                    activosAsignacionesIncisos = [];
                    activosAsignacionesSubVariables = [];
                    entroActivosGetRules = false;
                    entroDepositosGetRules = false;
                    entroPrestamosGetRules = false;
                    entroActivosGetFromTable = false;
                    entroDepositosGetFromTable = false;
                    entroPrestamosGetFromTable = false;
                    depositosInstanciasIncisos = [];
                    depositosInstanciasSubVariables = [];
                    depositosCuerpo = [];
                    depositosAsignacionesIncisos = [];
                    prestamosInstanciasIncisos = [];
                    prestamosInstanciasSubVariables = [];
                    prestamosCuerpo = [];
                    prestamosAsignacionesIncisos = [];
                    arregloCuentas = [];
                    montoFosedeGlobal;
                    equacionVariables = '';
                    equacionSubVariablesConPadres = '';
                    equacionSubVariables = '';
                    equacionVarReglas = '';
                    equacionVarCuentas = '';
                    arregloVarDeVarFormula = [];
                    arregloActivos = [];
                    arregloDepositos = [];
                    arregloPrestamos = [];
                    arregloDeFiltros = [];
                    arregloDeReglas = [];
                    arregloCuentaAlgebraica = [];
                    contadorEntrarCreateFunctionsArray = 0;
                    contadorFuncionPrint = 0;
                    arregloMonedas = [];
                    arregloAgencias = [];
                    totalesClientes = [];
                    totalesRCL = [];
                    totalesRCLCorreos = [];
                    banderaLlamadasListas = 0;
                    entradasLlamadasListas = 0;
                    tieneFiltroDepositos = false;
                    tieneFiltroPrestamos = false;
                    timer = 0;
                    $("#descripcionLoading").text('');
                    for (var i = 0; i < formulaGlobal.length; i++) {
                        if(formulaGlobal.charAt(i) != "(" && formulaGlobal.charAt(i) != ")" && formulaGlobal.charAt(i) != "<" && formulaGlobal.charAt(i) != ">" && 
                            formulaGlobal.charAt(i) != "!" && formulaGlobal.charAt(i) != "=" && formulaGlobal.charAt(i) != "/" && formulaGlobal.charAt(i) != "*" && 
                            formulaGlobal.charAt(i) != "√" && formulaGlobal.charAt(i) != "+" && formulaGlobal.charAt(i) != "-" && isNaN(formulaGlobal.charAt(i))) {
                            var pal = getVariable(formulaGlobal, i);
                            variablesDeEquacion.push(pal);
                            i+=pal.length;
                        }
                    };
                    //searchAndCreateArrays();
                    //loadLists();
                    loadFilter();
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "No existe una fórmula guardada en la base de datos.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese una fecha para tomar los valores de la tabla.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Seleccione por lo menos un horizonte de días a calcular.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function verificarBanderaListas () {
    if(banderaLlamadasListas == entradasLlamadasListas){
        searchAndCreateArrays();
    }
}

function getVariable (equacion, index) {
    var variable = '';
    for (var i = index; i < equacion.length; i++) {
        if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
            equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
            equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-")
            variable+=equacion[i];
        else
            return variable;
    };
    return variable;
}

function searchAndCreateArrays () {
    var entroSubVariables = false;
    for (var t = 0; t < proyecciones.length; t++) {
        if(variablesSolas[t] == undefined)
            variablesSolas[t] = [];
        if(subvariablesSolas[t] == undefined)
            subvariablesSolas[t] = [];
        if(variablesDeSubVariablesSolas[t] == undefined)
            variablesDeSubVariablesSolas[t] = [];
        for (var j = 0; j < variablesDeEquacion.length; j++) {
            for (var i = 0; i < arregloVariables.length; i++) {
                if (variablesDeEquacion[j].toLowerCase().localeCompare(arregloVariables[i].variables.toLowerCase()) == 0 ) {
                    variablesSolas[t].push({ID: arregloVariables[i].ID, variable: arregloVariables[i].variables, formula: arregloVariables[i].formula, tipoProyeccion: proyecciones[t], total: 0, dia: fechaSeleccionada, numerador: 0, denominador: 0, volumenFormula: 0, influenciaFormula: 0, moneda: "Lempira", calculada: false, varPadre: "", tablaAplicar: 99, sucursal: "", tipo: "variable", esRCL: false, totalRCL: 0, esNumerador: false});
                }
            };
        };
        //Agregando si tiene variable padre en formula
        for (var j = 0; j < variablesSolas[t].length; j++) {
            var subvariablesTemp = [];
            for (var i = 0; i < variablesSolas[t][j].formula.length; i++) {
                if(variablesSolas[t][j].formula.charAt(i) != "(" && variablesSolas[t][j].formula.charAt(i) != ")" && variablesSolas[t][j].formula.charAt(i) != "<" && variablesSolas[t][j].formula.charAt(i) != ">" && 
                    variablesSolas[t][j].formula.charAt(i) != "!" && variablesSolas[t][j].formula.charAt(i) != "=" && variablesSolas[t][j].formula.charAt(i) != "/" && variablesSolas[t][j].formula.charAt(i) != "*" && 
                    variablesSolas[t][j].formula.charAt(i) != "√" && variablesSolas[t][j].formula.charAt(i) != "+" && variablesSolas[t][j].formula.charAt(i) != "-" && isNaN(variablesSolas[t][j].formula.charAt(i))) {
                    var pal = getVariable(variablesSolas[t][j].formula, i);
                    subvariablesTemp.push(pal);
                    i+=pal.length;
                }
            };
            for (var i = 0; i < subvariablesTemp.length; i++) {
                for (var k = 0; k < arregloVariables.length; k++) {
                    if (subvariablesTemp[i].toLowerCase().localeCompare(arregloVariables[k].variables.toLowerCase()) == 0 ) {
                        variablesSolas[t].push({ID: arregloVariables[k].ID, variable: arregloVariables[k].variables, formula: arregloVariables[k].formula, tipoProyeccion: proyecciones[t], total: 0, dia: fechaSeleccionada, numerador: 0, denominador: 0, volumenFormula: 0, influenciaFormula: 0, moneda: "Lempira", calculada: false, varPadre: variablesSolas[t][j].variable, tablaAplicar: 99, sucursal: "", tipo: "variable", esRCL: false, totalRCL: 0, esNumerador: false});
                    }
                };
            };
        };
        for (var j = 0; j < variablesSolas[t].length; j++) {
            var subvariablesTemp = [];
            for (var i = 0; i < variablesSolas[t][j].formula.length; i++) {
                if(variablesSolas[t][j].formula.charAt(i) != "(" && variablesSolas[t][j].formula.charAt(i) != ")" && variablesSolas[t][j].formula.charAt(i) != "<" && variablesSolas[t][j].formula.charAt(i) != ">" && 
                    variablesSolas[t][j].formula.charAt(i) != "!" && variablesSolas[t][j].formula.charAt(i) != "=" && variablesSolas[t][j].formula.charAt(i) != "/" && variablesSolas[t][j].formula.charAt(i) != "*" && 
                    variablesSolas[t][j].formula.charAt(i) != "√" && variablesSolas[t][j].formula.charAt(i) != "+" && variablesSolas[t][j].formula.charAt(i) != "-" && isNaN(variablesSolas[t][j].formula.charAt(i))) {
                    var pal = getVariable(variablesSolas[t][j].formula, i);
                    subvariablesTemp.push(pal);
                    i+=pal.length;
                }
            };
            if(subvariablesSolas[t][j] == undefined)
                subvariablesSolas[t][j] = [];
            if(variablesDeSubVariablesSolas[t][j] == undefined)
                variablesDeSubVariablesSolas[t][j] = [];
            for (var i = 0; i < subvariablesTemp.length; i++) {
                for (var k = 0; k < arregloVariablesDeVariables.length; k++) {
                    if (subvariablesTemp[i].toLowerCase().localeCompare(arregloVariablesDeVariables[k].nombre.toLowerCase()) == 0 ) {
                        subvariablesSolas[t][j].push({ID: arregloVariablesDeVariables[k].ID, variable: arregloVariablesDeVariables[k].nombre, factor: arregloVariablesDeVariables[k].factor, tablaAplicar: arregloVariablesDeVariables[k].tablaAplicar, tipoProyeccion: proyecciones[t], total: 0, dia: fechaSeleccionada, numerador: 0, denominador: 0, volumenFormula: 0, influenciaFormula: 0, moneda: "Lempira", calculada: false, varPadre: variablesSolas[t][j].variable, sucursal: "", tipo: "subVariable", esRCL: false, totalRCL: 0, esNumerador: false, formula: ""});
                        entroSubVariables = true;
                    }
                };
            };
        };
    };
    if(entroSubVariables) {
        groupArray();
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Las variables de la formula no tienen sub-variables asociadas.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function groupArray () {
    myWorker.postMessage("init");
    $( ".loadingScreen" ).fadeIn( "slow", function() {
    });
    variablesAgrupadas[0] = [];
    variablesAgrupadas[1] = [];
    variablesAgrupadas[2] = [];
    for (var i = 0; i < subvariablesSolas.length; i++) {
        for (var j = 0; j < subvariablesSolas[i].length; j++) {
            for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                if(subvariablesSolas[i][j][k].tablaAplicar == 1)
                    variablesAgrupadas[0].push(subvariablesSolas[i]);
                else if(subvariablesSolas[i][j][k].tablaAplicar == 2)
                    variablesAgrupadas[1].push(subvariablesSolas[i]);
                else if(subvariablesSolas[i][j][k].tablaAplicar == 3)
                    variablesAgrupadas[2].push(subvariablesSolas[i]);
            };
        };
    };

    var fechaSeleccionada = $("#fechaRCL").datepicker('getDate');

    /* **** ACTIVOS **** */
    contadorActivosReglasAntes = 0;
    contadorActivosReglasDespues = 0;
    entroActivosGetRules = false;
    if(variablesAgrupadas[0].length == 0) {
        entroActivosGetRules = true;
        checkLoadRules();
    }

    /* **** DEPOSITOS **** */
    contadorDepositosReglasAntes = 0;
    contadorDepositosReglasDespues = 0;
    entroDepositosGetRules = false;
    if(variablesAgrupadas[1].length == 0) {
        entroDepositosGetRules = true;
        checkLoadRules();
    }

    /* **** PRESTAMOS **** */
    contadorPrestamosReglasAntes = 0;
    contadorPrestamosReglasDespues = 0;
    entroPrestamosGetRules = false;
    if(variablesAgrupadas[2].length == 0) {
        entroPrestamosGetRules = true;
        checkLoadRules();
    }
    for (var i = 0; i < subvariablesSolas.length; i++) {
        for (var j = 0; j < subvariablesSolas[i].length; j++) {
            for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                if(subvariablesSolas[i][j][k].tablaAplicar == 1) {
                    contadorActivosReglasAntes++;
                    loadRules(subvariablesSolas[i][j][k].ID, i, j, k, 1);
                    if(k == 0)
                        activosInstanciasIncisos.push({codigo:"\tvar "+variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+" = 0;", variable: variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});
                } else if(subvariablesSolas[i][j][k].tablaAplicar == 2) {
                    contadorDepositosReglasAntes++;
                    loadRules(subvariablesSolas[i][j][k].ID, i, j, k, 2);
                    if(k == 0)
                        depositosInstanciasIncisos.push({codigo:"\tvar "+variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+" = 0;", variable: variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});
                } else if(subvariablesSolas[i][j][k].tablaAplicar == 3) {
                    contadorPrestamosReglasAntes++;
                    loadRules(subvariablesSolas[i][j][k].ID, i, j, k, 3);
                    if(k == 0)
                        prestamosInstanciasIncisos.push({codigo:"\tvar "+variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+" = 0;", variable: variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});
                }
            };
        };
    };
    /*for (var i = 0; i < variablesAgrupadas[0].length; i++) {
        loadRules(variablesAgrupadas[0][i].ID, i, 1);
        activosInstanciasIncisos.push({codigo:"\tvar "+variablesAgrupadas[0][i].nombre+" = 0;", variable:variablesAgrupadas[0][i].nombre});
        totalesVariables.push([{variable:variablesAgrupadas[0][i].nombre, total:0, dia: fechaSeleccionada, tipoProyeccion: 0, denominador:0, numerador:0, tablaTipo:1}]);
    };
    if(variablesAgrupadas[0].length == 0) {
        entroActivosGetRules = true;
        divideAssetsRules();
    }*/

    /* **** DEPOSITOS **** */
    /*contadorDepositosReglas = 0;
    entroDepositosGetRules = false;
    for (var i = 0; i < variablesAgrupadas[1].length; i++) {
        loadRules(variablesAgrupadas[0][i].ID, i, 2);
        activosInstancias.push("\tvar "+variablesAgrupadas[0][i].nombre+" = 0;");
    };*/
    

    /* **** PRESTAMOS **** */
    /*contadorPrestamosReglas = 0;
    entroPrestamosGetRules = false;
    for (var i = 0; i < variablesAgrupadas[2].length; i++) {
        loadRules(variablesAgrupadas[0][i].ID, i, 3);
        activosInstancias.push("\tvar "+variablesAgrupadas[0][i].nombre+" = 0;");
    };*/
}

function divideAssetsRules () {
    if(contadorActivosReglasDespues == contadorActivosReglasAntes) {
        //var fechaSeleccionada = $("#fechaRCL").datepicker('getDate');
        for (var i = 0; i < reglasActivos.length; i++) {
            if(reglasActivos[i] != undefined) {
                if(variablesDeSubVariablesSolas[i] == undefined)
                    variablesDeSubVariablesSolas[i] = [];
                if(activosAlgebraica[i] == undefined)
                    activosAlgebraica[i] = [];
                if(activosInstanciasVarReglas[i] == undefined)
                    activosInstanciasVarReglas[i] = [];
                if(arregloCuentas[i] == undefined)
                    arregloCuentas[i] = [];
                for (var j = 0; j < reglasActivos[i].length; j++) {
                    if(reglasActivos[i][j] != undefined) {
                        if(variablesDeSubVariablesSolas[i][j] == undefined)
                            variablesDeSubVariablesSolas[i][j] = [];
                        if(activosAlgebraica[i][j] == undefined)
                            activosAlgebraica[i][j] = [];
                        if(activosInstanciasVarReglas[i][j] == undefined)
                            activosInstanciasVarReglas[i][j] = [];
                        if(arregloCuentas[i][j] == undefined)
                            arregloCuentas[i][j] = [];
                        for (var k = 0; k < reglasActivos[i][j].length; k++) {
                            if(reglasActivos[i][j][k] != undefined) {
                                if(variablesDeSubVariablesSolas[i][j][k] == undefined)
                                    variablesDeSubVariablesSolas[i][j][k] = [];
                                if(activosAlgebraica[i][j][k] == undefined)
                                    activosAlgebraica[i][j][k] = [];
                                if(activosInstanciasVarReglas[i][j][k] == undefined)
                                    activosInstanciasVarReglas[i][j][k] = [];
                                if(arregloCuentas[i][j][k] == undefined)
                                    arregloCuentas[i][j][k] = [];
                                for (var n = 0; n < reglasActivos[i][j][k].length; n++) {
                                    if(arregloCuentas[i][j][k][n]  == undefined)
                                        arregloCuentas[i][j][k][n] = []
                                    if(reglasActivos[i][j][k][n] != undefined) {
                                        if (reglasActivos[i][j][k][n].campoObjetivo.indexOf("INSTANCIACION") == 0) {

                                            variablesDeSubVariablesSolas[i][j][k].push({ID: reglasActivos[i][j][k][n].ID, variable:reglasActivos[i][j][k][n].variables, total: 0, dia: fechaSeleccionada, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, numerador: 0, denominador: 0, volumenFormula: 0, influenciaFormula: 0, moneda: "Lempira", varPadre: subvariablesSolas[i][j][k].variable, tablaAplicar: subvariablesSolas[i][j][k].tablaAplicar, sucursal: "", tipo: "varDeSubVariable", esRCL: false, totalRCL: 0, esNumerador: false, formula: ""});

                                            activosInstanciasVarReglas[i][j][k].push({codigo:"\tvar "+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: reglasActivos[i][j][k][n].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, sucursal: ""});

                                            var listaCuentas = reglasActivos[i][j][k][n].valor.split("=")[1].split(",");
                                            for (var l = 0; l < listaCuentas.length; l++) {
                                                if(reglasActivos[i][j][k][n].valor.split("=")[0].localeCompare("IDS") != 0) {
                                                    activosCuerpo.push("\tif ( arregloActivos[i].cuenta.localeCompare('"+listaCuentas[l]+"') == 0 ) {")
                                                    activosCuerpo.push("\t\tvar saldoConFactor = arregloActivos[i].saldo * getFactor("+reglasActivos[i][j][k][n].variablePadre+");");
                                                    activosCuerpo.push("\t\t"+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+"+=saldoConFactor;");
                                                    activosCuerpo.push("\t\tinsertarCuenta(arregloActivos[i].cuenta, arregloActivos[i].saldo, "+subvariablesSolas[i][j][k].tipoProyeccion+", "+k+", "+n+", arregloActivos[i].moneda.toLowerCase(), arregloActivos[i].sucursal.toLowerCase());");
                                                    //(nombreVariable, valorVariable, tipoProyeccion, kFor, nFor, moneda, agencia)
                                                    activosCuerpo.push("\t}");
                                                    var posCuenta = existeCuenta(listaCuentas[l], subvariablesSolas[i][j][k].tipoProyeccion);
                                                    var signo = '';
                                                    for (var f = 0; f < reglasActivos[i][j][k].length; f++) {
                                                        //Valor porque es la segunda variable de operacion (la primera siempre es suma)
                                                        if( reglasActivos[i][j][k][f].valor.includes(reglasActivos[i][j][k][n].variables) ) {
                                                            signo = reglasActivos[i][j][k][f].operacion;
                                                            //break;
                                                        }
                                                    };
                                                    if( l > 0 )
                                                        signo = '+';
                                                    //if( posCuenta == -1)
                                                        arregloCuentas[i][j][k][n].push({variable: listaCuentas[l], total: 0, dia: fechaSeleccionada, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, numerador: 0, denominador: 0, volumenFormula: 0, influenciaFormula: 0, moneda: "Lempira", tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, tablaAplicar: subvariablesSolas[i][j][k].tablaAplicar, varPadre: variablesDeSubVariablesSolas[i][j][k][variablesDeSubVariablesSolas[i][j][k].length-1].variable, signo: signo, precioUnidad: 0, sucursal: "", tipo: "cuenta", esRCL: false, totalRCL: 0, esNumerador: false, formula: ""});
                                                } else {
                                                    var signo = '';
                                                    for (var f = 0; f < reglasActivos[i][j][k].length; f++) {
                                                        //Valor porque es la segunda variable de operacion (la primera siempre es suma)
                                                        if( reglasActivos[i][j][k][f].valor.includes(reglasActivos[i][j][k][n].variables) ) {
                                                            signo = reglasActivos[i][j][k][f].operacion;
                                                            //break;
                                                        }
                                                    };
                                                    if( l > 0 )
                                                        signo = '+';
                                                    activosCuerpo.push("\tif(entrarVariablesLista) {");
                                                    activosCuerpo.push("\t\t"+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+"+="+getListValue(listaCuentas[l], "IDS")+";");
                                                    arregloCuentas[i][j][k][n].push({variable: reglasActivos[i][j][k][n].variables, total: 0, dia: fechaSeleccionada, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, numerador: 0, denominador: 0, volumenFormula: 0, influenciaFormula: 0, moneda: "Lempira", tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, tablaAplicar: subvariablesSolas[i][j][k].tablaAplicar, varPadre: variablesDeSubVariablesSolas[i][j][k][variablesDeSubVariablesSolas[i][j][k].length-1].variable, signo: signo, precioUnidad: 0, sucursal: "", tipo: "cuenta", esRCL: false, totalRCL: 0, esNumerador: false, formula: ""});
                                                    activosCuerpo.push("\t\tinsertarCuenta('"+reglasActivos[i][j][k][n].variables+"', "+getListValue(listaCuentas[l], "IDS")+", "+subvariablesSolas[i][j][k].tipoProyeccion+", "+k+", "+n+", arregloActivos[i].moneda.toLowerCase(), arregloActivos[i].sucursal.toLowerCase());");
                                                    activosCuerpo.push("\t}");
                                                }
                                            };
                                            /*var pos = activosAsignacionesIncisosContieneVar(variablesSolas[i][j].variable, variablesSolas[i][j].tipoProyeccion);
                                            if( pos >= 0 && n == 0) {
                                                var signo = getSign(subvariablesSolas[i][j][k].variable, variablesSolas[i][j].formula);
                                                activosAsignacionesIncisos[pos].codigo+=signo+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion;
                                            } else if( n == 0) {
                                                activosAsignacionesIncisos.push({codigo: variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+"="+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, variable: variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion, formula: variablesSolas[i][j].formula});
                                            }*/
                                            var posSubVar = activosAsignacionesSubVarContieneVar(variablesSolas[i][j].variable, variablesSolas[i][j].tipoProyeccion);
                                            if( posSubVar >= 0) {
                                                activosAsignacionesSubVariables[posSubVar].codigo+="+"+reglasActivos[i][j][k][n].variable+reglasActivos[i][j][k][n].tipoProyeccion;
                                            } else {
                                                activosAsignacionesSubVariables.push({codigo: subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+"="+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, variable: subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, nombreVariable: subvariablesSolas[i][j][k].variable, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                            }
                                        } else if (reglasActivos[i][j][k][n].campoObjetivo.indexOf("AGRUPACION") == 0) {
                                            activosAlgebraica[i][j][k].push({codigo:"\t"+reglasActivos[i][j][k][n].campoObjetivo.split("=")[1]+subvariablesSolas[i][j][k].tipoProyeccion+" "+reglasActivos[i][j][k][n].operacion+" "+reglasActivos[i][j][k][n].valor.split("=")[1]+subvariablesSolas[i][j][k].tipoProyeccion+";", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: reglasActivos[i][j][k][n].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                            variablesDeSubVariablesSolas[i][j][k].push({ID: reglasActivos[i][j][k][n].ID, variable:reglasActivos[i][j][k][n].variables, total: 0, dia: fechaSeleccionada, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, numerador: 0, denominador: 0, volumenFormula: 0, influenciaFormula: 0, moneda: "Lempira", varPadre: subvariablesSolas[i][j][k].variable, tablaAplicar: subvariablesSolas[i][j][k].tablaAplicar, sucursal: "", tipo: "varDeSubVariable", esRCL: false, totalRCL: 0, esNumerador: false, formula: ""});
                                            var cuenta1 = '', cuenta2 = '';
                                            for (var m = 0; m < reglasActivos[i][j][k].length; m++) {
                                                if(reglasActivos[i][j][k][m].variables.localeCompare(reglasActivos[i][j][k][n].campoObjetivo.split("=")[1]) == 0) {
                                                    var listaCuentas = reglasActivos[i][j][k][m].valor.split("=")[1].split(",");
                                                    cuenta1 = "(";
                                                    for (var l = 0; l < listaCuentas.length; l++) {
                                                        cuenta1+=listaCuentas[l];
                                                        if(l+1 != listaCuentas.length)
                                                            cuenta1+="+";
                                                    };
                                                    cuenta1 += ")";
                                                }
                                                if(reglasActivos[i][j][k][m].variables.localeCompare(reglasActivos[i][j][k][n].valor.split("=")[1]) == 0) {
                                                    var listaCuentas = reglasActivos[i][j][k][m].valor.split("=")[1].split(",");
                                                    cuenta2 = "(";
                                                    for (var l = 0; l < listaCuentas.length; l++) {
                                                        cuenta2+=listaCuentas[l];
                                                        if(l+1 != listaCuentas.length)
                                                            cuenta2+="+";
                                                    };
                                                    cuenta2 += ")";
                                                }
                                            };
                                            arregloCuentas[i][j][k][n].push({variable: cuenta1+reglasActivos[i][j][k][n].operacion+cuenta2, total: 0, dia: fechaSeleccionada, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, numerador: 0, denominador: 0, volumenFormula: 0, influenciaFormula: 0, moneda: "Lempira", tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, tablaAplicar: subvariablesSolas[i][j][k].tablaAplicar, varPadre: variablesDeSubVariablesSolas[i][j][k][variablesDeSubVariablesSolas[i][j][k].length-1].variable, signo: "+", precioUnidad: 0, sucursal: "", tipo: "cuenta", esRCL: false, totalRCL: 0, varDeCuenta: reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, esNumerador: false, formula: ""});
                                            arregloCuentaAlgebraica.push({codigo: "\tsaveCuentaAlgebraica("+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+", '"+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+"', arregloActivos[i].moneda.toLowerCase(), arregloActivos[i].sucursal.toLowerCase());"});
                                        }
                                    }
                                };
                            }
                        };
                    }
                };
            }
        };
        for (var i = 0; i < subvariablesSolas.length; i++) {
            if(activosInstanciasSubVariables[i] == undefined)
                activosInstanciasSubVariables[i] = [];
            for (var j = 0; j < subvariablesSolas[i].length; j++) {
                if(activosInstanciasSubVariables[i][j] == undefined)
                    activosInstanciasSubVariables[i][j] = [];
                for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                    activosInstanciasSubVariables[i][j].push({codigo:"\tvar "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: subvariablesSolas[i][j][k].variable, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                };
            };
        };
        checkLoadRules();
    }
}

function getSign (variable, equacion) {
    var signo = '+';
    for (var i = 0; i < equacion.length; i++) {
        if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
            equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
            equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-" && isNaN(equacion.charAt(i))) {
            var pal = getVariable(equacion, i);
            if(pal.toLowerCase().localeCompare(variable.toLowerCase()) == 0) {
                return signo;
            }
            i+=pal.length-1;
        } else {
            signo = equacion.charAt(i);
        }
    };
    return signo;
}

function existeCuenta (cuenta, tipoProyeccion) {
    for (var i = 0; i < arregloCuentas.length; i++) {
        if(arregloCuentas[i] != undefined) {
            for (var j = 0; j < arregloCuentas[i].length; j++) {
                if(arregloCuentas[i][j] != undefined) {
                    for (var k = 0; k < arregloCuentas[i][j].length; k++) {
                        if(arregloCuentas[i][j][k] != undefined) {
                            for (var n = 0; n < arregloCuentas[i][j][k].length; n++) {
                                if(arregloCuentas[i][j][k][n] != undefined) {
                                    for (var z = 0; z < arregloCuentas[i][j][k][n].length; z++) {
                                        if(arregloCuentas[i][j][k][n][z].variable.localeCompare(cuenta) == 0 && arregloCuentas[i][j][k][n][z].tipoProyeccion == tipoProyeccion)
                                            return i;
                                    };
                                }
                            };
                        }
                    };
                }
            };
        }
    };
    return -1;
}

function divideDepositsRules () {
    if(contadorDepositosReglasDespues == contadorDepositosReglasAntes) {
        var fechaSeleccionada = $("#fechaRCL").datepicker('getDate');
        for (var i = 0; i < subvariablesSolas.length; i++) {
            if(subvariablesSolas[i] != undefined) {
                if(variablesDeSubVariablesSolas[i] == undefined)
                    variablesDeSubVariablesSolas[i] = [];
                for (var j = 0; j < subvariablesSolas[i].length; j++) {
                    if(subvariablesSolas[i][j] != undefined) {
                        if(variablesDeSubVariablesSolas[i][j] == undefined)
                            variablesDeSubVariablesSolas[i][j] = [];
                        for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                            if(subvariablesSolas[i][j][k] != undefined) {
                                if(variablesDeSubVariablesSolas[i][j][k] == undefined)
                                    variablesDeSubVariablesSolas[i][j][k] = [];
                                if(subvariablesSolas[i][j][k].tablaAplicar == 2) {
                                    depositosInstanciasSubVariables.push({codigo:"\tvar "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, nombreVariable: subvariablesSolas[i][j][k].variable, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, moneda: subvariablesSolas[i][j][k].moneda.toLowerCase()});
                                    /*if(!contieneVariablePadreEnFormula(i, j)) {
                                        var pos = depositosAsignacionesIncisosContieneVar(variablesSolas[i][j].variable, variablesSolas[i][j].tipoProyeccion);
                                        if(pos >= 0)
                                            depositosAsignacionesIncisos[pos].codigo+=" + "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion;
                                        else
                                            depositosAsignacionesIncisos.push({codigo:"\t"+variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+" = "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, variable:variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});
                                    }*/
                                    for (var n = 0; n < reglasActivos[i][j][k].length; n++) {
                                        if(reglasActivos[i][j][k][n] != undefined && reglasActivos[i][j][k][n].reglaPadre == 0) {
                                            var resultado = campoObjetivoDepositos(reglasActivos[i][j][k][n], [], 2, subvariablesSolas[i][j][k].variable, subvariablesSolas[i][j][k].tipoProyeccion);
                                            resultado[0].codigo = "\n"+resultado[0].codigo;
                                            $.merge( depositosCuerpo, resultado );
                                        }
                                    };
                                }
                            }
                        };
                    }
                };
            }
        };
        /*for (var i = 0; i < proyecciones.length; i++) {
            for (var j = 0; j < variablesSolas[i].length; j++) {
                for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                    if(subvariablesSolas[i][j][k].tablaAplicar == 2 && contieneVariablePadreEnFormula(i, j) ) {
                        var variables = obtenerVariables(i , j);
                        for (var n = 0; n < variables.length; n++) {
                            var pos = depositosAsignacionesIncisosContieneVar(variablesSolas[i][j].variable, variablesSolas[i][j].tipoProyeccion);
                            if(pos >= 0) {
                                depositosAsignacionesIncisos[pos].codigo+=" + "+variables[n]+subvariablesSolas[i][j][k].tipoProyeccion;
                            } else {
                                depositosAsignacionesIncisos.push({codigo:"\t"+variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+" = "+variables[n]+subvariablesSolas[i][j][k].tipoProyeccion, variable:variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});
                            }
                        };
                    }
                };
                if(subvariablesSolas[i][j].length == 0 && contieneVariablePadreEnFormula(i, j) && variablesSolas[i][j][k].tablaAplicar == 2) {
                    var variables = obtenerVariables(i , j);
                    for (var n = 0; n < variables.length; n++) {
                        var pos = depositosAsignacionesIncisosContieneVar(variablesSolas[i][j].variable, variablesSolas[i][j].tipoProyeccion);
                        if(pos >= 0) {
                            depositosAsignacionesIncisos[pos].codigo+=" + "+variables[n]+variablesSolas[i][j].tipoProyeccion;
                        } else {
                            depositosAsignacionesIncisos.push({codigo:"\t"+variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+" = "+variables[n]+variablesSolas[i][j].tipoProyeccion, variable:variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});
                        }
                    };
                }
            };
        };*/
        checkLoadRules();
    }
}

function divideCreditRules () {
    if(contadorPrestamosReglasAntes == contadorPrestamosReglasDespues) {
        var fechaSeleccionada = $("#fechaRCL").datepicker('getDate');
        aplicarFactores = [];
        for (var i = 0; i < subvariablesSolas.length; i++) {
            if(subvariablesSolas[i] != undefined) {
                if(variablesDeSubVariablesSolas[i] == undefined)
                    variablesDeSubVariablesSolas[i] = [];
                for (var j = 0; j < subvariablesSolas[i].length; j++) {
                    if(subvariablesSolas[i][j] != undefined) {
                        if(variablesDeSubVariablesSolas[i][j] == undefined)
                            variablesDeSubVariablesSolas[i][j] = [];
                        for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                            if(subvariablesSolas[i][j][k] != undefined) {
                                if(variablesDeSubVariablesSolas[i][j][k] == undefined)
                                    variablesDeSubVariablesSolas[i][j][k] = [];
                                if(subvariablesSolas[i][j][k].tablaAplicar == 3) {
                                    prestamosInstanciasSubVariables.push({codigo:"\tvar "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, nombreVariable: subvariablesSolas[i][j][k].variable, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion, moneda: subvariablesSolas[i][j][k].moneda.toLowerCase()});
                                    /*if(!contieneVariablePadreEnFormula(i, j)) {
                                        var pos = prestamosAsignacionesIncisosContieneVar(variablesSolas[i][j].variable, variablesSolas[i][j].tipoProyeccion);
                                        if(pos >= 0) {
                                            prestamosAsignacionesIncisos[pos].codigo+=" + "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion;
                                        } else {
                                            prestamosAsignacionesIncisos.push({codigo:"\t"+variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+" = "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, variable:variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});
                                        }
                                    }*/
                                    for (var n = 0; n < reglasActivos[i][j][k].length; n++) {
                                        if(reglasActivos[i][j][k][n] != undefined && reglasActivos[i][j][k][n].reglaPadre == 0) {
                                            var resultado = campoObjetivoPrestamos(reglasActivos[i][j][k][n], [], 2, subvariablesSolas[i][j][k].variable, subvariablesSolas[i][j][k].tipoProyeccion);
                                            resultado[0].codigo = "\n"+resultado[0].codigo;
                                            $.merge( prestamosCuerpo, resultado );
                                        }
                                    };
                                }
                            }
                        };
                    }
                };
            }
        };
        /*for (var i = 0; i < proyecciones.length; i++) {
            for (var j = 0; j < variablesSolas[i].length; j++) {
                for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                    if(subvariablesSolas[i][j][k].tablaAplicar == 3 && contieneVariablePadreEnFormula(i, j) ) {
                        var variables = obtenerVariables(i , j);
                        for (var n = 0; n < variables.length; n++) {
                            var pos = prestamosAsignacionesIncisosContieneVar(variablesSolas[i][j].variable, variablesSolas[i][j].tipoProyeccion);
                            if(pos >= 0) {
                                prestamosAsignacionesIncisos[pos].codigo+=" + "+variables[n]+subvariablesSolas[i][j][k].tipoProyeccion;
                            } else {
                                prestamosAsignacionesIncisos.push({codigo:"\t"+variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+" = "+variables[n]+subvariablesSolas[i][j][k].tipoProyeccion, variable:variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});
                            }
                        };
                    }
                };
                if(subvariablesSolas[i][j].length == 0 && contieneVariablePadreEnFormula(i, j) && variablesSolas[i][j][k].tablaAplicar == 3) {
                    var variables = obtenerVariables(i , j);
                    for (var n = 0; n < variables.length; n++) {
                        var pos = prestamosAsignacionesIncisosContieneVar(variablesSolas[i][j].variable, variablesSolas[i][j].tipoProyeccion);
                        if(pos >= 0) {
                            prestamosAsignacionesIncisos[pos].codigo+=" + "+variables[n]+variablesSolas[i][j].tipoProyeccion;
                        } else {
                            prestamosAsignacionesIncisos.push({codigo:"\t"+variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+" = "+variables[n]+variablesSolas[i][j].tipoProyeccion, variable:variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});
                        }
                    };
                }
            };
        };*/
        checkLoadRules();
    }
}

function activosAsignacionesIncisosContieneVar (variable, tipoProyeccion) {
    for (var i = 0; i < activosAsignacionesIncisos.length; i++) {
        if(activosAsignacionesIncisos[i].nombreVariable.localeCompare(variable) == 0 && activosAsignacionesIncisos[i].tipoProyeccion == tipoProyeccion) {
            return i;
        }
    };
    return -1;
}

function activosAsignacionesSubVarContieneVar (variable, tipoProyeccion) {
    for (var i = 0; i < activosAsignacionesSubVariables.length; i++) {
        if(activosAsignacionesSubVariables[i].nombreVariable.localeCompare(variable) == 0 && activosAsignacionesSubVariables[i].tipoProyeccion == tipoProyeccion) {
            return i;
        }
    };
    return -1;
}

function depositosAsignacionesIncisosContieneVar (variable, tipoProyeccion) {
    for (var i = 0; i < depositosAsignacionesIncisos.length; i++) {
        if(depositosAsignacionesIncisos[i].nombreVariable.localeCompare(variable) == 0 && depositosAsignacionesIncisos[i].tipoProyeccion == tipoProyeccion) {
            return i;
        }
    };
    return -1;
}

function prestamosAsignacionesIncisosContieneVar (variable, tipoProyeccion) {
    for (var i = 0; i < prestamosAsignacionesIncisos.length; i++) {
        if(prestamosAsignacionesIncisos[i].nombreVariable.localeCompare(variable) == 0 && prestamosAsignacionesIncisos[i].tipoProyeccion == tipoProyeccion) {
            return i;
        }
    };
    return -1;
}

function contieneVariablePadreEnFormula (i, j) {
    var ecuacionResuelta = variablesSolas[i][j].formula;
    for (var z = 0; z < ecuacionResuelta.length; z++) {
        if(ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z))) {
            var pal = getVariable(ecuacionResuelta, z);
            if(esVariablePadre(pal)) {
                return true;
            } else {
                z += pal.length-1;
            }
        }
    };
    return false;
}

function esVariablePadre (variable) {
    for (var i = 0; i < proyecciones.length; i++) {
        for (var j = 0; j < variablesSolas[i].length; j++) {
            if(variablesSolas[i][j].variable.toLowerCase().localeCompare(variable.toLowerCase()) == 0) {
                return true;
            }
        };
    };
    return false;
}

function obtenerVariables (i, j) {
    var arregloVars = [];
    var ecuacionResuelta = variablesSolas[i][j].formula;
    for (var z = 0; z < ecuacionResuelta.length; z++) {
        if(ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z))) {
            var pal = getVariable(ecuacionResuelta, z);
            arregloVars.push(pal);
            z += pal.length-1;
        }
    };
    return arregloVars;
}

function checkLoadRules () {
    if(entroActivosGetRules && entroDepositosGetRules && entroPrestamosGetRules) {
        console.log("LLEGEU")
        if(variablesAgrupadas[0].length > 0) {
            if(variablesAgrupadas[1].length == 0)
                entroDepositosGetFromTable = true;
            if(variablesAgrupadas[2].length == 0)
                entroPrestamosGetFromTable = true;
            loadAssets();
        } else if(variablesAgrupadas[1].length > 0) {
            if(variablesAgrupadas[0].length == 0)
                entroActivosGetFromTable = true;
            if(variablesAgrupadas[2].length == 0)
                entroPrestamosGetFromTable = true;
            loadDeposits();
        } else if(variablesAgrupadas[2].length > 0) {
            if(variablesAgrupadas[0].length == 0)
                entroActivosGetFromTable = true;
            if(variablesAgrupadas[1].length == 0)
                entroDepositosGetFromTable = true;
            loadCredit();
        }
    }
}

function createMethods () {
    if(entroActivosGetFromTable && entroDepositosGetFromTable && entroPrestamosGetFromTable) {
        /*var contentAssets = '';
        contentAssets = createAssetsRCL();
        var contentLoans = '';
        contentLoans = createCreditRCL();
        var contentDeposits = '';
        contentDeposits = createDepositsRCL();
        if(variablesAgrupadas[2].length > 0)    //prestamos
            contentLoans+="\tcalculateRCL();\n";
        else if(variablesAgrupadas[1].length > 0)    //depositos
            contentDeposits+="\tcalculateRCL();\n";
        else                                            //activos
            contentAssets+="\tcalculateRCL();\n";*/

        var content = '';
        content += createAssetsRCL();
        var agregarInstanciaciones = true, entro = false;
        for (var n = 0; n < arregloDeFiltros.length; n++) {
            if(arregloDeFiltros[n].variables.localeCompare("3") == 0) {
                content += createCreditRCL(arregloDeFiltros[n].ID, agregarInstanciaciones);
                agregarInstanciaciones = false;
                entro = true;
            }
        }
        if(!entro)
            agregarInstanciaciones = true;
        content += createCreditRCL(-1, agregarInstanciaciones);
        //content += createCreditRCL();
        agregarInstanciaciones = true;
        entro = false;
        for (var n = 0; n < arregloDeFiltros.length; n++) {
            if(arregloDeFiltros[n].variables.localeCompare("2") == 0) {
                content += createDepositsRCL(arregloDeFiltros[n].ID, agregarInstanciaciones);
                agregarInstanciaciones = false;
                entro = true;
            }
        }
        if(!entro)
            agregarInstanciaciones = true;
        content += createDepositsRCL(-1, agregarInstanciaciones);
        //content += createDepositsRCL();
        content+="\tcalculateRCL();\n";
        window['calculoRCL'] = new Function(
         'return function anonRCL(){'+
                    content+
            '}'
        )();
        console.log(window['calculoRCL']);
        runFunctions();
    }
    /*console.log(contentAssets)
    console.log(contentDeposits)
    console.log(contentLoans)*/

    /*window['ActivosRCL'] = new Function(
         'return function anonActivos(){'+
                contentAssets+
        '}'
    )();
    window['DepositosRCL'] = new Function(
         'return function anonDepositos(){'+
                contentDeposits+
        '}'
    )();
    window['PrestamosRCL'] = new Function(
         'return function anonPrestamos(){'+
                contentLoans+
        '}'
    )();*/
    /*console.log(window['ActivosRCL']);
    console.log(window['DepositosRCL']);
    console.log(window['PrestamosRCL']);*/

    //runFunctions();
}

function noExistenEnSubVarTablaActivos (variable) {
    for (var i = 0; i < arregloVariablesDeVariables.length; i++) {
        if(arregloVariablesDeVariables[i].nombre.toLowerCase().localeCompare(variable.toLowerCase()) == 0) {
            return false;
        }
    };
    return true;
}

function createAssetsRCL () {
    var content = '';
    for (var i = 0; i < activosInstanciasIncisos.length; i++) {
        content+="\n"+activosInstanciasIncisos[i].codigo;
    };
    content+="\n";
    for (var i = 0; i < activosInstanciasSubVariables.length; i++) {
        if(activosInstanciasSubVariables[i] != undefined) {
            for (var j = 0; j < activosInstanciasSubVariables[i].length; j++) {
                if(activosInstanciasSubVariables[i][j] != undefined) {
                    for (var k = 0; k < activosInstanciasSubVariables[i][j].length; k++) {
                        if(noExistenEnSubVarTablaActivos(activosInstanciasSubVariables[i][j][k].nombreVariable)) {
                            if(i == 0 && k == 0)
                                content+="\n";
                            content+=activosInstanciasSubVariables[i][j][k].codigo+"\n";
                        }
                    };
                }
            };
        }
    };
    for (var i = 0; i < activosInstanciasVarReglas.length; i++) {
        if(activosInstanciasVarReglas[i] != undefined && activosInstanciasVarReglas[i].length > 0) {
            for (var j = 0; j < activosInstanciasVarReglas[i].length; j++) {
                if(activosInstanciasVarReglas[i][j] != undefined && activosInstanciasVarReglas[i][j].length > 0) {
                    for (var k = 0; k < activosInstanciasVarReglas[i][j].length; k++) {
                        if(activosInstanciasVarReglas[i][j][k] != undefined && activosInstanciasVarReglas[i][j][k].length > 0) {
                            for (var n = 0; n < activosInstanciasVarReglas[i][j][k].length; n++) {
                                content+=activosInstanciasVarReglas[i][j][k][n].codigo+"\n";
                            };
                        }
                    };
                }
            };
        }
    };
    content+="\tvar entrarVariablesLista = true;\n"
    content+="\tfor (var i = 0; i < arregloActivos.length; i++) {";
    for (var p = 0; p < activosCuerpo.length; p++) {
        if(p == 0){
            content+="\n";
            content+="\t\tinsertMoneyArray(arregloActivos[i].moneda.toLowerCase());\n";
            //content+="\t\tinsertAgenciesArray(arregloActivos[i].sucursal.toLowerCase());\n";
        }
        content+="\t"+activosCuerpo[p]+"\n";
        if(p == activosCuerpo.length-1) {
            content+="\t\tentrarVariablesLista = false;\n"
            //content+="\t\tif(i == arregloActivos.length-1) {\n"
            for (var i = 0; i < subvariablesSolas.length; i++) {
                if(subvariablesSolas[i] != undefined) {
                    for (var j = 0; j < subvariablesSolas[i].length; j++) {
                        if(subvariablesSolas[i][j] != undefined) {
                            for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                                if(subvariablesSolas[i][j][k] != undefined) {
                                    for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                                        //variablesDeSubVariablesSolas[i][j][k]
                                        if(activosAlgebraica[i] != undefined && activosAlgebraica[i][j] != undefined && activosAlgebraica[i][j][k] != undefined && activosAlgebraica[i][j][k].length > 0 && activosAlgebraica[i][j][k][n] != undefined) {
                                            activosAlgebraica[i][j][k].sort(function(a, b){
                                                if(a.orden < b.orden) { return -1; }
                                                if(a.orden > b.orden) { return 1; }
                                                return 0;
                                            });
                                            activosInstanciasVarReglas[i][j][k].sort(function(a, b){
                                                if(a.orden < b.orden) { return -1; }
                                                if(a.orden > b.orden) { return 1; }
                                                return 0;
                                            });
                                            //for (var z = 0; z < activosAlgebraica[i][j][k].length-1; z++) {
                                                content+="\t\tvar "+activosAlgebraica[i][j][k][n].variable+" = "+activosAlgebraica[i][j][k][n].codigo+"\n";
                                                //content+="\t\t\t"+"saveVariableVarRule('"+activosAlgebraica[i][j][k][n].nombreVariable+"', "+activosAlgebraica[i][j][k][n].tipoProyeccion+", "+activosAlgebraica[i][j][k][n].variable+", arregloActivos[i].moneda.toLowerCase(), arregloActivos[i].sucursal.toLowerCase());\n";
                                                //content+="\t\t\t"+"saveVariableVarRuleAgencias('"+activosAlgebraica[i][j][k][n].nombreVariable+"', "+activosAlgebraica[i][j][k][n].tipoProyeccion+", "+activosAlgebraica[i][j][k][n].variable+", arregloActivos[i].sucursal.toLowerCase());\n";
                                            //};
                                            var mayor = activosInstanciasVarReglas[i][j][k][n].orden;
                                            if(mayor < activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].orden) {
                                                content+="\t\t"+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = "+activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].variable+";\n"
                                                //content+="\t"+"saveVariableVarRule('"+activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].nombreVariable+"', "+activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].tipoProyeccion+", "+activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].variable+");\n";
                                            } else {
                                                content+="\t\t"+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = "+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].variable+";\n"
                                                //content+="\t"+"saveVariableVarRule('"+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].nombreVariable+"', "+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].tipoProyeccion+", "+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].variable+");\n";
                                            }
                                            content+="\t\t"+"saveVariableSubVar('"+subvariablesSolas[i][j][k].variable+"', "+subvariablesSolas[i][j][k].tipoProyeccion+", "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+", arregloActivos[i].moneda.toLowerCase(), arregloActivos[i].sucursal.toLowerCase());\n";
                                            //content+="\t\t\t"+"saveVariableSubVarAgencias('"+subvariablesSolas[i][j][k].variable+"', "+subvariablesSolas[i][j][k].tipoProyeccion+", "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+", arregloActivos[i].sucursal.toLowerCase());\n";
                                        } else if(reglasActivos[i] != undefined && reglasActivos[i][j] != undefined && reglasActivos[i][j][k] != undefined && activosAlgebraica[i][j][k].length == 0 && n == 0) {
                                            reglasActivos[i][j][k].sort(function(a, b) {
                                                if(a.orden < b.orden) { return -1; }
                                                if(a.orden > b.orden) { return 1; }
                                                return 0;
                                            });
                                            content+="\t\t"+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = "+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].variable+";\n";
                                            content+="\t\t"+"saveVariableSubVar('"+subvariablesSolas[i][j][k].variable+"', "+subvariablesSolas[i][j][k].tipoProyeccion+", "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+", arregloActivos[i].moneda.toLowerCase(), arregloActivos[i].sucursal.toLowerCase());\n";
                                            //content+="\t\t\t"+"saveVariableSubVarAgencias('"+subvariablesSolas[i][j][k].variable+"', "+subvariablesSolas[i][j][k].tipoProyeccion+", "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+", arregloActivos[i].sucursal.toLowerCase());\n";
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
            for (var i = 0; i < variablesDeSubVariablesSolas.length; i++) {
                if(variablesDeSubVariablesSolas[i] != undefined && variablesDeSubVariablesSolas[i].length > 0) {
                    for (var j = 0; j < variablesDeSubVariablesSolas[i].length; j++) {
                        if(variablesDeSubVariablesSolas[i][j] != undefined && variablesDeSubVariablesSolas[i][j].length > 0) {
                            for (var k = 0; k < variablesDeSubVariablesSolas[i][j].length; k++) {
                                if(variablesDeSubVariablesSolas[i][j][k] != undefined && variablesDeSubVariablesSolas[i][j][k].length > 0) {
                                    for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                                        content+="\t\t"+"saveVariableVarRule('"+variablesDeSubVariablesSolas[i][j][k][n].variable+"', "+variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion+", "+variablesDeSubVariablesSolas[i][j][k][n].variable+variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion+",arregloActivos[i].moneda.toLowerCase(), arregloActivos[i].sucursal.toLowerCase());\n";
                                        //content+="\t\t\t"+"saveVariableVarRuleAgencias('"+variablesDeSubVariablesSolas[i][j][k][n].variable+"', "+variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion+", "+variablesDeSubVariablesSolas[i][j][k][n].variable+variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion+",arregloActivos[i].sucursal.toLowerCase());\n";
                                    };
                                }
                            };
                        }
                    };
                }
            };
            for (var i = 0; i < arregloCuentaAlgebraica.length; i++) {
                content+="\t"+arregloCuentaAlgebraica[i].codigo+"\n";
                if(i == arregloCuentaAlgebraica.length-1)
                    content+="\n";
            };
            //content+="\t\t\n}"
        }
    };
    content+="\t}\n";
    /*for (var i = 0; i < subvariablesSolas.length; i++) {
        if(subvariablesSolas[i] != undefined) {
            for (var j = 0; j < subvariablesSolas[i].length; j++) {
                if(subvariablesSolas[i][j] != undefined) {
                    for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                        if(subvariablesSolas[i][j][k] != undefined) {
                            for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                                //variablesDeSubVariablesSolas[i][j][k]
                                if(activosAlgebraica[i] != undefined && activosAlgebraica[i][j] != undefined && activosAlgebraica[i][j][k] != undefined && activosAlgebraica[i][j][k].length > 0 && activosAlgebraica[i][j][k][n] != undefined) {
                                    activosAlgebraica[i][j][k].sort(function(a, b){
                                        if(a.orden < b.orden) { return -1; }
                                        if(a.orden > b.orden) { return 1; }
                                        return 0;
                                    });
                                    activosInstanciasVarReglas[i][j][k].sort(function(a, b){
                                        if(a.orden < b.orden) { return -1; }
                                        if(a.orden > b.orden) { return 1; }
                                        return 0;
                                    });
                                    //for (var z = 0; z < activosAlgebraica[i][j][k].length-1; z++) {
                                        content+="\tvar "+activosAlgebraica[i][j][k][n].variable+" = "+activosAlgebraica[i][j][k][n].codigo+"\n";
                                        content+="\t"+"saveVariableVarRule('"+activosAlgebraica[i][j][k][n].nombreVariable+"', "+activosAlgebraica[i][j][k][n].tipoProyeccion+", "+activosAlgebraica[i][j][k][n].variable+");\n";
                                    //};
                                    var mayor = activosInstanciasVarReglas[i][j][k][n].orden;
                                    if(mayor < activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].orden) {
                                        content+="\t"+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = "+activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].variable+";\n"
                                        //content+="\t"+"saveVariableVarRule('"+activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].nombreVariable+"', "+activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].tipoProyeccion+", "+activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].variable+");\n";
                                    } else {
                                        content+="\t"+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = "+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].variable+";\n"
                                        //content+="\t"+"saveVariableVarRule('"+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].nombreVariable+"', "+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].tipoProyeccion+", "+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].variable+");\n";
                                    }
                                    content+="\t"+"saveVariableSubVar('"+subvariablesSolas[i][j][k].variable+"', "+subvariablesSolas[i][j][k].tipoProyeccion+", "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+"); //1\n";
                                } else if(reglasActivos[i] != undefined && reglasActivos[i][j] != undefined && reglasActivos[i][j][k] != undefined && activosAlgebraica[i][j][k].length == 0 && n == 0) {
                                    reglasActivos[i][j][k].sort(function(a, b) {
                                        if(a.orden < b.orden) { return -1; }
                                        if(a.orden > b.orden) { return 1; }
                                        return 0;
                                    });
                                    content+="\t"+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = "+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].variable+";\n";
                                    content+="\t"+"saveVariableSubVar('"+subvariablesSolas[i][j][k].variable+"', "+subvariablesSolas[i][j][k].tipoProyeccion+", "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+");\n";
                                }
                            };
                        }
                    };
                }
            };
        }
    };
    for (var i = 0; i < variablesDeSubVariablesSolas.length; i++) {
        if(variablesDeSubVariablesSolas[i] != undefined && variablesDeSubVariablesSolas[i].length > 0) {
            for (var j = 0; j < variablesDeSubVariablesSolas[i].length; j++) {
                if(variablesDeSubVariablesSolas[i][j] != undefined && variablesDeSubVariablesSolas[i][j].length > 0) {
                    for (var k = 0; k < variablesDeSubVariablesSolas[i][j].length; k++) {
                        if(variablesDeSubVariablesSolas[i][j][k] != undefined && variablesDeSubVariablesSolas[i][j][k].length > 0) {
                            for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                                content+="\t"+"saveVariableVarRule('"+variablesDeSubVariablesSolas[i][j][k][n].variable+"', "+variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion+", "+variablesDeSubVariablesSolas[i][j][k][n].variable+variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion+",arregloActivos[i].moneda.toLowerCase());\n";
                            };
                        }
                    };
                }
            };
        }
    };*/
    /*for (var i = 0; i < activosAsignacionesIncisos.length; i++) {
        content+="\t"+activosAsignacionesIncisos[i].codigo+";\n";
        content+="\t"+"saveVariable('"+activosAsignacionesIncisos[i].nombreVariable+"', "+activosAsignacionesIncisos[i].tipoProyeccion+", "+activosAsignacionesIncisos[i].variable+");\n";
    };*/
    /*for (var i = 0; i < arregloCuentaAlgebraica.length; i++) {
        content+=arregloCuentaAlgebraica[i].codigo+"\n";
    };*/
    return content;
}

function createDepositsRCL (filtro, soloAgregarUnaVezInstanciaciones) {
    var content = '';
    if(soloAgregarUnaVezInstanciaciones) {
        for (var i = 0; i < depositosInstanciasIncisos.length; i++) {
            content+="\n"+depositosInstanciasIncisos[i].codigo;
        };
        for (var i = 0; i < depositosInstanciasSubVariables.length; i++) {
            content+="\n"+depositosInstanciasSubVariables[i].codigo;
        };
    }
    var idFiltro = '', entro = false;
    if(filtro != -1)
        idFiltro = filtro;
    content+="\n\tfor (var i = 0; i < arregloDepositos"+idFiltro+".length; i++) {";
    for (var i = 0; i < depositosCuerpo.length; i++) {
        if(i == 0){
            content+="\n";
            content+="\t\tinsertMoneyArray(arregloDepositos"+idFiltro+"[i].moneda.toLowerCase());\n";
        }
        if(depositosCuerpo[i].filtro == filtro) {
            content+=depositosCuerpo[i].codigo+"\n";
            entro = true;
        }
        if(i == depositosCuerpo.length-1) {
            for (var j = 0; j < depositosInstanciasSubVariables.length; j++) {
                content+="\n\t\t"+"saveVariableSubVar('"+depositosInstanciasSubVariables[j].nombreVariable+"',"+depositosInstanciasSubVariables[j].tipoProyeccion+","+depositosInstanciasSubVariables[j].variable+",arregloDepositos"+idFiltro+"[i].moneda.toLowerCase(), arregloDepositos"+idFiltro+"[i].sucursal.toLowerCase());";
                //content+="\n\t"+"saveVariableSubVarAgencias('"+depositosInstanciasSubVariables[j].nombreVariable+"',"+depositosInstanciasSubVariables[j].tipoProyeccion+","+depositosInstanciasSubVariables[j].variable+",arregloDepositos[i].sucursal.toLowerCase());";
            };
        }
    };
    content+="\n\t}\n";
    if(!entro)
        content = '';
    /*for (var i = 0; i < depositosInstanciasSubVariables.length; i++) {
        content+="\n\t"+"saveVariableSubVar('"+depositosInstanciasSubVariables[i].nombreVariable+"',"+depositosInstanciasSubVariables[i].tipoProyeccion+","+depositosInstanciasSubVariables[i].variable+",arregloDepositos[i].moneda.toLowerCase());";
    };
    for (var i = 0; i < depositosAsignacionesIncisos.length; i++) {
        if(i == 0)
            content+="\n";
        content+=depositosAsignacionesIncisos[i].codigo+";\n";
        content+="\t"+"saveVariable('"+depositosAsignacionesIncisos[i].nombreVariable+"', "+depositosAsignacionesIncisos[i].tipoProyeccion+", "+depositosAsignacionesIncisos[i].variable+", arregloDepositos[i].moneda.toLowerCase());\n";
    };*/
    return content;
}

function createCreditRCL (filtro, soloAgregarUnaVezInstanciaciones) {
    var content = '';
    if(soloAgregarUnaVezInstanciaciones) {
        for (var i = 0; i < prestamosInstanciasIncisos.length; i++) {
            content+="\n"+prestamosInstanciasIncisos[i].codigo;
        };
        for (var i = 0; i < prestamosInstanciasSubVariables.length; i++) {
            content+="\n"+prestamosInstanciasSubVariables[i].codigo;
        };
    }
    var idFiltro = '', entro = false;
    if(filtro != -1)
        idFiltro = filtro;
    content+="\n\tfor (var i = 0; i < arregloPrestamos"+idFiltro+".length; i++) {";
    for (var i = 0; i < prestamosCuerpo.length; i++) {
        if(i == 0){
            content+="\n";
            content+="\t\tinsertMoneyArray(arregloPrestamos"+idFiltro+"[i].moneda.toLowerCase());\n";
        }
        if(prestamosCuerpo[i].filtro == filtro) {
            content+=prestamosCuerpo[i].codigo+"\n";
            entro = true;
        }
        if(i == prestamosCuerpo.length-1) {
            //aplicarFactores == factores de agrupaciones de credito
            for (var j = 0; j < aplicarFactores.length; j++) {
                if(j == 0) {
                    content += "\n\t\tif( i == arregloPrestamos"+idFiltro+".length-1) {\n";
                }
                content += "\t\t\t"+aplicarFactores[j];
                if(j == aplicarFactores.length-1) {
                    content += "\n\t\t}\n";
                }
            };
            for (var j = 0; j < prestamosInstanciasSubVariables.length; j++) {
                content+="\n\t\t"+"saveVariableSubVar('"+prestamosInstanciasSubVariables[j].nombreVariable+"',"+prestamosInstanciasSubVariables[j].tipoProyeccion+","+prestamosInstanciasSubVariables[j].variable+",arregloPrestamos"+idFiltro+"[i].moneda.toLowerCase(), arregloPrestamos"+idFiltro+"[i].sucursal.toLowerCase());";
                //content+="\n\t"+"saveVariableSubVarAgencias('"+prestamosInstanciasSubVariables[j].nombreVariable+"',"+prestamosInstanciasSubVariables[j].tipoProyeccion+","+prestamosInstanciasSubVariables[j].variable+",arregloPrestamos[i].sucursal.toLowerCase());";
                if(j == 0)
                    content+="\n";
            };
        }
    };
    content+="\n\t}\n";
    if(!entro)
        content = '';
    /*for (var i = 0; i < prestamosInstanciasSubVariables.length; i++) {
        content+="\n\t"+"saveVariableSubVar('"+prestamosInstanciasSubVariables[i].nombreVariable+"',"+prestamosInstanciasSubVariables[i].tipoProyeccion+","+prestamosInstanciasSubVariables[i].variable+",arregloPrestamos[i].moneda.toLowerCase());";
        if(i == 0)
            content+="\n";
    };
    for (var i = 0; i < prestamosAsignacionesIncisos.length; i++) {
        if(i == 0)
            content+="\n";
        content+=prestamosAsignacionesIncisos[i].codigo+";\n";
        content+="\t"+"saveVariable('"+prestamosAsignacionesIncisos[i].nombreVariable+"', "+prestamosAsignacionesIncisos[i].tipoProyeccion+", "+prestamosAsignacionesIncisos[i].variable+", arregloPrestamos[i].moneda.toLowerCase());\n";
    };*/
    return content;
}

function runFunctions () {
    /*console.log(window['ActivosRCL'])
    console.log(window['DepositosRCL'])
    console.log(window['PrestamosRCL'])
    window['ActivosRCL']();
    window['DepositosRCL']();
    window['PrestamosRCL']();*/
    window['calculoRCL']();
    //calculateRCL();
}

function saveVariable (nombreVariable, tipoProyecVariable, valorVariable, moneda, agencia) {
    LoopVar:
    for (var i = 0; i < variablesSolas.length; i++) {
        if(variablesSolas[i] != undefined) {
            for (var j = 0; j < variablesSolas[i].length; j++) {
                if (variablesSolas[i][j].variable.localeCompare(nombreVariable) == 0 && variablesSolas[i][j].tipoProyeccion == tipoProyecVariable) {
                    //variablesSolas[i][j].total = valorVariable;
                    window["variablesSolas"+moneda][i][j].total = valorVariable;
                    window["variablesSolas"+moneda][i][j].sucursal = agencia;
                    break LoopVar;
                }
            };
        }
    };
}

function saveVariableSubVar (nombreVariable, tipoProyecVariable, valorVariable, moneda, agencia) {
    LoopSubVar:
    for (var i = 0; i < subvariablesSolas.length; i++) {
        if(subvariablesSolas[i] != undefined) {
            for (var j = 0; j < subvariablesSolas[i].length; j++) {
                if(subvariablesSolas[i][j] != undefined) {
                    for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                        if (subvariablesSolas[i][j][k].variable.toLowerCase().localeCompare(nombreVariable.toLowerCase()) == 0 && subvariablesSolas[i][j][k].tipoProyeccion == tipoProyecVariable) {
                            /*subvariablesSolas[i][j][k].total = valorVariable;
                            subvariablesSolas[i][j][k].calculada = true;*/
                            window["subvariablesSolas"+moneda][i][j][k].total = valorVariable;
                            window["subvariablesSolas"+moneda][i][j][k].calculada = true;
                            window["subvariablesSolas"+moneda][i][j][k].sucursal = agencia;
                            break LoopSubVar;
                        }
                    };
                }
            };
        }
    };
}

function saveVariableVarRule (nombreVariable, tipoProyecVariable, valorVariable, moneda, agencia) {
    LoopVarSubVar:
    for (var i = 0; i < variablesDeSubVariablesSolas.length; i++) {
        if(variablesDeSubVariablesSolas[i] != undefined) {
            for (var j = 0; j < variablesDeSubVariablesSolas[i].length; j++) {
                if(variablesDeSubVariablesSolas[i][j] != undefined) {
                    for (var k = 0; k < variablesDeSubVariablesSolas[i][j].length; k++) {
                        if(variablesDeSubVariablesSolas[i][j][k] != undefined) {
                            for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                                if (variablesDeSubVariablesSolas[i][j][k][n].variable.toLowerCase().localeCompare(nombreVariable.toLowerCase()) == 0 && variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion == tipoProyecVariable) {
                                    //variablesDeSubVariablesSolas[i][j][k][n].total = valorVariable;
                                    window["variablesDeSubVariablesSolas"+moneda][i][j][k][n].total = valorVariable;
                                    window["variablesDeSubVariablesSolas"+moneda][i][j][k][n].sucursal = agencia;
                                    break LoopVarSubVar;
                                }
                            };
                        }
                    };
                }
            };
        }
    };
}

function insertarCuenta (nombreVariable, valorVariable, tipoProyeccion, kFor, nFor, moneda, agencia) {
    for (var i = 0; i < arregloCuentas.length; i++) {
        if(arregloCuentas[i] != undefined) {
            for (var j = 0; j < arregloCuentas[i].length; j++) {
                if(arregloCuentas[i][j] != undefined) {
                    for (var k = 0; k < arregloCuentas[i][j].length; k++) {
                        if(arregloCuentas[i][j][k] != undefined) {
                            for (var n = 0; n < arregloCuentas[i][j][k].length; n++) {
                                if(arregloCuentas[i][j][k][n] != undefined) {
                                    for (var z = 0; z < arregloCuentas[i][j][k][n].length; z++) {
                                        if(arregloCuentas[i][j][k][n][z].variable.localeCompare(nombreVariable) == 0 && arregloCuentas[i][j][k][n][z].tipoProyeccion == tipoProyeccion) {
                                            /*arregloCuentas[i][j][k][n][z].total += valorVariable;
                                            if(z == zFor)
                                                arregloCuentas[i][j][k][n][z].precioUnidad += valorVariable;*/
                                            window["arregloCuentas"+moneda][i][j][k][n][z].total += valorVariable;
                                            window["arregloCuentas"+moneda][i][j][k][n][z].sucursal = agencia;
                                            if(k == kFor && n == nFor)
                                                window["arregloCuentas"+moneda][i][j][k][n][z].precioUnidad += valorVariable;
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
        }
    };
}

function saveCuentaAlgebraica (valorVariable, nombreVariable, moneda, agencia) {
    /*var totalVariable = 0;
    for (var i = 0; i < variablesDeSubVariablesSolas.length; i++) {
        if(variablesDeSubVariablesSolas[i] != undefined) {
            for (var j = 0; j < variablesDeSubVariablesSolas[i].length; j++) {
                if(variablesDeSubVariablesSolas[i][j] != undefined) {
                    for (var k = 0; k < variablesDeSubVariablesSolas[i][j].length; k++) {
                        if(variablesDeSubVariablesSolas[i][j][k] != undefined) {
                            for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                                if ((variablesDeSubVariablesSolas[i][j][k][n].variable+variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion).toLowerCase().localeCompare(nombreVariable.toLowerCase()) == 0) {
                                    totalVariable = variablesDeSubVariablesSolas[i][j][k][n].total;
                                }
                            };
                        }
                    };
                }
            };
        }
    };*/
    for (var i = 0; i < window["arregloCuentas"+moneda].length; i++) {
        if(window["arregloCuentas"+moneda][i] != undefined) {
            for (var j = 0; j < window["arregloCuentas"+moneda][i].length; j++) {
                if(window["arregloCuentas"+moneda][i][j] != undefined) {
                    for (var k = 0; k < window["arregloCuentas"+moneda][i][j].length; k++) {
                        if(window["arregloCuentas"+moneda][i][j][k] != undefined) {
                            for (var n = 0; n < window["arregloCuentas"+moneda][i][j][k].length; n++) {
                                if(window["arregloCuentas"+moneda][i][j][k][n] != undefined) {
                                    for (var z = 0; z < window["arregloCuentas"+moneda][i][j][k][n].length; z++) {
                                        if(window["arregloCuentas"+moneda][i][j][k][n][z].varDeCuenta != undefined && window["arregloCuentas"+moneda][i][j][k][n][z].varDeCuenta.localeCompare(nombreVariable) == 0) {
                                            window["arregloCuentas"+moneda][i][j][k][n][z].total += valorVariable;
                                            window["arregloCuentas"+moneda][i][j][k][n][z].volumenFormula += valorVariable;
                                            window["arregloCuentas"+moneda][i][j][k][n][z].influenciaFormula += valorVariable;
                                            window["arregloCuentas"+moneda][i][j][k][n][z].sucursal = agencia;
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
        }
    };
}

function getPriceALAC (cuenta) {
    var saldo = 0;
    for (var i = 0; i < arregloCuentas.length; i++) {
        if(arregloCuentas[i] != undefined) {
            for (var j = 0; j < arregloCuentas[i].length; j++) {
                if(arregloCuentas[i][j] != undefined) {
                    for (var k = 0; k < arregloCuentas[i][j].length; k++) {
                        if(arregloCuentas[i][j][k] != undefined) {
                            for (var n = 0; n < arregloCuentas[i][j][k].length; n++) {
                                if(arregloCuentas[i][j][k][n] != undefined) {
                                    for (var z = 0; z < arregloCuentas[i][j][k][n].length; z++) {
                                        if(arregloCuentas[i][j][k][n][z].variable.localeCompare(cuenta) == 0) {
                                            saldo = arregloCuentas[i].total;
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
        }
    };
    return saldo;
}

function insertMoneyArray (moneda) {
    var agregarNoExiste = true;
    for (var i = 0; i < arregloMonedas.length; i++) {
        if(arregloMonedas[i].localeCompare(moneda) == 0) {
            agregarNoExiste = false;
            break;
        }
    };
    if(agregarNoExiste) {
        /*window["variablesSolas"+moneda] = variablesSolas.slice();
        window["subvariablesSolas"+moneda] = subvariablesSolas.slice();
        window["variablesDeSubVariablesSolas"+moneda] = variablesDeSubVariablesSolas.slice();
        window["arregloCuentas"+moneda] = arregloCuentas.slice();*/
        window["variablesSolas"+moneda] = JSON.parse(JSON.stringify(variablesSolas));
        window["subvariablesSolas"+moneda] = JSON.parse(JSON.stringify(subvariablesSolas));
        window["variablesDeSubVariablesSolas"+moneda] = JSON.parse(JSON.stringify(variablesDeSubVariablesSolas));
        window["arregloCuentas"+moneda] = JSON.parse(JSON.stringify(arregloCuentas));
        for (var i = 0; i < window["variablesSolas"+moneda].length; i++) {
            if(window["variablesSolas"+moneda][i] != undefined) {
                for (var j = 0; j < window["variablesSolas"+moneda][i].length; j++) {
                    window["variablesSolas"+moneda][i][j].dia = fechaSeleccionada;
                    if(window["subvariablesSolas"+moneda][i][j] != undefined) {
                        for (var k = 0; k < window["subvariablesSolas"+moneda][i][j].length; k++) {
                            window["subvariablesSolas"+moneda][i][j][k].dia = fechaSeleccionada;
                            if(window["variablesDeSubVariablesSolas"+moneda][i][j][k] != undefined) {
                                for (var n = 0; n < window["variablesDeSubVariablesSolas"+moneda][i][j][k].length; n++) {
                                    window["variablesDeSubVariablesSolas"+moneda][i][j][k][n].dia = fechaSeleccionada;
                                    if(window["arregloCuentas"+moneda][i][j][k][n] != undefined) {
                                        for (var z = 0; z < window["arregloCuentas"+moneda][i][j][k][n].length; z++) {
                                            window["arregloCuentas"+moneda][i][j][k][n][z].dia = fechaSeleccionada;
                                        };
                                    }
                                };
                            }
                        };
                    }
                };
            }
        };
        arregloMonedas.push(moneda);
    }
}

/*function saveVariableSubVarAgencias (nombreVariable, tipoProyecVariable, valorVariable, agencia) {
    for (var i = 0; i < subvariablesSolas.length; i++) {
        if(subvariablesSolas[i] != undefined) {
            for (var j = 0; j < subvariablesSolas[i].length; j++) {
                if(subvariablesSolas[i][j] != undefined) {
                    for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                        if (subvariablesSolas[i][j][k].variable.toLowerCase().localeCompare(nombreVariable.toLowerCase()) == 0 && subvariablesSolas[i][j][k].tipoProyeccion == tipoProyecVariable) {
                            //subvariablesSolas[i][j][k].total = valorVariable;
                            //subvariablesSolas[i][j][k].calculada = true;
                            window["subvariablesSolas"+agencia][i][j][k].total += valorVariable;
                            window["subvariablesSolas"+agencia][i][j][k].calculada = true;
                            window["subvariablesSolas"+agencia][i][j][k].agencia = agencia;
                        }
                    };
                }
            };
        }
    };
}

function saveVariableVarRuleAgencias (nombreVariable, tipoProyecVariable, valorVariable, agencia) {
    for (var i = 0; i < variablesDeSubVariablesSolas.length; i++) {
        if(variablesDeSubVariablesSolas[i] != undefined) {
            for (var j = 0; j < variablesDeSubVariablesSolas[i].length; j++) {
                if(variablesDeSubVariablesSolas[i][j] != undefined) {
                    for (var k = 0; k < variablesDeSubVariablesSolas[i][j].length; k++) {
                        if(variablesDeSubVariablesSolas[i][j][k] != undefined) {
                            for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                                if (variablesDeSubVariablesSolas[i][j][k][n].variable.toLowerCase().localeCompare(nombreVariable.toLowerCase()) == 0 && variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion == tipoProyecVariable) {
                                    //variablesDeSubVariablesSolas[i][j][k][n].total = valorVariable;
                                    window["variablesDeSubVariablesSolas"+agencia][i][j][k][n].total += valorVariable;
                                    window["variablesDeSubVariablesSolas"+agencia][i][j][k][n].agencia = agencia;
                                }
                            };
                        }
                    };
                }
            };
        }
    };
}

function insertarCuentaAgencias (nombreVariable, valorVariable, tipoProyeccion, zFor, agencia) {
    for (var i = 0; i < arregloCuentas.length; i++) {
        if(arregloCuentas[i] != undefined) {
            for (var j = 0; j < arregloCuentas[i].length; j++) {
                if(arregloCuentas[i][j] != undefined) {
                    for (var k = 0; k < arregloCuentas[i][j].length; k++) {
                        if(arregloCuentas[i][j][k] != undefined) {
                            for (var n = 0; n < arregloCuentas[i][j][k].length; n++) {
                                if(arregloCuentas[i][j][k][n] != undefined) {
                                    for (var z = 0; z < arregloCuentas[i][j][k][n].length; z++) {
                                        if(arregloCuentas[i][j][k][n][z].variable.localeCompare(nombreVariable) == 0 && arregloCuentas[i][j][k][n][z].tipoProyeccion == tipoProyeccion) {
                                            //arregloCuentas[i][j][k][n][z].total += valorVariable;
                                            //if(z == zFor)
                                            //    arregloCuentas[i][j][k][n][z].precioUnidad += valorVariable;
                                            window["arregloCuentas"+agencia][i][j][k][n][z].total += valorVariable;
                                            window["arregloCuentas"+agencia][i][j][k][n][z].agencia = agencia;
                                            if(z == zFor)
                                                window["arregloCuentas"+agencia][i][j][k][n][z].precioUnidad += valorVariable;
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
        }
    };
}

function saveCuentaAlgebraicaAgencias (valorVariable, nombreVariable, agencia) {
    for (var i = 0; i < window["arregloCuentas"+agencia].length; i++) {
        if(window["arregloCuentas"+agencia][i] != undefined) {
            for (var j = 0; j < window["arregloCuentas"+agencia][i].length; j++) {
                if(window["arregloCuentas"+agencia][i][j] != undefined) {
                    for (var k = 0; k < window["arregloCuentas"+agencia][i][j].length; k++) {
                        if(window["arregloCuentas"+agencia][i][j][k] != undefined) {
                            for (var n = 0; n < window["arregloCuentas"+agencia][i][j][k].length; n++) {
                                if(window["arregloCuentas"+agencia][i][j][k][n] != undefined) {
                                    for (var z = 0; z < window["arregloCuentas"+agencia][i][j][k][n].length; z++) {
                                        if(window["arregloCuentas"+agencia][i][j][k][n][z].varDeCuenta != undefined && window["arregloCuentas"+agencia][i][j][k][n][z].varDeCuenta.localeCompare(nombreVariable) == 0) {
                                            window["arregloCuentas"+agencia][i][j][k][n][z].total += valorVariable;
                                            window["arregloCuentas"+agencia][i][j][k][n][z].agencia = agencia;
                                            window["arregloCuentas"+agencia][i][j][k][n][z].volumenFormula += valorVariable;
                                            window["arregloCuentas"+agencia][i][j][k][n][z].influenciaFormula += valorVariable;
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
        }
    };
}

function insertAgenciesArray (agencia) {
    var agregarNoExiste = true;
    for (var i = 0; i < arregloAgencias.length; i++) {
        if(arregloAgencias[i].localeCompare(agencia) == 0) {
            agregarNoExiste = false;
            break;
        }
    };
    if(agregarNoExiste) {
        window["variablesSolas"+agencia] = JSON.parse(JSON.stringify(variablesSolas));
        window["subvariablesSolas"+agencia] = JSON.parse(JSON.stringify(subvariablesSolas));
        window["variablesDeSubVariablesSolas"+agencia] = JSON.parse(JSON.stringify(variablesDeSubVariablesSolas));
        window["arregloCuentas"+agencia] = JSON.parse(JSON.stringify(arregloCuentas));
        arregloAgencias.push(agencia);
    }
}*/

function insertClient (idCliente, total, tipoProyeccion, moneda) {
    for (var i = 0; i < totalesClientes.length; i++) {
        if(totalesClientes[i].nombreVariable.localeCompare(idCliente) == 0) {
            totalesClientes[i].total+=total;
            totalesClientes[i].volumenFormula=total;
            totalesClientes[i].influenciaFormula=total;
            break;
        } else if(totalesClientes[i].nombreVariable.localeCompare(idCliente) > 0) {
            totalesClientes.splice(i, 0, {nombreVariable: idCliente, total: total, formula: '', dia: fechaSeleccionada, tipoProyeccion: tipoProyeccion, volumenFormula: total, influenciaFormula: total, numerador: 0, denominador: 0, moneda: moneda, sucursal: '', tipo: 'cliente', tablaAplicar: 99, varPadre: '', esNumerador: false, esRCL: false, totalRCL: 0});
            break;
        }
    };
}

function getFactor (idVariable) {
    for (var i = 0; i < arregloVariablesDeVariables.length; i++) {
        if (arregloVariablesDeVariables[i].ID == idVariable) {
            return arregloVariablesDeVariables[i].factor/100;
        }
    };
    return 1;
}

function calculateRCL (argument) {
    console.log("finishing, making final calculations...");
    var equacion1 = formulaGlobal.split("=")[0].split(/[+|-|*|\/]+/), equacion2 = formulaGlobal.split("=")[1].split(/[+|-|*|\/]+/);;
    var todasTienenFormula = true;
    var soloUnoNoTieneFormula = false;
    var indexVarRCL;
    var todasTienenVariable = true;     //Para la equacion de variables de Sub-Variables
    //Verificando si solo var RCL no tiene formula
    Loop1:
    for (var i = 0; i < equacion1.length; i++) {
        for (var k = 0; k < variablesDeEquacion.length; k++) {
            if(variablesDeEquacion[k].toLowerCase().localeCompare(equacion1[i].toLowerCase()) == 0) {
                for (var j = 0; j < arregloVariables.length; j++) {
                    if(equacion1[i].toLowerCase().localeCompare(arregloVariables[j].variables.toLowerCase()) == 0 && arregloVariables[j].formula.length == 0) {
                        if(!soloUnoNoTieneFormula && todasTienenFormula)
                            soloUnoNoTieneFormula = true;
                        else if(soloUnoNoTieneFormula && !todasTienenFormula)
                            soloUnoNoTieneFormula = false;
                        todasTienenFormula =  false;
                        indexVarRCL = k;
                        //Tomado equacionVariables
                        equacionVariables = formulaGlobal.split("=")[1];
                        //totalesPorVariablesFormula.push({variable: arregloVariables[j].variables, formula: "", total: 0, tipoProyeccion: 0});
                        break Loop1;
                    }
                };
            }
        };
    };
    if(todasTienenFormula) {
        Loop2:
        for (var i = 0; i < equacion2.length; i++) {
            for (var k = 0; k < variablesDeEquacion.length; k++) {
                if(variablesDeEquacion[k].toLowerCase().localeCompare(equacion2[i].toLowerCase()) == 0) {
                    for (var j = 0; j < arregloVariables.length; j++) {
                        if(equacion2[i].toLowerCase().localeCompare(arregloVariables[j].variables.toLowerCase()) == 0 && arregloVariables[j].formula.length == 0) {
                            if(!soloUnoNoTieneFormula && todasTienenFormula)
                                soloUnoNoTieneFormula = true;
                            else if(soloUnoNoTieneFormula && !todasTienenFormula)
                                soloUnoNoTieneFormula = false;
                            todasTienenFormula =  false;
                            indexVarRCL = k;
                            //Tomado equacionVariables
                            equacionVariables = formulaGlobal.split("=")[0];
                            //totalesPorVariablesFormula.push({variable: arregloVariables[j].variables, formula: "", total: 0, tipoProyeccion: 0});
                            break Loop2;
                        }
                    };
                }
            };
        };
    }
    if(!todasTienenFormula && soloUnoNoTieneFormula) {
        //Preparando equacionSubVariables
        equacionSubVariablesConPadres = equacionVariables;
        for (var i = 0; i < equacionSubVariablesConPadres.length; i++) {
            if(equacionSubVariablesConPadres.charAt(i) != "(" && equacionSubVariablesConPadres.charAt(i) != ")" && equacionSubVariablesConPadres.charAt(i) != "<" && equacionSubVariablesConPadres.charAt(i) != ">" && 
                equacionSubVariablesConPadres.charAt(i) != "!" && equacionSubVariablesConPadres.charAt(i) != "=" && equacionSubVariablesConPadres.charAt(i) != "/" && equacionSubVariablesConPadres.charAt(i) != "*" && 
                equacionSubVariablesConPadres.charAt(i) != "√" && equacionSubVariablesConPadres.charAt(i) != "+" && equacionSubVariablesConPadres.charAt(i) != "-" && isNaN(equacionSubVariablesConPadres.charAt(i))) {
                var pal = getVariable(equacionSubVariablesConPadres, i);
                var formulaVariable, tieneFormula = false;
                for (var j = 0; j < arregloVariables.length; j++) {
                    if(arregloVariables[j].variables.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                        formulaVariable = arregloVariables[j].formula;
                        if(arregloVariables[j].formula.length > 0) {
                            tieneFormula = true;
                            //totalesPorVariablesFormula.push({variable: arregloVariables[j].variables, formula: arregloVariables[j].formula.split(/[+|-|*|\/]+/), total: 0});
                        }
                        break;
                    }
                };
                if(tieneFormula) {
                    var primeraParte = equacionSubVariablesConPadres.substring(0, i);
                    var ultimaParte = equacionSubVariablesConPadres.substring(i+pal.length);
                    if(equacionSubVariablesConPadres.charAt(i-1).localeCompare("-") == 0 || equacionSubVariablesConPadres.charAt(i-1).localeCompare("+") == 0 ||
                        equacionSubVariablesConPadres.charAt(i-1).localeCompare("/") == 0 || equacionSubVariablesConPadres.charAt(i-1).localeCompare("*") == 0) {

                        if(equacionSubVariablesConPadres.charAt(i-1).localeCompare("-") == 0) {
                            if(formulaVariable.includes("+"))
                                formulaVariable = customReplace("+", "-", formulaVariable);
                            if(formulaVariable.includes("/"))
                                formulaVariable = customReplace("/", "-", formulaVariable);
                            if(formulaVariable.includes("*"))
                                formulaVariable = customReplace("*", "-", formulaVariable);
                        }
                        if(equacionSubVariablesConPadres.charAt(i-1).localeCompare("+") == 0) {
                            if(formulaVariable.includes("-"))
                                formulaVariable = customReplace("-", "+", formulaVariable);
                            if(formulaVariable.includes("/"))
                                formulaVariable = customReplace("/", "+", formulaVariable);
                            if(formulaVariable.includes("*"))
                                formulaVariable = customReplace("*", "+", formulaVariable);
                        }
                        if(equacionSubVariablesConPadres.charAt(i-1).localeCompare("/") == 0) {
                            if(formulaVariable.includes("-"))
                                formulaVariable = customReplace("-", "/", formulaVariable);
                            if(formulaVariable.includes("+"))
                                formulaVariable = customReplace("+", "/", formulaVariable);
                            if(formulaVariable.includes("*"))
                                formulaVariable = customReplace("*", "/", formulaVariable);
                        }
                        if(equacionSubVariablesConPadres.charAt(i-1).localeCompare("*") == 0) {
                            if(formulaVariable.includes("-"))
                                formulaVariable = customReplace("-", "*", formulaVariable);
                            if(formulaVariable.includes("/"))
                                formulaVariable = customReplace("/", "*", formulaVariable);
                            if(formulaVariable.includes("+"))
                                formulaVariable = customReplace("+", "*", formulaVariable);
                        }
                    }
                    equacionSubVariablesConPadres = primeraParte + formulaVariable + ultimaParte;
                    i+=formulaVariable.toString().length;
                } else
                    i+=pal.length;
            }
        };
        equacionSubVariables = equacionSubVariablesConPadres;
        //Verificando si formula es variable padre
        for (var i = 0; i < equacionSubVariables.length; i++) {
            if(equacionSubVariables.charAt(i) != "(" && equacionSubVariables.charAt(i) != ")" && equacionSubVariables.charAt(i) != "<" && equacionSubVariables.charAt(i) != ">" && 
                equacionSubVariables.charAt(i) != "!" && equacionSubVariables.charAt(i) != "=" && equacionSubVariables.charAt(i) != "/" && equacionSubVariables.charAt(i) != "*" && 
                equacionSubVariables.charAt(i) != "√" && equacionSubVariables.charAt(i) != "+" && equacionSubVariables.charAt(i) != "-" && isNaN(equacionSubVariables.charAt(i))) {
                var pal = getVariable(equacionSubVariables, i);
                var formulaVariable, tieneNuevaVariable = false;
                for (var j = 0; j < arregloVariables.length; j++) {
                    if(arregloVariables[j].variables.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                        formulaVariable = arregloVariables[j].formula;
                        if(arregloVariables[j].formula.length > 0) {
                            tieneNuevaVariable = true;
                            //totalesPorVariablesFormula.push({variable: arregloVariables[j].variables, formula: arregloVariables[j].formula.split(/[+|-|*|\/]+/), total: 0});
                        }
                        break;
                    }
                };
                if(tieneNuevaVariable) {
                    var primeraParte = equacionSubVariables.substring(0, i);
                    var ultimaParte = equacionSubVariables.substring(i+pal.length);
                    if(equacionSubVariables.charAt(i-1).localeCompare("-") == 0 || equacionSubVariables.charAt(i-1).localeCompare("+") == 0 ||
                        equacionSubVariables.charAt(i-1).localeCompare("/") == 0 || equacionSubVariables.charAt(i-1).localeCompare("*") == 0) {

                        if(equacionSubVariables.charAt(i-1).localeCompare("-") == 0) {
                            if(formulaVariable.includes("+"))
                                formulaVariable = customReplace("+", "-", formulaVariable);
                            if(formulaVariable.includes("/"))
                                formulaVariable = customReplace("/", "-", formulaVariable);
                            if(formulaVariable.includes("*"))
                                formulaVariable = customReplace("*", "-", formulaVariable);
                        }
                        if(equacionSubVariables.charAt(i-1).localeCompare("+") == 0) {
                            if(formulaVariable.includes("-"))
                                formulaVariable = customReplace("-", "+", formulaVariable);
                            if(formulaVariable.includes("/"))
                                formulaVariable = customReplace("/", "+", formulaVariable);
                            if(formulaVariable.includes("*"))
                                formulaVariable = customReplace("*", "+", formulaVariable);
                        }
                        if(equacionSubVariables.charAt(i-1).localeCompare("/") == 0) {
                            if(formulaVariable.includes("-"))
                                formulaVariable = customReplace("-", "/", formulaVariable);
                            if(formulaVariable.includes("+"))
                                formulaVariable = customReplace("+", "/", formulaVariable);
                            if(formulaVariable.includes("*"))
                                formulaVariable = customReplace("*", "/", formulaVariable);
                        }
                        if(equacionSubVariables.charAt(i-1).localeCompare("*") == 0) {
                            if(formulaVariable.includes("-"))
                                formulaVariable = customReplace("-", "*", formulaVariable);
                            if(formulaVariable.includes("/"))
                                formulaVariable = customReplace("/", "*", formulaVariable);
                            if(formulaVariable.includes("+"))
                                formulaVariable = customReplace("+", "*", formulaVariable);
                        }
                    }
                    equacionSubVariables = primeraParte + formulaVariable + ultimaParte;/*
                    console.log('equacionSubVariables despues')
                    console.log(equacionSubVariables)*/
                }
                //i+=pal.length;
            }
        };

        equacionVarReglas = '';
        if(activosInstanciasVarReglas.length > 0) {
            equacionVarReglas = equacionSubVariables;
            for (var i = 0; i < equacionVarReglas.length; i++) {
                if(equacionVarReglas.charAt(i) != "(" && equacionVarReglas.charAt(i) != ")" && equacionVarReglas.charAt(i) != "<" && equacionVarReglas.charAt(i) != ">" && 
                    equacionVarReglas.charAt(i) != "!" && equacionVarReglas.charAt(i) != "=" && equacionVarReglas.charAt(i) != "/" && equacionVarReglas.charAt(i) != "*" && 
                    equacionVarReglas.charAt(i) != "√" && equacionVarReglas.charAt(i) != "+" && equacionVarReglas.charAt(i) != "-" && isNaN(equacionVarReglas.charAt(i))) {
                    var pal = getVariable(equacionVarReglas, i);
                    var variablesDeSubVariable = '', tieneVariable = false, modificarSigno = true;
                    Loop1:
                    for (var j = 0; j < subvariablesSolas.length; j++) {
                        if(subvariablesSolas[j] != undefined) {
                            for (var k = 0; k < subvariablesSolas[j].length; k++) {
                                if(subvariablesSolas[j][k] != undefined) {
                                    for (var n = 0; n < subvariablesSolas[j][k].length; n++) {
                                        if(subvariablesSolas[j][k][n] != undefined) {
                                            if(subvariablesSolas[j][k][n].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0 && subvariablesSolas[j][k][n].tablaAplicar == 1) {
                                                if(reglasActivos[j] != undefined && reglasActivos[j][k] != undefined && reglasActivos[j][k][n] != undefined) {
                                                    for (var q = 0; q < reglasActivos[j][k][n].length; q++) {
                                                        //if(q == reglasActivos[j][k][n].length-1) {
                                                            var signo = '';
                                                            for (var f = 0; f < reglasActivos[j][k][n].length; f++) {
                                                                if( reglasActivos[j][k][n][f].valor.includes(reglasActivos[j][k][n][q].variables) ) {
                                                                    signo = reglasActivos[j][k][n][f].operacion;
                                                                    modificarSigno = false;
                                                                    //break;
                                                                }
                                                            };
                                                            if(reglasActivos[j][k][n][q].campoObjetivo.indexOf("AGRUPACION") == 0) {
                                                                signo = "+";
                                                                modificarSigno = false
                                                            }
                                                            variablesDeSubVariable+=signo+reglasActivos[j][k][n][q].variables;
                                                        //}
                                                        tieneVariable = true;
                                                    };
                                                }
                                                break Loop1;
                                            }
                                        }
                                    };
                                }
                            };
                        }
                    };
                    if(tieneVariable) {
                        var primeraParte = equacionVarReglas.substring(0, i);
                        var ultimaParte = equacionVarReglas.substring(i+pal.length);
                        if( (equacionVarReglas.charAt(i-1).localeCompare("-") == 0 || equacionVarReglas.charAt(i-1).localeCompare("+") == 0 ||
                            equacionVarReglas.charAt(i-1).localeCompare("/") == 0 || equacionVarReglas.charAt(i-1).localeCompare("*") == 0) && modificarSigno) {

                            if(equacionVarReglas.charAt(i-1).localeCompare("-") == 0) {
                                if(variablesDeSubVariable.includes("+"))
                                    variablesDeSubVariable = customReplace("+", "-", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("/"))
                                    variablesDeSubVariable = customReplace("/", "-", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("*"))
                                    variablesDeSubVariable = customReplace("*", "-", variablesDeSubVariable);
                            }
                            if(equacionVarReglas.charAt(i-1).localeCompare("+") == 0) {
                                if(variablesDeSubVariable.includes("-"))
                                    variablesDeSubVariable = customReplace("-", "+", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("/"))
                                    variablesDeSubVariable = customReplace("/", "+", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("*"))
                                    variablesDeSubVariable = customReplace("*", "+", variablesDeSubVariable);
                            }
                            if(equacionVarReglas.charAt(i-1).localeCompare("/") == 0) {
                                if(variablesDeSubVariable.includes("-"))
                                    variablesDeSubVariable = customReplace("-", "/", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("+"))
                                    variablesDeSubVariable = customReplace("+", "/", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("*"))
                                    variablesDeSubVariable = customReplace("*", "/", variablesDeSubVariable);
                            }
                            if(equacionVarReglas.charAt(i-1).localeCompare("*") == 0) {
                                if(variablesDeSubVariable.includes("-"))
                                    variablesDeSubVariable = customReplace("-", "*", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("/"))
                                    variablesDeSubVariable = customReplace("/", "*", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("+"))
                                    variablesDeSubVariable = customReplace("+", "*", variablesDeSubVariable);
                            }
                        }
                        equacionVarReglas = primeraParte + variablesDeSubVariable + ultimaParte;
                    } //else
                        //todasTienenVariable = false;
                    i+=variablesDeSubVariable.toString().length;
                }
            };
        }

        equacionVarCuentas = '';
        if(arregloCuentas.length > 0) {
            equacionVarCuentas = equacionSubVariables;
            for (var i = 0; i < equacionVarCuentas.length; i++) {
                if(equacionVarCuentas.charAt(i) != "(" && equacionVarCuentas.charAt(i) != ")" && equacionVarCuentas.charAt(i) != "<" && equacionVarCuentas.charAt(i) != ">" && 
                    equacionVarCuentas.charAt(i) != "!" && equacionVarCuentas.charAt(i) != "=" && equacionVarCuentas.charAt(i) != "/" && equacionVarCuentas.charAt(i) != "*" && 
                    equacionVarCuentas.charAt(i) != "√" && equacionVarCuentas.charAt(i) != "+" && equacionVarCuentas.charAt(i) != "-" && isNaN(equacionVarCuentas.charAt(i))) {
                    var pal = getVariable(equacionVarCuentas, i);
                    var variablesDeSubVariable = '', tieneVariable = false, modificarSigno = true;
                    Loop1:
                    for (var j = 0; j < subvariablesSolas.length; j++) {
                        if(subvariablesSolas[j] != undefined) {
                            for (var k = 0; k < subvariablesSolas[j].length; k++) {
                                if(subvariablesSolas[j][k] != undefined) {
                                    for (var n = 0; n < subvariablesSolas[j][k].length; n++) {
                                        if(subvariablesSolas[j][k][n] != undefined) {
                                            if(subvariablesSolas[j][k][n].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0 && subvariablesSolas[j][k][n].tablaAplicar == 1) {
                                                if(arregloCuentas[j] != undefined && arregloCuentas[j][k] != undefined && arregloCuentas[j][k][n] != undefined) {
                                                    for (var q = 0; q < arregloCuentas[j][k][n].length; q++) {
                                                        if(arregloCuentas[j][k][n][q] != undefined) {
                                                            for (var f = 0; f < arregloCuentas[j][k][n][q].length; f++) {
                                                                if(arregloCuentas[j][k][n][q][f].varDeCuenta == undefined) {
                                                                    //if(q == arregloCuentas[j][k][n].length-1) {
                                                                        variablesDeSubVariable+=arregloCuentas[j][k][n][q][f].signo+arregloCuentas[j][k][n][q][f].variable;
                                                                    //}
                                                                    tieneVariable = true;
                                                                    modificarSigno = false;
                                                                }
                                                            };
                                                        }
                                                    };
                                                }
                                                break Loop1;
                                            }
                                        }
                                    };
                                }
                            };
                        }
                    };
                    if(tieneVariable) {
                        var primeraParte = equacionVarCuentas.substring(0, i);
                        var ultimaParte = equacionVarCuentas.substring(i+pal.length);
                        if( (equacionVarCuentas.charAt(i-1).localeCompare("-") == 0 || equacionVarCuentas.charAt(i-1).localeCompare("+") == 0 ||
                            equacionVarCuentas.charAt(i-1).localeCompare("/") == 0 || equacionVarCuentas.charAt(i-1).localeCompare("*") == 0) && modificarSigno) {

                            if(equacionVarCuentas.charAt(i-1).localeCompare("-") == 0) {
                                if(variablesDeSubVariable.includes("+"))
                                    variablesDeSubVariable = customReplace("+", "-", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("/"))
                                    variablesDeSubVariable = customReplace("/", "-", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("*"))
                                    variablesDeSubVariable = customReplace("*", "-", variablesDeSubVariable);
                            }
                            if(equacionVarCuentas.charAt(i-1).localeCompare("+") == 0) {
                                if(variablesDeSubVariable.includes("-"))
                                    variablesDeSubVariable = customReplace("-", "+", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("/"))
                                    variablesDeSubVariable = customReplace("/", "+", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("*"))
                                    variablesDeSubVariable = customReplace("*", "+", variablesDeSubVariable);
                            }
                            if(equacionVarCuentas.charAt(i-1).localeCompare("/") == 0) {
                                if(variablesDeSubVariable.includes("-"))
                                    variablesDeSubVariable = customReplace("-", "/", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("+"))
                                    variablesDeSubVariable = customReplace("+", "/", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("*"))
                                    variablesDeSubVariable = customReplace("*", "/", variablesDeSubVariable);
                            }
                            if(equacionVarCuentas.charAt(i-1).localeCompare("*") == 0) {
                                if(variablesDeSubVariable.includes("-"))
                                    variablesDeSubVariable = customReplace("-", "*", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("/"))
                                    variablesDeSubVariable = customReplace("/", "*", variablesDeSubVariable);
                                if(variablesDeSubVariable.includes("+"))
                                    variablesDeSubVariable = customReplace("+", "*", variablesDeSubVariable);
                            }
                        }
                        equacionVarCuentas = primeraParte + variablesDeSubVariable + ultimaParte;
                    } //else
                        //todasTienenVariable = false;
                    i+=variablesDeSubVariable.toString().length;
                }
            };
        }
        //var rcl = math.eval(equacionSubVariables);
        //totalesPorVariablesFormula[0].total = rcl;
        var numeradoresVariables = getNumeratorFraction(equacionVariables);
        var denominadoresVariables = getDenominatorFraction(equacionVariables);
        var numeradoresSubVariablesConPadres = getNumeratorFraction(equacionSubVariablesConPadres);
        var denominadoresSubVariablesConPadres = getDenominatorFraction(equacionSubVariablesConPadres);
        var numeradoresSubVariables = getNumeratorFraction(equacionSubVariables);
        var denominadoresSubVariables = getDenominatorFraction(equacionSubVariables);
        console.log('equacionVariables');
        console.log(equacionVariables);
        console.log('equacionSubVariablesConPadres')
        console.log(equacionSubVariablesConPadres)
        console.log('equacionSubVariables');
        console.log(equacionSubVariables);
        console.log('equacionVarReglas');
        console.log(equacionVarReglas);
        console.log('equacionVarCuentas');
        console.log(equacionVarCuentas);
        console.log('formulaGlobal');
        console.log(formulaGlobal);
        console.log('numeradoresVariables');
        console.log(numeradoresVariables);
        console.log('denominadoresVariables');
        console.log(denominadoresVariables);
        console.log('numeradoresSubVariables');
        console.log(numeradoresSubVariables);
        console.log('denominadoresSubVariables');
        console.log(denominadoresSubVariables);
        console.log('reglasActivos');
        console.log(reglasActivos);
        console.log('FECHA');
        console.log(diaRCL);
        console.log('arregloMonedas');
        console.log(arregloMonedas);
        console.log('variablesSolas');
        console.log(variablesSolas);
        console.log('subvariablesSolas');
        console.log(subvariablesSolas);
        console.log('variablesDeSubVariablesSolas');
        console.log(variablesDeSubVariablesSolas);
        console.log('arregloCuentas');
        console.log(arregloCuentas);
        for (var i = 0; i < arregloMonedas.length; i++) {
            console.log('variablesSolas = '+arregloMonedas[i]);
            console.log(window["variablesSolas"+arregloMonedas[i]]);
            console.log('subvariablesSolas = '+arregloMonedas[i]);
            console.log(window["subvariablesSolas"+arregloMonedas[i]]);
            console.log('variablesDeSubVariablesSolas = '+arregloMonedas[i]);
            console.log(window["variablesDeSubVariablesSolas"+arregloMonedas[i]]);
            console.log('arregloCuentas = '+arregloMonedas[i]);
            console.log(window["arregloCuentas"+arregloMonedas[i]]);
        };
        /*for (var i = 0; i < arregloAgencias.length; i++) {
            console.log('variablesSolas = '+arregloAgencias[i]);
            console.log(window["variablesSolas"+arregloAgencias[i]]);
            console.log('subvariablesSolas = '+arregloAgencias[i]);
            console.log(window["subvariablesSolas"+arregloAgencias[i]]);
            console.log('variablesDeSubVariablesSolas = '+arregloAgencias[i]);
            console.log(window["variablesDeSubVariablesSolas"+arregloAgencias[i]]);
            console.log('arregloCuentas = '+arregloAgencias[i]);
            console.log(window["arregloCuentas"+arregloAgencias[i]]);
        };*/
        /*for (var i = 0; i < subvariablesSolas.length; i++) {
            for (var j = 0; j < subvariablesSolas[i].length; j++) {
                for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                    console.log(subvariablesSolas[i][j][k])
                    console.log(subvariablesSolas[i][j][k].total)
                };
            };
        };*/
        //console.log('totalesPorVariablesFormula');
        //console.log(totalesPorVariablesFormula);

        //Con ecuaciones listas, reemplazar por valores numericos en cada proyeccion
        //equacionVarReglas
        /*if(todasTienenVariable) {
            for (var i = 0; i < proyecciones.length; i++) {
                var ecuacionResuelta = equacionVarReglas;
                for (var j = 0; j < variablesSolas[i].length; j++) {
                    if(variablesSolas[j] != undefined) {
                        for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                            if(subvariablesSolas[i][j] != undefined) {
                                for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                                    LoopChar:
                                    for (var z = 0; z < ecuacionResuelta.length; z++) {
                                        if(ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
                                            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
                                            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z))) {
                                            var pal = getVariable(ecuacionResuelta, z);
                                            var valorInciso;
                                            if(variablesDeSubVariablesSolas[i][j][k][n] != undefined && variablesDeSubVariablesSolas[i][j][k][n].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0 && variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion == proyecciones[i]) {
                                                valorInciso = variablesDeSubVariablesSolas[i][j][k][n].total;
                                                var primeraParte = ecuacionResuelta.substring(0, z);
                                                var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                                ecuacionResuelta = primeraParte + valorInciso + ultimaParte;
                                                var resultado;
                                                if(k == variablesDeSubVariablesSolas[i][j][k].length-1) {
                                                    try {
                                                        resultado = math.eval(ecuacionResuelta);
                                                    } catch(err) {
                                                        resultado = 0;
                                                    }
                                                    console.log(subvariablesSolas[i][j][k]);
                                                    console.log('antes = '+subvariablesSolas[i][j][k].total);
                                                    subvariablesSolas[i][j][k].total = resultado;
                                                    console.log('despues = '+subvariablesSolas[i][j][k].total);
                                                    //if(!isNaN(resultado))
                                                }
                                                break LoopChar;
                                            }
                                            z+=pal.length;
                                        }
                                    };
                                };
                                LoopChar:
                                for (var z = 0; z < ecuacionResuelta.length; z++) {
                                    if(ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
                                        ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
                                        ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z))) {
                                        var pal = getVariable(ecuacionResuelta, z);
                                        var valorInciso;
                                        if(subvariablesSolas[i][j][k] != undefined && subvariablesSolas[i][j][k].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0 && subvariablesSolas[i][j][k].tipoProyeccion == proyecciones[i]) {
                                            valorInciso = subvariablesSolas[i][j][k].total;
                                            var primeraParte = ecuacionResuelta.substring(0, z);
                                            var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                            ecuacionResuelta = primeraParte + valorInciso + ultimaParte;
                                            var resultado;
                                            if(k == variablesDeSubVariablesSolas[i][j][k].length-1) {
                                                try {
                                                    resultado = math.eval(ecuacionResuelta);
                                                } catch(err) {
                                                    resultado = 0;
                                                }
                                                //console.log('antes = '+subvariablesSolas[i][indexVarRCL][k].total);
                                                subvariablesSolas[i][j][k].total = resultado;
                                                //console.log('despues = '+subvariablesSolas[i][indexVarRCL][k].total);
                                            }
                                            break LoopChar;
                                        }
                                        z+=pal.length;
                                    }
                                };
                            }
                        };
                    }
                };
            };
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "No se pudo calcular el RCL, dado que no todas las sub-variable tienen variables asociadas.",
                overlay: true,
                closeConfirm: true
            });
        }*/
        console.log('==============');
        console.log('==============');
        console.log('==============');
        console.log('==============');
        //equacionSubVariables Añadiendo total a variables padres que tienen hijas variables padres y subvariables
        for (var p = 0; p < arregloMonedas.length; p++) {
            for (var i = 0; i < proyecciones.length; i++) {
                var calculoTodasMenosRCL = false, contadorSalida = 0, j = 0, calculoTodasContador = 0;
                while(!calculoTodasMenosRCL && contadorSalida < 100) {
                    if( VarEnFormulaYaCalculadasMoneda(window["variablesSolas"+arregloMonedas[p]][i][j].formula, window["variablesSolas"+arregloMonedas[p]][i][j].tipoProyeccion, arregloMonedas[p]) && !window["variablesSolas"+arregloMonedas[p]][i][j].calculada && window["variablesSolas"+arregloMonedas[p]][i][j].formula.length > 0) {
                        var ecuacionResuelta = window["variablesSolas"+arregloMonedas[p]][i][j].formula;
                        for (var z = 0; z < ecuacionResuelta.length; z++) {
                            if(ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
                                ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
                                ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z))) {
                                var pal = getVariable(ecuacionResuelta, z);
                                Loop1:
                                for (var c = 0; c < window["subvariablesSolas"+arregloMonedas[p]][i].length; c++) {
                                    for (var f = 0; f < window["subvariablesSolas"+arregloMonedas[p]][i][c].length; f++) {
                                        if(window["subvariablesSolas"+arregloMonedas[p]][i][c][f].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                                            var primeraParte = ecuacionResuelta.substring(0, z);
                                            var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                            ecuacionResuelta = primeraParte + window["subvariablesSolas"+arregloMonedas[p]][i][c][f].total + ultimaParte;
                                            z += window["subvariablesSolas"+arregloMonedas[p]][i][c][f].total.toString().length-1;
                                            break Loop1;
                                        }
                                    };
                                    if(window["variablesSolas"+arregloMonedas[p]][i][c].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                                        var primeraParte = ecuacionResuelta.substring(0, z);
                                        var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                        ecuacionResuelta = primeraParte + window["variablesSolas"+arregloMonedas[p]][i][c].total + ultimaParte;
                                        z += window["variablesSolas"+arregloMonedas[p]][i][c].total.toString().length-1;
                                        break Loop1;
                                    }
                                };
                            }
                        };
                        var resultado;
                        try {
                            resultado = math.eval(ecuacionResuelta);
                        } catch(err) {
                            resultado = 0;
                        }
                        calculoTodasContador++;
                        window["variablesSolas"+arregloMonedas[p]][i][j].total = resultado;
                        window["variablesSolas"+arregloMonedas[p]][i][j].calculada = true;
                    }
                    contadorSalida++;
                    j++;
                    if(j == window["variablesSolas"+arregloMonedas[p]][i].length)
                        j = 0;
                    if(calculoTodasContador == window["variablesSolas"+arregloMonedas[p]][i].length-1)
                        calculoTodasMenosRCL = true;
                }
            };
        };
        /*for (var i = 0; i < proyecciones.length; i++) {
            var calculoTodasMenosRCL = false, contadorSalida = 0, j = 0, calculoTodasContador = 0;
            while(!calculoTodasMenosRCL && contadorSalida < 100) {
                if( VarEnFormulaYaCalculadas(variablesSolas[i][j].formula, variablesSolas[i][j].tipoProyeccion) && !variablesSolas[i][j].calculada && variablesSolas[i][j].formula.length > 0) {
                    var ecuacionResuelta = variablesSolas[i][j].formula;
                    for (var z = 0; z < ecuacionResuelta.length; z++) {
                        if(ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
                            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
                            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z))) {
                            var pal = getVariable(ecuacionResuelta, z);
                            Loop1:
                            for (var c = 0; c < subvariablesSolas[i].length; c++) {
                                for (var f = 0; f < subvariablesSolas[i][c].length; f++) {
                                    if(subvariablesSolas[i][c][f].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                                        var primeraParte = ecuacionResuelta.substring(0, z);
                                        var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                        ecuacionResuelta = primeraParte + subvariablesSolas[i][c][f].total + ultimaParte;
                                        z += subvariablesSolas[i][c][f].total.toString().length-1;
                                        break Loop1;
                                    }
                                };
                                if(variablesSolas[i][c].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                                    var primeraParte = ecuacionResuelta.substring(0, z);
                                    var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                    ecuacionResuelta = primeraParte + variablesSolas[i][c].total + ultimaParte;
                                    z += variablesSolas[i][c].total.toString().length-1;
                                    break Loop1;
                                }
                            };
                        }
                    };
                    var resultado;
                    try {
                        resultado = math.eval(ecuacionResuelta);
                    } catch(err) {
                        resultado = 0;
                    }
                    calculoTodasContador++;
                    variablesSolas[i][j].total = resultado;
                    variablesSolas[i][j].calculada = true;
                }
                contadorSalida++;
                j++;
                if(j == variablesSolas[i].length)
                    j = 0;
                if(calculoTodasContador == variablesSolas[i].length-1)
                    calculoTodasMenosRCL = true;
            }
        };*/
        /*for (var i = 0; i < proyecciones.length; i++) {
            for (var j = 0; j < variablesSolas[i].length; j++) {
                if(variablesSolas[i][j] != undefined) {
                    if(subvariablesSolas[i][j] != undefined) {
                        if(subvariablesSolas[i][j].length == 0 && j != indexVarRCL) {
                            var ecuacionResuelta = variablesSolas[i][j].formula;
                            for (var o = 0; o < arregloVariables.length; o++) {
                                LoopChar:
                                for (var z = 0; z < ecuacionResuelta.length; z++) {
                                    if(ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
                                        ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
                                        ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z))) {
                                        var pal = getVariable(ecuacionResuelta, z);
                                        var valorInciso;
                                        var variableAComparar = getVarForTotal(arregloVariables[o].variables, proyecciones[i]);
                                        if(variableAComparar != undefined && arregloVariables[o].variables.toLowerCase().localeCompare(pal.toLowerCase()) == 0 && variableAComparar.tipoProyeccion == proyecciones[i]) {
                                            valorInciso = variableAComparar.total;
                                            var primeraParte = ecuacionResuelta.substring(0, z);
                                            var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                            ecuacionResuelta = primeraParte + valorInciso + ultimaParte;
                                            z += pal.length-1;
                                            var resultado;
                                            if(o == arregloVariables.length-1) {
                                                try {
                                                    resultado = math.eval(ecuacionResuelta);
                                                } catch(err) {
                                                    resultado = 0;
                                                }
                                                variablesSolas[i][j].total = resultado;
                                            }
                                            break LoopChar;
                                        } else {
                                            z += pal.length-1;
                                        }
                                    }
                                };
                            };
                        }
                    }
                }
            };
        };*/
        //equacionVariables
        for (var p = 0; p < arregloMonedas.length; p++) {
            for (var i = 0; i < proyecciones.length; i++) {
                var ecuacionResuelta = equacionVariables;
                for (var j = 0; j < window["variablesSolas"+arregloMonedas[p]][i].length; j++) {
                    if(proyecciones[i] == window["variablesSolas"+arregloMonedas[p]][i][j].tipoProyeccion) {
                        LoopChar:
                        for (var z = 0; z < ecuacionResuelta.length; z++) {
                            if(ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
                                ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
                                ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z))) {
                                var pal = getVariable(ecuacionResuelta, z);
                                var valorInciso;
                                if(window["variablesSolas"+arregloMonedas[p]][i][j] != undefined && window["variablesSolas"+arregloMonedas[p]][i][j].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0 && window["variablesSolas"+arregloMonedas[p]][i][j].tipoProyeccion == proyecciones[i]) {
                                    var valorInciso = window["variablesSolas"+arregloMonedas[p]][i][j].total;
                                    var primeraParte = ecuacionResuelta.substring(0, z);
                                    var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                    ecuacionResuelta = primeraParte + valorInciso + ultimaParte;
                                    var resultado;
                                    if(j == window["variablesSolas"+arregloMonedas[p]][i].length-1) {
                                        try {
                                            resultado = math.eval(ecuacionResuelta);
                                        } catch(err) {
                                            resultado = 0;
                                        }
                                        window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].total = math.round(resultado, 2);
                                    }
                                    //break LoopChar;                                                    /// REVISAR --------------     LO QUITE Y AHORA FUNCIONA
                                }
                            } else if(j == window["variablesSolas"+arregloMonedas[p]][i].length-1) {
                                try {
                                    resultado = math.eval(ecuacionResuelta);
                                } catch(err) {
                                    resultado = 0;
                                }
                                console.log(ecuacionResuelta);
                                console.log(resultado);
                                /*try {
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].total = math.round(resultado, 2);
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].esRCL = true;
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].volumenFormula = 100;
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].influenciaFormula = 100;
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].numerador = 100;
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].denominador = 100;
                                } catch (err) {
                                    console.log(err);
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].total = resultado;
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].esRCL = true;
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].volumenFormula = 100;
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].influenciaFormula = 100;
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].numerador = 100;
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].denominador = 100;
                                }*/
                                if(!isNaN(resultado) && isFinite(resultado)) {
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].total = math.round(resultado, 2);
                                } else {
                                    window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].total = 0;
                                }
                                window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].esRCL = true;
                                window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].volumenFormula = 100;
                                window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].influenciaFormula = 100;
                                window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].numerador = 100;
                                window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].denominador = 100;
                            }
                        };
                    }
                };
            };
        };
        /*for (var i = 0; i < proyecciones.length; i++) {
            var ecuacionResuelta = equacionVariables;
            for (var j = 0; j < variablesSolas[i].length; j++) {
                if(proyecciones[i] == variablesSolas[i][j].tipoProyeccion) {
                    LoopChar:
                    for (var z = 0; z < ecuacionResuelta.length; z++) {
                        if(ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
                            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
                            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z))) {
                            var pal = getVariable(ecuacionResuelta, z);
                            var valorInciso;
                            if(variablesSolas[i][j] != undefined && variablesSolas[i][j].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0 && variablesSolas[i][j].tipoProyeccion == proyecciones[i]) {
                                var valorInciso = variablesSolas[i][j].total;
                                var primeraParte = ecuacionResuelta.substring(0, z);
                                var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                ecuacionResuelta = primeraParte + valorInciso + ultimaParte;
                                var resultado;
                                if(j == variablesSolas[i].length-1) {
                                    try {
                                        resultado = math.eval(ecuacionResuelta);
                                    } catch(err) {
                                        resultado = 0;
                                    }
                                    variablesSolas[i][indexVarRCL].total = resultado;
                                }
                                break LoopChar;                                                     /// REVISAR --------------
                            }
                        } else if(j == variablesSolas[i].length-1) {
                            try {
                                resultado = math.eval(ecuacionResuelta);
                            } catch(err) {
                                resultado = 0;
                            }
                            variablesSolas[i][indexVarRCL].total = resultado;
                            variablesSolas[i][indexVarRCL].esRCL = true;
                            variablesSolas[i][indexVarRCL].volumenFormula = 100;
                            variablesSolas[i][indexVarRCL].influenciaFormula = 100;
                            variablesSolas[i][indexVarRCL].numerador = 100;
                            variablesSolas[i][indexVarRCL].denominador = 100;
                        }
                    };
                }
            };
        };*/

        //Agregando valor de total RCL
        for (var p = 0; p < arregloMonedas.length; p++) {
            for (var i = 0; i < proyecciones.length; i++) {
                for (var j = 0; j < window["variablesSolas"+arregloMonedas[p]][i].length; j++) {
                    if(window["variablesSolas"+arregloMonedas[p]][i][j] != undefined) {
                        window["variablesSolas"+arregloMonedas[p]][i][j].totalRCL = math.round(window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].total, 2);
                        for (var k = 0; k < window["subvariablesSolas"+arregloMonedas[p]][i][j].length; k++) {
                            if(window["subvariablesSolas"+arregloMonedas[p]][i][j][k] != undefined) {
                                window["subvariablesSolas"+arregloMonedas[p]][i][j][k].totalRCL = math.round(window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].total, 2);
                                for (var n = 0; n < window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k].length; n++) {
                                    if(window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n] != undefined) {
                                        window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].totalRCL = math.round(window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].total, 2);
                                        for (var z = 0; z < arregloCuentas[i][j][k][n].length; z++) {
                                            window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].totalRCL = math.round(window["variablesSolas"+arregloMonedas[p]][i][indexVarRCL].total, 2);
                                        };
                                    }
                                };
                            }
                        };
                    }
                };
            };
        };
        /*for (var i = 0; i < proyecciones.length; i++) {
            for (var j = 0; j < variablesSolas[i].length; j++) {
                if(variablesSolas[i][j] != undefined) {
                    variablesSolas[i][j].totalRCL = variablesSolas[i][indexVarRCL].total;
                    for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                        if(subvariablesSolas[i][j][k] != undefined) {
                            subvariablesSolas[i][j][k].totalRCL = variablesSolas[i][indexVarRCL].total;
                            for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                                if(variablesDeSubVariablesSolas[i][j][k][n] != undefined) {
                                    variablesDeSubVariablesSolas[i][j][k][n].totalRCL = variablesSolas[i][indexVarRCL].total;
                                    for (var z = 0; z < arregloCuentas[i][j][k][n].length; z++) {
                                        arregloCuentas[i][j][k][n][z].totalRCL = variablesSolas[i][indexVarRCL].total;
                                    };
                                }
                            };
                        }
                    };
                }
            };
        };*/

        //Añadiendo numerador y denominador
        var totalesNumerador = [], totalesDenominador = [];
        for (var i = 0; i < proyecciones.length; i++) {
            for (var o = 0; o < numeradoresVariables.length; o++) {
                var ecuacionResuelta = numeradoresVariables[o];
                var totalesPalabras = ecuacionResuelta.split(/[-+\/*]/);
                var contTotalPalabras = 0;
                LoopChar:
                for (var z = 0; z < ecuacionResuelta.length; z++) {
                    for (var j = 0; j < variablesSolas[i].length; j++) {
                        if(variablesSolas[i][j] != undefined && ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
                            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
                            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z))) {
                            var pal = getVariable(ecuacionResuelta, z);
                            var valorInciso;
                            if(variablesSolas[i][j].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                                valorInciso = variablesSolas[i][j].total;
                                var primeraParte = ecuacionResuelta.substring(0, z);
                                var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                ecuacionResuelta = primeraParte + valorInciso + ultimaParte;
                                z += pal.length-1;
                                j = 0;
                                contTotalPalabras++;
                                var resultado;
                                if(o == numeradoresVariables.length-1 && contTotalPalabras >= totalesPalabras.length) {
                                    try {
                                        resultado = math.eval(ecuacionResuelta);
                                    } catch(err) {
                                        resultado = 0;
                                    }
                                    totalesNumerador.push(resultado);
                                }
                            }/* else {
                                z += pal.length-1;
                            }*/
                        }
                    };
                };
            }; /// fin numerador
            for (var o = 0; o < denominadoresVariables.length; o++) {
                var ecuacionResuelta = denominadoresVariables[o];
                var totalesPalabras = ecuacionResuelta.split(/[-+\/*]/);
                var contTotalPalabras = 0;
                LoopChar:
                for (var z = 0; z < ecuacionResuelta.length; z++) {
                    for (var j = 0; j < variablesSolas[i].length; j++) {
                        if(variablesSolas[i][j] != undefined && ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
                            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
                            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z)) &&
                            ecuacionResuelta.charAt(z) != "." ) {
                            var pal = getVariable(ecuacionResuelta, z);
                            var valorInciso;
                            if(variablesSolas[i][j].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                                valorInciso = variablesSolas[i][j].total;
                                var primeraParte = ecuacionResuelta.substring(0, z);
                                var ultimaParte = ecuacionResuelta.substring(z+pal.length);
                                ecuacionResuelta = primeraParte + valorInciso + ultimaParte;
                                z += valorInciso.toString().length-1;
                                j = 0;
                                contTotalPalabras++;
                                var resultado;
                                if(o == denominadoresVariables.length-1 && contTotalPalabras >= totalesPalabras.length) {
                                    try {
                                        resultado = math.eval(ecuacionResuelta);
                                    } catch(err) {
                                        resultado = 0;
                                    }
                                    totalesDenominador.push(resultado);
                                }
                            }/* else {
                                z += pal.length-1;
                            }*/
                        }
                    };
                };
            }; /// fin denominador
        };
        if(totalesDenominador.length == 0) {
            for (var i = 0; i < proyecciones.length; i++) {
                totalesDenominador.push(1);
            };
        }
        for (var p = 0; p < arregloMonedas.length; p++) {
            for (var i = 0; i < proyecciones.length; i++) {
                for (var j = 0; j < window["variablesSolas"+arregloMonedas[p]][i].length; j++) {
                    if(indexVarRCL != j) {
                        if(numeradoresVariables[0].includes(window["variablesSolas"+arregloMonedas[p]][i][j].variable))
                            window["variablesSolas"+arregloMonedas[p]][i][j].esNumerador = true;
                        else if(numeradoresSubVariablesConPadres[0].includes(window["variablesSolas"+arregloMonedas[p]][i][j].variable))
                            window["variablesSolas"+arregloMonedas[p]][i][j].esNumerador = true;
                        else if(denominadoresSubVariablesConPadres[0].includes(window["variablesSolas"+arregloMonedas[p]][i][j].variable))
                            window["variablesSolas"+arregloMonedas[p]][i][j].esNumerador = false;
                        else
                            window["variablesSolas"+arregloMonedas[p]][i][j].esNumerador = false;
                        window["variablesSolas"+arregloMonedas[p]][i][j].numerador = totalesNumerador[i];
                        window["variablesSolas"+arregloMonedas[p]][i][j].denominador = totalesDenominador[i];
                    }
                    if(window["subvariablesSolas"+arregloMonedas[p]][i][j].length > 0) {
                        for (var k = 0; k < window["subvariablesSolas"+arregloMonedas[p]][i][j].length; k++) {
                            if(numeradoresSubVariables[0].includes(variablesSolas[i][j].variable))
                                window["subvariablesSolas"+arregloMonedas[p]][i][j][k].esNumerador = true;
                            else if(numeradoresSubVariablesConPadres[0].includes(variablesSolas[i][j].variable))
                                window["subvariablesSolas"+arregloMonedas[p]][i][j][k].esNumerador = true;
                            else
                                window["subvariablesSolas"+arregloMonedas[p]][i][j][k].esNumerador = false;
                            window["subvariablesSolas"+arregloMonedas[p]][i][j][k].numerador = totalesNumerador[i];
                            window["subvariablesSolas"+arregloMonedas[p]][i][j][k].denominador = totalesDenominador[i];
                            if(window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k].length > 0) {
                                for (var n = 0; n < window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k].length; n++) {
                                    if(numeradoresSubVariables[0].includes(variablesSolas[i][j].variable))
                                        window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].esNumerador = true;
                                    else if(numeradoresSubVariablesConPadres[0].includes(variablesSolas[i][j].variable))
                                        window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].esNumerador = true;
                                    else
                                        window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].esNumerador = false;
                                    window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].numerador = totalesNumerador[i];
                                    window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].denominador = totalesDenominador[i];
                                };
                            }
                        };
                    }
                }
            };
        };
        /*for (var i = 0; i < proyecciones.length; i++) {
            for (var j = 0; j < variablesSolas[i].length; j++) {
                if(indexVarRCL != j) {
                    if(numeradoresVariables[0].includes(variablesSolas[i][j].variable))
                        variablesSolas[i][j].esNumerador = true;
                    else if(numeradoresSubVariablesConPadres[0].includes(variablesSolas[i][j].variable))
                        variablesSolas[i][j].esNumerador = true;
                    else if(denominadoresSubVariablesConPadres[0].includes(variablesSolas[i][j].variable))
                        variablesSolas[i][j].esNumerador = false;
                    else
                        variablesSolas[i][j].esNumerador = false;
                    variablesSolas[i][j].numerador = totalesNumerador[i];
                    variablesSolas[i][j].denominador = totalesDenominador[i];
                }
                if(subvariablesSolas[i][j].length > 0) {
                    for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                        if(numeradoresSubVariables[0].includes(variablesSolas[i][j].variable))
                            subvariablesSolas[i][j][k].esNumerador = true;
                        else if(numeradoresSubVariablesConPadres[0].includes(variablesSolas[i][j].variable))
                            subvariablesSolas[i][j][k].esNumerador = true;
                        else
                            subvariablesSolas[i][j][k].esNumerador = false;
                        subvariablesSolas[i][j][k].numerador = totalesNumerador[i];
                        subvariablesSolas[i][j][k].denominador = totalesDenominador[i];
                        if(variablesDeSubVariablesSolas[i][j][k].length > 0) {
                            for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                                if(numeradoresSubVariables[0].includes(variablesSolas[i][j].variable))
                                    variablesDeSubVariablesSolas[i][j][k][n].esNumerador = true;
                                else if(numeradoresSubVariablesConPadres[0].includes(variablesSolas[i][j].variable))
                                    variablesDeSubVariablesSolas[i][j][k][n].esNumerador = true;
                                else
                                    variablesDeSubVariablesSolas[i][j][k][n].esNumerador = false;
                                variablesDeSubVariablesSolas[i][j][k][n].numerador = totalesNumerador[i];
                                variablesDeSubVariablesSolas[i][j][k][n].denominador = totalesDenominador[i];
                            };
                        }
                    };
                }
            }
        };*/
        //agregando numerador y denominador a cuentas
        for (var p = 0; p < arregloMonedas.length; p++) {
            for (var i = 0; i < window["arregloCuentas"+arregloMonedas[p]].length; i++) {
                if(window["arregloCuentas"+arregloMonedas[p]][i] != undefined) {
                    for (var j = 0; j < window["arregloCuentas"+arregloMonedas[p]][i].length; j++) {
                        if(window["arregloCuentas"+arregloMonedas[p]][i][j] != undefined) {
                            for (var k = 0; k < window["arregloCuentas"+arregloMonedas[p]][i][j].length; k++) {
                                if(window["arregloCuentas"+arregloMonedas[p]][i][j][k] != undefined) {
                                    for (var n = 0; n < window["arregloCuentas"+arregloMonedas[p]][i][j][k].length; n++) {
                                        if(window["arregloCuentas"+arregloMonedas[p]][i][j][k][n] != undefined) {
                                            for (var z = 0; z < window["arregloCuentas"+arregloMonedas[p]][i][j][k][n].length; z++) {
                                                if (window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].tipoProyeccion == proyecciones[i]) {
                                                    if(numeradoresSubVariables[0].includes(variablesSolas[i][j].variable))
                                                        window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].esNumerador = true;
                                                    else if(numeradoresSubVariablesConPadres[0].includes(variablesSolas[i][j].formula))
                                                        window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].esNumerador = true;
                                                    else
                                                        window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].esNumerador = false;
                                                    window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].numerador = totalesNumerador[i];
                                                    window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].denominador = totalesDenominador[i];
                                                }
                                            };
                                        }
                                    };
                                }
                            };
                        }
                    };
                }
            };
        };
        /*for (var i = 0; i < arregloCuentas.length; i++) {
            if(arregloCuentas[i] != undefined) {
                for (var j = 0; j < arregloCuentas[i].length; j++) {
                    if(arregloCuentas[i][j] != undefined) {
                        for (var k = 0; k < arregloCuentas[i][j].length; k++) {
                            if(arregloCuentas[i][j][k] != undefined) {
                                for (var n = 0; n < arregloCuentas[i][j][k].length; n++) {
                                    if(arregloCuentas[i][j][k][n] != undefined) {
                                        for (var z = 0; z < arregloCuentas[i][j][k][n].length; z++) {
                                            if (arregloCuentas[i][j][k][n][z].tipoProyeccion == proyecciones[i]) {
                                                if(numeradoresSubVariables[0].includes(variablesSolas[i][j].variable))
                                                    arregloCuentas[i][j][k][n][z].esNumerador = true;
                                                else if(numeradoresSubVariablesConPadres[0].includes(variablesSolas[i][j].formula))
                                                    arregloCuentas[i][j][k][n][z].esNumerador = true;
                                                else
                                                    arregloCuentas[i][j][k][n][z].esNumerador = false;
                                                arregloCuentas[i][j][k][n][z].numerador = totalesNumerador[i];
                                                arregloCuentas[i][j][k][n][z].denominador = totalesDenominador[i];
                                            }
                                        };
                                    }
                                };
                            }
                        };
                    }
                };
            }
        };*/

        //agregando volumen e influencia
        for (var p = 0; p < arregloMonedas.length; p++) {
            for (var i = 0; i < proyecciones.length; i++) {
                for (var j = 0; j < window["variablesSolas"+arregloMonedas[p]][i].length; j++) {
                    if(window["variablesSolas"+arregloMonedas[p]][i][j].varPadre.length == 0) {
                        if(!window["variablesSolas"+arregloMonedas[p]][i][j].esRCL) {
                            var res = getInfluenceAndVolumeVariablesSola (window["variablesSolas"+arregloMonedas[p]][i][j], equacionVariables);
                            if(!isNaN(res.volumen))
                                window["variablesSolas"+arregloMonedas[p]][i][j].volumenFormula = math.round(res.volumen, 2);
                            else
                                window["variablesSolas"+arregloMonedas[p]][i][j].volumenFormula = 0;
                            if(!isNaN(res.influencia))
                                window["variablesSolas"+arregloMonedas[p]][i][j].influenciaFormula = math.round(res.influencia, 2);
                            else
                                window["variablesSolas"+arregloMonedas[p]][i][j].influenciaFormula = 0;
                        }
                    } else {
                        var res = getInfluenceAndVolumeVariablesSola (window["variablesSolas"+arregloMonedas[p]][i][j], equacionSubVariablesConPadres);
                        if(!isNaN(res.volumen))
                            window["variablesSolas"+arregloMonedas[p]][i][j].volumenFormula = math.round(res.volumen, 2);
                        else
                            window["variablesSolas"+arregloMonedas[p]][i][j].volumenFormula = 0;
                        if(!isNaN(res.influencia))
                            window["variablesSolas"+arregloMonedas[p]][i][j].influenciaFormula = math.round(res.influencia, 2);
                        else
                            window["variablesSolas"+arregloMonedas[p]][i][j].influenciaFormula = 0;
                    }
                    for (var k = 0; k < window["subvariablesSolas"+arregloMonedas[p]][i][j].length; k++) {
                        var resSub = getInfluenceAndVolumeVariablesSola (window["subvariablesSolas"+arregloMonedas[p]][i][j][k], equacionSubVariables);
                        if(!isNaN(resSub.volumen))
                            window["subvariablesSolas"+arregloMonedas[p]][i][j][k].volumenFormula = math.round(resSub.volumen, 2);
                        else
                            window["subvariablesSolas"+arregloMonedas[p]][i][j][k].volumenFormula = 0;
                        if(!isNaN(resSub.influencia))
                            window["subvariablesSolas"+arregloMonedas[p]][i][j][k].influenciaFormula = math.round(resSub.influencia, 2);
                        else
                            window["subvariablesSolas"+arregloMonedas[p]][i][j][k].influenciaFormula = 0;
                        for (var n = 0; n < window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k].length; n++) {
                            var resSub = getInfluenceAndVolumeVariablesSola (window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n], equacionVarReglas);
                            if(!isNaN(resSub.volumen))
                                window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].volumenFormula = math.round(resSub.volumen, 2);
                            else
                                window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].volumenFormula = 0;
                            if(!isNaN(resSub.influencia))
                                window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].influenciaFormula = math.round(resSub.influencia, 2);
                            else
                                window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].influenciaFormula = 0;
                            for (var z = 0; z < window["arregloCuentas"+arregloMonedas[p]][i][j][k][n].length; z++) {
                                if(window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].varDeCuenta == undefined) {
                                    var resSub = getInfluenceAndVolumeCuenta (window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z], equacionVarCuentas);
                                    if(!isNaN(resSub.volumen))
                                        window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].volumenFormula = math.round(resSub.volumen, 2);
                                    else
                                        window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].volumenFormula = 0;
                                    if(!isNaN(resSub.influencia))
                                        window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].influenciaFormula = math.round(resSub.influencia, 2);
                                    else
                                        window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].influenciaFormula = 0;
                                }
                            };
                        };
                    };
                };
            };
        };
        /*for (var i = 0; i < proyecciones.length; i++) {
            for (var j = 0; j < variablesSolas[i].length; j++) {
                if(variablesSolas[i][j].varPadre.length == 0) {
                    var res = getInfluenceAndVolumeVariablesSola (variablesSolas[i][j], equacionVariables);
                    variablesSolas[i][j].volumenFormula = res.volumen;
                    variablesSolas[i][j].influenciaFormula = res.influencia;
                } else {
                    var res = getInfluenceAndVolumeVariablesSola (variablesSolas[i][j], equacionSubVariablesConPadres);
                    variablesSolas[i][j].volumenFormula = res.volumen;
                    variablesSolas[i][j].influenciaFormula = res.influencia;
                }
                for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                    var resSub = getInfluenceAndVolumeVariablesSola (subvariablesSolas[i][j][k], equacionSubVariables);
                    subvariablesSolas[i][j][k].volumenFormula = resSub.volumen;
                    subvariablesSolas[i][j][k].influenciaFormula = resSub.influencia;
                    for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                        var resSub = getInfluenceAndVolumeVariablesSola (variablesDeSubVariablesSolas[i][j][k][n], equacionVarReglas);
                        variablesDeSubVariablesSolas[i][j][k][n].volumenFormula = resSub.volumen;
                        variablesDeSubVariablesSolas[i][j][k][n].influenciaFormula = resSub.influencia;
                        for (var z = 0; z < arregloCuentas[i][j][k][n].length; z++) {
                            if(arregloCuentas[i][j][k][n][z].varDeCuenta == undefined) {
                                var resSub = getInfluenceAndVolumeCuenta (arregloCuentas[i][j][k][n][z], equacionVarCuentas);
                                arregloCuentas[i][j][k][n][z].volumenFormula = resSub.volumen;
                                arregloCuentas[i][j][k][n][z].influenciaFormula = resSub.influencia;
                            }
                        };
                    };
                };
            };
        };*/
        saveResults();
    } else if(!soloUnoNoTieneFormula) {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Más de una variable no tiene fórmula asociada. Solo la variable del Ratio del RCL no debe tener fórmula.",
            overlay: true,
            closeConfirm: true
        });
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Todas las variables tienen fórmula asociada. La variable del Ratio del RCL no debe tener fórmula.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function getVarForTotal(nombreVariable, proyeccion) {
    for (var i = 0; i < variablesSolas.length; i++) {
        for (var j = 0; j < variablesSolas[i].length; j++) {
            if(variablesSolas[i][j].variable.toLowerCase().localeCompare(nombreVariable.toLowerCase()) == 0 && proyeccion == variablesSolas[i][j].tipoProyeccion) {
                return variablesSolas[i][j];
            }
        };
    };
    return undefined;
}

function saveResults () {
    /*for (var p = 0; p < arregloMonedas.length; p++) {
        for (var i = 0; i < variablesSolas.length; i++) {
            for (var j = 0; j < variablesSolas[i].length; j++) {
                if(variablesSolas[i][j] != undefined)
                    checkIfResultExists(variablesSolas[i][j]);
                for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                    if(subvariablesSolas[i][j][k] != undefined)
                        checkIfResultExists(subvariablesSolas[i][j][k]);
                    for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                        if(variablesDeSubVariablesSolas[i][j][k][n] != undefined)
                            checkIfResultExists(variablesDeSubVariablesSolas[i][j][k][n]);
                        for (var z = 0; z < arregloCuentas[i][j][k][n].length; z++) {
                            if(arregloCuentas[i][j][k][n][z] != undefined)
                                checkIfResultExists(arregloCuentas[i][j][k][n][z]);
                        };
                    };
                };
            };
        };
    };*/
    $(".loadingScreen").hide();
    stopTimer();
    for (var p = 0; p < arregloMonedas.length; p++) {
        for (var i = 0; i < variablesSolas.length; i++) {
            for (var j = 0; j < variablesSolas[i].length; j++) {
                if(variablesSolas[i][j] != undefined) {
                    if( window["variablesSolas"+arregloMonedas[p]][i][j].numerador == undefined )
                        window["variablesSolas"+arregloMonedas[p]][i][j].numerador = 0;
                    if( window["variablesSolas"+arregloMonedas[p]][i][j].denominador == undefined )
                        window["variablesSolas"+arregloMonedas[p]][i][j].denominador = 0;
                    if( window["variablesSolas"+arregloMonedas[p]][i][j].volumenFormula == undefined )
                        window["variablesSolas"+arregloMonedas[p]][i][j].volumenFormula = 0;
                    if( window["variablesSolas"+arregloMonedas[p]][i][j].influenciaFormula == undefined )
                        window["variablesSolas"+arregloMonedas[p]][i][j].influenciaFormula = 0;
                    window["variablesSolas"+arregloMonedas[p]][i][j].total = math.round(window["variablesSolas"+arregloMonedas[p]][i][j].total, 2);
                    checkIfResultExists(window["variablesSolas"+arregloMonedas[p]][i][j]);
                    if(window["variablesSolas"+arregloMonedas[p]][i][j].esRCL) {
                        if(totalesRCL[p] == undefined)
                            totalesRCL[p] = [];
                        if(totalesRCLCorreos[p] == undefined)
                            totalesRCLCorreos[p] = [];
                        totalesRCL[p].push({proyeccion: proyecciones[i], total: window["variablesSolas"+arregloMonedas[p]][i][j].total*100});
                        totalesRCLCorreos[p].push({total: window["variablesSolas"+arregloMonedas[p]][i][j].total*100, ID: window["variablesSolas"+arregloMonedas[p]][i][j].ID, esVarPadre: true});
                    }
                }
                for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                    if( subvariablesSolas[i][j][k] != undefined  && (window["subvariablesSolas"+arregloMonedas[p]][i][j][k] != undefined && window["subvariablesSolas"+arregloMonedas[p]][i][j][k].numerador == undefined) )
                        window["subvariablesSolas"+arregloMonedas[p]][i][j][k].numerador = 0;
                    if( subvariablesSolas[i][j][k] != undefined  && (window["subvariablesSolas"+arregloMonedas[p]][i][j][k] != undefined && window["subvariablesSolas"+arregloMonedas[p]][i][j][k].denominador == undefined) )
                        window["subvariablesSolas"+arregloMonedas[p]][i][j][k].denominador = 0;
                    if( subvariablesSolas[i][j][k] != undefined  && (window["subvariablesSolas"+arregloMonedas[p]][i][j][k] != undefined && window["subvariablesSolas"+arregloMonedas[p]][i][j][k].volumenFormula == undefined) )
                        window["subvariablesSolas"+arregloMonedas[p]][i][j][k].volumenFormula = 0;
                    if( subvariablesSolas[i][j][k] != undefined  && (window["subvariablesSolas"+arregloMonedas[p]][i][j][k] != undefined && window["subvariablesSolas"+arregloMonedas[p]][i][j][k].influenciaFormula == undefined) )
                        window["subvariablesSolas"+arregloMonedas[p]][i][j][k].influenciaFormula = 0;
                    if( subvariablesSolas[i][j][k] != undefined) {
                        window["subvariablesSolas"+arregloMonedas[p]][i][j][k].total = math.round(window["subvariablesSolas"+arregloMonedas[p]][i][j][k].total, 2);
                        checkIfResultExists(window["subvariablesSolas"+arregloMonedas[p]][i][j][k]);
                        totalesRCLCorreos[p].push({total: window["subvariablesSolas"+arregloMonedas[p]][i][j][k].total*100, ID: window["subvariablesSolas"+arregloMonedas[p]][i][j][k].ID, esVarPadre: false});
                    }
                    for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                        if( variablesDeSubVariablesSolas[i][j][k][n] != undefined && (window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n] != undefined && window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].numerador == undefined) )
                            window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].numerador = 0;
                        if( variablesDeSubVariablesSolas[i][j][k][n] != undefined && (window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n] != undefined && window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].denominador == undefined) )
                            window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].denominador = 0;
                        if( variablesDeSubVariablesSolas[i][j][k][n] != undefined && (window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n] != undefined && window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].volumenFormula == undefined) )
                            window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].volumenFormula = 0;
                        if( variablesDeSubVariablesSolas[i][j][k][n] != undefined && (window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n] != undefined && window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].influenciaFormula == undefined) )
                            window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].influenciaFormula = 0;
                        if( variablesDeSubVariablesSolas[i][j][k][n] != undefined) {
                            window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].total = math.round(window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n].total, 2);
                            checkIfResultExists(window["variablesDeSubVariablesSolas"+arregloMonedas[p]][i][j][k][n]);
                        }
                        for (var z = 0; z < arregloCuentas[i][j][k][n].length; z++) {
                            if( arregloCuentas[i][j][k][n][z] != undefined && (window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z] != undefined && window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].numerador == undefined) )
                                window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].numerador = 0;
                            if( arregloCuentas[i][j][k][n][z] != undefined && (window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z] != undefined && window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].denominador == undefined) )
                                window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].denominador = 0;
                            if( arregloCuentas[i][j][k][n][z] != undefined && (window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z] != undefined && window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].volumenFormula == undefined) )
                                window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].volumenFormula = 0;
                            if( arregloCuentas[i][j][k][n][z] != undefined && (window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z] != undefined && window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].influenciaFormula == undefined) )
                                window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].influenciaFormula = 0;
                            if( arregloCuentas[i][j][k][n][z] != undefined) {
                                window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].total = math.round(window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z].total, 2);
                                checkIfResultExists(window["arregloCuentas"+arregloMonedas[p]][i][j][k][n][z]);
                            }
                        };
                    };
                };
            };
        };
    };
    $("body").overhang({
        type: "success",
        primary: "#40D47E",
        accent: "#27AE60",
        message: "Resultados guardados satisfactoriamente.",
        duration: 1,
        overlay: true
    });
    var content = '';
    var colores = ["aero", "green", "blue", "red"];
    for (var p = 0; p < arregloMonedas.length; p++) {
        content+= '<div style="border-style: solid; border-width: 2px;">';
        content+='<div id="wrapper">'+
                    '<h5>'+arregloMonedas[p]+'</h5>'+
                '</div>';
        for (var i = 0; i < totalesRCL[p].length; i++) {
            var color;
            if( totalesRCL[p][i].total > minimoRCL)
                color = 'green';
            else
                color = 'red';
            content+='<li class="media event">'+
                            '<a class="pull-left border-aero profile_thumb">'+
                              '<i class="fa fa-check '+color+'"></i>'+
                            '</a>'+
                            '<div class="media-body">'+
                              '<a class="title" href="#">Proyección: '+totalesRCL[p][i].proyeccion+'</a>'+
                              '<p><strong>'+totalesRCL[p][i].total+'</strong> % </p>'+
                              '</p>'+
                            '</div>'+
                        '</li>';
        };
        content+='</div><br/>';
    }
    $("#totalesRCL").empty();
    $("#totalesRCL").append(content);
    $("#modalTotalRCL").modal('toggle');
    sendEmails();
}

function checkIfResultExists (variable) {
    var fecha = new Date();
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from Totales where fecha = '"+formatDateCreation(new Date(variable.dia))+"' and tipoProyeccion = "+variable.tipoProyeccion+" and nombreVariable = '"+variable.variable+"'", (err, result) => {
            if (err) {
                console.log('err');
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en revision de existencia de Totales.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    if (result.recordset.length > 0) {
                        result.recordset[0].fecha = new Date(result.recordset[0].fecha.getUTCFullYear(), result.recordset[0].fecha.getUTCMonth(), result.recordset[0].fecha.getUTCDate());
                        deleteRCL(result.recordset[0], variable);
                    } else {
                        saveRCL(variable);
                    }
                });
            }
        });
    }); // fin transaction
}

function saveRCL (variable) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("insert into Totales (nombreVariable, fecha, tipoProyeccion, volumenFormula, influenciaFormula, numerador, denominador, moneda, sucursal, tipo, tablaAplicar, varPadre, esNumerador, esRCL, totalRCL, total) values ('"+variable.variable+"','"+formatDateCreation(new Date (variable.dia.getFullYear(), variable.dia.getMonth(), variable.dia.getDate()/*+diaRCL+1*/))+"',"+variable.tipoProyeccion+","+variable.volumenFormula+","+variable.influenciaFormula+","+variable.numerador+","+variable.denominador+",'"+variable.moneda+"','"+variable.sucursal+"','"+variable.tipo+"',"+variable.tablaAplicar+",'"+variable.varPadre+"','"+variable.esNumerador+"','"+variable.esRCL+"',"+variable.totalRCL+","+variable.total+")", (err, result) => {
            if (err) {
                console.log(err)
                if (!rolledBack) {
                    console.log(err)
                    console.log(variable)
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en inserción de Totales.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                });
            }
        });
    }); // fin transaction
}

function deleteRCL (oldVariable, newVariable) {
    let variable = newVariable;
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("delete from Totales where id = "+oldVariable.ID, (err, result) => {
            if (err) {
                console.log('err');
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en inserción de Totales.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    saveRCL(variable);
                });
            }
        });
    }); // fin transaction
}


function getNumeratorFraction(equacion) {
    var numeradores = [];
    var variable = '', esNumerador = true;
    for (var i = 0; i < equacion.length; i++) {
        var tempNumerador, inserto = false;
        variable+=equacion.charAt(i);
        if(equacion.charAt(i) == "(" && esNumerador) {
            tempNumerador = [equacion.slice(i+1, countPosFractioParenthes(equacion, i)+1)].join('');
            inserto = true;
        } else if(equacion.charAt(i) == "/") {
            esNumerador = false;
        } else if(equacion.charAt(i) == ")" && !esNumerador) {
            esNumerador = true;
        }
        if(inserto && esNumerador) {
            variable = '';
            numeradores.push(tempNumerador);
        } else if (i == equacion.length-1 && numeradores.length == 0) {
            numeradores.push(variable);
        }
    };
    return numeradores;
}

function countPosFractioParenthes (cadena, pos) {
    var contadorFrac = 0;
    for (var i = pos; i < cadena.length; i++) {
      if( cadena.charAt(i) == '(' )
        contadorFrac++;
      else if( cadena.charAt(i) == ')' )
        contadorFrac--;
      if(contadorFrac == 0)
        return i-1;
    }
    return i;
}

function getDenominatorFraction(equacion) {
    var denominadores = [];
    var variable = '', esDenominador = false, ultimoParentesis = 1000;
    for (var i = 0; i < equacion.length; i++) {
        var tempNumerador, inserto = false;
        variable+=equacion.charAt(i);
        if(equacion.charAt(i) == "(" && esDenominador) {
            tempNumerador = [equacion.slice(i+1, countPosFractioParenthes(equacion, i)+1)].join('');
            inserto = true;
            ultimoParentesis = countPosFractioParenthes(equacion, i);
        } else if(equacion.charAt(i) == "/") {
            esDenominador = true;
            ultimoParentesis = countPosFractioParenthes(equacion, i+1);
        } else if(i >= ultimoParentesis) {
            esDenominador = false;
        }
        if(inserto && esDenominador) {
            variable = '';
            denominadores.push(tempNumerador);
        }/* else if (i == equacion.length-1 && denominadores.length == 0) {
            denominadores.push(variable);
        }*/
    };
    return denominadores;
}

function getVariables (equacion) {
    var variable = [];
    for (var i = 0; i < equacion.length; i++) {
        if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
            equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
            equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-" && isNaN(equacion.charAt(i))) {
            var pal = getVariable(equacion, i);
            variable.push(pal);
            i+=pal.length;
        }
    };
    return variable;
}

//retorna si todas las variables de la formula ya fueron calculadas (se les ingreso valor)
function VarEnFormulaYaCalculadas (equacion, proyeccion) {
    var variables = [];
    for (var i = 0; i < equacion.length; i++) {
        if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
            equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
            equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-" && isNaN(equacion.charAt(i))) {
            var pal = getVariable(equacion, i);
            variables.push(pal);
            i+=pal.length-1;
        }
    };
    var contador = 0;
    for (var i = 0; i < proyecciones.length; i++) {
        for (var n = 0; n < variables.length; n++) {
            OuterLoop:
            for (var j = 0; j < variablesSolas[i].length; j++) {
                for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                    if( variables[n].toLowerCase().localeCompare(subvariablesSolas[i][j][k].variable.toLowerCase()) == 0 && subvariablesSolas[i][j][k].calculada == true && subvariablesSolas[i][j][k].tipoProyeccion == proyeccion ) {
                        contador++;
                        break OuterLoop;
                    }
                };
                if( variables[n].toLowerCase().localeCompare(variablesSolas[i][j].variable.toLowerCase()) == 0 && variablesSolas[i][j].calculada == true && variablesSolas[i][j].tipoProyeccion == proyeccion ) {
                    contador++;
                    break OuterLoop;
                }
            };
        };
    };
    if(contador == variables.length) {
        return true;
    } else {
        return false;
    }
}

function VarEnFormulaYaCalculadasMoneda (equacion, proyeccion, moneda) {
    var variables = [];
    for (var i = 0; i < equacion.length; i++) {
        if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
            equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
            equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-" && isNaN(equacion.charAt(i))) {
            var pal = getVariable(equacion, i);
            variables.push(pal);
            i+=pal.length-1;
        }
    };
    var contador = 0;
    for (var i = 0; i < proyecciones.length; i++) {
        for (var n = 0; n < variables.length; n++) {
            OuterLoop:
            for (var j = 0; j < window["variablesSolas"+moneda][i].length; j++) {
                for (var k = 0; k < window["subvariablesSolas"+moneda][i][j].length; k++) {
                    if( variables[n].toLowerCase().localeCompare(window["subvariablesSolas"+moneda][i][j][k].variable.toLowerCase()) == 0 && window["subvariablesSolas"+moneda][i][j][k].calculada == true && window["subvariablesSolas"+moneda][i][j][k].tipoProyeccion == proyeccion ) {
                        contador++;
                        break OuterLoop;
                    }
                };
                if( variables[n].toLowerCase().localeCompare(window["variablesSolas"+moneda][i][j].variable.toLowerCase()) == 0 && window["variablesSolas"+moneda][i][j].calculada == true && window["variablesSolas"+moneda][i][j].tipoProyeccion == proyeccion ) {
                    contador++;
                    break OuterLoop;
                }
            };
        };
    };
    if(contador == variables.length) {
        return true;
    } else {
        return false;
    }
}

function customReplace (charToLook, charToReplace, string) {
    var retornoString = string;
    for (var i = 0; i < string.length; i++) {
        if(retornoString.charAt(i).localeCompare(charToLook) == 0) {
            retornoString = retornoString.substring(0, i) + charToReplace + retornoString.substring(i+1);
        }
    };
    return retornoString;
}

function getInfluenceAndVolumeVariablesSola (variable, ecuacionResuelta) {
    var total = {volumen: 0, influencia: 0};
    /*console.log("variable = "+variable.variable)
    console.log(ecuacionResuelta)
    console.log("+++++++++++")*/
    /*for (var z = 0; z < ecuacionResuelta.length; z++) {
        if( ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" && isNaN(ecuacionResuelta.charAt(z)) ) {
            var pal = getVariable(ecuacionResuelta, z);
            if(variable.variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                total.volumen+=variable.total;
                if( ecuacionResuelta.charAt(z-1).localeCompare("-") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("+") == 0 ||
                    ecuacionResuelta.charAt(z-1).localeCompare("/") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("*") == 0 &&
                    total.influencia > 0) {
                    total.influencia = math.eval(total.influencia + ecuacionResuelta.charAt(z-1) + variable.total);
                }
                if( ecuacionResuelta.charAt(z-1).localeCompare("-") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("+") == 0 ||
                    ecuacionResuelta.charAt(z-1).localeCompare("/") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("*") == 0 &&
                    total.influencia == 0) {
                    total.influencia = variable.total;
                }
                //para tomar la primera variable de una division
                if( ecuacionResuelta.charAt(z-1).localeCompare("(") == 0 ) {
                    total.influencia += variable.total;
                } else if(z == 0) { //para tomar la primera variable de una NO division
                    total.influencia += variable.total;
                }
                z += variable.total.toString().length-1;
            } else {
                z += pal.length-1;
            }
        }
    };*/
    var ecuacion = '';
    var ecuacion1 = '';
    for (var z = 0; z < ecuacionResuelta.length; z++) {
        if( ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" ) {
            var pal = getVariable(ecuacionResuelta, z);
            if(variable.variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                if(ecuacion.length == 0) {
                    ecuacion+=variable.total;
                    ecuacion1+=variable.variable;
                } else {
                    var signo = '';
                    if(ecuacionResuelta.charAt(z-1).localeCompare("-") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("+") == 0 ||
                        ecuacionResuelta.charAt(z-1).localeCompare("/") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("*") == 0)
                        signo = ecuacionResuelta.charAt(z-1);
                    ecuacion+=signo+variable.total;
                    ecuacion1+=signo+variable.variable;
                }
            } else {
                z += pal.length-1;
            }
        }
    };
    total.volumen = variable.total;
    total.influencia = math.eval(ecuacion);
    /*console.log(ecuacion);
    console.log(ecuacion1);
    console.log(total);*/
    return total;
}

function getInfluenceAndVolumeCuenta (variable, ecuacionResuelta) {
    var total = {volumen: 0, influencia: 0};
    /*console.log("variable = "+variable.variable)
    console.log(ecuacionResuelta)
    console.log("+++++++++++")*/
    /*for (var z = 0; z < ecuacionResuelta.length; z++) {
        if( ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" ) {
            var pal = getVariable(ecuacionResuelta, z);
            if(variable.variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                var yaEntro = false;
                //porque el total de la cuenta ya trae el volumen
                total.volumen = variable.total;
                //console.log(variable)
                if( (ecuacionResuelta.charAt(z-1).localeCompare("-") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("+") == 0 ||
                    ecuacionResuelta.charAt(z-1).localeCompare("/") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("*") == 0) &&
                    total.influencia > 0) {
                    //console.log('1')
                    //console.log(total.influencia + ecuacionResuelta.charAt(z-1) + variable.precioUnidad)
                    total.influencia = math.eval(total.influencia + ecuacionResuelta.charAt(z-1) + variable.precioUnidad);
                    yaEntro = true;
                }
                if( (ecuacionResuelta.charAt(z-1).localeCompare("-") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("+") == 0 ||
                    ecuacionResuelta.charAt(z-1).localeCompare("/") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("*") == 0) &&
                    total.influencia == 0 && !yaEntro) {
                    //console.log('2')
                    //console.log(variable.precioUnidad)
                    total.influencia = variable.precioUnidad;
                }
                if( ecuacionResuelta.charAt(z-1).localeCompare("(") == 0 ) {
                    //console.log('3')
                    //console.log(variable.precioUnidad)
                    total.influencia += variable.precioUnidad;
                }
                z += variable.precioUnidad.toString().length-1;
            } else {
                z += pal.length-1;
            }
        }
    };*/
    var ecuacion = '';
    var ecuacion1 = '';
    for (var z = 0; z < ecuacionResuelta.length; z++) {
        if( ecuacionResuelta.charAt(z) != "(" && ecuacionResuelta.charAt(z) != ")" && ecuacionResuelta.charAt(z) != "<" && ecuacionResuelta.charAt(z) != ">" && 
            ecuacionResuelta.charAt(z) != "!" && ecuacionResuelta.charAt(z) != "=" && ecuacionResuelta.charAt(z) != "/" && ecuacionResuelta.charAt(z) != "*" && 
            ecuacionResuelta.charAt(z) != "√" && ecuacionResuelta.charAt(z) != "+" && ecuacionResuelta.charAt(z) != "-" ) {
            var pal = getVariable(ecuacionResuelta, z);
            if(variable.variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                if(ecuacion.length == 0) {
                    ecuacion+=variable.variable;
                    ecuacion1+=variable.precioUnidad;
                } else {
                    var signo = '';
                    if(ecuacionResuelta.charAt(z-1).localeCompare("-") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("+") == 0 ||
                        ecuacionResuelta.charAt(z-1).localeCompare("/") == 0 || ecuacionResuelta.charAt(z-1).localeCompare("*") == 0)
                        signo = ecuacionResuelta.charAt(z-1);
                    ecuacion+=signo+variable.variable;
                    ecuacion1+=signo+variable.precioUnidad;
                }
            } else {
                z += pal.length-1;
            }
        }
    };
    total.volumen = variable.total;
    total.influencia = math.eval(ecuacion1);
    /*console.log(ecuacion);
    console.log(ecuacion1);
    console.log(total);*/
    return total;
}

/*function getVariable (equacion, index) {
    var variable = '';
    for (var i = index; i < equacion.length; i++) {
        if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
            equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
            equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-" && isNaN(equacion.charAt(i)))
            variable+=equacion[i];
        else
            return variable;
    };
    return variable;
}*/


function getMontoFOSEDE (moneda) {
    for (var i = 0; i < montoFosedeGlobal.length; i++) {
        if(montoFosedeGlobal[i].moneda.toLowerCase().localeCompare(moneda.toLowerCase()) == 0)
            return montoFosedeGlobal[i].montoFosede;
    };
    return 0;
}

function conCuentasHastaFOSEDE (idCliente) {
    var sumaCuentas = 0, tieneCuenta = false, cuentas = [];
    for (var i = 0; i < arreglodeCuenOpClientes.length; i++) {
        if(idCliente.localeCompare(arreglodeCuenOpClientes[i].valor) == 0) {
            if(!tieneCuenta)
                tieneCuenta = true;
            cuentas.push(arreglodeCuenOpClientes[i].valor);
        }
    };
    if(tieneCuenta) {
        for (var i = 0; i < cuentas.length; i++) {
            for (var j = 0; j < arregloDepositos.length; j++) {
                if( parseInt(cuentas[i]) == arregloDepositos[j].numCuenta) {
                    sumaCuentas+=arregloDepositos[j].saldo;
                }
            };
        };
    }
    if(sumaCuentas == 0)
        return -1;
    return sumaCuentas;
}

function conCuentasMayorFOSEDE (idCliente) {
    var sumaCuentas = 0, tieneCuenta = false, cuentas = [];
    for (var i = 0; i < arreglodeCuenOpClientes.length; i++) {
        if(idCliente.localeCompare(arreglodeCuenOpClientes[i].valor) == 0) {
            if(!tieneCuenta)
                tieneCuenta = true;
            cuentas.push(arreglodeCuenOpClientes[i].valor);
        }
    };
    if(tieneCuenta) {
        for (var i = 0; i < cuentas.length; i++) {
            for (var j = 0; j < arregloDepositos.length; j++) {
                if( parseInt(cuentas[i]) == arregloDepositos[j].numCuenta) {
                    sumaCuentas+=arregloDepositos[j].saldo;
                }
            };
        };
    }
    if(sumaCuentas == 0)
        return -1;
    return sumaCuentas;
}

function sinCuentasHastaFOSEDE () {
    var sumaCuentas = 0, cuentas = [];
    for (var i = 0; i < arreglodeCuenOpClientes.length; i++) {
        if(idCliente.localeCompare(arreglodeCuenOpClientes[i].puesto) == 0) {
            cuentas.push(arreglodeCuenOpClientes[i].valor);
        }
    };
    for (var i = 0; i < cuentas.length; i++) {
        for (var j = 0; j < arregloDepositos.length; j++) {
            if( idCliente.localeCompare(arregloDepositos[j].idCliente) == 0 && parseInt(cuentas[i]) != arregloDepositos[j].numCuenta) {
                sumaCuentas+=arregloDepositos[j].saldo;
            }
        };
    };
    if(sumaCuentas == 0)
        return -1;
    return sumaCuentas;
}

function sinCuentasMayorFOSEDE (idCliente) {
    var sumaCuentas = 0, cuentas = [];
    for (var i = 0; i < arreglodeCuenOpClientes.length; i++) {
        if(idCliente.localeCompare(arreglodeCuenOpClientes[i].puesto) == 0) {
            cuentas.push(arreglodeCuenOpClientes[i].valor);
        }
    };
    for (var i = 0; i < cuentas.length; i++) {
        for (var j = 0; j < arregloDepositos.length; j++) {
            if( idCliente.localeCompare(arregloDepositos[j].idCliente) == 0 && parseInt(cuentas[i]) != arregloDepositos[j].numCuenta) {
                sumaCuentas+=arregloDepositos[j].saldo;
            }
        };
    };
    if(sumaCuentas == 0)
        return -1;
    return sumaCuentas;
}

function campoObjetivoDepositos (regla, arreglo, tabs, variable, proyeccion) {
    var esCondicion = false, noAgregarFactor = false, noAgregarFecha = false;
    if(regla.operacion=="-" || regla.operacion=="+" || regla.operacion=="*" || regla.operacion=="/" || regla.operacion=="=")
        esCondicion = false;
    else
        esCondicion = true;
    var hasVariables = false;
    var textVariables = [];
    if(regla.variables.length > 0)
        hasVariables = true;
    var tabsText = '';
    for (var i = 0; i < tabs; i++) {
        tabsText+='\t';
    };
    var posicionesIF = [];
    var idFiltro = '';
    if(regla.filtro != -1)
        idFiltro = regla.filtro;
    if(regla.campoObjetivo.indexOf('COLUMNA') == 0) {
        if(esCondicion) {
            if(!regla.campoObjetivo.includes('plazoResidual')) {
                var campo = regla.campoObjetivo.split("=")[1];

                // Agregando campo Operacion
                if(regla.operacion=="en" || regla.operacion=="no")
                    arreglo.push({codigo: tabsText+"if ( arregloDepositos"+idFiltro+"[i]."+campo+".localeCompare('", filtro: regla.filtro});
                else
                    arreglo.push({codigo: tabsText+"if ( arregloDepositos"+idFiltro+"[i]."+campo+" "+regla.operacion, filtro: regla.filtro});
                //posicionesIF.push(arreglo.length-1);
                posicionesIF.push(arreglo.length);
            } else {
                noAgregarFecha = true;
                var campo = regla.campoObjetivo.split("=")[1];

                arreglo.push({codigo: tabsText+"var nuevaFecha"+regla.ID+" = new Date();\n", filtro: regla.filtro});
                arreglo.push({codigo: tabsText+"nuevaFecha"+regla.ID+" = addDays(nuevaFecha"+regla.ID+","+proyeccion+");\n", filtro: regla.filtro});
                var query, agregarComparator, agregarIsSame;
                if(regla.operacion.includes("<")) {
                    query = 'isBefore';
                } else {
                    query = 'isAfter';
                }
                if(!regla.operacion.includes("!") && !regla.operacion.includes("==")) {
                    agregarComparator = "moment(arregloDepositos"+idFiltro+"[i].fechaFinal)."+query+"(moment(nuevaFecha"+regla.ID+"), 'day')";
                } else if(regla.operacion.includes("==")) {
                    agregarComparator = "moment(arregloDepositos"+idFiltro+"[i].fechaFinal).isSame(moment(nuevaFecha"+regla.ID+"), 'day')";
                } else {
                    agregarComparator = "!moment(arregloDepositos"+idFiltro+"[i].fechaFinal).isSame(moment(nuevaFecha"+regla.ID+"), 'day')";
                }
                if(regla.operacion.includes("=") && (regla.operacion.includes("<") || regla.operacion.includes(">")) ) {
                    agregarIsSame = " || moment(arregloDepositos"+idFiltro+"[i].fechaFinal).isSame(moment(nuevaFecha"+regla.ID+"), 'day')";
                } else {
                    agregarIsSame = "";
                }
                // Agregando campo Operacion
                arreglo.push({codigo: tabsText+"if ( (arregloDepositos"+idFiltro+"[i].fechaFinal == undefined || arregloDepositos"+idFiltro+"[i].fechaFinal.toString().length == 0) || moment(arregloDepositos"+idFiltro+"[i].fechaFinal).isSame(moment('2001-01-01'), 'day') || "+agregarComparator+" "+agregarIsSame+" ) {", filtro: regla.filtro});
                //posicionesIF.push(arreglo.length-1);
                posicionesIF.push(arreglo.length);
            }
        } else {
            var campo = regla.campoObjetivo.split("=")[1];

            // Agregando campo Operacion
            arreglo.push({codigo: tabsText+"var totalDeposito = arregloDepositos"+idFiltro+"[i].saldo;", filtro: regla.filtro});
            arreglo.push({codigo: "\n"+tabsText+variable+proyeccion+" += totalDeposito "+regla.operacion, filtro: regla.filtro});
        }
    } else if(regla.campoObjetivo.indexOf('hastaFOSEDE') == 0) {
        noAgregarFactor = true;
        arreglo.push({codigo: tabsText+"var totalDeposito;", filtro: regla.filtro});
        arreglo.push({codigo: "\n"+tabsText+"var montoFosede = getMontoFOSEDE(arregloDepositos"+idFiltro+"[i].moneda);", filtro: regla.filtro});
        arreglo.push({codigo: "\n"+tabsText+"if ( arregloDepositos"+idFiltro+"[i].saldo > montoFosede )", filtro: regla.filtro});
        arreglo.push({codigo: "\n\t"+tabsText+"totalDeposito = montoFosede;", filtro: regla.filtro});
        arreglo.push({codigo: "\n"+tabsText+"else", filtro: regla.filtro});
        arreglo.push({codigo: "\n\t"+tabsText+"totalDeposito = arregloDepositos"+idFiltro+"[i].saldo;", filtro: regla.filtro});
        var factorValor = getFactor(regla.variablePadre);
        arreglo.push({codigo: "\n"+tabsText+variable+proyeccion+" += totalDeposito * "+(factorValor)+";", filtro: regla.filtro});
    } else if(regla.campoObjetivo.indexOf('mayorFOSEDE') == 0) {
        noAgregarFactor = true;
        arreglo.push({codigo: tabsText+"var montoFosede = getMontoFOSEDE(arregloDepositos"+idFiltro+"[i].moneda);", filtro: regla.filtro});
        arreglo.push({codigo: "\n"+tabsText+"if ( arregloDepositos"+idFiltro+"[i].saldo > montoFosede ) {", filtro: regla.filtro});
        arreglo.push({codigo: "\n"+tabsText+"\tvar totalDeposito = arregloDepositos"+idFiltro+"[i].saldo - montoFosede;", filtro: regla.filtro});
        var factorValor = getFactor(regla.variablePadre);
        arreglo.push({codigo: "\n\t"+tabsText+(variable+proyeccion)+" += totalDeposito * "+(factorValor)+";", filtro: regla.filtro});
        arreglo.push({codigo: "\n"+tabsText+"}", filtro: regla.filtro});
    } else if(regla.campoObjetivo.indexOf('CONCUENTAS') == 0) {
        noAgregarFactor = true;
        if(regla.campoObjetivo.split("=")[1].localeCompare('hastaFOSEDE') == 0) {
            arreglo.push({codigo: tabsText+"var totalDeposito = conCuentasHastaFOSEDE(arregloDepositos"+idFiltro+"[i].idCliente);\n", filtro: regla.filtro});
            arreglo.push({codigo: "\n"+tabsText+"var montoFosede = getMontoFOSEDE(arregloDepositos"+idFiltro+"[i].moneda);", filtro: regla.filtro});
            arreglo.push({codigo: tabsText+"if ( arregloDepositos"+idFiltro+"[i].saldo > montoFosede && totalDeposito != -1 ) {\n", filtro: regla.filtro});
            arreglo.push({codigo: tabsText+"\tif ( totalDeposito > montoFosede)", filtro: regla.filtro});
            arreglo.push({codigo: "\n\t\t"+tabsText+"totalDeposito = montoFosede;", filtro: regla.filtro});
            var factorValor = getFactor(regla.variablePadre);
            arreglo.push({codigo: "\n\t"+tabsText+(variable+proyeccion)+" += totalDeposito * "+(factorValor)+";", filtro: regla.filtro});
            arreglo.push({codigo: "\n"+tabsText+"}", filtro: regla.filtro});
        } else if(regla.campoObjetivo.split("=")[1].localeCompare('mayorFOSEDE') == 0) {
            arreglo.push({codigo: tabsText+"var totalDeposito = conCuentasMayorFOSEDE(arregloDepositos"+idFiltro+"[i].idCliente);\n", filtro: regla.filtro});
            arreglo.push({codigo: "\n"+tabsText+"var montoFosede = getMontoFOSEDE(arregloDepositos"+idFiltro+"[i].moneda);", filtro: regla.filtro});
            arreglo.push({codigo: tabsText+"if ( arregloDepositos"+idFiltro+"[i].saldo > montoFosede && totalDeposito != -1 ) {\n", filtro: regla.filtro});
            arreglo.push({codigo: tabsText+"\tif ( totalDeposito > montoFosede) {", filtro: regla.filtro});
            arreglo.push({codigo: "\n\t\t"+tabsText+"totalDeposito = totalDeposito - montoFosede;", filtro: regla.filtro});
            var factorValor = getFactor(regla.variablePadre);
            arreglo.push({codigo: "\n\t\t"+tabsText+(variable+proyeccion)+" += totalDeposito * "+(factorValor)+";", filtro: regla.filtro});
            arreglo.push({codigo: "\n\t"+tabsText+"}", filtro: regla.filtro});
            arreglo.push({codigo: "\n"+tabsText+"}", filtro: regla.filtro});
        }
    } else if(regla.campoObjetivo.indexOf('SINCUENTAS') == 0) {
        noAgregarFactor = true;
        if(regla.campoObjetivo.split("=")[1].localeCompare('hastaFOSEDE') == 0) {
            arreglo.push({codigo: tabsText+"var totalDeposito = sinCuentasHastaFOSEDE(arregloDepositos"+idFiltro+"[i].idCliente);\n", filtro: regla.filtro});
            arreglo.push({codigo: "\n"+tabsText+"var montoFosede = getMontoFOSEDE(arregloDepositos"+idFiltro+"[i].moneda);", filtro: regla.filtro});
            arreglo.push({codigo: tabsText+"if ( arregloDepositos"+idFiltro+"[i].saldo > montoFosede && totalDeposito != -1 ) {\n", filtro: regla.filtro});
            arreglo.push({codigo: tabsText+"\tif ( totalDeposito > montoFosede)", filtro: regla.filtro});
            arreglo.push({codigo: "\n\t\t"+tabsText+"totalDeposito = montoFosede;", filtro: regla.filtro});
            var factorValor = getFactor(regla.variablePadre);
            arreglo.push({codigo: "\n\t"+tabsText+(variable+proyeccion)+" += totalDeposito * "+(factorValor)+";", filtro: regla.filtro});
            arreglo.push({codigo: "\n"+tabsText+"}", filtro: regla.filtro});
        } else if(regla.campoObjetivo.split("=")[1].localeCompare('mayorFOSEDE') == 0) {
            arreglo.push({codigo: tabsText+"var totalDeposito = sinCuentasMayorFOSEDE(arregloDepositos"+idFiltro+"[i].idCliente);\n", filtro: regla.filtro});
            arreglo.push({codigo: "\n"+tabsText+"var montoFosede = getMontoFOSEDE(arregloDepositos"+idFiltro+"[i].moneda);", filtro: regla.filtro});
            arreglo.push({codigo: tabsText+"if ( arregloDepositos"+idFiltro+"[i].saldo > montoFosede && totalDeposito != -1 ) {\n", filtro: regla.filtro});
            arreglo.push({codigo: tabsText+"\tif ( totalDeposito > montoFosede) {", filtro: regla.filtro});
            arreglo.push({codigo: "\n\t\t"+tabsText+"totalDeposito = totalDeposito - montoFosede;", filtro: regla.filtro});
            var factorValor = getFactor(regla.variablePadre);
            arreglo.push({codigo: "\n\t\t"+tabsText+(variable+proyeccion)+" += totalDeposito * "+(factorValor)+";", filtro: regla.filtro});
            arreglo.push({codigo: "\n\t"+tabsText+"}", filtro: regla.filtro});
            arreglo.push({codigo: "\n"+tabsText+"}", filtro: regla.filtro});
        }
    }

    if(regla.valor.indexOf('LISTA') == 0) {
        if(esCondicion) {
            var arregloLista = regla.valor.split("=")[1].split(",");
            var copiaRegla = $.extend(true,{},arreglo);
            var tamArreglo = arreglo.length;
            if(regla.operacion == "no") {
                for (var j = 0; j < tamArreglo; j++) {
                    for (var i = 0; i < arregloLista.length; i++) {
                        if(i==0) {
                            var textoFinal = ' != 0 ';
                            if(i+1 == arregloLista.length)
                                textoFinal += " ) {";
                            var campo = regla.campoObjetivo.split("=")[1];
                            var valor = getListValue(arregloLista[i], campo);
                            arreglo[j].codigo +=valor + "')" + textoFinal;
                        } else {
                            var textoFinal = ' != 0 ';
                            if(i+1 == arregloLista.length)
                                textoFinal += " ) {";
                            var campo = regla.campoObjetivo.split("=")[1];
                            var valor = getListValue(arregloLista[i], campo);
                            arreglo[j].codigo += " && "+copiaRegla[j].codigo.split(" ( ")[1]+valor+"')"+textoFinal;
                        }
                    }
                };
            } else {
                for (var j = 0; j < tamArreglo; j++) {
                    for (var i = 0; i < arregloLista.length; i++) {
                        if(i==0) {
                            var textoFinal = ' == 0 ';
                            if(i+1 == arregloLista.length)
                                textoFinal += " ) {";
                            var campo = regla.campoObjetivo.split("=")[1];
                            var valor = getListValue(arregloLista[i], campo);
                            arreglo[j].codigo +=valor + "')" + textoFinal;
                        } else {
                            var textoFinal = ' == 0 ';
                            if(i+1 == arregloLista.length)
                                textoFinal += " ) {";
                            var campo = regla.campoObjetivo.split("=")[1];
                            var valor = getListValue(arregloLista[i], campo);
                            arreglo[j].codigo += " || "+copiaRegla[j].codigo.split(" ( ")[1]+valor+"')"+textoFinal;
                        }
                    }
                };
            }
        }
    } else if(regla.valor.indexOf('FACTOR') == 0 && !noAgregarFactor) {
        if(esCondicion) {
            //var factorValor = parseInt(regla.valor.split("=")[1]);
            var factorValor = getFactor(regla.variablePadre);
            for (var i = 1; i < arreglo.length; i++) {
                arreglo[i].codigo += " "+factorValor + " ) {";
            };
        } else {
            //var factorValor = regla.valor.split("=")[1];
            var factorValor = getFactor(regla.variablePadre);
            for (var i = 1; i < arreglo.length; i++) {
                arreglo[i].codigo += " "+factorValor + ";";
            };
        }
    } else if(regla.valor.indexOf('COLUMNA') == 0) {
        if(esCondicion) {
            var columnaValor = regla.valor.split("=")[1];
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i].codigo += " "+columnaValor + " ) {";
            };
        } else {
            var columnaValor = regla.valor.split("=")[1];
            arreglo[arreglo.length-1].codigo += " "+columnaValor + ";";
            /*for (var i = 0; i < arreglo.length; i++) {
                arreglo[i] += " "+columnaValor + ";";
            };*/
        }
    } else if(regla.valor.indexOf('FECHA') == 0 && !noAgregarFecha) {
        if(esCondicion) {
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i].codigo += " "+proyeccion+" ) {";
            };
        } else {
            var columnaValor = regla.valor.split("=")[1];
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i].codigo += " "+proyeccion+";";
            };
        }
    }

    var cuerpo = arregloReglas.filter(function( object ) {
        return object.reglaPadre == regla.ID;
    });
    if(cuerpo.length > 0) {
        var arregloCuerpo = [];
        for (var i = 0; i < cuerpo.length; i++) {
            var cuantasTabs = tabs;
            if(esCondicion)
                cuantasTabs++;
            var retorno = campoObjetivoDepositos(cuerpo[i], [], cuantasTabs, variable, proyeccion);
            retorno[0].codigo = "\n"+retorno[0].codigo;
            $.merge( arregloCuerpo, retorno );
        };
        for (var i = 0; i < posicionesIF.length; i++) {
            arreglo.splice(posicionesIF[i], 0, ...arregloCuerpo);
            if(esCondicion)
                arreglo.splice(posicionesIF[i]+arregloCuerpo.length, 0, {codigo: "\n"+tabsText+"}", filtro: regla.filtro});
            for (var j = i; j < posicionesIF.length; j++) {
                posicionesIF[j]+=arregloCuerpo.length;
            };
        };
        if(posicionesIF.length == 0)
            $.merge( arreglo, arregloCuerpo );
        return arreglo;
    } else {
        if(esCondicion){
            for (var i = 0; i < posicionesIF.length; i++) {
                arreglo.splice(posicionesIF[i], 0, {codigo: "\n"+tabsText+"}", filtro: regla.filtro})
            };
        }
        return arreglo;
    }
}

function campoObjetivoPrestamos (regla, arreglo, tabs, variable, proyeccion) {
    /*try {*/
        var esCondicion = false, noAgregarFactor = false, noAgregarFecha = false, noAgregarBoolean = false;
        if(regla.operacion=="-" || regla.operacion=="+" || regla.operacion=="*" || regla.operacion=="/" || regla.operacion=="=")
            esCondicion = false;
        else
            esCondicion = true;
        var hasVariables = false;
        var textVariables = [];
        if(regla.variables.length > 0)
            hasVariables = true;
        var tabsText = '';
        for (var i = 0; i < tabs; i++) {
            tabsText+='\t';
        };
        var posicionesIF = [];
        var idFiltro = '';
        if(regla.filtro != -1)
            idFiltro = regla.filtro;
        if(regla.campoObjetivo.indexOf('COLUMNA') == 0) {
            if(regla.campoObjetivo.split("=")[1].indexOf("valorFinanciacion") != 0 && regla.campoObjetivo.split("=")[1].indexOf("utilizable") != 0 && regla.campoObjetivo.split("=")[1].indexOf("vencimiento") != 0 && regla.campoObjetivo.split("=")[1].indexOf("alac") != 0 && regla.campoObjetivo.split("=")[1].indexOf("fechaFinal") != 0) {
                if(esCondicion) {
                    var campo = regla.campoObjetivo.split("=")[1];

                    // Agregando campo Operacion
                    if(regla.operacion=="en" || regla.operacion=="no")
                        arreglo.push({codigo: tabsText+"if ( arregloPrestamos"+idFiltro+"[i]."+campo+".localeCompare('", filtro: regla.filtro});
                    else
                        arreglo.push({codigo: tabsText+"if ( arregloPrestamos"+idFiltro+"[i]."+campo+" "+regla.operacion, filtro: regla.filtro});
                    //posicionesIF.push(arreglo.length-1);
                    posicionesIF.push(arreglo.length);
                } else {
                    var campo = regla.campoObjetivo.split("=")[1];

                    // Agregando campo Operacion
                    if(regla.campoObjetivo.split("=")[1].indexOf("pago") == 0)
                        arreglo.push({codigo: tabsText+"var totalPrestamo = arregloPrestamos"+idFiltro+"[i].pago"+proyeccion+";", filtro: regla.filtro});
                    else
                        arreglo.push({codigo: tabsText+"var totalPrestamo = arregloPrestamos"+idFiltro+"[i].saldo;", filtro: regla.filtro});
                    arreglo.push({codigo: "\n"+tabsText+(variable+proyeccion)+" += totalPrestamo "+regla.operacion, filtro: regla.filtro});
                }
            } else if(regla.campoObjetivo.split("=")[1].indexOf("utilizable") == 0) {
                noAgregarFecha = true;
                var campo = regla.campoObjetivo.split("=")[1];

                arreglo.push({codigo: tabsText+"var nuevaFecha"+regla.ID+" = new Date();\n", filtro: regla.filtro});
                arreglo.push({codigo: tabsText+"nuevaFecha"+regla.ID+" = addDays(nuevaFecha"+regla.ID+","+proyeccion+");\n", filtro: regla.filtro});
                var query, agregarComparator, agregarIsSame;
                if(regla.operacion.includes("<")) {
                    query = 'isBefore';
                } else {
                    query = 'isAfter';
                }
                if(!regla.operacion.includes("!") && !regla.operacion.includes("==")) {
                    agregarComparator = "moment(nuevaFecha"+regla.ID+")."+query+"(moment(arregloPrestamos"+idFiltro+"[i].fechaFinal), 'day')";
                } else if(regla.operacion.includes("==")) {
                    agregarComparator = "moment(nuevaFecha"+regla.ID+").isSame(moment(arregloPrestamos"+idFiltro+"[i].fechaFinal), 'day')";
                } else {
                    agregarComparator = "!moment(nuevaFecha"+regla.ID+").isSame(moment(arregloPrestamos"+idFiltro+"[i].fechaFinal), 'day')";
                }
                if(regla.operacion.includes("=") && (regla.operacion.includes("<") || regla.operacion.includes(">")) ) {
                    agregarIsSame = " || moment(nuevaFecha"+regla.ID+").isSame(moment(arregloPrestamos"+idFiltro+"[i].fechaFinal), 'day')";
                } else {
                    agregarIsSame = "";
                }
                // Agregando campo Operacion
                arreglo.push({codigo: tabsText+"if ( arregloPrestamos"+idFiltro+"[i].fechaFinal == undefined || arregloPrestamos"+idFiltro+"[i].fechaFinal.toString().length == 0 || moment(arregloPrestamos"+idFiltro+"[i].fechaFinal).isSame(moment('2001-01-01'), 'day') || "+agregarComparator+" "+agregarIsSame+" ) {", filtro: regla.filtro});
                //posicionesIF.push(arreglo.length-1);
                posicionesIF.push(arreglo.length);
            } else if(regla.campoObjetivo.split("=")[1].indexOf("vencimiento") == 0) {
                noAgregarFecha = true;
                var campo = regla.campoObjetivo.split("=")[1];

                arreglo.push({codigo: tabsText+"var nuevaFecha"+regla.ID+" = new Date();\n", filtro: regla.filtro});
                arreglo.push({codigo: tabsText+"nuevaFecha"+regla.ID+" = addDays(nuevaFecha"+regla.ID+","+proyeccion+");\n", filtro: regla.filtro});
                var query, agregarComparator, agregarIsSame;
                if(regla.operacion.includes("<")) {
                    query = 'isBefore';
                } else {
                    query = 'isAfter';
                }
                if(!regla.operacion.includes("!") && !regla.operacion.includes("==")) {
                    agregarComparator = "moment(arregloPrestamos"+idFiltro+"[i].fechaFinal)."+query+"(moment(nuevaFecha"+regla.ID+"), 'day')";
                } else if(regla.operacion.includes("==")) {
                    agregarComparator = "moment(arregloPrestamos"+idFiltro+"[i].fechaFinal).isSame(moment(nuevaFecha"+regla.ID+"), 'day')";
                } else {
                    agregarComparator = "!moment(arregloPrestamos"+idFiltro+"[i].fechaFinal).isSame(moment(nuevaFecha"+regla.ID+"), 'day')";
                }
                if(regla.operacion.includes("=") && (regla.operacion.includes("<") || regla.operacion.includes(">")) ) {
                    agregarIsSame = " || moment(arregloPrestamos"+idFiltro+"[i].fechaFinal).isSame(moment(nuevaFecha"+regla.ID+"), 'day')";
                } else {
                    agregarIsSame = "";
                }
                // Agregando campo Operacion
                arreglo.push({codigo: tabsText+"if ( (arregloPrestamos"+idFiltro+"[i].fechaFinal != undefined && !moment(arregloPrestamos"+idFiltro+"[i].fechaFinal).isSame(moment('2001-01-01'), 'day') ) && ("+agregarComparator+" "+agregarIsSame+") ) {", filtro: regla.filtro});
                //posicionesIF.push(arreglo.length-1);
                posicionesIF.push(arreglo.length);
            } else if(regla.campoObjetivo.split("=")[1].indexOf("alac") == 0) {
                noAgregarBoolean = true;
                var campo = regla.campoObjetivo.split("=")[1];
                // Agregando campo Operacion
                arreglo.push({codigo: tabsText+"if ( arregloPrestamos"+idFiltro+"[i].alac.length > 0 ) {", filtro: regla.filtro});
                //posicionesIF.push(arreglo.length-1);
                posicionesIF.push(arreglo.length);
            } else if(regla.campoObjetivo.split("=")[1].indexOf("fechaFinal") == 0) {
                noAgregarBoolean = true;
                var valor;
                if(regla.valor.split("=")[1] == 'true')
                    valor = '!';
                else
                    valor = '';
                arreglo.push({codigo: tabsText+"if ( arregloPrestamos"+idFiltro+"[i].fechaFinal == null || arregloPrestamos"+idFiltro+"[i].fechaFinal == undefined || "+valor+"moment(arregloPrestamos"+idFiltro+"[i].fechaFinal).isSame(moment('2001-01-01') ) {", filtro: regla.filtro});
                posicionesIF.push(arreglo.length);
            } else {
                noAgregarFactor = true;
                arreglo.push({codigo: tabsText+(variable+proyeccion)+" += arregloPrestamos"+idFiltro+"[i].valorFinanciacion - getPriceALAC(arregloPrestamos"+idFiltro+"[i].alac);", filtro: regla.filtro});
            }
        } else if(regla.campoObjetivo.indexOf('NOUAGRUPACION') == 0) {
            noAgregarFactor = true;
            arreglo.push({codigo: tabsText+"if ( arregloPrestamos"+idFiltro+"[i].tipoCredito.localeCompare('"+getListValue(regla.campoObjetivo.split("=")[1], "tipoCredito")+"') == 0 ) {\n", filtro: regla.filtro});
            arreglo.push({codigo: tabsText+"\tvar totalPrestamo = "+(regla.variables/100)+" * arregloPrestamos"+idFiltro+"[i].pago"+proyeccion+";", filtro: regla.filtro});
            arreglo.push({codigo: "\n\t"+tabsText+(variable+proyeccion)+" += totalPrestamo;\n", filtro: regla.filtro});
            arreglo.push({codigo: tabsText+"}", filtro: regla.filtro});
            var factorValor = getFactor(regla.variablePadre);
            //aplicarFactores.push((variable+proyeccion)+" = "+(variable+proyeccion)+" * "+(parseInt(regla.valor.split("=")[1])/100)+";\n");
            aplicarFactores.push((variable+proyeccion)+" = "+(variable+proyeccion)+" * "+(factorValor)+";\n");
        }

        if(regla.valor.indexOf('LISTA') == 0 && !noAgregarBoolean) {
            if(esCondicion) {
                var arregloLista = regla.valor.split("=")[1].split(",");
                var copiaRegla = $.extend(true,{},arreglo);
                var tamArreglo = arreglo.length;
                if(regla.operacion == "no") {
                    for (var j = 0; j < tamArreglo; j++) {
                        for (var i = 0; i < arregloLista.length; i++) {
                            if(i==0) {
                                var textoFinal = ' != 0 ';
                                if(i+1 == arregloLista.length)
                                    textoFinal += " ) {";
                                var campo = regla.campoObjetivo.split("=")[1];
                                var valor = getListValue(arregloLista[i], campo);
                                arreglo[j].codigo +=valor + "')" + textoFinal;
                            } else {
                                var textoFinal = ' != 0 ';
                                if(i+1 == arregloLista.length)
                                    textoFinal += " ) {";
                                var campo = regla.campoObjetivo.split("=")[1];
                                var valor = getListValue(arregloLista[i], campo);
                                arreglo[j].codigo += " && "+copiaRegla[j].codigo.split(" ( ")[1]+valor+"')"+textoFinal;
                            }
                        };
                    };
                } else {
                    for (var j = 0; j < tamArreglo; j++) {
                        for (var i = 0; i < arregloLista.length; i++) {
                            if(i==0) {
                                var textoFinal = ' == 0 ';
                                if(i+1 == arregloLista.length)
                                    textoFinal += " ) {";
                                var campo = regla.campoObjetivo.split("=")[1];
                                var valor = getListValue(arregloLista[i], campo);
                                arreglo[j].codigo +=valor + "')" + textoFinal;
                            } else {
                                var textoFinal = ' == 0 ';
                                if(i+1 == arregloLista.length)
                                    textoFinal += " ) {";
                                var campo = regla.campoObjetivo.split("=")[1];
                                var valor = getListValue(arregloLista[i], campo);
                                arreglo[j].codigo += " || "+copiaRegla[j].codigo.split(" ( ")[1]+valor+"')"+textoFinal;
                            }
                        };
                    };
                }
            }
        } else if(regla.valor.indexOf('FACTOR') == 0 && !noAgregarFactor) {
            if(esCondicion) {
                //var factorValor = parseInt(regla.valor.split("=")[1]);
                var factorValor;
                if(regla.valor.split("=")[1].localeCompare("MANUAL") != 0)
                    factorValor = getFactor(regla.variablePadre);
                else
                    factorValor = "arregloPrestamos"+idFiltro+"[i].factor"/100;
                for (var i = 1; i < arreglo.length; i++) {
                    arreglo[i].codigo += " "+factorValor + " ) {";
                };
            } else {
                //var factorValor = regla.valor.split("=")[1];
                var factorValor;
                if(regla.valor.split("=")[1].localeCompare("MANUAL") != 0)
                    factorValor = getFactor(regla.variablePadre);
                else
                    factorValor = "arregloPrestamos"+idFiltro+"[i].factor"/100;
                for (var i = 1; i < arreglo.length; i++) {
                    arreglo[i].codigo += " "+factorValor + ";";
                };
            }
        } else if(regla.valor.indexOf('COLUMNA') == 0) {
            if(esCondicion) {
                var columnaValor = regla.valor.split("=")[1];
                for (var i = 0; i < arreglo.length; i++) {
                    arreglo[i].codigo += " "+columnaValor + " ) {";
                };
            } else {
                var columnaValor = regla.valor.split("=")[1];
                for (var i = 0; i < arreglo.length; i++) {
                    arreglo[i].codigo += " "+columnaValor + ";";
                };
            }
        } else if(regla.valor.indexOf('FECHA') == 0 && !noAgregarFecha) {
            if(esCondicion) {
                for (var i = 0; i < arreglo.length; i++) {
                    arreglo[i].codigo += " "+proyeccion+" ) {";
                };
            } else {
                var columnaValor = regla.valor.split("=")[1];
                for (var i = 0; i < arreglo.length; i++) {
                    arreglo[i].codigo += " "+proyeccion+";";
                };
            }
        } else if(regla.valor.indexOf('MANUAL') == 0 || regla.valor.indexOf('MORA') == 0 || (regla.valor.indexOf('BOOLEAN') == 0 && !noAgregarBoolean)) {
            if(esCondicion) {
                var columnaValor = regla.valor.split("=")[1];
                for (var i = 0; i < arreglo.length; i++) {
                    arreglo[i].codigo += " "+columnaValor + " ) {";
                };
            } else {
                var columnaValor = regla.valor.split("=")[1];
                for (var i = 0; i < arreglo.length; i++) {
                    arreglo[i].codigo += " "+columnaValor + ";";
                };
            }
        }

        var cuerpo = arregloReglas.filter(function( object ) {
            return object.reglaPadre == regla.ID;
        });
        if(cuerpo.length > 0) {
            var arregloCuerpo = [];
            for (var i = 0; i < cuerpo.length; i++) {
                var cuantasTabs = tabs;
                if(esCondicion)
                    cuantasTabs++;
                var retorno = campoObjetivoPrestamos(cuerpo[i], [], cuantasTabs, variable, proyeccion);
                retorno[0].codigo = "\n"+retorno[0].codigo;
                $.merge( arregloCuerpo, retorno );
            };
            for (var i = 0; i < posicionesIF.length; i++) {
                arreglo.splice(posicionesIF[i], 0, ...arregloCuerpo);
                if(esCondicion)
                    arreglo.splice(posicionesIF[i]+arregloCuerpo.length, 0, {codigo: "\n"+tabsText+"}", filtro: regla.filtro});
                for (var j = i; j < posicionesIF.length; j++) {
                    posicionesIF[j]+=arregloCuerpo.length;
                };
            };
            if(posicionesIF.length == 0)
                $.merge( arreglo, arregloCuerpo );
            return arreglo;
        } else {
            if(esCondicion){
                for (var i = 0; i < posicionesIF.length; i++) {
                    arreglo.splice(posicionesIF[i], 0, {codigo: "\n"+tabsText+"}", filtro: regla.filtro});
                };
            }
            return arreglo;
        }
    /*} catch (exception) {
        console.log(e);
    }*/
}

//funcion para retornar el valor correspondiente de una lista dependiendo del tipo de columna
function getListValue (id, column) {
    if(column.localeCompare("idCliente") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].valor;
            }
        };
    } else if(column.localeCompare("nombreCliente") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].nombre;
            }
        };
    } else if(column.localeCompare("tipoPersona") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].valor;
            }
        };
    } else if(column.localeCompare("tipoSubPersona") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].valor;
            }
        };
    } else if(column.localeCompare("tipoCredito") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].valor;
            }
        };
    } else if(column.localeCompare("tipoCuenta") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].valor;
            }
        };
    } else if(column.localeCompare("IDS") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].valor;
            }
        };
    } else if(column.localeCompare("idCliente") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].valor;
            }
        };
    } else if(column.localeCompare("nombreCliente") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].nombre;
            }
        };
    } else if(column.localeCompare("tipoPersona") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].valor;
            }
        };
    } else if(column.localeCompare("tipoSubPersona") == 0) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == id) {
                return arreglodeListas[i].valor;
            }
        };
    } else {
        return false;
    }
}

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rcllugonhn@gmail.com',
        pass: 'SoFtPr0t3cT'
    }
});

function sendEmails () {
    var mensajesAEnviar = [];
    for (var k = 0; k < arregloDeCorreos.length; k++) {
        for (var z = 0; z < arregloDeAlertas.length; z++) {
            if(arregloDeAlertas[z].idCorreo == arregloDeCorreos[k].ID) {

                for (var p = 0; p < arregloMonedas.length; p++) {
                    for (var i = 0; i < variablesSolas.length; i++) {
                        for (var j = 0; j < variablesSolas[i].length; j++) {
                            if(variablesSolas[i][j].ID == arregloDeAlertas[z].variableID) {
                                if(mensajesAEnviar[k] == undefined)
                                    mensajesAEnviar[k] = [];
                                if(window["variablesSolas"+arregloMonedas[p]][i][j].total/100 < arregloDeAlertas[z].porcentajeEnviar)
                                    mensajesAEnviar[k].push({variable: window["variablesSolas"+arregloMonedas[p]][i][j].variable, total: window["variablesSolas"+arregloMonedas[p]][i][j].total});
                            } // fin if  variablesSolas[i].ID == arregloDeAlertas[z].variableID
                        }
                    }
                }
                ///
            }
        };
    }
    console.log('mensajesAEnviar')
    console.log(mensajesAEnviar)
    for (var k = 0; k < arregloDeCorreos.length; k++) {
        var texto = '';
        for (var i = 0; i < mensajesAEnviar.length; i++) {
            texto+='<p>Una variable '+mensajesAEnviar[i].variableID+' ha alcanzado el minimo recomendado</p>';
        };
        var mailOptions = {
            from: 'rcllugonhn@gmail.com',
            to: arregloDeCorreos[k].correo,
            subject: 'Alerta de cálculo RCL',
            html: texto
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
    /*var html = '<h1>Reporte de Cálculos</h1>', entro = false;
    for (var p = 0; p < arregloMonedas.length; p++) {
        for (var i = 0; i < variablesSolas.length; i++) {
            for (var j = 0; j < variablesSolas[i].length; j++) {
                for (var k = 0; k < arregloDeCorreos.length; k++) {
                    window["variablesSolas"+arregloMonedas[p]][i][j]
                    if(window["variablesSolas"+arregloMonedas[p]][i][j].ID == arregloDeCorreos[j].variableID && arregloDeCorreos[j].esVarPadre && window["variablesSolas"+arregloMonedas[p]][i][j].total <= arregloDeCorreos[j].porcentajeEnviar)
                }
            }
        }
    }
    for (var p = 0; p < arregloMonedas.length; p++) {
        for (var i = 0; i < totalesRCLCorreos[p].length; i++) {
            for (var j = 0; j < arregloDeCorreos.length; j++) {
                if( totalesRCLCorreos[p][i].ID == arregloDeCorreos[j].variableID && totalesRCLCorreos[p][i].total <= arregloDeCorreos[j].porcentajeEnviar && totalesRCLCorreos[p][i].esVarPadre == arregloDeCorreos[j].esVarPadre) {
                    if(!entro)
                        entro = true;
                    html+='<p></p>';
                }
            };
        };
    };
    if(entro) {
        var mailOptions = {
            from: 'rcllugonhn@gmail.com',
            to: 'dario.villalta@gmail.com',
            subject: 'Alerta de cálculo RCL',
            html: '<p>That was easy!</p>'
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'rcllugonhn@gmail.com',
            pass: 'SoFtPr0t3cT'
        }
    });

    var mailOptions = {
        from: 'rcllugonhn@gmail.com',
        to: 'dario.villalta@gmail.com',
        subject: 'Sending Email using Node.js',
        html: '<h1>Welcome</h1><p>That was easy!</p>'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });*/
}

function formatDateCreationSingleDigits(date) {
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return year + '-' + (monthIndex+1) + '-' + day;
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
    monthIndex++;
    var year = date.getFullYear();
    return year + '-' + monthIndex + '-' + day;
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
//	**********		Fin Calculo RCL		**********







//	**********		Route Change		**********
function goVariables () {
	$("#app_root").empty();
    cleanupSelectedList();
    $("#app_root").load("src/variables.html");
}

function goHome () {
	$("#app_root").empty();
    $("#app_root").load("src/home.html");
}

function goUsers () {
	$("#app_root").empty();
    cleanupSelectedList();
    $("#app_root").load("src/users.html");
}

function goConnections () {
    $("#app_root").empty();
    cleanupSelectedList();
    $("#app_root").load("src/importaciones.html");
}

function goConfig () {
    $("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
    $("#app_root").load("src/config.html");
}

function logout () {
    session.defaultSession.clearStorageData([], (data) => {});
    $("#app_full").empty();
    //cleanup();
    $("#app_full").load("src/login.html");
}

function goRCL () {
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
}

function goReports () {
    $("#app_root").empty();
    $("#app_root").load("src/elegirReporteria.html");
}

function goGraphics () {
    $("#app_root").empty();
    $("#app_root").load("src/graficos.html");
}

function goLists () {
    $("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
    $("#app_root").load("src/variablesLists.html");
}

function cleanupSelectedList () {
    $(".side-menu li").each(function( i ) {
        if ($(this).hasClass("active"))
            $(this).removeClass("active")
    });
}



































//  **********      Interval      **********
var myInterval;
var timer = 0;

function myTimer() {
    if($(".dots").text().length<3) {
        $(".dots").text($(".dots").text()+".");
    } else {
        $(".dots").text("");
        $(".dots").text($(".dots").text()+".");
    }
    timer++;
}

function stopTimer() {
    $(".dots").text("");
    console.log(" ==== TIEMPO ==== ");
    console.log(timer+"s");
    console.log(" ==== FIN TIEMPO ==== ");
    clearTimeout(myInterval);
}
//  **********      Fin interval      **********