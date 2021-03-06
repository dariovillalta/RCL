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
		loadLists();
		loadText();
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
	loadSelectCampoObjetivo(tabla);
	$("#variableOfVariableName").text(nombreHijo);
	$("#variableOfVariableName").css("white-space", "initial");
	$("#variableOfVariableName").css("text-align", "justify");
	$("#variableOfVariableDescription").text(descripcionHijo);
	$("#variableOfVariableDescription").css("white-space", "initial");
	$("#variableOfVariableDescription").css("text-align", "justify");
	$("#variableOfVariableFactor").text(factorHijo);
	$("#factorText").text(factorHijo).append('<span style="height: 3vh;">%</span>');
    $("#factorTextEdit").text(factorHijo).append('<span style="height: 3vh;">%</span>');
	$("#variableOfVariableFactor").css("white-space", "initial");
	$("#variableOfVariableFactor").css("text-align", "justify");
	variableDeVariableReglaID = variable;
	loadRules();
	loadVariableObject();
    loadFilters();
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
	{valor: "idCliente",nombre: "ID del Cliente"},
	{valor: "nombreCliente",nombre: "Nombre del Cliente"},
	{valor: "tipoPersona",nombre: "Tipo de Persona"},
	{valor: "tipoSubPersona",nombre: "Tipo de Sub-Persona"},
	{valor: "saldo",nombre: "Saldo"},
	{valor: "plazoResidual",nombre: "Plazo Residual"},
	/*{valor: "moneda",nombre: "Moneda"},*/
	{valor: "tipoCuenta",nombre: "Tipo de Cuenta"}
	/*{valor: "sucursal",nombre: "Sucursal"},
	{valor: "columnaExtra1",nombre: "Columna Extra 1"},
	{valor: "columnaExtra2",nombre: "Columna Extra 2"}*/
];

var tablaDepositosFiltros = [
    {valor: "idCliente",nombre: "ID del Cliente"},
    {valor: "nombreCliente",nombre: "Nombre del Cliente"},
    {valor: "tipoPersona",nombre: "Tipo de Persona"},
    {valor: "tipoSubPersona",nombre: "Tipo de Sub-Persona"},
    {valor: "plazoResidual",nombre: "Plazo Residual"},
    {valor: "tipoCuenta",nombre: "Tipo de Cuenta"}
];

function loadSelectCampoObjetivo (tabla) {
	$("#campoCampoInput").empty();
    $("#campoCampoInputEdit").empty();
    $("#agrupacionFiltro").empty();
    $("#agrupacionFiltroEdit").empty();
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
    var content2 = '';
    for (var i = 0; i < tablaDepositosFiltros.length; i++) {
        content2+='<option value="'+tablaDepositosFiltros[i].valor+'">'+tablaDepositosFiltros[i].nombre+'</option>';
    };
	$("#campoCampoInput").append(content);
    $("#campoCampoInputEdit").append(content);
    $("#agrupacionFiltro").append(content2);
    $("#agrupacionFiltroEdit").append(content2);
}

var colores = [
    {color1: "#ffe0b2"},
	{color1: "#d50000"},
    {color1: "#ffccbc"},
    {color1: "#fffde7"},
	{color1: "#fce4ec"},
	{color1: "#ede7f6"},
	{color1: "#e1f5fe"},
	{color1: "#e8eaf6"},
	{color1: "#e0f7fa"},
    {color1: "#ffecb3"},
    {color1: "#ffa726"},
	{color1: "#2962ff"},
	{color1: "#64dd17"},
	{color1: "#00c853"},
	{color1: "#ff1744"},
	{color1: "#00bfa5"},
	{color1: "#880e4f"},
    {color1: "#ffc400"},
	{color1: "#4a148c"},
	{color1: "#0d47a1"},
	{color1: "#7986cb"},
    {color1: "#ff6e40"},
	{color1: "#9575cd"},
	{color1: "#4fc3f7"},
    {color1: "#ffc107"},
	{color1: "#4dd0e1"},
    {color1: "#6d4c41"},
    {color1: "#fff176"},
	{color1: "#b9f6ca"},
    {color1: "#424242"},
	{color1: "#33691e"},
    {color1: "#37474f"}
];

var arregloListas = [];
var arregloElementosDeListasValor = [];
var arregloReglas = [];
var ordenGlobal = 0;
var arregloElementosDeListasValorEdit = [];
var reglaSeleccionada;
var arregloFiltros = [];
var filtroSeleccionado;
var arreglodeListas = [];
var entradasLlamadasListas = 0;
var banderaLlamadasListas = 0;

function loadRules () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Reglas where variablePadre = "+variableDeVariableReglaID+" and esFiltro = 'false'", (err, result) => {
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
                    entradasLlamadasListas = 0;
                    loadListsText();
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
                    loadFilters();
                });
            }
        });
    }); // fin transaction
}

function loadListsText () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Listas where tipo != 1 and tipo != 2 and tipo != 7 and tipo != 6", (err, result) => {
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
                        banderaLlamadasListas = result.recordset.length;
                        arreglodeListas = [];
                        for (var i = 0; i < result.recordset.length; i++) {
                            loadListsVariables(result.recordset[i].ID);
                        };
                    }
                });
            }
        });
    }); // fin transaction
}

function loadListsVariables (id) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables where idLista = "+id, (err, result) => {
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
                        $.merge( arreglodeListas, result.recordset );
                    }
                    entradasLlamadasListas++;
                    verificarBanderaListas();
                });
            }
        });
    }); // fin transaction
}

function verificarBanderaListas () {
    if(entradasLlamadasListas == banderaLlamadasListas){
        renderRules();
        renderTable();
    }
}

var montoFosedeGlobal = null;

/*function loadVariablesMainDB () {
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
                    	if(result.recordset[0].montoFosede > 1)
                    		montoFosedeGlobal = result.recordset[0].montoFosede;
                    	else
                    		montoFosedeGlobal = 0.00;

                        if(result.recordset[0].fullLogo.length > 0) {
                            $("#fullLogo").attr("src",result.recordset[0].fullLogo);
                        }
                        if(result.recordset[0].smallLogo.length > 0) {
                            $("#smallLogo").attr("src",result.recordset[0].smallLogo);
                        }
                    } else {
                    	montoFosedeGlobal = null;
                    }
                });
            }
        });
    }); // fin transaction
}*/

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
            { "data": "Modificar" }
        ],
        rowCallback: function(row, data, index){
            $(row).find('td:eq(2)').html(getTextRule(data));
        },
        "columnDefs": [ {
            "targets": -1,
            "defaultContent": '<a class="btn btn-app deleteRule"> <i class="fa fa-eraser"></i> Modificar </a>',
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
	                        modifyRuleParent(data.ID, data.reglaPadre);
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
        reglaSeleccionada = data;
        $('#modalEdit').modal('toggle');
    } );
}

function modifyRuleParent (id, variablePadre) {
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
                console.log(err);
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
					  	duration: 1,
					  	overlay: true
					});
                    loadRules();
                });
            }
        });
    }); // fin transaction
}

function deleteRule () {
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
                const transaction = new sql.Transaction( pool1 );
                transaction.begin(err => {
                    var rolledBack = false;
                    transaction.on('rollback', aborted => {
                        // emited with aborted === true
                        rolledBack = true;
                    });
                    const request = new sql.Request(transaction);
                    request.query("delete from Reglas where ID = "+reglaSeleccionada.ID, (err, result) => {
                        if (err) {
                            console.log(err);
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
                                    duration: 1,
                                    overlay: true
                                });
                                $('#modalEdit').modal('toggle');
                                loadRules();
                            });
                        }
                    });
                }); // fin transaction
            }
        }
    });
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
		if(regla.valor.split("=").length > 1 && regla.valor.split("=")[0].localeCompare("FACTOR") != 0)
			valor = getListValue(regla.valor.split("=")[1]);
        else if(regla.valor.split("=")[0].localeCompare("Factor") != 0)
            valor = "Factor";
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
		if(regla.valor.split("=").length > 1 && regla.valor.indexOf("COLUMNA") != 0)
			valor = getListValue(regla.valor.split("=")[1]);
        else if(regla.valor.split("=").length > 1 && regla.valor.indexOf("COLUMNA") == 0)
            valor = regla.valor.split("=")[1];
		else
			valor = regla.valor;
		reglaTexto+="Si "+campoObjetivo +" "+ regla.operacion +" "+ valor;
	} else if(regla.campoObjetivo.includes("FOSEDE")) {
		var campoObjetivo;
		if(regla.campoObjetivo.includes("hastaFOSEDE"))
			campoObjetivo = "Factor * Saldo menor a FOSEDE";
		else
			campoObjetivo = "Factor * Saldo mayor a FOSEDE";
		reglaTexto+=campoObjetivo;
	} else if(regla.operacion == "en" || regla.operacion == "no") {
		var campoObjetivo;
		if(regla.campoObjetivo.split("=").length > 1)
			campoObjetivo = getCampo(regla.campoObjetivo.split("=")[1]);
		else
			campoObjetivo = regla.campoObjetivo;
		var valor;
		if(regla.valor.split("=").length > 1)
			valor = getListValue(regla.valor.split("=")[1]);
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


function renderRules () {
	$("#listRules").empty();
	var listContent = '';
	for (var i = 0; i < arregloReglas.length; i++) {
		var regla = getTextRule(arregloReglas[i]);
		listContent = '';
		var clase = '';
		/*if(arregloReglas[i].reglaPadre < colores.length)
			clase = 'style="background-color:'+colores[arregloReglas[i].reglaPadre].color1+';"';
		else
			clase = 'style="background-color:'+colores[arregloReglas[i].reglaPadre%colores.length].color1+';"';*/
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
        $("input[name='filters']").attr('disabled',false);
	    if(!borrar) {
		    var id = $(this).val();
		    var reglas = arregloReglas.filter(function( object ) {
						   		return object.ID == id;
							});
		    var variables = '';
		    if(reglas.length > 0)
		    	variables = reglas[0].variables;
            if(reglas[0].filtro != -1) {
                $("input[name='filters']").attr('disabled',true);
                $('#filtro'+reglas[0].filtro).iCheck('check');
            } else {
                $("input[name='filters']").attr('disabled',false);
                $("input[name='filters']").iCheck('uncheck');
            }
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
	else if(campo.localeCompare("plazoResidual") == 0)
		return"Plazo Residual";
	else if(campo.localeCompare("tipoCuenta") == 0)
		return"Tipo de Cuenta";
}

//funcion para retornar el valor correspondiente de una lista dependiendo del tipo de columna
function getListValue (id) {
    var valores = id.split(","), texto = '';
    for (var j = 0; j < valores.length; j++) {
        for (var i = 0; i < arreglodeListas.length; i++) {
            if(arreglodeListas[i].ID == valores[j]) {
                texto += arreglodeListas[i].valor;
                if(j != valores.length-1)
                    texto += ',';
            }
        };
    };
    return texto;
}


function loadLists () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Listas", (err, result) => {
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
                    if(result.recordset.length > 0){
                    	arregloListas = result.recordset;
                    } else {
                    	arregloListas = [];
                    }
                    renderListsSelect(3);
                    renderListsSelectEdit(3);
                });
            }
        });
    }); // fin transaction
}

function getElementsListsValue (listaID) {
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
						return object.tipo == tipo || object.tipo == 10;
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
		$("#factorValorRadio").iCheck('check');
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).show();
		$( "#factorField" ).fadeIn( "slow", function() {
        });
		$( "#sumarSiField" ).hide();
		$("#meOperadorRadio").iCheck('check');
		$( "#fechaValorRadioLabel" ).hide();
		$( "#diasField" ).hide();
	} else if(campo == 'plazoResidual') {
		$( "#relacionalesField" ).fadeIn( "slow", function() {
		});
		$( "#algebraicosField" ).hide();
		$( "#ln_solidOPERACION" ).hide();
		$( "#elementoValorRadioLabel" ).hide();
		$( "#listaValorField" ).hide();
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
		$( "#sumarSiField" ).hide();
		$("#meOperadorRadio").iCheck('check');
		$("#fechaValorRadioLabel").show();
		$("#fechaValorRadio").iCheck('check');
		$( "#diasField" ).fadeIn( "slow", function() {
		});
	} else {
		$( "#sumarSiField" ).fadeIn( "slow", function() {
		});
		$( "#relacionalesField" ).hide();
		$( "#algebraicosField" ).hide();
		$( "#ln_solidOPERACION" ).hide();
		$("#sumarSiOperadorRadio").iCheck('check');
		$( "#fechaValorRadioLabel" ).hide();
		$( "#diasField" ).hide();
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
	} else if(campo == 'idCliente' || campo == 'nombreCliente') {
		renderListsSelect(3);
		$( "#elementoValorRadioLabel" ).show();
		$("#elementoValorRadioLabel").iCheck('check');
		$( "#listaValorField" ).fadeIn( "slow", function() {
		});
		$( "#manualValorRadioLabel" ).hide();
		$( "#manualField" ).hide();
		$( "#factorValorRadioLabel" ).hide();
		$( "#factorField" ).hide();
	} else if(campo == 'tipoCuenta') {
		renderListsSelect(9);
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

//$("#date_inline").css('pointer-events', 'none');
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
	var esFiltro = false;
    var filtro = -1;
    if($('input[name=filters]:checked').length > 0)
        filtro = $('input[name=filters]:checked').val();
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
	if( $('#manualValorRadio').is(':checked') ) {
        if($("#manualValorInput").val().length > 0)
		  valor = "COLUMNA="+parseFloat($("#manualValorInput").val().split(" ")[1].replace(/,/g, ""));
        else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese un número.",
                closeConfirm: true,
                overlay: true,
                closeConfirm: true
            });
        }
	} else if( $('#elementoValorRadio').is(':checked') ) {
		var elementosSelect = $("#elementoValorOptionSelect").val();
		var elementos = '';
		var aplicarNombre = "0";
		/*var aplicarNombre = "1";
		if($('#valorElementoListaValorRadio').is(':checked'))
			aplicarNombre = "0";*/
		if(elementosSelect != null) {
			for (var i = 0; i < elementosSelect.length; i++) {
				elementos+=arregloElementosDeListasValor[parseInt(elementosSelect[i])].ID;
				if( (i+1) < elementosSelect.length )
					elementos+=',';
			};
			valor = 'LISTA=' + elementos;
		} else 
			valor = 'LISTA=' + getSelectOptions(arregloElementosDeListasValor);
	} else if( $('#factorValorRadio').is(':checked') ) {
		valor = "FACTOR="+variableDeVariableObject.factor;
	} else if( $('#fechaValorRadio').is(':checked') ) {
		valor = "FECHA";
	}
	console.log("-_------___----");
	console.log(reglaPadre);
	console.log(campoObjetivo);
	console.log(operacion);
	console.log(valor);
	console.log(variables);
	console.log(variableDeVariableReglaID);
	console.log(ordenGlobal);
	console.log(ordenGlobal+1);
    console.log("filtro = "+filtro);
	console.log("-_------___----");
	if(campoObjetivo.length > 0 && campoObjetivo.length < 1001) {
		if(operacion.length > 0 && operacion.length < 3) {
			if(valor.toString().length > 0 && valor.toString().length < 1001) {
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
							            message: "Error en inserción de nueva variable.",
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
				  	closeConfirm: true,
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
			  	closeConfirm: true,
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
		  	closeConfirm: true,
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
/*function getSelectOptions (array, aplicarNombre) {
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
}*/
function getSelectOptions (array) {
    var textoOption = '';
    for (var i = 0; i < array.length; i++) {
        textoOption+=array[i].ID;
        if( (i+1) < array.length )
            textoOption+=',';
    };
    return textoOption;
}
/* *************	Fin Rules	************* */





















/* *************    Modify   ************* */
function getElementsListsValueEdit (listaID) {
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
                        arregloElementosDeListasValorEdit = result.recordset;
                    } else {
                        arregloElementosDeListasValorEdit = [];
                    }
                    renderElementsListsValueSelectEdit();
                });
            }
        });
    }); // fin transaction
}

function renderListsSelectEdit (tipo) {
    var selectHTML = '';
    var listaTemp = arregloListas.filter(function( object ) {
                        return object.tipo == tipo || object.tipo == 10;
                    });
    for (var i = 0; i < listaTemp.length; i++) {
        selectHTML+='<option value='+listaTemp[i].ID+'>'+listaTemp[i].nombre+'</option>';
    };
    $("#elementoValorSelectEdit").empty();
    $("#elementoValorSelectEdit").append(selectHTML);
    if(listaTemp.length > 0) {
        getElementsListsValueEdit(listaTemp[0].ID);
    }
}

$('#nombreElementoListaValorRadioEdit').on('ifChecked', function () {
    renderElementsListsValueSelectEdit();
});
$('#valorElementoListaValorRadioEdit').on('ifChecked', function () {
    renderElementsListsValueSelectEdit();
});

function renderElementsListsValueSelectEdit () {
    var selectHTML = '';
    if($('#nombreElementoListaValorRadioEdit').iCheck('update')[0].checked){
        for (var i = 0; i < arregloElementosDeListasValorEdit.length; i++) {
            selectHTML+='<option value='+i+'>'+arregloElementosDeListasValorEdit[i].nombre+'</option>';
        };
    } else {
        for (var i = 0; i < arregloElementosDeListasValor.length; i++) {
            selectHTML+='<option value='+i+'>'+arregloElementosDeListasValorEdit[i].valor+'</option>';
        };
    }
    $("#elementoValorOptionSelectEdit").empty();
    $("#elementoValorOptionSelectEdit").append(selectHTML);
}

$("#listaCampoSelectEdit").prop('disabled', true);
$("#listaCampoOptionsSelectEdit").prop('disabled', true);
$("input#resultadoDisableEdit").prop('disabled', true);
$("input[name='campoRadioEdit']").on('ifClicked', function(event){
    if(event.currentTarget.id == "campoCampoRadioEdit"){
        $( "#campoFieldEdit" ).fadeIn( "slow", function() {
        });
        $('#variableFieldEdit').hide();
        $('#fosedeFieldEdit').hide();
        $( "#cuentasOperativasFieldEdit" ).hide();
        $( "#multFieldEdit" ).hide();
        $("#fosedeFieldEdit :input").iCheck('uncheck');
        mostrarFieldsCampoSelectEdit();
    } else if(event.currentTarget.id == "variablesCampoRadioEdit"){
        $( "#variableFieldEdit" ).fadeIn( "slow", function() {
        });
        $('#campoFieldEdit').hide();
        $('#fosedeFieldEdit').hide();
        $( "#multFieldEdit" ).hide();
    } else if(event.currentTarget.id == "fosedeCampoRadioEdit"){
        $( "#fosedeFieldEdit" ).fadeIn( "slow", function() {
        });
        $("#hastaFOSEDECampoRadioEdit").iCheck('check');
        $('#campoFieldEdit').hide();
        $('#variableFieldEdit').hide();
        $( "#cuentasOperativasFieldEdit" ).hide();
        $('#relacionalesFieldEdit').hide();
        $( "#ln_solidOPERACIONEdit" ).hide();
        $( "#algebraicosFieldEdit" ).hide();
        $( "#manualValorRadioLabelEdit" ).hide();
        $( "#manualFieldEdit" ).hide();
        $( "#factorFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#factorValorRadioLabelEdit" ).show();
        $("#factorValorRadioEdit").iCheck('check');
        $( "#elementoValorRadioLabelEdit" ).hide();
        $( "#listaValorFieldEdit" ).hide();
        $( "#sumarSiFieldEdit" ).hide();
        $("#multOperadorRadioEdit").iCheck('check');
        $( "#multFieldEdit" ).fadeIn( "slow", function() {
        });
    } else if(event.currentTarget.id == "cuentasOperativasCampoRadioEdit"){
        $( "#cuentasOperativasFieldEdit" ).fadeIn( "slow", function() {
        });
        $("#hastaFOSEDECuentasOpCampoRadioEdit").iCheck('check');
        $('#fosedeFieldEdit').hide();
        $('#campoFieldEdit').hide();
        $('#variableFieldEdit').hide();
        $('#relacionalesFieldEdit').hide();
        $( "#ln_solidOPERACIONEdit" ).hide();
        $( "#algebraicosFieldEdit" ).hide();
        $( "#manualValorRadioLabelEdit" ).hide();
        $( "#manualFieldEdit" ).hide();
        $( "#factorFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#factorValorRadioLabelEdit" ).show();
        $("#factorValorRadioEdit").iCheck('check');
        $( "#elementoValorRadioLabelEdit" ).hide();
        $( "#listaValorFieldEdit" ).hide();
        $( "#sumarSiFieldEdit" ).hide();
        $("#multOperadorRadioEdit").iCheck('check');
        $( "#multFieldEdit" ).fadeIn( "slow", function() {
        });
    }
});

function mostrarFieldsCampoSelectEdit () {
    var campo = $("#campoCampoInputEdit").val();
    if(campo == 'saldo') {
        $( "#relacionalesFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#algebraicosFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#ln_solidOPERACIONEdit" ).show();
        $( "#elementoValorRadioLabelEdit" ).hide();
        $( "#listaValorFieldEdit" ).hide();
        $( "#manualValorRadioLabelEdit" ).show();
        $("#factorValorRadioEdit").iCheck('check');
        $( "#manualFieldEdit" ).hide();
        $( "#factorValorRadioLabelEdit" ).show();
        $( "#factorFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#sumarSiFieldEdit" ).hide();
        $("#meOperadorRadioEdit").iCheck('check');
        $( "#fechaValorRadioLabelEdit" ).hide();
        $( "#diasFieldEdit" ).hide();
    } else if(campo == 'plazoResidual') {
        $( "#relacionalesFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#algebraicosFieldEdit" ).hide();
        $( "#ln_solidOPERACIONEdit" ).hide();
        $( "#elementoValorRadioLabelEdit" ).hide();
        $( "#listaValorFieldEdit" ).hide();
        $( "#manualValorRadioLabelEdit" ).hide();
        $( "#manualFieldEdit" ).hide();
        $( "#factorValorRadioLabelEdit" ).hide();
        $( "#factorFieldEdit" ).hide();
        $( "#sumarSiFieldEdit" ).hide();
        $("#meOperadorRadioEdit").iCheck('check');
        $("#fechaValorRadioLabelEdit").show();
        $("#fechaValorRadioEdit").iCheck('check');
        $( "#diasFieldEdit" ).fadeIn( "slow", function() {
        });
    } else {
        $( "#sumarSiFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#relacionalesFieldEdit" ).hide();
        $( "#algebraicosFieldEdit" ).hide();
        $( "#ln_solidOPERACIONEdit" ).hide();
        $("#sumarSiOperadorRadioEdit").iCheck('check');
        $( "#fechaValorRadioLabelEdit" ).hide();
        $( "#diasFieldEdit" ).hide();
    }
    if(campo == 'tipoPersona') {
        renderListsSelectEdit(4);
        $( "#elementoValorRadioLabelEdit" ).show();
        $("#elementoValorRadioLabelEdit").iCheck('check');
        $( "#listaValorFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#manualValorRadioLabelEdit" ).hide();
        $( "#manualFieldEdit" ).hide();
        $( "#factorValorRadioLabelEdit" ).hide();
        $( "#factorFieldEdit" ).hide();
    } else if(campo == 'tipoSubPersona') {
        renderListsSelectEdit(5);
        $( "#elementoValorRadioLabelEdit" ).show();
        $("#elementoValorRadioLabelEdit").iCheck('check');
        $( "#listaValorFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#manualValorRadioLabelEdit" ).hide();
        $( "#manualFieldEdit" ).hide();
        $( "#factorValorRadioLabelEdit" ).hide();
        $( "#factorFieldEdit" ).hide();
    } else if(campo == 'idCliente' || campo == 'nombreCliente') {
        renderListsSelectEdit(3);
        $( "#elementoValorRadioLabelEdit" ).show();
        $("#elementoValorRadioLabelEdit").iCheck('check');
        $( "#listaValorFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#manualValorRadioLabelEdit" ).hide();
        $( "#manualFieldEdit" ).hide();
        $( "#factorValorRadioLabelEdit" ).hide();
        $( "#factorFieldEdit" ).hide();
    } else if(campo == 'tipoCuenta') {
        renderListsSelectEdit(9);
        $( "#elementoValorRadioLabelEdit" ).show();
        $("#elementoValorRadioLabelEdit").iCheck('check');
        $( "#listaValorFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#manualValorRadioLabelEdit" ).hide();
        $( "#manualFieldEdit" ).hide();
        $( "#factorValorRadioLabelEdit" ).hide();
        $( "#factorFieldEdit" ).hide();
    }
}

//$("#date_inlineEdit").css('pointer-events', 'none');
//$("#mesValorInput").prop('disabled', true);
$("input[name='valorRadioEdit']").on('ifClicked', function(event){
    if(event.currentTarget.id == "manualValorRadioEdit") {
        $( "#manualFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#factorFieldEdit" ).hide();
    } else if(event.currentTarget.id == "factorValorRadioEdit") {
        $( "#factorFieldEdit" ).fadeIn( "slow", function() {
        });
        $( "#manualFieldEdit" ).hide();
    }
});

function modifyRule () {
    $("body").overhang({
        type: "confirm",
        primary: "#f5a433",
        accent: "#dc9430",
        yesColor: "#3498DB",
        message: 'Esta seguro que desea modificar la variable?',
        overlay: true,
        yesMessage: "Modificar",
        noMessage: "Cancelar",
        callback: function (value) {
            if(value) {
                var campoObjetivo = '';
                var operacion = '';
                var valor = '';
                var variables = '';
                var filtro = -1;
                if($('input[name=filtersEdit]:checked').length > 0)
                    filtro = $('input[name=filtersEdit]:checked').val();
                if( $('#campoCampoRadioEdit').is(':checked') )
                    campoObjetivo = 'COLUMNA='+$("#campoCampoInputEdit").val();
                else if( $('#fosedeCampoRadioEdit').is(':checked') ) {
                    if( $('#hastaFOSEDECampoRadioEdit').is(':checked') )
                        campoObjetivo = 'hastaFOSEDE';
                    else
                        campoObjetivo = 'mayorFOSEDE';
                } else if( $('#cuentasOperativasCampoRadioEdit').is(':checked') ) { 
                    if( $('#hastaFOSEDECuentasOpCampoRadioEdit').is(':checked') )
                        campoObjetivo = 'CONCUENTAS=hastaFOSEDE';
                    else if( $('#mayorFOSEDECuentasOpCampoRadioEdit').is(':checked') )
                        campoObjetivo = 'CONCUENTAS=mayorFOSEDE';
                    else if( $('#hastaFOSEDENoCuentasOpCampoRadioEdit').is(':checked') )
                        campoObjetivo = 'SINCUENTAS=hastaFOSEDE';
                    else
                        campoObjetivo = 'SINCUENTAS=mayorFOSEDE';
                }
                if( $('#meOperadorRadioEdit').is(':checked') )
                    operacion = '<';
                else if( $('#meigOperadorRadioEdit').is(':checked') )
                    operacion = '<=';
                else if( $('#maOperadorRadioEdit').is(':checked') )
                    operacion = '>';
                else if( $('#maigOperadorRadioEdit').is(':checked') )
                    operacion = '>=';
                else if( $('#igOperadorRadioEdit').is(':checked') )
                    operacion = '==';
                else if( $('#noigOperadorRadioEdit').is(':checked') )
                    operacion = '!=';
                else if( $('#masOperadorRadioEdit').is(':checked') )
                    operacion = '+';
                else if( $('#porOperadorRadioEdit').is(':checked') )
                    operacion = '*';
                else if( $('#menOperadorRadioEdit').is(':checked') )
                    operacion = '-';
                else if( $('#entOperadorRadioEdit').is(':checked') )
                    operacion = '/';
                else if( $('#sumarSiOperadorRadioEdit').is(':checked') )
                    operacion = 'en';
                else if( $('#sumarSiNoOperadorRadioEdit').is(':checked') )
                    operacion = 'no';
                else if( $('#multOperadorRadioEdit').is(':checked') )
                    operacion = '*';
                if( $('#manualValorRadioEdit').is(':checked') )
                    valor = "COLUMNA="+parseFloat($("#manualValorInputEdit").val().split(" ")[1].replace(/,/g, ""));
                else if( $('#elementoValorRadioEdit').is(':checked') ) {
                    var elementosSelect = $("#elementoValorOptionSelectEdit").val();
                    var elementos = '';
                    if(elementosSelect != null) {
                        for (var i = 0; i < elementosSelect.length; i++) {
                            elementos+=arregloElementosDeListasValorEdit[parseInt(elementosSelect[i])].ID;
                            if( (i+1) < elementosSelect.length )
                                elementos+=',';
                        };
                        valor = 'LISTA=' + elementos;
                    } else 
                        valor = 'LISTA=' + getSelectOptions(arregloElementosDeListasValorEdit);
                } else if( $('#factorValorRadioEdit').is(':checked') ) {
                    valor = "FACTOR="+variableDeVariableObject.factor;
                } else if( $('#fechaValorRadioEdit').is(':checked') ) {
                    valor = "FECHA";
                }
                /*console.log("-_------___----");
                //console.log(reglaPadre);
                console.log(campoObjetivo);
                console.log(operacion);
                console.log(valor);
                console.log(variables);
                console.log(variableDeVariableReglaID);
                console.log(ordenGlobal);
                console.log(ordenGlobal+1);
                console.log("-_------___----");*/
                if(campoObjetivo.length > 0 && campoObjetivo.length < 1001) {
                    if(operacion.length > 0 && operacion.length < 3) {
                        if(valor.toString().length > 0 && valor.toString().length < 1001) {
                            const transaction = new sql.Transaction( pool1 );
                            transaction.begin(err => {
                                var rolledBack = false;
                                transaction.on('rollback', aborted => {
                                    // emited with aborted === true
                                    rolledBack = true;
                                });
                                const request = new sql.Request(transaction);
                                request.query("update Reglas set campoObjetivo = '"+campoObjetivo+"', operacion = '"+operacion+"', valor = '"+valor+"', variables = '"+variables+"', filtro = "+filtro+" where ID = "+reglaSeleccionada.ID, (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        if (!rolledBack) {
                                            transaction.rollback(err => {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#f84a1d",
                                                    accent: "#d94e2a",
                                                    message: "Error en inserción de nueva variable.",
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
                                closeConfirm: true,
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
                            closeConfirm: true,
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
                        closeConfirm: true,
                        overlay: true,
                        closeConfirm: true
                    });
                }
            }
        }
    });
}
/* *************    Fin Modify   ************* */





























/* *************    Filter   ************* */
function loadFilters () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Reglas where esFiltro = 'true' and variables = '2'", (err, result) => {
            if (err) {
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de reglas.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0) {
                        arregloFiltros = result.recordset;
                    } else {
                        arregloFiltros = [];
                    }
                    renderFilters();
                });
            }
        });
    }); // fin transaction
}

function renderFilters () {
    $("#listFilters").empty();
    var listContent = '';
    for (var i = 0; i < arregloFiltros.length; i++) {
        var regla = arregloFiltros[i].valor;
        listContent = '';
        listContent+='<li><p><input id="filtro'+arregloFiltros[i].ID+'" type="radio" name="filters" class="flat" value="'+arregloFiltros[i].ID+'"> '+ regla +' </p> <button style="position: absolute; right: 10px; margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" onclick="selectFilter('+i+')">Modificar</button> </li>';
        $("#listFilters").append(listContent);
    };
    $("input[name='filters']").iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass: 'iradio_flat-green'
    });
    if(arregloFiltros.length == 0 ){
        listContent+='<li><p> No hay filtros creadas.</p></li>';
        $("#listFilters").append(listContent);
    }
    $("input[name='filters']").on('ifClicked', function(event){
        var borrar = false;
        if ($(this).is(':checked')) {
            $(this).iCheck('uncheck');
            borrar = true;
        } else {
            $(this).iCheck('check');
        }
    });

    $("#listFiltersEdit").empty();
    var listContent = '';
    for (var i = 0; i < arregloFiltros.length; i++) {
        var regla = arregloFiltros[i].valor;
        listContent = '';
        listContent+='<li><p><input type="radio" name="filtersEdit" class="flat" value="'+arregloFiltros[i].ID+'"> '+ regla +' </p> </li>';
        $("#listFiltersEdit").append(listContent);
    };
    $("input[name='filtersEdit']").iCheck({
        checkboxClass: 'icheckbox_flat-green',
        radioClass: 'iradio_flat-green'
    });
    if(arregloFiltros.length == 0 ){
        listContent+='<li><p> No hay filtros creadas.</p></li>';
        $("#listFiltersEdit").append(listContent);
    }
    $("input[name='filtersEdit']").on('ifClicked', function(event){
        var borrar = false;
        if ($(this).is(':checked')) {
            $(this).iCheck('uncheck');
            borrar = true;
        } else {
            $(this).iCheck('check');
        }
    });
}

function saveFilter () {
    var reglaPadre = 0;
    var campoObjetivo = '';
    var operacion = 'se';
    var valor = '';
    var variables = '2';
    var esFiltro = true;
    var filtro = -1;
    campoObjetivo = $("#agrupacionFiltro").val();
    valor = $("#nombreFilter").val();
    /*console.log("-_------___----");
    console.log(reglaPadre);
    console.log(campoObjetivo);
    console.log(operacion);
    console.log(valor);
    console.log(variables);
    console.log(variableDeVariableReglaID);
    console.log(ordenGlobal);
    console.log(ordenGlobal+1);
    console.log("-_------___----");*/
    if(campoObjetivo.length > 0 && campoObjetivo.length < 1001) {
        if(operacion.length > 0 && operacion.length < 3) {
            if(valor.toString().length > 0 && valor.toString().length < 1001) {
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
                                        message: "Error en inserción de nueva variable.",
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
                                loadFilters();
                            });
                        }
                    });
                }); // fin transaction
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Ingrese un nombre entre una longitud mayor a 0 y menor a 1001.",
                    closeConfirm: true,
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
                closeConfirm: true,
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
            closeConfirm: true,
            overlay: true,
            closeConfirm: true
        });
    }
}

function selectFilter (index) {
    filtroSeleccionado = arregloFiltros[index];
    $("#agrupacionFiltroEdit").val(filtroSeleccionado.campoObjetivo);
    $("#nombreFilterEdit").val(filtroSeleccionado.valor);
    $('#modalFilter').modal('toggle');
}

function modifyFilter (argument) {
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
            if(value) {
                var campoObjetivo = '', valor = '';
                campoObjetivo = $("#agrupacionFiltroEdit").val();
                valor = $("#nombreFilterEdit").val();
                /*console.log("-_------___----");
                console.log(reglaPadre);
                console.log(campoObjetivo);
                console.log(operacion);
                console.log(valor);
                console.log(variables);
                console.log(variableDeVariableReglaID);
                console.log(ordenGlobal);
                console.log(ordenGlobal+1);
                console.log("-_------___----");*/
                if(campoObjetivo.length > 0 && campoObjetivo.length < 1001) {
                    if(valor.toString().length > 0 && valor.toString().length < 1001) {
                        const transaction = new sql.Transaction( pool1 );
                        transaction.begin(err => {
                            var rolledBack = false;
                            transaction.on('rollback', aborted => {
                                // emited with aborted === true
                                rolledBack = true;
                            });
                            const request = new sql.Request(transaction);
                            request.query("update Reglas set campoObjetivo = '"+campoObjetivo+"', valor = '"+valor+"' where ID = "+filtroSeleccionado.ID, (err, result) => {
                                if (err) {
                                    console.log(err);
                                    if (!rolledBack) {
                                        transaction.rollback(err => {
                                            $("body").overhang({
                                                type: "error",
                                                primary: "#f84a1d",
                                                accent: "#d94e2a",
                                                message: "Error en inserción de nueva variable.",
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
                                        loadFilters();
                                        $('#modalFilter').modal('toggle');
                                    });
                                }
                            });
                        }); // fin transaction
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Ingrese un nombre entre una longitud mayor a 0 y menor a 1001.",
                            closeConfirm: true,
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
                        closeConfirm: true,
                        overlay: true,
                        closeConfirm: true
                    });
                }
            }
        }
    });
}

function deleteFilter () {
    $("body").overhang({
        type: "confirm",
        primary: "#f5a433",
        accent: "#dc9430",
        yesColor: "#3498DB",
        message: 'Esta seguro que desea eliminar el filtro?',
        overlay: true,
        yesMessage: "Eliminar",
        noMessage: "Cancelar",
        callback: function (value) {
            if(value) {
                reglaSeleccionada = filtroSeleccionado;
                deleteRule();
                $('#modalFilter').modal('toggle');
            }
        }
    });
}
/* *************    Fin Filter   ************* */










































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
    session.defaultSession.clearStorageData([], (data) => {});
    $("#app_full").empty();
    //cleanup();
    $("#app_full").load("src/login.html");
}

function goRCL () {
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
}

function goReports () {
	$("#app_root").empty();
    $("#app_root").load("src/elegirReporteria.html");
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
	var esCondicion = false, noAgregarFactor = false;
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
				arreglo.push(tabsText+"if ( arregloDepositos[i]."+campo+".localeCompare('");
			else
				arreglo.push(tabsText+"if ( arregloDepositos[i]."+campo+" "+regla.operacion);
			//posicionesIF.push(arreglo.length-1);
			posicionesIF.push(arreglo.length);
		} else {
			var campo = regla.campoObjetivo.split("=")[1];

			// Agregando campo Operacion
			arreglo.push(tabsText+"var totalDeposito = arregloDepositos[i].saldo;");
			arreglo.push("\n"+tabsText+variableDeVariableObject.nombre+" += totalDeposito "+regla.operacion);
		}
	} else if(regla.campoObjetivo.indexOf('hastaFOSEDE') == 0) {
		noAgregarFactor = true;
		arreglo.push(tabsText+"var totalDeposito;");
		arreglo.push("\n"+tabsText+"if ( arregloDepositos[i].saldo > "+montoFosedeGlobal+" )");
		arreglo.push("\n\t"+tabsText+"totalDeposito = "+montoFosedeGlobal+";");
		arreglo.push("\n"+tabsText+"else");
		arreglo.push("\n\t"+tabsText+"totalDeposito = arregloDepositos[i].saldo;");
		arreglo.push("\n"+tabsText+variableDeVariableObject.nombre+" += totalDeposito * "+(parseInt(regla.valor.split("=")[1])/100)+";");
	} else if(regla.campoObjetivo.indexOf('mayorFOSEDE') == 0) {
		noAgregarFactor = true;
		arreglo.push(tabsText+"if ( arregloDepositos[i].saldo > "+montoFosedeGlobal+" ) {");
		arreglo.push("\n"+tabsText+"\tvar totalDeposito = arregloDepositos[i].saldo - "+montoFosedeGlobal+";");
		arreglo.push("\n\t"+tabsText+variableDeVariableObject.nombre+" += totalDeposito * "+(parseInt(regla.valor.split("=")[1])/100)+";");
		arreglo.push("\n"+tabsText+"}");
	} else if(regla.campoObjetivo.indexOf('CONCUENTAS') == 0) {
		noAgregarFactor = true;
		if(regla.campoObjetivo.split("=")[1].localeCompare('hastaFOSEDE') == 0) {
			arreglo.push(tabsText+"var totalDeposito = conCuentasHastaFOSEDE(arregloDepositos[i].idCliente);\n");
			arreglo.push(tabsText+"if ( arregloDepositos[i].saldo > "+montoFosedeGlobal+" && totalDeposito != -1 ) {\n");
			arreglo.push(tabsText+"\tif ( totalDeposito > "+montoFosedeGlobal+")");
			arreglo.push("\n\t\t"+tabsText+"totalDeposito = "+montoFosedeGlobal+";");
			arreglo.push("\n\t"+tabsText+variableDeVariableObject.nombre+" += totalDeposito * "+(parseInt(regla.valor.split("=")[1])/100)+";");
			arreglo.push("\n"+tabsText+"}");
		} else if(regla.campoObjetivo.split("=")[1].localeCompare('mayorFOSEDE') == 0) {
			arreglo.push(tabsText+"var totalDeposito = conCuentasMayorFOSEDE(arregloDepositos[i].idCliente);\n");
			arreglo.push(tabsText+"if ( arregloDepositos[i].saldo > "+montoFosedeGlobal+" && totalDeposito != -1 ) {\n");
			arreglo.push(tabsText+"\tif ( totalDeposito > "+montoFosedeGlobal+") {");
			arreglo.push("\n\t\t"+tabsText+"totalDeposito = totalDeposito - "+montoFosedeGlobal+";");
			arreglo.push("\n\t\t"+tabsText+variableDeVariableObject.nombre+" += totalDeposito * "+(parseInt(regla.valor.split("=")[1])/100)+";");
			arreglo.push("\n\t"+tabsText+"}");
			arreglo.push("\n"+tabsText+"}");
		}
	} else if(regla.campoObjetivo.indexOf('SINCUENTAS') == 0) {
		noAgregarFactor = true;
		if(regla.campoObjetivo.split("=")[1].localeCompare('hastaFOSEDE') == 0) {
			arreglo.push(tabsText+"var totalDeposito = sinCuentasHastaFOSEDE(arregloDepositos[i].idCliente);\n");
			arreglo.push(tabsText+"if ( arregloDepositos[i].saldo > "+montoFosedeGlobal+" && totalDeposito != -1 ) {\n");
			arreglo.push(tabsText+"\tif ( totalDeposito > "+montoFosedeGlobal+")");
			arreglo.push("\n\t\t"+tabsText+"totalDeposito = "+montoFosedeGlobal+";");
			arreglo.push("\n\t"+tabsText+variableDeVariableObject.nombre+" += totalDeposito * "+(parseInt(regla.valor.split("=")[1])/100)+";");
			arreglo.push("\n"+tabsText+"}");
		} else if(regla.campoObjetivo.split("=")[1].localeCompare('mayorFOSEDE') == 0) {
			arreglo.push(tabsText+"var totalDeposito = sinCuentasMayorFOSEDE(arregloDepositos[i].idCliente);\n");
			arreglo.push(tabsText+"if ( arregloDepositos[i].saldo > "+montoFosedeGlobal+" && totalDeposito != -1 ) {\n");
			arreglo.push(tabsText+"\tif ( totalDeposito > "+montoFosedeGlobal+") {");
			arreglo.push("\n\t\t"+tabsText+"totalDeposito = totalDeposito - "+montoFosedeGlobal+";");
			arreglo.push("\n\t\t"+tabsText+variableDeVariableObject.nombre+" += totalDeposito * "+(parseInt(regla.valor.split("=")[1])/100)+";");
			arreglo.push("\n\t"+tabsText+"}");
			arreglo.push("\n"+tabsText+"}");
		}
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
				/*for (var i = 0; i < arregloLista.length; i++) {
					for (var j = 0; j < tamArreglo; j++) {
						if(i==0) {
							arreglo[j] +=arregloLista[i] + "') == 0 ) {";
						} else {
							arreglo.push("\n"+copiaRegla[j]+arregloLista[i]+"') == 0 ) {");
							posicionesIF.push(posicionesIF[posicionesIF.length-1]+2);
						}
					};
				};*/
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
			arreglo[arreglo.length-1] += " "+columnaValor + ";";
			/*for (var i = 0; i < arreglo.length; i++) {
				arreglo[i] += " "+columnaValor + ";";
			};*/
		}
	} else if(regla.valor.indexOf('FECHA') == 0) {
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
	}

	console.log('arreglo VALOR');
	console.log(arreglo);
	for (var i = 0; i < arreglo.length; i++) {
		console.log(arreglo[i]);
	};

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