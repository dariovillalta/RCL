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
	if(err)
		console.log(err);
	else{
		console.log('pool loaded');
		loadLists();
		loadText();
        loadVariablesIMG();
	}
});

var variableDeVariableReglaID = null;
var variableDeVariableObject = null;

/* ******************       LOADING IMG     ********* */
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
                        if(result.recordset[0].fullLogo.length > 0) {
                            $("#fullLogo").attr("src",filepathFullLogo);
                        }
                        if(result.recordset[0].smallLogo.length > 0) {
                            $("#smallLogo").attr("src",filepathSmallLogo);
                        }
                    }
                });
            }
        });
    }); // fin transaction
}
/* ******************       END LOADING IMG     ********* */

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

var tablaPrestamos = [
	{valor: "idCliente",nombre: "ID del Cliente"},
	{valor: "nombreCliente",nombre: "Nombre del Cliente"},
	{valor: "tipoPersona",nombre: "Tipo de Persona"},
	{valor: "tipoSubPersona",nombre: "Tipo de Sub-Persona"},
	{valor: "saldo",nombre: "Saldo"},
	{valor: "valorFinanciacion",nombre: "Valor de la Financiación"},
	/*{valor: "moneda",nombre: "Moneda"},*/
	{valor: "montoOtorgado",nombre: "Monto Otorgado"},
	{valor: "tipoCredito",nombre: "Tipo de Crédito"},
	{valor: "diasMora",nombre: "Días de Mora"},
	{valor: "utilizable",nombre: "Utilizable"},
	{valor: "vencimiento",nombre: "Fecha de Vencimiento"},
	//{valor: "vencimiento",nombre: "Vencimiento"},
	//{valor: "creditosRefinanciados",nombre: "Créditos Refinanciados"},
	{valor: "clausulasRestrictivas",nombre: "Clausulas Restrictivas"},
	{valor: "esFinanciacionGarantizada",nombre: "Financiación Garantizada"},
	{valor: "alac",nombre: "ALAC"}
	/*{valor: "sucursal",nombre: "Sucursal"},
	{valor: "columnaExtra1",nombre: "Columna Extra 1"},
	{valor: "columnaExtra2",nombre: "Columna Extra 2"}*/
];

var tablaPrestamosAgrupacion = [
	{valor: "idCliente",nombre: "ID del Cliente"},
	{valor: "tipoPersona",nombre: "Tipo de Persona"},
	{valor: "tipoSubPersona",nombre: "Tipo de Sub-Persona"},
	{valor: "tipoCredito",nombre: "Tipo de Crédito"},
	{valor: "diasMora",nombre: "Días de Mora"},
	{valor: "utilizable",nombre: "Utilizable"},
	{valor: "clausulasRestrictivas",nombre: "Clausulas Restrictivas"},
	{valor: "esFinanciacionGarantizada",nombre: "Financiación Garantizada"}
];

function loadSelectCampoObjetivo (tabla) {
	$("#campoCampoInput").empty();
	var content = '';
	for (var i = 0; i < tablaPrestamos.length; i++) {
		content+='<option value="'+tablaPrestamos[i].valor+'">'+tablaPrestamos[i].nombre+'</option>';
	};
	$("#campoCampoInput").append(content);
	$("#agrupacionCampoInput").empty();
	var content = '';
	for (var i = 0; i < tablaPrestamosAgrupacion.length; i++) {
		content+='<option value="'+tablaPrestamosAgrupacion[i].valor+'">'+tablaPrestamosAgrupacion[i].nombre+'</option>';
	};
	$("#agrupacionCampoInput").append(content);
}

var arregloListas = [];
var arregloElementosDeListas = [];
var arregloReglas = [];
var arregloElementosDeListasValorAgrupacion = [];

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
                    renderRules();
                    renderTable();
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

function renderTable () {
    if ( $.fn.dataTable.isDataTable( '#tablaReglas' ) )
        $("#tablaReglas").dataTable().fnDestroy();
    $( "#tablaReglas tbody").unbind( "click" );
    var table = $('#tablaReglas').DataTable({
        "data": arregloReglas,
        dom: "Bflrtip",
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
            { "data": "ID" },
            { "data": "reglaPadre" },
            { "data": "campoObjetivo" },
            { "data": "Guardar" },
            { "data": "Eliminar" }
        ],
        rowCallback: function(row, data, index){
            $(row).find('td:eq(2)').html(getTextRule(data));
        },
        "columnDefs": [ {
            "targets": -1,
            "defaultContent": '<a class="btn btn-app deleteRule"> <i class="fa fa-eraser"></i> Eliminar </a>',
            "className": "text-center"
        },
        {
            "targets": -2,
            "defaultContent": '<a class="btn btn-app saveRule"> <i class="fa fa-save"></i> Guardar </a>',
            "className": "text-center"
        },
        {
            "targets": 0,
            "className": "text-center",
        },
        {
            "targets": 1,
            "className": "text-center"
        },
        {
            "targets": 2,
            "className": "text-center"
        }]
    });
    if ( $.fn.dataTable.isDataTable( '#tablaReglas' ) )
        table.MakeCellsEditable("destroy");

    var content = [];
    for (var i = 0; i < arregloReglas.length; i++) {
    	content.push({value: arregloReglas[i].ID, display: arregloReglas[i].ID});
    };

    table.MakeCellsEditable({
        "onUpdate": function() { return; },
        "columns": [1],
        "confirmationButton": false,
        "inputTypes": [
        	{
                "column": 1,
                "type":"list",
                "options": content
            }
        ]
    });

    $('#tablaReglas tbody').on( 'click', 'tr a.saveRule', function () {
        var data = table.row( $(this).parents('tr') ).data();
        if(!isNaN(data.reglaPadre)) {
        	if(data.reglaPadre != data.ID) {
	            $("body").overhang({
	                type: "confirm",
	                primary: "#f5a433",
	                accent: "#dc9430",
	                yesColor: "#3498DB",
	                message: 'Esta seguro que desea guardar los cambios?',
	                overlay: true,
	                yesMessage: "Modificar",
	                noMessage: "Cancelar",
	                callback: function (value) {
	                    if(value)
	                        modifyRule(data.ID, data.reglaPadre);
	                }
	            });
	           } else {
	            $("body").overhang({
	                type: "error",
	                primary: "#f84a1d",
	                accent: "#d94e2a",
	                message: "La variable padre no puede ser la misma variable.",
	                overlay: true,
	                closeConfirm: true
	            });
	        }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "La variable padre solo puede ser un número.",
                overlay: true,
                closeConfirm: true
            });
        }
    } );

    $('#tablaReglas tbody').on( 'click', 'tr a.deleteRule', function () {
        var data = table.row( $(this).parents('tr') ).data();
        $("body").overhang({
            type: "confirm",
            primary: "#f5a433",
            accent: "#dc9430",
            yesColor: "#3498DB",
            message: 'Esta seguro que desea eliminar la variable?',
            overlay: true,
            yesMessage: "Eliminar",
            noMessage: "Cancelar",
            callback: function (value) {
                if(value)
                    deleteRule(data.ID);
            }
        });
    } );
}

function modifyRule (id, variablePadre) {
    console.log(variablePadre)
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("update Reglas set reglaPadre = "+variablePadre+" where id = "+id, (err, result) => {
            if (err) {
                console.log(err)
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en modificación de Variable.",
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
					  	duration: 2,
					  	overlay: true
					});
                    loadRules();
                });
            }
        });
    }); // fin transaction
}

function deleteRule (id) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("delete from Reglas where id = "+id, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en eliminación de Variable.",
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
					  	message: "Variable eliminada con éxito.",
					  	duration: 2,
					  	overlay: true
					});
                    loadRules();
                });
            }
        });
    }); // fin transaction
}

function getTextRule (regla) {
	var reglaTexto = '';
	if(regla.operacion=="-" || regla.operacion=="+" || (regla.operacion=="*" && !regla.campoObjetivo.includes("FOSEDE")) || regla.operacion=="/") {
		var campoObjetivo;
		if(regla.campoObjetivo.split("=").length > 1)
			campoObjetivo = getCampo(regla.campoObjetivo.split("=")[1]);
		else
			campoObjetivo = regla.campoObjetivo;
		var valor;
		if(regla.valor.split("=").length > 1)
			valor = regla.valor.split("=")[1];
		else
			valor = regla.valor;
		reglaTexto+=campoObjetivo +" "+ regla.operacion +" "+ valor;
	} else if(regla.operacion=="<" || regla.operacion=="<=" || regla.operacion==">" || regla.operacion==">=" || regla.operacion=="==" || regla.operacion=="!=") {
		var campoObjetivo;
		if(regla.campoObjetivo.split("=").length > 1)
			campoObjetivo = getCampo(regla.campoObjetivo.split("=")[1]);
		else
			campoObjetivo = regla.campoObjetivo;
		var valor;
		if(regla.valor.split("=").length > 1)
			valor = regla.valor.split("=")[1];
		else
			valor = regla.valor;
		reglaTexto+="Si "+campoObjetivo +" "+ regla.operacion +" "+ valor;
	} else if(regla.campoObjetivo.includes("NOUAGRUPACION")) {
		campoObjetivo = "Agrupación";
		reglaTexto+=campoObjetivo;
	} else if(regla.operacion == "en" || regla.operacion == "no") {
		var campoObjetivo;
		if(regla.campoObjetivo.split("=").length > 1)
			campoObjetivo = getCampo(regla.campoObjetivo.split("=")[1]);
		else
			campoObjetivo = regla.campoObjetivo;
		var valor;
		if(regla.valor.split("=").length > 1)
			valor = regla.valor.split("=")[1];
		else
			valor = regla.valor;
		/*if(regla.operacion)
			valor = getCampo(regla.valor.split("=")[1]);
		else
			valor = regla.valor;*/
		var operacion;
		if(regla.operacion == "no")
			operacion = "NO se encuentra en";
		else if(regla.operacion == "en")
			operacion = "se encuentra en";
		reglaTexto+="Si "+campoObjetivo +" "+ operacion +" "+ valor;
	}
	return reglaTexto;
}

function getCampo (campo) {
    if(campo.localeCompare("idCliente") == 0)
        return"ID del Cliente";
    else if(campo.localeCompare("nombreCliente") == 0)
        return"Nombre del Cliente";
    else if(campo.localeCompare("tipoPersona") == 0)
        return"Tipo de Persona";
    else if(campo.localeCompare("tipoSubPersona") == 0)
        return"Tipo de Sub-Persona";
    else if(campo.localeCompare("saldo") == 0)
        return"Saldo";
    else if(campo.localeCompare("valorFinanciacion") == 0)
        return"Valor de la Financiación";
    else if(campo.localeCompare("montoOtorgado") == 0)
        return"Monto Otorgado";
    else if(campo.localeCompare("tipoCredito") == 0)
        return"Tipo de Crédito";
    else if(campo.localeCompare("diasMora") == 0)
        return"Días de Mora";
    else if(campo.localeCompare("utilizable") == 0)
        return"Utilizable";
    else if(campo.localeCompare("vencimiento") == 0)
        return"Fecha de Vencimiento";
    else if(campo.localeCompare("clausulasRestrictivas") == 0)
        return"Clausulas Restrictivas";
    else if(campo.localeCompare("esFinanciacionGarantizada") == 0)
        return"Financiación Garantizada";
    else if(campo.localeCompare("alac") == 0)
        return"ALAC";
}


function renderRules () {
	$("#listRules").empty();
	var listContent = '';
	for (var i = 0; i < arregloReglas.length; i++) {
		var regla = getTextRule(arregloReglas[i]);
		listContent = '';
		//listContent+='<li><p><input type="radio" name="rules" class="flat" value="'+arregloReglas[i].ID+'"> '+ regla +' </p><button style="position: absolute; right: 10px; margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" onclick="deleteRule('+i+')">Eliminar</button></li>';
        listContent+='<li><p><input type="radio" name="rules" class="flat" value="'+arregloReglas[i].ID+'"> '+ regla +' </p></li>';
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

/*function deleteRule (index) {
	$("body").overhang({
	  	type: "confirm",
	  	primary: "#f5a433",
	  	accent: "#dc9430",
	  	yesColor: "#3498DB",
	  	message: 'Esta seguro que desea eliminar la variable?',
	  	overlay: true,
	  	yesMessage: "Eliminar",
	  	noMessage: "Cancelar",
	  	callback: function (value) {
	    	if(value) {
	    		var idVar = arregloReglas[index].ID;
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
								            duration: 2
								        });
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
						            duration: 2
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
}*/


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

function getElementsListsValueAgrupacion (listaTipo) {
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
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed MainDB Variables");
                    console.log(result);
                    if(result.recordset.length > 0){
                    	var listaID = -1;
                    	for (var i = result.recordset.length - 1; i >= 0; i--) {
                    		if(result.recordset[i].tipo == listaTipo) {
                    			listaID = result.recordset[i].ID;
                    			break;
                    		}
                    	};
                    	if(listaID != -1) {
                    		const transaction1 = new sql.Transaction( pool1 );
						    transaction1.begin(err => {
						        var rolledBack = false
						 
						        transaction1.on('rollback', aborted => {
						            // emited with aborted === true
						     
						            rolledBack = true
						        })
						        const request1 = new sql.Request(transaction1);
						        request1.query("select * from ListasVariables where idLista = "+listaID, (err, result) => {
						            if (err) {
						                if (!rolledBack) {
						                    console.log('error en rolledBack MainDB Variables');
						                    transaction1.rollback(err => {
						                        console.log('error en rolledBack');
						                        console.log(err);
						                    });
						                }
						            }  else {
						                transaction1.commit(err => {
						                    // ... error checks
						                    console.log("Transaction committed MainDB Variables");
						                    console.log(result);
						                    if(result.recordset.length > 0){
						                    	arregloElementosDeListasValorAgrupacion = result.recordset;
						                    } else {
						                    	arregloElementosDeListasValorAgrupacion = [];
						                    }
						                    renderElementsListsValueSelectAgrupacion();
						                });
						            }
						        });
						    }); // fin transaction1
                    	}
                    }
                });
            }
        });
    }); // fin transaction
}

function renderElementsListsValueSelectAgrupacion () {
	var selectHTML = '';
	for (var i = 0; i < arregloElementosDeListasValorAgrupacion.length; i++) {
		selectHTML+='<option value='+arregloElementosDeListasValorAgrupacion[i].valor+'>'+arregloElementosDeListasValorAgrupacion[i].nombre+'</option>';
	};
	$("#agrupacionValorOptionSelect").empty();
	$("#agrupacionValorOptionSelect").append(selectHTML);
}

function loadAgrupacionSelect () {
	if($("#agrupacionCampoInput").val().localeCompare("idCliente") == 0) {
		getElementsListsValueAgrupacion(3);
		$( "#listaCampoField" ).fadeIn( "slow", function() {
		});
		$('#booleanCampoField').hide();
		$('#manualCampoField').hide();
	} else if($("#agrupacionCampoInput").val().localeCompare("tipoPersona") == 0) {
		getElementsListsValueAgrupacion(4);
		$( "#listaCampoField" ).fadeIn( "slow", function() {
		});
		$('#booleanCampoField').hide();
		$('#manualCampoField').hide();
	} else if($("#agrupacionCampoInput").val().localeCompare("tipoSubPersona") == 0) {
		getElementsListsValueAgrupacion(5);
		$( "#listaCampoField" ).fadeIn( "slow", function() {
		});
		$('#booleanCampoField').hide();
		$('#manualCampoField').hide();
	} else if($("#agrupacionCampoInput").val().localeCompare("tipoCredito") == 0) {
		getElementsListsValueAgrupacion(8);
		$( "#listaCampoField" ).fadeIn( "slow", function() {
		});
		$('#booleanCampoField').hide();
		$('#manualCampoField').hide();
	} else if($("#agrupacionCampoInput").val().localeCompare("diasMora") == 0 || $("#agrupacionCampoInput").val().localeCompare("utilizable") == 0) {
		$('#listaCampoField').hide();
		$('#booleanCampoField').hide();
		$( "#manualCampoField" ).fadeIn( "slow", function() {
		});
	} else if($("#agrupacionCampoInput").val().localeCompare("clausulasRestrictivas") == 0 || $("#agrupacionCampoInput").val().localeCompare("esFinanciacionGarantizada") == 0) {
		$('#listaCampoField').hide();
		$( "#booleanCampoField" ).fadeIn( "slow", function() {
		});
		$('#manualCampoField').hide();
	}
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
		$( "#cuentasOperativasField" ).hide();
		$( "#multField" ).hide();
		$( "#porcentajeField" ).hide();
		$('#listaCampoField').hide();
		$( "#booleanCampoField" ).hide();
		$('#manualCampoField').hide();
		$( "#agrupacionField" ).hide();
		mostrarFieldsCampoSelect();
	} else if(event.currentTarget.id == "agruparCampoRadio"){
		$('#campoField').hide();
		$('#fosedeField').hide();
		$( "#multField" ).hide();
		$( "#porcentajeField" ).fadeIn( "slow", function() {
		});
		$( "#agrupacionField" ).fadeIn( "slow", function() {
		});
		$('#relacionalesField').hide();
		$('#algebraicosField').hide();
		$('#sumarSiField').hide();
		$('#igualBoolField').hide();
		$('#multField').hide();
		$( "#relacionalesField" ).hide();
		$( "#algebraicosField" ).hide();
		$( "#ln_solidOPERACION" ).hide();
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).fadeIn( "slow", function() {
		});
		$( "#factorManualValorRadioLabel" ).fadeIn( "slow", function() {
		});
		$("#factorValorRadioLabel").iCheck('check');
		$( "#factorField" ).fadeIn( "slow", function() {
		});
		$( "#sumarSiField" ).hide();
		$( "#moraField" ).hide();
		$( "#diasField" ).hide();
		$("#fechaValorRadioLabel").hide();
		$( "#igualBoolField" ).hide();
		$( "#booleansField" ).hide();
		$( "#factorValorFinanciacionField" ).hide();
		loadAgrupacionSelect();
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
		$( "#factorManualValorRadioLabel" ).show();
		$( "#factorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#meOperadorRadio").iCheck('check');
		$( "#moraField" ).hide();
		$( "#diasField" ).hide();
		$("#fechaValorRadioLabel").hide();
		$( "#igualBoolField" ).hide();
		$( "#booleansField" ).hide();
		$("#manualValorInput").val("");
		$( "#existeBoolField" ).hide();
		$( "#factorValorFinanciacionField" ).hide();
		$( "#booleanValorRadioLabel" ).hide();
	} else if(campo == 'diasMora' || campo == 'fechaFinal') {
		$( "#relacionalesField" ).fadeIn( "slow", function() {
		});
		$( "#algebraicosField" ).hide();
		$( "#ln_solidOPERACION" ).hide();
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorManualValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#meOperadorRadio").iCheck('check');
		$( "#moraField" ).fadeIn( "slow", function() {
		});
		$( "#diasField" ).hide();
		$("#fechaValorRadioLabel").show();
		$("#fechaValorRadio").iCheck('check');
		$( "#igualBoolField" ).hide();
		$( "#booleansField" ).hide();
		$("#diaValorInput").val("");
		$( "#existeBoolField" ).hide();
		$( "#factorValorFinanciacionField" ).hide();
		$( "#booleanValorRadioLabel" ).hide();
	} else if(campo == 'utilizable' || campo == 'vencimiento') {
		$( "#relacionalesField" ).fadeIn( "slow", function() {
		});
		$( "#algebraicosField" ).hide();
		$( "#ln_solidOPERACION" ).hide();
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorManualValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#meOperadorRadio").iCheck('check');
		$( "#moraField" ).hide();
		$( "#diasField" ).fadeIn( "slow", function() {
		});
		$("#fechaValorRadioLabel").show();
		$("#fechaValorRadio").iCheck('check');
		$( "#igualBoolField" ).hide();
		$( "#booleansField" ).hide();
		$( "#existeBoolField" ).hide();
		$( "#factorValorFinanciacionField" ).hide();
		$( "#booleanValorRadioLabel" ).hide();
	} else if(campo == 'esFinanciacionGarantizada' || campo == 'clausulasRestrictivas') {
		$( "#relacionalesField" ).hide();
		$( "#algebraicosField" ).hide();
		$( "#ln_solidOPERACION" ).hide();
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorManualValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#IgBoolOperadorRadio").iCheck('check');
		$( "#moraField" ).hide();
		$( "#diasField" ).hide();
		$("#fechaValorRadioLabel").hide();
		$( "#igualBoolField" ).fadeIn( "slow", function() {
		});
		$( "#booleansField" ).fadeIn( "slow", function() {
		});
		$("#trueOperadorRadio").iCheck('check');
		$("#manualValorInput").val("");
		$( "#existeBoolField" ).hide();
		$( "#factorValorFinanciacionField" ).hide();
		$( "#booleanValorRadioLabel" ).fadeIn( "slow", function() {
		});
		$("#booleanValorRadio").iCheck('check');
	} else if(campo == 'montoOtorgado') {
		$( "#relacionalesField" ).fadeIn( "slow", function() {
		});
		$( "#algebraicosField" ).hide();
		$( "#ln_solidOPERACION" ).hide();
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#manualValorRadioLabel" ).show();
		$( "#manualField" ).fadeIn( "slow", function() {
		});
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorManualValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#meOperadorRadio").iCheck('check');
		$("#manualValorRadioLabel").iCheck('check');
		$( "#moraField" ).hide();
		$( "#diasField" ).hide();
		$("#fechaValorRadioLabel").hide();
		$( "#booleansField" ).hide();
		$( "#igualBoolField" ).hide();
		$("#manualValorInput").val("");
		$( "#existeBoolField" ).hide();
		$( "#factorValorFinanciacionField" ).hide();
		$( "#booleanValorRadioLabel" ).hide();
	} else if(campo == 'alac') {
		$( "#relacionalesField" ).hide();
		$( "#algebraicosField" ).hide();
		$( "#ln_solidOPERACION" ).hide();
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorManualValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#ExBoolOperadorRadio").iCheck('check');
		$( "#moraField" ).hide();
		$( "#diasField" ).hide();
		$("#fechaValorRadioLabel").hide();
		$( "#igualBoolField" ).hide();
		$( "#booleansField" ).fadeIn( "slow", function() {
		});
		$("#trueOperadorRadio").iCheck('check');
		$("#manualValorInput").val("");
		$( "#existeBoolField" ).fadeIn( "slow", function() {
		});
		$( "#factorValorFinanciacionField" ).hide();
		$( "#booleanValorRadioLabel" ).hide();
	} else if(campo == 'valorFinanciacion') {
		$( "#relacionalesField" ).hide();
		$( "#algebraicosField" ).fadeIn( "slow", function() {
		});
		$( "#ln_solidOPERACION" ).hide();
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).show();
		$( "#factorManualValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#factorValorRadio").iCheck('check');
		$( "#moraField" ).hide();
		$( "#diasField" ).hide();
		$("#fechaValorRadioLabel").hide();
		$( "#igualBoolField" ).hide();
		$( "#booleansField" ).hide();
		$("#manualValorInput").val("");
		$( "#existeBoolField" ).hide();
		$("#masOperadorRadio").iCheck('check');
		$( "#factorValorFinanciacionField" ).fadeIn( "slow", function() {
		});
		$( "#booleanValorRadioLabel" ).hide();
		mostrarSigno();
	} else {
		$( "#sumarSiField" ).fadeIn( "slow", function() {
		});
		$( "#relacionalesField" ).hide();
		$( "#algebraicosField" ).hide();
		$( "#ln_solidOPERACION" ).hide();
		$("#sumarSiOperadorRadio").iCheck('check');
		$( "#moraField" ).hide();
		$( "#diasField" ).hide();
		$("#fechaValorRadioLabel").hide();
		$( "#igualBoolField" ).hide();
		$( "#booleansField" ).hide();
		$("#manualValorInput").val("");
		$( "#existeBoolField" ).hide();
		$( "#factorValorFinanciacionField" ).hide();
		$( "#booleanValorRadioLabel" ).hide();
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
		$( "#factorManualValorRadioLabel" ).hide();
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
		$( "#factorManualValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
	} else if(campo == 'idCliente' || campo == 'nombreCliente') {
		renderListsSelect(3);
		$( "#elementoValorRadioLabel" ).show();
		$("#elementoValorRadioLabel").iCheck('check');
		$( "#listaValorField" ).fadeIn( "slow", function() {
		});
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorManualValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
	} else if(campo == 'tipoCredito') {
		renderListsSelect(8);
		$( "#elementoValorRadioLabel" ).show();
		$("#elementoValorRadioLabel").iCheck('check');
		$( "#listaValorField" ).fadeIn( "slow", function() {
		});
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorManualValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
	}
}

function mostrarSigno () {
	var operacion  = '';
	if( $('#masOperadorRadio').is(':checked') )
		operacion = '+';
	else if( $('#porOperadorRadio').is(':checked') )
		operacion = '*';
	else if( $('#menOperadorRadio').is(':checked') )
		operacion = '-';
	else if( $('#entOperadorRadio').is(':checked') )
		operacion = '/';
	$("#signo").text(operacion);
}

$("input[name='operadorRadio']").on('ifChanged', function(event){
	if( $('#masOperadorRadio').is(':checked') || $('#porOperadorRadio').is(':checked') || $('#menOperadorRadio').is(':checked') || $('#entOperadorRadio').is(':checked') ) {
    	mostrarSigno();
    }
});


$("#date_inline").css('pointer-events', 'none');
//$("#diaValorInput").prop('disabled', true);
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
	if( $('#campoCampoRadio').is(':checked') ) {
		//if($("#campoCampoInput").val().localeCompare("valorFinanciacion") == 0)
		campoObjetivo = 'COLUMNA='+$("#campoCampoInput").val();
	}  else {
		campoObjetivo = 'NOUAGRUPACION='+$("#agrupacionValorOptionSelect").val();
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
	else if( $('#IgBoolOperadorRadio').is(':checked') )
		operacion = '==';
	else if( $('#ExBoolOperadorRadio').is(':checked') )
		operacion = '==';

	if( $('#agruparCampoRadio').is(':checked') )
		variables = $("#porcentajeCampo").val().split(/[_|%]/)[0];
	
	if( $('#manualValorRadio').is(':checked') )
		valor = "MANUAL="+parseInt($("#manualValorInput").val().split(" ")[1]);
	else if( $('#fechaValorRadio').is(':checked') ) {
		if($('#moraField').is(":visible"))
			valor = 'MORA='+$("#moraValorInput").val();
		else
			valor = 'FECHA';
	} else if( $('#elementoValorRadio').is(':checked') ) {
		var elementosSelect = $("#elementoValorOptionSelect").val();
		var elementos = '';
		var aplicarNombre = "0";
		/*var aplicarNombre = "1";
		if($('#valorElementoListaValorRadio').is(':checked'))
			aplicarNombre = "0";*/
		if(elementosSelect != null) {
			for (var i = 0; i < elementosSelect.length; i++) {
				elementos+=arregloElementosDeListasValor[parseInt(elementosSelect[i])].valor;
				if( (i+1) < elementosSelect.length )
					elementos+=',';
			};
			valor = 'LISTA=' + elementos;
		} else 
			valor = 'LISTA=' + getSelectOptions(arregloElementosDeListasValor, aplicarNombre);
	} else if( $('#booleanValorRadio').is(':checked') ) {
		if( $('#trueOperadorRadio').is(':checked') )
			valor = 'BOOLEAN=true';
		else
			valor = 'BOOLEAN=false';
	} else
		valor = "FACTOR="+variableDeVariableObject.factor;
	/*console.log("-_------___----");
	console.log('reglaPadre = '+reglaPadre);
	console.log('campoObjetivo = '+campoObjetivo);
	console.log('operacion = '+operacion);
	console.log('valor = '+valor);
	console.log('variables = '+variables);
	console.log('variableDeVariableReglaID = '+variableDeVariableReglaID);
	console.log("-_------___----");*/
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
								  	message: "Regla creada con éxito.",
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

function goConnections () {
    $("#app_root").empty();
    $("#app_root").load("src/importaciones.html");
}

function goConfig () {
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/config.html");
}

function logout () {
	$("#app_root").empty();
    session.defaultSession.clearStorageData([], (data) => {});
    $("#app_root").load("src/login.html");
}

function goRCL () {
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
}

function goReports () {
	$("#app_root").empty();
    $("#app_root").load("src/reportes.html");
}

function goGraphics () {
    $("#app_root").empty();
    $("#app_root").load("src/graficos.html");
}

function goLists () {
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/variablesLists.html");
}

var aplicarFactores = [];

function showRules () {
	var rulesArray = [];
	for (var i = 0; i < arregloReglas.length; i++) {
		if(arregloReglas[i].reglaPadre == 0) {
			var arreglo = [];
			//arreglo.push(arregloReglas[i]);
			/*console.log('---------------');
			console.log( campoObjetivo(arregloReglas[i], arreglo) );
			console.log('---------------');*/
			aplicarFactores = [];
			var resultado = campoObjetivo(arregloReglas[i], arreglo, 0);
			for (var j = 0; j < aplicarFactores.length; j++) {
				if(j == 0) {
					resultado.push("\nif( i == arregloPrestamos[i].length-1) {\n");
				}
				resultado.push("\t"+aplicarFactores[j]);
				if(j == 0) {
					resultado.push("\n}");
				}
			};
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
	/*var output = '';
	for (var i = 0; i < arregloReglas.length; i++) {
		var objetivo = '';
		if(arregloReglas[i].campoObjetivo.indexOf('COLUMNA') == 0)
			objetivo = 'arreglo[i].'+arregloReglas[i].campoObjetivo;
		else if(arregloReglas[i].campoObjetivo.indexOf('LISTA') == 0) {
			objetivo = 'arreglo[i].'+arregloReglas[i].campoObjetivo;
		}
		if(arregloReglas[i].operacion=="-" || arregloReglas[i].operacion=="+" || arregloReglas[i].operacion=="*" || arregloReglas[i].operacion=="/")
			output+=arregloReglas[i].campoObjetivo +" "+ arregloReglas[i].operacion +" "+ arregloReglas[i].valor+"\n";
		else
			output+="if ( "+arregloReglas[i].campoObjetivo +" "+ arregloReglas[i].operacion +" "+ arregloReglas[i].valor +" )";
		arregloReglas[i]
	};
	$("#descr1").val(output);*/
}

function campoObjetivo (regla, arreglo, tabs) {
	var esCondicion = false, noAgregarFactor = false, noAgregarFecha = false, noAgregarBoolean = false;
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
		if(regla.campoObjetivo.split("=")[1].indexOf("valorFinanciacion") != 0 && regla.campoObjetivo.split("=")[1].indexOf("utilizable") != 0 && regla.campoObjetivo.split("=")[1].indexOf("vencimiento") != 0 && regla.campoObjetivo.split("=")[1].indexOf("alac") != 0) {
			if(esCondicion) {
				var campo = regla.campoObjetivo.split("=")[1];

				// Agregando campo Operacion
				if(regla.operacion=="en" || regla.operacion=="no")
					arreglo.push(tabsText+"if ( arregloPrestamos[i]."+campo+".localeCompare('");
				else
					arreglo.push(tabsText+"if ( arregloPrestamos[i]."+campo+" "+regla.operacion);
				//posicionesIF.push(arreglo.length-1);
				posicionesIF.push(arreglo.length);
			} else {
				var campo = regla.campoObjetivo.split("=")[1];

				// Agregando campo Operacion
				arreglo.push(tabsText+"var totalPrestamo = arregloPrestamos[i].saldo;");
				arreglo.push("\n"+tabsText+variableDeVariableObject.nombre+" += totalPrestamo "+regla.operacion);
			}
		} else if(regla.campoObjetivo.split("=")[1].indexOf("utilizable") == 0) {
			noAgregarFecha = true;
			var campo = regla.campoObjetivo.split("=")[1];

			arreglo.push(tabsText+"var nuevaFecha"+regla.ID+" = new Date();\n");
			arreglo.push(tabsText+"nuevaFecha"+regla.ID+".addDays(proyecciones[i]);\n");
			var query, agregarComparator, agregarIsSame;
			if(regla.operacion.includes("<")) {
				query = 'isBefore';
			} else {
				query = 'isAfter';
			}
			if(!regla.operacion.includes("!") && !regla.operacion.includes("==")) {
				agregarComparator = "moment(nuevaFecha"+regla.ID+")."+query+"(moment(arregloPrestamos[i].fechaFinal), 'day')";
			} else if(regla.operacion.includes("==")) {
				agregarComparator = "moment(nuevaFecha"+regla.ID+").isSame(moment(arregloPrestamos[i].fechaFinal), 'day')";
			} else {
				agregarComparator = "!moment(nuevaFecha"+regla.ID+").isSame(moment(arregloPrestamos[i].fechaFinal), 'day')";
			}
			if(regla.operacion.includes("=") && (regla.operacion.includes("<") || regla.operacion.includes(">")) ) {
				agregarIsSame = " || moment(nuevaFecha"+regla.ID+").isSame(moment(arregloPrestamos[i].fechaFinal), 'day')";
			} else {
				agregarIsSame = "";
			}
			// Agregando campo Operacion
			arreglo.push(tabsText+"if ( "+agregarComparator+" "+agregarIsSame+" ) {");
			//posicionesIF.push(arreglo.length-1);
			posicionesIF.push(arreglo.length);
		} else if(regla.campoObjetivo.split("=")[1].indexOf("vencimiento") == 0) {
			noAgregarFecha = true;
			var campo = regla.campoObjetivo.split("=")[1];

			arreglo.push(tabsText+"var nuevaFecha"+regla.ID+" = new Date();\n");
			arreglo.push(tabsText+"nuevaFecha"+regla.ID+".addDays(proyecciones[i]);\n");
			var query, agregarComparator, agregarIsSame;
			if(regla.operacion.includes("<")) {
				query = 'isBefore';
			} else {
				query = 'isAfter';
			}
			if(!regla.operacion.includes("!") && !regla.operacion.includes("==")) {
				agregarComparator = "moment(arregloPrestamos[i].fechaFinal)."+query+"(moment(nuevaFecha"+regla.ID+"), 'day')";
			} else if(regla.operacion.includes("==")) {
				agregarComparator = "moment(arregloPrestamos[i].fechaFinal).isSame(moment(nuevaFecha"+regla.ID+"), 'day')";
			} else {
				agregarComparator = "!moment(arregloPrestamos[i].fechaFinal).isSame(moment(nuevaFecha"+regla.ID+"), 'day')";
			}
			if(regla.operacion.includes("=") && (regla.operacion.includes("<") || regla.operacion.includes(">")) ) {
				agregarIsSame = " || moment(arregloPrestamos[i].fechaFinal).isSame(moment(nuevaFecha"+regla.ID+"), 'day')";
			} else {
				agregarIsSame = "";
			}
			// Agregando campo Operacion
			arreglo.push(tabsText+"if ( "+agregarComparator+" "+agregarIsSame+" ) {");
			//posicionesIF.push(arreglo.length-1);
			posicionesIF.push(arreglo.length);
		} else if(regla.campoObjetivo.split("=")[1].indexOf("alac") == 0) {
			noAgregarBoolean = true;
			var campo = regla.campoObjetivo.split("=")[1];
			// Agregando campo Operacion
			arreglo.push(tabsText+"if ( arregloPrestamos[i].alac.length > 0 ) {");
			//posicionesIF.push(arreglo.length-1);
			posicionesIF.push(arreglo.length);
		} else {
			noAgregarFactor = true;
			arreglo.push(tabsText+"if (arregloPrestamos[i].alac.length > 0) {\n");
			arreglo.push(tabsText+"\tvar totalFactor = arregloPrestamos[i].valorFinanciacion - getPriceALAC(arregloPrestamos[i].alac);\n");
			arreglo.push(tabsText+"\tvar totalPrestamo = arregloPrestamos[i].saldo "+regla.operacion+" totalFactor;\n");
			arreglo.push(tabsText+"\t"+variableDeVariableObject.nombre+" += totalPrestamo;\n");
			arreglo.push(tabsText+"}");
		}
	} else if(regla.campoObjetivo.indexOf('NOUAGRUPACION') == 0) {
		noAgregarFactor = true;
		arreglo.push(tabsText+"if ( arregloPrestamos[i].tipoCredito.localeCompare('"+regla.campoObjetivo.split("=")[1]+"') == 0 ) {\n");
		arreglo.push(tabsText+"\tvar totalPrestamo = "+(regla.variables/100)+" * arregloPrestamos[i].saldo;");
		arreglo.push("\n\t"+tabsText+variableDeVariableObject.nombre+" += totalPrestamo;\n");
		arreglo.push(tabsText+"}");
		aplicarFactores.push(variableDeVariableObject.nombre+" = "+variableDeVariableObject.nombre+" * "+(parseInt(regla.valor.split("=")[1])/100)+";");
	}

	if(regla.valor.indexOf('LISTA') == 0 && !noAgregarBoolean) {
		if(esCondicion) {
			var arregloLista = regla.valor.split("=")[1].split(",");
			var copiaRegla = arreglo.slice();
			var tamArreglo = arreglo.length;
			if(regla.operacion == "no") {
				for (var j = 0; j < tamArreglo; j++) {
					for (var i = 0; i < arregloLista.length; i++) {
						if(i==0) {
							var textoFinal = ' != 0 ';
							if(i+1 == arregloLista.length)
								textoFinal += " ) {";
							arreglo[j] +=arregloLista[i] + "')" + textoFinal;
						} else {
							var textoFinal = ' != 0 ';
							if(i+1 == arregloLista.length)
								textoFinal += " ) {";
							arreglo[j] += " && "+copiaRegla[j].split(" ( ")[1]+arregloLista[i]+"')"+textoFinal;
						}
					}
				};
			} else {
				for (var j = 0; j < tamArreglo; j++) {
					for (var i = 0; i < arregloLista.length; i++) {
						if(i==0) {
							var textoFinal = ' == 0 ';
							if(i+1 == arregloLista.length)
								textoFinal += " ) {";
							arreglo[j] +=arregloLista[i] + "')" + textoFinal;
						} else {
							var textoFinal = ' == 0 ';
							if(i+1 == arregloLista.length)
								textoFinal += " ) {";
							arreglo[j] += " || "+copiaRegla[j].split(" ( ")[1]+arregloLista[i]+"')"+textoFinal;
						}
					}
				};
			}
		}
	} else if(regla.valor.indexOf('FACTOR') == 0 && !noAgregarFactor) {
		if(esCondicion) {
			var factorValor = parseInt(regla.valor.split("=")[1]);
			for (var i = 1; i < arreglo.length; i++) {
				arreglo[i] += " "+factorValor/100 + " ) {";
			};
		} else {
			var factorValor = regla.valor.split("=")[1];
			for (var i = 1; i < arreglo.length; i++) {
				arreglo[i] += " "+factorValor/100 + ";";
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
	} else if(regla.valor.indexOf('FECHA') == 0 && !noAgregarFecha) {
		if(esCondicion) {
			for (var i = 0; i < arreglo.length; i++) {
				arreglo[i] += " proyecciones[i] ) {";
			};
		} else {
			var columnaValor = regla.valor.split("=")[1];
			for (var i = 0; i < arreglo.length; i++) {
				arreglo[i] += " proyecciones[i];";
			};
		}
	} else if(regla.valor.indexOf('MANUAL') == 0 || regla.valor.indexOf('MORA') == 0 || (regla.valor.indexOf('BOOLEAN') == 0 && !noAgregarBoolean)) {
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