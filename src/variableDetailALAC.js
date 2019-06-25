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
		console.log(err);
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
		loadManualContableID();
		loadText();
		loadAllRules();
		//loadVariablesMainDB();
	}
});

window.scrollTo(0, 0);

var variableDeVariableReglaID = null;
var variableDeVariableObject = null;

function loadText () {
	var nombreHijo = getNombreHijo();
	var descripcionHijo = getDescripcionHijo();
	var factorHijo = getFactornHijo();
	var variable = getVariableDeVariableID();
	var tabla = getTablaHijo();
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
}

/* ****************** 		LOADING IMG 	********* */
/*function loadVariablesMainDB () {
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
                    	if(result.recordset[0].fullLogo.length > 0) {
                            $("#fullLogo").attr("src",result.recordset[0].fullLogo);
                        }
                        if(result.recordset[0].smallLogo.length > 0) {
                            $("#smallLogo").attr("src",result.recordset[0].smallLogo);
                        }
                    }
                });
            }
        });
    }); // fin transaction
}*/
/* ****************** 		END LOADING IMG 	********* */

var arregloActivos = [];
var arregloActivosEdit = [];
var arregloReglas = [];
var arregloTodasReglas = [];
var arregloListas = [];
var ordenGlobal = 0;
var variable1Seleccionada = null;
var variable2Seleccionada = null;

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
            	console.log(err);
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
                    renderListVariables();
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
            	console.log(err);
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
                    	arregloTodasReglas = result.recordset;
                    } else {
                    	arregloTodasReglas = [];
                    }
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
            	console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de VariablesdeVariablesFormula.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
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
	for (var i = 0; i < arregloReglas.length-1; i++) {
		var regla = '';
		listContent = '';
		if(arregloReglas[i].operacion=="-" || arregloReglas[i].operacion=="+" || arregloReglas[i].operacion=="*" || arregloReglas[i].operacion=="/")
			regla+=arregloReglas[i].campoObjetivo.split("=")[1] +" "+ arregloReglas[i].operacion +" "+ arregloReglas[i].valor.split("=")[1];
		else
			regla+=arregloReglas[i].variables +" ( Cuentas = "+ arregloReglas[i].valor.split("=")[1] +" )";
		var clase = '';
		/*if(arregloReglas[i].reglaPadre != 0)
			clase = 'style="padding-left:20%;"';*/
		//listContent+='<li '+clase+'><p>'+ regla +' </p><button style="position: absolute; right: 10px; margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" onclick="deleteRule('+i+')">Eliminar</button></li>';
		listContent+='<li '+clase+'><p>'+ regla +' </p><button style="position: absolute; right: 10px; margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" onclick="selectVar('+i+')">Modificar</button></li>';
		$("#listRules").append(listContent);
	};
	if(arregloReglas.length == 0 ){
		listContent+='<li><p> No hay agrupaciones creadas. </p></li>';
		$("#listRules").append(listContent);
	} else if(arregloReglas.length == 1 ){
		listContent+='<li><p> Sólo hay una agrupación creada. </p></li>';
		$("#listRules").append(listContent);
	}
	$("#formulaRule").empty();
	if(arregloReglas.length > 0) {
		var newListContent = '';
		if(arregloReglas[arregloReglas.length-1].campoObjetivo == 'INSTANCIACION') {
			//newListContent+='<li><p> '+arregloReglas[arregloReglas.length-1].variables+" ( Cuentas = "+arregloReglas[i].valor.split("=")[1]+" )"+'</p><button style="position: absolute; right: 10px; margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" onclick="deleteRule('+(arregloReglas.length-1)+')">Eliminar</button></li>';
			newListContent+='<li><p> '+arregloReglas[arregloReglas.length-1].variables+" ( Cuentas = "+arregloReglas[i].valor.split("=")[1]+" )"+'</p><button style="position: absolute; right: 10px; margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" onclick="selectVar('+(arregloReglas.length-1)+')">Modificar</button></li>';
		} else {
			newListContent+='<li><p> '+arregloReglas[arregloReglas.length-1].campoObjetivo.split("=")[1]+' '+arregloReglas[arregloReglas.length-1].operacion+' '+arregloReglas[arregloReglas.length-1].valor.split("=")[1]+'</p><button style="position: absolute; right: 10px; margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" onclick="deleteRule('+(arregloReglas.length-1)+')">Eliminar</button></li>';
		}
		$("#formulaRule").append(newListContent);
	} else {
		var newListContent = '<li><p> No hay agrupaciones creadas. </p></li>';
		$("#formulaRule").append(newListContent);
	}
}

function deleteRule (index) {
	$("body").overhang({
	  	type: "confirm",
	  	primary: "#f5a433",
	  	accent: "#dc9430",
	  	yesColor: "#3498DB",
	  	message: 'Esta seguro que desea eliminar la variable '+arregloReglas[index].variables+'?',
	  	overlay: true,
	  	yesMessage: "Eliminar",
	  	noMessage: "Cancelar",
	  	callback: function (value) {
	    	if(value){
	    		var nombreVar = arregloReglas[index].variables;
	    		var nuevoArray = arregloReglas.slice();
				for (var i = 0; i < nuevoArray.length; i++) {
					if(nuevoArray[i].campoObjetivo.localeCompare("INSTANCIACION") != 0 && (nuevoArray[i].campoObjetivo.split("=")[1].localeCompare(nombreVar) == 0 || nuevoArray[i].valor.split("=")[1].localeCompare(nombreVar) == 0)){
						var regla = nuevoArray[i];
						const transaction = new sql.Transaction( pool1 );
					    transaction.begin(err => {
					        var rolledBack = false;
					        transaction.on('rollback', aborted => {
					            // emited with aborted === true
					            rolledBack = true;
					        });
					        const request = new sql.Request(transaction);
					        request.query("delete from Reglas where ID = "+regla.ID, (err, result) => {
					            if (err) {
					            	console.log(err);
					                if (!rolledBack) {
					                    transaction.rollback(err => {
					                        $("body").overhang({
									            type: "error",
									            primary: "#f84a1d",
									            accent: "#d94e2a",
									            message: "Error en eliminación en la tabla de Reglas.",
									            overlay: true,
									            closeConfirm: true
									        });
					                    });
					                }
					            } else {
					                transaction.commit(err => {
					                    // ... error checks
					                    $("body").overhang({
								            type: "success",
										  	primary: "#40D47E",
							  				accent: "#27AE60",
								            message: "Variable eliminada con éxito.",
								            overlay: true,
								            duration: 1
								        });
								        $('#modalEdit').modal('toggle');
					                    loadRules();
					                    loadAllRules();
					                });
					            }
					        });
					    }); // fin transaction
					}
				}
				const transaction = new sql.Transaction( pool1 );
			    transaction.begin(err => {
			        var rolledBack = false;
			        transaction.on('rollback', aborted => {
			            // emited with aborted === true
			            rolledBack = true;
			        });
			        const request = new sql.Request(transaction);
			        request.query("delete from Reglas where ID = "+arregloReglas[index].ID, (err, result) => {
			            if (err) {
			            	console.log(err);
			                if (!rolledBack) {
			                    transaction.rollback(err => {
			                        $("body").overhang({
							            type: "error",
							            primary: "#f84a1d",
							            accent: "#d94e2a",
							            message: "Error en eliminación en la tabla de Reglas.",
							            overlay: true,
							            closeConfirm: true
							        });
			                    });
			                }
			            } else {
			                transaction.commit(err => {
			                    // ... error checks
			                    $("body").overhang({
						            type: "success",
								  	primary: "#40D47E",
					  				accent: "#27AE60",
						            message: "Variable eliminada con éxito.",
						            overlay: true,
						            duration: 1
						        });
			                    loadRules();
			                    loadAllRules();
			                });
			            }
			        });
			    }); // fin transaction
	    	}
	  	}
	});
}

function renderListVariables () {
	$("#variables1List").empty();
	$("#variables2List").empty();
	var content1 = '';
	var content2 = '';
	for (var i = 0; i < arregloReglas.length; i++) {
		if(arregloReglas[i].campoObjetivo == 'INSTANCIACION') {
			content1+='<li><p> <input type="radio" name="variable1" class="flat" value="'+i+'"> Agrupación '+arregloReglas[i].variables+'</p></li>'
			content2+='<li><p> <input type="radio" name="variable2" class="flat" value="'+i+'"> Agrupación '+arregloReglas[i].variables+'</p></li>'
		} else if( arregloReglas[i].campoObjetivo.indexOf("AGRUPACION") == 0) {
			content1+='<li><p> <input type="radio" name="variable1" class="flat" value="'+i+'"> '+arregloReglas[i].variables+'</p></li>'
			content2+='<li><p> <input type="radio" name="variable2" class="flat" value="'+i+'"> '+arregloReglas[i].variables+'</p></li>'
		}
	};
	if(arregloReglas.length == 0 ) {
		content1+='<li><p> No hay agrupaciones creadas.</p></li>';
		content2+='<li><p> No hay agrupaciones creadas.</p></li>';
	}
	$("#variables1List").append(content1);
	$("#variables2List").append(content2);
	$("input[name='variable1']").iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass: 'iradio_flat-green'
    });
    $("input[name='variable1']").on('ifChecked', function(event){
    	var nombres = [];
    	var index = $("input[name='variable1']:checked").val();
    	variable1Seleccionada = arregloReglas[index];
    	if(arregloReglas[index].campoObjetivo == 'INSTANCIACION') {
	    	var listaSucia = arregloReglas[index].valor.split("=")[1];
	    	var partesConDolar = listaSucia.split(",");
	    	for (var i = 0; i < partesConDolar.length; i++) {
	    		nombres.push(partesConDolar[i].split("-")[0]);
	    	};
	    } else if(arregloReglas[index].campoObjetivo.indexOf("AGRUPACION") == 0) {
	    	nombres.push(arregloReglas[index].campoObjetivo.split("=")[1]);
	    	nombres.push(arregloReglas[index].operacion);
	    	nombres.push(arregloReglas[index].valor.split("=")[1]);
	    }
    	$("#listaSelectVariable1").empty();
    	var contentSelect1 = '';
    	for (var i = 0; i < nombres.length; i++) {
    		contentSelect1+='<option>'+nombres[i]+'</option>';
    	};
    	$("#listaSelectVariable1").append(contentSelect1);
    });
    $("input[name='variable2']").iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass: 'iradio_flat-green'
    });
    $("input[name='variable2']").on('ifChecked', function(event){
    	var nombres = [];
    	var index = $("input[name='variable2']:checked").val();
    	variable2Seleccionada = arregloReglas[index];
    	if(arregloReglas[index].campoObjetivo == 'INSTANCIACION') {
	    	var listaSucia = arregloReglas[index].valor.split("=")[1];
	    	var partesConDolar = listaSucia.split(",");
	    	for (var i = 0; i < partesConDolar.length; i++) {
	    		nombres.push(partesConDolar[i].split("-")[0]);
	    	};
	    } else if(arregloReglas[index].campoObjetivo.indexOf("AGRUPACION") == 0) {
	    	nombres.push(arregloReglas[index].campoObjetivo.split("=")[1]);
	    	nombres.push(arregloReglas[index].operacion);
	    	nombres.push(arregloReglas[index].valor.split("=")[1]);
	    }
    	$("#listaSelectVariable2").empty();
    	var contentSelect1 = '';
    	for (var i = 0; i < nombres.length; i++) {
    		contentSelect1+='<option>'+nombres[i]+'</option>';
    	};
    	$("#listaSelectVariable2").append(contentSelect1);
    });
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
        request.query("select * from Listas where tipo = 1 or tipo = 2 or tipo = 10", (err, result) => {
            if (err) {
            	console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de Listas.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    var listaID = 0;
                    if(result.recordset.length > 0){
                    	arregloListas = result.recordset;
                    	listaID = result.recordset[0].ID;
                    } else {
                    	arregloListas = [];
                    	listaID = 0;
                    }
                    loadManualContable(listaID);
                    loadManualContableEdit(listaID);
                    renderListsDropdown();
                });
            }
        });
    }); // fin transaction
}

function renderListsDropdown () {
	$("#listaSelectReglasALAC").empty();
	$("#listaSelectReglasALACEdit").empty();
	var content = '';
	for (var i = 0; i < arregloListas.length; i++) {
		content+='<option value="'+arregloListas[i].ID+'">'+arregloListas[i].nombre+'</option>';
	};
	$("#listaSelectReglasALAC").append(content);
	$("#listaSelectReglasALACEdit").append(content);
}

function loadManualContable (listaID) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables where idLista = "+listaID, (err, result) => {
            if (err) {
            	console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de ListasVariables.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
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

function loadManualContableEdit (listaID) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables where idLista = "+listaID, (err, result) => {
            if (err) {
            	console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de ListasVariables.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                    	arregloActivosEdit = result.recordset;
                    } else {
                    	arregloActivosEdit = [];
                    }
                    $("#valorElementoListaALACEdit").iCheck('check');
                    renderListsSelectEdit();
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

$('#nombreElementoListaALACEdit').on('ifChecked', function () {
	renderListsSelectEdit();
});
$('#valorElementoListaALACEdit').on('ifChecked', function () {
	renderListsSelectEdit();
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
	$(".select2-list").select2({
	    allowClear: true,
	    minimumInputLength: 6,
	    //minimumInputLength: 3,
	    language: "es"
	});
}

function renderListsSelectEdit () {
	$("#listaActivosSelectEdit").empty();
	var content = '';
	if( $('#nombreElementoListaALACEdit').iCheck('update')[0].checked ) {
		for (var i = 0; i < arregloActivosEdit.length; i++) {
			content+='<option value="'+arregloActivosEdit[i].nombre+'">'+arregloActivosEdit[i].nombre+'</option>';
		};
	} else {
		for (var i = 0; i < arregloActivosEdit.length; i++) {
			content+='<option value="'+arregloActivosEdit[i].valor+'">'+arregloActivosEdit[i].valor+'</option>';
		};
	}
	$("#listaActivosSelectEdit").append(content);
	$(".select2-list").select2({
	    allowClear: true,
	    minimumInputLength: 6,
	    //minimumInputLength: 3,
	    language: "es"
	});
}

function filterListSelect () {
	$("#listaActivosSelect").empty();
	var textToSearch = $("#textoABuscar").val().toLowerCase();
	var content = '';
	if( $('#nombreElementoListaALAC').iCheck('update')[0].checked ) {
		for (var i = 0; i < arregloActivos.length; i++) {
			if(arregloActivos[i].nombre.toString().toLowerCase().includes(textToSearch) || arregloActivos[i].valor.toString().toLowerCase().includes(textToSearch))
				content+='<option value="'+i+'">'+arregloActivos[i].nombre+'</option>';
		};
	} else {
		for (var i = 0; i < arregloActivos.length; i++) {
			if(arregloActivos[i].nombre.toString().toLowerCase().includes(textToSearch) || arregloActivos[i].valor.toString().toLowerCase().includes(textToSearch))
				content+='<option value="'+i+'">'+arregloActivos[i].valor+'</option>';
		};
	}
	$("#listaActivosSelect").append(content);
}

/* *************	Fin Radios	************* */














/* *************	Update	************* */
var posicionSeleccionada;
function selectVar (index) {
	posicionSeleccionada = index;
	var cuentasJuntas = arregloReglas[posicionSeleccionada].valor.split("=")[1];
	var cuentas = cuentasJuntas.split(",");
	var data = [];
	for (var i = 0; i < cuentas.length; i++) {
		data.push({id: cuentas[i], text: cuentas[i]});
	};
	$("#listaActivosSelectEdit").select2('data', data);
	$("#nombreVarEdit").val(arregloReglas[posicionSeleccionada].variables);
	$("#modalEdit").modal("toggle");
}

function modifyVar () {
	$("body").overhang({
	  	type: "confirm",
	  	primary: "#f5a433",
	  	accent: "#dc9430",
	  	yesColor: "#3498DB",
	  	message: 'Esta seguro que desea modificar la variable '+arregloReglas[posicionSeleccionada].variables+'?',
	  	overlay: true,
	  	yesMessage: "Modificar",
	  	noMessage: "Cancelar",
	  	callback: function (value) {
	    	if(value){
	    		var nombre = $("#nombreVarEdit").val();
				var cuentas = $("#listaActivosSelectEdit").val();
				var valor, elementos = '';
				if(cuentas != null) {
					for (var i = 0; i < cuentas.length; i++) {
						elementos+=cuentas[i];
						if( (i+1) < cuentas.length )
							elementos+=',';
					};
					valor = 'LISTA=' + elementos;
				} else 
					valor = 'LISTA=' + getSelectOptions(arregloActivosEdit);
	    		var entrar = true;
				for (var i = 0; i < arregloTodasReglas.length; i++) {
					if(arregloTodasReglas[i].variables.toLowerCase().localeCompare(nombre.toLowerCase()) == 0 && posicionSeleccionada != i)
						entrar = false;
				};
				if(entrar) {
		    		if(nombre.length > 0 && nombre.length < 51) {
						if(!/\s/.test(nombre)) {
				    		const transaction = new sql.Transaction( pool1 );
						    transaction.begin(err => {
						        var rolledBack = false;
						        transaction.on('rollback', aborted => {
						            // emited with aborted === true
						            rolledBack = true;
						        });
						        const request = new sql.Request(transaction);
						        request.query("update Reglas set valor = '"+valor+"', variables = '"+nombre+"' where ID = "+arregloReglas[posicionSeleccionada].ID, (err, result) => {
						            if (err) {
						            	console.log(err)
						                if (!rolledBack) {
						                    transaction.rollback(err => {
						                        $("body").overhang({
										            type: "error",
										            primary: "#f84a1d",
										            accent: "#d94e2a",
										            message: "Error en modificación de variable.",
										            overlay: true,
										            closeConfirm: true
										        });
						                    });
						                }
						            }  else {
						                transaction.commit(err => {
						                    // ... error checks
						                    $("body").overhang({
											  	type: "success",
											  	primary: "#40D47E",
								  				accent: "#27AE60",
											  	message: "Variable modificada con éxito.",
											  	duration: 1,
											  	overlay: true
											});
											$('#modalEdit').modal('toggle');
											loadRules();
											loadAllRules();
						                });
						            }
						        });
						    }); // fin transaction
						} else {
							$("body").overhang({
							  	type: "error",
							  	primary: "#f84a1d",
								accent: "#d94e2a",
							  	message: "El nombre de la variable no puede contener espacios.",
							  	overlay: true,
					            closeConfirm: true
							});
						}
					} else {
						$("body").overhang({
						  	type: "error",
						  	primary: "#f84a1d",
							accent: "#d94e2a",
						  	message: "El nombre de la variable debe tener una longitud mayor a 0 y menor a 51.",
						  	overlay: true,
				            closeConfirm: true
						});
					}
				} else {
					$("body").overhang({
					  	type: "error",
					  	primary: "#f84a1d",
						accent: "#d94e2a",
					  	message: "El nombre de la variable ya existe, el nombre tiene que ser único en todas las variables.",
					  	overlay: true,
			            closeConfirm: true
					});
				}
	    	}
	  	}
	});
}

function deleteRuleModal () {
	$("body").overhang({
	  	type: "confirm",
	  	primary: "#f5a433",
	  	accent: "#dc9430",
	  	yesColor: "#3498DB",
	  	message: 'Esta seguro que desea eliminar la variable '+arregloReglas[posicionSeleccionada].variables+'?',
	  	overlay: true,
	  	yesMessage: "Eliminar",
	  	noMessage: "Cancelar",
	  	callback: function (value) {
	    	if(value){
	    		var nombreVar = arregloReglas[posicionSeleccionada].variables;
	    		var nuevoArray = arregloReglas.slice();
				for (var i = 0; i < nuevoArray.length; i++) {
					if(nuevoArray[i].campoObjetivo.localeCompare("INSTANCIACION") != 0 && (nuevoArray[i].campoObjetivo.split("=")[1].localeCompare(nombreVar) == 0 || nuevoArray[i].valor.split("=")[1].localeCompare(nombreVar) == 0)){
						var regla = nuevoArray[i];
						const transaction = new sql.Transaction( pool1 );
					    transaction.begin(err => {
					        var rolledBack = false;
					        transaction.on('rollback', aborted => {
					            // emited with aborted === true
					            rolledBack = true;
					        });
					        const request = new sql.Request(transaction);
					        request.query("delete from Reglas where ID = "+regla.ID, (err, result) => {
					            if (err) {
					            	console.log(err);
					                if (!rolledBack) {
					                    transaction.rollback(err => {
					                        $("body").overhang({
									            type: "error",
									            primary: "#f84a1d",
									            accent: "#d94e2a",
									            message: "Error en eliminación en la tabla de Reglas.",
									            overlay: true,
									            closeConfirm: true
									        });
					                    });
					                }
					            } else {
					                transaction.commit(err => {
					                    // ... error checks
					                    $("body").overhang({
								            type: "success",
										  	primary: "#40D47E",
							  				accent: "#27AE60",
								            message: "Variable eliminada con éxito.",
								            overlay: true,
								            duration: 1
								        });
								        $('#modalEdit').modal('toggle');
					                    loadRules();
					                    loadAllRules();
					                });
					            }
					        });
					    }); // fin transaction
					}
				}
				const transaction = new sql.Transaction( pool1 );
			    transaction.begin(err => {
			        var rolledBack = false;
			        transaction.on('rollback', aborted => {
			            // emited with aborted === true
			            rolledBack = true;
			        });
			        const request = new sql.Request(transaction);
			        request.query("delete from Reglas where ID = "+arregloReglas[posicionSeleccionada].ID, (err, result) => {
			            if (err) {
			            	console.log(err);
			                if (!rolledBack) {
			                    transaction.rollback(err => {
			                        $("body").overhang({
							            type: "error",
							            primary: "#f84a1d",
							            accent: "#d94e2a",
							            message: "Error en eliminación en la tabla de Reglas.",
							            overlay: true,
							            closeConfirm: true
							        });
			                    });
			                }
			            } else {
			                transaction.commit(err => {
			                    // ... error checks
			                    $("body").overhang({
						            type: "success",
								  	primary: "#40D47E",
					  				accent: "#27AE60",
						            message: "Variable eliminada con éxito.",
						            overlay: true,
						            duration: 1
						        });
			                    loadRules();
			                    loadAllRules();
			                });
			            }
			        });
			    }); // fin transaction
	    	}
	  	}
	});
}
/* *************	Fin Update	************* */











/* *************	Rules	************* */
function saveNewRule () {
	var nombre = $("#nombreVar").val();
	var entrar = true;
	for (var i = 0; i < arregloTodasReglas.length; i++) {
		if(arregloTodasReglas[i].variables.toLowerCase().localeCompare(nombre.toLowerCase()) == 0)
			entrar = false;
	};
	if(entrar) {
		if(nombre.length > 0 && nombre.length < 51) {
			if(!/\s/.test(nombre)) {
				var campoObjetivo = 'INSTANCIACION', operacion = '=', reglaPadre = 0, esFiltro = false, variables = nombre, orden = 0, valor, filtro = -1;
				var idDeListaSel = $("#listaSelectReglasALAC").val();
				var listaSel = arregloListas.filter(function(object) {
                    return ( object.ID == idDeListaSel );
                });
                var elementosSelect = $("#listaActivosSelect").val();
				var elementos = '';
                if(listaSel[0].tipo != 10) {
					if(elementosSelect != null) {
						for (var i = 0; i < elementosSelect.length; i++) {
							elementos+=arregloActivos[parseInt(elementosSelect[i])].valor;
							if( (i+1) < elementosSelect.length )
								elementos+=',';
						};
						valor = 'LISTA=' + elementos;
					} /*else 
						valor = 'LISTA=' + getSelectOptions(arregloActivos);*/
				} else {
					if(elementosSelect != null) {
						for (var i = 0; i < elementosSelect.length; i++) {
							elementos+=arregloActivos[parseInt(elementosSelect[i])].ID;
							if( (i+1) < elementosSelect.length )
								elementos+=',';
						};
						valor = 'IDS=' + elementos;
					}
				}
				/*console.log("-_------___----");
				console.log(listaSel[0].tipo);
                console.log(reglaPadre);
                console.log(campoObjetivo);
                console.log(operacion);
                console.log(valor);
                console.log(variables);
                console.log(variableDeVariableReglaID);
                console.log(ordenGlobal);
                console.log(ordenGlobal+1);
                console.log("-_------___----");*/
                if(valor != undefined && valor.length > 0) {
					const transaction = new sql.Transaction( pool1 );
				    transaction.begin(err => {
				        var rolledBack = false;
				        transaction.on('rollback', aborted => {
				            // emited with aborted === true
				            rolledBack = true;
				        });
				        const request = new sql.Request(transaction);
				        request.query("insert into Reglas (variablePadre, reglaPadre, campoObjetivo, operacion, valor, variables, esFiltro, filtro, orden) values ("+variableDeVariableReglaID+","+reglaPadre+",'"+campoObjetivo+"','"+operacion+"','"+valor+"','"+variables+"','"+esFiltro+"',"+filtro+","+(ordenGlobal+1)+")", (err, result) => {
				            if (err) {
				            	console.log(err);
				                if (!rolledBack) {
				                	console.log(err)
				                    transaction.rollback(err => {
				                        $("body").overhang({
								            type: "error",
								            primary: "#f84a1d",
								            accent: "#d94e2a",
								            message: "Error en inserción de variable.",
								            overlay: true,
								            closeConfirm: true
								        });
				                    });
				                }
				            }  else {
				                transaction.commit(err => {
				                    // ... error checks
				                    $("body").overhang({
									  	type: "success",
									  	primary: "#40D47E",
						  				accent: "#27AE60",
									  	message: "Variable creada con éxito.",
									  	duration: 1,
									  	overlay: true
									});
									loadRules();
									loadAllRules();
				                });
				            }
				        });
				    }); // fin transaction
				} else {
					$("body").overhang({
					  	type: "error",
					  	primary: "#f84a1d",
						accent: "#d94e2a",
					  	message: "Se tiene que seleccionar por lo menos una variable.",
					  	overlay: true,
			            closeConfirm: true
					});
				}
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "El nombre de la variable no puede contener espacios.",
				  	overlay: true,
		            closeConfirm: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "El nombre de la variable debe tener una longitud mayor a 0 y menor a 51.",
			  	overlay: true,
	            closeConfirm: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "El nombre de la variable ya existe, el nombre tiene que ser único en todas las variables.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function saveRule () {
	var reglaPadre = 0;
	var esFiltro = false;
	var filtro = -1;
	var operacion = $("input[name='opRadio']:checked").val();
	var id = 1;
	for (var i = 0; i < arregloTodasReglas.length; i++) {
		if(arregloTodasReglas[i].ID > id)
			id = arregloTodasReglas[i].ID;
	};
	if(operacion != undefined) {
		if(variable1Seleccionada != null && variable1Seleccionada != undefined) {
			if(variable2Seleccionada != null && variable2Seleccionada != undefined) {
				var campoObjetivo = 'AGRUPACION='+variable1Seleccionada.variables, valor = 'AGRUPACION='+variable2Seleccionada.variables, variables = 'nuevavariable'+(id+1);
				const transaction = new sql.Transaction( pool1 );
			    transaction.begin(err => {
			        var rolledBack = false;
			        transaction.on('rollback', aborted => {
			            // emited with aborted === true
			            rolledBack = true;
			        });
			        const request = new sql.Request(transaction);
			        request.query("insert into Reglas (variablePadre, reglaPadre, campoObjetivo, operacion, valor, variables, esFiltro, filtro, orden) values ("+variableDeVariableReglaID+","+reglaPadre+",'"+campoObjetivo+"','"+operacion+"','"+valor+"','"+variables+"','"+esFiltro+"',"+filtro+","+(ordenGlobal+1)+")", (err, result) => {
			            if (err) {
			            	console.log(err);
			                if (!rolledBack) {
			                    transaction.rollback(err => {
			                        $("body").overhang({
							            type: "error",
							            primary: "#f84a1d",
							            accent: "#d94e2a",
							            message: "Error en inserción de variable.",
							            overlay: true,
							            closeConfirm: true
							        });
			                    });
			                }
			            }  else {
			                transaction.commit(err => {
			                    // ... error checks
			                    $("body").overhang({
								  	type: "success",
								  	primary: "#40D47E",
					  				accent: "#27AE60",
								  	message: "Regla creada con éxito.",
								  	duration: 1,
								  	overlay: true
								});
								loadRules();
								loadAllRules();
			                });
			            }
			        });
			    }); // fin transaction
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "Seleccione una variable 2.",
				  	overlay: true,
		            closeConfirm: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "Seleccione una variable 1.",
			  	overlay: true,
	            closeConfirm: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Seleccione una operación.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

/*function getSelectOptions (array, aplicarNombre) {
	var textoOption = '';
	for (var i = 0; i < array.length; i++) {
		textoOption+=array[i].nombre + "-" + array[i].valor + '$' + aplicarNombre;
		if( (i+1) < array.length )
			textoOption+=',';
	};
	return textoOption;
}*/
function getSelectOptions (array) {
	var textoOption = '';
	for (var i = 0; i < array.length; i++) {
		textoOption+=array[i].valor;
		if( (i+1) < array.length )
			textoOption+=',';
	};
	return textoOption;
}
/* *************	Fin Rules	************* */






















//  **********      Interval      **********
var myInterval;

function myTimer() {
    if($(".dots").text().length<3) {
        $(".dots").text($(".dots").text()+".");
    } else {
        $(".dots").text("");
        $(".dots").text($(".dots").text()+".");
    }
}

function stopTimer() {
    $(".dots").text("");
    clearInterval(myInterval);
}

//  **********      Fin interval      **********























//	**********		Route Change		**********
function goVariables () {
	$(".select2-list").select2('destroy');
	$("#app_root").empty();
    $("#app_root").load("src/variables.html");
}

function goHome () {
	$(".select2-list").select2('destroy');
	$("#app_root").empty();
    $("#app_root").load("src/home.html");
}

function goUsers () {
	$(".select2-list").select2('destroy');
	$("#app_root").empty();
    $("#app_root").load("src/users.html");
}

function goConnections () {
	$(".select2-list").select2('destroy');
    $("#app_root").empty();
    $("#app_root").load("src/importaciones.html");
}

function goConfig () {
	$(".select2-list").select2('destroy');
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/config.html");
}

function logout () {
	$(".select2-list").select2('destroy');
    $("#app_full").empty();
    session.defaultSession.clearStorageData([], (data) => {});
    //cleanup();
    $("#app_full").load("src/login.html");
}

function goRCL () {
	$(".select2-list").select2('destroy');
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
}

function goReports () {
	$(".select2-list").select2('destroy');
	$("#app_root").empty();
    $("#app_root").load("src/reportes.html");
}

function goGraphics () {
	$(".select2-list").select2('destroy');
    $("#app_root").empty();
    $("#app_root").load("src/graficos.html");
}

function goLists () {
	$(".select2-list").select2('destroy');
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/variablesLists.html");
}

function showRules () {
	var rulesArray = [];
	for (var i = 0; i < arregloReglas.length; i++) {
		if(arregloReglas[i].reglaPadre == 0) {
			var arreglo = [];
			var resultado = createCode(arregloReglas[i], arreglo, 0);
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

function createCode (regla, arreglo, tabs) {
	var tabsText = '';
	for (var i = 0; i < tabs; i++) {
		tabsText+='\t';
	};
	if(regla.campoObjetivo == 'INSTANCIACION') {
		arreglo.push(tabsText+"var "+regla.variables+" = 0;");
		var listaIDs = regla.valor.split("=")[1];
		var ids = listaIDs.split(",");
		for (var i = 0; i < arregloActivos.length; i++) {
			for (var j = 0; j < ids.length; j++) {
				if( parseInt(ids[j]) == arregloActivos[i].cuenta) {
					arreglo.push("\n"+tabsText+"if ( arregloActivos[i].cuenta == "+ids[j]+" )");
					arreglo.push("\n"+tabsText+"\t"+regla.variables+" += "+arregloActivos[i].saldo+";");
				}
			};
		};
		arreglo.push("\ntotalVar"+regla.variables+" = "+regla.variables+";");
	} else if(regla.campoObjetivo.indexOf('AGRUPACION') == 0 ) {
		arreglo.push(tabsText+regla.variables+" = "+regla.campoObjetivo.split("=")[1]+" "+regla.operacion+" "+regla.valor.split("=")[1]+";");
		arreglo.push("\ntotal"+regla.variables+" = "+regla.variables+";");
	}
	return arreglo;
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