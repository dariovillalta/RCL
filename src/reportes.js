const electron = require('electron');
const path = require('path');
const remote = require('electron').remote;
const sql = require('mssql');
const XLSX = require('xlsx-style');

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
		loadVariablesIMG();
		loadVariables();
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



/*Var DECLAR*/
var arregloTotales = [];	//ORDERD BY STATUS, ETC
var arregloVariables = [];	//Arreglo de variables FormulaVariables
var arregloVariablesDeVariables = [];	//Arreglo de variables VariablesdeVariablesFormula









/* ****************** 		LOADING IMG 	****************** */
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
/* ****************** 		END LOADING IMG 	****************** */

/* ****************** 		LOADING VARIABLES 	****************** */
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
                        for (var i = 0; i < result.recordset.length; i++) {
                        	arregloVariables.push({ID: result.recordset[i].ID, nombre: result.recordset[i].nombre, variables: result.recordset[i].variables, seleccionada: false, formula: result.recordset[i].formula});
                        };
                    } else{
                        arregloVariables = [];
                    }
                    renderVariables();
                    loadVariableVariables();
                });
            }
        });
    }); // fin transaction
}
/* ****************** 		END LOADING VARIABLES 	********* */

/* ****************** 		LOADING VARIABLES OF VARIABLES 	********* */
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
                        for (var i = 0; i < result.recordset.length; i++) {
                            arregloVariablesDeVariables.push({ID: result.recordset[i].ID, variables: result.recordset[i].nombre, seleccionada: false});
                        };
                    } else{
                        arregloVariablesDeVariables = [];
                    }
                    renderSubVariables();
                });
            }
        });
    }); // fin transaction
}
/* ****************** 		END LOADING VARIABLES OF VARIABLES 	********* */

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
    {color1: "#d7ccc8", color2: "#3e2723"},
    {color1: "#eceff1", color2: "#263238"},
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





/********								INIT											********/
function renderVariables () {
	var content = '';
	for (var i = 0; i < arregloVariables.length; i++) {
		var colores;
		if(coloresPareja[i]!=undefined)
			colores = coloresPareja[i];
		else
			colores = coloresPareja[i%coloresPareja.length];
		content+='<span class="boxBorder span1" style="float: left; text-align: center; background: linear-gradient(21deg, '+colores.color1+', '+colores.color2+'); cursor: pointer; margin: 2% 2%;" onclick="selectVariable('+i+', event)"> <div id="botVar'+i+'" style="background-color: white; width: 100%;">'+arregloVariables[i].variables+'</div></span>';
	};
	$("#variablesUL").empty();
	$("#variablesUL").append(content);
}

function renderSubVariables () {
    var content = '';
    for (var i = 0; i < arregloVariablesDeVariables.length; i++) {
        var colores = findVariableByColor(arregloVariablesDeVariables[i].variables);
        if(colores != null)
            content+='<span class="boxBorder span1" style="float: left; text-align: center; background: linear-gradient(21deg, '+colores.color1+', '+colores.color2+'); cursor: pointer; margin: 2% 2%;" onclick="selectSubVariable('+i+', event)"> <div id="botSubVar'+i+'" style="background-color: white; width: 100%;">'+arregloVariablesDeVariables[i].variables+'</div></span>';
    };
    $("#subvariablesUL").empty();
    $("#subvariablesUL").append(content);
}

function selectVariable (index, event) {
	if(arregloVariables[index].estado) {
		arregloVariables[index].estado = false;
		$("#botVar"+index).css("background-color", "white");
	} else {
		arregloVariables[index].estado = true;
		$("#botVar"+index).css("background-color", "#b3e5fc");
	}
}

function selectSubVariable (index, event) {
    if(arregloVariablesDeVariables[index].estado) {
        arregloVariablesDeVariables[index].estado = false;
        $("#botSubVar"+index).css("background-color", "white");
    } else {
        arregloVariablesDeVariables[index].estado = true;
        $("#botSubVar"+index).css("background-color", "#b3e5fc");
    }
}

function findVariableByColor (palabra) {
    var colorRetorno;
    for (var i = 0; i < arregloVariables.length; i++) {
        for (var j = 0; j < arregloVariables[i].formula.length; j++) {
            if(arregloVariables[i].formula.charAt(j) != "(" && arregloVariables[i].formula.charAt(j) != ")" && arregloVariables[i].formula.charAt(j) != "<" && arregloVariables[i].formula.charAt(j) != ">" && 
                arregloVariables[i].formula.charAt(j) != "!" && arregloVariables[i].formula.charAt(j) != "=" && arregloVariables[i].formula.charAt(j) != "/" && arregloVariables[i].formula.charAt(j) != "*" && 
                arregloVariables[i].formula.charAt(j) != "√" && arregloVariables[i].formula.charAt(j) != "+" && arregloVariables[i].formula.charAt(j) != "-" && isNaN(arregloVariables[i].formula.charAt(j))) {
                var pal = getVariable(arregloVariables[i].formula, j);
                if(pal.length>0 && pal.toLowerCase().localeCompare(palabra.toLowerCase()) == 0) {
                    if(i <= coloresPareja.length-1)
                        colorRetorno = coloresPareja[i];
                    else
                        colorRetorno = coloresPareja[i%coloresPareja.length];
                    return colorRetorno;
                }
                j+=pal.length;
            }
        };
    };
    return null;
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












//	**********		Route Change		**********
function goVariables () {
	$("#app_root").empty();
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
    //cleanup();
    $("#app_root").load("src/users.html");
}

function goConnections () {
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/importaciones.html");
}

function logout () {
	$("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/login.html");
	session.defaultSession.clearStorageData([], (data) => {});
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