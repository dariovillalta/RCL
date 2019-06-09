const electron = require('electron');
const remote = require('electron').remote;
const sql = require('mssql');

var user = getUser();
var password = getPassword();
var server = getServer();
var database = getDataBase();

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

const pool1 = new sql.ConnectionPool(config, err => {
    if(err) {
        console.log(err)
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
        loadVariablesIMG();
        var hoy = new Date();
        var primerDia = new Date(hoy.getFullYear(), 0, 1);
        var ultimoDia = new Date(hoy.getFullYear(), 11, 31);
        $("#fechaInicioLineaTiempo").datepicker( "setDate" , primerDia );
        $("#fechaFinalLineaTiempo").datepicker( "setDate" , ultimoDia );
        $("#fechaBarChart").datepicker( "setDate" , hoy );
        loadTimeLine(primerDia, ultimoDia);
        loadBarChart(hoy);
        loadVariables();
        loadRadar(hoy);
        //loadVariablesMainDB();
    }
});

var session = remote.session;

session.defaultSession.cookies.get({}, (error, cookies) => {
    for (var i = 0; i < cookies.length; i++) {
        if(cookies[i].name == "name"){
            $("#nameUser").text(cookies[i].value);
            $("#navbar_name").text(cookies[i].value);
        } else if(cookies[i].name == "formula"){
            if(cookies[i].value == "0")
                $("#formula_div").hide();
        } else if(cookies[i].name == "fosede"){
            if(cookies[i].value == "0")
                $("#fosede_div").hide();
        }else if(cookies[i].name == "usuarios"){
            if(cookies[i].value == "0")
                $("#userLabel").hide();
        }
    };
});



/* ******************       LOADING IMG     ********* */
/*var filepathFullLogo = '';
var filepathSmallLogo = '';
function loadVariablesMainDB () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from Variables", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err);
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        if(result.recordset[0].fullLogo.length > 0){
                            filepathFullLogo = result.recordset[0].fullLogo;
                            $("#fullLogo").attr("src",filepathFullLogo);
                        } else
                            filepathFullLogo = '';
                        if(result.recordset[0].smallLogo.length > 0){
                            filepathSmallLogo = result.recordset[0].smallLogo;
                            $("#smallLogo").attr("src",filepathSmallLogo);
                        } else
                            filepathSmallLogo = '';
                    } else {
                        filepathFullLogo = '';
                        filepathSmallLogo = '';
                    }
                });
            }
        });
    }); // fin transaction
}*/
/* ******************       END LOADING IMG     ********* */



var arregloVariables = [];  //Arreglo de variables FormulaVariables
var arregloVariablesDeVariables = [];   //Arreglo de variables VariablesdeVariablesFormula
var arregloVariablesDeSubVariables = [];   //Arreglo de variables Reglas
var formulaGlobal;

/* ******************       LOADING IMG     ****************** */
var filepathFullLogo = '';
var filepathSmallLogo = '';
function loadVariablesIMG () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Variables", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Variables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        objetoBandera = result.recordset[0];
                        if(result.recordset[0].fullLogo.length > 0){
                            filepathFullLogo = result.recordset[0].fullLogo;
                            $("#fullLogo").attr("src",filepathFullLogo);
                            $("#fullLogo").css("height","3.3em");
                            /*$("#fullLogo").css("display","block");
                            $("#fullLogo").css("margin-left","auto");
                            $("#fullLogo").css("margin-right","auto");*/
                        } else
                            filepathFullLogo = '';
                        if(result.recordset[0].smallLogo.length > 0){
                            filepathSmallLogo = result.recordset[0].smallLogo;
                            $("#smallLogo").attr("src",filepathSmallLogo);
                            $("#smallLogo").css("height","3.4em");
                            /*$("#smallLogo").css("display","block");
                            $("#smallLogo").css("margin-left","auto");
                            $("#smallLogo").css("margin-right","auto");*/
                        } else
                            filepathSmallLogo = '';
                        if(result.recordset[0].formula.length > 0){
                            formulaGlobal = result.recordset[0].formula;
                        } else {
                            formulaGlobal = '';
                        }
                    } else {
                        objetoBandera = null;
                        filepathFullLogo = '';
                        filepathSmallLogo = '';
                    }
                });
            }
        });
    }); // fin transaction
}
/* ******************       END LOADING IMG     ****************** */

/* ******************       LOADING VARIABLES   ****************** */
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
                    if(result.recordset.length > 0) {
                        arregloVariables = result.recordset;
                    } else{
                        arregloVariables = [];
                    }
                    var hoy = new Date();
                    loadDonut(hoy);
                    //loadVariableVariables();
                });
            }
        });
    }); // fin transaction
}
/* ******************       END LOADING VARIABLES   ********* */

/* ******************       LOADING VARIABLES OF VARIABLES  ********* */
/*function loadVariableVariables () {
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
                    if(result.recordset.length > 0) {
                        arregloVariablesDeVariables = result.recordset;
                    } else{
                        arregloVariablesDeVariables = [];
                    }
                    loadVariableSubVariables();
                });
            }
        });
    }); // fin transaction
}*/
/* ******************       END LOADING VARIABLES OF VARIABLES  ********* */

/* ******************       LOADING VARIABLES OF SUB-VARIABLES  ********* */
/*function loadVariableSubVariables () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from Reglas", (err, result) => {
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
            }  else {
                transaction.commit(err => {
                    if(result.recordset.length > 0) {
                        for (var i = 0; i < result.recordset.length; i++) {
                            if (result.recordset[i].campoObjetivo.indexOf("INSTANCIACION") == 0) {
                                arregloVariablesDeSubVariables.push({ID: result.recordset[i].ID, variables: result.recordset[i].variables, seleccionada: true});
                            }
                        };
                    } else {
                        arregloVariablesDeSubVariables = [];
                    }
                    var hoy = new Date();
                    var primerDia = new Date(hoy.getFullYear(), 0, 1);
                    var ultimoDia = new Date(hoy.getFullYear(), 11, 31);
                    $("#fechaInicioLineaTiempo").datepicker( "setDate" , primerDia );
                    $("#fechaFinalLineaTiempo").datepicker( "setDate" , ultimoDia );
                    $("#fechaBarChart").datepicker( "setDate" , hoy );
                    loadTimeLine(primerDia, ultimoDia);
                    loadBarChart(hoy);
                    loadDonut(hoy);
                    loadRadar(hoy);
                });
            }
        });
    }); // fin transaction
}*/
/* ******************       END LOADING VARIABLES OF SUB-VARIABLES  ********* */































/*                              Linea de Tiempo                             */
var arregloVariablesTimeLine = [];
var arregloTimeLineProyeccion1 = [];
var arregloTimeLineProyeccion2 = [];
var arregloTimeLineProyeccion3 = [];
var arregloTimeLineProyeccion4 = [];
var arregloTimeLineConsolidados = [];
var dataTimeLine;
function filterTimeLine () {
    var fechaInicio = $("#fechaInicioLineaTiempo").datepicker('getDate');
    var fechaFinal = $("#fechaFinalLineaTiempo").datepicker('getDate');
    if (Object.prototype.toString.call(fechaInicio) === "[object Date]") {
        if (isNaN(fechaInicio.getTime())) {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese una fecha de inicio.",
                overlay: true,
                closeConfirm: true
            });
        } else {
            if (Object.prototype.toString.call(fechaFinal) === "[object Date]") {
                if (isNaN(fechaFinal.getTime())) {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "Ingrese una fecha final.",
                        overlay: true,
                        closeConfirm: true
                    });
                } else {
                    arregloTimeLineProyeccion1 = [];
                    arregloTimeLineProyeccion2 = [];
                    arregloTimeLineProyeccion3 = [];
                    arregloTimeLineProyeccion4 = [];
                    loadTimeLine(fechaInicio, fechaFinal);
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Ingrese una fecha final.",
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
            message: "Ingrese una fecha de inicio.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function loadTimeLine (inicioF, finalF) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Totales where fecha between '"+formatDateCreation(inicioF)+"' and '"+formatDateCreation(finalF)+"'", (err, result) => {
            if (err) {
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Totales Time Line.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloVariablesTimeLine = result.recordset;
                        for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
                            arregloVariablesTimeLine[i].fecha = new Date(arregloVariablesTimeLine[i].fecha.getUTCFullYear(), arregloVariablesTimeLine[i].fecha.getUTCMonth(), arregloVariablesTimeLine[i].fecha.getUTCDate())
                        };
                    } else {
                        arregloVariablesTimeLine = [];
                    }
                    arregloTimeLineConsolidados = [];
                    arregloTimeLineConsolidados[0] = [];
                    arregloTimeLineConsolidados[1] = [];
                    arregloTimeLineConsolidados[2] = [];
                    for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
                        if(arregloVariablesTimeLine[i].tipo.localeCompare("subVariable") == 0) {
                            if(arregloVariablesTimeLine[i].tablaAplicar == 1) {
                                var pos = -1;
                                for (var j = 0; j < arregloTimeLineConsolidados[0].length; j++) {
                                    if(arregloTimeLineConsolidados[0][j].tipoProyeccion == arregloVariablesTimeLine[i].tipoProyeccion && arregloTimeLineConsolidados[0][j].fecha.getDate() == arregloVariablesTimeLine[i].fecha.getDate() && arregloTimeLineConsolidados[0][j].fecha.getMonth() == arregloVariablesTimeLine[i].fecha.getMonth() && arregloTimeLineConsolidados[0][j].fecha.getFullYear() == arregloVariablesTimeLine[i].fecha.getFullYear()) {
                                        //arregloTimeLineConsolidados[0][j].total +=arregloVariablesTimeLine[i].total;
                                        pos = j;
                                        break;
                                    }
                                };
                                if(pos == -1)
                                    arregloTimeLineConsolidados[0].push({nombreVariable: "Activos", total: arregloVariablesTimeLine[i].total, fecha: new Date(arregloVariablesTimeLine[i].fecha.getUTCFullYear(), arregloVariablesTimeLine[i].fecha.getUTCMonth(), arregloVariablesTimeLine[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesTimeLine[i].tipoProyeccion});
                                else
                                    arregloTimeLineConsolidados[0][pos].total += arregloVariablesTimeLine[i].total;
                            } else if(arregloVariablesTimeLine[i].tablaAplicar == 2) {
                                var pos = -1;
                                for (var j = 0; j < arregloTimeLineConsolidados[1].length; j++) {
                                    if(arregloTimeLineConsolidados[1][j].tipoProyeccion == arregloVariablesTimeLine[i].tipoProyeccion && arregloTimeLineConsolidados[1][j].fecha.getDate() == arregloVariablesTimeLine[i].fecha.getDate() && arregloTimeLineConsolidados[1][j].fecha.getMonth() == arregloVariablesTimeLine[i].fecha.getMonth() && arregloTimeLineConsolidados[1][j].fecha.getFullYear() == arregloVariablesTimeLine[i].fecha.getFullYear()) {
                                        //arregloTimeLineConsolidados[0][j].total +=arregloVariablesTimeLine[i].total;
                                        pos = j;
                                        break;
                                    }
                                };
                                if(pos == -1)
                                    arregloTimeLineConsolidados[1].push({nombreVariable: "Pasivos", total: arregloVariablesTimeLine[i].total, fecha: new Date(arregloVariablesTimeLine[i].fecha.getUTCFullYear(), arregloVariablesTimeLine[i].fecha.getUTCMonth(), arregloVariablesTimeLine[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesTimeLine[i].tipoProyeccion});
                                else
                                    arregloTimeLineConsolidados[1][pos].total += arregloVariablesTimeLine[i].total;
                            } else if(arregloVariablesTimeLine[i].tablaAplicar == 3) {
                                var pos = -1;
                                for (var j = 0; j < arregloTimeLineConsolidados[2].length; j++) {
                                    if(arregloTimeLineConsolidados[2][j].tipoProyeccion == arregloVariablesTimeLine[i].tipoProyeccion && arregloTimeLineConsolidados[2][j].fecha.getDate() == arregloVariablesTimeLine[i].fecha.getDate() && arregloTimeLineConsolidados[2][j].fecha.getMonth() == arregloVariablesTimeLine[i].fecha.getMonth() && arregloTimeLineConsolidados[2][j].fecha.getFullYear() == arregloVariablesTimeLine[i].fecha.getFullYear()) {
                                        //arregloTimeLineConsolidados[0][j].total +=arregloVariablesTimeLine[i].total;
                                        pos = j;
                                        break;
                                    }
                                };
                                if(pos == -1)
                                    arregloTimeLineConsolidados[2].push({nombreVariable: "Créditos", total: arregloVariablesTimeLine[i].total, fecha: new Date(arregloVariablesTimeLine[i].fecha.getUTCFullYear(), arregloVariablesTimeLine[i].fecha.getUTCMonth(), arregloVariablesTimeLine[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesTimeLine[i].tipoProyeccion});
                                else
                                    arregloTimeLineConsolidados[2][pos].total += arregloVariablesTimeLine[i].total;
                            }
                        }
                    };
                    /*for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
                        Loop1:
                        for (var k = 0; k < arregloVariablesDeVariables.length; k++) {
                            if(arregloVariablesDeVariables[k].nombre.localeCompare(arregloVariablesTimeLine[i].nombreVariable) == 0 && arregloVariablesDeVariables[k].tablaAplicar == 1) {
                                if(arregloTimeLineConsolidados[0] == undefined) {
                                    arregloTimeLineConsolidados[0] = [];
                                    arregloTimeLineConsolidados[0].push({nombreVariable: "Activos", total: arregloVariablesTimeLine[i].total, fecha: new Date(arregloVariablesTimeLine[i].fecha.getUTCFullYear(), arregloVariablesTimeLine[i].fecha.getUTCMonth(), arregloVariablesTimeLine[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesTimeLine[i].tipoProyeccion});
                                    break Loop1;
                                } else {
                                    var entro = false;
                                    for (var j = 0; j < arregloTimeLineConsolidados[0].length; j++) {
                                        if(arregloTimeLineConsolidados[0][j].tipoProyeccion == arregloVariablesTimeLine[i].tipoProyeccion && arregloTimeLineConsolidados[0][j].fecha.getDate() == arregloVariablesTimeLine[i].fecha.getDate() && arregloTimeLineConsolidados[0][j].fecha.getMonth() == arregloVariablesTimeLine[i].fecha.getMonth() && arregloTimeLineConsolidados[0][j].fecha.getFullYear() == arregloVariablesTimeLine[i].fecha.getFullYear()) {
                                            arregloTimeLineConsolidados[0][j].total +=arregloVariablesTimeLine[i].total;
                                            entro = true;
                                        }
                                    };
                                    if(!entro)
                                        arregloTimeLineConsolidados[0].push({nombreVariable: "Activos", total: arregloVariablesTimeLine[i].total, fecha: new Date(arregloVariablesTimeLine[i].fecha.getUTCFullYear(), arregloVariablesTimeLine[i].fecha.getUTCMonth(), arregloVariablesTimeLine[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesTimeLine[i].tipoProyeccion});
                                    break Loop1;
                                }
                            } else if(arregloVariablesDeVariables[k].nombre.localeCompare(arregloVariablesTimeLine[i].nombreVariable) == 0 && arregloVariablesDeVariables[k].tablaAplicar == 2) {
                                if(arregloTimeLineConsolidados[1] == undefined) {
                                    arregloTimeLineConsolidados[1] = [];
                                    arregloTimeLineConsolidados[1].push({nombreVariable: "Pasivos", total: arregloVariablesTimeLine[i].total, fecha: new Date(arregloVariablesTimeLine[i].fecha.getUTCFullYear(), arregloVariablesTimeLine[i].fecha.getUTCMonth(), arregloVariablesTimeLine[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesTimeLine[i].tipoProyeccion});
                                    break Loop1;
                                } else {
                                    var entro = false;
                                    for (var j = 0; j < arregloTimeLineConsolidados[1].length; j++) {
                                        if(arregloTimeLineConsolidados[1][j].tipoProyeccion == arregloVariablesTimeLine[i].tipoProyeccion && arregloTimeLineConsolidados[1][j].fecha.getDate() == arregloVariablesTimeLine[i].fecha.getDate() && arregloTimeLineConsolidados[1][j].fecha.getMonth() == arregloVariablesTimeLine[i].fecha.getMonth() && arregloTimeLineConsolidados[1][j].fecha.getFullYear() == arregloVariablesTimeLine[i].fecha.getFullYear()) {
                                            arregloTimeLineConsolidados[1][j].total +=arregloVariablesTimeLine[i].total;
                                            entro = true;
                                        }
                                    };
                                    if(!entro)
                                        arregloTimeLineConsolidados[1].push({nombreVariable: "Pasivos", total: arregloVariablesTimeLine[i].total, fecha: new Date(arregloVariablesTimeLine[i].fecha.getUTCFullYear(), arregloVariablesTimeLine[i].fecha.getUTCMonth(), arregloVariablesTimeLine[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesTimeLine[i].tipoProyeccion});
                                    break Loop1;
                                }
                            } else if(arregloVariablesDeVariables[k].nombre.localeCompare(arregloVariablesTimeLine[i].nombreVariable) == 0 && arregloVariablesDeVariables[k].tablaAplicar == 3) {
                                if(arregloTimeLineConsolidados[2] == undefined) {
                                    arregloTimeLineConsolidados[2] = [];
                                    arregloTimeLineConsolidados[2].push({nombreVariable: "Créditos", total: arregloVariablesTimeLine[i].total, fecha: new Date(arregloVariablesTimeLine[i].fecha.getUTCFullYear(), arregloVariablesTimeLine[i].fecha.getUTCMonth(), arregloVariablesTimeLine[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesTimeLine[i].tipoProyeccion});
                                    break Loop1;
                                } else {
                                    var entro = false;
                                    for (var j = 0; j < arregloTimeLineConsolidados[2].length; j++) {
                                        if(arregloTimeLineConsolidados[2][j].tipoProyeccion == arregloVariablesTimeLine[i].tipoProyeccion && arregloTimeLineConsolidados[2][j].fecha.getDate() == arregloVariablesTimeLine[i].fecha.getDate() && arregloTimeLineConsolidados[2][j].fecha.getMonth() == arregloVariablesTimeLine[i].fecha.getMonth() && arregloTimeLineConsolidados[2][j].fecha.getFullYear() == arregloVariablesTimeLine[i].fecha.getFullYear()) {
                                            arregloTimeLineConsolidados[2][j].total +=arregloVariablesTimeLine[i].total;
                                            entro = true;
                                        }
                                    };
                                    if(!entro)
                                        arregloTimeLineConsolidados[2].push({nombreVariable: "Créditos", total: arregloVariablesTimeLine[i].total, fecha: new Date(arregloVariablesTimeLine[i].fecha.getUTCFullYear(), arregloVariablesTimeLine[i].fecha.getUTCMonth(), arregloVariablesTimeLine[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesTimeLine[i].tipoProyeccion});
                                    break Loop1;
                                }
                            }
                        };
                    };*/
                    if( $('#lineatiempoProyeccion').is(':checked') ) {
                        prepareTimelineProyection();
                    } else if( $('#lineatiempoVariable').is(':checked') ) {
                        prepareTimelineVariables();
                    } else if( $('#lineatiempoConsolidado').is(':checked') ) {
                        prepareTimelineConsolidado();
                    }
                });
            }
        });
    }); // fin transaction
}

function prepareTimelineProyection() {
    var arraySelectVariables = [];
    var arraySelectSubVariables = [];
    var arraySelectVariablesSubVariables = [];
    var arraySelectCuenta = [];
    var contentSelectVariable = '';
    var contentSelectSubVariable = '';
    var contentSelectVariablesSubVariable = '';
    var contentSelectCuenta = '';
    var variable;
    if(arregloVariablesTimeLine.length > 0)
        variable = arregloVariablesTimeLine[0].nombreVariable;
    for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
        if(arregloVariablesTimeLine[i].tipo.localeCompare("variable") == 0 && noExiste(arraySelectVariables, arregloVariablesTimeLine[i].nombreVariable) ) {
            if(arraySelectVariables.length == 0)
                contentSelectVariable += '<optgroup label="Variables">';
            contentSelectVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("subVariable") == 0 && noExiste(arraySelectSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectSubVariables.length == 0)
                contentSelectSubVariable += '<optgroup label="Sub-Variables">';
            contentSelectSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("varDeSubVariable") == 0 && noExiste(arraySelectVariablesSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectVariablesSubVariables.length == 0)
                contentSelectVariablesSubVariable += '<optgroup label="Variables de Sub-Variables">';
            contentSelectVariablesSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariablesSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("cuenta") == 0 && noExiste(arraySelectCuenta, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectCuenta.length == 0)
                contentSelectCuenta += '<optgroup label="Cuentas">';
            contentSelectCuenta += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectCuenta.push(arregloVariablesTimeLine[i].nombreVariable);
        }

        if(arregloVariablesTimeLine[i].nombreVariable.localeCompare(variable) == 0) {
            if(arregloVariablesTimeLine[i].tipoProyeccion == 30)
                arregloTimeLineProyeccion1.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
            else if(arregloVariablesTimeLine[i].tipoProyeccion == 60)
                arregloTimeLineProyeccion2.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
            else if(arregloVariablesTimeLine[i].tipoProyeccion == 90)
                arregloTimeLineProyeccion3.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
            else if(arregloVariablesTimeLine[i].tipoProyeccion == 120)
                arregloTimeLineProyeccion4.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
        }
    };

    if(contentSelectVariable.length > 0)
        contentSelectVariable += '</optgroup>';
    if(contentSelectSubVariable.length > 0)
        contentSelectSubVariable += '</optgroup>';
    if(contentSelectVariablesSubVariable.length > 0)
        contentSelectVariablesSubVariable += '</optgroup>';
    if(contentSelectCuenta.length > 0)
        contentSelectCuenta += '</optgroup>';

    dataTimeLine = [
        {
            label: '30 Días',
            data: arregloTimeLineProyeccion1,
            last: true
        },
        {
            label: '60 Días',
            data: arregloTimeLineProyeccion2,
            last: true
        },
        {
            label: '90 Días',
            data: arregloTimeLineProyeccion3,
            last: true
        },
        {
            label: '120 Días',
            data: arregloTimeLineProyeccion4,
            last: true
        }
    ];
    $("#selectLineaTiempoProyecciones").empty();
    $("#selectLineaTiempoProyecciones").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoProyecciones").select2("val", variable);

    $("#selectLineaTiempoVariables1").empty();
    $("#selectLineaTiempoVariables1").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables1").select2("val", variable);
    $("#selectLineaTiempoVariables2").empty();
    $("#selectLineaTiempoVariables2").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables2").select2("val", variable);
    $("#selectLineaTiempoVariables3").empty();
    $("#selectLineaTiempoVariables3").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables3").select2("val", variable);
    $("#selectLineaTiempoVariables4").empty();
    $("#selectLineaTiempoVariables4").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables4").select2("val", variable);

    renderFlotLineChart();
}

$('#selectLineaTiempoProyecciones').on("change", function(e) {
    selectTimeLineProyeccionChange();
});

function selectTimeLineProyeccionChange () {
    arregloTimeLineProyeccion1 = [];
    arregloTimeLineProyeccion2 = [];
    arregloTimeLineProyeccion3 = [];
    arregloTimeLineProyeccion4 = [];
    var variable = $("#selectLineaTiempoProyecciones").val();
    for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
        if(arregloVariablesTimeLine[i].nombreVariable.localeCompare(variable) == 0) {
            if(arregloVariablesTimeLine[i].tipoProyeccion == 30)
                arregloTimeLineProyeccion1.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
            else if(arregloVariablesTimeLine[i].tipoProyeccion == 60)
                arregloTimeLineProyeccion2.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
            else if(arregloVariablesTimeLine[i].tipoProyeccion == 90)
                arregloTimeLineProyeccion3.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
            else if(arregloVariablesTimeLine[i].tipoProyeccion == 120)
                arregloTimeLineProyeccion4.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
        }
    };
    dataTimeLine = [
        {
            label: '30 Días',
            data: arregloTimeLineProyeccion1,
            last: true
        },
        {
            label: '60 Días',
            data: arregloTimeLineProyeccion2,
            last: true
        },
        {
            label: '90 Días',
            data: arregloTimeLineProyeccion3,
            last: true
        },
        {
            label: '120 Días',
            data: arregloTimeLineProyeccion4,
            last: true
        }
    ];
    renderFlotLineChart();
}

function noExiste (arreglo, variable) {
    for (var i = 0; i < arreglo.length; i++) {
        if(arreglo[i].localeCompare(variable) == 0) {
            return false;
        }
    };
    return true;
}

function prepareTimelineVariables () {
    var arraySelectVariables = [];
    var arraySelectSubVariables = [];
    var arraySelectVariablesSubVariables = [];
    var arraySelectCuenta = [];
    var contentSelectVariable = '';
    var contentSelectSubVariable = '';
    var contentSelectVariablesSubVariable = '';
    var contentSelectCuenta = '';
    var variable1, proyeccion1;
    if( $('#selectLineaTiempoVariables1Radio1').is(':checked') )
        proyeccion1 = 30;
    else if( $('#selectLineaTiempoVariables1Radio2').is(':checked') )
        proyeccion1 = 60;
    else if( $('#selectLineaTiempoVariables1Radio3').is(':checked') )
        proyeccion1 = 90;
    else if( $('#selectLineaTiempoVariables1Radio4').is(':checked') )
        proyeccion1 = 120;
    var variable2, proyeccion2;
    if( $('#selectLineaTiempoVariables2Radio1').is(':checked') )
        proyeccion2 = 30;
    else if( $('#selectLineaTiempoVariables2Radio2').is(':checked') )
        proyeccion2 = 60;
    else if( $('#selectLineaTiempoVariables2Radio3').is(':checked') )
        proyeccion2 = 90;
    else if( $('#selectLineaTiempoVariables2Radio4').is(':checked') )
        proyeccion2 = 120;
    var variable3, proyeccion3;
    if( $('#selectLineaTiempoVariables3Radio1').is(':checked') )
        proyeccion3 = 30;
    else if( $('#selectLineaTiempoVariables3Radio2').is(':checked') )
        proyeccion3 = 60;
    else if( $('#selectLineaTiempoVariables3Radio3').is(':checked') )
        proyeccion3 = 90;
    else if( $('#selectLineaTiempoVariables3Radio4').is(':checked') )
        proyeccion3 = 120;
    var variable4, proyeccion4;
    if( $('#selectLineaTiempoVariables4Radio1').is(':checked') )
        proyeccion4 = 30;
    else if( $('#selectLineaTiempoVariables4Radio2').is(':checked') )
        proyeccion4 = 60;
    else if( $('#selectLineaTiempoVariables4Radio3').is(':checked') )
        proyeccion4 = 90;
    else if( $('#selectLineaTiempoVariables4Radio4').is(':checked') )
        proyeccion4 = 120;
    if(arregloVariablesTimeLine.length > 0) {
        variable1 = arregloVariablesTimeLine[0].nombreVariable;
        variable2 = arregloVariablesTimeLine[0].nombreVariable;
        variable3 = arregloVariablesTimeLine[0].nombreVariable;
        variable4 = arregloVariablesTimeLine[0].nombreVariable;
    }
    for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
        if(arregloVariablesTimeLine[i].tipo.localeCompare("variable") == 0 && noExiste(arraySelectVariables, arregloVariablesTimeLine[i].nombreVariable) ) {
            if(arraySelectVariables.length == 0)
                contentSelectVariable += '<optgroup label="Variables">';
            contentSelectVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("subVariable") == 0 && noExiste(arraySelectSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectSubVariables.length == 0)
                contentSelectSubVariable += '<optgroup label="Sub-Variables">';
            contentSelectSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("varDeSubVariable") == 0 && noExiste(arraySelectVariablesSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectVariablesSubVariables.length == 0)
                contentSelectVariablesSubVariable += '<optgroup label="Variables de Sub-Variables">';
            contentSelectVariablesSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariablesSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("cuenta") == 0 && noExiste(arraySelectCuenta, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectCuenta.length == 0)
                contentSelectCuenta += '<optgroup label="Cuentas">';
            contentSelectCuenta += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectCuenta.push(arregloVariablesTimeLine[i].nombreVariable);
        }

        if(arregloVariablesTimeLine[i].nombreVariable.localeCompare(variable1) == 0) {
            if(arregloVariablesTimeLine[i].tipoProyeccion == proyeccion1)
                arregloTimeLineProyeccion1.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
        }
        if(arregloVariablesTimeLine[i].nombreVariable.localeCompare(variable2) == 0) {
            if(arregloVariablesTimeLine[i].tipoProyeccion == proyeccion2)
                arregloTimeLineProyeccion2.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
        }
        if(arregloVariablesTimeLine[i].nombreVariable.localeCompare(variable3) == 0) {
            if(arregloVariablesTimeLine[i].tipoProyeccion == proyeccion3)
                arregloTimeLineProyeccion3.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
        }
        if(arregloVariablesTimeLine[i].nombreVariable.localeCompare(variable4) == 0) {
            if(arregloVariablesTimeLine[i].tipoProyeccion == proyeccion4)
                arregloTimeLineProyeccion4.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
        }
    };

    if(contentSelectVariable.length > 0)
        contentSelectVariable += '</optgroup>';
    if(contentSelectSubVariable.length > 0)
        contentSelectSubVariable += '</optgroup>';
    if(contentSelectVariablesSubVariable.length > 0)
        contentSelectVariablesSubVariable += '</optgroup>';
    if(contentSelectCuenta.length > 0)
        contentSelectCuenta += '</optgroup>';

    dataTimeLine = [
        {
            label: variable1,
            data: arregloTimeLineProyeccion1,
            last: true
        },
        {
            label: variable2,
            data: arregloTimeLineProyeccion2,
            last: true
        },
        {
            label: variable3,
            data: arregloTimeLineProyeccion3,
            last: true
        },
        {
            label: variable4,
            data: arregloTimeLineProyeccion4,
            last: true
        }
    ];
    $("#selectLineaTiempoVariables1").empty();
    $("#selectLineaTiempoVariables1").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables1").select2("val", variable1);
    $("#selectLineaTiempoVariables2").empty();
    $("#selectLineaTiempoVariables2").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables2").select2("val", variable2);
    $("#selectLineaTiempoVariables3").empty();
    $("#selectLineaTiempoVariables3").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables3").select2("val", variable3);
    $("#selectLineaTiempoVariables4").empty();
    $("#selectLineaTiempoVariables4").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables4").select2("val", variable4);

    $("#selectLineaTiempoProyecciones").empty();
    $("#selectLineaTiempoProyecciones").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoProyecciones").select2("val", variable1);

    renderFlotLineChart();
}

$('#selectLineaTiempoVariables1').on("change", function(e) {
    selectTimeLineVariablesChange();
});
$('#selectLineaTiempoVariables2').on("change", function(e) {
    selectTimeLineVariablesChange();
});
$('#selectLineaTiempoVariables3').on("change", function(e) {
    selectTimeLineVariablesChange();
});
$('#selectLineaTiempoVariables4').on("change", function(e) {
    selectTimeLineVariablesChange();
});

$("input[name='selectLineaTiempoVariables1']").on('ifChanged', function(event){
    selectTimeLineVariablesChange();
});
$("input[name='selectLineaTiempoVariables2']").on('ifChanged', function(event){
    selectTimeLineVariablesChange();
});
$("input[name='selectLineaTiempoVariables3']").on('ifChanged', function(event){
    selectTimeLineVariablesChange();
});
$("input[name='selectLineaTiempoVariables4']").on('ifChanged', function(event){
    selectTimeLineVariablesChange();
});

function selectTimeLineVariablesChange () {
    arregloTimeLineProyeccion1 = [];
    arregloTimeLineProyeccion2 = [];
    arregloTimeLineProyeccion3 = [];
    arregloTimeLineProyeccion4 = [];
    var variable1 = $("#selectLineaTiempoVariables1").val(), proyeccion1;
    if( $('#selectLineaTiempoVariables1Radio1').is(':checked') )
        proyeccion1 = 30;
    else if( $('#selectLineaTiempoVariables1Radio2').is(':checked') )
        proyeccion1 = 60;
    else if( $('#selectLineaTiempoVariables1Radio3').is(':checked') )
        proyeccion1 = 90;
    else if( $('#selectLineaTiempoVariables1Radio4').is(':checked') )
        proyeccion1 = 120;
    var variable2 = $("#selectLineaTiempoVariables2").val(), proyeccion2;
    if( $('#selectLineaTiempoVariables2Radio1').is(':checked') )
        proyeccion2 = 30;
    else if( $('#selectLineaTiempoVariables2Radio2').is(':checked') )
        proyeccion2 = 60;
    else if( $('#selectLineaTiempoVariables2Radio3').is(':checked') )
        proyeccion2 = 90;
    else if( $('#selectLineaTiempoVariables2Radio4').is(':checked') )
        proyeccion2 = 120;
    var variable3 = $("#selectLineaTiempoVariables3").val(), proyeccion3;
    if( $('#selectLineaTiempoVariables3Radio1').is(':checked') )
        proyeccion3 = 30;
    else if( $('#selectLineaTiempoVariables3Radio2').is(':checked') )
        proyeccion3 = 60;
    else if( $('#selectLineaTiempoVariables3Radio3').is(':checked') )
        proyeccion3 = 90;
    else if( $('#selectLineaTiempoVariables3Radio4').is(':checked') )
        proyeccion3 = 120;
    var variable4 = $("#selectLineaTiempoVariables4").val(), proyeccion4;
    if( $('#selectLineaTiempoVariables4Radio1').is(':checked') )
        proyeccion4 = 30;
    else if( $('#selectLineaTiempoVariables4Radio2').is(':checked') )
        proyeccion4 = 60;
    else if( $('#selectLineaTiempoVariables4Radio3').is(':checked') )
        proyeccion4 = 90;
    else if( $('#selectLineaTiempoVariables4Radio4').is(':checked') )
        proyeccion4 = 120;
    for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
        if(arregloVariablesTimeLine[i].nombreVariable.localeCompare(variable1) == 0) {
            if(arregloVariablesTimeLine[i].tipoProyeccion == proyeccion1)
                arregloTimeLineProyeccion1.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
        }
        if(arregloVariablesTimeLine[i].nombreVariable.localeCompare(variable2) == 0) {
            if(arregloVariablesTimeLine[i].tipoProyeccion == proyeccion2)
                arregloTimeLineProyeccion2.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
        }
        if(arregloVariablesTimeLine[i].nombreVariable.localeCompare(variable3) == 0) {
            if(arregloVariablesTimeLine[i].tipoProyeccion == proyeccion3)
                arregloTimeLineProyeccion3.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
        }
        if(arregloVariablesTimeLine[i].nombreVariable.localeCompare(variable4) == 0) {
            if(arregloVariablesTimeLine[i].tipoProyeccion == proyeccion4)
                arregloTimeLineProyeccion4.push([arregloVariablesTimeLine[i].fecha, arregloVariablesTimeLine[i].total]);
        }
    };
    dataTimeLine = [
        {
            label: variable1,
            data: arregloTimeLineProyeccion1,
            last: true
        },
        {
            label: variable2,
            data: arregloTimeLineProyeccion2,
            last: true
        },
        {
            label: variable3,
            data: arregloTimeLineProyeccion3,
            last: true
        },
        {
            label: variable4,
            data: arregloTimeLineProyeccion4,
            last: true
        }
    ];
    renderFlotLineChart();
}

function prepareTimelineConsolidado () {
    var arraySelectVariables = [];
    var arraySelectSubVariables = [];
    var arraySelectVariablesSubVariables = [];
    var arraySelectCuenta = [];
    var contentSelectVariable = '';
    var contentSelectSubVariable = '';
    var contentSelectVariablesSubVariable = '';
    var contentSelectCuenta = '';
    var variable;
    if(arregloVariablesTimeLine.length > 0)
        variable = arregloVariablesTimeLine[0].nombreVariable;
    for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
        if(arregloVariablesTimeLine[i].tipo.localeCompare("variable") == 0 && noExiste(arraySelectVariables, arregloVariablesTimeLine[i].nombreVariable) ) {
            if(arraySelectVariables.length == 0)
                contentSelectVariable += '<optgroup label="Variables">';
            contentSelectVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("subVariable") == 0 && noExiste(arraySelectSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectSubVariables.length == 0)
                contentSelectSubVariable += '<optgroup label="Sub-Variables">';
            contentSelectSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("varDeSubVariable") == 0 && noExiste(arraySelectVariablesSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectVariablesSubVariables.length == 0)
                contentSelectVariablesSubVariable += '<optgroup label="Variables de Sub-Variables">';
            contentSelectVariablesSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariablesSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("cuenta") == 0 && noExiste(arraySelectCuenta, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectCuenta.length == 0)
                contentSelectCuenta += '<optgroup label="Cuentas">';
            contentSelectCuenta += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectCuenta.push(arregloVariablesTimeLine[i].nombreVariable);
        }
    };
    
    if(contentSelectVariable.length > 0)
        contentSelectVariable += '</optgroup>';
    if(contentSelectSubVariable.length > 0)
        contentSelectSubVariable += '</optgroup>';
    if(contentSelectVariablesSubVariable.length > 0)
        contentSelectVariablesSubVariable += '</optgroup>';
    if(contentSelectCuenta.length > 0)
        contentSelectCuenta += '</optgroup>';

    $("#selectLineaTiempoProyecciones").empty();
    $("#selectLineaTiempoProyecciones").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoProyecciones").select2("val", variable);

    $("#selectLineaTiempoVariables1").empty();
    $("#selectLineaTiempoVariables1").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables1").select2("val", variable);
    $("#selectLineaTiempoVariables2").empty();
    $("#selectLineaTiempoVariables2").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables2").select2("val", variable);
    $("#selectLineaTiempoVariables3").empty();
    $("#selectLineaTiempoVariables3").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables3").select2("val", variable);
    $("#selectLineaTiempoVariables4").empty();
    $("#selectLineaTiempoVariables4").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectLineaTiempoVariables4").select2("val", variable);

    arregloTimeLineProyeccion1 = [];
    arregloTimeLineProyeccion2 = [];
    arregloTimeLineProyeccion3 = [];
    arregloTimeLineProyeccion4 = [];
    var proyeccion;
    if( $('#selectLineaTiempoConsolidado1').is(':checked') )
        proyeccion = 30;
    else if( $('#selectLineaTiempoConsolidado2').is(':checked') )
        proyeccion = 60;
    else if( $('#selectLineaTiempoConsolidado3').is(':checked') )
        proyeccion = 90;
    else if( $('#selectLineaTiempoConsolidado4').is(':checked') )
        proyeccion = 120;
    if(arregloTimeLineConsolidados[0] != undefined) {
        for (var i = 0; i < arregloTimeLineConsolidados[0].length; i++) {
            if(arregloTimeLineConsolidados[0][i].tipoProyeccion == proyeccion)
                arregloTimeLineProyeccion1.push([arregloTimeLineConsolidados[0][i].fecha, arregloTimeLineConsolidados[0][i].total]);
        };
    }
    if(arregloTimeLineConsolidados[1] != undefined) {
        for (var i = 0; i < arregloTimeLineConsolidados[1].length; i++) {
            if(arregloTimeLineConsolidados[1][i].tipoProyeccion == proyeccion)
                arregloTimeLineProyeccion2.push([arregloTimeLineConsolidados[1][i].fecha, arregloTimeLineConsolidados[1][i].total]);
        };
    }
    if(arregloTimeLineConsolidados[2] != undefined) {
        for (var i = 0; i < arregloTimeLineConsolidados[2].length; i++) {
            if(arregloTimeLineConsolidados[2][i].tipoProyeccion == proyeccion)
                arregloTimeLineProyeccion3.push([arregloTimeLineConsolidados[2][i].fecha, arregloTimeLineConsolidados[2][i].total]);
        };
    }
    dataTimeLine = [
        {
            label: "Activos",
            data: arregloTimeLineProyeccion1,
            last: true
        },
        {
            label: "Pasivos",
            data: arregloTimeLineProyeccion2,
            last: true
        },
        {
            label: "Créditos",
            data: arregloTimeLineProyeccion3,
            last: true
        },
        {
            label: "",
            data: arregloTimeLineProyeccion4,
            last: true
        }
    ];
    renderFlotLineChart();
}

$("input[name='selectLineaTiempoConsolidado']").on('ifChanged', function(event){
    prepareTimelineConsolidado();
});

function renderFlotLineChart () {
    var chart = $("#lineChart");
    $("#lineChart").empty();
    if (!$.isFunction($.fn.plot) || chart.length === 0) {
        return;
    }

    var o = this;
    var labelColor = chart.css('color');

    var options = {
        colors: chart.data('color').split(','),
        series: {
            shadowSize: 0,
            lines: {
                show: true,
                lineWidth: 2
            },
            points: {
                show: true,
                radius: 3,
                lineWidth: 2
            }
        },
        legend: {
            show: false
        },
        xaxis: {
            mode: "time",
            timeformat: "%b",
            color: 'rgba(0, 0, 0, 0)',
            font: {color: labelColor}
        },
        yaxis: {
            font: {color: labelColor}
        },
        grid: {
            borderWidth: 0,
            color: labelColor,
            hoverable: true
        }
    };

    chart.width('100%');
    var plot = $.plot(chart, dataTimeLine, options);

    var tip, previousPoint = null;
    chart.bind("plothover", function (event, pos, item) {
        if (item) {
            if (previousPoint !== item.dataIndex) {
                previousPoint = item.dataIndex;

                var x = item.datapoint[0];
                var y = item.datapoint[1];
                var tipLabel = '<strong>' + $(this).data('title') + '</strong>';
                var tipContent = y + " en la proyección de " + item.series.label.toLowerCase() + " el " + moment(x).format('DD/MM/YYYY');

                if (tip !== undefined) {
                    $(tip).popover('destroy');
                }
                tip = $('<div></div>').appendTo('body').css({left: item.pageX, top: item.pageY - 5, position: 'absolute'});
                tip.popover({html: true, title: tipLabel, content: tipContent, placement: 'top'}).popover('show');
            }
        }
        else {
            if (tip !== undefined) {
                $(tip).popover('destroy');
            }
            previousPoint = null;
        }
    });
}

$('#fechaInicioLineaTiempo').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});
$('#fechaFinalLineaTiempo').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});

$("input[name='lineatiempoRadio']").on('ifChanged', function(event){
    if( $('#lineatiempoProyeccion').is(':checked') ) {
        $('#selectTimeLineVariables').hide();
        $( "#selectTimeLineProyecciones" ).fadeIn( "slow", function() {
        });
        $('#selectTimeLineConsolidado').hide();
        selectTimeLineProyeccionChange();
    } else if( $('#lineatiempoVariable').is(':checked') ) {
        $('#selectTimeLineProyecciones').hide();
        $( "#selectTimeLineVariables" ).fadeIn( "slow", function() {
        });
        $('#selectTimeLineConsolidado').hide();
        selectTimeLineVariablesChange();
    } else if( $('#lineatiempoConsolidado').is(':checked') ) {
        $('#selectTimeLineProyecciones').hide();
        $('#selectTimeLineVariables').hide();
        $( "#selectTimeLineConsolidado" ).fadeIn( "slow", function() {
        });
        prepareTimelineConsolidado();
    }
});

renderSelectTimeLine();
function renderSelectTimeLine () {
    $(".select2-list").select2({
        allowClear: true
    });
}
/*                             Fin Linea de Tiempo                             */










































/*                             Bar Chart                             */
var arregloVariablesBarChart = [];
var arregloConsolidadoBarChart = [];

$('#fechaBarChart').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});

function filterBarChart () {
    var fecha = $("#fechaBarChart").datepicker('getDate');
    if (Object.prototype.toString.call(fecha) === "[object Date]") {
        if (isNaN(fecha.getTime())) {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese una fecha.",
                overlay: true,
                closeConfirm: true
            });
        } else {
            loadBarChart(fecha);
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Ingrese una fecha.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function loadBarChart (hoy) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from Totales where fecha = '"+formatDateCreation(hoy)+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err);
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Totales Bar Charts.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloVariablesBarChart = result.recordset;
                        for (var i = 0; i < arregloVariablesBarChart.length; i++) {
                            arregloVariablesBarChart[i].fecha = new Date(arregloVariablesBarChart[i].fecha.getUTCFullYear(), arregloVariablesBarChart[i].fecha.getUTCMonth(), arregloVariablesBarChart[i].fecha.getUTCDate())
                        };
                    } else {
                        arregloVariablesBarChart = [];
                    }
                    arregloConsolidadoBarChart = [];
                    arregloConsolidadoBarChart[0] = [];
                    arregloConsolidadoBarChart[1] = [];
                    arregloConsolidadoBarChart[2] = [];
                    for (var i = 0; i < arregloVariablesBarChart.length; i++) {
                        if(arregloVariablesBarChart[i].tipo.localeCompare("subVariable") == 0) {
                            if(arregloVariablesBarChart[i].tablaAplicar == 1) {
                                var pos = -1;
                                for (var j = 0; j < arregloConsolidadoBarChart[0].length; j++) {
                                    if(arregloConsolidadoBarChart[0][j].tipoProyeccion == arregloVariablesBarChart[i].tipoProyeccion && arregloConsolidadoBarChart[0][j].fecha.getDate() == arregloVariablesBarChart[i].fecha.getDate() && arregloConsolidadoBarChart[0][j].fecha.getMonth() == arregloVariablesBarChart[i].fecha.getMonth() && arregloConsolidadoBarChart[0][j].fecha.getFullYear() == arregloVariablesBarChart[i].fecha.getFullYear()) {
                                        //arregloConsolidadoBarChart[0][j].total +=arregloVariablesBarChart[i].total;
                                        pos = j;
                                        break;
                                    }
                                };
                                if(pos == -1)
                                    arregloConsolidadoBarChart[0].push({nombreVariable: "Activos", total: arregloVariablesBarChart[i].total, fecha: new Date(arregloVariablesBarChart[i].fecha.getUTCFullYear(), arregloVariablesBarChart[i].fecha.getUTCMonth(), arregloVariablesBarChart[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesBarChart[i].tipoProyeccion});
                                else
                                    arregloConsolidadoBarChart[0][pos].total += arregloVariablesBarChart[i].total;
                            } else if(arregloVariablesBarChart[i].tablaAplicar == 2) {
                                var pos = -1;
                                for (var j = 0; j < arregloConsolidadoBarChart[1].length; j++) {
                                    if(arregloConsolidadoBarChart[1][j].tipoProyeccion == arregloVariablesBarChart[i].tipoProyeccion && arregloConsolidadoBarChart[1][j].fecha.getDate() == arregloVariablesBarChart[i].fecha.getDate() && arregloConsolidadoBarChart[1][j].fecha.getMonth() == arregloVariablesBarChart[i].fecha.getMonth() && arregloConsolidadoBarChart[1][j].fecha.getFullYear() == arregloVariablesBarChart[i].fecha.getFullYear()) {
                                        //arregloConsolidadoBarChart[0][j].total +=arregloVariablesBarChart[i].total;
                                        pos = j;
                                        break;
                                    }
                                };
                                if(pos == -1)
                                    arregloConsolidadoBarChart[1].push({nombreVariable: "Pasivos", total: arregloVariablesBarChart[i].total, fecha: new Date(arregloVariablesBarChart[i].fecha.getUTCFullYear(), arregloVariablesBarChart[i].fecha.getUTCMonth(), arregloVariablesBarChart[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesBarChart[i].tipoProyeccion});
                                else
                                    arregloConsolidadoBarChart[1][pos].total += arregloVariablesBarChart[i].total;
                            } else if(arregloVariablesBarChart[i].tablaAplicar == 3) {
                                var pos = -1;
                                for (var j = 0; j < arregloConsolidadoBarChart[2].length; j++) {
                                    if(arregloConsolidadoBarChart[2][j].tipoProyeccion == arregloVariablesBarChart[i].tipoProyeccion && arregloConsolidadoBarChart[2][j].fecha.getDate() == arregloVariablesBarChart[i].fecha.getDate() && arregloConsolidadoBarChart[2][j].fecha.getMonth() == arregloVariablesBarChart[i].fecha.getMonth() && arregloConsolidadoBarChart[2][j].fecha.getFullYear() == arregloVariablesBarChart[i].fecha.getFullYear()) {
                                        //arregloConsolidadoBarChart[0][j].total +=arregloVariablesBarChart[i].total;
                                        pos = j;
                                        break;
                                    }
                                };
                                if(pos == -1)
                                    arregloConsolidadoBarChart[2].push({nombreVariable: "Créditos", total: arregloVariablesBarChart[i].total, fecha: new Date(arregloVariablesBarChart[i].fecha.getUTCFullYear(), arregloVariablesBarChart[i].fecha.getUTCMonth(), arregloVariablesBarChart[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesBarChart[i].tipoProyeccion});
                                else
                                    arregloConsolidadoBarChart[2][pos].total += arregloVariablesBarChart[i].total;
                            }
                        }
                    };
                    /*for (var i = 0; i < arregloVariablesBarChart.length; i++) {
                        Loop1:
                        for (var k = 0; k < arregloVariablesDeVariables.length; k++) {
                            if(arregloVariablesDeVariables[k].nombre.localeCompare(arregloVariablesBarChart[i].nombreVariable) == 0 && arregloVariablesDeVariables[k].tablaAplicar == 1) {
                                if(arregloConsolidadoBarChart[0] == undefined) {
                                    arregloConsolidadoBarChart[0] = [];
                                    arregloConsolidadoBarChart[0].push({nombreVariable: "Activos", total: arregloVariablesBarChart[i].total, fecha: new Date(arregloVariablesBarChart[i].fecha.getUTCFullYear(), arregloVariablesBarChart[i].fecha.getUTCMonth(), arregloVariablesBarChart[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesBarChart[i].tipoProyeccion});
                                    break Loop1;
                                } else {
                                    var entro = false;
                                    for (var j = 0; j < arregloConsolidadoBarChart[0].length; j++) {
                                        if(arregloConsolidadoBarChart[0][j].tipoProyeccion == arregloVariablesBarChart[i].tipoProyeccion && arregloConsolidadoBarChart[0][j].fecha.getDate() == arregloVariablesBarChart[i].fecha.getDate() && arregloConsolidadoBarChart[0][j].fecha.getMonth() == arregloVariablesBarChart[i].fecha.getMonth() && arregloConsolidadoBarChart[0][j].fecha.getFullYear() == arregloVariablesBarChart[i].fecha.getFullYear()) {
                                            arregloConsolidadoBarChart[0][j].total +=arregloVariablesBarChart[i].total;
                                            entro = true;
                                        }
                                    };
                                    if(!entro)
                                        arregloConsolidadoBarChart[0].push({nombreVariable: "Activos", total: arregloVariablesBarChart[i].total, fecha: new Date(arregloVariablesBarChart[i].fecha.getUTCFullYear(), arregloVariablesBarChart[i].fecha.getUTCMonth(), arregloVariablesBarChart[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesBarChart[i].tipoProyeccion});
                                    break Loop1;
                                }
                            } else if(arregloVariablesDeVariables[k].nombre.localeCompare(arregloVariablesBarChart[i].nombreVariable) == 0 && arregloVariablesDeVariables[k].tablaAplicar == 2) {
                                if(arregloConsolidadoBarChart[1] == undefined) {
                                    arregloConsolidadoBarChart[1] = [];
                                    arregloConsolidadoBarChart[1].push({nombreVariable: "Pasivos", total: arregloVariablesBarChart[i].total, fecha: new Date(arregloVariablesBarChart[i].fecha.getUTCFullYear(), arregloVariablesBarChart[i].fecha.getUTCMonth(), arregloVariablesBarChart[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesBarChart[i].tipoProyeccion});
                                    break Loop1;
                                } else {
                                    var entro = false;
                                    for (var j = 0; j < arregloConsolidadoBarChart[1].length; j++) {
                                        if(arregloConsolidadoBarChart[1][j].tipoProyeccion == arregloVariablesBarChart[i].tipoProyeccion && arregloConsolidadoBarChart[1][j].fecha.getDate() == arregloVariablesBarChart[i].fecha.getDate() && arregloConsolidadoBarChart[1][j].fecha.getMonth() == arregloVariablesBarChart[i].fecha.getMonth() && arregloConsolidadoBarChart[1][j].fecha.getFullYear() == arregloVariablesBarChart[i].fecha.getFullYear()) {
                                            arregloConsolidadoBarChart[1][j].total +=arregloVariablesBarChart[i].total;
                                            entro = true;
                                        }
                                    };
                                    if(!entro)
                                        arregloConsolidadoBarChart[1].push({nombreVariable: "Pasivos", total: arregloVariablesBarChart[i].total, fecha: new Date(arregloVariablesBarChart[i].fecha.getUTCFullYear(), arregloVariablesBarChart[i].fecha.getUTCMonth(), arregloVariablesBarChart[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesBarChart[i].tipoProyeccion});
                                    break Loop1;
                                }
                            } else if(arregloVariablesDeVariables[k].nombre.localeCompare(arregloVariablesBarChart[i].nombreVariable) == 0 && arregloVariablesDeVariables[k].tablaAplicar == 3) {
                                if(arregloConsolidadoBarChart[2] == undefined) {
                                    arregloConsolidadoBarChart[2] = [];
                                    arregloConsolidadoBarChart[2].push({nombreVariable: "Créditos", total: arregloVariablesBarChart[i].total, fecha: new Date(arregloVariablesBarChart[i].fecha.getUTCFullYear(), arregloVariablesBarChart[i].fecha.getUTCMonth(), arregloVariablesBarChart[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesBarChart[i].tipoProyeccion});
                                    break Loop1;
                                } else {
                                    var entro = false;
                                    for (var j = 0; j < arregloConsolidadoBarChart[2].length; j++) {
                                        if(arregloConsolidadoBarChart[2][j].tipoProyeccion == arregloVariablesBarChart[i].tipoProyeccion && arregloConsolidadoBarChart[2][j].fecha.getDate() == arregloVariablesBarChart[i].fecha.getDate() && arregloConsolidadoBarChart[2][j].fecha.getMonth() == arregloVariablesBarChart[i].fecha.getMonth() && arregloConsolidadoBarChart[2][j].fecha.getFullYear() == arregloVariablesBarChart[i].fecha.getFullYear()) {
                                            arregloConsolidadoBarChart[2][j].total +=arregloVariablesBarChart[i].total;
                                            entro = true;
                                        }
                                    };
                                    if(!entro)
                                        arregloConsolidadoBarChart[2].push({nombreVariable: "Créditos", total: arregloVariablesBarChart[i].total, fecha: new Date(arregloVariablesBarChart[i].fecha.getUTCFullYear(), arregloVariablesBarChart[i].fecha.getUTCMonth(), arregloVariablesBarChart[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesBarChart[i].tipoProyeccion});
                                    break Loop1;
                                }
                            }
                        };
                    };*/
                    if( $('#barchartConsolidado').is(':checked') ) {
                        prepareBarChartConsolidado();
                    } else if( $('#barchartVariable').is(':checked') ) {
                        prepareBarChartVariables();
                    }
                });
            }
        });
    }); // fin transaction
}

function prepareBarChartVariables () {
    var arraySelectVariables = [];
    var arraySelectSubVariables = [];
    var arraySelectVariablesSubVariables = [];
    var arraySelectCuenta = [];
    var contentSelectVariable = '';
    var contentSelectSubVariable = '';
    var contentSelectVariablesSubVariable = '';
    var contentSelectCuenta = '';
    var variable1, proyeccion1;
    if(arregloVariablesTimeLine.length > 0)
        variable1 = arregloVariablesTimeLine[0].nombreVariable;
    for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
        if(arregloVariablesTimeLine[i].tipo.localeCompare("variable") == 0 && noExiste(arraySelectVariables, arregloVariablesTimeLine[i].nombreVariable) ) {
            if(arraySelectVariables.length == 0)
                contentSelectVariable += '<optgroup label="Variables">';
            contentSelectVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("subVariable") == 0 && noExiste(arraySelectSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectSubVariables.length == 0)
                contentSelectSubVariable += '<optgroup label="Sub-Variables">';
            contentSelectSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("varDeSubVariable") == 0 && noExiste(arraySelectVariablesSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectVariablesSubVariables.length == 0)
                contentSelectVariablesSubVariable += '<optgroup label="Variables de Sub-Variables">';
            contentSelectVariablesSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariablesSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("cuenta") == 0 && noExiste(arraySelectCuenta, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectCuenta.length == 0)
                contentSelectCuenta += '<optgroup label="Cuentas">';
            contentSelectCuenta += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectCuenta.push(arregloVariablesTimeLine[i].nombreVariable);
        }
    };

    if(contentSelectVariable.length > 0)
        contentSelectVariable += '</optgroup>';
    if(contentSelectSubVariable.length > 0)
        contentSelectSubVariable += '</optgroup>';
    if(contentSelectVariablesSubVariable.length > 0)
        contentSelectVariablesSubVariable += '</optgroup>';
    if(contentSelectCuenta.length > 0)
        contentSelectCuenta += '</optgroup>';

    $("#selectBarChartVariables1").empty();
    $("#selectBarChartVariables1").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectBarChartVariables1").select2("val", variable1);
    $("#selectBarChartVariables2").empty();
    $("#selectBarChartVariables2").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectBarChartVariables2").select2("val", variable1);
    $("#selectBarChartVariables3").empty();
    $("#selectBarChartVariables3").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectBarChartVariables3").select2("val", variable1);
    $("#selectBarChartVariables4").empty();
    $("#selectBarChartVariables4").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectBarChartVariables4").select2("val", variable1);

    var variable1 = $("#selectBarChartVariables1").val();
    var variable2 = $("#selectBarChartVariables2").val();
    var variable3 = $("#selectBarChartVariables3").val();
    var variable4 = $("#selectBarChartVariables4").val();
    var variable1Totales = {}, variable2Totales = {}, variable3Totales = {}, variable4Totales = {};
    variable1Totales.nombreVariable = variable1;
    variable2Totales.nombreVariable = variable2;
    variable3Totales.nombreVariable = variable3;
    variable4Totales.nombreVariable = variable4;
    for (var i = 0; i < arregloVariablesBarChart.length; i++) {
        if(arregloVariablesBarChart[i].nombreVariable.localeCompare(variable1) == 0) {
            if(arregloVariablesBarChart[i].tipoProyeccion == 30)
                variable1Totales.proyeccion30 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 60)
                variable1Totales.proyeccion60 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 90)
                variable1Totales.proyeccion90 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 120)
                variable1Totales.proyeccion120 = arregloVariablesBarChart[i].total;
        }
        if(arregloVariablesBarChart[i].nombreVariable.localeCompare(variable2) == 0) {
            if(arregloVariablesBarChart[i].tipoProyeccion == 30)
                variable2Totales.proyeccion30 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 60)
                variable2Totales.proyeccion60 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 90)
                variable2Totales.proyeccion90 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 120)
                variable2Totales.proyeccion120 = arregloVariablesBarChart[i].total;
            variable2Totales.nombreVariable = arregloVariablesBarChart[i].nombreVariable;
        }
        if(arregloVariablesBarChart[i].nombreVariable.localeCompare(variable3) == 0) {
            if(arregloVariablesBarChart[i].tipoProyeccion == 30)
                variable3Totales.proyeccion30 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 60)
                variable3Totales.proyeccion60 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 90)
                variable3Totales.proyeccion90 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 120)
                variable3Totales.proyeccion120 = arregloVariablesBarChart[i].total;
            variable3Totales.nombreVariable = arregloVariablesBarChart[i].nombreVariable;
        }
        if(arregloVariablesBarChart[i].nombreVariable.localeCompare(variable4) == 0) {
            if(arregloVariablesBarChart[i].tipoProyeccion == 30)
                variable4Totales.proyeccion30 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 60)
                variable4Totales.proyeccion60 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 90)
                variable4Totales.proyeccion90 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 120)
                variable4Totales.proyeccion120 = arregloVariablesBarChart[i].total;
            variable4Totales.nombreVariable = arregloVariablesBarChart[i].nombreVariable;
        }
    };

    if(variable1Totales.proyeccion30 == undefined)
        variable1Totales.proyeccion30 = 0;
    if(variable1Totales.proyeccion60 == undefined)
        variable1Totales.proyeccion60 = 0;
    if(variable1Totales.proyeccion90 == undefined)
        variable1Totales.proyeccion90 = 0;
    if(variable1Totales.proyeccion120 == undefined)
        variable1Totales.proyeccion120 = 0;

    if(variable2Totales.proyeccion30 == undefined)
        variable2Totales.proyeccion30 = 0;
    if(variable2Totales.proyeccion60 == undefined)
        variable2Totales.proyeccion60 = 0;
    if(variable2Totales.proyeccion90 == undefined)
        variable2Totales.proyeccion90 = 0;
    if(variable2Totales.proyeccion120 == undefined)
        variable2Totales.proyeccion120 = 0;

    if(variable3Totales.proyeccion30 == undefined)
        variable3Totales.proyeccion30 = 0;
    if(variable3Totales.proyeccion60 == undefined)
        variable3Totales.proyeccion60 = 0;
    if(variable3Totales.proyeccion90 == undefined)
        variable3Totales.proyeccion90 = 0;
    if(variable3Totales.proyeccion120 == undefined)
        variable3Totales.proyeccion120 = 0;

    if(variable4Totales.proyeccion30 == undefined)
        variable4Totales.proyeccion30 = 0;
    if(variable4Totales.proyeccion60 == undefined)
        variable4Totales.proyeccion60 = 0;
    if(variable4Totales.proyeccion90 == undefined)
        variable4Totales.proyeccion90 = 0;
    if(variable4Totales.proyeccion120 == undefined)
        variable4Totales.proyeccion120 = 0;

    renderBarGraph(variable1Totales, variable2Totales, variable3Totales, variable4Totales);
}

function renderBarGraph (variable1, variable2, variable3, variable4) {
    if ($('#barChart').length > 0) {
        $('#barChart').empty();
        var data = [];
        if(variable1 != undefined) {
            var proyeccion = {};
            proyeccion.nombreVariable = variable1.nombreVariable;
            if(variable1.proyeccion30 != undefined)
                proyeccion.proyeccion30 = variable1.proyeccion30;
            if(variable1.proyeccion60 != undefined)
                proyeccion.proyeccion60 = variable1.proyeccion60;
            if(variable1.proyeccion90 != undefined)
                proyeccion.proyeccion90 = variable1.proyeccion90;
            if(variable1.proyeccion120 != undefined)
                proyeccion.proyeccion120 = variable1.proyeccion120;
            data.push(proyeccion);
        }
        if(variable2 != undefined) {
            var proyeccion = {};
            proyeccion.nombreVariable = variable2.nombreVariable;
            if(variable2.proyeccion30 != undefined)
                proyeccion.proyeccion30 = variable2.proyeccion30;
            if(variable2.proyeccion60 != undefined)
                proyeccion.proyeccion60 = variable2.proyeccion60;
            if(variable2.proyeccion90 != undefined)
                proyeccion.proyeccion90 = variable2.proyeccion90;
            if(variable2.proyeccion120 != undefined)
                proyeccion.proyeccion120 = variable2.proyeccion120;
            data.push(proyeccion);
        }
        if(variable3 != undefined) {
            var proyeccion = {};
            proyeccion.nombreVariable = variable3.nombreVariable;
            if(variable3.proyeccion30 != undefined)
                proyeccion.proyeccion30 = variable3.proyeccion30;
            if(variable3.proyeccion60 != undefined)
                proyeccion.proyeccion60 = variable3.proyeccion60;
            if(variable3.proyeccion90 != undefined)
                proyeccion.proyeccion90 = variable3.proyeccion90;
            if(variable3.proyeccion120 != undefined)
                proyeccion.proyeccion120 = variable3.proyeccion120;
            data.push(proyeccion);
        }
        if(variable4 != undefined) {
            var proyeccion = {};
            proyeccion.nombreVariable = variable4.nombreVariable;
            if(variable4.proyeccion30 != undefined)
                proyeccion.proyeccion30 = variable4.proyeccion30;
            if(variable4.proyeccion60 != undefined)
                proyeccion.proyeccion60 = variable4.proyeccion60;
            if(variable4.proyeccion90 != undefined)
                proyeccion.proyeccion90 = variable4.proyeccion90;
            if(variable4.proyeccion120 != undefined)
                proyeccion.proyeccion120 = variable4.proyeccion120;
            data.push(proyeccion);
        }
        Morris.Bar({
            element: 'barChart',
            data: data,
            xkey: 'nombreVariable',
            ykeys: ['proyeccion30', 'proyeccion60', 'proyeccion90', 'proyeccion120'],
            labels: ['30 Días', '60 Días', '90 Días', '120 Días'],
            barColors: $('#barChart').data('colors').split(',')
        });
    }
}

function prepareBarChartVariablesChange () {
    var variable1 = $("#selectBarChartVariables1").val();
    var variable2 = $("#selectBarChartVariables2").val();
    var variable3 = $("#selectBarChartVariables3").val();
    var variable4 = $("#selectBarChartVariables4").val();
    var variable1Totales = {}, variable2Totales = {}, variable3Totales = {}, variable4Totales = {};
    variable1Totales.nombreVariable = variable1;
    variable2Totales.nombreVariable = variable2;
    variable3Totales.nombreVariable = variable3;
    variable4Totales.nombreVariable = variable4;
    for (var i = 0; i < arregloVariablesBarChart.length; i++) {
        if(arregloVariablesBarChart[i].nombreVariable.localeCompare(variable1) == 0) {
            if(arregloVariablesBarChart[i].tipoProyeccion == 30)
                variable1Totales.proyeccion30 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 60)
                variable1Totales.proyeccion60 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 90)
                variable1Totales.proyeccion90 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 120)
                variable1Totales.proyeccion120 = arregloVariablesBarChart[i].total;
        }
        if(arregloVariablesBarChart[i].nombreVariable.localeCompare(variable2) == 0) {
            if(arregloVariablesBarChart[i].tipoProyeccion == 30)
                variable2Totales.proyeccion30 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 60)
                variable2Totales.proyeccion60 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 90)
                variable2Totales.proyeccion90 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 120)
                variable2Totales.proyeccion120 = arregloVariablesBarChart[i].total;
            variable2Totales.nombreVariable = arregloVariablesBarChart[i].nombreVariable;
        }
        if(arregloVariablesBarChart[i].nombreVariable.localeCompare(variable3) == 0) {
            if(arregloVariablesBarChart[i].tipoProyeccion == 30)
                variable3Totales.proyeccion30 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 60)
                variable3Totales.proyeccion60 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 90)
                variable3Totales.proyeccion90 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 120)
                variable3Totales.proyeccion120 = arregloVariablesBarChart[i].total;
            variable3Totales.nombreVariable = arregloVariablesBarChart[i].nombreVariable;
        }
        if(arregloVariablesBarChart[i].nombreVariable.localeCompare(variable4) == 0) {
            if(arregloVariablesBarChart[i].tipoProyeccion == 30)
                variable4Totales.proyeccion30 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 60)
                variable4Totales.proyeccion60 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 90)
                variable4Totales.proyeccion90 = arregloVariablesBarChart[i].total;
            else if(arregloVariablesBarChart[i].tipoProyeccion == 120)
                variable4Totales.proyeccion120 = arregloVariablesBarChart[i].total;
            variable4Totales.nombreVariable = arregloVariablesBarChart[i].nombreVariable;
        }
    };
    if(variable1Totales.proyeccion30 == undefined)
        variable1Totales.proyeccion30 = 0;
    if(variable1Totales.proyeccion60 == undefined)
        variable1Totales.proyeccion60 = 0;
    if(variable1Totales.proyeccion90 == undefined)
        variable1Totales.proyeccion90 = 0;
    if(variable1Totales.proyeccion120 == undefined)
        variable1Totales.proyeccion120 = 0;

    if(variable2Totales.proyeccion30 == undefined)
        variable2Totales.proyeccion30 = 0;
    if(variable2Totales.proyeccion60 == undefined)
        variable2Totales.proyeccion60 = 0;
    if(variable2Totales.proyeccion90 == undefined)
        variable2Totales.proyeccion90 = 0;
    if(variable2Totales.proyeccion120 == undefined)
        variable2Totales.proyeccion120 = 0;

    if(variable3Totales.proyeccion30 == undefined)
        variable3Totales.proyeccion30 = 0;
    if(variable3Totales.proyeccion60 == undefined)
        variable3Totales.proyeccion60 = 0;
    if(variable3Totales.proyeccion90 == undefined)
        variable3Totales.proyeccion90 = 0;
    if(variable3Totales.proyeccion120 == undefined)
        variable3Totales.proyeccion120 = 0;

    if(variable4Totales.proyeccion30 == undefined)
        variable4Totales.proyeccion30 = 0;
    if(variable4Totales.proyeccion60 == undefined)
        variable4Totales.proyeccion60 = 0;
    if(variable4Totales.proyeccion90 == undefined)
        variable4Totales.proyeccion90 = 0;
    if(variable4Totales.proyeccion120 == undefined)
        variable4Totales.proyeccion120 = 0;

    renderBarGraph(variable1Totales, variable2Totales, variable3Totales, variable4Totales);
}

$('#selectBarChartVariables1').on("change", function(e) {
    prepareBarChartVariablesChange();
});

$('#selectBarChartVariables2').on("change", function(e) {
    prepareBarChartVariablesChange();
});

$('#selectBarChartVariables3').on("change", function(e) {
    prepareBarChartVariablesChange();
});

$('#selectBarChartVariables4').on("change", function(e) {
    prepareBarChartVariablesChange();
});

function prepareBarChartConsolidado () {
    var arraySelectVariables = [];
    var arraySelectSubVariables = [];
    var arraySelectVariablesSubVariables = [];
    var arraySelectCuenta = [];
    var contentSelectVariable = '';
    var contentSelectSubVariable = '';
    var contentSelectVariablesSubVariable = '';
    var contentSelectCuenta = '';
    var variable1, proyeccion1;
    if(arregloVariablesTimeLine.length > 0)
        variable1 = arregloVariablesTimeLine[0].nombreVariable;
    for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
        if(arregloVariablesTimeLine[i].tipo.localeCompare("variable") == 0 && noExiste(arraySelectVariables, arregloVariablesTimeLine[i].nombreVariable) ) {
            if(arraySelectVariables.length == 0)
                contentSelectVariable += '<optgroup label="Variables">';
            contentSelectVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("subVariable") == 0 && noExiste(arraySelectSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectSubVariables.length == 0)
                contentSelectSubVariable += '<optgroup label="Sub-Variables">';
            contentSelectSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("varDeSubVariable") == 0 && noExiste(arraySelectVariablesSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectVariablesSubVariables.length == 0)
                contentSelectVariablesSubVariable += '<optgroup label="Variables de Sub-Variables">';
            contentSelectVariablesSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariablesSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("cuenta") == 0 && noExiste(arraySelectCuenta, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectCuenta.length == 0)
                contentSelectCuenta += '<optgroup label="Cuentas">';
            contentSelectCuenta += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectCuenta.push(arregloVariablesTimeLine[i].nombreVariable);
        }
    };

    if(contentSelectVariable.length > 0)
        contentSelectVariable += '</optgroup>';
    if(contentSelectSubVariable.length > 0)
        contentSelectSubVariable += '</optgroup>';
    if(contentSelectVariablesSubVariable.length > 0)
        contentSelectVariablesSubVariable += '</optgroup>';
    if(contentSelectCuenta.length > 0)
        contentSelectCuenta += '</optgroup>';

    $("#selectBarChartVariables1").empty();
    $("#selectBarChartVariables1").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectBarChartVariables1").select2("val", variable1);
    $("#selectBarChartVariables2").empty();
    $("#selectBarChartVariables2").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectBarChartVariables2").select2("val", variable1);
    $("#selectBarChartVariables3").empty();
    $("#selectBarChartVariables3").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectBarChartVariables3").select2("val", variable1);
    $("#selectBarChartVariables4").empty();
    $("#selectBarChartVariables4").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectBarChartVariables4").select2("val", variable1);

    var variable1 = "Activos";
    var variable2 = "Pasivos";
    var variable3 = "Créditos";
    var variable1Totales = {}, variable2Totales = {}, variable3Totales = {};
    for (var i = 0; i < arregloConsolidadoBarChart.length; i++) {
        for (var j = 0; j < arregloConsolidadoBarChart[i].length; j++) {
            if(arregloConsolidadoBarChart[i][j].nombreVariable.localeCompare(variable1) == 0) {
                if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 30)
                    variable1Totales.proyeccion30 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 60)
                    variable1Totales.proyeccion60 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 90)
                    variable1Totales.proyeccion90 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 120)
                    variable1Totales.proyeccion120 = arregloConsolidadoBarChart[i][j].total;
                variable1Totales.nombreVariable = arregloConsolidadoBarChart[i][j].nombreVariable;
            }
            if(arregloConsolidadoBarChart[i][j].nombreVariable.localeCompare(variable2) == 0) {
                if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 30)
                    variable2Totales.proyeccion30 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 60)
                    variable2Totales.proyeccion60 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 90)
                    variable2Totales.proyeccion90 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 120)
                    variable2Totales.proyeccion120 = arregloConsolidadoBarChart[i][j].total;
                variable2Totales.nombreVariable = arregloConsolidadoBarChart[i][j].nombreVariable;
            }
            if(arregloConsolidadoBarChart[i][j].nombreVariable.localeCompare(variable3) == 0) {
                if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 30)
                    variable3Totales.proyeccion30 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 60)
                    variable3Totales.proyeccion60 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 90)
                    variable3Totales.proyeccion90 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 120)
                    variable3Totales.proyeccion120 = arregloConsolidadoBarChart[i][j].total;
                variable3Totales.nombreVariable = arregloConsolidadoBarChart[i][j].nombreVariable;
            }
        };
    };
    if(variable1Totales.proyeccion30 == undefined)
        variable1Totales.proyeccion30 = 0;
    if(variable1Totales.proyeccion60 == undefined)
        variable1Totales.proyeccion60 = 0;
    if(variable1Totales.proyeccion90 == undefined)
        variable1Totales.proyeccion90 = 0;
    if(variable1Totales.proyeccion120 == undefined)
        variable1Totales.proyeccion120 = 0;

    if(variable2Totales.proyeccion30 == undefined)
        variable2Totales.proyeccion30 = 0;
    if(variable2Totales.proyeccion60 == undefined)
        variable2Totales.proyeccion60 = 0;
    if(variable2Totales.proyeccion90 == undefined)
        variable2Totales.proyeccion90 = 0;
    if(variable2Totales.proyeccion120 == undefined)
        variable2Totales.proyeccion120 = 0;

    if(variable3Totales.proyeccion30 == undefined)
        variable3Totales.proyeccion30 = 0;
    if(variable3Totales.proyeccion60 == undefined)
        variable3Totales.proyeccion60 = 0;
    if(variable3Totales.proyeccion90 == undefined)
        variable3Totales.proyeccion90 = 0;
    if(variable3Totales.proyeccion120 == undefined)
        variable3Totales.proyeccion120 = 0;

    renderBarGraph(variable1Totales, variable2Totales, variable3Totales, undefined);
}

function prepareBarChartConsolidadoChange () {
    var variable1 = "Activos";
    var variable2 = "Pasivos";
    var variable3 = "Créditos";
    var variable1Totales = {}, variable2Totales = {}, variable3Totales = {};
    for (var i = 0; i < arregloConsolidadoBarChart.length; i++) {
        for (var j = 0; j < arregloConsolidadoBarChart[i].length; j++) {
            if(arregloConsolidadoBarChart[i][j].nombreVariable.localeCompare(variable1) == 0) {
                if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 30)
                    variable1Totales.proyeccion30 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 60)
                    variable1Totales.proyeccion60 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 90)
                    variable1Totales.proyeccion90 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 120)
                    variable1Totales.proyeccion120 = arregloConsolidadoBarChart[i][j].total;
                variable1Totales.nombreVariable = arregloConsolidadoBarChart[i][j].nombreVariable;
            }
            if(arregloConsolidadoBarChart[i][j].nombreVariable.localeCompare(variable2) == 0) {
                if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 30)
                    variable2Totales.proyeccion30 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 60)
                    variable2Totales.proyeccion60 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 90)
                    variable2Totales.proyeccion90 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 120)
                    variable2Totales.proyeccion120 = arregloConsolidadoBarChart[i][j].total;
                variable2Totales.nombreVariable = arregloConsolidadoBarChart[i][j].nombreVariable;
            }
            if(arregloConsolidadoBarChart[i][j].nombreVariable.localeCompare(variable3) == 0) {
                if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 30)
                    variable3Totales.proyeccion30 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 60)
                    variable3Totales.proyeccion60 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 90)
                    variable3Totales.proyeccion90 = arregloConsolidadoBarChart[i][j].total;
                else if(arregloConsolidadoBarChart[i][j].tipoProyeccion == 120)
                    variable3Totales.proyeccion120 = arregloConsolidadoBarChart[i][j].total;
                variable3Totales.nombreVariable = arregloConsolidadoBarChart[i][j].nombreVariable;
            }
        };
    };
    if(variable1Totales.proyeccion30 == undefined)
        variable1Totales.proyeccion30 = 0;
    if(variable1Totales.proyeccion60 == undefined)
        variable1Totales.proyeccion60 = 0;
    if(variable1Totales.proyeccion90 == undefined)
        variable1Totales.proyeccion90 = 0;
    if(variable1Totales.proyeccion120 == undefined)
        variable1Totales.proyeccion120 = 0;

    if(variable2Totales.proyeccion30 == undefined)
        variable2Totales.proyeccion30 = 0;
    if(variable2Totales.proyeccion60 == undefined)
        variable2Totales.proyeccion60 = 0;
    if(variable2Totales.proyeccion90 == undefined)
        variable2Totales.proyeccion90 = 0;
    if(variable2Totales.proyeccion120 == undefined)
        variable2Totales.proyeccion120 = 0;

    if(variable3Totales.proyeccion30 == undefined)
        variable3Totales.proyeccion30 = 0;
    if(variable3Totales.proyeccion60 == undefined)
        variable3Totales.proyeccion60 = 0;
    if(variable3Totales.proyeccion90 == undefined)
        variable3Totales.proyeccion90 = 0;
    if(variable3Totales.proyeccion120 == undefined)
        variable3Totales.proyeccion120 = 0;

    renderBarGraph(variable1Totales, variable2Totales, variable3Totales, undefined);
}

$("input[name='barchartRadio']").on('ifChanged', function(event){
    if( $('#barchartVariable').is(':checked') ) {
        $( "#selectBarChart" ).fadeIn( "slow", function() {
        });
        prepareBarChartVariablesChange();
    } else if( $('#barchartConsolidado').is(':checked') ) {
        $('#selectBarChart').hide(500);
        prepareBarChartConsolidadoChange();
    }
});

/*                             Fin Bar Chart                             */































/*                             Donut                             */
var arregloVariablesDonut = [];
$('#fechaDonut').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});
function filterDonut () {
    var fechaInicio = $("#fechaDonut").datepicker('getDate');
    if (Object.prototype.toString.call(fechaInicio) === "[object Date]") {
        if (isNaN(fechaInicio.getTime())) {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese una fecha final.",
                overlay: true,
                closeConfirm: true
            });
        } else {
            loadDonut(fechaInicio);
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Ingrese una fecha.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function loadDonut (inicioF) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Totales where fecha = '"+formatDateCreation(inicioF)+"'", (err, result) => {
            if (err) {
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Totales Donut.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloVariablesDonut = result.recordset;
                        for (var i = 0; i < arregloVariablesDonut.length; i++) {
                            arregloVariablesDonut[i].fecha = new Date(arregloVariablesDonut[i].fecha.getUTCFullYear(), arregloVariablesDonut[i].fecha.getUTCMonth(), arregloVariablesDonut[i].fecha.getUTCDate())
                        };
                    } else {
                        arregloVariablesDonut = [];
                    }
                    prepareDonutVariables();
                });
            }
        });
    }); // fin transaction
}

function prepareDonutVariables () {
    var arraySelectVariables = [];
    var arraySelectSubVariables = [];
    var arraySelectVariablesSubVariables = [];
    var contentSelectVariable = '';
    var contentSelectSubVariable = '';
    var contentSelectVariablesSubVariable = '';
    var variable1;
    if(arregloVariablesDonut.length > 0)
        variable1 = arregloVariablesDonut[0].nombreVariable;
    for (var i = 0; i < arregloVariablesDonut.length; i++) {
        if(arregloVariablesDonut[i].tipo.localeCompare("variable") == 0 && noExiste(arraySelectVariables, arregloVariablesDonut[i].nombreVariable) ) {
            if(arraySelectVariables.length == 0)
                contentSelectVariable += '<optgroup label="Variables">';
            contentSelectVariable += '<option value="'+arregloVariablesDonut[i].nombreVariable+'">'+arregloVariablesDonut[i].nombreVariable+'</option>';
            arraySelectVariables.push(arregloVariablesDonut[i].nombreVariable);
        } else if(arregloVariablesDonut[i].tipo.localeCompare("subVariable") == 0 && noExiste(arraySelectSubVariables, arregloVariablesDonut[i].nombreVariable) && arregloVariablesDonut[i].tablaAplicar == 1) {
            if(arraySelectSubVariables.length == 0)
                contentSelectSubVariable += '<optgroup label="Sub-Variables">';
            contentSelectSubVariable += '<option value="'+arregloVariablesDonut[i].nombreVariable+'">'+arregloVariablesDonut[i].nombreVariable+'</option>';
            arraySelectSubVariables.push(arregloVariablesDonut[i].nombreVariable);
        } else if(arregloVariablesDonut[i].tipo.localeCompare("varDeSubVariable") == 0 && noExiste(arraySelectVariablesSubVariables, arregloVariablesDonut[i].nombreVariable)) {
            if(arraySelectVariablesSubVariables.length == 0)
                contentSelectVariablesSubVariable += '<optgroup label="Variables de Sub-Variables">';
            contentSelectVariablesSubVariable += '<option value="'+arregloVariablesDonut[i].nombreVariable+'">'+arregloVariablesDonut[i].nombreVariable+'</option>';
            arraySelectVariablesSubVariables.push(arregloVariablesDonut[i].nombreVariable);
        }
    };
    if(contentSelectVariable.length > 0)
        contentSelectVariable += '</optgroup>';
    if(contentSelectSubVariable.length > 0)
        contentSelectSubVariable += '</optgroup>';
    if(contentSelectVariablesSubVariable.length > 0)
        contentSelectVariablesSubVariable += '</optgroup>';

    $("#selectDonutVariables").empty();
    $("#selectDonutVariables").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable);
    $("#selectDonutVariables").select2("val", variable1);

    donutLoadData();
}

function donutLoadData () {
    var variable;
    if($('#selectDonutVariables').val() == null && arregloVariablesTimeLine.length > 0)
        variable = arregloVariablesTimeLine[0].nombreVariable;
    else
        variable = $('#selectDonutVariables').val();
    var total30, total60, total90, total120;
    var proyeccion;
    if( $('#selectDonut1').is(':checked') )
        proyeccion = 30;
    else if( $('#selectDonut2').is(':checked') )
        proyeccion = 60;
    else if( $('#selectDonut3').is(':checked') )
        proyeccion = 90;
    else if( $('#selectDonut4').is(':checked') )
        proyeccion = 120;
    var data = [];
    for (var i = 0; i < arregloVariablesDonut.length; i++) {
        if(arregloVariablesDonut[i].varPadre.localeCompare(variable) == 0 && arregloVariablesDonut[i].tipoProyeccion == proyeccion){
            if( $('#selectDonutTotal').is(':checked') ) {
                data.push({value: arregloVariablesDonut[i].total, label: arregloVariablesDonut[i].nombreVariable, formatted: (arregloVariablesDonut[i].total).toFixed(2)});
            } else {
                if( $('#selectDonutInfluencia').is(':checked') ) {
                    if( $('#selectDonutNumerador').is(':checked') ) {
                        if(arregloVariablesDonut[i].esNumerador)
                            data.push({value: ((arregloVariablesDonut[i].influenciaFormula/arregloVariablesDonut[i].denominador)*100), label: arregloVariablesDonut[i].nombreVariable, formatted: ((arregloVariablesDonut[i].influenciaFormula/arregloVariablesDonut[i].denominador)*100).toFixed(2)+"%"});
                    } else {
                        if(!arregloVariablesDonut[i].esNumerador)
                            data.push({value: (((arregloVariablesDonut[i].influenciaFormula/arregloVariablesDonut[i].denominador)*arregloVariablesDonut[i].totalRCL)*100), label: arregloVariablesDonut[i].nombreVariable, formatted: (((arregloVariablesDonut[i].influenciaFormula/arregloVariablesDonut[i].denominador)*arregloVariablesDonut[i].totalRCL)*100).toFixed(2)+"%"});
                    }
                } else if( $('#selectDonutVolumen').is(':checked') ) {
                    if( $('#selectDonutNumerador').is(':checked') ) {
                        if(arregloVariablesDonut[i].esNumerador)
                            data.push({value: ((arregloVariablesDonut[i].volumenFormula/arregloVariablesDonut[i].denominador)*100), label: arregloVariablesDonut[i].nombreVariable, formatted: ((arregloVariablesDonut[i].volumenFormula/arregloVariablesDonut[i].denominador)*100).toFixed(2)+"%"});
                    } else {
                        if(!arregloVariablesDonut[i].esNumerador)
                            data.push({value: (((arregloVariablesDonut[i].volumenFormula/arregloVariablesDonut[i].denominador)*arregloVariablesDonut[i].totalRCL)*100), label: arregloVariablesDonut[i].nombreVariable, formatted: (((arregloVariablesDonut[i].volumenFormula/arregloVariablesDonut[i].denominador)*arregloVariablesDonut[i].totalRCL)*100).toFixed(2)+"%"});
                    }
                }
            }
        }
    };
    if(data.length == 0) {
        var variableObjeto;
        for (var i = 0; i < arregloVariables.length; i++) {
            if(arregloVariables[i].variables.localeCompare(variable) == 0) {
                variableObjeto = arregloVariables[i];
                break;
            }
        };
        if((variableObjeto != undefined && variableObjeto.formula.length > 0) || (variableObjeto != undefined && variableObjeto.formula.length == 0)) {
            if(formulaGlobal.split("=")[0].localeCompare(variableObjeto.variables) == 0)
                variableObjeto.formula = formulaGlobal.split("=")[1];
            else
                variableObjeto.formula = formulaGlobal.split("=")[0];
            var partesFormula = variableObjeto.formula.split(/[-+\/*]/);
            var totalVariable = 0;
            for (var i = 0; i < partesFormula.length; i++) {
                for (var j = 0; j < arregloVariablesDonut.length; j++) {
                    partesFormula[i] = partesFormula[i].replace(")", "");
                    partesFormula[i] = partesFormula[i].replace("(", "");
                    if(partesFormula[i].localeCompare(arregloVariablesDonut[j].nombreVariable) == 0 && arregloVariablesDonut[j].tipoProyeccion == proyeccion) {
                        if( $('#selectDonutTotal').is(':checked') ) {
                            data.push({value: arregloVariablesDonut[j].total, label: arregloVariablesDonut[j].nombreVariable, formatted: (arregloVariablesDonut[j].total).toFixed(2)});
                        } else {
                            if( $('#selectDonutInfluencia').is(':checked') ) {
                                if( $('#selectDonutNumerador').is(':checked') ) {
                                    if(arregloVariablesDonut[i].esNumerador)
                                        data.push({value: ((arregloVariablesDonut[j].influenciaFormula/arregloVariablesDonut[j].denominador)*100), label: arregloVariablesDonut[j].nombreVariable, formatted: ((arregloVariablesDonut[j].influenciaFormula/arregloVariablesDonut[j].denominador)*100).toFixed(2)+"%"});
                                } else {
                                    if(!arregloVariablesDonut[i].esNumerador)
                                        data.push({value: (((arregloVariablesDonut[j].influenciaFormula/arregloVariablesDonut[j].denominador)*arregloVariablesDonut[j].totalRCL)*100), label: arregloVariablesDonut[j].nombreVariable, formatted: (((arregloVariablesDonut[j].influenciaFormula/arregloVariablesDonut[j].denominador)*arregloVariablesDonut[j].totalRCL)*100).toFixed(2)+"%"});
                                }
                            } else if( $('#selectDonutVolumen').is(':checked') ) {
                                if( $('#selectDonutNumerador').is(':checked') ) {
                                    if(arregloVariablesDonut[i].esNumerador)
                                        data.push({value: ((arregloVariablesDonut[j].volumenFormula/arregloVariablesDonut[j].denominador)*100), label: arregloVariablesDonut[j].nombreVariable, formatted: ((arregloVariablesDonut[j].volumenFormula/arregloVariablesDonut[j].denominador)*100).toFixed(2)+"%"});
                                } else {
                                    if(!arregloVariablesDonut[i].esNumerador)
                                        data.push({value: (((arregloVariablesDonut[j].volumenFormula/arregloVariablesDonut[j].denominador)*arregloVariablesDonut[j].totalRCL)*100), label: arregloVariablesDonut[j].nombreVariable, formatted: (((arregloVariablesDonut[j].volumenFormula/arregloVariablesDonut[j].denominador)*arregloVariablesDonut[j].totalRCL)*100).toFixed(2)+"%"});
                                }
                            }
                        }
                    }
                };
            };
        }
    }
    renderDonut(data);
}

function renderDonut (data) {
    if ($('#donutChart').length > 0) {
        $('#donutChart').empty();
        Morris.Donut({
            element: 'donutChart',
            data: data,
            colors: $('#donutChart').data('colors').split(','),
            formatter: function (x, data) {
                return data.formatted;
            }
        });
    }
}

$('#selectDonutVariables').on("change", function(e) {
    donutLoadData();
});

$("input[name='selectDonut']").on('ifChanged', function(event){
    donutLoadData();
});

$("input[name='selectDonutSubType']").on('ifChanged', function(event){
    donutLoadData();
});

$("input[name='selectDonutType']").on('ifChanged', function(event){
    if( $('#selectDonutTotal').is(':checked') ){
        $('#rowDonutTipo').hide(500);
    } else {
        $( "#rowDonutTipo" ).fadeIn( "slow", function() {
        });
    }
    donutLoadData();
});

/*$('#download').click(function() {
    var svg = $("#myfirstchart").html();
    canvg(document.getElementById('canvas'), svg.split("<div")[0]);
    html2canvas($("#canvas"), {
        onrendered: function(canvas) {
            var imgData = canvas.toDataURL('image/png');
            var doc = new jsPDF('p', 'mm');
            doc.addImage(imgData, 'PNG', 10, 10);
            doc.save('sample-file.pdf');
            console.log(imgData);
        }
    });
}*/
/*                             Fin Donut                             */






























/*                             Radar                             */
var arregloVariablesRadar = [];
var arregloConsolidadoRadar = [];
$('#fechaRadar').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});

function filterRadar () {
    var fecha = $("#fechaRadar").datepicker('getDate');
    if (Object.prototype.toString.call(fecha) === "[object Date]") {
        if (isNaN(fecha.getTime())) {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese una fecha.",
                overlay: true,
                closeConfirm: true
            });
        } else {
            loadRadar(fecha);
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Ingrese una fecha.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function loadRadar (fecha) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Totales where fecha = '"+formatDateCreation(fecha)+"'", (err, result) => {
            if (err) {
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Totales Radar.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloVariablesRadar = result.recordset;
                        for (var i = 0; i < arregloVariablesRadar.length; i++) {
                            arregloVariablesRadar[i].fecha = new Date(arregloVariablesRadar[i].fecha.getUTCFullYear(), arregloVariablesRadar[i].fecha.getUTCMonth(), arregloVariablesRadar[i].fecha.getUTCDate())
                        };
                    } else {
                        arregloVariablesRadar = [];
                    }
                    arregloConsolidadoRadar = [];
                    arregloConsolidadoRadar[0] = [];
                    arregloConsolidadoRadar[1] = [];
                    arregloConsolidadoRadar[2] = [];
                    for (var i = 0; i < arregloVariablesRadar.length; i++) {
                        if(arregloVariablesRadar[i].tipo.localeCompare("subVariable") == 0) {
                            if(arregloVariablesRadar[i].tablaAplicar == 1) {
                                var pos = -1;
                                for (var j = 0; j < arregloConsolidadoRadar[0].length; j++) {
                                    if(arregloConsolidadoRadar[0][j].tipoProyeccion == arregloVariablesRadar[i].tipoProyeccion && arregloConsolidadoRadar[0][j].fecha.getDate() == arregloVariablesRadar[i].fecha.getDate() && arregloConsolidadoRadar[0][j].fecha.getMonth() == arregloVariablesRadar[i].fecha.getMonth() && arregloConsolidadoRadar[0][j].fecha.getFullYear() == arregloVariablesRadar[i].fecha.getFullYear()) {
                                        //arregloConsolidadoRadar[0][j].total +=arregloVariablesRadar[i].total;
                                        pos = j;
                                        break;
                                    }
                                };
                                if(pos == -1)
                                    arregloConsolidadoRadar[0].push({nombreVariable: "Activos", total: arregloVariablesRadar[i].total, fecha: new Date(arregloVariablesRadar[i].fecha.getUTCFullYear(), arregloVariablesRadar[i].fecha.getUTCMonth(), arregloVariablesRadar[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesRadar[i].tipoProyeccion});
                                else
                                    arregloConsolidadoRadar[0][pos].total += arregloVariablesRadar[i].total;
                            } else if(arregloVariablesRadar[i].tablaAplicar == 2) {
                                var pos = -1;
                                for (var j = 0; j < arregloConsolidadoRadar[1].length; j++) {
                                    if(arregloConsolidadoRadar[1][j].tipoProyeccion == arregloVariablesRadar[i].tipoProyeccion && arregloConsolidadoRadar[1][j].fecha.getDate() == arregloVariablesRadar[i].fecha.getDate() && arregloConsolidadoRadar[1][j].fecha.getMonth() == arregloVariablesRadar[i].fecha.getMonth() && arregloConsolidadoRadar[1][j].fecha.getFullYear() == arregloVariablesRadar[i].fecha.getFullYear()) {
                                        //arregloConsolidadoRadar[0][j].total +=arregloVariablesRadar[i].total;
                                        pos = j;
                                        break;
                                    }
                                };
                                if(pos == -1)
                                    arregloConsolidadoRadar[1].push({nombreVariable: "Pasivos", total: arregloVariablesRadar[i].total, fecha: new Date(arregloVariablesRadar[i].fecha.getUTCFullYear(), arregloVariablesRadar[i].fecha.getUTCMonth(), arregloVariablesRadar[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesRadar[i].tipoProyeccion});
                                else
                                    arregloConsolidadoRadar[1][pos].total += arregloVariablesRadar[i].total;
                            } else if(arregloVariablesRadar[i].tablaAplicar == 3) {
                                var pos = -1;
                                for (var j = 0; j < arregloConsolidadoRadar[2].length; j++) {
                                    if(arregloConsolidadoRadar[2][j].tipoProyeccion == arregloVariablesRadar[i].tipoProyeccion && arregloConsolidadoRadar[2][j].fecha.getDate() == arregloVariablesRadar[i].fecha.getDate() && arregloConsolidadoRadar[2][j].fecha.getMonth() == arregloVariablesRadar[i].fecha.getMonth() && arregloConsolidadoRadar[2][j].fecha.getFullYear() == arregloVariablesRadar[i].fecha.getFullYear()) {
                                        //arregloConsolidadoRadar[0][j].total +=arregloVariablesRadar[i].total;
                                        pos = j;
                                        break;
                                    }
                                };
                                if(pos == -1)
                                    arregloConsolidadoRadar[2].push({nombreVariable: "Créditos", total: arregloVariablesRadar[i].total, fecha: new Date(arregloVariablesRadar[i].fecha.getUTCFullYear(), arregloVariablesRadar[i].fecha.getUTCMonth(), arregloVariablesRadar[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesRadar[i].tipoProyeccion});
                                else
                                    arregloConsolidadoRadar[2][pos].total += arregloVariablesRadar[i].total;
                            }
                        }
                    };
                    /*for (var i = 0; i < arregloVariablesRadar.length; i++) {
                        Loop1:
                        for (var k = 0; k < arregloVariablesDeVariables.length; k++) {
                            if(arregloVariablesDeVariables[k].nombre.localeCompare(arregloVariablesRadar[i].nombreVariable) == 0 && arregloVariablesDeVariables[k].tablaAplicar == 1) {
                                if(arregloConsolidadoRadar[0] == undefined) {
                                    arregloConsolidadoRadar[0] = [];
                                    arregloConsolidadoRadar[0].push({nombreVariable: "Activos", total: arregloVariablesRadar[i].total, fecha: new Date(arregloVariablesRadar[i].fecha.getUTCFullYear(), arregloVariablesRadar[i].fecha.getUTCMonth(), arregloVariablesRadar[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesRadar[i].tipoProyeccion});
                                    break Loop1;
                                } else {
                                    var entro = false;
                                    for (var j = 0; j < arregloConsolidadoRadar[0].length; j++) {
                                        if(arregloConsolidadoRadar[0][j].tipoProyeccion == arregloVariablesRadar[i].tipoProyeccion && arregloConsolidadoRadar[0][j].fecha.getDate() == arregloVariablesRadar[i].fecha.getDate() && arregloConsolidadoRadar[0][j].fecha.getMonth() == arregloVariablesRadar[i].fecha.getMonth() && arregloConsolidadoRadar[0][j].fecha.getFullYear() == arregloVariablesRadar[i].fecha.getFullYear()) {
                                            arregloConsolidadoRadar[0][j].total +=arregloVariablesRadar[i].total;
                                            entro = true;
                                        }
                                    };
                                    if(!entro)
                                        arregloConsolidadoRadar[0].push({nombreVariable: "Activos", total: arregloVariablesRadar[i].total, fecha: new Date(arregloVariablesRadar[i].fecha.getUTCFullYear(), arregloVariablesRadar[i].fecha.getUTCMonth(), arregloVariablesRadar[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesRadar[i].tipoProyeccion});
                                    break Loop1;
                                }
                            } else if(arregloVariablesDeVariables[k].nombre.localeCompare(arregloVariablesRadar[i].nombreVariable) == 0 && arregloVariablesDeVariables[k].tablaAplicar == 2) {
                                if(arregloConsolidadoRadar[1] == undefined) {
                                    arregloConsolidadoRadar[1] = [];
                                    arregloConsolidadoRadar[1].push({nombreVariable: "Pasivos", total: arregloVariablesRadar[i].total, fecha: new Date(arregloVariablesRadar[i].fecha.getUTCFullYear(), arregloVariablesRadar[i].fecha.getUTCMonth(), arregloVariablesRadar[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesRadar[i].tipoProyeccion});
                                    break Loop1;
                                } else {
                                    var entro = false;
                                    for (var j = 0; j < arregloConsolidadoRadar[1].length; j++) {
                                        if(arregloConsolidadoRadar[1][j].tipoProyeccion == arregloVariablesRadar[i].tipoProyeccion && arregloConsolidadoRadar[1][j].fecha.getDate() == arregloVariablesRadar[i].fecha.getDate() && arregloConsolidadoRadar[1][j].fecha.getMonth() == arregloVariablesRadar[i].fecha.getMonth() && arregloConsolidadoRadar[1][j].fecha.getFullYear() == arregloVariablesRadar[i].fecha.getFullYear()) {
                                            arregloConsolidadoRadar[1][j].total +=arregloVariablesRadar[i].total;
                                            entro = true;
                                        }
                                    };
                                    if(!entro)
                                        arregloConsolidadoRadar[1].push({nombreVariable: "Pasivos", total: arregloVariablesRadar[i].total, fecha: new Date(arregloVariablesRadar[i].fecha.getUTCFullYear(), arregloVariablesRadar[i].fecha.getUTCMonth(), arregloVariablesRadar[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesRadar[i].tipoProyeccion});
                                    break Loop1;
                                }
                            } else if(arregloVariablesDeVariables[k].nombre.localeCompare(arregloVariablesRadar[i].nombreVariable) == 0 && arregloVariablesDeVariables[k].tablaAplicar == 3) {
                                if(arregloConsolidadoRadar[2] == undefined) {
                                    arregloConsolidadoRadar[2] = [];
                                    arregloConsolidadoRadar[2].push({nombreVariable: "Créditos", total: arregloVariablesRadar[i].total, fecha: new Date(arregloVariablesRadar[i].fecha.getUTCFullYear(), arregloVariablesRadar[i].fecha.getUTCMonth(), arregloVariablesRadar[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesRadar[i].tipoProyeccion});
                                    break Loop1;
                                } else {
                                    var entro = false;
                                    for (var j = 0; j < arregloConsolidadoRadar[2].length; j++) {
                                        if(arregloConsolidadoRadar[2][j].tipoProyeccion == arregloVariablesRadar[i].tipoProyeccion && arregloConsolidadoRadar[2][j].fecha.getDate() == arregloVariablesRadar[i].fecha.getDate() && arregloConsolidadoRadar[2][j].fecha.getMonth() == arregloVariablesRadar[i].fecha.getMonth() && arregloConsolidadoRadar[2][j].fecha.getFullYear() == arregloVariablesRadar[i].fecha.getFullYear()) {
                                            arregloConsolidadoRadar[2][j].total +=arregloVariablesRadar[i].total;
                                            entro = true;
                                        }
                                    };
                                    if(!entro)
                                        arregloConsolidadoRadar[2].push({nombreVariable: "Créditos", total: arregloVariablesRadar[i].total, fecha: new Date(arregloVariablesRadar[i].fecha.getUTCFullYear(), arregloVariablesRadar[i].fecha.getUTCMonth(), arregloVariablesRadar[i].fecha.getUTCDate()), tipoProyeccion: arregloVariablesRadar[i].tipoProyeccion});
                                    break Loop1;
                                }
                            }
                        };
                    };*/
                    if( $('#radioRadarVariables').is(':checked') ) {
                        prepareRadarVariables();
                    } else if( $('#radioRadarConsolidados').is(':checked') ) {
                        prepareRadarConsolidado();
                    }
                });
            }
        });
    }); // fin transaction
}

function prepareRadarVariables () {
    var arraySelectVariables = [];
    var arraySelectSubVariables = [];
    var arraySelectVariablesSubVariables = [];
    var arraySelectCuenta = [];
    var contentSelectVariable = '';
    var contentSelectSubVariable = '';
    var contentSelectVariablesSubVariable = '';
    var contentSelectCuenta = '';
    var variable;
    if(arregloVariablesTimeLine.length > 0)
        variable = arregloVariablesTimeLine[0].nombreVariable;
    for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
        if(arregloVariablesTimeLine[i].tipo.localeCompare("variable") == 0 && noExiste(arraySelectVariables, arregloVariablesTimeLine[i].nombreVariable) ) {
            if(arraySelectVariables.length == 0)
                contentSelectVariable += '<optgroup label="Variables">';
            contentSelectVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("subVariable") == 0 && noExiste(arraySelectSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectSubVariables.length == 0)
                contentSelectSubVariable += '<optgroup label="Sub-Variables">';
            contentSelectSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("varDeSubVariable") == 0 && noExiste(arraySelectVariablesSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectVariablesSubVariables.length == 0)
                contentSelectVariablesSubVariable += '<optgroup label="Variables de Sub-Variables">';
            contentSelectVariablesSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariablesSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("cuenta") == 0 && noExiste(arraySelectCuenta, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectCuenta.length == 0)
                contentSelectCuenta += '<optgroup label="Cuentas">';
            contentSelectCuenta += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectCuenta.push(arregloVariablesTimeLine[i].nombreVariable);
        }
    };

    if(contentSelectVariable.length > 0)
        contentSelectVariable += '</optgroup>';
    if(contentSelectSubVariable.length > 0)
        contentSelectSubVariable += '</optgroup>';
    if(contentSelectVariablesSubVariable.length > 0)
        contentSelectVariablesSubVariable += '</optgroup>';
    if(contentSelectCuenta.length > 0)
        contentSelectCuenta += '</optgroup>';

    $("#selectRadar1").empty();
    $("#selectRadar1").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectRadar1").select2("val", variable);
    $("#selectRadar2").empty();
    $("#selectRadar2").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectRadar2").select2("val", variable);
    $("#selectRadar3").empty();
    $("#selectRadar3").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectRadar3").select2("val", variable);
    $("#selectRadar4").empty();
    $("#selectRadar4").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectRadar4").select2("val", variable);

    var variable1 = $("#selectRadar1").val();
    var variable2 = $("#selectRadar2").val();
    var variable3 = $("#selectRadar3").val();
    var variable4 = $("#selectRadar4").val();
    var objeto1 = {}, objeto2 = {}, objeto3 = {}, objeto4 = {};
    objeto1.nombreVariable = variable1;
    objeto2.nombreVariable = variable2;
    objeto3.nombreVariable = variable3;
    objeto4.nombreVariable = variable4;
    for (var i = 0; i < arregloVariablesRadar.length; i++) {
        if(arregloVariablesRadar[i].nombreVariable.localeCompare(variable1) == 0){
            if(arregloVariablesRadar[i].tipoProyeccion == 30)
                objeto1.valor30 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 60)
                objeto1.valor60 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 90)
                objeto1.valor90 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 120)
                objeto1.valor120 = arregloVariablesRadar[i].total;
        }
        if(arregloVariablesRadar[i].nombreVariable.localeCompare(variable2) == 0){
            if(arregloVariablesRadar[i].tipoProyeccion == 30)
                objeto2.valor30 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 60)
                objeto2.valor60 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 90)
                objeto2.valor90 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 120)
                objeto2.valor120 = arregloVariablesRadar[i].total;
        }
        if(arregloVariablesRadar[i].nombreVariable.localeCompare(variable3) == 0){
            if(arregloVariablesRadar[i].tipoProyeccion == 30)
                objeto3.valor30 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 60)
                objeto3.valor60 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 90)
                objeto3.valor90 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 120)
                objeto3.valor120 = arregloVariablesRadar[i].total;
        }
        if(arregloVariablesRadar[i].nombreVariable.localeCompare(variable4) == 0){
            if(arregloVariablesRadar[i].tipoProyeccion == 30)
                objeto4.valor30 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 60)
                objeto4.valor60 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 90)
                objeto4.valor90 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 120)
                objeto4.valor120 = arregloVariablesRadar[i].total;
        }
    };

    var data = [{
                label: objeto1.nombreVariable,
                backgroundColor: "rgba(3, 88, 106, 0.2)",
                borderColor: "rgba(3, 88, 106, 0.80)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto1.valor30, objeto1.valor60, objeto1.valor90, objeto1.valor120]
            }, {
                label: objeto2.nombreVariable,
                backgroundColor: "rgba(38, 185, 154, 0.2)",
                borderColor: "rgba(38, 185, 154, 0.85)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto2.valor30, objeto2.valor60, objeto2.valor90, objeto2.valor120]
            },{
                label: objeto3.nombreVariable,
                backgroundColor: "rgba(251, 233, 231, 0.2)",
                borderColor: "rgba(255, 138, 101, 0.80)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto3.valor30, objeto3.valor60, objeto3.valor90, objeto3.valor120]
            }, {
                label: objeto4.nombreVariable,
                backgroundColor: "rgba(237, 231, 248, 0.2)",
                borderColor: "rgba(149, 117, 205, 0.85)",
                pointColor: "rgba(38, 185, 154, 0.85)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: [objeto4.valor30, objeto4.valor60, objeto4.valor90, objeto4.valor120]
            }];

    renderRadar(data);
}

function prepareRadarVariablesChange () {
    var variable1 = $("#selectRadar1").val();
    var variable2 = $("#selectRadar2").val();
    var variable3 = $("#selectRadar3").val();
    var variable4 = $("#selectRadar4").val();
    var objeto1 = {}, objeto2 = {}, objeto3 = {}, objeto4 = {};
    objeto1.nombreVariable = variable1;
    objeto2.nombreVariable = variable2;
    objeto3.nombreVariable = variable3;
    objeto4.nombreVariable = variable4;
    for (var i = 0; i < arregloVariablesRadar.length; i++) {
        if(arregloVariablesRadar[i].nombreVariable.localeCompare(variable1) == 0){
            if(arregloVariablesRadar[i].tipoProyeccion == 30)
                objeto1.valor30 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 60)
                objeto1.valor60 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 90)
                objeto1.valor90 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 120)
                objeto1.valor120 = arregloVariablesRadar[i].total;
        }
        if(arregloVariablesRadar[i].nombreVariable.localeCompare(variable2) == 0){
            if(arregloVariablesRadar[i].tipoProyeccion == 30)
                objeto2.valor30 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 60)
                objeto2.valor60 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 90)
                objeto2.valor90 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 120)
                objeto2.valor120 = arregloVariablesRadar[i].total;
        }
        if(arregloVariablesRadar[i].nombreVariable.localeCompare(variable3) == 0){
            if(arregloVariablesRadar[i].tipoProyeccion == 30)
                objeto3.valor30 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 60)
                objeto3.valor60 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 90)
                objeto3.valor90 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 120)
                objeto3.valor120 = arregloVariablesRadar[i].total;
        }
        if(arregloVariablesRadar[i].nombreVariable.localeCompare(variable4) == 0){
            if(arregloVariablesRadar[i].tipoProyeccion == 30)
                objeto4.valor30 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 60)
                objeto4.valor60 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 90)
                objeto4.valor90 = arregloVariablesRadar[i].total;
            if(arregloVariablesRadar[i].tipoProyeccion == 120)
                objeto4.valor120 = arregloVariablesRadar[i].total;
        }
    };

    var data = [{
                label: objeto1.nombreVariable,
                backgroundColor: "rgba(3, 88, 106, 0.2)",
                borderColor: "rgba(3, 88, 106, 0.80)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto1.valor30, objeto1.valor60, objeto1.valor90, objeto1.valor120]
            }, {
                label: objeto2.nombreVariable,
                backgroundColor: "rgba(38, 185, 154, 0.2)",
                borderColor: "rgba(38, 185, 154, 0.85)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto2.valor30, objeto2.valor60, objeto2.valor90, objeto2.valor120]
            },{
                label: objeto3.nombreVariable,
                backgroundColor: "rgba(251, 233, 231, 0.2)",
                borderColor: "rgba(255, 138, 101, 0.80)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto3.valor30, objeto3.valor60, objeto3.valor90, objeto3.valor120]
            }, {
                label: objeto4.nombreVariable,
                backgroundColor: "rgba(237, 231, 248, 0.2)",
                borderColor: "rgba(149, 117, 205, 0.85)",
                pointColor: "rgba(38, 185, 154, 0.85)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: [objeto4.valor30, objeto4.valor60, objeto4.valor90, objeto4.valor120]
            }];

    renderRadar(data);
}

function renderRadar (data) {
    if ($('#radarChart').length ){
    console.log('data')
    console.log(data)
        var ctx = document.getElementById("radarChart");
        var data = {
            labels: ["30 Días", "60 Días", "90 Días", "120 Días"],
            datasets: data
        };

        var canvasRadar = new Chart(ctx, {
            type: 'radar',
            data: data,
        });
        
    }
}

$('#selectRadar1').on("change", function(e) {
    prepareRadarVariablesChange();
});

$('#selectRadar2').on("change", function(e) {
    prepareRadarVariablesChange();
});

$('#selectRadar3').on("change", function(e) {
    prepareRadarVariablesChange();
});

$('#selectRadar4').on("change", function(e) {
    prepareRadarVariablesChange();
});

$("input[name='radioRadar']").on('ifChanged', function(event){
    if( $('#radioRadarVariables').is(':checked') ) {
        $( "#selectRadar" ).fadeIn( "slow", function() {
        });
        prepareRadarVariablesChange();
    } else if( $('#radioRadarConsolidados').is(':checked') ) {
        $('#selectRadar').hide(500);
        prepareRadarConsolidadoChange();
    }
});

function prepareRadarConsolidado () {
    var arraySelectVariables = [];
    var arraySelectSubVariables = [];
    var arraySelectVariablesSubVariables = [];
    var arraySelectCuenta = [];
    var contentSelectVariable = '';
    var contentSelectSubVariable = '';
    var contentSelectVariablesSubVariable = '';
    var contentSelectCuenta = '';
    var variable;
    if(arregloVariablesTimeLine.length > 0)
        variable = arregloVariablesTimeLine[0].nombreVariable;
    for (var i = 0; i < arregloVariablesTimeLine.length; i++) {
        if(arregloVariablesTimeLine[i].tipo.localeCompare("variable") == 0 && noExiste(arraySelectVariables, arregloVariablesTimeLine[i].nombreVariable) ) {
            if(arraySelectVariables.length == 0)
                contentSelectVariable += '<optgroup label="Variables">';
            contentSelectVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("subVariable") == 0 && noExiste(arraySelectSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectSubVariables.length == 0)
                contentSelectSubVariable += '<optgroup label="Sub-Variables">';
            contentSelectSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("varDeSubVariable") == 0 && noExiste(arraySelectVariablesSubVariables, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectVariablesSubVariables.length == 0)
                contentSelectVariablesSubVariable += '<optgroup label="Variables de Sub-Variables">';
            contentSelectVariablesSubVariable += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectVariablesSubVariables.push(arregloVariablesTimeLine[i].nombreVariable);
        } else if(arregloVariablesTimeLine[i].tipo.localeCompare("cuenta") == 0 && noExiste(arraySelectCuenta, arregloVariablesTimeLine[i].nombreVariable)) {
            if(arraySelectCuenta.length == 0)
                contentSelectCuenta += '<optgroup label="Cuentas">';
            contentSelectCuenta += '<option value="'+arregloVariablesTimeLine[i].nombreVariable+'">'+arregloVariablesTimeLine[i].nombreVariable+'</option>';
            arraySelectCuenta.push(arregloVariablesTimeLine[i].nombreVariable);
        }
    };

    if(contentSelectVariable.length > 0)
        contentSelectVariable += '</optgroup>';
    if(contentSelectSubVariable.length > 0)
        contentSelectSubVariable += '</optgroup>';
    if(contentSelectVariablesSubVariable.length > 0)
        contentSelectVariablesSubVariable += '</optgroup>';
    if(contentSelectCuenta.length > 0)
        contentSelectCuenta += '</optgroup>';

    $("#selectRadar1").empty();
    $("#selectRadar1").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectRadar1").select2("val", variable);
    $("#selectRadar2").empty();
    $("#selectRadar2").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectRadar2").select2("val", variable);
    $("#selectRadar3").empty();
    $("#selectRadar3").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectRadar3").select2("val", variable);
    $("#selectRadar4").empty();
    $("#selectRadar4").append(contentSelectVariable+contentSelectSubVariable+contentSelectVariablesSubVariable+contentSelectCuenta);
    $("#selectRadar4").select2("val", variable);

    var variable1 = "Activos";
    var variable2 = "Pasivos";
    var variable3 = "Créditos";
    var objeto1 = {}, objeto2 = {}, objeto3 = {};
    objeto1.nombreVariable = variable1;
    objeto2.nombreVariable = variable2;
    objeto3.nombreVariable = variable3;
    for (var i = 0; i < arregloConsolidadoRadar.length; i++) {
        for (var j = 0; j < arregloConsolidadoRadar[i].length; j++) {
            if(arregloConsolidadoRadar[i][j].nombreVariable.localeCompare(variable1) == 0){
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 30)
                    objeto1.valor30 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 60)
                    objeto1.valor60 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 90)
                    objeto1.valor90 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 120)
                    objeto1.valor120 = arregloConsolidadoRadar[i][j].total;
            }
            if(arregloConsolidadoRadar[i][j].nombreVariable.localeCompare(variable2) == 0){
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 30)
                    objeto2.valor30 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 60)
                    objeto2.valor60 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 90)
                    objeto2.valor90 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 120)
                    objeto2.valor120 = arregloConsolidadoRadar[i][j].total;
            }
            if(arregloConsolidadoRadar[i][j].nombreVariable.localeCompare(variable3) == 0){
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 30)
                    objeto3.valor30 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 60)
                    objeto3.valor60 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 90)
                    objeto3.valor90 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 120)
                    objeto3.valor120 = arregloConsolidadoRadar[i][j].total;
            }
            if(arregloConsolidadoRadar[i][j].nombreVariable.localeCompare(variable3) == 0){
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 30)
                    objeto3.valor30 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 60)
                    objeto3.valor60 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 90)
                    objeto3.valor90 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 120)
                    objeto3.valor120 = arregloConsolidadoRadar[i][j].total;
            }
        };
    };

    var data = [{
                label: objeto1.nombreVariable,
                backgroundColor: "rgba(3, 88, 106, 0.2)",
                borderColor: "rgba(3, 88, 106, 0.80)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto1.valor30, objeto1.valor60, objeto1.valor90, objeto1.valor120]
            }, {
                label: objeto2.nombreVariable,
                backgroundColor: "rgba(38, 185, 154, 0.2)",
                borderColor: "rgba(38, 185, 154, 0.85)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto2.valor30, objeto2.valor60, objeto2.valor90, objeto2.valor120]
            },{
                label: objeto3.nombreVariable,
                backgroundColor: "rgba(251, 233, 231, 0.2)",
                borderColor: "rgba(255, 138, 101, 0.80)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto3.valor30, objeto3.valor60, objeto3.valor90, objeto3.valor120]
            }];

    renderRadar(data);
}

function prepareRadarConsolidadoChange () {
    var variable1 = "Activos";
    var variable2 = "Pasivos";
    var variable3 = "Créditos";
    var objeto1 = {}, objeto2 = {}, objeto3 = {};
    objeto1.nombreVariable = variable1;
    objeto2.nombreVariable = variable2;
    objeto3.nombreVariable = variable3;
    for (var i = 0; i < arregloConsolidadoRadar.length; i++) {
        for (var j = 0; j < arregloConsolidadoRadar[i].length; j++) {
            if(arregloConsolidadoRadar[i][j].nombreVariable.localeCompare(variable1) == 0){
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 30)
                    objeto1.valor30 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 60)
                    objeto1.valor60 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 90)
                    objeto1.valor90 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 120)
                    objeto1.valor120 = arregloConsolidadoRadar[i][j].total;
            }
            if(arregloConsolidadoRadar[i][j].nombreVariable.localeCompare(variable2) == 0){
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 30)
                    objeto2.valor30 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 60)
                    objeto2.valor60 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 90)
                    objeto2.valor90 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 120)
                    objeto2.valor120 = arregloConsolidadoRadar[i][j].total;
            }
            if(arregloConsolidadoRadar[i][j].nombreVariable.localeCompare(variable3) == 0){
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 30)
                    objeto3.valor30 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 60)
                    objeto3.valor60 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 90)
                    objeto3.valor90 = arregloConsolidadoRadar[i][j].total;
                if(arregloConsolidadoRadar[i][j].tipoProyeccion == 120)
                    objeto3.valor120 = arregloConsolidadoRadar[i][j].total;
            }
        };
    };

    var data = [{
                label: objeto1.nombreVariable,
                backgroundColor: "rgba(3, 88, 106, 0.2)",
                borderColor: "rgba(3, 88, 106, 0.80)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto1.valor30, objeto1.valor60, objeto1.valor90, objeto1.valor120]
            }, {
                label: objeto2.nombreVariable,
                backgroundColor: "rgba(38, 185, 154, 0.2)",
                borderColor: "rgba(38, 185, 154, 0.85)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto2.valor30, objeto2.valor60, objeto2.valor90, objeto2.valor120]
            },{
                label: objeto3.nombreVariable,
                backgroundColor: "rgba(251, 233, 231, 0.2)",
                borderColor: "rgba(255, 138, 101, 0.80)",
                pointBorderColor: "rgba(3, 88, 106, 0.80)",
                pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                data: [objeto3.valor30, objeto3.valor60, objeto3.valor90, objeto3.valor120]
            }];

    renderRadar(data);
}
/*                             Fin Radar                             */




























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


























/*                             Scatter                             */
/*renderScatter();
function renderScatter () {
    if ($('#scatterChart').length ){
        var theme = {
            color: [
                '#26B99A', '#34495E', '#BDC3C7', '#3498DB',
                '#9B59B6', '#8abb6f', '#759c6a', '#bfd3b7'
            ],
            title: {
                itemGap: 8,
                textStyle: {
                    fontWeight: 'normal',
                    color: '#408829'
                }
            },
            dataRange: {
                color: ['#1f610a', '#97b58d']
            },
            toolbox: {
                color: ['#408829', '#408829', '#408829', '#408829']
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.5)',
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: '#408829',
                        type: 'dashed'
                    },
                    crossStyle: {
                        color: '#408829'
                    },
                    shadowStyle: {
                        color: 'rgba(200,200,200,0.3)'
                    }
                }
            },
            dataZoom: {
                dataBackgroundColor: '#eee',
                fillerColor: 'rgba(64,136,41,0.2)',
                handleColor: '#408829'
            },
            grid: {
                borderWidth: 0
            },
            categoryAxis: {
                axisLine: {
                    lineStyle: {
                        color: '#408829'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: ['#eee']
                    }
                }
            },
            valueAxis: {
                axisLine: {
                    lineStyle: {
                        color: '#408829'
                    }
                },
                splitArea: {
                    show: true,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.1)', 'rgba(200,200,200,0.1)']
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: ['#eee']
                        }
                    }
            },
            timeline: {
                lineStyle: {
                    color: '#408829'
                },
                controlStyle: {
                    normal: {color: '#408829'},
                    emphasis: {color: '#408829'}
                }
            },
            k: {
                itemStyle: {
                    normal: {
                        color: '#68a54a',
                        color0: '#a9cba2',
                        lineStyle: {
                            width: 1,
                            color: '#408829',
                            color0: '#86b379'
                        }
                    }
                }
            },
            map: {
                itemStyle: {
                    normal: {
                        areaStyle: {
                            color: '#ddd'
                        },
                        label: {
                            textStyle: {
                                color: '#c12e34'
                            }
                        }
                    },
                    emphasis: {
                        areaStyle: {
                            color: '#99d2dd'
                        },
                        label: {
                            textStyle: {
                                color: '#c12e34'
                            }
                        }
                    }
                }
            },
            force: {
                itemStyle: {
                    normal: {
                        linkStyle: {
                            strokeColor: '#408829'
                        }
                    }
                }
            },
            chord: {
                padding: 4,
                itemStyle: {
                    normal: {
                        lineStyle: {
                            width: 1,
                            color: 'rgba(128, 128, 128, 0.5)'
                        },
                        chordStyle: {
                            lineStyle: {
                                width: 1,
                                color: 'rgba(128, 128, 128, 0.5)'
                            }
                        }
                    },
                    emphasis: {
                        lineStyle: {
                            width: 1,
                            color: 'rgba(128, 128, 128, 0.5)'
                        },
                        chordStyle: {
                            lineStyle: {
                                width: 1,
                                color: 'rgba(128, 128, 128, 0.5)'
                            }
                        }
                    }
                }
            },
            gauge: {
                startAngle: 225,
                endAngle: -45,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: [[0.2, '#86b379'], [0.8, '#68a54a'], [1, '#408829']],
                        width: 8
                    }
                },
                axisTick: {
                    splitNumber: 10,
                    length: 12,
                    lineStyle: {
                        color: 'auto'
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: 'auto'
                    }
                },
                splitLine: {
                    length: 18,
                    lineStyle: {
                        color: 'auto'
                    }
                },
                pointer: {
                    length: '90%',
                    color: 'auto'
                },
                title: {
                    textStyle: {
                        color: '#333'
                    }
                },
                detail: {
                    textStyle: {
                        color: 'auto'
                    }
                }
            },
            textStyle: {
                fontFamily: 'Arial, Verdana, sans-serif'
            }
        };
        var echartScatter = echarts.init(document.getElementById('scatterChart'), theme);

        echartScatter.setOption({
            title: {
                text: 'Scatter Graph',
                subtext: 'Heinz  2003'
            },
            tooltip: {
                trigger: 'axis',
                showDelay: 0,
                axisPointer: {
                    type: 'cross',
                    lineStyle: {
                        type: 'dashed',
                        width: 1
                    }
                }
            },
            legend: {
                data: ['Data2', 'Data1']
            },
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: {
                        show: true,
                        title: "Descargar Imagen"
                    }
                }
            },
            xAxis: [{
                type: 'value',
                scale: true,
                axisLabel: {
                    formatter: '{value} cm'
                }
            }],
                yAxis: [{
                    type: 'value',
                    scale: true,
                    axisLabel: {
                        formatter: '{value} kg'
                    }
            }],
            series: [{
                name: 'Data1',
                type: 'scatter',
                tooltip: {
                    trigger: 'item',
                    formatter: function(params) {
                        if (params.value.length > 1) {
                            return params.seriesName + ' :<br/>' + params.value[0] + 'cm ' + params.value[1] + 'kg ';
                        } else {
                            return params.seriesName + ' :<br/>' + params.name + ' : ' + params.value + 'kg ';
                        }
                    }
                },
                data: [
                    [161.2, 51.6],
                    [167.5, 59.0],
                    [159.5, 49.2],
                    [157.0, 63.0],
                    [155.8, 53.6],
                    [170.0, 59.0],
                    [159.1, 47.6],
                    [166.0, 69.8],
                    [176.2, 66.8],
                    [160.2, 75.2],
                    [172.5, 55.2],
                    [170.9, 54.2],
                    [172.9, 62.5],
                    [153.4, 42.0],
                    [160.0, 50.0],
                    [147.2, 49.8],
                    [168.2, 49.2],
                    [175.0, 73.2],
                    [157.0, 47.8],
                    [167.6, 68.8],
                    [159.5, 50.6],
                    [175.0, 82.5],
                    [166.8, 57.2],
                    [176.5, 87.8],
                    [170.2, 72.8],
                    [174.0, 54.5],
                    [173.0, 59.8],
                    [179.9, 67.3],
                    [170.5, 67.8],
                    [160.0, 47.0],
                    [154.4, 46.2],
                    [162.0, 55.0],
                    [176.5, 83.0],
                    [160.0, 54.4],
                    [152.0, 45.8],
                    [162.1, 53.6],
                    [170.0, 73.2],
                    [160.2, 52.1],
                    [161.3, 67.9],
                    [166.4, 56.6],
                    [168.9, 62.3],
                    [163.8, 58.5],
                    [167.6, 54.5],
                    [160.0, 50.2],
                    [161.3, 60.3],
                    [167.6, 58.3],
                    [165.1, 56.2],
                    [160.0, 50.2],
                    [170.0, 72.9],
                    [157.5, 59.8],
                    [167.6, 61.0],
                    [160.7, 69.1],
                    [163.2, 55.9],
                    [152.4, 46.5],
                    [157.5, 54.3],
                    [168.3, 54.8],
                    [180.3, 60.7],
                    [165.5, 60.0],
                    [165.0, 62.0],
                    [164.5, 60.3],
                    [156.0, 52.7],
                    [160.0, 74.3],
                    [163.0, 62.0],
                    [165.7, 73.1],
                    [161.0, 80.0],
                    [162.0, 54.7],
                    [166.0, 53.2],
                    [174.0, 75.7],
                    [172.7, 61.1],
                    [167.6, 55.7],
                    [151.1, 48.7],
                    [164.5, 52.3],
                    [163.5, 50.0],
                    [152.0, 59.3],
                    [169.0, 62.5],
                    [164.0, 55.7],
                    [161.2, 54.8],
                    [155.0, 45.9],
                    [170.0, 70.6],
                    [176.2, 67.2],
                    [170.0, 69.4],
                    [162.5, 58.2],
                    [170.3, 64.8],
                    [164.1, 71.6],
                    [169.5, 52.8],
                    [163.2, 59.8],
                    [154.5, 49.0],
                    [159.8, 50.0],
                    [173.2, 69.2],
                    [170.0, 55.9],
                    [161.4, 63.4],
                    [169.0, 58.2],
                    [166.2, 58.6],
                    [159.4, 45.7],
                    [162.5, 52.2],
                    [159.0, 48.6],
                    [162.8, 57.8],
                    [159.0, 55.6],
                    [179.8, 66.8],
                    [162.9, 59.4],
                    [161.0, 53.6],
                    [151.1, 73.2],
                    [168.2, 53.4],
                    [168.9, 69.0],
                    [173.2, 58.4],
                    [171.8, 56.2],
                    [178.0, 70.6],
                    [164.3, 59.8],
                    [163.0, 72.0],
                    [168.5, 65.2],
                    [166.8, 56.6],
                    [172.7, 105.2],
                    [163.5, 51.8],
                    [169.4, 63.4],
                    [167.8, 59.0],
                    [159.5, 47.6],
                    [167.6, 63.0],
                    [161.2, 55.2],
                    [160.0, 45.0],
                    [163.2, 54.0],
                    [162.2, 50.2],
                    [161.3, 60.2],
                    [149.5, 44.8],
                    [157.5, 58.8],
                    [163.2, 56.4],
                    [172.7, 62.0],
                    [155.0, 49.2],
                    [156.5, 67.2],
                    [164.0, 53.8],
                    [160.9, 54.4],
                    [162.8, 58.0],
                    [167.0, 59.8],
                    [160.0, 54.8],
                    [160.0, 43.2],
                    [168.9, 60.5],
                    [158.2, 46.4],
                    [156.0, 64.4],
                    [160.0, 48.8],
                    [167.1, 62.2],
                    [158.0, 55.5],
                    [167.6, 57.8],
                    [156.0, 54.6],
                    [162.1, 59.2],
                    [173.4, 52.7],
                    [159.8, 53.2],
                    [170.5, 64.5],
                    [159.2, 51.8],
                    [157.5, 56.0],
                    [161.3, 63.6],
                    [162.6, 63.2],
                    [160.0, 59.5],
                    [168.9, 56.8],
                    [165.1, 64.1],
                    [162.6, 50.0],
                    [165.1, 72.3],
                    [166.4, 55.0],
                    [160.0, 55.9],
                    [152.4, 60.4],
                    [170.2, 69.1],
                    [162.6, 84.5],
                    [170.2, 55.9],
                    [158.8, 55.5],
                    [172.7, 69.5],
                    [167.6, 76.4],
                    [162.6, 61.4],
                    [167.6, 65.9],
                    [156.2, 58.6],
                    [175.2, 66.8],
                    [172.1, 56.6],
                    [162.6, 58.6],
                    [160.0, 55.9],
                    [165.1, 59.1],
                    [182.9, 81.8],
                    [166.4, 70.7],
                    [165.1, 56.8],
                    [177.8, 60.0],
                    [165.1, 58.2],
                    [175.3, 72.7],
                    [154.9, 54.1],
                    [158.8, 49.1],
                    [172.7, 75.9],
                    [168.9, 55.0],
                    [161.3, 57.3],
                    [167.6, 55.0],
                    [165.1, 65.5],
                    [175.3, 65.5],
                    [157.5, 48.6],
                    [163.8, 58.6],
                    [167.6, 63.6],
                    [165.1, 55.2],
                    [165.1, 62.7],
                    [168.9, 56.6],
                    [162.6, 53.9],
                    [164.5, 63.2],
                    [176.5, 73.6],
                    [168.9, 62.0],
                    [175.3, 63.6],
                    [159.4, 53.2],
                    [160.0, 53.4],
                    [170.2, 55.0],
                    [162.6, 70.5],
                    [167.6, 54.5],
                    [162.6, 54.5],
                    [160.7, 55.9],
                    [160.0, 59.0],
                    [157.5, 63.6],
                    [162.6, 54.5],
                    [152.4, 47.3],
                    [170.2, 67.7],
                    [165.1, 80.9],
                    [172.7, 70.5],
                    [165.1, 60.9],
                    [170.2, 63.6],
                    [170.2, 54.5],
                    [170.2, 59.1],
                    [161.3, 70.5],
                    [167.6, 52.7],
                    [167.6, 62.7],
                    [165.1, 86.3],
                    [162.6, 66.4],
                    [152.4, 67.3],
                    [168.9, 63.0],
                    [170.2, 73.6],
                    [175.2, 62.3],
                    [175.2, 57.7],
                    [160.0, 55.4],
                    [165.1, 104.1],
                    [174.0, 55.5],
                    [170.2, 77.3],
                    [160.0, 80.5],
                    [167.6, 64.5],
                    [167.6, 72.3],
                    [167.6, 61.4],
                    [154.9, 58.2],
                    [162.6, 81.8],
                    [175.3, 63.6],
                    [171.4, 53.4],
                    [157.5, 54.5],
                    [165.1, 53.6],
                    [160.0, 60.0],
                    [174.0, 73.6],
                    [162.6, 61.4],
                    [174.0, 55.5],
                    [162.6, 63.6],
                    [161.3, 60.9],
                    [156.2, 60.0],
                    [149.9, 46.8],
                    [169.5, 57.3],
                    [160.0, 64.1],
                    [175.3, 63.6],
                    [169.5, 67.3],
                    [160.0, 75.5],
                    [172.7, 68.2],
                    [162.6, 61.4],
                    [157.5, 76.8],
                    [176.5, 71.8],
                    [164.4, 55.5],
                    [160.7, 48.6],
                    [174.0, 66.4],
                    [163.8, 67.3]
                ],
                markPoint: {
                    data: [{
                        type: 'max',
                        name: 'Max'
                    }, {
                        type: 'min',
                        name: 'Min'
                    }]
                },
                markLine: {
                    data: [{
                        type: 'average',
                        name: 'Mean'
                    }]
                }
            }, {
                name: 'Data2',
                type: 'scatter',
                tooltip: {
                    trigger: 'item',
                    formatter: function(params) {
                        if (params.value.length > 1) {
                            return params.seriesName + ' :<br/>' + params.value[0] + 'cm ' + params.value[1] + 'kg ';
                        } else {
                            return params.seriesName + ' :<br/>' + params.name + ' : ' + params.value + 'kg ';
                        }
                    }
                },
                data: [
                    [174.0, 65.6],
                    [175.3, 71.8],
                    [193.5, 80.7],
                    [186.5, 72.6],
                    [187.2, 78.8],
                    [181.5, 74.8],
                    [184.0, 86.4],
                    [184.5, 78.4],
                    [175.0, 62.0],
                    [184.0, 81.6],
                    [180.0, 76.6],
                    [177.8, 83.6],
                    [192.0, 90.0],
                    [176.0, 74.6],
                    [174.0, 71.0],
                    [184.0, 79.6],
                    [192.7, 93.8],
                    [171.5, 70.0],
                    [173.0, 72.4],
                    [176.0, 85.9],
                    [176.0, 78.8],
                    [180.5, 77.8],
                    [172.7, 66.2],
                    [176.0, 86.4],
                    [173.5, 81.8],
                    [178.0, 89.6],
                    [180.3, 82.8],
                    [180.3, 76.4],
                    [164.5, 63.2],
                    [173.0, 60.9],
                    [183.5, 74.8],
                    [175.5, 70.0],
                    [188.0, 72.4],
                    [189.2, 84.1],
                    [172.8, 69.1],
                    [170.0, 59.5],
                    [182.0, 67.2],
                    [170.0, 61.3],
                    [177.8, 68.6],
                    [184.2, 80.1],
                    [186.7, 87.8],
                    [171.4, 84.7],
                    [172.7, 73.4],
                    [175.3, 72.1],
                    [180.3, 82.6],
                    [182.9, 88.7],
                    [188.0, 84.1],
                    [177.2, 94.1],
                    [172.1, 74.9],
                    [167.0, 59.1],
                    [169.5, 75.6],
                    [174.0, 86.2],
                    [172.7, 75.3],
                    [182.2, 87.1],
                    [164.1, 55.2],
                    [163.0, 57.0],
                    [171.5, 61.4],
                    [184.2, 76.8],
                    [174.0, 86.8],
                    [174.0, 72.2],
                    [177.0, 71.6],
                    [186.0, 84.8],
                    [167.0, 68.2],
                    [171.8, 66.1],
                    [182.0, 72.0],
                    [167.0, 64.6],
                    [177.8, 74.8],
                    [164.5, 70.0],
                    [192.0, 101.6],
                    [175.5, 63.2],
                    [171.2, 79.1],
                    [181.6, 78.9],
                    [167.4, 67.7],
                    [181.1, 66.0],
                    [177.0, 68.2],
                    [174.5, 63.9],
                    [177.5, 72.0],
                    [170.5, 56.8],
                    [182.4, 74.5],
                    [197.1, 90.9],
                    [180.1, 93.0],
                    [175.5, 80.9],
                    [180.6, 72.7],
                    [184.4, 68.0],
                    [175.5, 70.9],
                    [180.6, 72.5],
                    [177.0, 72.5],
                    [177.1, 83.4],
                    [181.6, 75.5],
                    [176.5, 73.0],
                    [175.0, 70.2],
                    [174.0, 73.4],
                    [165.1, 70.5],
                    [177.0, 68.9],
                    [192.0, 102.3],
                    [176.5, 68.4],
                    [169.4, 65.9],
                    [182.1, 75.7],
                    [179.8, 84.5],
                    [175.3, 87.7],
                    [184.9, 86.4],
                    [177.3, 73.2],
                    [167.4, 53.9],
                    [178.1, 72.0],
                    [168.9, 55.5],
                    [157.2, 58.4],
                    [180.3, 83.2],
                    [170.2, 72.7],
                    [177.8, 64.1],
                    [172.7, 72.3],
                    [165.1, 65.0],
                    [186.7, 86.4],
                    [165.1, 65.0],
                    [174.0, 88.6],
                    [175.3, 84.1],
                    [185.4, 66.8],
                    [177.8, 75.5],
                    [180.3, 93.2],
                    [180.3, 82.7],
                    [177.8, 58.0],
                    [177.8, 79.5],
                    [177.8, 78.6],
                    [177.8, 71.8],
                    [177.8, 116.4],
                    [163.8, 72.2],
                    [188.0, 83.6],
                    [198.1, 85.5],
                    [175.3, 90.9],
                    [166.4, 85.9],
                    [190.5, 89.1],
                    [166.4, 75.0],
                    [177.8, 77.7],
                    [179.7, 86.4],
                    [172.7, 90.9],
                    [190.5, 73.6],
                    [185.4, 76.4],
                    [168.9, 69.1],
                    [167.6, 84.5],
                    [175.3, 64.5],
                    [170.2, 69.1],
                    [190.5, 108.6],
                    [177.8, 86.4],
                    [190.5, 80.9],
                    [177.8, 87.7],
                    [184.2, 94.5],
                    [176.5, 80.2],
                    [177.8, 72.0],
                    [180.3, 71.4],
                    [171.4, 72.7],
                    [172.7, 84.1],
                    [172.7, 76.8],
                    [177.8, 63.6],
                    [177.8, 80.9],
                    [182.9, 80.9],
                    [170.2, 85.5],
                    [167.6, 68.6],
                    [175.3, 67.7],
                    [165.1, 66.4],
                    [185.4, 102.3],
                    [181.6, 70.5],
                    [172.7, 95.9],
                    [190.5, 84.1],
                    [179.1, 87.3],
                    [175.3, 71.8],
                    [170.2, 65.9],
                    [193.0, 95.9],
                    [171.4, 91.4],
                    [177.8, 81.8],
                    [177.8, 96.8],
                    [167.6, 69.1],
                    [167.6, 82.7],
                    [180.3, 75.5],
                    [182.9, 79.5],
                    [176.5, 73.6],
                    [186.7, 91.8],
                    [188.0, 84.1],
                    [188.0, 85.9],
                    [177.8, 81.8],
                    [174.0, 82.5],
                    [177.8, 80.5],
                    [171.4, 70.0],
                    [185.4, 81.8],
                    [185.4, 84.1],
                    [188.0, 90.5],
                    [188.0, 91.4],
                    [182.9, 89.1],
                    [176.5, 85.0],
                    [175.3, 69.1],
                    [175.3, 73.6],
                    [188.0, 80.5],
                    [188.0, 82.7],
                    [175.3, 86.4],
                    [170.5, 67.7],
                    [179.1, 92.7],
                    [177.8, 93.6],
                    [175.3, 70.9],
                    [182.9, 75.0],
                    [170.8, 93.2],
                    [188.0, 93.2],
                    [180.3, 77.7],
                    [177.8, 61.4],
                    [185.4, 94.1],
                    [168.9, 75.0],
                    [185.4, 83.6],
                    [180.3, 85.5],
                    [174.0, 73.9],
                    [167.6, 66.8],
                    [182.9, 87.3],
                    [160.0, 72.3],
                    [180.3, 88.6],
                    [167.6, 75.5],
                    [186.7, 101.4],
                    [175.3, 91.1],
                    [175.3, 67.3],
                    [175.9, 77.7],
                    [175.3, 81.8],
                    [179.1, 75.5],
                    [181.6, 84.5],
                    [177.8, 76.6],
                    [182.9, 85.0],
                    [177.8, 102.5],
                    [184.2, 77.3],
                    [179.1, 71.8],
                    [176.5, 87.9],
                    [188.0, 94.3],
                    [174.0, 70.9],
                    [167.6, 64.5],
                    [170.2, 77.3],
                    [167.6, 72.3],
                    [188.0, 87.3],
                    [174.0, 80.0],
                    [176.5, 82.3],
                    [180.3, 73.6],
                    [167.6, 74.1],
                    [188.0, 85.9],
                    [180.3, 73.2],
                    [167.6, 76.3],
                    [183.0, 65.9],
                    [183.0, 90.9],
                    [179.1, 89.1],
                    [170.2, 62.3],
                    [177.8, 82.7],
                    [179.1, 79.1],
                    [190.5, 98.2],
                    [177.8, 84.1],
                    [180.3, 83.2],
                    [180.3, 83.2]
                ],
                markPoint: {
                    data: [{
                        type: 'max',
                        name: 'Max'
                    }, {
                        type: 'min',
                        name: 'Min'
                    }]
                },
                    markLine: {
                        data: [{
                            type: 'average',
                            name: 'Mean'
                        }]
                    }
            }]
        });
    }
}*/
/*                             Fin Scatter                             */





































//	**********		Route Change		**********
function goVariables () {
	$("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
    $("#app_root").load("src/variables.html");
}

function goHome () {
	$("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/home.html");
}

function goUsers () {
	$("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
    $("#app_root").load("src/users.html");
}

function goConnections () {
    $("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
    $("#app_root").load("src/importaciones.html");
}

function goConfig () {
    $("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
    $("#app_root").load("src/config.html");
}

function logout () {
    $("#app_full").empty();
    session.defaultSession.clearStorageData([], (data) => {});
    //cleanup();
    $("#app_full").load("src/login.html");
}

function goRCL () {
	$("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/rcl.html");
}

function goReports () {
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/reportes.html");
}

function goGraphics () {
    $("#app_root").empty();
    //cleanup();
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