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
		loadRules();
	}
});

var variableDeVariable = null;

loadText();

function loadText () {
	nombrePadre = getNombrePadre();
	nombreHijo = getNombreHijo();
	descripcionHijo = getDescripcionHijo();
	variable = getVariableDeVariable();
	$("#variableName").text(nombrePadre);
	$("#variableOfVariableName").text(nombreHijo);
	$("#variableOfVariableName").css("white-space", "initial");
	$("#variableOfVariableName").css("text-align", "justify");
	$("#variableOfVariableDescription").text(descripcionHijo);
	$("#variableOfVariableDescription").css("white-space", "initial");
	$("#variableOfVariableDescription").css("text-align", "justify");
	variableDeVariable = variable;
}

var arregloListas = [];
var arregloElementosDeListas = [];
var arregloReglas = [];

function loadRules () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from Reglas", (err, result) => {
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
                    renderRules();
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
		if(arregloReglas[i].operacion=="-" || arregloReglas[i].operacion=="+" || arregloReglas[i].operacion=="*" || arregloReglas[i].operacion=="/")
			regla+=arregloReglas[i].campoObjetivo +" "+ arregloReglas[i].operacion +" "+ arregloReglas[i].valor;
		else
			regla+="if ( "+arregloReglas[i].campoObjetivo +" "+ arregloReglas[i].operacion +" "+ arregloReglas[i].valor +" )";
		/*var li = $("<li></li>");
		var p = $("<p></p>");
		var input = $("<input>").attr('type','radio');
		input.attr('name','rules');
		input.addClass('flat');
		//input.appendTo(p);
		p.append(input);
		$('#container').iCheck({checkboxClass: 'icheckbox_flat-green',radioClass: 'iradio_flat-green'});
		p.text(regla);
		p.appendTo(li);*/
		listContent+='<li><p><input type="radio" name="rules" class="flat"> '+ regla +' </p></li>';
		//$("#listRules").append(listContent);
		$("#listRules").append(listContent);
	};
	$("input[name='rules']").iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass: 'iradio_flat-green'
    });
	//$('body').iCheck();
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
                    renderListsSelect();
                });
            }
        });
    }); // fin transaction
}

function getElementsListsCamp (listaID) {
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
                    	arregloElementosDeListasCampo = result.recordset;
                    } else {
                    	arregloElementosDeListasCampo = [];
                    }
                    renderElementsListsCampSelect();
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

function renderListsSelect () {
	var selectHTML = '';
	for (var i = 0; i < arregloListas.length; i++) {
		selectHTML+='<option value='+arregloListas[i].ID+'>'+arregloListas[i].nombre+'</option>';
	};
	$("#listaCampoSelect").empty();
	$("#listaCampoSelect").append(selectHTML);
	$("#listaValorSelect").empty();
	$("#listaValorSelect").append(selectHTML);
	$("#elementoValorSelect").empty();
	$("#elementoValorSelect").append(selectHTML);
	getElementsListsCamp(arregloListas[0].ID);
	getElementsListsValue(arregloListas[0].ID);
}

function renderElementsListsCampSelect () {
	var selectHTML = '';
	for (var i = 0; i < arregloElementosDeListasCampo.length; i++) {
		selectHTML+='<option value='+arregloElementosDeListasCampo[i].ID+'>'+arregloElementosDeListasCampo[i].nombre+'</option>';
	};
	$("#listaCampoOptionsSelect").empty();
	$("#listaCampoOptionsSelect").append(selectHTML);
}

function renderElementsListsValueSelect () {
	var selectHTML = '';
	for (var i = 0; i < arregloElementosDeListasValor.length; i++) {
		selectHTML+='<option value='+arregloElementosDeListasValor[i].ID+'>'+arregloElementosDeListasValor[i].nombre+'</option>';
	};
	$("#elementoValorOptionSelect").empty();
	$("#elementoValorOptionSelect").append(selectHTML);
}

$('#date_inline').datepicker({
	todayHighlight: true,
	format: "dd-mm-yyyy",
    viewMode: "days",
    language: 'es'
});

/* *************	Radios	************* */
$("#listaCampoSelect").prop('disabled', true);
$("#listaCampoOptionsSelect").prop('disabled', true);
$("input[name='campoRadio']").on('ifClicked', function(event){
	if(event.currentTarget.id != "listaCampoRadio"){
		$("#campoCampoInput").prop('disabled', false);
		$("#listaCampoSelect").prop('disabled', true);
		$("#listaCampoOptionsSelect").prop('disabled', true);
		$("#listaCampoOptionsSelect option").prop("selected", false);
	} else {
		$("#campoCampoInput").prop('disabled', true);
		$("#listaCampoSelect").prop('disabled', false);
		$("#listaCampoOptionsSelect").prop('disabled', false);
	}
});

$("#manualValorInput").prop('disabled', true);
//$("#date_inline").datepicker().datepicker('disable');
//$("#date_inline").prop('disabled', true);
$("#date_inline").css('pointer-events', 'none');
$("#elementoValorSelect").prop('disabled', true);
$("#elementoValorOptionSelect").prop('disabled', true);
$("input[name='valorRadio']").on('ifClicked', function(event){
	if(event.currentTarget.id == "listaValorRadio") {
		$("#listaValorSelect").prop('disabled', false);
		$("#manualValorInput").prop('disabled', true);
		$("#date_inline").css('pointer-events', 'none');
		$('#date_inline').datepicker('setDate', null);
		$("#elementoValorSelect").prop('disabled', true);
		$("#elementoValorOptionSelect").prop('disabled', true);
		$("#elementoValorOptionSelect option").prop("selected", false);
	} else if(event.currentTarget.id == "manualValorRadio") {
		$("#listaValorSelect").prop('disabled', true);
		$("#manualValorInput").prop('disabled', false);
		$("#date_inline").css('pointer-events', 'none');
		$('#date_inline').datepicker('setDate', null);
		$("#elementoValorSelect").prop('disabled', true);
		$("#elementoValorOptionSelect").prop('disabled', true);
		$("#elementoValorOptionSelect option").prop("selected", false);
	} else if(event.currentTarget.id == "fechaValorRadio") {
		$("#listaValorSelect").prop('disabled', true);
		$("#manualValorInput").prop('disabled', true);
		$("#date_inline").css('pointer-events', '');
		$("#elementoValorSelect").prop('disabled', true);
		$("#elementoValorOptionSelect").prop('disabled', true);
		$("#elementoValorOptionSelect option").prop("selected", false);
	} else {
		$("#listaValorSelect").prop('disabled', true);
		$("#manualValorInput").prop('disabled', true);
		$("#date_inline").css('pointer-events', 'none');
		$('#date_inline').datepicker('setDate', null);
		$("#elementoValorSelect").prop('disabled', false);
		$("#elementoValorOptionSelect").prop('disabled', false);
	}
});
/* *************	Fin Radios	************* */






/* *************	Rules	************* */
function saveRule () {
	var reglaPadre = 0;
	var campoObjetivo;
	var operacion;
	var valor;
	var esFiltro = '0';
	if( $('#campoCampoRadio').is(':checked') )
		campoObjetivo = $("#campoCampoInput").val();
	else{
		if( $('#listaCampoOptionsSelect').val() != null ){
			campoObjetivo = getSelectOptions(arregloElementosDeListasCampo);
		} else {
			campoObjetivo = getSelectOptions(arregloElementosDeListasValor);
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
		operacion = '=';
	else if( $('#noigOperadorRadio').is(':checked') )
		operacion = '!=';
	else if( $('#masOperadorRadio').is(':checked') )
		operacion = '+';
	else if( $('#porOperadorRadio').is(':checked') )
		operacion = '*';
	else if( $('#menOperadorRadio').is(':checked') )
		operacion = '-';
	else
		operacion = '/';
	if( $('#listaValorRadio').is(':checked') )
		valor = getSelectOptions(arregloElementosDeListasCampo);
	else if( $('#manualValorRadio').is(':checked') )
		valor = $("#manualValorInput").val();
	else if( $('#fechaValorRadio').is(':checked') )
		valor = $("#date_inline").datepicker( 'getDate' );
	else
		valor = $("#elementoValorOptionSelect").val();
	console.log(reglaPadre);
	console.log(campoObjetivo);
	console.log(operacion);
	console.log(valor);
	console.log(variableDeVariable.ID);
	if(campoObjetivo.length > 0 && campoObjetivo.length < 1001) {
		if(operacion.length > 0 && operacion.length < 3) {
			if(valor.length > 0 && valor.length < 1001) {
				const transaction = new sql.Transaction( pool1 );
			    transaction.begin(err => {
			        var rolledBack = false
			 
			        transaction.on('rollback', aborted => {
			            // emited with aborted === true
			     
			            rolledBack = true
			        })
			        const request = new sql.Request(transaction);
			        request.query("insert into Reglas (variablePadre, reglaPadre, campoObjetivo, operacion, valor, esFiltro) values ("+variableDeVariable.ID+","+reglaPadre+",'"+campoObjetivo+"','"+operacion+"','"+valor+"','"+esFiltro+"')", (err, result) => {
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
			                    loadVariables();
			                    $("body").overhang({
								  	type: "success",
								  	primary: "#40D47E",
					  				accent: "#27AE60",
								  	message: "Regla creada con exito.",
								  	duration: 2,
								  	overlay: true
								});
			                });
			            }
			        });
			    }); // fin transaction
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "El campo de valor de la regla debe tener una longitud mayor a 0 y menor a 1001.",
				  	duration: 3,
				  	overlay: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "El campo de operacion de la regla debe tener una longitud mayor a 0 y menor a 3.",
			  	duration: 3,
			  	overlay: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "El campo objetivo de la regla debe tener una longitud mayor a 0 y menor a 1001.",
		  	duration: 3,
		  	overlay: true
		});
	}
}

function getSelectOptions (array) {
	var textoOption = '';
	for (var i = 0; i < array.length; i++) {
		textoOption+=array[i].nombre+',';
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