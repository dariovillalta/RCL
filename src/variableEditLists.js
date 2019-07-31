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

/*****************TIPO DE LISTAS*****************
*   1)Manual Contable                           *
*   2)Cuentas Operativas                        *
*   3)Exclusiones FOSEDE                        *
*   4)Tipo de Personas                          *
*   5)Tipo de Sub-Personas                      *
*   6)Cuentas Operativas Clientes               *
*   7)Agencias                                  *
*   8)Tipos Crédito                             *
*   9)Tipos Deposito                            *
************************************************/

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
		//loadVariablesIMG();
		loadLists();
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




//	**********		Manual Contable y Listas		**********
var arregloListas = [];
var arregloListasVariables = [];
var listasVariablesSeleccionada = null;

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
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                    	arregloListas = result.recordset;
                    } else {
                    	arregloListas = [];
                    }
                    renderListsCreateVariableSelect();
                });
            }
        });
    }); // fin transaction
}

function renderListsCreateVariableSelect () {
	var selectHTML = '';
	for (var i = 0; i < arregloListas.length; i++) {
		selectHTML+='<option value='+arregloListas[i].ID+'>'+arregloListas[i].nombre+'</option>';
	};
	$("#elementosDeListaUpdate").empty();
	$("#elementosDeListaModify").empty();
	$("#elementosDeListaUpdate").append(selectHTML);
	$("#elementosDeListaModify").append(selectHTML);
	loadListListsExcel();
}

//$("#elementoSaldo").val("0");//para que no tire error al crear sin mover de dropdown
function showListsFields (idLista) {
    var tipoLista = arregloListas.filter(function(object) {
                        return object.ID == idLista;
                    });
    if(tipoLista[0].tipo == 1 /*|| tipoLista[0].tipo == 2*/) { //Manual Contable
        $("#elementoNombre").attr("placeholder", "Ingrese nombre de cuenta");
        $("#elementoValor").attr("placeholder", "Ingrese número de cuenta");
        $("#elementoValor").show();
        $("#puestoField").hide();
        $("#saldosField").hide();
        $("#columnasRestoField").hide();
        $("#fechasField").show();
        $("#elementoNombre").val("");
        $("#elementoValor").val("");
        $("#fechaCreacionYid").val("");
        $("#fechaCaducidadYsaldo").val("");
    } else if(/*tipoLista[0].tipo == 2 || */tipoLista[0].tipo == 6) { //Cuentas Operativas
        $("#elementoNombre").attr("placeholder", "Ingrese nombre de cuenta");
        $("#elementoValor").attr("placeholder", "Ingrese número de cuenta");
        $("#fechaCreacionYid").attr("placeholder", "Ingrese ID de cliente");
        $("#fechaCaducidadYsaldo").attr("placeholder", "Ingrese saldo de cuenta");
        $("#elementoValor").show();
        $("#puestoField").hide();
        $("#saldosField").show();
        $("#columnasRestoField").hide();
        $("#fechasField").hide();
        $("#elementoNombre").val("");
        $("#elementoValor").val("");
        $("#idClienteCueOp").val("");
        $("#saldoCueOp").val("");
    } else if(tipoLista[0].tipo == 3) { //Exclusiones FOSEDE
        $("#elementoNombre").attr("placeholder", "Ingrese ID de persona");
        $("#elementoValor").attr("placeholder", "Ingrese nombre de persona");
        $("#elementoValor").show();
        $("#puestoField").show();
        $("#saldosField").hide();
        $("#columnasRestoField").hide();
        $("#fechasField").hide();
        $("#elementoNombre").val("");
        $("#elementoValor").val("");
        $("#elementoPuesto").val("");
    } else if(tipoLista[0].tipo == 7) { //Agencia
        $("#elementoNombre").attr("placeholder", "El nombre de la agencia");
        $("#elementoValor").hide();
        $("#puestoField").hide();
        $("#saldosField").hide();
        $("#columnasRestoField").hide();
        $("#fechasField").hide();
    } else { //Resto
        $("#elementoNombre").attr("placeholder", "El nombre del elemento");
        $("#elementoValor").attr("placeholder", "El valor a comparar en las tablas");
        $("#elementoValor").show();
        $("#puestoField").hide();
        $("#saldosField").hide();
        $("#columnasRestoField").show();
        $("#fechasField").hide();
    }
}

function loadListListsExcel () {
	var idLista = $("#elementosDeListaUpdate").val();
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables where idLista = "+idLista, (err, result) => {
            if (err) {
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
                    	arregloListasVariables = result.recordset;
                    } else {
                    	arregloListasVariables = [];
                    	listasVariablesSeleccionada = null;
                    }
                    renderVariableListSelect();
                });
            }
        });
    }); // fin transaction
}

$('#nombreListaOrdenRadio').on('ifChecked', function () {
    renderVariableListSelect();
});
$('#valorListaOrdenRadio').on('ifChecked', function () {
    renderVariableListSelect();
});

function renderVariableListSelect () {
	var ulHTML = '';
    if($('#nombreListaOrdenRadio').iCheck('update')[0].checked) {
        arregloListasVariables.sort(function(a, b){
            if(a.nombre < b.nombre) { return -1; }
            if(a.nombre > b.nombre) { return 1; }
            return 0;
        });
    } else {
        arregloListasVariables.sort(function(a, b){
            if(a.valor < b.valor) { return -1; }
            if(a.valor > b.valor) { return 1; }
            return 0;
        });
    }
	for (var i = 0; i < arregloListasVariables.length; i++) {
		ulHTML+='<li><p><button type="button" class="flat" onclick="showModalEditListVariable('+i+')">Editar</button>';
		ulHTML+=arregloListasVariables[i].nombre;
        ulHTML+='<span style="float:right;">'+arregloListasVariables[i].valor+'</span></p></li>';
	};
	$("#listsElements").empty();
	$("#listsElements").append(ulHTML);
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
    var year = date.getFullYear();
    return year + '-' + (monthIndex+1) + '-' + day;
}

function formatDateCreationString(date) {
    //formato si es STRING
    //aaaa/mm/dd
    //aaaa-mm-dd
    var partes = [];
    if(date.includes("-"))
        partes = date.split("-");
    else if(date.includes("/"))
        partes = date.split("/");
    else return false;
    var monthNames = [
        "Ene", "Feb", "Mar",
        "Abr", "May", "Jun", "Jul",
        "Ago", "Sep", "Oct",
        "Nov", "Dec"
    ];
    return partes[0] + '-' + partes[1] + '-' + partes[2];
}

function updateElementList () {
	var idLista = $("#elementosDeListaModify").val();
    var encontroLista = arregloListas.filter(function(object) {
                    return ( object.ID == idLista );
                });
	var nombre = $("#nombreCuentaUpdate").val();
	var valor = $("#numeroCuentaUpdate").val();
    //var saldo = $("#saldoCuentaUpdate").val();
    var saldo = 0;
    if(isNaN(saldo))
        saldo = 0;
    var fechaInicio =  new Date();
    var fechaFin =  new Date();
    if(encontroLista[0].tipo == 1) {
        fechaInicio = $("#fechaCreacionModalUpdate").datepicker('getDate');
        fechaFin = $("#fechaCaducidadModalUpdate").datepicker('getDate');
    }
    var puesto = $("#saldoCuentaUpdate").val();
    if(encontroLista[0].tipo == 6) {
        puesto = $("#idClienteModalUpdate").val();
    }
	if(idLista.length > 0) {
		if(nombre.length > 0 && nombre.length < 121){
			if(valor.length > 0 && valor.length < 51){
				$("body").overhang({
				  	type: "confirm",
				  	primary: "#f5a433",
				  	accent: "#dc9430",
				  	yesColor: "#3498DB",
				  	message: 'Esta seguro que desea modificar elemento '+listasVariablesSeleccionada.nombre+'?',
				  	overlay: true,
				  	yesMessage: "Modificar",
				  	noMessage: "Cancelar",
				  	callback: function (value) {
				    	if(value){
				    		const transaction = new sql.Transaction( pool1 );
						    transaction.begin(err => {
						        var rolledBack = false;
						        transaction.on('rollback', aborted => {
						            // emited with aborted === true
						            rolledBack = true;
						        });
						        const request = new sql.Request(transaction);
						        request.query("update ListasVariables set idLista = "+idLista+", nombre = '"+$.trim(nombre)+"', valor = '"+$.trim(valor)+"', saldo = "+saldo+", fechaCreacion = '"+formatDateCreation(fechaInicio)+"', fechaCaducidad = '"+formatDateCreation(fechaFin)+"', puesto = '"+$.trim(puesto)+"' where ID = "+listasVariablesSeleccionada.ID, (err, result) => {
						            if (err) {
						                if (!rolledBack) {
                                            console.log(err)
						                    transaction.rollback(err => {
						                        $("body").overhang({
                                                    type: "error",
                                                    primary: "#f84a1d",
                                                    accent: "#d94e2a",
                                                    message: "Error en modificación en la tabla de ListasVariables.",
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
											  	message: "Elemento de lista modificado con éxito.",
											  	duration: 1,
											  	overlay: true
											});
											loadListListsExcel();
											$('#modalElement').modal('toggle');
						                });
						            }
						        });
						    }); // fin transaction
				    	}
				  	}
				});
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "El valor del elemento de la lista debe tener una longitud mayor a 0 y menor a 51.",
				  	overlay: true,
                    closeConfirm: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "El nombre del elemento de la lista debe tener una longitud mayor a 0 y menor a 121.",
			  	overlay: true,
                closeConfirm: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Seleccione una lista.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function deleteElementList () {
	$("body").overhang({
	  	type: "confirm",
	  	primary: "#f5a433",
	  	accent: "#dc9430",
	  	yesColor: "#3498DB",
	  	message: 'Esta seguro que desea eliminar elemento '+listasVariablesSeleccionada.nombre+'?',
	  	overlay: true,
	  	yesMessage: "Eliminar",
	  	noMessage: "Cancelar",
	  	callback: function (value) {
	    	if(value){
	    		const transaction = new sql.Transaction( pool1 );
			    transaction.begin(err => {
			        var rolledBack = false
			 
			        transaction.on('rollback', aborted => {
			            // emited with aborted === true
			     
			            rolledBack = true
			        })
			        const request = new sql.Request(transaction);
			        request.query("delete from ListasVariables where ID = "+listasVariablesSeleccionada.ID, (err, result) => {
			            if (err) {
			                if (!rolledBack) {
			                    transaction.rollback(err => {
			                        $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en modificación en la tabla de ListasVariables.",
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
								  	message: "Elemento de lista eliminado con éxito.",
								  	duration: 1,
								  	overlay: true
								});
								$("#elementoNombreUpdate").val('');
								$("#elementoValorUpdate").val('');
			                    loadListListsExcel();
			                    $('#modalElement').modal('toggle');
			                });
			            }
			        });
			    }); // fin transaction
	    	}
	  	}
	});
}

function showModalEditListVariable (index) {
	listasVariablesSeleccionada = arregloListasVariables[index];
	$('#elementosDeListaModify').val(listasVariablesSeleccionada.idLista);
    var tipo = arregloListas.filter(function(object) {
                    return (listasVariablesSeleccionada.idLista == object.ID);
                });
    showListsFieldsUpdate(tipo[0].ID);
	$('#modalElement').modal('toggle');
}

function showListsFieldsUpdate (id) {
    var tipo = arregloListas.filter(function(object) {
                    return (id == object.ID);
                });
    var valor = tipo[0].tipo;
    if(valor == 1 /*|| valor == 2*/) {
        $('#labelNombreExcelUpdate').text("Nombre de Elemento");
        $('#labelCuentaExcelUpdate').text("# de Cuenta de Elemento");
        $('#labelFechaCreacionExcelUpdate').text("Inicio de vigencia de Elemento");
        $('#labelFechaCaducidadExcelUpdate').show();
        $('#astVigencia').show();
        $('#labelFechaCaducidadExcelUpdate').text("Fin de vigencia de Elemento");
        $("#nombreCuentaUpdate").attr("placeholder", "Nombre de Elemento");
        $("#numeroCuentaUpdate").attr("placeholder", "Cuenta de Elemento");
        //$('#saldoModalFieldUpdate').hide();
        $('#fechasModalFieldUpdate').show();
        $('#labelCuentaExcelUpdate').show();
        $("#nombreCuentaUpdate").val(listasVariablesSeleccionada.nombre);
        $("#numeroCuentaUpdate").val(listasVariablesSeleccionada.valor);
        $('#fechaCreacionModalUpdate').datepicker({
            format: "dd-mm-yyyy",
            todayHighlight: true,
            viewMode: "days", 
            minViewMode: "days",
            language: 'es'
        });
        $('#fechaCreacionModalUpdate').datepicker("setDate", new Date(listasVariablesSeleccionada.fechaCreacion) );
        $('#fechaCaducidadModalUpdate').datepicker({
            format: "dd-mm-yyyy",
            todayHighlight: true,
            viewMode: "days", 
            minViewMode: "days",
            language: 'es'
        });
        $('#fechaCaducidadModalUpdate').datepicker("setDate", new Date(listasVariablesSeleccionada.fechaCaducidad) );
        $("#numeroCuentaUpdate").show();
        $("#asteriskNumUpdate").show();
        $("#cuentOpFieldUpdate").hide();
        $("#saldoModalFieldUpdate").hide();
    } else if(valor == 6) {
        $('#labelNombreExcelUpdate').text("Nombre de Elemento");
        $('#labelCuentaExcelUpdate').text("# de Cuenta de Elemento");
        $('#labelFechaCreacionExcelUpdate').text("ID de Cliente");
        $('#labelFechaCaducidadExcelUpdate').hide();
        $('#astVigencia').hide();
        $("#nombreCuentaUpdate").attr("placeholder", "Nombre de Elemento");
        $("#numeroCuentaUpdate").attr("placeholder", "Cuenta de Elemento");
        /*$("#fechaCreacionModalUpdate").attr("placeholder", "ID de Cliente");
        $("#fechaCaducidadModalUpdate").attr("placeholder", "Saldo de cuenta");*/
        //$('#saldoModalFieldUpdate').hide();
        $('#fechasModalFieldUpdate').show();
        $('#labelCuentaExcelUpdate').show();
        $("#nombreCuentaUpdate").val(listasVariablesSeleccionada.nombre);
        $("#numeroCuentaUpdate").val(listasVariablesSeleccionada.valor);
        $("#idClienteModalUpdate").val(listasVariablesSeleccionada.puesto);
        $("#saldoClienteModalUpdate").val(listasVariablesSeleccionada.saldo);
        $("#numeroCuentaUpdate").show();
        $("#asteriskNumUpdate").show();
        $("#cuentOpFieldUpdate").show();
        $("#saldoModalFieldUpdate").hide();
    } else if(valor == 3) {
        $('#labelNombreExcelUpdate').text("Nombre de Cliente");
        $('#labelCuentaExcelUpdate').text("ID de Cliente");
        $('#labelModalExcelUpdate').text("Nombre de puesto de la persona");
        $("#nombreCuentaUpdate").attr("placeholder", "Nombre de Cliente");
        $("#numeroCuentaUpdate").attr("placeholder", "ID de Cliente");
        $("#saldoCuentaUpdate").attr("placeholder", "Nombre de puesto");
        $('#fechasModalFieldUpdate').hide();
        //$('#saldoModalFieldUpdate').show();
        $('#labelCuentaExcelUpdate').show();
        $("#nombreCuentaUpdate").val(listasVariablesSeleccionada.nombre);
        $("#numeroCuentaUpdate").val(listasVariablesSeleccionada.valor);
        $("#saldoCuentaUpdate").val(listasVariablesSeleccionada.puesto);
        $("#numeroCuentaUpdate").show();
        $("#asteriskNumUpdate").show();
        $("#saldoModalFieldUpdate").show();
    } else if(valor == 7) {
        $('#labelNombreExcelUpdate').text("El nombre de la agencia");
        $('#labelCuentaExcelUpdate').hide();
        $("#numeroCuentaUpdate").hide();
        $('#fechasModalFieldUpdate').hide();
        //$('#saldoModalFieldUpdate').hide();
        $("#nombreCuentaUpdate").val(listasVariablesSeleccionada.nombre);
        $("#asteriskNumUpdate").hide();
        $("#cuentOpFieldUpdate").hide();
        $("#saldoModalFieldUpdate").hide();
    } else {
        $('#labelNombreExcelUpdate').text("El nombre del elemento");
        $('#labelCuentaExcelUpdate').text("El valor a comparar en las tablas");
        $("#nombreCuentaUpdate").attr("placeholder", "Nombre del elemento");
        $("#numeroCuentaUpdate").attr("placeholder", "El valor del elemento");
        $('#fechasModalFieldUpdate').hide();
        //$('#saldoModalFieldUpdate').hide();
        $('#labelCuentaExcelUpdate').show();
        $("#nombreCuentaUpdate").val(listasVariablesSeleccionada.nombre);
        $("#numeroCuentaUpdate").val(listasVariablesSeleccionada.valor);
        $("#numeroCuentaUpdate").show();
        $("#asteriskNumUpdate").show();
        $("#cuentOpFieldUpdate").hide();
        $("#saldoModalFieldUpdate").hide();
    }
}

//	**********		Fin Listas		**********












//	**********		Route Change		**********
function goVariables () {
	$("#app_root").empty();
    cleanup();
    $("#app_root").load("src/variables.html");
}

function goHome () {
	$("#app_root").empty();
    cleanup();
    $("#app_root").load("src/home.html");
}

function goUsers () {
	$("#app_root").empty();
    cleanup();
    $("#app_root").load("src/users.html");
}

function goConnections () {
    $("#app_root").empty();
    cleanup();
    $("#app_root").load("src/importaciones.html");
}

function goConfig () {
    $("#app_root").empty();
    cleanup();
    $("#app_root").load("src/config.html");
}

function logout () {
    $("#app_full").empty();
    session.defaultSession.clearStorageData([], (data) => {});
    cleanup();
    $("#app_full").load("src/login.html");
}

function goReports () {
    $("#app_root").empty();
    cleanup();
    $("#app_root").load("src/elegirReporteria.html");
}

function goGraphics () {
    $("#app_root").empty();
    cleanup();
    $("#app_root").load("src/graficos.html");
}

function goRCL () {
	$("#app_root").empty();
    cleanup();
    $("#app_root").load("src/rcl.html");
}

function goLists () {
    $("#app_root").empty();
    cleanup();
    $("#app_root").load("src/variablesLists.html");
}

function goVariables () {
    $("#app_root").empty();
    $("#app_root").load("src/variablesLists.html");
}

var cleanup = function () {
    /*delete window.electron;
    delete window.remote;
    delete window.path;
    delete window.sql;
    delete window.XLSX;
    delete window.config;
    delete window.pool1;
    delete window.session;
    delete window.filterDiv;
    delete window.montoFosedeGlobal;
    delete window.arregloListas;
    delete window.arregloListasVariables;
    delete window.listasVariablesSeleccionada;
    delete window.loadLists;
    delete window.renderListsCreateVariableSelect;
    delete window.showListsFields;
    delete window.showListsFields;
    delete window.loadListListsExcel;
    delete window.loadListListsExcelAfterImport;
    delete window.renderVariableListSelect;
    delete window.createList;
    delete window.updateList;
    delete window.deleteList;
    delete window.formatDateCreation;
    delete window.createElementList;
    delete window.updateElementList;
    delete window.deleteElementList;
    delete window.showModalEditListVariable;
    delete window.dialog;
    delete window.fileExcel;
    delete window.arregloErroresExcel;
    delete window.arregloErroresInsercion;
    delete window.contadorInserciones;
    delete window.totalInserciones;
    delete window.insertoEnDBListas;
    delete window.selectFile;
    delete window.importExcel;
    delete window.createListExcel;
    delete window.modifyListExcel;
    delete window.createElementListExcel;
    delete window.toColumnName;
    delete window.UpperCasefirst;
    delete window.printErrorFile;
    delete window.showDollar;
    delete window.showLempira;
    delete window.showEuro;
    delete window.calculateRateChange;
    delete window.verifyAndSaveFOSEDE;
    delete window.createFOSEDEVariablesDB;
    delete window.updateFOSEDEVariablesDB;
    delete window.goVariables;
    delete window.goHome;
    delete window.goUsers;
    delete window.goConnections;
    delete window.logout;
    delete window.goRules;
    delete window.goRCL;
    delete window.cleanup;*/
};