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
	if(err)
		console.log(err);
	else{
		console.log('pool loaded');
        loadVariablesMainDB();
        loadVariables();
        loadVariableVariables();
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
var arregloConecciones = [];
var arregloDeReglas = [];
var arregloDeComprobacionDeReglas = [];
var formulaGlobal = '';

function loadRules (id, idVariable) {
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
                    if(result.recordset.length > 0){
                        var index = -1;
                        for (var i = 0; i < arregloDeComprobacionDeReglas.length; i++) {
                            if(arregloDeComprobacionDeReglas[i] == idVariable){
                                index = i;
                                break;
                            }
                        };
                        if(index == -1) {
                            arregloDeComprobacionDeReglas.push(arregloVariablesDeVariables[i].idVariable);
                            arregloDeReglas.push(result.recordset);
                        } else 
                            $.merge( arregloDeReglas[index], result.recordset );
                    } else {
                        arregloDeReglas.push(null);
                        arregloDeComprobacionDeReglas.push(null);
                    }
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
                        loadConections();
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

function loadConections () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true
        });
        const request = new sql.Request(transaction);
        request.query("select * from Bases", (err, result) => {
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
                    console.log("Transaction committed MainDB Variables");
                    console.log(result);
                    if(result.recordset.length > 0){
                        arregloConecciones = result.recordset;
                    } else {
                        arregloConecciones = [];
                    }
                    renderConections();
                });
            }
        });
    }); // fin transaction
}

function renderConections () {
    $("#coneccionesList").empty();
    var content = '';
    var entro = false;
    for (var i = 0; i < arregloVariables.length; i++) {
        content+="<div class='row'><label class='col-xs-offset-1 col-xs-5'>"+arregloVariables[i].nombre+"</label>"
        var conneciones = arregloConecciones.filter(function( object ) {
                                return object.idVariable == arregloVariables[i].ID;
                            });
        if(conneciones.length > 0)
            content+="<div class='col-xs-offset-1 col-xs-5'><select class='select-style'>";
        for (var j = 0; j < conneciones.length; j++) {
            entro = true;
            content+="<option value='"+conneciones[j].ID+"'>"+conneciones[j].tipo+"</option>";
        };
        content+="</select></div></div><br/>";
    };
    if(entro)
        $("#coneccionesList").append(content);
}







//	**********		Calculo RCL		**********
var arreglosNombres = [];
function calculateRCL () {
    arreglosNombres = [];
    /*for (var i = 0; i < arregloVariables.length; i++) {
        var variables =  arregloVariables.filter(function( object ) {
                                return object.idVariable == arregloVariables[i].ID;
                            });
        var opciones = [];
        for (var j = i; j < document.getElementsByTagName("select").length; j++) {
            opciones.push(document.getElementsByTagName("select")[j].value);
            var id = parseInt(document.getElementsByTagName("select")[j].value);
            var conec = arregloConecciones.filter(function( object ) {
                            return object.ID == id;
                        });
            arreglosNombres.push(conec[0].arreglo);
        };
        console.log(opciones[i]);
        console.log(variables);
        // if(opciones[i].length<1 && variables.length<1){
        //     $("body").overhang({
        //         type: "error",
        //         primary: "#f84a1d",
        //         accent: "#d94e2a",
        //         message: "No se selecciono una conección para la varaiable "+arregloVariables[i].nombre+".",
        //         duration: 3,
        //         overlay: true
        //     });
        //     entrar = false;
        //     arreglosNombres = [];
        //     break;
        // }
    }*/
    for (var j = 0; j < document.getElementsByTagName("select").length; j++) {
        var id = parseInt(document.getElementsByTagName("select")[j].value);
        var conec = arregloConecciones.filter(function( object ) {
                        return object.ID == id;
                    });
        arreglosNombres.push(conec[0].arreglo);
    };
    console.log(arreglosNombres);
    getRulesByVariable();
}

function getRulesByVariable () {
    arregloDeReglas = [];
    arregloDeComprobacionDeReglas = [];
    for (var i = 0; i < arregloVariablesDeVariables.length; i++) {
        loadRules(arregloVariablesDeVariables[i].ID, arregloVariablesDeVariables[i].idVariable);
    }
}
var arregloDeFunciones = [];
function createFunctionsArray (argument) {
    if(arregloDeReglas.length == arreglosNombres.length) {
        arregloDeFunciones = [];
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
            arregloDeFunciones.push(rulesArray);
        };
        for (var j = 0; j < arregloVariables.length; j++) {
            var entro = false;
            var varialesHijas = arregloVariablesDeVariables.filter(function( object ) {
                                    return object.idVariable == arregloVariables[j].ID;
                                });
            for (var k = 0; k < varialesHijas.length; k++) {
                for (var i = 0; i < arregloDeReglas.length; i++) {
                    for (var r = 0; r < arregloDeReglas[i].length; r++) {
                        if(arregloDeReglas[i][r].variablePadre == varialesHijas[k].ID)
                            entro = true;
                    };
                };
            };
            if(!entro)
                arregloDeFunciones.splice(j, 0, null);
        };
        createMethods();
    }
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
    if(regla.campoObjetivo.indexOf('COLUMNA') == 0) {
        if(esCondicion) {
            var campo = arreglosNombres[index]+"[i]."+regla.campoObjetivo.split("=")[1];

            // Agregando campo Operacion
            arreglo.push(tabsText+"if ( "+campo+" "+regla.operacion);
            posicionesIF.push(arreglo.length);
        } else {
            var campo = arreglosNombres[index]+"[i]."+regla.campoObjetivo.split("=")[1];

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
                if(regla.operacion=="=")
                    arreglo.push("\n"+tabsText+valorElemento+" "+regla.operacion);
                else
                    arreglo.push("\n"+tabsText+valorElemento+" = "+valorElemento+" "+regla.operacion);
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
            var valor = arreglosNombres[index]+"[i]."+regla.valor.split("=")[1];
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i] += " "+valor+" )  {";
                textVariables[i] += " " + valor;
            };
        } else {
            var valor = arreglosNombres[index]+"[i]."+regla.valor.split("=")[1];
            for (var i = 0; i < arreglo.length; i++) {
                arreglo[i] += " "+valor+" )  {";
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
                            arreglo[j] += " "+valorElemento + textoFinal;
                            textVariables[j] += " " + valorElemento;
                        } else {
                            var textoFinal = '';
                            if(i+1 == arregloLista.length)
                                textoFinal = " ) {";
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
                            arreglo[j] += " "+valorElemento + " ) {";
                            textVariables[j] += " " + valorElemento;
                        } else {
                            arreglo.push("\n"+copiaRegla[j]+" "+valorElemento+" ) {");
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
            for (var i = 0; i < arregloLista.length; i++) {
                for (var j = 0; j < arreglo.length; j++) {
                    var opcionAMostrar = arregloLista[i].split("$");
                    var valorElemento = arregloLista[i];
                    if(opcionAMostrar.length > 1){
                        if(opcionAMostrar[1] == "1")
                            valorElemento = opcionAMostrar[0].split("-")[0];
                        else
                            valorElemento = opcionAMostrar[0].split("-")[1];
                    }
                    if(i==0) {
                        arreglo[j] += " "+valorElemento + " ) {";
                        textVariables[j] += " " + valorElemento;
                    } else {
                        arreglo.push("\n"+copiaRegla+" "+valorElemento);
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

function createMethods () {
    var conec = [];
    for (var i = 0; i < arreglosNombres.length; i++) {
        var object = arregloConecciones.filter(function( object ) {
                return object.arreglo == arreglosNombres[i];
            });
        conec.push(object[0]);
    };
    for (var i = 0; i < arregloVariables.length; i++) {
        console.log("21212121121");
        console.log(arregloDeFunciones[i]);
        console.log(arregloDeFunciones);
        console.log(arregloDeReglas);
        window[arregloVariables[i].variables] = 0;
        window["variablesFinales"] = [];
        if(arregloDeFunciones[i] != null){
            console.log('conec');
            console.log(conec);
            console.log('arregloConecciones');
            console.log(arregloConecciones);
            console.log(arregloVariables[i].ID);
            var coneccion = conec.filter(function( object ) {
                return object.idVariable == arregloVariables[i].ID;
            });
            console.log('coneccion');
            console.log(coneccion);
            window['Connection'+i] = new Function(
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
            )();

            window[coneccion[0].arreglo] = [];

            var content = 'for (var i = 0; i < '+coneccion[0].arreglo+'.length; i++) {';
            for (var j = 0; j < arregloDeFunciones[i].length; j++) {
                content+=arregloDeFunciones[i][j];
            };
            content+='}';
            content+='var total = 0;';
            content+='for (var j = 0; j < '+coneccion[0].arreglo+'.length; j++) {'+
                        'total+='+coneccion[0].arreglo+'[j].monto;'+
                    '}';
            content+='console.log("TOTAL = "+total);';
            content+='window['+arregloVariables[i].variables+'] = total;';
            content+='window["variablesFinales"].push({variable: "'+arregloVariables[i].variables+'", total: total});';
            content+='print();';

            window['Fun'+arregloVariables[i].variables] = new Function(
                 'return function hola(){'+
                        content+
                '}'
            )();

            window['Connection'+i]();
        }/* else 
            window["variablesFinales"].push({variable: arregloVariables[i].variables, total: 0});*/
        /*var reultado = new Function('console.log(window["ALAC"]);console.log("'+formulaGlobal+'");'+formulaGlobal+';console.log(window["RCL"]);');
        reultado();*/
    };
    /*console.log("YAAAAAA");
    console.log(window["variablesFinales"]);
    for (var i = 0; i < window["variablesFinales"].length; i++) {
        console.log(window["variablesFinales"][i]);
    };*/
}

function print () {
    var form = formulaGlobal;
    if(window["variablesFinales"].length == arreglosNombres.length){
        for (var i = 0; i < window["variablesFinales"].length; i++) {
            console.log(window["variablesFinales"][i]);
            if(form.indexOf(window["variablesFinales"][i].variable) > -1) {
                form = form.slice(0, form.indexOf(window["variablesFinales"][i].variable)) + window["variablesFinales"][i].total + form.slice(form.indexOf(window["variablesFinales"][i].variable) + window["variablesFinales"][i].variable.length);
                console.log("i = "+i+" "+form);
            }
        };
        var resultado = math.eval(form.split("=")[1]);
        saveRCL(resultado);
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