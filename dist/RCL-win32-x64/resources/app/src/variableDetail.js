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
		loadLists();
		loadText();
		loadVariablesMainDB();
	}
});

var variableDeVariableReglaID = null;
var variableDeVariableObject = null;

function loadText () {
	var nombreHijo = getNombreHijo();
	var descripcionHijo = getDescripcionHijo();
	var factorHijo = getFactornHijo();
	var variable = getVariableDeVariableID();
	var tabla = getTablaHijo();
	loadSelectCampoObjetivo(tabla);
	$("#variableOfVariableName").text(nombreHijo);
	$("#variableOfVariableName").css("white-space", "initial");
	$("#variableOfVariableName").css("text-align", "justify");
	$("#variableOfVariableDescription").text(descripcionHijo);
	$("#variableOfVariableDescription").css("white-space", "initial");
	$("#variableOfVariableDescription").css("text-align", "justify");
	$("#variableOfVariableFactor").text(factorHijo);
	$("#factorText").text(factorHijo).append('<span style="height: 3vh;">%</span>');
	$("#variableOfVariableFactor").css("white-space", "initial");
	$("#variableOfVariableFactor").css("text-align", "justify");
	variableDeVariableReglaID = variable;
	loadRules();
	loadVariableObject();
}

var tablaActivos = [
	{valor: "cuenta",nombre: "Cuenta"},
	{valor: "nombre",nombre: "Nombre"},
	{valor: "saldo",nombre: "Saldo"},
	{valor: "moneda",nombre: "Moneda"},
	{valor: "tipoCuenta",nombre: "Tipo de Cuenta"},
	{valor: "sucursal",nombre: "Sucursal"},
	{valor: "columnaExtra1",nombre: "Columna Extra 1"},
	{valor: "columnaExtra2",nombre: "Columna Extra 2"}
];

var tablaDepositos = [
	{valor: "idCliente",nombre: "IdCliente"},
	{valor: "nombreCliente",nombre: "Nombre del Cliente"},
	{valor: "tipoPersona",nombre: "Tipo de Persona"},
	{valor: "tipoSubPersona",nombre: "Tipo de Sub-Persona"},
	{valor: "saldo",nombre: "Saldo"},
	/*{valor: "moneda",nombre: "Moneda"},*/
	{valor: "tipoCuenta",nombre: "Tipo de Cuenta"},
	/*{valor: "sucursal",nombre: "Sucursal"},
	{valor: "columnaExtra1",nombre: "Columna Extra 1"},
	{valor: "columnaExtra2",nombre: "Columna Extra 2"}*/
];

function loadSelectCampoObjetivo (tabla) {
	$("#campoCampoInput").empty();
	var content = '';
	if(tabla == 1) {
		for (var i = 0; i < tablaActivos.length; i++) {
			content+='<option value="'+tablaActivos[i].valor+'">'+tablaActivos[i].nombre+'</option>';
		};
	} else if(tabla == 2) {
		for (var i = 0; i < tablaDepositos.length; i++) {
			content+='<option value="'+tablaDepositos[i].valor+'">'+tablaDepositos[i].nombre+'</option>';
		};
	}
	$("#campoCampoInput").append(content);
}

var arregloListas = [];
var arregloElementosDeListas = [];
var arregloReglas = [];
var ordenGlobal = 0;

function loadRules () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
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
                    	if(ordenGlobal < arregloReglas[i].orden)
                    		ordenGlobal = arregloReglas[i].orden;
                    };
                    renderRules();
                });
            }
        });
    }); // fin transaction
}

function loadVariableObject () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
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

var montoFosedeGlobal = null;

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
                    	if(result.recordset[0].montoFosede > 1)
                    		montoFosedeGlobal = result.recordset[0].montoFosede;
                    	else
                    		montoFosedeGlobal = 0.00;
                    } else {
                    	montoFosedeGlobal = null;
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
		listContent+='<li '+clase+'><p><input type="radio" name="rules" class="flat" value="'+arregloReglas[i].ID+'"> '+ regla +' </p></li>';
		$("#listRules").append(listContent);
	};
	$("input[name='rules']").iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass: 'iradio_flat-green'
    });
	if(arregloReglas.length == 0 ){
		listContent+='<li><p> No hay reglas creadas.</p></li>';
		$("#listRules").append(listContent);
	}
	$("input[name='rules']").on('ifClicked', function(event){
		var borrar = false;
	  	if ($(this).is(':checked')) {
	        $(this).iCheck('uncheck');
	        borrar = true;
	    } else {
	        $(this).iCheck('check');
	    }
	    $("#variablesCampoUL").empty();
	    if(!borrar) {
		    var id = $(this).val();
		    var reglas = arregloReglas.filter(function( object ) {
						   		return object.ID == id;
							});
		    var variables = '';
		    if(reglas.length > 0)
		    	variables = reglas[0].variables;
		    var valores = variables.split("//")[1];
		    if(valores != undefined) {
			    var valoresIndividual = valores.split("#");
			    var content = '';
			    for (var i = 0; i < valoresIndividual.length; i++) {
			    	var nombreVariable = valoresIndividual[i].split("(")[0];
			    	var texto = '';
			    	var value;
			    	var id = '';
		    		if(nombreVariable == 'RESULTADO') {
		    			texto = 'Resultado';
		    			value = 1;
		    			id = 'id="resultadoDisable"';
		    		} else if(nombreVariable == 'CAMPOOBJETIVO') {
		    			texto = 'Campo Objetivo';
		    			value = 2;
		    		} else {
		    			texto = 'Valor a Aplicar';
		    			value = 3;
		    		}
			    	content += '<li> <p><input '+id+' type="radio" name="variablesCampo" class="flat" value="'+value+'"> '+texto+' </p> </li>';
			    	if(valoresIndividual[i].split("(").length > 1){
				    	if(valoresIndividual[i].split("(")[1].indexOf("LISTA") == 0) {
				    		content += '<div class="row">'+
	                              '<div id="wrapper">'+
	                                '<label>Valor a aplicar de Elemento de Lista</label>'+
	                              '</div>'+
	                            '</div>'+
	                            '<div class="row">'+
	                              '<div id="wrapper">'+
	                                '<label>'+
	                                  '<input id="nombreElementoListaCampoVariableRadio" type="radio" class="flat" name="listaCampoVariableRadio'+nombreVariable+'" checked value="1"> Campo Nombre de Elemento'+
	                                '</label>'+
	                                '<label>'+
	                                  '<input id="valorElementoListaCampoVariableRadio" type="radio" class="flat" name="listaCampoVariableRadio'+nombreVariable+'" value="0"> Campo Valor de Elemento'+
	                                '</label>'+
	                              '</div>'+
	                            '</div>';
	                    }
	                }
			    };
			    $("#variablesCampoUL").append(content);
			    $("input[name='variablesCampo']").iCheck({
			        checkboxClass: 'icheckbox_flat-green',
			        radioClass: 'iradio_flat-green'
			    });
			    if( $('#variablesCampoRadio').iCheck('update')[0].checked )
		    		$("#variablesCampoUL :input").prop('disabled', false);
		    	else
		    		$("#variablesCampoUL :input").prop('disabled', true);
		    	$("#resultadoDisable").on('ifChecked', function(event){
					$("#resultadoGuardarVariable").attr('disabled',true);
					$("#resultadoGuardarVariable").iCheck('uncheck');
				});
				$("#resultadoDisable").on('ifUnchecked', function(event){
					$("#resultadoGuardarVariable").attr('disabled',false);
				});
		    } else {
			    var content = '<li> <p><input type="radio" name="variablesCampo" class="flat" value="1"> Resultado </p> </li>';;
			    $("#variablesCampoUL").append(content);
			    $("input[name='variablesCampo']").iCheck({
			        checkboxClass: 'icheckbox_flat-green',
			        radioClass: 'iradio_flat-green'
			    });
			    /*if( $('#variablesCampoRadio').iCheck('update')[0].checked )
		    		$("#variablesCampoUL :input").prop('disabled', false);
		    	else
		    		$("#variablesCampoUL :input").prop('disabled', true);*/
		    	$("#resultadoDisable").on('ifChecked', function(event){
					$("#resultadoGuardarVariable").attr('disabled',true);
					$("#resultadoGuardarVariable").iCheck('uncheck');
				});
				$("#resultadoDisable").on('ifUnchecked', function(event){
					$("#resultadoGuardarVariable").attr('disabled',false);
				});
		    }
		}
		$("#variablesValorUL").empty();
	    if(!borrar) {
	    	if(valores != undefined) {
			    var content2 = '';
			    for (var i = 0; i < valoresIndividual.length; i++) {
			    	var nombreVariable = valoresIndividual[i].split("(")[0];
			    	var texto = '';
			    	var value;
		    		if(nombreVariable == 'RESULTADO') {
		    			texto = 'Resultado';
		    			value = 1;
		    		} else if(nombreVariable == 'CAMPOOBJETIVO') {
		    			texto = 'Campo Objetivo';
		    			value = 2;
		    		} else {
		    			texto = 'Valor a Aplicar';
		    			value = 3;
		    		}
			    	content2 += '<li> <p><input type="radio" name="variablesValor" class="flat" value="'+value+'"> '+texto+' </p> </li>';
			    	if(valoresIndividual[i].split("(").length > 1){
				    	if(valoresIndividual[i].split("(")[1].indexOf("LISTA") == 0) {
				    		content2 += '<div class="row">'+
	                              '<div id="wrapper">'+
	                                '<label>Valor a aplicar de Elemento de Lista</label>'+
	                              '</div>'+
	                            '</div>'+
	                            '<div class="row">'+
	                              '<div id="wrapper">'+
	                                '<label>'+
	                                  '<input id="nombreElementoListaValorVariableRadio" type="radio" class="flat" name="listaValorVariableRadio'+nombreVariable+'" checked value="1"> Campo Nombre de Elemento'+
	                                '</label>'+
	                                '<label>'+
	                                  '<input id="valorElementoListaValorVariableRadio" type="radio" class="flat" name="listaValorVariableRadio'+nombreVariable+'" value="0"> Campo Valor de Elemento'+
	                                '</label>'+
	                              '</div>'+
	                            '</div>';
	                    }
	                }
			    };
			    $("#variablesValorUL").append(content2);
			    $("input[name='variablesValor']").iCheck({
			        checkboxClass: 'icheckbox_flat-green',
			        radioClass: 'iradio_flat-green'
			    });
			    if( $('#variableValorRadio').iCheck('update')[0].checked )
		    		$("#variablesValorUL :input").prop('disabled', false);
		    	else
		    		$("#variablesValorUL :input").prop('disabled', true);
		    } else {
			    var content = '<li> <p><input type="radio" name="variablesCampo" class="flat" value="1"> Resultado </p> </li>';;
			    $("#variablesValorUL").append(content);
			    $("input[name='variablesCampo']").iCheck({
			        checkboxClass: 'icheckbox_flat-green',
			        radioClass: 'iradio_flat-green'
			    });
			    /*if( $('#variableValorRadio').iCheck('update')[0].checked )
		    		$("#variablesValorUL :input").prop('disabled', false);
		    	else
		    		$("#variablesValorUL :input").prop('disabled', true);*/
		    }
		}
	});
	$("#resultadoDisable").on('ifChecked', function(event){
		$("#resultadoGuardarVariable").attr('disabled',true);
		$("#resultadoGuardarVariable").iCheck('uncheck');
	});
	$("#resultadoDisable").on('ifUnchecked', function(event){
		$("#resultadoGuardarVariable").attr('disabled',false);
	});
}


function loadLists () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from Listas", (err, result) => {
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
                    	arregloListas = result.recordset;
                    } else {
                    	arregloListas = [];
                    }
                    renderListsSelect(3);
                });
            }
        });
    }); // fin transaction
}

function getElementsListsValue (listaID) {
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
                    	arregloElementosDeListasValor = result.recordset;
                    } else {
                    	arregloElementosDeListasValor = [];
                    }
                    renderElementsListsValueSelect();
                });
            }
        });
    }); // fin transaction
}

function renderListsSelect (tipo) {
	var selectHTML = '';
	var listaTemp = arregloListas.filter(function( object ) {
						return object.tipo == tipo;
					});
	for (var i = 0; i < listaTemp.length; i++) {
		selectHTML+='<option value='+listaTemp[i].ID+'>'+listaTemp[i].nombre+'</option>';
	};
	$("#elementoValorSelect").empty();
	$("#elementoValorSelect").append(selectHTML);
	if(listaTemp.length > 0) {
		getElementsListsValue(listaTemp[0].ID);
	}
}

function renderElementsListsCampSelect () {
	var selectHTML = '';
	for (var i = 0; i < arregloElementosDeListasCampo.length; i++) {
		selectHTML+='<option value='+arregloElementosDeListasCampo[i].ID+'>'+arregloElementosDeListasCampo[i].nombre+'</option>';
	};
	$("#listaCampoOptionsSelect").empty();
	$("#listaCampoOptionsSelect").append(selectHTML);
}

$('#nombreElementoListaValorRadio').on('ifChecked', function () {
	renderElementsListsValueSelect();
});
$('#valorElementoListaValorRadio').on('ifChecked', function () {
	renderElementsListsValueSelect();
});

function renderElementsListsValueSelect () {
	var selectHTML = '';
	if($('#nombreElementoListaValorRadio').iCheck('update')[0].checked){
		for (var i = 0; i < arregloElementosDeListasValor.length; i++) {
			selectHTML+='<option value='+i+'>'+arregloElementosDeListasValor[i].nombre+'</option>';
		};
	} else {
		for (var i = 0; i < arregloElementosDeListasValor.length; i++) {
			selectHTML+='<option value='+i+'>'+arregloElementosDeListasValor[i].valor+'</option>';
		};
	}
	$("#elementoValorOptionSelect").empty();
	$("#elementoValorOptionSelect").append(selectHTML);
}

/* *************	Radios	************* */
$("#listaCampoSelect").prop('disabled', true);
$("#listaCampoOptionsSelect").prop('disabled', true);
$("input#resultadoDisable").prop('disabled', true);
$("input[name='campoRadio']").on('ifClicked', function(event){
	if(event.currentTarget.id == "campoCampoRadio"){
		$( "#campoField" ).fadeIn( "slow", function() {
		});
		$('#variableField').hide();
		$('#fosedeField').hide();
		$( "#cuentasOperativasField" ).hide();
		$( "#multField" ).hide();
		$("#fosedeField :input").iCheck('uncheck');
		mostrarFieldsCampoSelect();
	} else if(event.currentTarget.id == "variablesCampoRadio"){
		$( "#variableField" ).fadeIn( "slow", function() {
		});
		$('#campoField').hide();
		$('#fosedeField').hide();
		$( "#multField" ).hide();
	} else if(event.currentTarget.id == "fosedeCampoRadio"){
		$( "#fosedeField" ).fadeIn( "slow", function() {
		});
		$("#hastaFOSEDECampoRadio").iCheck('check');
		$('#campoField').hide();
		$('#variableField').hide();
		$( "#cuentasOperativasField" ).hide();
		$('#relacionalesField').hide();
		$( "#ln_solidOPERACION" ).hide();
		$( "#algebraicosField" ).hide();
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorField" ).fadeIn( "slow", function() {
		});
		$( "#factorValorRadioLabel" ).show();
		$("#factorValorRadio").iCheck('check');
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#multOperadorRadio").iCheck('check');
		$( "#multField" ).fadeIn( "slow", function() {
		});
	} else if(event.currentTarget.id == "cuentasOperativasCampoRadio"){
		$( "#cuentasOperativasField" ).fadeIn( "slow", function() {
		});
		$("#hastaFOSEDECuentasOpCampoRadio").iCheck('check');
		$('#fosedeField').hide();
		$('#campoField').hide();
		$('#variableField').hide();
		$('#relacionalesField').hide();
		$( "#ln_solidOPERACION" ).hide();
		$( "#algebraicosField" ).hide();
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorField" ).fadeIn( "slow", function() {
		});
		$( "#factorValorRadioLabel" ).show();
		$("#factorValorRadio").iCheck('check');
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#multOperadorRadio").iCheck('check');
		$( "#multField" ).fadeIn( "slow", function() {
		});
	}
});

function mostrarFieldsCampoSelect () {
	var campo = $("#campoCampoInput").val();
	if(campo == 'saldo') {
		$( "#relacionalesField" ).fadeIn( "slow", function() {
		});
		$( "#algebraicosField" ).fadeIn( "slow", function() {
		});
		$( "#ln_solidOPERACION" ).show();
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#manualValorRadioLabel" ).show();
		$("#manualValorRadio").iCheck('check');
		$( "#manualField" ).fadeIn( "slow", function() {
		});
		$( "#factorValorRadioLabel" ).show();
		$( "#factorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#meOperadorRadio").iCheck('check');
	} else {
		$( "#sumarSiField" ).fadeIn( "slow", function() {
		});
		$( "#relacionalesField" ).hide();
		$( "#algebraicosField" ).hide();
		$( "#ln_solidOPERACION" ).hide();
		$("#sumarSiOperadorRadio").iCheck('check');
	}
	if(campo == 'tipoPersona') {
		renderListsSelect(4);
		$( "#elementoValorRadioLabel" ).show();
		$("#elementoValorRadioLabel").iCheck('check');
		$( "#listaValorField" ).fadeIn( "slow", function() {
		});
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
	} else if(campo == 'tipoSubPersona') {
		renderListsSelect(5);
		$( "#elementoValorRadioLabel" ).show();
		$("#elementoValorRadioLabel").iCheck('check');
		$( "#listaValorField" ).fadeIn( "slow", function() {
		});
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
	}else if(campo == 'idCliente' || campo == 'nombreCliente') {
		renderListsSelect(3);
		$( "#elementoValorRadioLabel" ).show();
		$("#elementoValorRadioLabel").iCheck('check');
		$( "#listaValorField" ).fadeIn( "slow", function() {
		});
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
	}
}

$("#date_inline").css('pointer-events', 'none');
$("#diaValorInput").prop('disabled', true);
$("#mesValorInput").prop('disabled', true);
$("input[name='valorRadio']").on('ifClicked', function(event){
	if(event.currentTarget.id == "manualValorRadio") {
		$( "#manualField" ).fadeIn( "slow", function() {
		});
		$( "#factorField" ).hide();
	} else if(event.currentTarget.id == "factorValorRadio") {
		$( "#factorField" ).fadeIn( "slow", function() {
		});
		$( "#manualField" ).hide();
	}
});
/* *************	Fin Radios	************* */






/* *************	Rules	************* */
function saveRule () {
	var reglaPadre = 0;
	if($('input[name=rules]:checked').length > 0)
		reglaPadre = $('input[name=rules]:checked').val();
	var campoObjetivo = '';
	var operacion = '';
	var valor = '';
	var variables = '';
	var esFiltro = '0';
	if( $('#campoCampoRadio').is(':checked') )
		campoObjetivo = 'COLUMNA='+$("#campoCampoInput").val();
	else if( $('#fosedeCampoRadio').is(':checked') ) {
		if( $('#hastaFOSEDECampoRadio').is(':checked') )
			campoObjetivo = 'hastaFOSEDE';
		else
			campoObjetivo = 'mayorFOSEDE';
	} else if( $('#cuentasOperativasCampoRadio').is(':checked') ) { 
		if( $('#hastaFOSEDECuentasOpCampoRadio').is(':checked') )
			campoObjetivo = 'CONCUENTAS=hastaFOSEDE';
		else if( $('#mayorFOSEDECuentasOpCampoRadio').is(':checked') )
			campoObjetivo = 'CONCUENTAS=mayorFOSEDE';
		else if( $('#hastaFOSEDENoCuentasOpCampoRadio').is(':checked') )
			campoObjetivo = 'SINCUENTAS=hastaFOSEDE';
		else
			campoObjetivo = 'SINCUENTAS=mayorFOSEDE';
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
	else if( $('#sumarSiOperadorRadio').is(':checked') )
		operacion = 'en';
	else if( $('#sumarSiNoOperadorRadio').is(':checked') )
		operacion = 'no';
	else if( $('#multOperadorRadio').is(':checked') )
		operacion = '*';
	if( $('#manualValorRadio').is(':checked') )
		valor = "COLUMNA="+$("#manualValorInput").val().split(" ")[1];
	else if( $('#elementoValorRadio').is(':checked') ) {
		var elementosSelect = $("#elementoValorOptionSelect").val();
		var elementos = '';
		var aplicarNombre = "1";
		if($('#valorElementoListaValorRadio').is(':checked'))
			aplicarNombre = "0";
		if(elementosSelect != null) {
			for (var i = 0; i < elementosSelect.length; i++) {
				if(aplicarNombre == "1")
					elementos+=arregloElementosDeListasValor[parseInt(elementosSelect[i])].nombre;
				else
					elementos+=arregloElementosDeListasValor[parseInt(elementosSelect[i])].valor;
				if( (i+1) < elementosSelect.length )
					elementos+=',';
			};
			valor = 'LISTA=' + elementos;
		} else 
			valor = 'LISTA=' + getSelectOptions(arregloElementosDeListasValor, aplicarNombre);
	} else if( $('#factorValorRadio').is(':checked') )
		valor = "FACTOR="+variableDeVariableObject.factor;
	console.log("-_------___----");
	console.log(reglaPadre);
	console.log(campoObjetivo);
	console.log(operacion);
	console.log(valor);
	console.log(variables);
	console.log(variableDeVariableReglaID);
	console.log(ordenGlobal);
	console.log(ordenGlobal+1);
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
			        request.query("insert into Reglas (variablePadre, reglaPadre, campoObjetivo, operacion, valor, variables, esFiltro, orden) values ("+variableDeVariableReglaID+","+reglaPadre+",'"+campoObjetivo+"','"+operacion+"','"+valor+"','"+variables+"','"+esFiltro+"',"+(ordenGlobal+1)+")", (err, result) => {
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
	}
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
		if(aplicarNombre == "1")
			textoOption+=array[i].nombre;
		else
			textoOption+=array[i].valor;
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


function showRules () {
	var rulesArray = [];
	for (var i = 0; i < arregloReglas.length; i++) {
		if(arregloReglas[i].reglaPadre == 0) {
			var arreglo = [];
			//arreglo.push(arregloReglas[i]);
			/*console.log('---------------');
			console.log( campoObjetivo(arregloReglas[i], arreglo) );
			console.log('---------------');*/
			var resultado = campoObjetivo(arregloReglas[i], arreglo, 0);
			//resultado = "\n"+resultado;
			resultado[0] = "\n"+resultado[0];
			console.log('---------------');
			console.log(resultado);
			console.log('---------------');
			//rulesArray.concat( resultado );
			$.merge( rulesArray, resultado );
		}
	}
	var output = '';
	console.log('rulesArray');
	console.log(rulesArray);
	console.log('rulesArray');
	for (var i = 0; i < rulesArray.length; i++) {
		output+=rulesArray[i];
	}
	$("#descr1").val(output);
}

function campoObjetivo (regla, arreglo, tabs) {
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
			var campo = regla.campoObjetivo.split("=")[1];

			// Agregando campo Operacion
			if(regla.operacion=="en" || regla.operacion=="no")
				arreglo.push(tabsText+"if ( "+campo+".localeCompare('");
			else
				arreglo.push(tabsText+"if ( "+campo+" "+regla.operacion);
			//posicionesIF.push(arreglo.length-1);
			posicionesIF.push(arreglo.length);
		} else {
			var campo = regla.campoObjetivo.split("=")[1];

			// Agregando campo Operacion
			arreglo.push(tabsText+campo+" = "+campo+" "+regla.operacion);
		}
	} else if(regla.campoObjetivo.indexOf('hastaFOSEDE') == 0) {
		arreglo.push(tabsText+"if ( arreglo.saldo > "+montoFosedeGlobal+" )");
		arreglo.push("\n\t"+tabsText+variableDeVariableObject.nombre+" = arreglo.saldo - "+montoFosedeGlobal);
		arreglo.push("\n"+tabsText+"total"+variableDeVariableObject.nombre+" = "+variableDeVariableObject.nombre+" * "+(montoFosedeGlobal/100));
	} else if(regla.campoObjetivo.indexOf('mayorFOSEDE') == 0) {
		arreglo.push(tabsText+"if ( arreglo.saldo > "+montoFosedeGlobal+" )");
		arreglo.push("\n\t"+tabsText+variableDeVariableObject.nombre+" = arreglo.saldo - "+montoFosedeGlobal);
		arreglo.push("\n"+tabsText+"total"+variableDeVariableObject.nombre+" = "+variableDeVariableObject.nombre+" * "+(montoFosedeGlobal/100));
	}

	console.log('arreglo Campo');
	console.log(arreglo);
	for (var i = 0; i < arreglo.length; i++) {
		console.log(arreglo[i]);
	};

	if(regla.valor.indexOf('LISTA') == 0) {
		if(esCondicion) {
			var arregloLista = regla.valor.split("=")[1].split(",");
			var copiaRegla = arreglo.slice();
			var tamArreglo = arreglo.length;
			if(regla.operacion == "no") {
				for (var j = 0; j < tamArreglo; j++) {
					for (var i = 0; i < arregloLista.length; i++) {
						if(i==0) {
							var textoFinal = '';
							if(i+1 == arregloLista.length)
								textoFinal = " ) {";
							arreglo[j] +=arregloLista[i] + "')" + textoFinal;
						} else {
							var textoFinal = '';
							if(i+1 == arregloLista.length)
								textoFinal = " ) {";
							arreglo[j] += " && "+copiaRegla[j].split(" ( ")[1]+arregloLista[i]+"')"+textoFinal;
						}
					}
				};
			} else {
				for (var i = 0; i < arregloLista.length; i++) {
					for (var j = 0; j < tamArreglo; j++) {
						if(i==0) {
							arreglo[j] +=arregloLista[i] + "')" + " ) {";
						} else {
							arreglo.push("\n"+copiaRegla[j]+arregloLista[i]+"')"+" ) {");
							posicionesIF.push(posicionesIF[posicionesIF.length-1]+2);
						}
					};
				};
			}
		}
	} else if(regla.valor.indexOf('FACTOR') == 0) {
		if(esCondicion) {
			var factorValor = regla.valor.split("=")[1];
			for (var i = 0; i < arreglo.length; i++) {
				arreglo[i] += " "+factorValor + " ) {";
			};
		} else {
			var factorValor = regla.valor.split("=")[1];
			for (var i = 0; i < arreglo.length; i++) {
				arreglo[i] += " "+factorValor + ";";
			};
		}
	} else if(regla.valor.indexOf('COLUMNA') == 0) {
		if(esCondicion) {
			var columnaValor = regla.valor.split("=")[1];
			for (var i = 0; i < arreglo.length; i++) {
				arreglo[i] += " "+columnaValor + " ) {";
			};
		} else {
			var columnaValor = regla.valor.split("=")[1];
			for (var i = 0; i < arreglo.length; i++) {
				arreglo[i] += " "+columnaValor + ";";
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
			var retorno = campoObjetivo(cuerpo[i], [], cuantasTabs);
			retorno[0] = "\n"+retorno[0];
			console.log('retorno');
			console.log(retorno);
			$.merge( arregloCuerpo, retorno );
		};
		//arreglo.concat(arregloCuerpo);
		for (var i = 0; i < posicionesIF.length; i++) {
			arreglo.splice(posicionesIF[i], 0, ...arregloCuerpo);
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
		return arreglo;
	} else {
		if(esCondicion){
			for (var i = 0; i < posicionesIF.length; i++) {
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

function campoValor (regla, arreglo) {
	var esCondicion = false;
	if(regla.operacion=="-" || regla.operacion=="+" || regla.operacion=="*" || regla.operacion=="/")
		esCondicion = false;
	else
		esCondicion = true;

	if(regla.valor.indexOf('COLUMNA') == 0) {
		if(esCondicion) {
			var valor = regla.valor.split("=")[1];
			arreglo[arreglo.length-1] += " "+valor+" )";
		} else {
			var valor = regla.valor.split("=")[1];
			arreglo[arreglo.length-1] += " "+valor;
		}
	} else if(regla.valor.indexOf('LISTA') == 0) {
		if(esCondicion) {
			var arregloLista = regla.valor.split("=")[1].split(",");
			var copiaRegla = arreglo[arreglo.length-1];
			arreglo[arreglo.length-1] += " "+arregloLista[0] + " )";
			for (var i = 1; i < arregloLista.length; i++) {
				arreglo.push(copiaRegla+" "+arregloLista[i]+" )");
			};
		} else {
			var arregloLista = regla.valor.split("=")[1].split(",");
			var copiaRegla = arreglo[arreglo.length-1];
			arreglo[arreglo.length-1] += " "+arregloLista[0];
			for (var i = 0; i < arregloLista.length; i++) {
				arreglo.push(copiaRegla+" "+arregloLista[i]);
			};
		}
	}
	console.log('arreglo Valor');
	console.log(arreglo);

	agregarCuerpo(regla, arreglo);
}

function agregarCuerpo (regla, arreglo) {
	var cuerpo = arregloReglas.filter(function( object ) {
	    return object.reglaPadre == regla.ID;
	});
	if(cuerpo.length > 0){
		var arregloCuerpo = [];
		for (var i = 0; i < cuerpo.length; i++) {
			arregloCuerpo.concat( campoObjetivo(cuerpo[i]) );
		};
		arreglo.concat(arregloCuerpo);
		console.log('1');
		console.log(arreglo);
		return arreglo;
	} else {
		console.log('2');
		console.log(arreglo);
		return arreglo;
	}
}