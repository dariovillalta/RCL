const electron = require('electron');
const path = require('path');
const remote = require('electron').remote;
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
	else{
		console.log('pool loaded');
        loadVariablesMainDB();
        loadVariables();
        loadVariableVariables();
        loadAssets();
        loadDeposits();
		/*loadLists();
		loadText();*/
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

var arregloVariables = [];
var arregloVariablesDeVariables = [];
var arregloVarDeVarFormula = [];
var arregloActivos = [];
var arregloDepositos = [];
var arregloDeFiltros = [];
var arregloDeReglas = [];
var formulaGlobal = '';
var contadorEntrarCreateFunctionsArray = 0;
var contadorFuncionPrint = 0;

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

function loadRules (id, idVariable) {
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
                    console.log('error en rolledBack MainDB Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    console.log("Transaction committed MainDB Variables");
                    console.log(result);
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
                        else
                            $("#formulas").text("$$f(x)$$");
                        MathLive.renderMathInDocument();
                    } else {
                        //
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
                    console.log('error en rolledBack Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            } else {
                transaction.commit(err => {
                    console.log("Transaction committed Variables");
                    console.log(result);
                    if(result.recordset.length > 0){
                        arregloVariables = result.recordset;
                        console.log('arregloVariables');
                        console.log(arregloVariables);
                        loadConections();
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
                    console.log('error en rolledBack Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    console.log("Transaction committed VariablesdeVariables");
                    console.log(result);
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
                    console.log('error en rolledBack Activos');
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
                        arregloActivos = result.recordset;
                        console.log('arregloActivos');
                        console.log(arregloActivos);
                    } else {
                        arregloActivos = [];
                    }
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
                });
            }
        });
    }); // fin transaction
}







//	**********		Calculo RCL		**********
var arreglosNombres = [];
function calculateRCL () {
    arreglosNombres = [];
    contadorFuncionPrint = 0;
    if(formulaGlobal.length > 0) {
        if(arregloVariables.length > 0) {
            if(arregloVariablesDeVariables.length > 0) {
                /*for (var i = 0; i < arregloVariables.length; i++) {
                    for (var j = 0; j < arregloVariablesDeVariables.length; j++) {
                        var entro = false;
                        if(arregloVariables[i].ID == arregloVariablesDeVariables[j].idVariable) {
                            var arregloNombre = '';
                            if(arregloVariablesDeVariables[i].tablaAplicar == 1)
                                arregloNombre = 'arregloActivos';
                            else if(arregloVariablesDeVariables[i].tablaAplicar == 2)
                                arregloNombre = 'arregloDepositos';
                            arreglosNombres.push(arregloNombre);
                            entro = true;
                            contadorFuncionPrint++;
                            break;
                        } else if(j == arregloVariablesDeVariables.length-1 && !entro)
                            arreglosNombres.push("");
                    };
                };
                var cancelar = false, texto = '', tabla = '';
                for (var i = 0; i < arregloVariables.length; i++) {
                    if(arregloVariables[i].tablaAplicar == 1 && arregloActivos.length == 0) {
                        cancelar = true;
                        texto = arregloVariables[i].variables;
                        tabla = 'activos';
                        break;
                    } else if(arregloVariables[i].tablaAplicar == 2 && arregloDepositos.length == 0) {
                        cancelar = true;
                        texto = arregloVariables[i].variables;
                        tabla = 'depositos';
                        break;
                    }
                };
                if(cancelar) {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "No existen valores en la base de datos de la tabla "+tabla+" y la variable "+texto+" los ocupa.",
                        duration: 3,
                        overlay: true
                    });
                } else getRulesByVariable();*/
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

function getVariable (equacion, index) {
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
}

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
function createMethods () {
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
        };
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
    };
}
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

function logout () {
	$("#app_root").empty();
    $("#app_root").load("src/login.html");
	session.defaultSession.clearStorageData([], (data) => {});
}

function goRCL () {
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
}