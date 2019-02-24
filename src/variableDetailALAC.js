const electron = require('electron');
const path = require('path');
const remote = require('electron').remote;
const sql = require('mssql');
const Trip = require('trip.js');

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
		loadManualContableID();
		loadText();
	}
});

var variableDeVariableReglaID = null;
var variableDeVariableObject = null;

function loadText () {
	var nombrePadre = getNombrePadre();
	var nombreHijo = getNombreHijo();
	var descripcionHijo = getDescripcionHijo();
	var factorHijo = getFactornHijo();
	var variable = getVariableDeVariableID();
	var tabla = getTablaHijo();
	$("#variableName").text(nombrePadre);
	$("#variableOfVariableName").text(nombreHijo);
	$("#variableOfVariableName").css("white-space", "initial");
	$("#variableOfVariableName").css("text-align", "justify");
	$("#variableOfVariableDescription").text(descripcionHijo);
	$("#variableOfVariableDescription").css("white-space", "initial");
	$("#variableOfVariableDescription").css("text-align", "justify");
	$("#variableOfVariableFactor").text(factorHijo);
	$("#variableOfVariableFactor").css("white-space", "initial");
	$("#variableOfVariableFactor").css("text-align", "justify");
	variableDeVariableReglaID = variable;
	loadRules();
	loadVariableObject();
	showHints();
}

function showHints () {
	var tripToChangePosition = new Trip([
	  { sel : $("#listRules"), content : "Esta es la lista de reglas asociadas a esta variable", position : "n", expose : true },
	  { sel : $("#listRules"), content : "Las operaciones se ejecutan en el orden que se ve en la lista, de arriba para abajo", position : "n", expose : true },
	  { sel : $("#operadoresReglasALAC"), content : "Seleccione un operador para aplicarlo sobre una nueva variable", position : "n", expose : true },
	  { sel : $("#operadoresReglasALAC"), content : "Se podrá seleccionar un operador si existe una variable con anterioridad", position : "n", expose : true },
	  { sel : $("#agrupacionReglasALAC"), content : "Seleccione uno ó más elementos para crear una nueva variable", position : "n", expose : true },
	  { sel : $("#agrupacionReglasALAC"), content : "Seleccione haciendo click, presionando SHIFT + click para seleccionar varios seguidos ó CONTROL + click para seleccionar varios", position : "n", expose : true }
	], {
		showNavigation : true,
		showCloseBox : true,
		delay : -1,
		prevLabel: "Anterior",
		nextLabel: "Siguiente",
		skipLabel: "Saltar",
		finishLabel: "Terminar"
	});
	tripToChangePosition.start();
}

var arregloActivos = [];
var arregloReglas = [];
var arregloListas = [];
var ordenGlobal = 0;

function loadRules () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Reglas where variablePadre = "+variableDeVariableReglaID, (err, result) => {
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
                    	arregloReglas = result.recordset;
                    } else {
                    	arregloReglas = [];
                    }
                    arregloReglas.sort(function(a, b){
			            if(a.orden < b.orden) { return -1; }
			            if(a.orden > b.orden) { return 1; }
			            return 0;
			        });
                    for (var i = 0; i < arregloReglas.length; i++) {
                    	if(ordenGlobal < arregloReglas[i])
                    		ordenGlobal = arregloReglas[i].orden;
                    };
                    renderRules();
                    permissionOpRadio();
                });
            }
        });
    }); // fin transaction
}

function loadVariableObject () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from VariablesdeVariablesFormula where ID = "+variableDeVariableReglaID, (err, result) => {
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
                    	variableDeVariableObject = result.recordset[0];
                    } else {
                    	variableDeVariableObject = null;
                    }
                });
            }
        });
    }); // fin transaction
}

function renderRules () {
	$("#listRules").empty();
	var listContent = '';
	for (var i = 0; i < arregloReglas.length; i++) {
		var regla = '';
		listContent = '';
		if(arregloReglas[i].operacion=="-" || arregloReglas[i].operacion=="+" || arregloReglas[i].operacion=="*" || arregloReglas[i].operacion=="/")
			regla+=arregloReglas[i].campoObjetivo +" "+ arregloReglas[i].operacion +" "+ arregloReglas[i].valor;
		else
			regla+="if ( "+arregloReglas[i].campoObjetivo +" "+ arregloReglas[i].operacion +" "+ arregloReglas[i].valor +" )";
		var clase = '';
		if(arregloReglas[i].reglaPadre != 0)
			clase = 'style="padding-left:20%;"';
		listContent+='<li '+clase+'><p>'+ regla +' </p></li>';
		$("#listRules").append(listContent);
	};
	if(arregloReglas.length == 0 ){
		listContent+='<li><p> No hay reglas creadas.</p></li>';
		$("#listRules").append(listContent);
	}
}

function loadManualContableID () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Listas where tipo = 1 or tipo = 2", (err, result) => {
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
                    var listaID = 0;
                    if(result.recordset.length > 0){
                    	arregloListas = result.recordset;
                    	listaID = result.recordset[0].ID;
                    } else {
                    	arregloListas = [];
                    	listaID = 0;
                    }
                    loadManualContable(listaID);
                    renderListsDropdown();
                });
            }
        });
    }); // fin transaction
}

function renderListsDropdown () {
	$("#listaSelectReglasALAC").empty();
	var content = '';
	for (var i = 0; i < arregloListas.length; i++) {
		content+='<option value="'+arregloListas[i].ID+'">'+arregloListas[i].nombre+'</option>';
	};
	$("#listaSelectReglasALAC").append(content);
}

function loadManualContable (listaID) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables where idLista = "+listaID, (err, result) => {
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
                    // ... error checks
                    console.log("Transaction committed MainDB Variables");
                    console.log(result);
                    if(result.recordset.length > 0){
                    	arregloActivos = result.recordset;
                    } else {
                    	arregloActivos = [];
                    }
                    renderListsSelect();
                });
            }
        });
    }); // fin transaction
}

$('#nombreElementoListaALAC').on('ifChecked', function () {
	renderListsSelect();
});
$('#valorElementoListaALAC').on('ifChecked', function () {
	renderListsSelect();
});

function renderListsSelect () {
	$("#listaActivosSelect").empty();
	var content = '';
	if( $('#nombreElementoListaALAC').iCheck('update')[0].checked ) {
		for (var i = 0; i < arregloActivos.length; i++) {
			content+='<option value="'+i+'">'+arregloActivos[i].nombre+'</option>';
		};
	} else {
		for (var i = 0; i < arregloActivos.length; i++) {
			content+='<option value="'+i+'">'+arregloActivos[i].valor+'</option>';
		};
	}
	$("#listaActivosSelect").append(content);
}

$("input[name='opRadio']").prop('disabled', true);

function permissionOpRadio () {
	if(arregloReglas.length > 0){
		$("input[name='opRadio']").prop('disabled', false);
		$("input[name='opRadio']").iCheck({
	        checkboxClass: 'icheckbox_flat-green',
	        radioClass: 'iradio_flat-green'
	    });
	}
}
/* *************	Fin Radios	************* */






/* *************	Rules	************* */
function saveRule () {
	var reglaPadre = 0;
	var esFiltro = '0';
	ordenGlobal;
	/*if(arregloReglas.length > 0) {
		//
	} else {*/
		var campoObjetivo = 'AGRUPACION', arregloCuentas = [], campoValor = '', operacion = '', variables = '';
		var posicionesDeActivos = $('#listaActivosSelect').val();
		for (var i = 0; i < posicionesDeActivos.length; i++) {
			arregloCuentas.push(arregloActivos[posicionesDeActivos[i]]);
		};
		campoValor = 'AGRUPACIONLISTA='+getSelectOptions(arregloCuentas, 0);
		const transaction = new sql.Transaction( pool1 );
	    transaction.begin(err => {
	        var rolledBack = false
	 
	        transaction.on('rollback', aborted => {
	            // emited with aborted === true
	     
	            rolledBack = true
	        })
	        const request = new sql.Request(transaction);
	        request.query("insert into Reglas (variablePadre, reglaPadre, campoObjetivo, operacion, valor, variables, esFiltro, orden) values ("+variableDeVariableReglaID+","+reglaPadre+",'"+campoObjetivo+"','"+operacion+"','"+campoValor+"','"+variables+"','"+esFiltro+"',"+(ordenGlobal+1)+")", (err, result) => {
	            if (err) {
	                if (!rolledBack) {
	                    console.log('error en rolledBack New Variables');
	                    transaction.rollback(err => {
	                        console.log('error en rolledBack');
	                        console.log(err);
	                    });
	                }
	            }  else {
	                transaction.commit(err => {
	                    // ... error checks
	                    console.log("Transaction committed New Variables");
	                    console.log(result);
	                    $("body").overhang({
						  	type: "success",
						  	primary: "#40D47E",
			  				accent: "#27AE60",
						  	message: "Regla creada con exito.",
						  	duration: 2,
						  	overlay: true
						});
						loadRules();
	                });
	            }
	        });
	    }); // fin transaction
	/*}*/
	/*var reglaPadre = 0;
	if($('input[name=rules]:checked').length > 0)
		reglaPadre = $('input[name=rules]:checked').val();
	var campoObjetivo = '';
	var operacion = '';
	var valor = '';
	var variables = '';
	var esFiltro = '0';
	if( $('#campoCampoRadio').is(':checked') )
		campoObjetivo = 'COLUMNA='+$("#campoCampoInput").val();
	else if( $('#listaCampoRadio').is(':checked') ){
		var aplicarNombre = "1";
		if($('#valorElementoListaCampoRadio').is(':checked'))
			aplicarNombre = "0";
		if( $('#listaCampoOptionsSelect').val() != null ){
			var idCamposSeleccionas = $('#listaCampoOptionsSelect').val();
			var valoresCamposSeleccionas =  arregloElementosDeListasCampo.filter(function( object ) {
												for (var i = 0; i < idCamposSeleccionas.length; i++) {
													if(idCamposSeleccionas[i] == object.ID)
														return true;
												};
											    return false;
											});
			campoObjetivo = 'LISTA='+getSelectOptions(valoresCamposSeleccionas, aplicarNombre);
		} else {
			campoObjetivo = 'LISTA='+getSelectOptions(arregloElementosDeListasCampo, aplicarNombre);
		}
	} else {
		var valorVariables = $("input[name='variablesCampo']:checked").val();
		//listaValorVariableRadio
		if(valorVariables == 1)
			campoObjetivo = "VARIABLE=RESULTADO";
		else if(valorVariables == 2) {
			var valorListaVariable = $("input[name='listaCampoVariableRadioCAMPOOBJETIVO']:checked").val();
			if(valorListaVariable != null){
				if(campoObjetivo.length > 0)
					campoObjetivo += ",OBJETIVO$"+valorListaVariable;
				else
					campoObjetivo = "VARIABLE=OBJETIVO$"+valorListaVariable;
			} else {
				if(campoObjetivo.length > 0)
					campoObjetivo += ",OBJETIVO"
				else
					campoObjetivo = "VARIABLE=OBJETIVO";
			}
		} else {
			var	valorListaVariable = $("input[name='listaCampoVariableRadioVALOR']:checked").val();
			if(valorListaVariable != null){
				if(campoObjetivo.length > 0)
					campoObjetivo += ",VALOR$"+valorListaVariable;
				else
					campoObjetivo = "VARIABLE=VALOR$"+valorListaVariable;
			} else {
				if(campoObjetivo.length > 0)
					campoObjetivo += ",VALOR"
				else
					campoObjetivo = "VARIABLE=VALOR";
			}
		}
	}
	if( $('#meOperadorRadio').is(':checked') )
		operacion = '<';
	else if( $('#meigOperadorRadio').is(':checked') )
		operacion = '<=';
	else if( $('#maOperadorRadio').is(':checked') )
		operacion = '>';
	else if( $('#maigOperadorRadio').is(':checked') )
		operacion = '>=';
	else if( $('#igOperadorRadio').is(':checked') )
		operacion = '==';
	else if( $('#noigOperadorRadio').is(':checked') )
		operacion = '!=';
	else if( $('#masOperadorRadio').is(':checked') )
		operacion = '+';
	else if( $('#porOperadorRadio').is(':checked') )
		operacion = '*';
	else if( $('#menOperadorRadio').is(':checked') )
		operacion = '-';
	else if( $('#entOperadorRadio').is(':checked') )
		operacion = '/';
	else
		operacion = '=';*/
	/*if( $('#listaValorRadio').is(':checked') )
		valor = getSelectOptions(arregloElementosDeListasCampo);
	else*/ /*if( $('#manualValorRadio').is(':checked') )
		valor = "COLUMNA="+$("#manualValorInput").val().toLowerCase();
	else if( $('#fechaValorRadio').is(':checked') ) {
		//valor = $("#date_inline").datepicker( 'getDate' );
		valor = 'DIA='+$("#diaValorInput").val();
		//valor += ',MES='+$("#mesValorInput").val();
	} else if( $('#elementoValorRadio').is(':checked') ) {
		var elementosSelect = $("#elementoValorOptionSelect").val();
		var elementos = '';
		var aplicarNombre = "1";
		if($('#valorElementoListaValorRadio').is(':checked'))
			aplicarNombre = "0";
		if(elementosSelect != null) {
			for (var i = 0; i < elementosSelect.length; i++) {
				elementos+=arregloElementosDeListasValor[parseInt(elementosSelect[i])].nombre + "-" + arregloElementosDeListasValor[parseInt(elementosSelect[i])].valor + '$' +aplicarNombre;
				if( (i+1) < elementosSelect.length )
					elementos+=',';
			};
			valor = 'LISTA=' + elementos;
		} else 
			valor = 'LISTA=' + getSelectOptions(arregloElementosDeListasValor, aplicarNombre);
	} else if( $('#variableValorRadio').is(':checked') ) {
		var valorVariables = $("input[name='variablesValor']:checked").val();
		console.log('valorVariables');
		console.log(valorVariables);
		if(valorVariables == 1)
			valor = "VARIABLE=RESULTADO";
		else if(valorVariables == 2) {
			var valorListaVariable = $("input[name='listaValorVariableRadioCAMPOOBJETIVO']:checked").val();
			if(valorListaVariable != null) {
				if(valor.length > 0)
					valor += ",OBJETIVO$"+valorListaVariable;
				else
					valor = "VARIABLE=OBJETIVO$"+valorListaVariable;
			} else {
				if(valor.length > 0)
					valor += ",OBJETIVO";
				else
					valor = "VARIABLE=OBJETIVO";
			}
		} else {
			var	valorListaVariable = $("input[name='listaValorVariableRadioVALOR']:checked").val();
			if(valorListaVariable != null) {
				if(valor.length > 0)
					valor += ",VALOR$"+valorListaVariable;
				else
					valor = "VARIABLE=VALOR$"+valorListaVariable;
			} else {
				if(valor.length > 0)
					valor += ",VALOR";
				else
					valor = "VARIABLE=VALOR";
			}
		}
	} else
		valor = "FACTOR="+variableDeVariableObject.factor;
	if( $('#resultadoGuardarVariable').is(':checked') )
		variables = 'VARIABLES//RESULTADO';
	if( $('#campoGuardarVariable').is(':checked') ){
		if(variables.length == 0)
			variables = 'VARIABLES//CAMPOOBJETIVO('+campoObjetivo+')';
		else
			variables += '#CAMPOOBJETIVO('+campoObjetivo+')';
	}
	if( $('#valorGuardarVariable').is(':checked') ){
		if(variables.length == 0)
			variables = 'VARIABLES//VALOR('+valor+')';
		else
			variables += '#VALOR('+valor+')';
	}
	console.log("-_------___----");
	console.log(reglaPadre);
	console.log(campoObjetivo);
	console.log(operacion);
	console.log(valor);
	console.log(variables);
	console.log(variableDeVariableReglaID);
	console.log("-_------___----");
	if(campoObjetivo.length > 0 && campoObjetivo.length < 1001) {
		if(operacion.length > 0 && operacion.length < 3) {
			if(valor.toString().length > 0 && valor.toString().length < 1001) {
				const transaction = new sql.Transaction( pool1 );
			    transaction.begin(err => {
			        var rolledBack = false
			 
			        transaction.on('rollback', aborted => {
			            // emited with aborted === true
			     
			            rolledBack = true
			        })
			        const request = new sql.Request(transaction);
			        request.query("insert into Reglas (variablePadre, reglaPadre, campoObjetivo, operacion, valor, variables, esFiltro) values ("+variableDeVariableReglaID+","+reglaPadre+",'"+campoObjetivo+"','"+operacion+"','"+valor+"','"+variables+"','"+esFiltro+"')", (err, result) => {
			            if (err) {
			                if (!rolledBack) {
			                    console.log('error en rolledBack New Variables');
			                    transaction.rollback(err => {
			                        console.log('error en rolledBack');
			                        console.log(err);
			                    });
			                }
			            }  else {
			                transaction.commit(err => {
			                    // ... error checks
			                    console.log("Transaction committed New Variables");
			                    console.log(result);
			                    $("body").overhang({
								  	type: "success",
								  	primary: "#40D47E",
					  				accent: "#27AE60",
								  	message: "Regla creada con exito.",
								  	duration: 2,
								  	overlay: true
								});
								loadRules();
			                });
			            }
			        });
			    }); // fin transaction
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "El campo de valor a aplicar de la regla debe tener una longitud mayor a 0 y menor a 1001.",
				  	duration: 3,
				  	overlay: true,
                    closeConfirm: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "El campo de operacion de la regla debe tener una longitud mayor a 0 y menor a 3.",
			  	duration: 3,
			  	overlay: true,
                closeConfirm: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "El campo objetivo de la regla debe tener una longitud mayor a 0 y menor a 1001.",
		  	duration: 3,
		  	overlay: true,
            closeConfirm: true
		});
	}*/
}

/*function getSelectOptions (array, valorAplicar) {
	var textoOption = '';
	for (var i = 0; i < array.length; i++) {
		if(valorAplicar)
			textoOption+=array[i].nombre;
		else
			textoOption+=array[i].valor;
		if( (i+1) < array.length )
			textoOption+=',';
	};
	return textoOption;
}*/
function getSelectOptions (array, aplicarNombre) {
	var textoOption = '';
	for (var i = 0; i < array.length; i++) {
		textoOption+=array[i].nombre + "-" + array[i].valor + '$' + aplicarNombre;
		if( (i+1) < array.length )
			textoOption+=',';
	};
	return textoOption;
}
/* *************	Fin Rules	************* */






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


function showRules () {
	var rulesArray = [];
	for (var i = 0; i < arregloReglas.length; i++) {
		if(arregloReglas[i].reglaPadre == 0) {
			var arreglo = [];
			var resultado = campoObjetivo(arregloReglas[i], arreglo, 0);
			resultado[0] = "\n"+resultado[0];
			$.merge( rulesArray, resultado );
		}
	}
	var output = '';
	for (var i = 0; i < rulesArray.length; i++) {
		output+=rulesArray[i];
	}
	$("#descr1").val(output);
}

function campoObjetivo (regla, arreglo, tabs) {
	console.log('yeahhhhh');
	var esCondicion = false;
	if(regla.operacion=="-" || regla.operacion=="+" || regla.operacion=="*" || regla.operacion=="/" || regla.operacion=="=")
		esCondicion = false;
	else
		esCondicion = true;
	var hasVariables = false;
	var textVariables = [];
	if(regla.variables.length > 0)
		hasVariables = true;
	console.log('regla');
	console.log(regla);
	var tabsText = '';
	for (var i = 0; i < tabs; i++) {
		tabsText+='\t';
	};
	var posicionesIF = [];
	if(regla.campoObjetivo.indexOf('COLUMNA') == 0) {
		if(esCondicion) {
			var campo = regla.campoObjetivo.split("=")[1];

			// Agregando campo Operacion
			arreglo.push(tabsText+"if ( "+campo+" "+regla.operacion);
			//posicionesIF.push(arreglo.length-1);
			posicionesIF.push(arreglo.length);
		} else {
			var campo = regla.campoObjetivo.split("=")[1];

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
	console.log('arreglo Campo');
	console.log(arreglo);
	for (var i = 0; i < arreglo.length; i++) {
		console.log(arreglo[i]);
	};

	if(regla.valor.indexOf('COLUMNA') == 0) {
		if(esCondicion) {
			var valor = regla.valor.split("=")[1];
			for (var i = 0; i < arreglo.length; i++) {
				arreglo[i] += " "+valor+" )  {";
				textVariables[i] += " " + valor;
			};
			/*arreglo[arreglo.length-1] += " "+valor+" )  {";
			textVariables[textVariables.length-1] += " " + valor;*/
		} else {
			var valor = regla.valor.split("=")[1];
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
	console.log('arreglo Valor');
	console.log(arreglo);
	for (var i = 0; i < arreglo.length; i++) {
		console.log(arreglo[i]);
	};

	console.log('arreglo posicionesIF');
	console.log(posicionesIF);
	for (var i = 0; i < posicionesIF.length; i++) {
		console.log(posicionesIF[i]);
	};

	var cuerpo = arregloReglas.filter(function( object ) {
	    return object.reglaPadre == regla.ID;
	});
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
						console.log('textVariables[j]');
						console.log(textVariables[j]);
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
					//arreglo.push("\n"+tabsText+"\t"+"variableResultado"+(regla.ID)+" = "+variablesText);
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
									/*if(tipo == "1")
										variablesText+=arregloVariables[i].split("-")[0];
									else
										variablesText+=arregloVariables[i].split("-")[1].split("$")[0];*/
									var nombre = arregloVariables[i].split("-")[0], valor = arregloVariables[i].split("-")[1].split("$")[0];
									variablesText+="{nombre: '"+nombre+"', valor: '"+valor+"'}"
								}
							};
						}
						variablesText+=";";
						//arreglo.push("\n"+tabsText+"\t"+variablesText);
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
									/*if(tipo == "1")
										variablesText+=arregloVariables[i].split("-")[0];
									else
										variablesText+=arregloVariables[i].split("-")[1].split("$")[0];*/
									var nombre = arregloVariables[i].split("-")[0], valor = arregloVariables[i].split("-")[1].split("$")[0];
									variablesText+="{nombre: '"+nombre+"', valor: '"+valor+"'}"
								}
							};
						}
						variablesText+=";";
						//arreglo.push("\n"+tabsText+"\t"+variablesText);
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
			var retorno = campoObjetivo(cuerpo[i], [], cuantasTabs);
			retorno[0] = "\n"+retorno[0];
			console.log('retorno');
			console.log(retorno);
			$.merge( arregloCuerpo, retorno );
			/*for (var j = i; j < posicionesIF.length; j++) {
				console.log("//////////");
				console.log(arreglo);
				console.log(retorno);
				console.log("antes = "+posicionesIF[j]);
				//posicionesIF[j]+=retorno.length;
				console.log(arregloCuerpo);
				console.log("despues = "+posicionesIF[j]);
			};*/
		};
		//arreglo.concat(arregloCuerpo);
		for (var i = 0; i < posicionesIF.length; i++) {
			/*console.log("IFF -- "+i);
			console.log(posicionesIF[i]);
			console.log("BEFORE -- ");
			for (var j = 0; j < arreglo.length; j++) {
				console.log(arreglo[j]);
			};
			console.log(arregloCuerpo);*/
			arreglo.splice(posicionesIF[i], 0, ...arregloCuerpo);
			/*console.log("AFTER -- ");
			for (var j = 0; j < arreglo.length; j++) {
				console.log(arreglo[j]);
			};*/
			if(esCondicion)
				arreglo.splice(posicionesIF[i]+arregloCuerpo.length, 0, "\n"+tabsText+"}");
			for (var j = i; j < posicionesIF.length; j++) {
				posicionesIF[j]+=arregloCuerpo.length;
				/*if(esCondicion)
					posicionesIF[j]++;*/
			};
		};
		if(posicionesIF.length == 0)
			$.merge( arreglo, arregloCuerpo );
		/*if(esCondicion){
			for (var i = 0; i < posicionesIF.length; i++) {
				arreglo.splice(posicionesIF[i]+1, 0, "\n}")
				for (var j = i; j < posicionesIF.length; j++) {
					posicionesIF[j]++;
				};
			};
		}*/
		console.log('1');
		console.log(arreglo);
		return arreglo;
	} else {
		if(esCondicion){
			for (var i = 0; i < posicionesIF.length; i++) {
				/*console.log('tabsText');
				console.log(tabsText);
				console.log(tabs);
				console.log('tabsText');*/
				arreglo.splice(posicionesIF[i], 0, "\n"+tabsText+"}")
				/*for (var j = i; j < posicionesIF.length; j++) {
					posicionesIF[j]++;
				};*/
			};
		}
		console.log('2');
		console.log(arreglo);
		return arreglo;
	}
}