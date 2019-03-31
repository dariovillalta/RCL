const electron = require('electron');
const path = require('path');
const remote = require('electron').remote;
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
		console.log('pool loaded');
        loadVariablesMainDB();
        loadVariables();
        loadVariableVariables();
        //loadAssets();
        //loadDeposits();
	}
});

var session = remote.session;

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
});

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
var activosAsignacionesIncisos = [];  //arreglo codigo de operaciones algebraicas
var entroActivosGetRules = false;   //bandera para validar que fueron traidas las reglas de activos necesarias
var entroDepositosGetRules = false;   //bandera para validar que fueron traidas las reglas de depositos necesarias
var entroPrestamosGetRules = false;   //bandera para validar que fueron traidas las reglas de prestamos necesarias
var totalesVariables = [];  //arreglo de arreglos con el total de cada variable (Variables, Subvariables, variables de alac) Eje: [[{ALAC,30DIAS},{ALAC,90DIAS}],[{SET,30DIAS},{SET,90DIAS}]]
var proyecciones = [];  //tipo de proyecciones a calcular
var entroActivosGetFromTable = false;   //bandera para validar que fueron traidas los valores de la tabla de activos
var entroDepositosGetFromTable = false;   //bandera para validar que fueron traidas los valores de la tabla de depositos
var entroPrestamosGetFromTable = false;   //bandera para validar que fueron traidas los valores de la tabla de prestamos
var equacionVariables = '';
var equacionSubVariables = '';
var fechaSeleccionada;
var arregloVarDeVarFormula = [];
var arregloActivos = [];
var arregloDepositos = [];
var arregloDeFiltros = [];
var arregloDeReglas = [];
var formulaGlobal = '';
var contadorEntrarCreateFunctionsArray = 0;
var contadorFuncionPrint = 0;

$('#fechaRCL').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});

/*function loadRules (id, idVariable) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from Reglas where variablePadre = "+id, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack MainDB Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed MainDB Variables");
                    console.log(result);
                    if(result.recordset.length > 0) {
                        var index = -1;
                        for (var i = 0; i < arregloDeComprobacionDeReglas.length; i++) {
                            if(arregloDeComprobacionDeReglas[i] == idVariable){
                                index = i;
                                break;
                            }
                        };
                        if(index == -1) {
                            console.log("11");
                            console.log("Variables Regla Padre");
                            console.log(id);
                            console.log("Variables Padre");
                            console.log(idVariable);
                            arregloDeComprobacionDeReglas.push(idVariable);
                            arregloDeReglas.push(result.recordset);
                        } else {
                            $.merge( arregloDeReglas[index], result.recordset );
                            console.log("22");
                            console.log("Variables Regla Padre");
                            console.log(id);
                            console.log("Variables Padre");
                            console.log(idVariable);
                        }
                        //arregloDeReglas.push(result.recordset);
                    }*//* else {
                        arregloDeReglas.push(null);
                        arregloDeComprobacionDeReglas.push(null);
                    }*/
                    /*contadorEntrarCreateFunctionsArray++;
                    createFunctionsArray();
                });
            }
        });
    }); // fin transaction
}*/

/*function loadRules (id, idVariable) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Reglas where variablePadre = "+id, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack MainDB Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed loadRules");
                    console.log(result);
                    if(result.recordset.length > 0) {
                        var arrReg = [], arrFil = [];
                        for (var i = 0; i < result.recordset.length; i++) {
                            if(result.recordset[i].esFiltro == '0')
                                arrReg.push(result.recordset[i]);
                            else
                                arrFil.push(result.recordset[i]);
                        };
                        arregloDeReglas.push(arrReg);
                        arregloDeFiltros.push(arrFil);
                    } else {
                        arregloDeReglas.push([]);
                        arregloDeFiltros.push([]);
                    }
                    contadorEntrarCreateFunctionsArray++;
                    createFunctionsArray();
                });
            }
        });
    }); // fin transaction
}*/

function loadRules (id, i, j, k, tipo) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Reglas where variablePadre = "+id, (err, result) => {
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
                        }
                    }
                    if(tipo == 1) {
                        entroActivosGetRules = true;
                        contadorActivosReglasDespues++;
                        divideAssetsRules();
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
                    } else {
                        $("#formulas").text("$$f(x)$$");
                        MathLive.renderMathInDocument();
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
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true
        });
        const request = new sql.Request(transaction);
        request.query("select * from Activos", (err, result) => {
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
                    } else {
                        arregloActivos = [];
                    }
                    console.log('arregloActivos');
                    console.log(arregloActivos);
                    entroActivosGetFromTable = true;
                    if(variablesAgrupadas[1].length > 0)
                        loadDeposits();
                    /*else if(variablesAgrupadas[2].length > 0)
                        loadCredit();*/
                    else
                        createMethods();
                });
            }
        });
    }); // fin transaction
}

function loadDeposits () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true
        });
        const request = new sql.Request(transaction);
        request.query("select * from Depositos", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Depositos');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            } else {
                transaction.commit(err => {
                    console.log("Transaction committed MainDB Variables");
                    console.log(result);
                    if(result.recordset.length > 0){
                        arregloDepositos = result.recordset;
                        console.log('arregloDepositos');
                        console.log(arregloDepositos);
                    } else {
                        arregloDepositos = [];
                    }
                    entroDepositosGetFromTable = true;
                    //entroPrestamosGetFromTable
                    console.log("DADADADADADADDA");
                    if(variablesAgrupadas[2].length > 0)
                        loadCredit();
                    else {
                        console.log("SIIIIIIUUU");
                        createMethods();
                    }
                });
            }
        });
    }); // fin transaction
}







//	**********		Calculo RCL		**********
function checkFormulaExists () {
    proyecciones = [];
    $("input[name='dias']:checked").each(function() {
        proyecciones.push($(this).val());
    });
    if(proyecciones.length > 0) {
        fechaSeleccionada = $("#fechaRCL").datepicker('getDate');
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
                    for (var i = 0; i < formulaGlobal.length; i++) {
                        if(formulaGlobal.charAt(i) != "(" && formulaGlobal.charAt(i) != ")" && formulaGlobal.charAt(i) != "<" && formulaGlobal.charAt(i) != ">" && 
                            formulaGlobal.charAt(i) != "!" && formulaGlobal.charAt(i) != "=" && formulaGlobal.charAt(i) != "/" && formulaGlobal.charAt(i) != "*" && 
                            formulaGlobal.charAt(i) != "√" && formulaGlobal.charAt(i) != "+" && formulaGlobal.charAt(i) != "-" && isNaN(formulaGlobal.charAt(i))) {
                            var pal = getVariable(formulaGlobal, i);
                            variablesDeEquacion.push(pal);
                            i+=pal.length;
                        }
                    };
                    searchAndCreateArrays();
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
    variablesSolas = [];
    subvariablesSolas = [];
    variablesDeSubVariablesSolas = [];
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
                    variablesSolas[t].push({ID: arregloVariables[i].ID, variable: arregloVariables[i].variables, formula: arregloVariables[i].formula, tipoProyeccion: proyecciones[t], total: 0, dia: fechaSeleccionada});
                }
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
                        subvariablesSolas[t][j].push({ID: arregloVariablesDeVariables[k].ID, variable: arregloVariablesDeVariables[k].nombre, factor: arregloVariablesDeVariables[k].factor, tablaAplicar: arregloVariablesDeVariables[k].tablaAplicar, tipoProyeccion: proyecciones[t], total: 0, dia: fechaSeleccionada});
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
    console.log(variablesSolas);
    console.log(subvariablesSolas);
}

function groupArray () {
    /*for (var i = 0; i < subvariablesSolas.length; i++) {
        variablesAgrupadas[i] = [];
        console.log('antes');
        console.log(variablesAgrupadas[i]);
        for (var j = 0; j < subvariablesSolas[i].length; j++) {
            if(variablesAgrupadas[i][j] == undefined)
                variablesAgrupadas[i][j] = [];
            console.log('antes');
            console.log(variablesAgrupadas[i][j]);
            for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                //variablesAgrupadas[i][j][k]
                console.log(variablesAgrupadas[i][j]);
                variablesAgrupadas[i][j].push(subvariablesSolas[i][j][k]);
            };
        };
    };*/
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
    /*console.log('variablesAgrupadas');
    console.log(variablesAgrupadas);*/

    var fechaSeleccionada = $("#fechaRCL").datepicker('getDate');

    /* **** ACTIVOS **** */
    contadorActivosReglasAntes = 0;
    contadorActivosReglasDespues = 0;
    entroActivosGetRules = false;
    entroDepositosGetRules = false;
    entroPrestamosGetRules = false;
    if(variablesAgrupadas[1].length == 0) {
        entroDepositosGetRules = true;
        //divideAssetsRules();
        checkLoadRules();
    }
    if(variablesAgrupadas[2].length == 0) {
        entroPrestamosGetRules = true;
        //divideAssetsRules();
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
                    //totalesVariables.push([{variable:variablesAgrupadas[0][i].nombre, total:0, dia: fechaSeleccionada, tipoProyeccion: 0, denominador:0, numerador:0, tablaTipo:1}]);
                } else if(subvariablesSolas[i][j][k].tablaAplicar == 2) {
                    //
                }
            };
        };
    };
    console.log('reglasActivos')
    console.log(reglasActivos)
    console.log('activosInstanciasIncisos')
    console.log(activosInstanciasIncisos)
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
        console.log('reglasActivos')
        console.log(reglasActivos)
        var fechaSeleccionada = $("#fechaRCL").datepicker('getDate');
        for (var i = 0; i < reglasActivos.length; i++) {
            if(reglasActivos[i] != undefined) {
                for (var j = 0; j < reglasActivos[i].length; j++) {
                    if(reglasActivos[i][j] != undefined) {
                        for (var k = 0; k < reglasActivos[i][j].length; k++) {
                            if(reglasActivos[i][j][k] != undefined) {
                                for (var n = 0; n < reglasActivos[i][j][k].length; n++) {
                                    if(reglasActivos[i][j][k][n] != undefined) {
                                        if (reglasActivos[i][j][k][n].campoObjetivo.indexOf("INSTANCIACION") == 0) {
                                            if(activosInstanciasSubVariables[(i*reglasActivos[i][j].length)+k] != undefined)
                                                activosInstanciasSubVariables[(i*reglasActivos[i][j].length)+k].push({codigo:"\tvar "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: subvariablesSolas[i][j][k].variable, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                            else {
                                                activosInstanciasSubVariables[(i*reglasActivos[i][j].length)+k] = [];
                                                activosInstanciasSubVariables[(i*reglasActivos[i][j].length)+k].push({codigo:"\tvar "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: subvariablesSolas[i][j][k].variable, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                            }
                                            if(activosInstanciasVarReglas[(i*reglasActivos[i][j].length)+k] != undefined) {
                                                if(activosInstanciasVarReglas[(i*reglasActivos[i][j][k].length)+n] != undefined) {
                                                    activosInstanciasVarReglas[(i*reglasActivos[i][j][k].length)+n].push({codigo:"\tvar "+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                                    if(variablesDeSubVariablesSolas[i][j][k] == undefined)
                                                    variablesDeSubVariablesSolas[i][j][k] = [];
                                                    variablesDeSubVariablesSolas[i][j][k].push({codigo:"\tvar "+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                                } else {
                                                    activosInstanciasVarReglas[(i*reglasActivos[i][j][k].length)+n] = [];
                                                    activosInstanciasVarReglas[(i*reglasActivos[i][j][k].length)+n].push({codigo:"\tvar "+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                                    if(variablesDeSubVariablesSolas[i][j][k] == undefined)
                                                    variablesDeSubVariablesSolas[i][j][k] = [];
                                                    variablesDeSubVariablesSolas[i][j][k].push({codigo:"\tvar "+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                                }
                                            } else {
                                                activosInstanciasVarReglas[(i*reglasActivos[i][j].length)+k] = [];
                                                activosInstanciasVarReglas[(i*reglasActivos[i][j].length)+k].push([]);
                                                activosInstanciasVarReglas[(i*reglasActivos[i][j].length)+k][0].push({codigo:"\tvar "+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                                if(variablesDeSubVariablesSolas[i][j][k] == undefined)
                                                    variablesDeSubVariablesSolas[i][j][k] = [];
                                                variablesDeSubVariablesSolas[i][j][k].push({codigo:"\tvar "+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                            }
                                            var listaCuentas = reglasActivos[i][j][k][n].valor.split("=")[1].split(",");
                                            for (var l = 0; l < listaCuentas.length; l++) {
                                                activosCuerpo.push("\tif ( arregloActivos[i].cuenta.localeCompare('"+listaCuentas[l]+"') == 0 ) {")
                                                activosCuerpo.push("\t\tvar saldoConFactor = arregloActivos[i].saldo * getFactor("+reglasActivos[i][j][k][n].variablePadre+");");
                                                activosCuerpo.push("\t\t"+reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion+"+=saldoConFactor;");
                                                activosCuerpo.push("\t\tinsertarVolumen(arregloActivos[i].cuenta, arregloActivos[i].saldo);");
                                                activosCuerpo.push("\t\tinsertarInfluencia(arregloActivos[i].cuenta, arregloActivos[i].saldo);");
                                                activosCuerpo.push("\t}");
                                            };
                                            var pos = activosAsignacionesIncisosContieneVar(variablesSolas[i][j].variable, variablesSolas[i][j].tipoProyeccion);
                                            if( pos >= 0) {
                                                activosAsignacionesIncisos[pos].codigo+="+"+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion;
                                            } else {
                                                activosAsignacionesIncisos.push({codigo: variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion+"="+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, variable: variablesSolas[i][j].variable+variablesSolas[i][j].tipoProyeccion, nombreVariable: variablesSolas[i][j].variable, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});
                                            }
                                        } else {
                                            if(activosAlgebraica[(i*reglasActivos[i][j].length)+k] != undefined) {
                                                if(activosAlgebraica[(i*reglasActivos[i][j][k].length)+n] != undefined) {
                                                    activosAlgebraica[(i*reglasActivos[i][j][k].length)+n].push({codigo:"\t"+reglasActivos[i][j][k][n].campoObjetivo.split("=")[1]+" "+reglasActivos[i][j][k][n].operacion+" "+reglasActivos[i][j][k][n].valor.split("=")[1]+";", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                                } else {
                                                    activosAlgebraica[(i*reglasActivos[i][j][k].length)+n] = [];
                                                    activosAlgebraica[(i*reglasActivos[i][j][k].length)+n].push({codigo:"\t"+reglasActivos[i][j][k][n].campoObjetivo.split("=")[1]+" "+reglasActivos[i][j][k][n].operacion+" "+reglasActivos[i][j][k][n].valor.split("=")[1]+";", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                                }
                                            } else {
                                                activosAlgebraica[(i*reglasActivos[i][j].length)+k] = [];
                                                activosAlgebraica[(i*reglasActivos[i][j].length)+k].push([]);
                                                activosAlgebraica[(i*reglasActivos[i][j].length)+k][0].push({codigo:"\t"+reglasActivos[i][j][k][n].campoObjetivo.split("=")[1]+" "+reglasActivos[i][j][k][n].operacion+" "+reglasActivos[i][j][k][n].valor.split("=")[1]+";", variable:reglasActivos[i][j][k][n].variables+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: reglasActivos[i][j][k][n].variables, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                                            }
                                            /*if(activosAlgebraica[i] == undefined)
                                                activosAlgebraica[i] = [];
                                            activosAlgebraica[i].push({codigo:reglasActivos[i][j].campoObjetivo.split("=")[1]+" "+reglasActivos[i][j].operacion+" "+reglasActivos[i][j].valor.split("=")[1]+";", variable: reglasActivos[i][j].variables, orden:reglasActivos[i][j].orden, nombreVariable: reglasActivos[i][j].variables, tipoProyeccion: variablesSolas[i][j].tipoProyeccion});*/
                                        }
                                    }
                                };
                            }
                        };
                    }
                };
            }
        };
        /*for (var i = 0; i < reglasActivos.length; i++) {
            for (var j = 0; j < reglasActivos[i].length; j++) {
                if (reglasActivos[i][j].campoObjetivo.indexOf("INSTANCIACION") == 0) {
                    if(activosInstanciasSubVariables[i] != undefined)
                        activosInstanciasSubVariables[i].push({codigo:"\tvar "+reglasActivos[i][j].variables+" = 0;", variable:reglasActivos[i][j].variables, orden:reglasActivos[i][j].orden});
                    else {
                        activosInstanciasSubVariables[i] = [];
                        activosInstanciasSubVariables[i].push({codigo:"\tvar "+reglasActivos[i][j].variables+" = 0;", variable:reglasActivos[i][j].variables, orden:reglasActivos[i][j].orden});
                    }
                    totalesVariables.push([{variable:reglasActivos[i][j].variables, total:0, dia: fechaSeleccionada, tipoProyeccion: 0, denominador:0, numerador:0, tablaTipo:1}]);
                    var listaCuentas = reglasActivos[i][j].valor.split("=")[1].split(",");
                    for (var k = 0; k < listaCuentas.length; k++) {
                        activosCuerpo.push("\tif ( arregloActivos[i].cuenta.localeCompare('"+listaCuentas[k]+"') == 0 ) {")
                        activosCuerpo.push("\t\tvar saldoConFactor = arregloActivos[i].saldo * getFactor("+reglasActivos[i][j].variablePadre+");");
                        activosCuerpo.push("\t\t"+reglasActivos[i][j].variables+"+=saldoConFactor;");
                        activosCuerpo.push("\t\tinsertarVolumen(arregloActivos[i].cuenta, arregloActivos[i].saldo);");
                        activosCuerpo.push("\t\tinsertarInfluencia(arregloActivos[i].cuenta, arregloActivos[i].saldo);");
                        activosCuerpo.push("\t}");
                    };
                } else {
                    if(activosAlgebraica[i] != undefined)
                        activosAlgebraica[i].push({codigo:reglasActivos[i][j].campoObjetivo.split("=")[1]+" "+reglasActivos[i][j].operacion+" "+reglasActivos[i][j].valor.split("=")[1]+";", variable:reglasActivos[i][j].variables, orden:reglasActivos[i][j].orden});
                    else {
                        activosAlgebraica[i] = [];
                        activosAlgebraica[i].push({codigo:reglasActivos[i][j].campoObjetivo.split("=")[1]+" "+reglasActivos[i][j].operacion+" "+reglasActivos[i][j].valor.split("=")[1]+";", variable:reglasActivos[i][j].variables, orden:reglasActivos[i][j].orden});
                    }
                }
            };
        };*/
        if(activosInstanciasSubVariables.length == 0) {
            for (var i = 0; i < subvariablesSolas.length; i++) {
                for (var j = 0; j < subvariablesSolas[i].length; j++) {
                    for (var k = 0; k < subvariablesSolas[i][j].length; k++) {
                        if(activosInstanciasSubVariables[(i*subvariablesSolas[i][j].length)+k] != undefined) {
                            activosInstanciasSubVariables[(i*subvariablesSolas[i][j].length)+k].push({codigo:"\tvar "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: subvariablesSolas[i][j][k].variable, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                        } else {
                            activosInstanciasSubVariables[(i*subvariablesSolas[i][j].length)+k] = [];
                            activosInstanciasSubVariables[(i*subvariablesSolas[i][j].length)+k].push({codigo:"\tvar "+subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion+" = 0;", variable:subvariablesSolas[i][j][k].variable+subvariablesSolas[i][j][k].tipoProyeccion, orden: subvariablesSolas[i][j][k].orden, nombreVariable: subvariablesSolas[i][j][k].variable, tipoProyeccion: subvariablesSolas[i][j][k].tipoProyeccion});
                        }
                    };
                };
            };
        }
        checkLoadRules();
        console.log('activosInstanciasIncisos')
        console.log(activosInstanciasIncisos)
        console.log('activosInstanciasSubVariables')
        console.log(activosInstanciasSubVariables)
        console.log('activosCuerpo')
        console.log(activosCuerpo)
        console.log('activosAlgebraica')
        console.log(activosAlgebraica)
        console.log('activosAsignacionesIncisos')
        console.log(activosAsignacionesIncisos)
        console.log('activosInstanciasVarReglas')
        console.log(activosInstanciasVarReglas)
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

function checkLoadRules () {
    if(entroActivosGetRules && entroDepositosGetRules && entroPrestamosGetRules) {
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
        }/*else if(variablesAgrupadas[2].length > 0)
            loadCredit();*/
    }
}

function createMethods () {
    if(entroActivosGetFromTable && entroDepositosGetFromTable && entroPrestamosGetFromTable) {
        var contentAssets = '';
        contentAssets = createAssetsRCL();
        var contentLoans = '';
        var contentDeposits = '';
        console.log('contentAssets');
        console.log(contentAssets);
        if(variablesAgrupadas[2].length > 0)    //prestamos
            contentLoans+="window['ActivosRCL']();";
        else if(variablesAgrupadas[1].length > 0)    //depositos
            contentDeposits+="window['ActivosRCL']();";
        else                                            //activos
            contentAssets+="window['ActivosRCL']();";
    }
    /*var proyecciones = [];
    $("input[name='dias']:checked").each(function() {
        proyecciones.push($(this).val());
    });

    //Contenido Activos
    var contentAssets = "\n";
    for (var i = 0; i < activosInstanciasIncisos.length; i++) {
        contentAssets+=activosInstanciasIncisos[i].codigo+"\n";
    };
    for (var i = 0; i < activosInstanciasVariablesDeIncisos.length; i++) {
        for (var j = 0; j < activosInstanciasVariablesDeIncisos[i].length; j++) {
            contentAssets+=activosInstanciasVariablesDeIncisos[i][j].codigo+"\n";
        };
    };
    contentAssets+="\tfor ( var i = 0; i < arregloActivos.length; i++ ) {\n";
    for (var i = 0; i < activosCuerpo.length; i++) {
        contentAssets+="\t"+activosCuerpo[i]+"\n";
    };
    contentAssets+="\t}\n";
    var contentAssetsFinal = '';

    for (var i = 0; i < proyecciones.length; i++) {
        var fechaProyeccion = proyecciones[i];
        for (var j = 0; j < totalesVariables.length; j++) {
            if(totalesVariables[j][totalesVariables[j].length-1].tipoProyeccion == 0 && totalesVariables[j][totalesVariables[j].length-1].tablaTipo != 1) {
                totalesVariables[j][totalesVariables[j].length-1].tipoProyeccion = proyecciones[i];
            } else if(totalesVariables[j][totalesVariables[j].length-1].tablaTipo != 1) {
                var temp = jQuery.extend(true, {}, totalesVariables[j][totalesVariables[j].length-1]);
                totalesVariables[j].push(temp);
                totalesVariables[j][totalesVariables[j].length-1].tipoProyeccion = proyecciones[i];
            }
        };
        contentAssetsFinal+=createAssetsRCL(contentAssetsFinal, proyecciones[i]);
    };
    contentAssets+=contentAssetsFinal;*/

    window['ActivosRCL'] = new Function(
         'return function anonActivos(){'+
                contentAssets+
        '}'
    )();
    console.log(window['ActivosRCL']);

    runFunctions();
}

function createAssetsRCL () {
    var content = '';
    for (var i = 0; i < activosInstanciasIncisos.length; i++) {
        content+=activosInstanciasIncisos[i].codigo+"\n";
    };
    for (var i = 0; i < activosInstanciasSubVariables.length; i++) {
        for (var j = 0; j < activosInstanciasSubVariables[i].length; j++) {
            content+=activosInstanciasSubVariables[i][j].codigo+"\n";
        };
    };
    for (var i = 0; i < activosInstanciasVarReglas.length; i++) {
        if(activosInstanciasVarReglas[i] != undefined) {
            for (var j = 0; j < activosInstanciasVarReglas[i].length; j++) {
                if(activosInstanciasVarReglas[i][j] != undefined) {
                    for (var k = 0; k < activosInstanciasVarReglas[i][j].length; k++) {
                        content+=activosInstanciasVarReglas[i][j][k].codigo+"\n";
                    };
                }
            };
        }
    };
    for (var i = 0; i < activosCuerpo.length; i++) {
        content+=activosCuerpo[i]+"\n";
    };
    /*console.log('variablesDeSubVariablesSolas');
    console.log(variablesDeSubVariablesSolas);
    for (var i = 0; i < variablesDeSubVariablesSolas.length; i++) {
        for (var j = 0; j < variablesDeSubVariablesSolas[i].length; j++) {
            for (var k = 0; k < variablesDeSubVariablesSolas[i][j].length; k++) {
                for (var n = 0; n < variablesDeSubVariablesSolas[i][j][k].length; n++) {
                    content+=variablesDeSubVariablesSolas[i][j][k][n].nombreVariable+"\n";
                    content+="\t"+"saveVariable('"+variablesDeSubVariablesSolas[i][j][k][n].nombreVariable+"', "+variablesDeSubVariablesSolas[i][j][k][n].tipoProyeccion+", "+variablesDeSubVariablesSolas[i][j][k][n].variable+");\n";
                };
            };
        };
    };*/
    if(activosAlgebraica.length>0) {
        for (var i = 0; i < activosAlgebraica.length; i++) {
            if(activosAlgebraica[i] != undefined) {
                for (var j = 0; j < activosAlgebraica[i].length; j++) {
                    if(activosAlgebraica[i][j] != undefined) {
                        for (var k = 0; k < activosAlgebraica[i][j].length; k++) {
                            if(activosAlgebraica[i] != undefined && activosAlgebraica[i][j] != undefined && activosAlgebraica[i][j][k] != undefined) {
                                console.log(activosAlgebraica[i])
                                console.log(activosAlgebraica[i][j])
                                console.log(activosAlgebraica[i][j][k])
                                activosAlgebraica[i][j].sort(function(a, b){
                                    if(a.orden < b.orden) { return -1; }
                                    if(a.orden > b.orden) { return 1; }
                                    return 0;
                                });
                                activosInstanciasVarReglas[i].sort(function(a, b){
                                    if(a.orden < b.orden) { return -1; }
                                    if(a.orden > b.orden) { return 1; }
                                    return 0;
                                });
                                for (var j = 0; j < activosAlgebraica[i][j][k].length; j++) {
                                    content+="\tvar "+activosAlgebraica[i][j].variable+" = "+activosAlgebraica[i][j].codigo+"\n";
                                };
                                var mayor = activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].orden;
                                if(mayor < activosAlgebraica[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].orden) {
                                    content+="\t"+activosInstanciasSubVariables[i][j].variable+" = "+activosAlgebraica[i][j][k][activosAlgebraica[i][j][k].length-1].variable+";\n"
                                } else {
                                    content+="\t"+activosInstanciasSubVariables[i][j].variable+" = "+activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].variable+";\n"
                                }
                                content+="\t"+"saveVariable('"+activosInstanciasSubVariables[i][j].nombreVariable+"', "+activosInstanciasSubVariables[i][j].tipoProyeccion+", "+activosInstanciasSubVariables[i][j].variable+");\n";
                            } else if(activosInstanciasVarReglas[i] != undefined && activosInstanciasVarReglas[i][j] != undefined && activosInstanciasVarReglas[i][j][k] != undefined && (activosAlgebraica[i] == undefined || activosAlgebraica[i][j] == undefined || activosAlgebraica[i][j][k] == undefined)) {
                                activosInstanciasVarReglas[i][j][k].sort(function(a, b){
                                    if(a.orden < b.orden) { return -1; }
                                    if(a.orden > b.orden) { return 1; }
                                    return 0;
                                });
                                content+="\t"+activosInstanciasSubVariables[i][j].variable+" = "+activosInstanciasVarReglas[i][j][activosInstanciasVarReglas[i][j].length-1].variable+";\n";
                                content+="\t"+"saveVariable('"+activosInstanciasSubVariables[i][j].nombreVariable+"', "+activosInstanciasSubVariables[i][j].tipoProyeccion+", "+activosInstanciasSubVariables[i][j].variable+");\n";
                            }
                        };
                    }
                };
            }
        };
    } else {
        for (var i = 0; i < activosInstanciasVarReglas.length; i++) {
            if(activosInstanciasVarReglas[i] != undefined) {
                for (var j = 0; j < activosInstanciasVarReglas[i].length; j++) {
                    if(activosInstanciasVarReglas[i][j] != undefined) {
                        for (var k = 0; k < activosInstanciasVarReglas[i][j].length; k++) {
                            /*if(activosAlgebraica[i] != undefined && activosAlgebraica[i][j] != undefined && activosAlgebraica[i][j][k] != undefined) {
                                activosAlgebraica[i][j].sort(function(a, b){
                                    if(a.orden < b.orden) { return -1; }
                                    if(a.orden > b.orden) { return 1; }
                                    return 0;
                                });
                                activosInstanciasVarReglas[i][j].sort(function(a, b){
                                    if(a.orden < b.orden) { return -1; }
                                    if(a.orden > b.orden) { return 1; }
                                    return 0;
                                });
                                for (var j = 0; j < activosAlgebraica[i][j][k].length; j++) {
                                    content+="\tvar "+activosAlgebraica[i][j].variable+" = "+activosAlgebraica[i][j].codigo+"\n";
                                };
                                var mayor = activosInstanciasVarReglas[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].orden;
                                if(mayor < activosAlgebraica[i][j][k][activosInstanciasVarReglas[i][j][k].length-1].orden) {
                                    content+="\t"+activosInstanciasSubVariables[i][j].variable+" = "+activosAlgebraica[i][j][activosAlgebraica[i][j][k].length-1].variable+";\n"
                                } else {
                                    content+="\t"+activosInstanciasSubVariables[i][j].variable+" = "+activosInstanciasVarReglas[i][j][activosInstanciasVarReglas[i][j][k].length-1].variable+";\n"
                                }
                                content+="\t"+"saveVariable('"+activosInstanciasSubVariables[i][j].nombreVariable+"', "+activosAsignacionesIncisos[i].tipoProyeccion+", "+activosAsignacionesIncisos[i].variable+");\n";
                            } else */if(activosInstanciasVarReglas[i] != undefined && activosInstanciasVarReglas[i][j] != undefined && activosInstanciasVarReglas[i][j][k] != undefined && (activosAlgebraica[i] == undefined || activosAlgebraica[i][j] == undefined || activosAlgebraica[i][j][k] == undefined)) {
                                activosInstanciasVarReglas[i][j].sort(function(a, b){
                                    if(a.orden < b.orden) { return -1; }
                                    if(a.orden > b.orden) { return 1; }
                                    return 0;
                                });
                                content+="\t"+activosInstanciasSubVariables[i][j].variable+" = "+activosInstanciasVarReglas[i][j][activosInstanciasVarReglas[i][j].length-1].variable+";\n";
                                content+="\t"+"saveVariable('"+activosInstanciasSubVariables[i][j].nombreVariable+"', "+activosInstanciasSubVariables[i][j].tipoProyeccion+", "+activosInstanciasSubVariables[i][j].variable+");\n";
                            }
                        };
                    }
                };
            }
        };
    }
    for (var i = 0; i < activosAsignacionesIncisos.length; i++) {
        content+="\t"+activosAsignacionesIncisos[i].codigo+";\n";
        content+="\t"+"saveVariable('"+activosAsignacionesIncisos[i].nombreVariable+"', "+activosAsignacionesIncisos[i].tipoProyeccion+", "+activosAsignacionesIncisos[i].variable+");\n";
    };
    return content;
}

function runFunctions () {
    window['ActivosRCL']();
    calculateRCL();
    console.log('totalesVariables')
    console.log(totalesVariables)
}

function saveVariable (nombreVariable, valorVariable) {
    /*for (var i = 0; i < totalesVariables.length; i++) {
        for (var j = 0; j < totalesVariables[i].length; j++) {
            if (totalesVariables[i][j].variable.localeCompare(nombreVariable) == 0) {
                totalesVariables[i][j].total = valorVariable;
            }
        };
    };*/
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
    //if(formulaGlobal.split(/[=|+|-|*|\/]+/)[0])
    var equacion1 = formulaGlobal.split("=")[0].split(/[+|-|*|\/]+/), equacion2 = formulaGlobal.split("=")[1].split(/[+|-|*|\/]+/);
    var equacionValoresReemplazadosSubVariables;
    var todasTienenFormula = true;
    var totalesPorVariablesFormula = [];
    Loop1:
    for (var i = 0; i < equacion1.length; i++) {
        for (var j = 0; j < arregloVariables.length; j++) {
            if(equacion1[i].toLowerCase().localeCompare(arregloVariables[j].variables.toLowerCase()) == 0 && arregloVariables[j].formula.length == 0) {
                todasTienenFormula =  false;
                equacionValoresReemplazadosSubVariables = formulaGlobal.split("=")[1];
                totalesPorVariablesFormula.push({variable: arregloVariables[j].variables, formula: "", total: 0, tipoProyeccion: 0});
                break Loop1;
            }
        };
    };
    if(todasTienenFormula) {
        Loop2:
        for (var i = 0; i < equacion2.length; i++) {
            for (var j = 0; j < arregloVariables.length; j++) {
                if(equacion2[i].toLowerCase().localeCompare(arregloVariables[j].variables.toLowerCase()) == 0 && arregloVariables[j].formula.length == 0) {
                    todasTienenFormula =  false;
                    equacionValoresReemplazadosSubVariables = formulaGlobal.split("=")[0];
                    totalesPorVariablesFormula.push({variable: arregloVariables[j].variables, formula: "", total: 0, tipoProyeccion: 0});
                    break Loop2;
                }
            };
        };
    }
    if(!todasTienenFormula) {
        for (var i = 0; i < equacionValoresReemplazadosSubVariables.length; i++) {
            if(equacionValoresReemplazadosSubVariables.charAt(i) != "(" && equacionValoresReemplazadosSubVariables.charAt(i) != ")" && equacionValoresReemplazadosSubVariables.charAt(i) != "<" && equacionValoresReemplazadosSubVariables.charAt(i) != ">" && 
                equacionValoresReemplazadosSubVariables.charAt(i) != "!" && equacionValoresReemplazadosSubVariables.charAt(i) != "=" && equacionValoresReemplazadosSubVariables.charAt(i) != "/" && equacionValoresReemplazadosSubVariables.charAt(i) != "*" && 
                equacionValoresReemplazadosSubVariables.charAt(i) != "√" && equacionValoresReemplazadosSubVariables.charAt(i) != "+" && equacionValoresReemplazadosSubVariables.charAt(i) != "-" && isNaN(equacionValoresReemplazadosSubVariables.charAt(i))) {
                var pal = getVariable(equacionValoresReemplazadosSubVariables, i);
                var formulaVariable, tieneFormula = false;
                for (var j = 0; j < arregloVariables.length; j++) {
                    if(arregloVariables[j].variables.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                        formulaVariable = arregloVariables[j].formula;
                        if(arregloVariables[j].formula.length > 0) {
                            tieneFormula = true;
                            totalesPorVariablesFormula.push({variable: arregloVariables[j].variables, formula: arregloVariables[j].formula.split(/[+|-|*|\/]+/), total: 0});
                        }
                        break;
                    }
                };
                if(tieneFormula) {
                    var primeraParte = equacionValoresReemplazadosSubVariables.substring(0, i);
                    var ultimaParte = equacionValoresReemplazadosSubVariables.substring(i+pal.length);
                    equacionValoresReemplazadosSubVariables = primeraParte + formulaVariable + ultimaParte;
                    //equacionValoresReemplazadosSubVariables.replace(pal, formulaVariable);
                }
                i+=pal.length;
            }
        };

        var equacionValoresReemplazadosNumeros = equacionValoresReemplazadosSubVariables;

        for (var i = 0; i < equacionValoresReemplazadosNumeros.length; i++) {
            if(equacionValoresReemplazadosNumeros.charAt(i) != "(" && equacionValoresReemplazadosNumeros.charAt(i) != ")" && equacionValoresReemplazadosNumeros.charAt(i) != "<" && equacionValoresReemplazadosNumeros.charAt(i) != ">" && 
                equacionValoresReemplazadosNumeros.charAt(i) != "!" && equacionValoresReemplazadosNumeros.charAt(i) != "=" && equacionValoresReemplazadosNumeros.charAt(i) != "/" && equacionValoresReemplazadosNumeros.charAt(i) != "*" && 
                equacionValoresReemplazadosNumeros.charAt(i) != "√" && equacionValoresReemplazadosNumeros.charAt(i) != "+" && equacionValoresReemplazadosNumeros.charAt(i) != "-" && isNaN(equacionValoresReemplazadosNumeros.charAt(i))) {
                var pal = getVariable(equacionValoresReemplazadosNumeros, i);
                var valorInciso;
                Loop1:
                for (var j = 0; j < totalesVariables.length; j++) {
                    for (var k = 0; k < totalesVariables[j].length; k++) {
                        if(totalesVariables[j][k].variable.toLowerCase().localeCompare(pal.toLowerCase()) == 0) {
                            valorInciso = totalesVariables[j][k].total;
                            for (var l = 0; l < totalesPorVariablesFormula.length; l++) {
                                for (var o = 0; o < totalesPorVariablesFormula[l].formula.length; o++) {
                                    if(totalesPorVariablesFormula[l].formula[o].toLowerCase().localeCompare(totalesVariables[j][k].variable.toLowerCase()) == 0) {
                                        totalesPorVariablesFormula[l].total+=totalesVariables[j][k].total;
                                    }
                                };
                            };
                            break Loop1;
                        }
                    };
                };
                var primeraParte = equacionValoresReemplazadosNumeros.substring(0, i);
                var ultimaParte = equacionValoresReemplazadosNumeros.substring(i+pal.length);
                equacionValoresReemplazadosNumeros = primeraParte + valorInciso + ultimaParte;
                //equacionValoresReemplazadosSubVariables.replace(pal, valorInciso);
                i+=valorInciso.toString().length;
            }
        };
        var rcl = math.eval(equacionValoresReemplazadosNumeros);
        totalesPorVariablesFormula[0].total = rcl;
        console.log('equacionValoresReemplazadosSubVariables');
        console.log(equacionValoresReemplazadosSubVariables);
        console.log('equacionValoresReemplazadosNumeros');
        console.log(equacionValoresReemplazadosNumeros);
        console.log('formulaGlobal');
        console.log(formulaGlobal);
        console.log('totalesPorVariablesFormula');
        console.log(totalesPorVariablesFormula);
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

var arreglosNombres = [];
/*function calculateRCL () {
    arreglosNombres = [];
    contadorFuncionPrint = 0;
    if(formulaGlobal.length > 0) {
        if(arregloVariables.length > 0) {
            if(arregloVariablesDeVariables.length > 0) {
                var variablesTexto = getVariables(formulaGlobal);
                var salir = false, texto = '', tabla = '';
                arregloVarDeVarFormula = []
                for (var i = 0; i < variablesTexto.length; i++) {
                    for (var j = 0; j < arregloVariables.length; j++) {
                        if(arregloVariables[j].variables.toLowerCase() == variablesTexto[i].toLowerCase()){
                            for (var k = 0; k < arregloVariablesDeVariables.length; k++) {
                                if(arregloVariablesDeVariables[k].idVariable == arregloVariables[j].ID){
                                    if(arregloVariablesDeVariables[k].tablaAplicar == 1 && arregloActivos.length == 0) {
                                        salir = true;
                                        texto = arregloVariablesDeVariables[k].nombre;
                                        tabla = 'activos';
                                        break;
                                    } else if(arregloVariablesDeVariables[k].tablaAplicar == 2 && arregloDepositos.length == 0) {
                                        salir = true;
                                        texto = arregloVariablesDeVariables[k].nombre;
                                        tabla = 'depositos';
                                        break;
                                    } else {
                                        var encontro = arregloVarDeVarFormula.filter(function( object ) {
                                                            return object.ID == arregloVariablesDeVariables[k].ID;
                                                        });
                                        if(encontro.length == 0) {
                                            arregloVarDeVarFormula.push(arregloVariablesDeVariables[k]);
                                            var arregloNombre = '';
                                            if(arregloVariablesDeVariables[k].tablaAplicar == 1)
                                                arregloNombre = 'arregloActivos';
                                            else if(arregloVariablesDeVariables[k].tablaAplicar == 2)
                                                arregloNombre = 'arregloDepositos';
                                            arreglosNombres.push(arregloNombre);
                                        }
                                    }
                                }
                            };
                        }
                        if(salir)
                            break;
                    };
                    if(salir)
                        break;
                };
                if(salir) {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "No existen valores en la base de datos de la tabla "+tabla+" y la sub-variable "+texto+" los ocupa.",
                        duration: 3,
                        overlay: true,
                        closeConfirm: true
                    });
                } else
                    getRulesByVariable();
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "No existen sub-variables en la base de datos.",
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
                message: "No existen variables en la base de datos.",
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
            message: "No existe una formula en la base de datos.",
            duration: 2,
            overlay: true,
            closeConfirm: true
        });
    }
}*/

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

function getRulesByVariable () {
    arregloDeReglas = [];
    arregloDeComprobacionDeReglas = [];
    console.log('arregloActivos');
    console.log(arregloActivos);
    console.log(arregloActivos[0].monto);
    contadorEntrarCreateFunctionsArray = 0;
    for (var i = 0; i < arregloVarDeVarFormula.length; i++) {
        console.log('---------');
        console.log(arregloVarDeVarFormula[i]);
        console.log('---------');
        loadRules(arregloVarDeVarFormula[i].ID);
    }
}

var arregloDeFuncionesReglas = [];
var arregloDeFuncionesFiltros = [];
var arregloDeReglasNullPosiciones = [];

function createFunctionsArray (argument) {
    console.log("jkjkjkjkj");
    console.log('arregloActivos');
    console.log(arregloActivos);
    console.log('arregloDeReglas');
    console.log(arregloDeReglas);
    console.log('arreglosNombres');
    console.log(arreglosNombres);
    console.log('arregloVarDeVarFormula');
    console.log(arregloVarDeVarFormula);
    console.log('contadorEntrarCreateFunctionsArray');
    console.log(contadorEntrarCreateFunctionsArray);
    var contienePurosNull = false, contadorDeNulls = 0;
    for (var i = 0; i < arregloDeReglas.length; i++) {
        if(arregloDeReglas[i].length == 0)
            contadorDeNulls++;
    };
    if(contadorDeNulls == arregloDeReglas.length)
        contienePurosNull = true;
    if(arregloVarDeVarFormula.length == contadorEntrarCreateFunctionsArray && !contienePurosNull) {
        //console.log("ANTES ANTES");
        arregloDeReglasNullPosiciones = [];
        for (var i = 0; i < arregloDeReglas.length; i++) {
            //console.log(arregloDeReglas[i]);
            if(arregloDeReglas[i].length == 0) {
                arregloDeReglasNullPosiciones.push(i);
            }
        };
        for (var i = 0; i < arregloDeReglas.length; i++) {
            var indice = ubicacion(arregloDeReglas[i]);
            if(indice != -1) {
                var temp = arregloDeReglas[indice];
                arregloDeReglas[indice] = arregloDeReglas[i];
                arregloDeReglas[i] = temp;
            }
        };
        for (var i = 0; i < arregloDeFiltros.length; i++) {
            var indice = ubicacion(arregloDeFiltros[i]);
            if(indice != -1) {
                var temp = arregloDeFiltros[indice];
                arregloDeFiltros[indice] = arregloDeFiltros[i];
                arregloDeFiltros[i] = temp;
            }
        };
        /*arregloDeFiltros.sort(function(a, b){
            if(a.length > 0 && b.length == 0)
                return 0;
            if(a.length == 0 && b.length == 0)
                return 0;
            if(a.length == 0 && b.length > 0)
                return 1;
            if(a[0].variablePadre > b[0].variablePadre)
                return 1;
            else
                return 0;
        });*/
        //console.log("ANTES ANTES");
        /*for (var i = 0; i < arregloVariables.length; i++) {
            var encontro = false;
            for (var j = 0; j < arregloVariablesDeVariables.length; j++) {
                if(arregloVariablesDeVariables[j].idVariable == arregloVariables[i].ID) {
                    encontro = true;
                    break;
                }
            };
            if(!encontro)
                arregloDeReglas.splice(i, 0, null);
        };*/
        /*console.log("DESPUES DESPUES");
        for (var i = 0; i < arregloDeReglas.length; i++) {
            console.log(arregloDeReglas[i]);
        };
        console.log("DESPUES DESPUES");*/
        arregloDeFuncionesReglas = [];
        for (var i = 0; i < arregloDeReglas.length; i++) {
            var rulesArray = [];
            if(arregloDeReglas[i] != null) {
                for (var j = 0; j < arregloDeReglas[i].length; j++) {
                    if(arregloDeReglas[i][j].reglaPadre == 0) {
                        var arreglo = [];
                        var resultado = campoObjetivo(arregloDeReglas[i][j], arreglo, 0, i);
                        resultado[0] = "\n"+resultado[0];
                        $.merge( rulesArray, resultado );
                    }
                }
            }
            arregloDeFuncionesReglas.push(rulesArray);
        };
        for (var i = 0; i < arregloDeFiltros.length; i++) {
            var rulesArray = [];
            if(arregloDeFiltros[i] != null) {
                for (var j = 0; j < arregloDeFiltros[i].length; j++) {
                    if(arregloDeFiltros[i][j].reglaPadre == 0) {
                        var arreglo = [];
                        var resultado = campoObjetivo(arregloDeFiltros[i][j], arreglo, 0, i);
                        resultado[0] = "\n"+resultado[0];
                        $.merge( rulesArray, resultado );
                    }
                }
            }
            arregloDeFuncionesFiltros.push(rulesArray);
        };
        /*console.log("11111111========11111111");
        for (var i = 0; i < arregloDeFunciones.length; i++) {
            console.log(arregloDeFunciones[i]);
        };
        console.log("11111111========11111111");
        for (var j = 0; j < arregloVariables.length; j++) {
            var entro = false;
            var varialesHijas = arregloVariablesDeVariables.filter(function( object ) {
                                    return object.idVariable == arregloVariables[j].ID;
                                });
            for (var k = 0; k < varialesHijas.length; k++) {
                for (var i = 0; i < arregloDeReglas.length; i++) {
                    if(arregloDeReglas[i] != null) {
                        for (var r = 0; r < arregloDeReglas[i].length; r++) {
                            if(arregloDeReglas[i][r].variablePadre == varialesHijas[k].ID)
                                entro = true;
                        };
                    }
                };
            };
            if(!entro)
                arregloDeFunciones.splice(j, 0, null);
        };*/
        console.log("+++++++========+++++++");
        for (var i = 0; i < arregloDeFuncionesReglas.length; i++) {
            console.log(arregloDeFuncionesReglas[i]);
        };
        console.log("+++++++========+++++++");
        createMethods();
    } else if(arregloVariablesDeVariables.length == contadorEntrarCreateFunctionsArray && contienePurosNull) {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "No existen reglas en la base de datos.",
            duration: 2,
            overlay: true,
            closeConfirm: true
        });
    }
}

function ubicacion (arreglo) {
    var index = -1;
    /*console.log('---------------\n---\n-----+++');
    console.log('HOHOHOHOHO');
    console.log(arreglo);
    console.log(arreglo[0]);*/
    if(arreglo.length > 0){
        for (var i = 0; i < arregloVarDeVarFormula.length; i++) {
            /*console.log('arregloVarDeVarFormula[i]');
            console.log(arregloVarDeVarFormula[i]);
            console.log('HOHOHOHOHO');
            console.log(arreglo);
            console.log(arreglo[0]);*/
            if(arregloVarDeVarFormula[i].ID == arreglo[0].variablePadre) {
                /*console.log('arregloVarDeVarFormula[i]');
                console.log(arregloVarDeVarFormula[i]);*/
                index = i;
                break;
            }
        };
    }
    /*console.log('index');
    console.log(index);
    console.log('---------------\n---\n-----+++');*/
    return index;
}

function campoObjetivo (regla, arreglo, tabs, index) {
    var esCondicion = false;
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
    console.log('index');
    console.log(index);
    console.log('index');
    if(regla.campoObjetivo.indexOf('COLUMNA') == 0) {
        if(esCondicion) {
            var campo = arreglosNombres[index]+"Copia[i]."+regla.campoObjetivo.split("=")[1];

            // Agregando campo Operacion
            arreglo.push(tabsText+"if ( "+campo+" "+regla.operacion);
            posicionesIF.push(arreglo.length);
        } else {
            var campo = arreglosNombres[index]+"Copia[i]."+regla.campoObjetivo.split("=")[1];

            // Agregando campo Operacion
            if(regla.operacion=="=")
                arreglo.push(tabsText+campo+" "+regla.operacion);
            else
                arreglo.push(tabsText+campo+" = "+campo+" "+regla.operacion);
        }
        if(hasVariables)
            textVariables.push(campo + " " + regla.operacion);
    } else if(regla.campoObjetivo.indexOf('LISTA') == 0) {
        var arregloLista = regla.campoObjetivo.split("=")[1].split(",");
        if(esCondicion) {
            // Agregando campo Operacion
            if(regla.operacion == "!=") {
                for (var i = 0; i < arregloLista.length; i++) {
                    var opcionAMostrar = arregloLista[i].split("$");
                    var valorElemento = arregloLista[i];
                    if(opcionAMostrar.length > 1) {
                        if(opcionAMostrar[1] == "1")
                            valorElemento = opcionAMostrar[0].split("-")[0];
                        else
                            valorElemento = opcionAMostrar[0].split("-")[1];
                    }
                    if(isNaN(valorElemento))
                        arreglo.push("\n"+tabsText+"if ( '"+valorElemento+"'' "+regla.operacion);
                    else
                        arreglo.push("\n"+tabsText+"if ( "+valorElemento+" "+regla.operacion);
                    if(posicionesIF.length>0)
                        posicionesIF.push(posicionesIF[posicionesIF.length-1]+2);
                    else
                        posicionesIF.push(1);
                    if(hasVariables)
                        textVariables.push(valorElemento + " " + regla.operacion);
                };
            } else {
                for (var i = 0; i < arregloLista.length; i++) {
                    var opcionAMostrar = arregloLista[i].split("$");
                    var valorElemento = arregloLista[i];
                    if(opcionAMostrar.length > 1){
                        if(opcionAMostrar[1] == "1")
                            valorElemento = opcionAMostrar[0].split("-")[0];
                        else
                            valorElemento = opcionAMostrar[0].split("-")[1];
                    }
                    if(isNaN(valorElemento))
                        arreglo.push("\n"+tabsText+"if ( '"+valorElemento+"'' "+regla.operacion);
                    else
                        arreglo.push("\n"+tabsText+"if ( "+valorElemento+" "+regla.operacion);
                    if(posicionesIF.length>0)
                        posicionesIF.push(posicionesIF[posicionesIF.length-1]+2);
                    else
                        posicionesIF.push(1);
                    if(hasVariables)
                        textVariables.push(valorElemento + " " + regla.operacion);
                };
            }
        } else {
            // Agregando campo Operacion
            for (var i = 0; i < arregloLista.length; i++) {
                var opcionAMostrar = arregloLista[i].split("$");
                var valorElemento = arregloLista[i];
                if(opcionAMostrar.length > 1){
                    if(opcionAMostrar[1] == "1")
                        valorElemento = opcionAMostrar[0].split("-")[0];
                    else
                        valorElemento = opcionAMostrar[0].split("-")[1];
                }
                if(regla.operacion=="=") {
                    arreglo.push("\n"+tabsText+valorElemento+" "+regla.operacion);
                } else {
                    arreglo.push("\n"+tabsText+valorElemento+" = "+valorElemento+" "+regla.operacion);
                }
                if(hasVariables)
                    textVariables.push(valorElemento + " " + regla.operacion);
            };
        }
    } else if(regla.campoObjetivo.indexOf('VARIABLE') == 0) {
        var arregloVariable = regla.campoObjetivo.split("=")[1].split(",");
        if(esCondicion) {
            // Agregando campo Operacion
            for (var i = 0; i < arregloVariable.length; i++) {
                var textCreatedVariables = '';
                if(arregloVariable[i].indexOf("RESULTADO") == 0 )
                    textCreatedVariables = 'variableResultado'+regla.reglaPadre;
                else if(arregloVariable[i].indexOf("OBJETIVO") == 0 )
                    textCreatedVariables = 'variableObjetivo'+regla.reglaPadre;
                else if(arregloVariable[i].indexOf("VALOR") == 0 )
                    textCreatedVariables = 'variableValor'+regla.reglaPadre;
                var valorLista = '';
                if(arregloVariable[i].indexOf("$") > 0 ) {
                    if(arregloVariable[i].split("$")[1] == "1")
                        valorLista = ".nombre";
                    else
                        valorLista = ".valor";
                }
                arreglo.push(tabsText+"if ( "+textCreatedVariables+valorLista+" "+regla.operacion);
                posicionesIF.push(arreglo.length);
                if(hasVariables)
                    textVariables.push(textCreatedVariables+valorLista + " " + regla.operacion);
            };
        } else {
            // Agregando campo Operacion
            for (var i = 0; i < arregloVariable.length; i++) {
                var textCreatedVariables = '';
                if(arregloVariable[i].indexOf("RESULTADO") == 0 )
                    textCreatedVariables = 'variableResultado'+regla.reglaPadre;
                else if(arregloVariable[i].indexOf("OBJETIVO") == 0 )
                    textCreatedVariables = 'variableObjetivo'+regla.reglaPadre;
                else if(arregloVariable[i].indexOf("VALOR") == 0 )
                    textCreatedVariables = 'variableValor'+regla.reglaPadre;
                var valorLista = '';
                if(arregloVariable[i].indexOf("$") > 0 ) {
                    if(arregloVariable[i].split("$")[1] == "1")
                        valorLista = ".nombre";
                    else
                        valorLista = ".valor";
                }
                if(regla.operacion=="=")
                    arreglo.push(tabsText+textCreatedVariables+valorLista+" "+regla.operacion);
                else
                    arreglo.push(tabsText+textCreatedVariables+valorLista+" = "+textCreatedVariables+valorLista+" "+regla.operacion);
                if(hasVariables)
                    textVariables.push(textCreatedVariables+valorLista + " " + regla.operacion);
            };
        }
    }

    if(regla.valor.indexOf('COLUMNA') == 0) {
        if(esCondicion) {
            //var valor = arreglosNombres[index]+"[i]."+regla.valor.split("=")[1];
            var valor = regla.valor.split("=")[1];
            if(!isNaN(valor) && regla.campoObjetivo.split("=")[0] != "totalDepositos" && regla.campoObjetivo.split("=")[0] != "monto")
                valor = '"'+valor+'"';
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i] += " "+valor+" )  {";
                textVariables[i] += " " + valor;
            };
        } else {
            //var valor = arreglosNombres[index]+"[i]."+regla.valor.split("=")[1];
            var valor = regla.valor.split("=")[1];
            if(!isNaN(valor) && regla.campoObjetivo.split("=")[0] != "totalDepositos" && regla.campoObjetivo.split("=")[0] != "monto")
                valor = '"'+valor+'"';
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i] += " "+valor+";";
                textVariables[i] += " " + valor;
            };
        }
    } else if(regla.valor.indexOf('LISTA') == 0) {
        if(esCondicion) {
            var arregloLista = regla.valor.split("=")[1].split(",");
            var copiaRegla = arreglo.slice();
            var copiaTextVariable = textVariables.slice();
            var tamArreglo = arreglo.length;
            if(regla.operacion == "!=") {
                for (var j = 0; j < tamArreglo; j++) {
                    for (var i = 0; i < arregloLista.length; i++) {
                        var opcionAMostrar = arregloLista[i].split("$");
                        var valorElemento = arregloLista[i];
                        if(opcionAMostrar.length > 1){
                            if(opcionAMostrar[1] == "1")
                                valorElemento = opcionAMostrar[0].split("-")[0];
                            else
                                valorElemento = opcionAMostrar[0].split("-")[1];
                        }
                        if(i==0) {
                            var textoFinal = '';
                            if(i+1 == arregloLista.length)
                                textoFinal = " ) {";
                            if(isNaN(valorElemento))
                                arreglo[j] += " '"+valorElemento + "'" + textoFinal;
                            else
                                arreglo[j] += " "+valorElemento + textoFinal;
                            textVariables[j] += " " + valorElemento;
                        } else {
                            var textoFinal = '';
                            if(i+1 == arregloLista.length)
                                textoFinal = " ) {";
                            if(isNaN(valorElemento))
                                arreglo[j] += " && "+copiaRegla[j].split(" ( ")[1]+" '"+valorElemento+"'"+textoFinal;
                            else 
                                arreglo[j] += " && "+copiaRegla[j].split(" ( ")[1]+" "+valorElemento+textoFinal;
                            textVariables[j] += " && " + valorElemento;
                        }
                    }
                };
            } else {
                for (var i = 0; i < arregloLista.length; i++) {
                    var opcionAMostrar = arregloLista[i].split("$");
                    var valorElemento = arregloLista[i];
                    if(opcionAMostrar.length > 1){
                        if(opcionAMostrar[1] == "1")
                            valorElemento = opcionAMostrar[0].split("-")[0];
                        else
                            valorElemento = opcionAMostrar[0].split("-")[1];
                    }
                    for (var j = 0; j < tamArreglo; j++) {
                        if(i==0) {
                            //if(isNaN(valorElemento))
                                arreglo[j] += " '"+valorElemento + "' ) {";
                            /*else
                                arreglo[j] += " "+valorElemento + " ) {";*/
                            textVariables[j] += " " + valorElemento;
                        } else {
                            //if(isNaN(valorElemento))
                                arreglo.push("\n"+copiaRegla[j]+" '"+valorElemento+"' ) {");
                            /*else
                                arreglo.push("\n"+copiaRegla[j]+" "+valorElemento+" ) {");*/
                            posicionesIF.push(posicionesIF[posicionesIF.length-1]+2);
                            textVariables.push(copiaTextVariable[j] + " " + valorElemento);
                        }
                    };
                };
            }
        } else {
            var arregloLista = regla.valor.split("=")[1].split(",");
            var copiaRegla = arreglo[arreglo.length-1];
            var copiaTextVariable = textVariables[textVariables.length-1];
            var tamArreglo = arreglo.length;
            for (var i = 0; i < arregloLista.length; i++) {
                for (var j = 0; j < tamArreglo; j++) {
                    var opcionAMostrar = arregloLista[i].split("$");
                    var valorElemento = arregloLista[i];
                    if(opcionAMostrar.length > 1){
                        if(opcionAMostrar[1] == "1")
                            valorElemento = opcionAMostrar[0].split("-")[0];
                        else
                            valorElemento = opcionAMostrar[0].split("-")[1];
                    }
                    if(i==0) {
                        arreglo[j] += " "+valorElemento + ";";
                        textVariables[j] += " " + valorElemento;
                    } else {
                        arreglo.push("\n"+copiaRegla+" "+valorElemento + ";");
                        textVariables.push(copiaTextVariable + " " + valorElemento);
                    }
                };
            };
        }
    } else if(regla.valor.indexOf('FACTOR') == 0) {
        if(esCondicion) {
            var factorValor = regla.valor.split("=")[1];
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i] += " "+factorValor + " ) {";
                textVariables[i] += " " + factorValor;
            };
        } else {
            var factorValor = regla.valor.split("=")[1];
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i] += " "+factorValor + ";";
                textVariables[i] += " " + factorValor;
            };
        }
    } else if(regla.valor.indexOf('DIA') == 0) {
        if(esCondicion) {
            var diaValor = regla.valor.split("=")[1];
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i] += " "+diaValor + " ) {";
                textVariables[i] += " " + diaValor;
            };
        } else {
            var diaValor = regla.valor.split("=")[1];
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i] += " "+diaValor + ";";
                textVariables[i] += " " + diaValor;
            };
        }
    } else if(regla.valor.indexOf('VARIABLE') == 0) {
        var arregloVariable = regla.valor.split("=")[1].split(",");
        if(esCondicion) {
            // Agregando campo Operacion
            for (var i = 0; i < arregloVariable.length; i++) {
                var textCreatedVariables = '';
                if(arregloVariable[i].indexOf("RESULTADO") == 0 )
                    textCreatedVariables = 'variableResultado'+regla.reglaPadre;
                else if(arregloVariable[i].indexOf("OBJETIVO") == 0 )
                    textCreatedVariables = 'variableObjetivo'+regla.reglaPadre;
                else if(arregloVariable[i].indexOf("VALOR") == 0 )
                    textCreatedVariables = 'variableValor'+regla.reglaPadre;
                var valorLista = '';
                if(arregloVariable[i].indexOf("$") > 0 ) {
                    if(arregloVariable[i].split("$")[1] == "1")
                        valorLista = ".nombre";
                    else
                        valorLista = ".valor";
                }
                for (var k = 0; k < arreglo.length; k++) {
                    arreglo[k] += " "+textCreatedVariables + valorLista + " ) {";
                };
            };
        } else {
            // Agregando campo Operacion
            for (var i = 0; i < arregloVariable.length; i++) {
                var textCreatedVariables = '';
                if(arregloVariable[i].indexOf("RESULTADO") == 0 )
                    textCreatedVariables = 'variableResultado'+regla.reglaPadre;
                else if(arregloVariable[i].indexOf("OBJETIVO") == 0 )
                    textCreatedVariables = 'variableObjetivo'+regla.reglaPadre;
                else if(arregloVariable[i].indexOf("VALOR") == 0 )
                    textCreatedVariables = 'variableValor'+regla.reglaPadre;
                var valorLista = '';
                if(arregloVariable[i].indexOf("$") > 0 ) {
                    if(arregloVariable[i].split("$")[1] == "1")
                        valorLista = ".nombre";
                    else
                        valorLista = ".valor";
                }
                for (var k = 0; k < arreglo.length; k++) {
                    arreglo[k] += " "+textCreatedVariables + valorLista + ";";
                };
            };
        }
        if(hasVariables) {
            for (var i = 0; i < arregloVariable.length; i++) {
                textVariables.push(arregloVariable[i] + " " + regla.operacion);
            };
        }
    }

    var cuerpo;
    if(arregloDeReglas[index] != null){
        cuerpo = arregloDeReglas[index].filter(function( object ) {
            return object.reglaPadre == regla.ID;;
        });
    } else {
        cuerpo = [];
    }
    if(regla.variables.length > 0){
        var variables = regla.variables.split("//")[1].split("#");
        var tamArreglo = arreglo.length;
        var contador = 0;
        for (var j = 0; j < tamArreglo; j++) {
            for (var i = 0; i < variables.length; i++) {
                if(j == 0)
                    contador = 1;
                else 
                    contador = 0;
                if(variables[i].indexOf('RESULTADO') == 0) {
                    var variablesText = '';
                    if(esCondicion) {
                        variablesText = textVariables[j];
                    } else {
                        if( textVariables[j].indexOf(">") > 0 ){
                            variablesText+=textVariables[j].split(">")[0];
                        } else if( textVariables[j].indexOf(">=") > 0 ) {
                            variablesText+=textVariables[j].split(">=")[0];
                        } else if( textVariables[j].indexOf("<") > 0 ) {
                            variablesText+=textVariables[j].split("<")[0];
                        } else if( textVariables[j].indexOf("<=") > 0 ) {
                            variablesText+=textVariables[j].split("<=")[0];
                        } else if( textVariables[j].indexOf("==") > 0 ) {
                            variablesText+=textVariables[j].split("==")[0];
                        } else if( textVariables[j].indexOf("=") > 0 ) {
                            variablesText+=textVariables[j].split("=")[0];
                        } else if( textVariables[j].indexOf("!=") > 0 ) {
                            variablesText+=textVariables[j].split("!=");
                        }  else if( textVariables[j].indexOf("*") > 0 ) {
                            variablesText+=textVariables[j].split("*")[0];
                        } else if( textVariables[j].indexOf("+") > 0 ) {
                            variablesText+=textVariables[j].split("+")[0];
                        } else if( textVariables[j].indexOf("-") > 0 ) {
                            variablesText+=textVariables[j].split("-")[0];
                        } else if( textVariables[j].indexOf("/") > 0) {
                            variablesText+=textVariables[j].split("/")[0];
                        }
                    }
                    variablesText+=";";
                    arreglo.splice(j+(j*variables.length)+1, 0, "\n"+tabsText+"var variableResultado"+(regla.ID)+" = "+variablesText);
                    for (var k = j; k < posicionesIF.length; k++) {
                        posicionesIF[k]++;
                    };
                } else if(variables[i].indexOf('CAMPOOBJETIVO') == 0) {
                    var variablesText = '';
                    for (var k = j; k < j+1; k++) {
                        variablesText = "var variableObjetivo"+(regla.ID)+" = ";
                        if(variables[i].indexOf("$") == -1) {
                            if( textVariables[k].indexOf(">") > 0 ){
                                variablesText+=textVariables[k].split(">")[0];
                            } else if( textVariables[k].indexOf(">=") > 0 ) {
                                variablesText+=textVariables[k].split(">=")[0];
                            } else if( textVariables[k].indexOf("<") > 0 ) {
                                variablesText+=textVariables[k].split("<")[0];
                            } else if( textVariables[k].indexOf("<=") > 0 ) {
                                variablesText+=textVariables[k].split("<=")[0];
                            } else if( textVariables[k].indexOf("==") > 0 ) {
                                variablesText+=textVariables[k].split("==")[0];
                            } else if( textVariables[k].indexOf("=") > 0 ) {
                                variablesText+=textVariables[k].split("=")[0];
                            } else if( textVariables[k].indexOf("!=") > 0 ) {
                                variablesText+=textVariables[k].split("!=");
                            }  else if( textVariables[k].indexOf("*") > 0 ) {
                                variablesText+=textVariables[k].split("*")[0];
                            } else if( textVariables[k].indexOf("+") > 0 ) {
                                variablesText+=textVariables[k].split("+")[0];
                            } else if( textVariables[k].indexOf("-") > 0 ) {
                                variablesText+=textVariables[k].split("-")[0];
                            } else if( textVariables[k].indexOf("/") > 0) {
                                variablesText+=textVariables[k].split("/")[0];
                            }
                        } else {
                            var nombre = '';
                            if( textVariables[k].indexOf(">") > 0 ){
                                nombre+=textVariables[k].split(">")[0];
                            } else if( textVariables[k].indexOf(">=") > 0 ) {
                                nombre+=textVariables[k].split(">=")[0];
                            } else if( textVariables[k].indexOf("<") > 0 ) {
                                nombre+=textVariables[k].split("<")[0];
                            } else if( textVariables[k].indexOf("<=") > 0 ) {
                                nombre+=textVariables[k].split("<=")[0];
                            } else if( textVariables[k].indexOf("==") > 0 ) {
                                nombre+=textVariables[k].split("==")[0];
                            } else if( textVariables[k].indexOf("=") > 0 ) {
                                nombre+=textVariables[k].split("=")[0];
                            } else if( textVariables[k].indexOf("!=") > 0 ) {
                                nombre+=textVariables[k].split("!=");
                                //
                            }  else if( textVariables[k].indexOf("*") > 0 ) {
                                nombre+=textVariables[k].split("*")[0];
                            } else if( textVariables[k].indexOf("+") > 0 ) {
                                nombre+=textVariables[k].split("+")[0];
                            } else if( textVariables[k].indexOf("-") > 0 ) {
                                nombre+=textVariables[k].split("-")[0];
                            } else if( textVariables[k].indexOf("/") > 0) {
                                nombre+=textVariables[k].split("/")[0];
                            }
                            var arregloVariables = variables[i].split("-")[1].split(",");
                            for (var i = 0; i < arregloVariables.length; i++) {
                                if(arregloVariables[i].replace(" ", "").indexOf(nombre).replace(" ", "") > -1){
                                    var tipo = arregloVariables[i].split("-")[1].split("$")[1];
                                    var nombre = arregloVariables[i].split("-")[0], valor = arregloVariables[i].split("-")[1].split("$")[0];
                                    variablesText+="{nombre: '"+nombre+"', valor: '"+valor+"'}"
                                }
                            };
                        }
                        variablesText+=";";
                        arreglo.splice(j+(j*variables.length)+1, 0, "\n"+tabsText+"\t"+variablesText);
                        for (var l = j; l < posicionesIF.length; l++) {
                            posicionesIF[l]++;
                        };
                    };
                } else if(variables[i].indexOf('VALOR') == 0) {
                    var variablesText = '';
                    for (var k = j; k < j+1; k++) {
                        variablesText = "var variableValor"+(regla.ID)+" = ";
                        if(variables[i].indexOf("$") == -1) {
                            if( textVariables[k].indexOf(">") > 0 ){
                                variablesText+=textVariables[k].split(">")[1];
                            } else if( textVariables[k].indexOf(">=") > 0 ) {
                                variablesText+=textVariables[k].split(">=")[1];
                            } else if( textVariables[k].indexOf("<") > 0 ) {
                                variablesText+=textVariables[k].split("<")[1];
                            } else if( textVariables[k].indexOf("<=") > 0 ) {
                                variablesText+=textVariables[k].split("<=")[1];
                            } else if( textVariables[k].indexOf("==") > 0 ) {
                                variablesText+=textVariables[k].split("==")[1];
                            } else if( textVariables[k].indexOf("=") > 0 ) {
                                variablesText+=textVariables[k].split("=")[1];
                            } else if( textVariables[k].indexOf("!=") > 0 ) {
                                variablesText+=textVariables[k].split("!=");
                                //
                            }  else if( textVariables[k].indexOf("*") > 0 ) {
                                variablesText+=textVariables[k].split("*")[1];
                            } else if( textVariables[k].indexOf("+") > 0 ) {
                                variablesText+=textVariables[k].split("+")[1];
                            } else if( textVariables[k].indexOf("-") > 0 ) {
                                variablesText+=textVariables[k].split("-")[1];
                            } else if( textVariables[k].indexOf("/") > 0) {
                                variablesText+=textVariables[k].split("/")[1];
                            }
                        } else {
                            var nombre = '';
                            if( textVariables[k].indexOf(">") > 0 ){
                                nombre+=textVariables[k].split(">")[1];
                            } else if( textVariables[k].indexOf(">=") > 0 ) {
                                nombre+=textVariables[k].split(">=")[1];
                            } else if( textVariables[k].indexOf("<") > 0 ) {
                                nombre+=textVariables[k].split("<")[1];
                            } else if( textVariables[k].indexOf("<=") > 0 ) {
                                nombre+=textVariables[k].split("<=")[1];
                            } else if( textVariables[k].indexOf("==") > 0 ) {
                                nombre+=textVariables[k].split("==")[1];
                            } else if( textVariables[k].indexOf("=") > 0 ) {
                                nombre+=textVariables[k].split("=")[1];
                            } else if( textVariables[k].indexOf("!=") > 0 ) {
                                nombre+=textVariables[k].split("!=");
                                //
                            }  else if( textVariables[k].indexOf("*") > 0 ) {
                                nombre+=textVariables[k].split("*")[1];
                            } else if( textVariables[k].indexOf("+") > 0 ) {
                                nombre+=textVariables[k].split("+")[1];
                            } else if( textVariables[k].indexOf("-") > 0 ) {
                                nombre+=textVariables[k].split("-")[1];
                            } else if( textVariables[k].indexOf("/") > 0) {
                                nombre+=textVariables[k].split("/")[1];
                            }
                            var arregloVariables = variables[i].split("=")[1].split(",");
                            for (var i = 0; i < arregloVariables.length; i++) {
                                if(arregloVariables[i].replace(/( *)/, "").indexOf(nombre.replace(/( *)/, "")) > -1){
                                    var tipo = arregloVariables[i].split("-")[1].split("$")[1].replace(")", "");
                                    var nombre = arregloVariables[i].split("-")[0], valor = arregloVariables[i].split("-")[1].split("$")[0];
                                    variablesText+="{nombre: '"+nombre+"', valor: '"+valor+"'}"
                                }
                            };
                        }
                        variablesText+=";";
                        arreglo.splice(j+(j*variables.length)+1, 0, "\n"+tabsText+"\t"+variablesText);
                        for (var l = j; l < posicionesIF.length; l++) {
                            posicionesIF[l]++;
                        };
                    };
                }
            };
        };
    }
    if(cuerpo.length > 0){
        var arregloCuerpo = [];
        for (var i = 0; i < cuerpo.length; i++) {
            var cuantasTabs = tabs;
            if(esCondicion)
                cuantasTabs++;
            var retorno = campoObjetivo(cuerpo[i], [], cuantasTabs, index);
            retorno[0] = "\n"+retorno[0];
            $.merge( arregloCuerpo, retorno );
        };
        for (var i = 0; i < posicionesIF.length; i++) {
            arreglo.splice(posicionesIF[i], 0, ...arregloCuerpo);
            if(esCondicion)
                arreglo.splice(posicionesIF[i]+arregloCuerpo.length, 0, "\n"+tabsText+"}");
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
                arreglo.splice(posicionesIF[i], 0, "\n"+tabsText+"}");
            };
        }
        return arreglo;
    }
}

var contadorVariablesFinales = 0;
var funcionesDeVariables = [];
/*function createMethods () {
    window["variablesFinales"] = [];
    funcionesDeVariables = [];
    for (var i = 0; i < arregloVariables.length; i++) {
        window[arregloVariables[i].variables] = 0;
        for (var j = 0; j < arregloVarDeVarFormula.length; j++) {
            console.log("arregloVarDeVarFormula[j]");
            console.log(arregloVarDeVarFormula[j]);
            console.log("arregloVariables[i]");
            console.log(arregloVariables[i]);
            if(arregloVarDeVarFormula[j].idVariable == arregloVariables[i].ID) {
                if(arregloDeFuncionesReglas[j].length > 0) {
                    contadorVariablesFinales++;
                    var varMonto = '', varNombre = '';
                    if(arreglosNombres[j] == "arregloActivos") {
                        varMonto = 'saldo';
                        varNombre = 'nombre';
                    } if(arreglosNombres[j] == "arregloDepositos") {
                        varMonto = 'saldo';
                        varNombre = 'nombreCliente';
                    }
                    var contentFiltro = '';
                    if(arregloDeFuncionesFiltros[j].length > 0) {
                        contentFiltro = '\tfor (var i = 0; i < '+arreglosNombres[j]+'.length; i++) {';
                        for (var k = 0; k < arregloDeFuncionesFiltros[j].length; k++) {
                            //arregloDeFiltros[j][k]
                            contentFiltro+='\t\t'+arregloDeFuncionesFiltros[j]+';';
                        };
                        contentFiltro+='\n\t};\n';
                    } else
                        contentFiltro+='\tvar '+arreglosNombres[j]+'Copia = '+arreglosNombres[j]+'.slice();\n';
                    contentFiltro+='console.log('+arreglosNombres[j]+'Copia);\n';
                    var contentRegla = '\tfor (var i = 0; i < '+arreglosNombres[j]+'Copia.length; i++) {';
                    for (var k = 0; k < arregloDeFuncionesReglas[j].length; k++) {
                        contentRegla+='\t\t'+arregloDeFuncionesReglas[j][k];
                    }
                    contentRegla+='\n\t};\n';

                    contentRegla+='\tvar total = 0;\n';
                    contentRegla+='\tfor (var j = 0; j < '+arreglosNombres[j]+'Copia.length; j++) {\n'+
                                '\t\ttotal+='+arreglosNombres[j]+'Copia[j].'+varMonto+';\n'+
                                '\t\tconsole.log('+arreglosNombres[j]+'Copia[j].'+varNombre+'+" = "+'+arreglosNombres[j]+'Copia[j].'+varMonto+');\n'+
                                '\t\tconsole.log(total);\n'+
                                '\t\tconsole.log('+arreglosNombres[j]+'Copia[j].ID);\n'+
                            '\t}\n';
                    contentRegla+='\tconsole.log("TOTAL = "+total);\n';
                    contentRegla+='\twindow['+arregloVariables[i].variables+'] += total;\n';
                    contentRegla+='\tvar encontro = window["variablesFinales"].filter(function( object ) {\n'+
                                            'return object.variable == '+arregloVariables[i].variables+';\n'+
                                        '});\n';
                    contentRegla+='\tvar o = 0, encontro = false;\n';
                    contentRegla+='\tfor (o = 0; o < window["variablesFinales"].length; o++) {\n';
                        contentRegla+='\tif(window["variablesFinales"][o].variable == '+arregloVariables[i].variables+') {\n';
                            contentRegla+='\tencontro = true;\n';
                            contentRegla+='\tbreak;\n';
                        contentRegla+='\t}\n';
                    contentRegla+='\t};\n';
                    contentRegla+='\tif(encontro)\n';
                        contentRegla+='\twindow["variablesFinales"][o].total+=total;\n';
                    contentRegla+='\telse\n';
                    contentRegla+='\t\nwindow["variablesFinales"].push({variable: "'+arregloVariables[i].variables+'", total: total});\n';
                    contentRegla+='\tprint();\n';
                    window['Fun'+arregloVariables[i].variables] = new Function(
                         'return function duncion(){'+
                                contentFiltro+contentRegla+
                        '}'
                    )();
                    window['Fun'+arregloVariables[i].variables]();
                }
            }
        };*/
        /*if(arregloDeFunciones[i].length > 0){
            contadorVariablesFinales++;
            var varMonto = '';
            if(arreglosNombres[i] == "arregloActivos")
                varMonto = 'monto';
            if(arreglosNombres[i] == "arregloDepositos")
                varMonto = 'totalDepositos';

            //window[coneccion[0].arreglo] = [];
            console.log("THOOOOR");
            //console.log(arregloActivos[0].monto);
            for (var k = 0; k < arregloActivos.length; k++) {
                console.log(arregloActivos[k]);
            };
            console.log(arregloDeFunciones[i]);
            console.log(arregloDeFunciones);
            console.log("THOOOOR");

            var content = '\tfor (var i = 0; i < '+arreglosNombres[i]+'.length; i++) {';
            if(varMonto == "totalDepositos") {
                content+='console.log(arregloDepositos[i].idCliente == "1");';
                content+='console.log(arregloDepositos[i].idCliente);';
            }
            for (var j = 0; j < arregloDeFunciones[i].length; j++) {
                content+="\t\t"+arregloDeFunciones[i][j]+"\n";
            };
            content+='\t}\n';
            content+='\tvar total = 0;\n';
            content+='\tfor (var j = 0; j < '+arreglosNombres[i]+'.length; j++) {\n'+
                        '\t\ttotal+='+arreglosNombres[i]+'[j].'+varMonto+';\n'+
                        '\t\tconsole.log('+arreglosNombres[i]+'[j].nombre+" = "+'+arreglosNombres[i]+'[j].'+varMonto+');\n'+
                        '\t\tconsole.log(total);\n'+
                    '\t}\n';
            content+='\tconsole.log('+arreglosNombres[i]+');\n';
            content+='\tconsole.log("TOTAL = "+total);\n';
            content+='\twindow['+arregloVariables[i].variables+'] = total;\n';
            content+='\twindow["variablesFinales"].push({variable: "'+arregloVariables[i].variables+'", total: total});\n';
            content+='\tconsole.log("YEEEEEEEEEEEEEEEEEEEEEEE");\n';
            content+='\tconsole.log(window["variablesFinales"]);\n';
            content+='\tconsole.log("YEEEEEEEEEEEEEEEEEEEEEEE");\n';
            content+='\tprint();\n';

            window['Fun'+arregloVariables[i].variables] = new Function(
                 'return function hola(){'+
                        content+
                '}'
            )();

            window['Fun'+arregloVariables[i].variables]();

            //window['Connection'+i]();
        }*/
    /*};
}*/
/*function createMethods () {
    contadorVariablesFinales = 0;
    window["variablesFinales"] = [];
    console.log(arregloVariables);
    for (var i = 0; i < arregloVariables.length; i++) {
        console.log("21212121121");
        console.log(arregloDeFunciones[i]);
        console.log(arregloDeFunciones);
        console.log(arregloDeReglas);
        window[arregloVariables[i].variables] = 0;
        //if(arregloDeFunciones[i]!= null){
        if(arregloDeFunciones[i].length > 0){
            contadorVariablesFinales++;
            console.log(arregloVariables[i].ID);*/
            /*var coneccion = conec.filter(function( object ) {
                return object.idVariable == arregloVariables[i].ID;
            });*/
            /*window['Connection'+i] = new Function(
                 'return function hola(){'+
                        'const sql = require("mssql");'+
                        'const pool = new sql.ConnectionPool({'+
                            'user: "'+coneccion[0].usuario+'",'+
                            'password: "'+coneccion[0].constrasena+'",'+
                            'server: "'+coneccion[0].server+'",'+
                            'database: "'+coneccion[0].basedatos+'"'+
                        '});'+
                        'pool.connect(err => {'+
                            'pool.request()'+
                            '.query("select * from '+coneccion[0].tabla+'", (err, result) => {'+
                                'if(err){'+
                                    '$("body").overhang({'+
                                        'type: "error",'+
                                        'primary: "#f84a1d",'+
                                        'accent: "#d94e2a",'+
                                        'message: "Intento de conexión fallido.",'+
                                        'duration: 2,'+
                                        'overlay: true'+
                                    '});'+
                                '} else {'+
                                    '$("body").overhang({'+
                                        'type: "success",'+
                                        'primary: "#f84a1d",'+
                                        'accent: "#d94e2a",'+
                                        'message: "EXITOOOO.",'+
                                        'duration: 2,'+
                                        'overlay: true'+
                                    '});'+
                                    'console.log(result);'+
                                    coneccion[0].arreglo+'=result.recordset;'+
                                    'Fun'+arregloVariables[i].variables+'()'+
                                '}'+
                            '});'+
                        '});'+
                '}'
            )();*/
            /*var varMonto = '';
            if(arreglosNombres[i] == "arregloActivos")
                varMonto = 'monto';
            if(arreglosNombres[i] == "arregloDepositos")
                varMonto = 'totalDepositos';*/

            //window[coneccion[0].arreglo] = [];
            //console.log("THOOOOR");
            //console.log(arregloActivos[0].monto);
            /*for (var k = 0; k < arregloActivos.length; k++) {
                console.log(arregloActivos[k]);
            };
            console.log(arregloDeFunciones[i]);
            console.log(arregloDeFunciones);
            console.log("THOOOOR");

            var content = '\tfor (var i = 0; i < '+arreglosNombres[i]+'.length; i++) {';
            if(varMonto == "totalDepositos") {
                content+='console.log(arregloDepositos[i].idCliente == "1");';
                content+='console.log(arregloDepositos[i].idCliente);';
            }
            for (var j = 0; j < arregloDeFunciones[i].length; j++) {
                content+="\t\t"+arregloDeFunciones[i][j]+"\n";*/
                /*content+='console.log("HOLAAAA = ");';
                content+='console.log('+arreglosNombres[i]+'[0].monto);';*/
            /*};
            content+='\t}\n';
            ``+='\tvar total = 0;\n';
            content+='\tfor (var j = 0; j < '+arreglosNombres[i]+'.length; j++) {\n'+
                        '\t\ttotal+='+arreglosNombres[i]+'[j].'+varMonto+';\n'+
                        '\t\tconsole.log('+arreglosNombres[i]+'[j].nombre+" = "+'+arreglosNombres[i]+'[j].'+varMonto+');\n'+
                        '\t\tconsole.log(total);\n'+
                    '\t}\n';
            content+='\tconsole.log('+arreglosNombres[i]+');\n';
            content+='\tconsole.log("TOTAL = "+total);\n';
            content+='\twindow['+arregloVariables[i].variables+'] = total;\n';
            content+='\twindow["variablesFinales"].push({variable: "'+arregloVariables[i].variables+'", total: total});\n';
            content+='\tconsole.log("YEEEEEEEEEEEEEEEEEEEEEEE");\n';
            content+='\tconsole.log(window["variablesFinales"]);\n';
            content+='\tconsole.log("YEEEEEEEEEEEEEEEEEEEEEEE");\n';
            content+='\tprint();\n';

            window['Fun'+arregloVariables[i].variables] = new Function(
                 'return function hola(){'+
                        content+
                '}'
            )();

            window['Fun'+arregloVariables[i].variables]();

            //window['Connection'+i]();
        }*//* else 
            window["variablesFinales"].push({variable: arregloVariables[i].variables, total: 0});*/
        /*var reultado = new Function('console.log(window["ALAC"]);console.log("'+formulaGlobal+'");'+formulaGlobal+';console.log(window["RCL"]);');
        reultado();*/
    //};
    /*console.log("YAAAAAA");
    console.log(window["variablesFinales"]);
    for (var i = 0; i < window["variablesFinales"].length; i++) {
        console.log(window["variablesFinales"][i]);
    };*/
//}

function print () {
    var form = formulaGlobal;
    if(contadorVariablesFinales == contadorFuncionPrint){
        for (var i = 0; i < window["variablesFinales"].length; i++) {
            console.log(window["variablesFinales"][i]);
            console.log(window["variablesFinales"]);
            console.log('FORMULA ANTES');
            console.log(form);
            if(form.indexOf(window["variablesFinales"][i].variable.toLowerCase()) > -1) {
                form = form.slice(0, form.indexOf(window["variablesFinales"][i].variable.toLowerCase())) + window["variablesFinales"][i].total + form.slice(form.indexOf(window["variablesFinales"][i].variable.toLowerCase()) + window["variablesFinales"][i].variable.length);
                console.log("i = "+i+" "+form);
            } else if(form.indexOf(window["variablesFinales"][i].variable.toUpperCase()) > -1) {
                form = form.slice(0, form.indexOf(window["variablesFinales"][i].variable.toUpperCase())) + window["variablesFinales"][i].total + form.slice(form.indexOf(window["variablesFinales"][i].variable.toUpperCase()) + window["variablesFinales"][i].variable.length);
                console.log("i = "+i+" "+form);
            }
            console.log('FORMULA DESPUES');
            console.log(form);
        };
        var resultado = math.eval(form.split("=")[1]);
        //saveRCL(resultado);
    }
}

function saveRCL (rcl) {
    var fecha = new Date();
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("insert into RCL (fecha, RCL) values ('"+formatDateCreationSingleDigits(fecha)+"',"+rcl+")", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack MainDB Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed MainDB Variables");
                    console.log(result);
                });
            }
        });
    }); // fin transaction
}

function formatDateCreationSingleDigits(date) {
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return year + '-' + (monthIndex+1) + '-' + day;
}
//	**********		Fin Calculo RCL		**********







//	**********		Route Change		**********
function goVariables () {
	$("#app_root").empty();
    $("#app_root").load("src/variables.html");
}

function goHome () {
	$("#app_root").empty();
    $("#app_root").load("src/home.html");
}

function goUsers () {
	$("#app_root").empty();
    $("#app_root").load("src/users.html");
}

function goConnections () {
    $("#app_root").empty();
    $("#app_root").load("src/importaciones.html");
}

function logout () {
	$("#app_root").empty();
    $("#app_root").load("src/login.html");
	session.defaultSession.clearStorageData([], (data) => {});
}

function goRCL () {
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
}

function goReports () {
    $("#app_root").empty();
    $("#app_root").load("src/reportes.html");
}