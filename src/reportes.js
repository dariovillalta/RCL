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
		//loadVariablesIMG();
		var hoy = new Date();
        loadTotalsFilter(hoy, hoy);
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



/*Var DECLAR*/
var arregloTotales = [];	//ORDERD BY STATUS, ETC
var arregloQuery = [];    //
var arregloVariables = [];	//Arreglo de variables FormulaVariables
var arregloVariablesDeVariables = [];	//Arreglo de variables VariablesdeVariablesFormula
var arregloVariablesDeSubVariables = [];   //Arreglo de variables Reglas
var arregloCuentas = [];   //Arreglo de cuentas
var arregloProyecciones = [{tipo: 30, seleccionada: true}, {tipo: 60, seleccionada: true}, {tipo: 90, seleccionada: true}, {tipo: 120, seleccionada: true}];   //Arreglo de proyecciones




$("#varCheck").iCheck({
    checkboxClass: 'icheckbox_flat-green',
    radioClass: 'iradio_flat-green'
});
$("#subvarCheck").iCheck({
    checkboxClass: 'icheckbox_flat-green',
    radioClass: 'iradio_flat-green'
});
$("#varDeSubVarCheck").iCheck({
    checkboxClass: 'icheckbox_flat-green',
    radioClass: 'iradio_flat-green'
});
$("#cuentasCheck").iCheck({
    checkboxClass: 'icheckbox_flat-green',
    radioClass: 'iradio_flat-green'
});








/* ****************** 		LOADING IMG 	****************** */
/*var filepathFullLogo = '';
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
                    	} else
                    		filepathFullLogo = '';
                    	if(result.recordset[0].smallLogo.length > 0){
                    		filepathSmallLogo = result.recordset[0].smallLogo;
                    		$("#smallLogo").attr("src",filepathSmallLogo);
                    		$("#smallLogo").css("height","3.4em");
                    	} else
                    		filepathSmallLogo = '';
                    } else {
                    	objetoBandera = null;
                    	filepathFullLogo = '';
                    	filepathSmallLogo = '';
                    }
                });
            }
        });
    }); // fin transaction
}*/
/* ****************** 		END LOADING IMG 	****************** */

/* ****************** 		LOADING VARIABLES 	****************** */
/*function loadVariables () {
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
                        for (var i = 0; i < result.recordset.length; i++) {
                        	arregloVariables.push({ID: result.recordset[i].ID, variables: result.recordset[i].variables, seleccionada: true, formula: result.recordset[i].formula});
                        };
                    } else{
                        arregloVariables = [];
                    }
                    renderVariables();
                    loadVariableVariables();
                    var hoy = new Date();
                    loadTotals(hoy, hoy);
                });
            }
        });
    }); // fin transaction
}*/
/* ****************** 		END LOADING VARIABLES 	********* */

/* ****************** 		LOADING VARIABLES OF VARIABLES 	********* */
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
                    if(result.recordset.length > 0){
                        for (var i = 0; i < result.recordset.length; i++) {
                            arregloVariablesDeVariables.push({ID: result.recordset[i].ID, variables: result.recordset[i].nombre, seleccionada: true});
                        };
                    } else{
                        arregloVariablesDeVariables = [];
                    }
                    renderSubVariables();
                    loadVariableSubVariables();
                });
            }
        });
    }); // fin transaction
}*/
/* ****************** 		END LOADING VARIABLES OF VARIABLES 	********* */

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
                                arregloVariablesDeSubVariables.push({ID: result.recordset[i].ID, variables: result.recordset[i].variables, seleccionada: true, variablePadre: result.recordset[i].variablePadre});
                            } else if (result.recordset[i].campoObjetivo.indexOf("AGRUPACION") == 0) {
                                arregloVariablesDeSubVariables.push({ID: result.recordset[i].ID, variables: result.recordset[i].variables, seleccionada: true, variablePadre: result.recordset[i].variablePadre});
                            }
                        };
                    } else {
                        arregloVariablesDeSubVariables = [];
                    }
                    renderVariablesSubVariables();
                });
            }
        });
    }); // fin transaction
}*/
/* ******************       END LOADING VARIABLES OF SUB-VARIABLES  ********* */

/* ******************       LOADING TOTALS  ********* */
function loadTotalsFilter (inicioF, finalF) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from Totales where fecha between '"+formatDateCreation(inicioF)+"' and '"+formatDateCreation(finalF)+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de Totales.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        arregloTotales = [];
                        for (var i = 0; i < result.recordset.length; i++) {
                            var estado;
                            if(result.recordset[i].esRCL) {
                                if(result.recordset[i].total > 1)
                                    estado = 1;
                                else
                                    estado = 0;
                                result.recordset[i].total *= 100;
                                result.recordset[i].total = result.recordset[i].total.toString()+"%";
                            } else {
                                if(result.recordset[i].total > 0)
                                    estado = 1;
                                else
                                    estado = 0;
                            }
                            /*if(result.recordset[i].esNumerador){
                                if(result.recordset[i].denominador != 1) {
                                    result.recordset[i].influenciaFormula = ((result.recordset[i].influenciaFormula/result.recordset[i].denominador)*100).toFixed(2)+"%";
                                    result.recordset[i].volumenFormula = ((result.recordset[i].volumenFormula/result.recordset[i].denominador)*100).toFixed(2)+"%";
                                } else {
                                    result.recordset[i].influenciaFormula = ((result.recordset[i].influenciaFormula/result.recordset[i].totalRCL)*100).toFixed(2)+"%";
                                    result.recordset[i].volumenFormula = ((result.recordset[i].volumenFormula/result.recordset[i].totalRCL)*100).toFixed(2)+"%";
                                }
                            } else {
                                result.recordset[i].influenciaFormula = (((result.recordset[i].influenciaFormula/result.recordset[i].denominador)*result.recordset[i].totalRCL)*100).toFixed(2)+"%";
                                result.recordset[i].volumenFormula = (((result.recordset[i].volumenFormula/result.recordset[i].denominador)*result.recordset[i].totalRCL)*100).toFixed(2)+"%";
                            }*/
                            result.recordset[i].fecha =  new Date(result.recordset[i].fecha.getUTCFullYear(), result.recordset[i].fecha.getUTCMonth(), result.recordset[i].fecha.getUTCDate());
                            arregloTotales.push({nombreVariable: result.recordset[i].nombreVariable, fecha: result.recordset[i].fecha, tipoProyeccion: result.recordset[i].tipoProyeccion, volumenFormula: result.recordset[i].volumenFormula, influenciaFormula: result.recordset[i].influenciaFormula, numerador: result.recordset[i].numerador, denominador: result.recordset[i].denominador, total: result.recordset[i].total, tipo: result.recordset[i].tipo, estado: estado, variablePadre: result.recordset[i].varPadre})
                        };
                    } else{
                        arregloTotales = [];
                    }
                    arregloQuery = arregloTotales.slice();
                    prepareVariablesArray();
                    //filterReport();
                });
            }
        });
    }); // fin transaction
}

function prepareVariablesArray () {
    arregloVariables = [];
    arregloVariablesDeVariables = [];
    arregloVariablesDeSubVariables = [];
    arregloCuentas = [];
    for (var i = 0; i < arregloTotales.length; i++) {
        if(arregloTotales[i].tipo.localeCompare("variable") == 0 && noExiste(arregloVariables, arregloTotales[i].nombreVariable) ) {
            arregloVariables.push({variables: arregloTotales[i].nombreVariable, variablePadre: arregloTotales[i].variablePadre, seleccionada: true});
        } else if(arregloTotales[i].tipo.localeCompare("subVariable") == 0 && noExiste(arregloVariablesDeVariables, arregloTotales[i].nombreVariable)) {
            arregloVariablesDeVariables.push({variables: arregloTotales[i].nombreVariable, variablePadre: arregloTotales[i].variablePadre, seleccionada: true});
        } else if(arregloTotales[i].tipo.localeCompare("varDeSubVariable") == 0 && noExiste(arregloVariablesDeSubVariables, arregloTotales[i].nombreVariable)) {
            arregloVariablesDeSubVariables.push({variables: arregloTotales[i].nombreVariable, variablePadre: arregloTotales[i].variablePadre, seleccionada: true});
        } else if(arregloTotales[i].tipo.localeCompare("cuenta") == 0 && noExiste(arregloCuentas, arregloTotales[i].nombreVariable)) {
            arregloCuentas.push({variables: arregloTotales[i].nombreVariable, variablePadre: arregloTotales[i].variablePadre, seleccionada: true});
        }
    };
    console.log(arregloVariables)
    console.log(arregloVariablesDeVariables)
    console.log(arregloVariablesDeSubVariables)
    console.log(arregloCuentas)
    $("#varCheck").iCheck('check');
    $("#subvarCheck").iCheck('check');
    $("#varDeSubVarCheck").iCheck('check');
    $("#cuentasCheck").iCheck('check');
    renderVariables();
    renderSubVariables();
    renderVariablesSubVariables();
    renderCuentas();
    filterReport();
}

function noExiste (arreglo, variable) {
    for (var i = 0; i < arreglo.length; i++) {
        if(arreglo[i].variables.localeCompare(variable) == 0) {
            return false;
        }
    };
    return true;
}

/*var admiral = [
	//rojo
	{color1: "#ffebee", color2: "#d50000"},
	{color1: "#e57373", color2: "#ff1744"},
	{color1: "#f44336", color2: "#ff8a80"},

	//como rosado,fuscia
	{color1: "#fce4ec", color2: "#f50057"},
	{color1: "#f06292", color2: "#880e4f"},
	{color1: "#d81b60", color2: "#d81b60"},

	//morado
	{color1: "#f3e5f5", color2: "#aa00ff"},
	{color1: "#ba68c8", color2: "#4a148c"},
	{color1: "#ab47bc", color2: "#4a148c"},

	//morado
	{color1: "#ede7f6", color2: "#6200ea"},
	{color1: "#9575cd", color2: "#311b92"},
	{color1: "#673ab7", color2: "#b388ff"},

	//indigo
	{color1: "#e8eaf6", color2: "#304ffe"},
	{color1: "#7986cb", color2: "#536dfe"},
	{color1: "#303f9f", color2: "#8c9eff"},

	//azul
	{color1: "#e3f2fd", color2: "#2962ff"},
	{color1: "#42a5f5", color2: "#0d47a1"},
	{color1: "#2196f3", color2: "#0d47a1"},

	//azul mas claro casi verde
	{color1: "#e1f5fe", color2: "#0091ea"},
	{color1: "#4fc3f7", color2: "#80d8ff"},
	{color1: "#039be5", color2: "#40c4ff"},

	//cyan
	{color1: "#e0f7fa", color2: "#00b8d4"},
	{color1: "#4dd0e1", color2: "#00e5ff"},
	{color1: "#00acc1", color2: "#006064"},

	//teal
	{color1: "#e0f2f1", color2: "#00bfa5"},
	{color1: "#26a69a", color2: "#004d40"},
	{color1: "#00897b", color2: "#a7ffeb"},

	//verde
	{color1: "#e8f5e9", color2: "#00c853"},
	{color1: "#66bb6a", color2: "#b9f6ca"},
	{color1: "#1b5e20", color2: "#43a047"},

	//verde mas claro
	{color1: "#f1f8e9", color2: "#64dd17"},
	{color1: "#aed581", color2: "#ccff90"},
	{color1: "#7cb342", color2: "#33691e"},

	//morado
	{color1: "#ede7f6", color2: "#6200ea"},
	{color1: "#9575cd", color2: "#311b92"},
	{color1: "#673ab7", color2: "#b388ff"},
]*/

/*var admiral = [
    //rojo
    {color1: "#ffebee", color2: "#d50000"},
    {color1: "#e57373", color2: "#ff1744"},
    {color1: "#f44336", color2: "#ff8a80"},

    //gris claro
    {color1: "#eceff1", color2: "#263238"},
    {color1: "#90a4ae", color2: "#37474f"},
    {color1: "#546e7a", color2: "#cfd8dc"},

    //como rosado,fuscia
    {color1: "#fce4ec", color2: "#f50057"},
    {color1: "#f06292", color2: "#880e4f"},
    {color1: "#d81b60", color2: "#d81b60"},

    //gris oscuro
    {color1: "#fafafa", color2: "#212121"},
    {color1: "#eeeeee", color2: "#424242"},
    {color1: "#9e9e9e", color2: "#f5f5f5"},

    //morado
    {color1: "#f3e5f5", color2: "#aa00ff"},
    {color1: "#ba68c8", color2: "#4a148c"},
    {color1: "#ab47bc", color2: "#4a148c"},

    //cafe
    {color1: "#d7ccc8", color2: "#3e2723"},
    {color1: "#6d4c41", color2: "#efebe9"},
    {color1: "#a1887f", color2: "#4e342e"},

    //morado
    {color1: "#ede7f6", color2: "#6200ea"},
    {color1: "#9575cd", color2: "#311b92"},
    {color1: "#673ab7", color2: "#b388ff"},

    //naranja
    {color1: "#ffccbc", color2: "#dd2c00"},
    {color1: "#ff6e40", color2: "#bf360c"},
    {color1: "#ff7043", color2: "#ff3d00"},

    //lima
    {color1: "#f9fbe7", color2: "#aeea00"},
    {color1: "#dce775", color2: "#827717"},
    {color1: "#cddc39", color2: "#eeff41"},

    //naranja
    {color1: "#ffccbc", color2: "#dd2c00"},
    {color1: "#ff6e40", color2: "#bf360c"},
    {color1: "#ff7043", color2: "#ff3d00"},

    //azul
    {color1: "#e3f2fd", color2: "#2962ff"},
    {color1: "#42a5f5", color2: "#0d47a1"},
    {color1: "#2196f3", color2: "#0d47a1"},

    //azul mas claro casi verde
    {color1: "#e1f5fe", color2: "#0091ea"},
    {color1: "#4fc3f7", color2: "#80d8ff"},
    {color1: "#039be5", color2: "#40c4ff"},

    //naranja claro
    {color1: "#ff6d00", color2: "#ffe0b2"},
    {color1: "#ffa726", color2: "#e65100"},
    {color1: "#fff3e0", color2: "#ff9100"},

    //cyan
    {color1: "#e0f7fa", color2: "#00b8d4"},
    {color1: "#4dd0e1", color2: "#00e5ff"},
    {color1: "#00acc1", color2: "#006064"},

    //amber
    {color1: "#ffecb3", color2: "#ffab00"},
    {color1: "#fff8e1", color2: "#ffc400"},
    {color1: "#ffc107", color2: "#ff6f00"},

    //teal
    {color1: "#e0f2f1", color2: "#00bfa5"},
    {color1: "#26a69a", color2: "#004d40"},
    {color1: "#00897b", color2: "#a7ffeb"},

    //amarillo
    {color1: "#fffde7", color2: "#ffd600"},
    {color1: "#ffea00", color2: "#fff176"},
    {color1: "#ffee58", color2: "#f57f17"},

    //verde
    {color1: "#e8f5e9", color2: "#00c853"},
    {color1: "#66bb6a", color2: "#b9f6ca"},
    {color1: "#1b5e20", color2: "#43a047"},

    //indigo
    {color1: "#e8eaf6", color2: "#304ffe"},
    {color1: "#7986cb", color2: "#536dfe"},
    {color1: "#303f9f", color2: "#8c9eff"},

    //verde mas claro
    {color1: "#f1f8e9", color2: "#64dd17"},
    {color1: "#aed581", color2: "#ccff90"},
    {color1: "#7cb342", color2: "#33691e"},
]*/
var coloresPareja = [
    {color1: "#fafafa", color2: "#212121"},
    {color1: "#ff6d00", color2: "#ffe0b2"},
	{color1: "#ffebee", color2: "#d50000"},
    //{color1: "#d7ccc8", color2: "#3e2723"},
    //{color1: "#eceff1", color2: "#263238"},
	{color1: "#f3e5f5", color2: "#aa00ff"},
    {color1: "#ffccbc", color2: "#dd2c00"},
    {color1: "#fffde7", color2: "#ffd600"},
	{color1: "#fce4ec", color2: "#f50057"},
	{color1: "#ede7f6", color2: "#6200ea"},
	{color1: "#e1f5fe", color2: "#0091ea"},
	{color1: "#e8eaf6", color2: "#304ffe"},
	{color1: "#e0f7fa", color2: "#00b8d4"},
    {color1: "#ffecb3", color2: "#ffab00"},
    {color1: "#ffa726", color2: "#e65100"},
	{color1: "#e3f2fd", color2: "#2962ff"},
	{color1: "#f1f8e9", color2: "#64dd17"},
	{color1: "#e8f5e9", color2: "#00c853"},
	{color1: "#e57373", color2: "#ff1744"},
	{color1: "#e0f2f1", color2: "#00bfa5"},
	{color1: "#f06292", color2: "#880e4f"},
    {color1: "#fff8e1", color2: "#ffc400"},
	{color1: "#ba68c8", color2: "#4a148c"},
	{color1: "#42a5f5", color2: "#0d47a1"},
	{color1: "#7986cb", color2: "#536dfe"},
    {color1: "#ff6e40", color2: "#bf360c"},
	{color1: "#9575cd", color2: "#311b92"},
	{color1: "#4fc3f7", color2: "#80d8ff"},
    {color1: "#ffc107", color2: "#ff6f00"},
	{color1: "#4dd0e1", color2: "#00e5ff"},
    {color1: "#6d4c41", color2: "#efebe9"},
    {color1: "#ffea00", color2: "#fff176"},
	{color1: "#66bb6a", color2: "#b9f6ca"},
    {color1: "#eeeeee", color2: "#424242"},
	{color1: "#7cb342", color2: "#33691e"},
    {color1: "#90a4ae", color2: "#37474f"},
	{color1: "#26a69a", color2: "#004d40"},
	{color1: "#aed581", color2: "#ccff90"},
	{color1: "#f44336", color2: "#ff8a80"},
	{color1: "#ab47bc", color2: "#4a148c"},
	{color1: "#303f9f", color2: "#8c9eff"},
	{color1: "#673ab7", color2: "#b388ff"},
	{color1: "#039be5", color2: "#40c4ff"},
    {color1: "#a1887f", color2: "#4e342e"},
	{color1: "#2196f3", color2: "#0d47a1"},
	{color1: "#00acc1", color2: "#006064"},
    {color1: "#9e9e9e", color2: "#f5f5f5"},
	{color1: "#d81b60", color2: "#d81b60"},
    {color1: "#ff7043", color2: "#ff3d00"},
    {color1: "#ffee58", color2: "#f57f17"},
	{color1: "#1b5e20", color2: "#43a047"},
	{color1: "#00897b", color2: "#a7ffeb"},
    {color1: "#fff3e0", color2: "#ff9100"},
    {color1: "#546e7a", color2: "#cfd8dc"}
];

$('#fechaInicioReportes').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});
$('#fechaFinalReportes').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});





/********								INIT											********/
function renderVariables () {
	var content = '';
	for (var i = 0; i < arregloVariables.length; i++) {
		var colores;
		if(coloresPareja[i]!=undefined)
			colores = coloresPareja[i];
		else
			colores = coloresPareja[i%coloresPareja.length];
		content+='<span class="boxBorder span1" style="float: left; text-align: center; background: linear-gradient(21deg, '+colores.color1+', '+colores.color2+'); cursor: pointer; margin: 2% 2%;" onclick="selectVariable('+i+', event)"> <div id="botVar'+i+'" style="background-color: #b3e5fc; width: 100%;">'+arregloVariables[i].variables+'</div></span>';
	};
	$("#variablesUL").empty();
	$("#variablesUL").append(content);
}

function renderSubVariables () {
    var content = '';
    for (var i = 0; i < arregloVariablesDeVariables.length; i++) {
        var colores = findVariableByColor(arregloVariablesDeVariables[i].variablePadre);
        if(colores != null)
            content+='<span class="boxBorder span1" style="float: left; text-align: center; background: linear-gradient(21deg, '+colores.color1+', '+colores.color2+'); cursor: pointer; margin: 2% 2%;" onclick="selectSubVariable('+i+', event)"> <div id="botSubVar'+i+'" style="background-color: #b3e5fc; width: 100%;">'+arregloVariablesDeVariables[i].variables+'</div></span>';
    };
    $("#subvariablesUL").empty();
    $("#subvariablesUL").append(content);
}

function renderVariablesSubVariables () {
    var content = '';
    for (var i = 0; i < arregloVariablesDeSubVariables.length; i++) {
        var colores = findVariableByColorRule(arregloVariablesDeSubVariables[i].variablePadre);
        if(colores != null)
            content+='<span class="boxBorder span1" style="float: left; text-align: center; background: linear-gradient(21deg, '+colores.color1+', '+colores.color2+'); cursor: pointer; margin: 2% 2%;" onclick="selectRule('+i+', event)"> <div id="botRule'+i+'" style="background-color: #b3e5fc; width: 100%;">'+arregloVariablesDeSubVariables[i].variables+'</div></span>';
    };
    $("#rulesUL").empty();
    $("#rulesUL").append(content);
}

function renderCuentas () {
    var content = '';
    for (var i = 0; i < arregloCuentas.length; i++) {
        var colores = findVariableByColorCuenta(arregloCuentas[i].variablePadre);
        console.log('colores')
        console.log(colores)
        if(colores != null)
            content+='<span class="boxBorder span1" style="float: left; text-align: center; background: linear-gradient(21deg, '+colores.color1+', '+colores.color2+'); cursor: pointer; margin: 2% 2%;" onclick="selectCuen('+i+', event)"> <div id="botCuen'+i+'" style="background-color: #b3e5fc; width: 100%;">'+arregloCuentas[i].variables+'</div></span>';
    };
    $("#cuentasUL").empty();
    $("#cuentasUL").append(content);
}

function selectVariable (index, event) {
	if(arregloVariables[index].seleccionada) {
		arregloVariables[index].seleccionada = false;
		$("#botVar"+index).css("background-color", "white");
	} else {
		arregloVariables[index].seleccionada = true;
		$("#botVar"+index).css("background-color", "#b3e5fc");
	}
    filterReport();
}

function selectSubVariable (index, event) {
    if(arregloVariablesDeVariables[index].seleccionada) {
        arregloVariablesDeVariables[index].seleccionada = false;
        $("#botSubVar"+index).css("background-color", "white");
    } else {
        arregloVariablesDeVariables[index].seleccionada = true;
        $("#botSubVar"+index).css("background-color", "#b3e5fc");
    }
    filterReport();
}

function selectRule (index, event) {
    if(arregloVariablesDeSubVariables[index].seleccionada) {
        arregloVariablesDeSubVariables[index].seleccionada = false;
        $("#botRule"+index).css("background-color", "white");
    } else {
        arregloVariablesDeSubVariables[index].seleccionada = true;
        $("#botRule"+index).css("background-color", "#b3e5fc");
    }
    filterReport();
}

function selectCuen (index, event) {
    if(arregloCuentas[index].seleccionada) {
        arregloCuentas[index].seleccionada = false;
        $("#botCuen"+index).css("background-color", "white");
    } else {
        arregloCuentas[index].seleccionada = true;
        $("#botCuen"+index).css("background-color", "#b3e5fc");
    }
    filterReport();
}

function selectProyeccion (index, event) {
    if(arregloProyecciones[index].seleccionada) {
        arregloProyecciones[index].seleccionada = false;
        $("#botProy"+index).css("background-color", "white");
    } else {
        arregloProyecciones[index].seleccionada = true;
        $("#botProy"+index).css("background-color", "#b3e5fc");
    }
    filterReport();
}

function findVariableByColor (palabra) {
    var colorRetorno;
    for (var i = 0; i < arregloVariables.length; i++) {
        if(arregloVariables[i].variables.toLowerCase().localeCompare(palabra.toLowerCase()) == 0) {
            if(i <= coloresPareja.length-1)
                colorRetorno = coloresPareja[i];
            else
                colorRetorno = coloresPareja[i%coloresPareja.length];
            return colorRetorno;
        }
    };
    return null;
}

function findVariableByColorRule (palabra) {
    var colorRetorno;
    for (var j = 0; j < arregloVariablesDeVariables.length; j++) {
        if(arregloVariablesDeVariables[j].variables.toLowerCase().localeCompare(palabra.toLowerCase()) == 0) {
            for (var i = 0; i < arregloVariables.length; i++) {
                if(arregloVariables[i].variables.localeCompare(arregloVariablesDeVariables[j].variablePadre) == 0) {
                    if(i <= coloresPareja.length-1)
                        colorRetorno = coloresPareja[i];
                    else
                        colorRetorno = coloresPareja[i%coloresPareja.length];
                    return colorRetorno;
                }
            };
        }
    };
    return null;
}

function findVariableByColorCuenta (palabra) {
    var colorRetorno;
    console.log("............")
    for (var k = 0; k < arregloVariablesDeSubVariables.length; k++) {
        if (arregloVariablesDeSubVariables[k].variables.localeCompare(palabra) == 0) {
            for (var j = 0; j < arregloVariablesDeVariables.length; j++) {
                if(arregloVariablesDeVariables[j].variables.localeCompare(arregloVariablesDeSubVariables[k].variablePadre) == 0) {
                    for (var i = 0; i < arregloVariables.length; i++) {
                        if(arregloVariables[i].variables.localeCompare(arregloVariablesDeVariables[j].variablePadre) == 0) {
                            if(i <= coloresPareja.length-1)
                                colorRetorno = coloresPareja[i];
                            else
                                colorRetorno = coloresPareja[i%coloresPareja.length];
                            return colorRetorno;
                        }
                    };
                }
            };
        }
    };
    return null;
}

$("#varCheck").on('ifClicked', function(event){
    if(arregloVariables.length > 0 && $('#varCheck').is(':checked')) {
        for (var i = 0; i < arregloVariables.length; i++) {
            arregloVariables[i].seleccionada = false;
            $("#botVar"+i).css("background-color", "white");
        };
    } else {
        for (var i = 0; i < arregloVariables.length; i++) {
            arregloVariables[i].seleccionada = true;
            $("#botVar"+i).css("background-color", "#b3e5fc");
        };
    }
    filterReport();
});

$("#subvarCheck").on('ifClicked', function(event){
    if(arregloVariablesDeVariables.length > 0 && $('#subvarCheck').is(':checked')) {
        for (var i = 0; i < arregloVariablesDeVariables.length; i++) {
            arregloVariablesDeVariables[i].seleccionada = false;
            $("#botSubVar"+i).css("background-color", "white");
        };
    } else {
        for (var i = 0; i < arregloVariablesDeVariables.length; i++) {
            arregloVariablesDeVariables[i].seleccionada = true;
            $("#botSubVar"+i).css("background-color", "#b3e5fc");
        };
    }
    filterReport();
});

$("#varDeSubVarCheck").on('ifClicked', function(event){
    if(arregloVariablesDeSubVariables.length > 0 && $('#varDeSubVarCheck').is(':checked')) {
        for (var i = 0; i < arregloVariablesDeSubVariables.length; i++) {
            arregloVariablesDeSubVariables[i].seleccionada = false;
            $("#botRule"+i).css("background-color", "white");
        };
    } else {
        for (var i = 0; i < arregloVariablesDeSubVariables.length; i++) {
            arregloVariablesDeSubVariables[i].seleccionada = true;
            $("#botRule"+i).css("background-color", "#b3e5fc");
        };
    }
    filterReport();
});

$("#cuentasCheck").on('ifClicked', function(event){
    if(arregloCuentas.length > 0 && $('#cuentasCheck').is(':checked')) {
        for (var i = 0; i < arregloCuentas.length; i++) {
            arregloCuentas[i].seleccionada = false;
            $("#botCuen"+i).css("background-color", "white");
        };
    } else {
        for (var i = 0; i < arregloCuentas.length; i++) {
            arregloCuentas[i].seleccionada = true;
            $("#botCuen"+i).css("background-color", "#b3e5fc");
        };
    }
    filterReport();
});



















function renderTable () {
    if ( $.fn.dataTable.isDataTable( '#datatable_report' ) )
        $("#datatable_report").dataTable().fnDestroy();
    $( "#datatable_report tbody").unbind( "click" );
    var table = $('#datatable_report').DataTable({
        "data": arregloQuery,
        dom: "Bflrtip",
        buttons: [
            {
                extend: "copyHtml5",
                className: "btn-sm"
            },
            {
                extend: "csvHtml5",
                className: "btn-sm"
            },
            {
                extend: "excelHtml5",
                className: "btn-sm"
            },
            {
                extend: "pdfHtml5",
                className: "btn-sm"
            }
        ],
        rowCallback: function(row, data, index){
            if(data.estado == 1) {
                $(row).find('td:eq(0)').empty();
                $(row).find('td:eq(0)').append('<span class="circle"></span>');
                $(row).find('td:eq(0)').css('color', '#66bb6a');
            } else {
                $(row).find('td:eq(0)').empty();
                $(row).find('td:eq(0)').append('<span class="circle"></span>');
                $(row).find('td:eq(0)').css('color', '#e57373');
            }
            $(row).find('td:eq(2)').html(parseDate(data.fecha));
        },
        "language": {
            "lengthMenu": '_MENU_ entradas por página',
            "search": '<i class="fa fa-search"></i>',
            "paginate": {
                "previous": '<i class="fa fa-angle-left"></i>',
                "next": '<i class="fa fa-angle-right"></i>'
            },
            "loadingRecords": "Cargando...",
            "processing":     "Procesando...",
            "emptyTable":     "No hay información en la tabla",
            "info":           "Mostrando _START_ a _END_ de un total _TOTAL_ de entradas",
            "infoEmpty":      "Mostrando 0 a 0 de 0 entradas",
            "infoFiltered":   "(filtrado de un total de _MAX_ entradas)"
        },
        "columns": [
            {
                "orderable":      false,
                "data":           null,
                "defaultContent": "",
            },
            { "data": "nombreVariable" },
            { "data": "fecha" },
            { "data": "tipoProyeccion" },
            { "data": "volumenFormula" },
            { "data": "influenciaFormula" },
            { "data": "total" }
        ],
        "columnDefs": [
            { className: "flex_status", "targets": [ 0 ] },
            { className: "text-center", "targets": [ 1 ] },
            { className: "text-center", "targets": [ 2 ] },
            { className: "text-center", "targets": [ 3 ] },
            { className: "text-center", "targets": [ 4 ] },
            { className: "text-center", "targets": [ 5 ] },
            { className: "text-center", "targets": [ 6 ] }

        ]
    });
    $('#datatable_report thead th').removeClass('flex_status');
}

function parseDate (date) {
    var meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    var dia = date.getDate();
    var mes = meses[date.getMonth()];
    var anio = date.getFullYear();
    return dia + " " + mes + ", " + anio;
}













//  **********      Filter        **********
function checkDates () {
    var fechaInicio = $("#fechaInicioReportes").datepicker('getDate');
    var fechaFinal = $("#fechaFinalReportes").datepicker('getDate');
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
                    loadTotalsFilter(fechaInicio, fechaFinal);
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

function filterReport () {
    arregloQuery = arregloTotales.slice();
    var arregloVariablesSeleccionadas = [];
    for (var i = 0; i < arregloVariables.length; i++) {
        if(!arregloVariables[i].seleccionada) {
            var tam = arregloQuery.length;
            for (var j = 0; j < tam; j++) {
                if(arregloQuery[j] != undefined && arregloQuery[j].nombreVariable.localeCompare(arregloVariables[i].variables) == 0) {
                    arregloQuery.splice(j, 1);
                    j = j-1;
                }
            }
        }
            arregloVariablesSeleccionadas.push({ID: arregloVariables[i].ID, nombre: arregloVariables[i].nombre, variables: arregloVariables[i].variables, seleccionada: arregloVariables[i].seleccionada});
    };
    for (var i = 0; i < arregloVariablesDeVariables.length; i++) {
        if(!arregloVariablesDeVariables[i].seleccionada){
            var tam = arregloQuery.length;
            for (var j = 0; j < tam; j++) {
                if(arregloQuery[j] != undefined && arregloQuery[j].nombreVariable.localeCompare(arregloVariablesDeVariables[i].variables) == 0) {
                    arregloQuery.splice(j, 1);
                    j = j-1;
                }
            }
        }
    };
    for (var i = 0; i < arregloVariablesDeSubVariables.length; i++) {
        if(!arregloVariablesDeSubVariables[i].seleccionada){
            var tam = arregloQuery.length;
            for (var j = 0; j < tam; j++) {
                if(arregloQuery[j] != undefined && arregloQuery[j].nombreVariable.localeCompare(arregloVariablesDeSubVariables[i].variables) == 0) {
                    arregloQuery.splice(j, 1);
                    j = j-1;
                }
            }
        }
    };
    for (var i = 0; i < arregloCuentas.length; i++) {
        if(!arregloCuentas[i].seleccionada){
            var tam = arregloQuery.length;
            for (var j = 0; j < tam; j++) {
                if(arregloQuery[j] != undefined && arregloQuery[j].nombreVariable.localeCompare(arregloCuentas[i].variables) == 0) {
                    arregloQuery.splice(j, 1);
                    j = j-1;
                }
            }
        }
    };
    for (var i = 0; i < arregloProyecciones.length; i++) {
        var remover = false;
        if(!arregloProyecciones[i].seleccionada)
            remover = true;
        if(remover) {
            var tam = arregloQuery.length;
            for (var j = 0; j < tam; j++) {
                if(arregloQuery[j] != undefined && arregloQuery[j].tipoProyeccion == arregloProyecciones[i].tipo && remover) {
                    arregloQuery.splice(j, 1);
                    j = j-1;
                }
            }
        }
    };
    renderTable();
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
//  **********      END Filter        **********














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