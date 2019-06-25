const electron = require('electron');
const remote = require('electron').remote;
const sql = require('mssql');
const XLSX = require('xlsx-style');

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
        loadFosede();
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

var montoFosedeGlobal = null;

function loadFosede () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from FOSEDE", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de FOSEDE.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        if(result.recordset[0].montoFosede > 1) {
                            montoFosedeGlobal = result.recordset;
                            var content = '<option value="new"> Nueva Moneda </option>';
                            $("#fosedeUpdate").empty();
                            console.log(montoFosedeGlobal)
                            for (var i = 0; i < montoFosedeGlobal.length; i++) {
                                content+='<option value="'+montoFosedeGlobal[i].ID+'">'+montoFosedeGlobal[i].moneda+'</option>';
                            };
                            $("#fosedeUpdate").append(content);
                        }
                        else
                            montoFosedeGlobal = 0.00;
                    } else {
                        montoFosedeGlobal = 0.00;
                    }
                    loadTextFOSEDE();
                });
            }
        });
    }); // fin transaction
}

function loadTextFOSEDE () {
    if(montoFosedeGlobal != null) {
        var fosedeSeleccionado;
        var idSeleccionada = $("#fosedeUpdate").val();
        if(isNaN(montoFosedeGlobal))
            fosedeSeleccionado = montoFosedeGlobal.filter(function(object) {
                                    return object.ID == idSeleccionada;
                                });
        var textoFOSEDE;
        if(isNaN(montoFosedeGlobal) && fosedeSeleccionado.length > 0)
            textoFOSEDE = fosedeSeleccionado[0].montoFosede.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        else if(isNaN(montoFosedeGlobal) && fosedeSeleccionado.length == 0 || idSeleccionada == "new")
            textoFOSEDE = "0.00";
        else
            textoFOSEDE = montoFosedeGlobal.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        $("#montoActual").text("L. "+textoFOSEDE);
        if(fosedeSeleccionado != undefined && fosedeSeleccionado.length > 0) {
            $("#nombreMoneda").val(fosedeSeleccionado[0].moneda);
            $("#simboloMoneda").val(fosedeSeleccionado[0].simbolo);
            $("#lempiraInput").val(fosedeSeleccionado[0].montoFosede);
        }
    }
}




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
	$("#elementosDeLista").empty();
	$("#elementosDeListaUpdate").empty();
	$("#elementosDeListaModify").empty();
	$("#elementosDeListaEdit").empty();
	$("#elementosDeLista").append(selectHTML);
	$("#elementosDeListaUpdate").append(selectHTML);
	$("#elementosDeListaModify").append(selectHTML);
	$("#elementosDeListaEdit").append(selectHTML);
	if(arregloListas[0] != null)
		$("#elementoNombreEdit").val(arregloListas[0].nombre);
    if(arregloListas[0].tipo == 1/* || arregloListas[0].tipo == 2*/) { //Manual Contable
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
    } else if(/*arregloListas[0].tipo == 2 || */arregloListas[0].tipo == 6) { //Cuentas Operativas
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
        //$("#saldoCueOp").val("");
    } else if(arregloListas[0].tipo == 3) { //Exclusiones FOSEDE
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
    } else if(arregloListas[0].tipo == 7) { //Agencia
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

function createList () {
	var nombre = $("#nameList").val();
    var tipo = $("input[name='listaValorRadioALAC']:checked").val();
    //var tipo = 10;
	if(nombre.length > 0 && nombre.length < 61){
        if(!isNaN(tipo)){
    		const transaction = new sql.Transaction( pool1 );
    	    transaction.begin(err => {
    	        var rolledBack = false;
    	        transaction.on('rollback', aborted => {
    	            // emited with aborted === true
    	            rolledBack = true;
    	        });
    	        const request = new sql.Request(transaction);
    	        request.query("insert into Listas (nombre, tipo) values ('"+nombre+"', "+tipo+")", (err, result) => {
    	            if (err) {
    	                if (!rolledBack) {
    	                    transaction.rollback(err => {
    	                        $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Error en inserción en la tabla de Listas.",
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
    						  	message: "Lista creada con éxito.",
    						  	duration: 1,
    						  	overlay: true
    						});
    						$("#nameList").val('');
    	                    loadLists();
    	                });
    	            }
    	        });
    	    }); // fin transaction
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Seleccione un tipo de lista válido.",
                overlay: true,
                closeConfirm: true
            });
        }
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "El nombre de la lista debe tener longitud mayor a 0 y menor a 61.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function updateList () {
	var nombre = $("#elementoNombreEdit").val();
	var listaId = $("#elementosDeListaEdit").val();
	if(listaId != null) {
		if(listaId.length > 0) {
			if(nombre.length > 0 && nombre.length < 61){
				$("body").overhang({
				  	type: "confirm",
				  	primary: "#f5a433",
				  	accent: "#dc9430",
				  	yesColor: "#3498DB",
				  	message: 'Esta seguro que desea modificar lista '+$("#elementosDeListaEdit :selected").text()+'?',
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
						        request.query("update Listas set nombre = '"+nombre+"' where ID = "+listaId, (err, result) => {
						            if (err) {
						                if (!rolledBack) {
						                    transaction.rollback(err => {
						                        $("body").overhang({
                                                    type: "error",
                                                    primary: "#f84a1d",
                                                    accent: "#d94e2a",
                                                    message: "Error en modificación de variable "+nombre+".",
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
											  	message: "Lista creada con éxito.",
											  	duration: 1,
											  	overlay: true
											});
											$("#elementoNombreEdit").val('');
						                    loadLists();
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
				  	message: "El nombre de la lista debe tener longitud mayor a 0 y menor a 61.",
				  	overlay: true,
                    closeConfirm: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "Seleccione una lista primero.",
			  	overlay: true,
                closeConfirm: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Cree una lista primero.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function deleteList () {
	var listaId = $("#elementosDeListaEdit").val();
	$("body").overhang({
	  	type: "confirm",
	  	primary: "#f5a433",
	  	accent: "#dc9430",
	  	yesColor: "#3498DB",
	  	message: 'Esta seguro que desea eliminar lista '+$("#elementosDeListaEdit :selected").text()+'?',
	  	overlay: true,
	  	yesMessage: "Eliminar",
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
			        request.query("delete from Listas where ID = "+listaId, (err, result) => {
			            if (err) {
			                if (!rolledBack) {
			                    transaction.rollback(err => {
			                        $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en eliminación en la tabla de Listas.",
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
								  	message: "Lista creada con éxito.",
								  	duration: 1,
								  	overlay: true
								});
								$("#elementoNombreEdit").val('');
			                    loadLists();
			                });
			            }
			        });
			    }); // fin transaction
	    	}
	  	}
	});
}

function connectionTest (indexTabla) {
    $("#testConnection").prop('disabled', true);

    var arreglo;
    var user;
    var password;
    var server;
    var database;
    var table;
    arreglo = '';
    user = $.trim($("#manualUserDB").val());
    password = $.trim($("#manualPasswordDB").val());
    server = $.trim($("#manualServerDB").val());
    database = $.trim($("#manualDataBaseDB").val());
    table = $.trim($("#manualTableDB").val());
    if(user.length > 0){
        if(password.length > 0){
            if(server.length > 0){
                if(database.length > 0){
                    if(table.length > 0){
                        const pool = new sql.ConnectionPool({
                            user: user,
                            password: password,
                            server: server,
                            database: database
                        });

                        pool.connect(err => {
                            pool.request() // or: new sql.Request(pool1)
                            .query('select * from '+table, (err, result) => {
                                if(err){
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Intento de conexión fallido.",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                } else {
                                    $("body").overhang({
                                        type: "success",
                                        primary: "#40D47E",
                                        accent: "#27AE60",
                                        message: "Conexión realizada con éxito.",
                                        overlay: true
                                    });
                                }
                                $('#testConnection').prop('disabled', false);
                            });
                        });
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Ingrese un valor en el campo de el nombre de la tabla.",
                            overlay: true,
                            closeConfirm: true
                        });
                    }
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "Ingrese un valor en el campo de el nombre de la base de datos.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#Ingrese un valor en el campo de dirección del servidor.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese un valor en el campo de contraseña.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Ingrese un valor en el campo de nombre de usuario.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function saveManualContable () {
    var user = $.trim($("#manualUserDB").val());
    var password = $.trim($("#manualPasswordDB").val());
    var server = $.trim($("#manualServerDB").val());
    var database = $.trim($("#manualDataBaseDB").val());
    var table = $.trim($("#manualTableDB").val());
    var cuenta = $.trim($("#cuentaManual").val());
    var nombre = $.trim($("#nombreManual").val());
    var fechaInicio = $.trim($("#fechaInicioManual").val());
    var fechaFinal = $.trim($("#fechaFinalManual").val());
    arregloErroresExcel = [];
    arregloErroresInsercion = [];
    contadorInserciones = 0;
    totalInserciones = 0;
    insertoEnDBListas = false;
    if(user.length > 0) {
        if(password.length > 0) {
            if(server.length > 0) {
                if(database.length > 0) {
                    if(table.length > 0) {
                        if(nombre.length > 0) {
                            if(cuenta.length > 0) {
                                if(fechaInicio.length > 0) {
                                    if(fechaFinal.length > 0) {
                                        myInterval = setInterval(myTimer, 1000);
                                        $( ".loadingScreen" ).fadeIn( "slow", function() {
                                        });
                                        const transaction = new sql.Transaction( pool1 );
                                        transaction.begin(err => {
                                            var rolledBack = false
                                     
                                            transaction.on('rollback', aborted => {
                                                // emited with aborted === true
                                         
                                                rolledBack = true
                                            })
                                            const request = new sql.Request(transaction);
                                            request.query("select * from Listas where tipo = 1", (err, result) => {
                                                if (err) {
                                                    if (!rolledBack) {
                                                        console.log('error en rolledBack MainDB Variables');
                                                        console.log(err);
                                                        transaction.rollback(err => {
                                                            console.log('error en rolledBack');
                                                            console.log(err);
                                                        });
                                                    }
                                                }  else {
                                                    transaction.commit(err => {
                                                        // ... error checks
                                                        if(result.recordset.length > 0){
                                                            var idLista = result.recordset[0].ID;
                                                            const pool = new sql.ConnectionPool({
                                                                user: user,
                                                                password: password,
                                                                server: server,
                                                                database: database,
                                                                stream: true,
                                                                connectionTimeout: 900000,
                                                                requestTimeout: 900000,
                                                                pool: {
                                                                    max: 40,
                                                                    min: 0,
                                                                    idleTimeoutMillis: 30000
                                                                },
                                                                options: {
                                                                    useUTC: false
                                                                }
                                                            });

                                                            pool.connect(err => {
                                                                pool.request() // or: new sql.Request(pool1)
                                                                .query("select * from "+table+"", (err, result) => {
                                                                    if(err){
                                                                        console.log(err)
                                                                        $("body").overhang({
                                                                            type: "error",
                                                                            primary: "#f84a1d",
                                                                            accent: "#d94e2a",
                                                                            message: "Intento de conexión fallido activos.",
                                                                            overlay: true,
                                                                            closeConfirm: true
                                                                        });
                                                                        $(".loadingScreen").hide();
                                                                        stopTimer();
                                                                    } else {
                                                                        totalInserciones = result.recordset.length;
                                                                        for (var i = 0; i < result.recordset.length; i++) {
                                                                            let valorArreglo = result.recordset[i];
                                                                            if(valorArreglo[cuenta].length < 50) {
                                                                                if(valorArreglo[nombre].length < 150) {
                                                                                    if(Date.parse(valorArreglo[fechaInicio])) {
                                                                                        if(Date.parse(valorArreglo[fechaFinal])) {
                                                                                            if (Object.prototype.toString.call(valorArreglo[fechaInicio]) === "[object Date]") {
                                                                                                if (!isNaN(valorArreglo[fechaInicio].getTime())) {
                                                                                                    if(valorArreglo[fechaInicio] != undefined && valorArreglo[fechaInicio].length != 0 ) {
                                                                                                        valorArreglo[fechaInicio] = new Date(valorArreglo[fechaInicio].getUTCFullYear(), valorArreglo[fechaInicio].getUTCMonth(), valorArreglo[fechaInicio].getUTCDate());
                                                                                                        valorArreglo[fechaInicio] = formatDateCreation(valorArreglo[fechaInicio]);
                                                                                                    } else {
                                                                                                        valorArreglo[fechaInicio] = '2001-01-01';
                                                                                                    }
                                                                                                } else {
                                                                                                    if(valorArreglo[fechaInicio] != undefined && valorArreglo[fechaInicio].length != 0 ) {
                                                                                                        valorArreglo[fechaInicio] = formatDateCreationString(valorArreglo[fechaInicio]);
                                                                                                    } else {
                                                                                                        valorArreglo[fechaInicio] = '2001-01-01';
                                                                                                    }
                                                                                                }
                                                                                            } else {
                                                                                                if(valorArreglo[fechaInicio] != undefined && valorArreglo[fechaInicio].length != 0 ) {
                                                                                                    valorArreglo[fechaInicio] = formatDateCreationString(valorArreglo[fechaInicio]);
                                                                                                } else {
                                                                                                    valorArreglo[fechaInicio] = '2001-01-01';
                                                                                                }
                                                                                            }
                                                                                            if (Object.prototype.toString.call(valorArreglo[fechaFinal]) === "[object Date]") {
                                                                                                if (!isNaN(valorArreglo[fechaFinal].getTime())) {
                                                                                                    if(valorArreglo[fechaFinal] != undefined && valorArreglo[fechaFinal].length != 0 ) {
                                                                                                        valorArreglo[fechaFinal] = new Date(valorArreglo[fechaFinal].getUTCFullYear(), valorArreglo[fechaFinal].getUTCMonth(), valorArreglo[fechaFinal].getUTCDate());
                                                                                                        valorArreglo[fechaFinal] = formatDateCreation(valorArreglo[fechaFinal]);
                                                                                                    } else {
                                                                                                        valorArreglo[fechaFinal] = '2001-01-01';
                                                                                                    }
                                                                                                } else {
                                                                                                    if(valorArreglo[fechaFinal] != undefined && valorArreglo[fechaFinal].length != 0 ) {
                                                                                                        valorArreglo[fechaFinal] = formatDateCreationString(valorArreglo[fechaFinal]);
                                                                                                    } else {
                                                                                                        valorArreglo[fechaFinal] = '2001-01-01';
                                                                                                    }
                                                                                                }
                                                                                            } else {
                                                                                                if(valorArreglo[fechaFinal] != undefined && valorArreglo[fechaFinal].length != 0 ) {
                                                                                                    valorArreglo[fechaFinal] = formatDateCreationString(valorArreglo[fechaFinal]);
                                                                                                } else {
                                                                                                    valorArreglo[fechaFinal] = '2001-01-01';
                                                                                                }
                                                                                            }
                                                                                            const transaction = new sql.Transaction( pool1 );
                                                                                            transaction.begin(err => {
                                                                                                var rolledBack = false;
                                                                                                transaction.on('rollback', aborted => {
                                                                                                    rolledBack = true;
                                                                                                });
                                                                                                const request = new sql.Request(transaction);
                                                                                                request.query("insert into ListasVariables (idLista, nombre, valor, saldo, fechaCreacion, fechaCaducidad, puesto) values ("+idLista+",'"+$.trim(valorArreglo[nombre])+"','"+$.trim(valorArreglo[cuenta])+"',0,'"+valorArreglo[fechaInicio]+"','"+valorArreglo[fechaFinal]+"','')", (err, result) => {
                                                                                                    if (err) {
                                                                                                        if (!rolledBack) {
                                                                                                            transaction.rollback(err => {
                                                                                                                contadorInserciones++;
                                                                                                                arregloErroresInsercion.push({b: nombre, c: "Error en inserción mssql"});
                                                                                                                printErrorFile();
                                                                                                            });
                                                                                                        }
                                                                                                    }  else {
                                                                                                        transaction.commit(err => {
                                                                                                            // ... error checks
                                                                                                            contadorInserciones++;
                                                                                                            insertoEnDBListas = true;
                                                                                                            printErrorFile();
                                                                                                        });
                                                                                                    }
                                                                                                });
                                                                                            }); // fin transaction
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Cuenta Contable: "+valorArreglo[fechaFinal], c: "El valor de fecha de final no es valido"});
                                                                                            contadorInserciones++;
                                                                                        }
                                                                                    } else {
                                                                                        arregloErroresInsercion.push({b: "Cuenta Contable: "+valorArreglo[fechaInicio], c: "El valor de fecha de inicio no es valido"});
                                                                                        contadorInserciones++;
                                                                                    }
                                                                                } else {
                                                                                    arregloErroresInsercion.push({b: "Cuenta Contable: "+valorArreglo[nombre], c: "El valor del nombre es mayor a 150 caracteres"});
                                                                                    contadorInserciones++;
                                                                                }
                                                                            } else {
                                                                                arregloErroresInsercion.push({b: "Cuenta Contable: "+valorArreglo[cuenta], c: "El valor de la cuenta es mayor a 50 caracteres"});
                                                                                contadorInserciones++;
                                                                            }
                                                                        };
                                                                        if(result.recordset.length == 0) {
                                                                            $(".loadingScreen").hide();
                                                                            stopTimer();
                                                                            $("body").overhang({
                                                                                type: "success",
                                                                                primary: "#40D47E",
                                                                                accent: "#27AE60",
                                                                                message: "No se encontrarón valores para importar.",
                                                                                duration: 1,
                                                                                overlay: true
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                            }); // fin pool connect
                                                        } else {
                                                            $("body").overhang({
                                                                type: "error",
                                                                primary: "#f84a1d",
                                                                accent: "#d94e2a",
                                                                message: "Error no existe lista de manual contable.",
                                                                overlay: true,
                                                                closeConfirm: true
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }); // fin transaction
                                    } else {
                                        $("body").overhang({
                                            type: "error",
                                            primary: "#f84a1d",
                                            accent: "#d94e2a",
                                            message: "Ingrese un valor para la fecha final.",
                                            overlay: true,
                                            closeConfirm: true
                                        });
                                    }
                                } else {
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Ingrese un valor para la fecha de inicio.",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                }
                            } else {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Ingrese un valor para el número de cuenta.",
                                    overlay: true,
                                    closeConfirm: true
                                });
                            }
                        } else {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "Ingrese un valor para el nombre de cuenta.",
                                overlay: true,
                                closeConfirm: true
                            });
                        }
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Ingrese un valor para el nombre de la tabla.",
                            overlay: true,
                            closeConfirm: true
                        });
                    }
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "Ingrese un valor para el nombre de la base de datos.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Ingrese un valor para el servidor de la base de datos.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese un valor para la contraseña de la base de datos.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Ingrese un valor para el usuario de la base de datos.",
            overlay: true,
            closeConfirm: true
        });
    }
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

$('#fechaCreacionManCon').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});
$('#fechaCaducidadManCon').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});

function createElementList () {
    var idLista = $('#elementosDeLista').val();
    var listaSeleccionada = arregloListas.filter(function(object) {
                        return object.ID == idLista;
                    });
	var nombre;
	var valor;
    var saldo = 0;
    var fechaCreacion, fechaCaducidad, puesto = '';
    /*if(saldo.length == 0)
        saldo = 0;*/
    var hoy = formatDateCreation( new Date() );
    var errorMessage = '';
    if(listaSeleccionada[0].tipo == 1 /*|| listaSeleccionada[0].tipo == 2*/) { // Manual Contable y Cuentas Op Balance Gen
        nombre = $("#elementoNombre").val();
        valor = $("#elementoValor").val();
        fechaCreacion = $('#fechaCreacionManCon').datepicker('getDate');
        fechaCaducidad = $('#fechaCaducidadManCon').datepicker('getDate');
    } else if(listaSeleccionada[0].tipo == 6) { // Cuentas Operativas
        nombre = $("#elementoNombre").val();
        valor = $("#elementoValor").val();
        //saldo = parseFloat($("#saldoCueOp").val());
        saldo = 0;
        puesto = $("#idClienteCueOp").val();
        fechaCreacion = new Date();
        fechaCaducidad = new Date();
        errorMessage = 'id de cliente';
    } else if(listaSeleccionada[0].tipo == 3) { // Exclusiones FOSEDE
        nombre = $("#elementoValor").val();
        valor = $("#elementoNombre").val();
        puesto = $("#elementoPuesto").val();
        fechaCreacion = new Date();
        fechaCaducidad = new Date();
        errorMessage = 'puesto';
    } else if(listaSeleccionada[0].tipo == 7) { // Agencia
        nombre = $("#elementoNombre").val();
        valor = '0';
        fechaCreacion = new Date();
        fechaCaducidad = new Date();
        errorMessage = 'agencia';
    } else {// Resto
        nombre = $("#elementoNombre").val();
        valor = $("#elementoValor").val();
        fechaCreacion = new Date();
        fechaCaducidad = new Date();
        errorMessage = 'lista';
    }
	if(idLista != null) {
        if(fechaCreacion.getTime() > 0) {
            if(fechaCaducidad.getTime() > 0) {
        		if(idLista.length > 0) {
        			if(nombre.length > 0 && nombre.length < 121){
        				if(valor.length > 0 && $.trim(valor).length < 51){
                            //if(!/\s/.test(valor)) {
                                if(saldo.toString().length > 0){
                                    if( (listaSeleccionada[0].tipo == 6 && $.trim(puesto).length>0) || (listaSeleccionada[0].tipo == 3 && $.trim(puesto).length>0) || listaSeleccionada[0].tipo == 1 || listaSeleccionada[0].tipo == 2 || listaSeleccionada[0].tipo == 4 || listaSeleccionada[0].tipo == 5 || listaSeleccionada[0].tipo == 7 || listaSeleccionada[0].tipo == 8 || listaSeleccionada[0].tipo == 9 || listaSeleccionada[0].tipo == 10) {
                                        if(!isNaN(saldo)) {
                        					const transaction = new sql.Transaction( pool1 );
                        				    transaction.begin(err => {
                        				        var rolledBack = false;
                        				        transaction.on('rollback', aborted => {
                        				            // emited with aborted === true
                        				            rolledBack = true;
                        				        });
                        				        const request = new sql.Request(transaction);
                        				        request.query("insert into ListasVariables (idLista, nombre, valor, saldo, fechaCreacion, fechaCaducidad, puesto) values ("+idLista+",'"+$.trim(nombre)+"','"+$.trim(valor)+"',"+saldo+",'"+formatDateCreation(fechaCreacion)+"','"+formatDateCreation(fechaCaducidad)+"','"+$.trim(puesto)+"')", (err, result) => {
                        				            if (err) {
                        				                if (!rolledBack) {
                        				                    transaction.rollback(err => {
                        				                        $("body").overhang({
                                                                    type: "error",
                                                                    primary: "#f84a1d",
                                                                    accent: "#d94e2a",
                                                                    message: "Error en inserción en la tabla de ListasVariables.",
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
                        									  	message: "Elemento de lista creada con éxito.",
                        									  	duration: 1,
                        									  	overlay: true
                        									});
                        									$("#elementoNombre").val('');
                        									$("#elementoValor").val('');
                                                            $("#idClienteCueOp").val('');
                                                            $("#elementoPuesto").val('');
                                                            $("#saldoCueOp").val('');
                        									loadListListsExcel();
                        				                });
                        				            }
                        				        });
                        				    }); // fin transaction
                                        } else {
                                            $("body").overhang({
                                                type: "error",
                                                primary: "#f84a1d",
                                                accent: "#d94e2a",
                                                message: "Ingrese un número válido para el saldo.",
                                                overlay: true,
                                                closeConfirm: true
                                            });
                                        }
                                    } else {
                                        $("body").overhang({
                                            type: "error",
                                            primary: "#f84a1d",
                                            accent: "#d94e2a",
                                            message: "Ingrese un valor válido para el "+errorMessage+".",
                                            overlay: true,
                                            closeConfirm: true
                                        });
                                    }
                                } else {
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Ingrese un valor para el saldo.",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                }
                            /*} else {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "El valor del elemento no puede contener espacios.",
                                    overlay: true,
                                    closeConfirm: true
                                });
                            }*/
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
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Ingrese una fecha de caducidad.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese una fecha de creación.",
                overlay: true,
                closeConfirm: true
            });
        }
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Cree una lista primero para agregar un elemento.",
		  	overlay: true,
            closeConfirm: true
		});
	}
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

$("input[name='listaRadio']").on('ifChanged', function(event){
    var valor = $("input[name='listaRadio']:checked").val();
    if (valor != undefined) {
        console.log(valor)
        if(valor == 1 /*|| valor == 2*/) {
            $('#labelNombreExcel').text("Columna de Nombre de Elemento");
            $('#labelCuentaExcel').text("Columna de Cuenta de Elemento");
            $('#labelFechaCreacionExcel').text("Columna de inicio de vigencia de Elemento");
            $('#labelFechaCaducidadExcel').text("Columna de fin de vigencia de Elemento");
            $("#nombreCuenta").attr("placeholder", "Nombre de Elemento");
            $("#numeroCuenta").attr("placeholder", "Cuenta de Elemento");
            $("#fechaCreacionModal").attr("placeholder", "Fecha de Creación");
            $("#fechaCaducidadModal").attr("placeholder", "Fecha de Caducidad");
            $('#saldoModalField').hide();
            $('#fechasModalField').show();
            $('#labelCuentaExcel').show();
            $("#nombreCuenta").val("");
            $("#numeroCuenta").val("");
            $("#numeroCuenta").show();
            $("#asteriskNum").show();
        } else if(valor == 6) {
            $('#labelNombreExcel').text("Columna de Nombre de Cliente");
            $('#labelCuentaExcel').text("Columna de # Cuenta de Cliente");
            $('#labelFechaCreacionExcel').text("Columna de ID de Cliente de Elemento");
            $('#labelFechaCaducidadExcel').text("Columna de Saldo de la cuenta del Elemento");
            $("#nombreCuenta").attr("placeholder", "Nombre de Elemento");
            $("#numeroCuenta").attr("placeholder", "Cuenta de Elemento");
            $("#fechaCreacionModal").attr("placeholder", "ID de Cliente");
            $("#fechaCaducidadModal").attr("placeholder", "Saldo de cuenta");
            $('#saldoModalField').hide();
            $('#fechasModalField').show();
            $('#labelCuentaExcel').show();
            $("#nombreCuenta").val("");
            $("#numeroCuenta").val("");
            $("#labelFechaCreacionExcel").val("");
            $("#labelFechaCaducidadExcel").val("");
            $("#numeroCuenta").show();
            $("#asteriskNum").show();
        } else if(valor == 3) {
            $('#labelNombreExcel').text("Columna de Nombre de Cliente");
            $('#labelCuentaExcel').text("Columna de ID de Cliente");
            $('#labelModalExcel').text("Columna de Nombre de puesto de la persona");
            $("#nombreCuenta").attr("placeholder", "Nombre de Cliente");
            $("#numeroCuenta").attr("placeholder", "ID de Cliente");
            $("#saldoCuenta").attr("placeholder", "Nombre de puesto");
            $('#fechasModalField').hide();
            $('#saldoModalField').show();
            $('#labelCuentaExcel').show();
            $("#nombreCuenta").val("");
            $("#numeroCuenta").val("");
            $("#saldoCuenta").val("");
            $("#numeroCuenta").show();
            $("#asteriskNum").show();
        } else if(valor == 7) {
            $('#labelNombreExcel').text("El nombre de la agencia");
            $('#labelCuentaExcel').hide();
            $("#numeroCuenta").hide();
            $('#fechasModalField').hide();
            $('#saldoModalField').hide();
            $("#nombreCuenta").val("");
            $("#asteriskNum").hide();
        } else {
            $('#labelNombreExcel').text("El nombre del elemento");
            $('#labelCuentaExcel').text("El valor a comparar en las tablas");
            $("#nombreCuenta").attr("placeholder", "Nombre del elemento");
            $("#numeroCuenta").attr("placeholder", "El valor del elemento");
            $('#fechasModalField').hide();
            $('#saldoModalField').hide();
            $('#labelCuentaExcel').show();
            $("#numeroCuenta").show();
            $("#asteriskNum").show();
        }
    }
});

var dialog = remote.dialog;

var fileExcel = null;
var arregloErroresExcel = [];
var arregloErroresInsercion = [];
var contadorInserciones = 0;
var totalInserciones = 0;
var insertoEnDBListas = false;

function selectFile () {
    var workbook = null;
    fileExcel = dialog.showOpenDialog({
        title: 'Seleccione un archivo',
        filters: [{
            name: "Spreadsheets",
            extensions: "xls|xlsx|xlsm|xlsb|csv".split("|")
        }],
        properties: ['openFile']
    });
    if(fileExcel != undefined && fileExcel.length > 0) {
        workbook = XLSX.readFile(fileExcel[0]);
        var content = '';
        for (var i = 0; i < workbook.SheetNames.length; i++) {
            if(i == 0)
                content+='<label> <input type="radio" class="flat" name="namesSheet" value="'+i+'" checked> &nbsp;'+ workbook.SheetNames[i] +' &nbsp;</label>';
            else
                content+='<label> <input type="radio" class="flat" name="namesSheet" value="'+i+'"> &nbsp;'+ workbook.SheetNames[i] +' &nbsp;</label>';
        };
        if(workbook.SheetNames.length == 0)
            content+='<label> No hay hojas creadas </label>';
        $(".nombreHojas").empty();
        $(".nombreHojas").append(content);
        $("#modalManual").modal("toggle");
    }/* else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Error al abrir archivo de excel.",
            overlay: true,
            closeConfirm: true
        });
    }*/
}

function getListID () {
    var valorTipoLista = $("input[name='listaRadio']:checked").val();
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from Listas where tipo = "+valorTipoLista, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de FOSEDE.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        importExcel(result.recordset[0].ID);
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "No existe en la base de datos el tipo de lista.",
                            overlay: true,
                            closeConfirm: true
                        });
                    }
                });
            }
        });
    }); // fin transaction
}

function importExcel (idLista) {
	var columnaNumero = $('#numeroCuenta').val();
	var columnaNombre = $('#nombreCuenta').val();
    var columnaSaldo = $('#saldoCuenta').val();
    var columnaFechaCreacion = $('#fechaCreacionModal').val();
    var columnaFechaCaducidad = $('#fechaCaducidadModal').val();
	var filaInicial = $('#filaInicial').val();
	var filaFinal = $('#filaFinal').val();
    var valorTipoLista = $("input[name='listaRadio']:checked").val();
    var textoTipoLista = '', textoTipoListaCuenta = '';
    if(valorTipoLista == 1) {
        textoTipoLista = 'los años de vigencia';
        textoTipoListaCuenta = 'número de cuenta';
    } else if(valorTipoLista == 6) {
        textoTipoLista = 'el saldo de cuenta';
        textoTipoListaCuenta = 'número de cuenta';
    } else if(valorTipoLista == 3) {
        textoTipoLista = 'el nombre del puesto';
        textoTipoListaCuenta = 'id de cliente';
    }
	if(columnaNumero.length > 0 || valorTipoLista == 7 ) {
		if( columnaNumero.length == 0 || isNaN(columnaNumero) ) {
            if( (valorTipoLista == 1 && columnaFechaCreacion.length>0) || (valorTipoLista == 6 && columnaFechaCreacion.length>0) || valorTipoLista == 3 || (valorTipoLista == 4) || (valorTipoLista == 5) || (valorTipoLista == 7) || (valorTipoLista == 8) || (valorTipoLista == 9) ) {
                if( (valorTipoLista == 1 && isNaN(columnaFechaCreacion)) || (valorTipoLista == 6 && isNaN(columnaFechaCreacion)) || valorTipoLista == 3 || (valorTipoLista == 4) || (valorTipoLista == 5) || (valorTipoLista == 7) || (valorTipoLista == 8) || (valorTipoLista == 9) ) {
                    if( (valorTipoLista == 1 && columnaFechaCaducidad.length>0) || valorTipoLista == 6 || valorTipoLista == 3 || (valorTipoLista == 4) || (valorTipoLista == 5) || (valorTipoLista == 7) || (valorTipoLista == 8) || (valorTipoLista == 9) ) {
                        if( (valorTipoLista == 1 && isNaN(columnaFechaCaducidad)) || valorTipoLista == 6 || valorTipoLista == 3 || (valorTipoLista == 4) || (valorTipoLista == 5) || (valorTipoLista == 7) || (valorTipoLista == 8) || (valorTipoLista == 9) ) {
            				if(columnaNombre.length > 0) {
            					if( isNaN(columnaNombre) ) {
                                    if( (valorTipoLista == 1) || (valorTipoLista == 6) || (valorTipoLista == 3 && columnaSaldo.length > 0) || (valorTipoLista == 4) || (valorTipoLista == 5) || (valorTipoLista == 7) || (valorTipoLista == 8) || (valorTipoLista == 9) ) {
                                        if( (valorTipoLista == 1) || (valorTipoLista == 6) || (valorTipoLista == 3 && isNaN(columnaSaldo)) || (valorTipoLista == 4) || (valorTipoLista == 5) || (valorTipoLista == 7) || (valorTipoLista == 8) || (valorTipoLista == 9) ) {
                    						if(filaInicial.length > 0) {
                    							if( !isNaN(filaInicial) ) {
                    								if(filaFinal.length == 0)
                    									filaFinal = 0;
                    								if( !isNaN(filaFinal) ) {
                    									var workbook;
                    									if(fileExcel.length > 0) {
                    										workbook = XLSX.readFile(fileExcel[0]);
                                                            var indiceNom = $("input[name='namesSheet']:checked").val();
                                                            var nombre = workbook.SheetNames[indiceNom];
                    										var sheet = workbook.Sheets[nombre];
                    										if(sheet != null) {
                                                                myInterval = setInterval(myTimer, 1000);
                                                                $( ".loadingScreen" ).fadeIn( "slow", function() {
                                                                });
                                                                var nombreLista;
                                                                var tipo;
                                                                if( $("#createListManual").is(':checked') ) {
                                                                    nombreLista = 'Manual Contable';
                                                                    tipo = 1;
                                                                } else if( $("#createListCuentas").is(':checked') ) {
                                                                    nombreLista = 'Cuentas Operativas de Clientes';
                                                                    tipo = 6;
                                                                } else if( $("#createListExclusiones").is(':checked') ){
                                                                    nombreLista = 'Exclusiones FOSEDE';
                                                                    tipo = 3;
                                                                } else if( $("#createListTipPersona").is(':checked') ) {
                                                                    nombreLista = 'Tipo de Personas';
                                                                    tipo = 4;
                                                                } else if( $("#createListTipSubPersona").is(':checked') ) {
                                                                    nombreLista = 'Tipo de Sub-Personas';
                                                                    tipo = 5;
                                                                } else if( $("#createAgencia").is(':checked') ) {
                                                                    nombreLista = 'Agencias';
                                                                    tipo = 7;
                                                                } else if( $("#createListTipCredito").is(':checked') ) {
                                                                    nombreLista = 'Tipos de Crédito';
                                                                    tipo = 8;
                                                                } else if( $("#createListTipDep").is(':checked') ) {
                                                                    nombreLista = 'Tipos de Depósito';
                                                                    tipo = 9;
                                                                }
                    											var arregloDeElementos = [];
                    											//var idLista = arregloListas.length+1;
                                                                if(columnaNumero.length>0)
                    											    columnaNumero = columnaNumero.toUpperCase();
                                                                if(columnaSaldo.length>0)
                                                                    columnaSaldo = columnaSaldo.toUpperCase();
                    											columnaNombre = columnaNombre.toUpperCase();
                                                                columnaFechaCreacion = columnaFechaCreacion.toUpperCase();
                                                                columnaFechaCaducidad = columnaFechaCaducidad.toUpperCase();
                    											filaInicial = parseInt(filaInicial);
                    											filaFinal = parseInt(filaFinal);
                                                                var hoy = formatDateCreation( new Date() );
                                                                arregloErroresExcel = [];
                                                                arregloErroresInsercion = [];
                                                                contadorInserciones = 0;
                                                                totalInserciones = 0;
                                                                insertoEnDBListas = false;
                    											if(filaFinal != 0){
                    												for (var i = filaInicial; i <= filaFinal; i++) {
                                                                        if(tipo == 3) {
                                                                            if(sheet[columnaNombre+i] != undefined && sheet[columnaNombre+i].v.length > 0 && sheet[columnaNumero+i] != undefined && (sheet[columnaNumero+i].v.length > 0 || sheet[columnaNumero+i].v.toString().length > 0) && sheet[columnaSaldo+i] != undefined && (sheet[columnaSaldo+i].v.length > 0 || sheet[columnaSaldo+i].v.toString().length > 0)) {
                            													var numeroCuenta = '';
                                                                                if(columnaNumero.length>0)
                                                                                    numeroCuenta = sheet[columnaNumero+i].v;
                            													var nombreCuenta = sheet[columnaNombre+i].v;
                                                                                if(columnaNumero.length>0)
                            													   numeroCuenta = numeroCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                            													nombreCuenta = nombreCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                            													nombreCuenta = nombreCuenta.toLowerCase();
                            													nombreCuenta = UpperCasefirst(nombreCuenta);
                                                                                var saldoCuenta = 0;
                                                                                var saldoPuesto = '';
                                                                                /*if(columnaSaldo.length>0 && !isNaN(sheet[columnaSaldo+i].v))
                                                                                    saldoCuenta = sheet[columnaSaldo+i].v;
                                                                                else */if(columnaSaldo.length>0 && isNaN(sheet[columnaSaldo+i].v))
                                                                                    saldoPuesto = sheet[columnaSaldo+i].v;
                            													if(nombreCuenta.length>0) {
                            														arregloDeElementos.push({idLista: idLista, nombre: nombreCuenta, valor: numeroCuenta, saldo: saldoCuenta, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: saldoPuesto});
                                                                                    totalInserciones++;
                                                                                }
                                                                            } else {
                                                                                if(sheet[columnaNombre+i] != undefined || sheet[columnaNumero+i] != undefined || sheet[columnaSaldo+i] != undefined) {
                                                                                    arregloErroresExcel.push(i);
                                                                                 }
                                                                            }
                                                                        } else if(tipo == 4 || tipo == 5 || tipo == 9 || tipo == 8) {
                                                                            if(sheet[columnaNombre+i] != undefined && sheet[columnaNombre+i].v.length > 0 && sheet[columnaNumero+i] != undefined && (sheet[columnaNumero+i].v.length > 0 || sheet[columnaNumero+i].v.toString().length > 0)) {
                                                                                var numeroCuenta = '';
                                                                                if(columnaNumero.length>0)
                                                                                    numeroCuenta = sheet[columnaNumero+i].v;
                                                                                var nombreCuenta = sheet[columnaNombre+i].v;
                                                                                if(columnaNumero.length>0)
                                                                                   numeroCuenta = numeroCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                nombreCuenta = nombreCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                nombreCuenta = nombreCuenta.toLowerCase();
                                                                                nombreCuenta = UpperCasefirst(nombreCuenta);
                                                                                if(nombreCuenta.length>0) {
                                                                                    arregloDeElementos.push({idLista: idLista, nombre: nombreCuenta, valor: numeroCuenta, saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                                                                                    totalInserciones++;
                                                                                }
                                                                            } else {
                                                                                if(sheet[columnaNombre+i] != undefined || sheet[columnaNumero+i] != undefined) {
                                                                                    arregloErroresExcel.push(i);
                                                                                 }
                                                                            }
                                                                        } else if(tipo == 7) {
                                                                            if(sheet[columnaNombre+i] != undefined && sheet[columnaNombre+i].v.length > 0) {
                                                                                var numeroCuenta = '';
                                                                                if(columnaNumero.length>0)
                                                                                    numeroCuenta = sheet[columnaNumero+i].v;
                                                                                var nombreCuenta = sheet[columnaNombre+i].v;
                                                                                if(columnaNumero.length>0)
                                                                                   numeroCuenta = numeroCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                nombreCuenta = nombreCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                nombreCuenta = nombreCuenta.toLowerCase();
                                                                                nombreCuenta = UpperCasefirst(nombreCuenta);
                                                                                if(nombreCuenta.length>0) {
                                                                                    arregloDeElementos.push({idLista: idLista, nombre: nombreCuenta, valor: numeroCuenta, saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                                                                                    totalInserciones++;
                                                                                }
                                                                            } else {
                                                                                if(sheet[columnaNombre+i] != undefined) {
                                                                                    arregloErroresExcel.push(i);
                                                                                 }
                                                                            }
                                                                        } else {
                                                                            if(sheet[columnaNombre+i] != undefined && sheet[columnaNombre+i].v.length > 0 && sheet[columnaNumero+i] != undefined && (sheet[columnaNumero+i].v.length > 0 || sheet[columnaNumero+i].v.toString().length > 0) && sheet[columnaFechaCreacion+i] != undefined && ((sheet[columnaFechaCreacion+i].w != undefined && sheet[columnaFechaCreacion+i].w.length > 0) || sheet[columnaFechaCreacion+i].v.length > 0) && sheet[columnaFechaCaducidad+i] != undefined && ((sheet[columnaFechaCaducidad+i].w != undefined && sheet[columnaFechaCaducidad+i].w.length > 0) || sheet[columnaFechaCaducidad+i].v.length > 0)) {
                                                                                var numeroCuenta = '';
                                                                                if(columnaNumero.length>0)
                                                                                    numeroCuenta = sheet[columnaNumero+i].v;
                                                                                var nombreCuenta = sheet[columnaNombre+i].v;
                                                                                if(columnaNumero.length>0)
                                                                                   numeroCuenta = numeroCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                nombreCuenta = nombreCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                nombreCuenta = nombreCuenta.toLowerCase();
                                                                                nombreCuenta = UpperCasefirst(nombreCuenta);
                                                                                var saldoCuenta = 0;
                                                                                var saldoPuesto = '';
                                                                                var fechaCreacion = '';
                                                                                var fechaCaducidad = '';
                                                                                if(tipo == 1) {
                                                                                    fechaCreacion = new Date(Date.parse(sheet[columnaFechaCreacion+i].w));
                                                                                    fechaCaducidad = new Date(Date.parse(sheet[columnaFechaCaducidad+i].w));
                                                                                } else {
                                                                                    fechaCreacion = new Date(hoy);
                                                                                    fechaCaducidad = new Date(hoy);
                                                                                }
                                                                                if(tipo == 2) {
                                                                                    saldoCuenta = sheet[columnaFechaCaducidad+i].v;
                                                                                    saldoPuesto = sheet[columnaFechaCreacion+i].v;
                                                                                    fechaCreacion = new Date(hoy);
                                                                                    fechaCaducidad = new Date(hoy);
                                                                                }
                                                                                if(nombreCuenta.length>0) {
                                                                                    arregloDeElementos.push({idLista: idLista, nombre: nombreCuenta, valor: numeroCuenta, saldo: saldoCuenta, fechaCreacion: formatDateCreation(fechaCreacion), fechaCaducidad: formatDateCreation(fechaCaducidad), puesto: saldoPuesto});
                                                                                    totalInserciones++;
                                                                                }
                                                                            } else {
                                                                                if(sheet[columnaNombre+i] != undefined || sheet[columnaNumero+i] != undefined || sheet[columnaFechaCreacion+i] != undefined || sheet[columnaFechaCaducidad+i] != undefined) {
                                                                                    arregloErroresExcel.push(i);
                                                                                }
                                                                            }
                                                                        }
                    												};
                    											} else {
                    												var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
                    												finalRow = parseInt(finalRow);
                    												for (var i = filaInicial; i <= finalRow; i++) {
                                                                        if(tipo == 3) {
                                                                            if(sheet[columnaNombre+i] != undefined && sheet[columnaNombre+i].v.length > 0 && sheet[columnaNumero+i] != undefined && (sheet[columnaNumero+i].v.length > 0 || sheet[columnaNumero+i].v.toString().length > 0) && sheet[columnaSaldo+i] != undefined && sheet[columnaSaldo+i].v.length > 0) {
                            													var numeroCuenta = '';
                                                                                if(columnaNumero.length>0)
                                                                                    numeroCuenta = sheet[columnaNumero+i].v;
                            													var nombreCuenta = sheet[columnaNombre+i].v;
                                                                                if(columnaNumero.length>0)
                            													   numeroCuenta = numeroCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                            													nombreCuenta = nombreCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                            													nombreCuenta = nombreCuenta.toLowerCase();
                            													nombreCuenta = UpperCasefirst(nombreCuenta);
                                                                                var saldoCuenta = 0;
                                                                                var saldoPuesto = '';
                                                                                /*if(columnaSaldo.length>0 && !isNaN(sheet[columnaSaldo+i].v))
                                                                                    saldoCuenta = sheet[columnaSaldo+i].v;
                                                                                else */if(columnaSaldo.length>0 && isNaN(sheet[columnaSaldo+i].v))
                                                                                    saldoPuesto = sheet[columnaSaldo+i].v;
                            													if(nombreCuenta.length>0) {
                            														arregloDeElementos.push({idLista: idLista, nombre: nombreCuenta, valor: numeroCuenta, saldo: saldoCuenta, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: saldoPuesto});
                                                                                    totalInserciones++;
                                                                                }
                                                                            } else {
                                                                                if(sheet[columnaNombre+i] != undefined  || sheet[columnaNumero+i] != undefined || sheet[columnaFechaCreacion+i] != undefined || sheet[columnaFechaCaducidad+i] != undefined) {
                                                                                    arregloErroresExcel.push(i);
                                                                                }
                                                                            }
                                                                        } else if(tipo == 4 || tipo == 5 || tipo == 9 || tipo == 8) {
                                                                            if(sheet[columnaNombre+i] != undefined && sheet[columnaNombre+i].v.length > 0 && sheet[columnaNumero+i] != undefined && (sheet[columnaNumero+i].v.length > 0 || sheet[columnaNumero+i].v.toString().length > 0)) {
                                                                                var numeroCuenta = '';
                                                                                var nombreCuenta = sheet[columnaNombre+i].v;
                                                                                nombreCuenta = nombreCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                nombreCuenta = nombreCuenta.toLowerCase();
                                                                                nombreCuenta = UpperCasefirst(nombreCuenta);
                                                                                if(nombreCuenta.length>0) {
                                                                                    arregloDeElementos.push({idLista: idLista, nombre: nombreCuenta, valor: numeroCuenta, saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                                                                                    totalInserciones++;
                                                                                }
                                                                            } else {
                                                                                if(sheet[columnaNombre+i] != undefined  || sheet[columnaNumero+i] != undefined) {
                                                                                    arregloErroresExcel.push(i);
                                                                                }
                                                                            }
                                                                        } else if(tipo == 7) {
                                                                            if(sheet[columnaNombre+i] != undefined && sheet[columnaNombre+i].v.length > 0) {
                                                                                var numeroCuenta = '';
                                                                                var nombreCuenta = sheet[columnaNombre+i].v;
                                                                                nombreCuenta = nombreCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                nombreCuenta = nombreCuenta.toLowerCase();
                                                                                nombreCuenta = UpperCasefirst(nombreCuenta);
                                                                                if(nombreCuenta.length>0) {
                                                                                    arregloDeElementos.push({idLista: idLista, nombre: nombreCuenta, valor: numeroCuenta, saldo: 0, fechaCreacion: hoy, fechaCaducidad: hoy, puesto: ''});
                                                                                    totalInserciones++;
                                                                                }
                                                                            } else {
                                                                                if(sheet[columnaNombre+i] != undefined) {
                                                                                    arregloErroresExcel.push(i);
                                                                                }
                                                                            }
                                                                        } else {
                                                                            if(sheet[columnaNombre+i] != undefined && sheet[columnaNombre+i].v.length > 0 && sheet[columnaNumero+i] != undefined && (sheet[columnaNumero+i].v.length > 0 || sheet[columnaNumero+i].v.toString().length > 0) && sheet[columnaFechaCreacion+i] != undefined && ((sheet[columnaFechaCreacion+i].w != undefined && sheet[columnaFechaCreacion+i].w.length > 0) || sheet[columnaFechaCreacion+i].v.length > 0) && sheet[columnaFechaCaducidad+i] != undefined && ((sheet[columnaFechaCaducidad+i].w != undefined && sheet[columnaFechaCaducidad+i].w.length > 0) || sheet[columnaFechaCaducidad+i].v.length > 0)) {
                                                                                var numeroCuenta = '';
                                                                                if(columnaNumero.length>0)
                                                                                    numeroCuenta = sheet[columnaNumero+i].v;
                                                                                var nombreCuenta = sheet[columnaNombre+i].v;
                                                                                if(columnaNumero.length>0)
                                                                                   numeroCuenta = numeroCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                nombreCuenta = nombreCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                nombreCuenta = nombreCuenta.toLowerCase();
                                                                                nombreCuenta = UpperCasefirst(nombreCuenta);
                                                                                var saldoCuenta = 0;
                                                                                var saldoPuesto = '';
                                                                                var fechaCreacion = '';
                                                                                var fechaCaducidad = '';
                                                                                if(tipo == 1) {
                                                                                    fechaCreacion = new Date(Date.parse(sheet[columnaFechaCreacion+i].w));
                                                                                    fechaCaducidad = new Date(Date.parse(sheet[columnaFechaCaducidad+i].w));
                                                                                } else {
                                                                                    fechaCreacion = new Date(hoy);
                                                                                    fechaCaducidad = new Date(hoy);
                                                                                }
                                                                                if(tipo == 2) {
                                                                                    saldoCuenta = sheet[columnaFechaCaducidad+i].v;
                                                                                    saldoPuesto = sheet[columnaFechaCreacion+i].v;
                                                                                }
                                                                                if(nombreCuenta.length>0) {
                                                                                    arregloDeElementos.push({idLista: idLista, nombre: nombreCuenta, valor: numeroCuenta, saldo: saldoCuenta, fechaCreacion: formatDateCreation(fechaCreacion), fechaCaducidad: formatDateCreation(fechaCaducidad), puesto: saldoPuesto});
                                                                                    totalInserciones++;
                                                                                }
                                                                            } else {
                                                                                if(sheet[columnaNombre+i] != undefined || sheet[columnaNumero+i] != undefined || sheet[columnaFechaCreacion+i] != undefined || sheet[columnaFechaCaducidad+i] != undefined) {
                                                                                    arregloErroresExcel.push(i);
                                                                                }
                                                                            }
                                                                        }
                    												};
                    											}
                                                                console.log('arregloDeElementos')
                                                                console.log(arregloDeElementos)
                    											modifyListExcel(tipo, function(ID) {
                    												for (var i = 0; i < arregloDeElementos.length; i++) {
                                                                        if(arregloDeElementos[i].nombre.length < 121) {
                                                                            if(arregloDeElementos[i].valor.length < 51) {
                                                                                createElementListExcel(ID, arregloDeElementos[i].nombre, arregloDeElementos[i].valor, arregloDeElementos[i].saldo, arregloDeElementos[i].fechaCreacion, arregloDeElementos[i].fechaCaducidad, arregloDeElementos[i].puesto);
                                                                            } else {
                                                                                arregloErroresInsercion.push({b: arregloDeElementos[i].valor, c: "El valor es mayor a 50 caracteres"});
                                                                            }
                                                                        } else {
                                                                            arregloErroresInsercion.push({b: arregloDeElementos[i].nombre, c: "El nombre es mayor a 120 caracteres"});
                                                                        }
                    												}
                    											}); /*Balance General*/
                                                                if(arregloDeElementos.length == 0)
                                                                    printErrorFile();
                    											$('#modalManual').modal('toggle');
                    										} else {
                    											$("body").overhang({
                    											  	type: "error",
                    											  	primary: "#f84a1d",
                    												accent: "#d94e2a",
                    											  	message: "Error al abrir hoja de excel.",
                    											  	overlay: true,
                                                                    closeConfirm: true
                    											});
                                                                $(".loadingScreen").hide();
                                                                stopTimer();
                    										}
                    									}
                    								} else {
                    									$("body").overhang({
                    									  	type: "error",
                    									  	primary: "#f84a1d",
                    										accent: "#d94e2a",
                    									  	message: "Ingrese un número de fila válido donde terminar de tomar las cuentas.",
                    									  	overlay: true,
                                                            closeConfirm: true
                    									});
                    								}
                    							} else {
                    								$("body").overhang({
                    								  	type: "error",
                    								  	primary: "#f84a1d",
                    									accent: "#d94e2a",
                    								  	message: "Ingrese un número de fila válido donde iniciar a tomar las cuentas.",
                    								  	overlay: true,
                                                        closeConfirm: true
                    								});
                    							}
                    						} else {
                    							$("body").overhang({
                    							  	type: "error",
                    							  	primary: "#f84a1d",
                    								accent: "#d94e2a",
                    							  	message: "Ingrese el número de fila donde iniciar a tomar las cuentas.",
                    							  	overlay: true,
                                                    closeConfirm: true
                    							});
                    						}
                                        } else {
                                            $("body").overhang({
                                                type: "error",
                                                primary: "#f84a1d",
                                                accent: "#d94e2a",
                                                message: "Ingrese una letra válida para "+textoTipoLista+" del elemento.",
                                                overlay: true,
                                                closeConfirm: true
                                            });
                                        }
                                    } else {
                                        $("body").overhang({
                                            type: "error",
                                            primary: "#f84a1d",
                                            accent: "#d94e2a",
                                            message: "Ingrese la columna para "+textoTipoLista+" del elemento.",
                                            overlay: true,
                                            closeConfirm: true
                                        });
                                    }
            					} else {
            						$("body").overhang({
            						  	type: "error",
            						  	primary: "#f84a1d",
            							accent: "#d94e2a",
            						  	message: "Ingrese una letra válida para la columna del nombre del elemento.",
            						  	overlay: true,
                                        closeConfirm: true
            						});
            					}
            				} else {
            					$("body").overhang({
            					  	type: "error",
            					  	primary: "#f84a1d",
            						accent: "#d94e2a",
            					  	message: "Ingrese la columna para el nombre del elemento.",
            					  	overlay: true,
                                    closeConfirm: true
            					});
            				}
                        } else {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "Ingrese una letra válida para la fecha de fin de vigencia del elemento.",
                                overlay: true,
                                closeConfirm: true
                            });
                        }
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Ingrese la columna para la fecha de fin de vigencia del elemento.",
                            overlay: true,
                            closeConfirm: true
                        });
                    }
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "Ingrese una letra válida para la fecha de inicio de vigencia del elemento.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Ingrese la columna para la fecha de inicio de vigencia del elemento.",
                    overlay: true,
                    closeConfirm: true
                });
            }
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "Ingrese una letra válida para la columna de "+textoTipoListaCuenta+" del elemento.",
			  	overlay: true,
                closeConfirm: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Ingrese la columna para el "+textoTipoListaCuenta+" del elemento.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function createListExcel (nombre, tipo, callback) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Listas (nombre, tipo) values ('"+$.trim(nombre)+"',"+tipo+")", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err)
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en crear lista "+$.trim(nombre)+".",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    callback();
                });
            }
        });
    }); // fin transaction
}

function modifyListExcel (tipo, callback) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select ID from Listas where tipo = "+tipo, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en modificar tabla lista.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset[0] != undefined)
                        callback(result.recordset[0].ID);
                    else {
                        var contentErrores='<div class="row" id="wrapper"> <label> Errores en: </label> </div> <ul><li style="float: left; padding: 0px 5px; margin: 0px 5px;">Fallo en inserción: no existe lista</li></ul></div>';
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: contentErrores,
                            html: true,
                            overlay: true,
                            closeConfirm: true
                        });
                        $(".loadingScreen").hide();
                        stopTimer();
                    }
                });
            }
        });
    }); // fin transaction
}

function createElementListExcel (idLista, nombre, valor, saldo, fechaCreacion, fechaCaducidad, puesto) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into ListasVariables (idLista, nombre, valor, saldo, fechaCreacion, fechaCaducidad, puesto) values ("+idLista+",'"+$.trim(nombre)+"','"+$.trim(valor)+"',"+saldo+",'"+fechaCreacion+"','"+fechaCaducidad+"','"+$.trim(puesto)+"')", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        contadorInserciones++;
                        arregloErroresInsercion.push({b: nombre, c: "Error en inserción mssql"});
                        printErrorFile();
                    });
                }
            }  else {
                transaction.commit(err => {
                    contadorInserciones++;
                    insertoEnDBListas = true;
                    printErrorFile();
                });
            }
        });
    }); // fin transaction
}

function cleanList (ID) {
    var ID = $("#elementosDeListaEdit").val();
    if(ID != undefined) {
        const transaction = new sql.Transaction( pool1 );
        transaction.begin(err => {
            var rolledBack = false;
            transaction.on('rollback', aborted => {
                // emited with aborted === true
                rolledBack = true;
            });
            const request = new sql.Request(transaction);
            request.query("delete from ListasVariables where idLista = "+ID, (err, result) => {
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
                } else {
                    transaction.commit(err => {
                        // ... error checks
                        loadLists();
                        $("body").overhang({
                            type: "success",
                            primary: "#40D47E",
                            accent: "#27AE60",
                            message: "Elementos eliminados con éxito.",
                            duration: 1,
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
            message: "Seleccione una lista primero.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function toColumnName(num) {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
}

function UpperCasefirst(string) {
    if(string.length>0)
        return string.charAt(0).toUpperCase() + string.slice(1);
    else
        return;
}

function printErrorFile () {
    if(contadorInserciones == totalInserciones){
        var altura = arregloErroresExcel.length+2;
        if(altura < arregloErroresInsercion.length+2)
            altura = arregloErroresInsercion.length+2;
        var workbook = {
            SheetNames : ["Errores"],
            Sheets: {
                "Errores": {
                    "!merges":[],
                    "!ref":"A1:C"+altura,
                    "!cols": []
                }
            }
        };
        workbook.Sheets.Errores["A1"] = {
            v: "Errores",
            t: 's',
            s: {
                font: {
                    color: {
                        rgb: 'ffffff'
                    },
                    bold: true,
                    sz : 20
                },
                fill: {
                    patternType: "solid",
                    bgColor: {
                        rgb: "689f38"
                    },
                    fgColor: {
                        rgb: "689f38"
                    }
                },
                alignment: {
                    horizontal: "center"
                }
            }
        };
        workbook.Sheets.Errores["A2"] = {
            v: "Filas en Excel",
            t: 's',
            s: {
                font: {
                    color: {
                        rgb: 'ffffff'
                    },
                    bold: true,
                    sz : 16
                },
                fill: {
                    patternType: "solid",
                    bgColor: {
                        rgb: "7395bb"
                    },
                    fgColor: {
                        rgb: "7395bb"
                    }
                },
                alignment: {
                    horizontal: "center"
                }
            }
        };
        workbook.Sheets.Errores["B2"] = {
            v: "Errores de inserción",
            t: 's',
            s: {
                font: {
                    color: {
                        rgb: 'ffffff'
                    },
                    bold: true,
                    sz : 16
                },
                fill: {
                    patternType: "solid",
                    bgColor: {
                        rgb: "7395bb"
                    },
                    fgColor: {
                        rgb: "7395bb"
                    }
                },
                alignment: {
                    horizontal: "center"
                }
            }
        };
        workbook.Sheets.Errores["C2"] = {
            v: "Descripción",
            t: 's',
            s: {
                font: {
                    color: {
                        rgb: 'ffffff'
                    },
                    bold: true,
                    sz : 16
                },
                fill: {
                    patternType: "solid",
                    bgColor: {
                        rgb: "7395bb"
                    },
                    fgColor: {
                        rgb: "7395bb"
                    }
                },
                alignment: {
                    horizontal: "center"
                }
            }
        };
        workbook.Sheets.Errores["!merges"].push({s:{r:0,c:0},e:{r:0,c:2}});
        for (var i = 0; i < arregloErroresExcel.length; i++) {
            workbook.Sheets.Errores["A"+(i+3)] = {
                v: arregloErroresExcel[i],
                t: 's',
                s: {
                    font: {
                        color: {
                            rgb: '000000'
                        },
                        bold: false,
                        sz : 14
                    },
                    alignment: {
                        horizontal: "center"
                    }
                }
            };
        };
        for (var i = 0; i < arregloErroresInsercion.length; i++) {
            workbook.Sheets.Errores["B"+(i+3)] = {
                v: arregloErroresInsercion[i].b,
                t: 's',
                s: {
                    font: {
                        color: {
                            rgb: '000000'
                        },
                        bold: false,
                        sz : 14
                    },
                    alignment: {
                        horizontal: "center"
                    }
                }
            };
            workbook.Sheets.Errores["C"+(i+3)] = {
                v: arregloErroresInsercion[i].c,
                t: 's',
                s: {
                    font: {
                        color: {
                            rgb: '000000'
                        },
                        bold: false,
                        sz : 14
                    },
                    alignment: {
                        horizontal: "center"
                    }
                }
            };
        };
        workbook.Sheets.Errores["!cols"].push({ wpx: 110 });
        workbook.Sheets.Errores["!cols"].push({ wpx: 450 });
        workbook.Sheets.Errores["!cols"].push({ wpx: 250 });
        if(arregloErroresExcel.length > 0 || arregloErroresInsercion.length > 0) {
            var wbout = XLSX.write(workbook, {bookType:'xlsx', bookSST:false, type: 'binary'});
            XLSX.writeFile(workbook, "ErroresImportacionExcel.xlsx");
            var content = '<div class="row" id="wrapper"> Archivo de error de importaciones creado en directorio del ejecutable del programa. </div>';
            var type = 'error';
            $(".loadingScreen").hide();
            stopTimer();
            /*$("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Archivo de error de importaciones creado en directorio del ejecutable del programa.",
                overlay: true,
                closeConfirm: true
            });*/
            if(insertoEnDBListas) {
                content += '<div class="row" id="wrapper"> Se importarón ciertos elementos con éxito. </div>';
                type = 'success';
            }
            $("body").overhang({
                type: type,
                primary: "#40D47E",
                accent: "#27AE60",
                message: content,
                html: true,
                overlay: true,
                closeConfirm: true
            });
            loadListListsExcel();
        } else if(insertoEnDBListas) {
            $(".loadingScreen").hide();
            stopTimer();
            $("body").overhang({
                type: "success",
                primary: "#40D47E",
                accent: "#27AE60",
                message: "Importación con éxito.",
                duration: 1,
                overlay: true
            });
            loadListListsExcel();
        } else {
            $(".loadingScreen").hide();
            stopTimer();
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Error, no se importo ningún valor.",
                overlay: true,
                closeConfirm: true
            });
        }
    }
}

//	**********		Fin Manual Contable y Listas		**********





//	**********		Tasa de Cambio		**********
function showDollar () {
    $("#dollarInput").show();
	$("#lempiraInput").hide();
    $("#euroInput").hide();
    $("#dollarInput").val("");
    $("#lempiraInput").val("");
    $("#euroInput").val("");
	//$("#lempiraInputCambio").show();
	//$("#dollarInputCambio").hide();
	//$("#lempiraRadio").prop("checked", true);
    $("#lempiraInputCambio").val("");
	$("#lempiraInputCambio").prop('disabled', false);
    loadTextFOSEDE();
}

function showLempira () {
    $("#dollarInput").hide();
	$("#lempiraInput").show();
    $("#euroInput").hide();
    $("#dollarInput").val("");
    $("#lempiraInput").val("");
    $("#euroInput").val("");
	//$("#lempiraInputCambio").hide();
	//$("#dollarInputCambio").show();
	//$("#dollarRadio").prop("checked", true);
    $("#lempiraInputCambio").val("");
	$("#lempiraInputCambio").prop('disabled', true);
    loadTextFOSEDE();
}

function showEuro () {
    $("#dollarInput").hide();
    $("#lempiraInput").hide();
    $("#euroInput").show();
    $("#dollarInput").val("");
    $("#lempiraInput").val("");
    $("#euroInput").val("");
    //$("#lempiraInputCambio").hide();
    //$("#dollarInputCambio").show();
    //$("#dollarRadio").prop("checked", true);
    $("#lempiraInputCambio").val("");
    $("#lempiraInputCambio").prop('disabled', false);
    loadTextFOSEDE();
}

function calculateRateChange () {
	if($("#dollarInput").val().length > 0 || $("#lempiraInput").val().length > 0 || $("#euroInput").val().length > 0){
        if( ($("#dollarInput").val().length > 0 && $("#lempiraInputCambio").val().length > 0) || ($("#euroInput").val().length > 0 && $("#lempiraInputCambio").val().length > 0) || $("#lempiraInput").val().length > 0 ) {
    		var prefix, tasa, montoF;
    		if( $('#dollarInputRadio').is(':checked') || $('#euroInputRadio').is(':checked') ) {
    			prefix = 'L ';
                if($('#dollarInputRadio').is(':checked') )
                    montoF = parseFloat($("#dollarInput").val().split(" ")[1].replace(/,/g,""));
                else
                    montoF = parseFloat($("#euroInput").val().split(" ")[1].replace(/,/g,""));
    			tasa = parseFloat($("#lempiraInputCambio").val().split(" ")[1].replace(/,/g,""));
    		} else {
    			prefix = 'L ';
    			montoF = parseFloat($("#lempiraInput").val().split(" ")[1].replace(/,/g,""));
    			tasa = 1;
    		}
    		var total = math.multiply(math.bignumber(montoF), math.bignumber(tasa));
    		total = math.round(total, 2);
    		$("#totalTasaCambio").text(prefix+total);
    		$("#totalTasaCambio").digits();
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese un valor para la tasa de cambio.",
                overlay: true,
                closeConfirm: true
            });
        }
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Ingrese un valor en el campo ingresar monto.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

$.fn.digits = function(){ 
    return this.each(function(){ 
        $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") ); 
    })
}

function verifyAndSaveFOSEDE () {
    //if($("#dollarInput").val().length > 0 || $("#lempiraInput").val().length > 0 || $("#euroInput").val().length > 0){
        //if( ($("#dollarInput").val().length > 0 && $("#lempiraInputCambio").val().length > 0) || ($("#euroInput").val().length > 0 && $("#lempiraInputCambio").val().length > 0) || $("#lempiraInput").val().length > 0 ) {
    var textoFOSEDE, idSeleccionado = $("#fosedeUpdate").val(), fosedeExiste = [];
    if(!isNaN(montoFosedeGlobal))
        textoFOSEDE = '0.00';
    else if(isNaN(montoFosedeGlobal)) {
        fosedeExiste = montoFosedeGlobal.filter(function(object) {
                        return object.ID == idSeleccionado;
                    });
        if(fosedeExiste.length > 0)
            textoFOSEDE = fosedeExiste[0].montoFosede.toString();
        else
            textoFOSEDE = '0.00';
    }
    var simbolo = $("#simboloMoneda").val();
    var moneda = $("#nombreMoneda").val();
    if($("#lempiraInput").val().length > 0) {
        if(simbolo.length > 0) {
            if( !/\./.test(simbolo) ) {
                if(moneda.length > 0) {
                    var montoF;
                    montoF = parseFloat($("#lempiraInput").val().split(" ")[1].replace(/,/g,""));
                    console.log(montoF)
                    if( montoF > 0){
                        var nuevoFosede = montoF.toString();
                        $("body").overhang({
                            type: "confirm",
                            primary: "#f5a433",
                            accent: "#dc9430",
                            yesColor: "#3498DB",
                            message: 'Esta seguro que desea modificar el monto FOSEDE de '+textoFOSEDE.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+' a '+nuevoFosede.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+'?',
                            overlay: true,
                            yesMessage: "Modificar",
                            noMessage: "Cancelar",
                            callback: function (value) {
                                if(value){
                                    /*var fosedeExiste = [];
                                    if(isNaN(montoFosedeGlobal))
                                        fosedeExiste = montoFosedeGlobal.filter(function(object) {
                                            return object.ID == idSeleccionado;
                                        });*/
                                    if(fosedeExiste.length == 0) {
                                        createFOSEDEVariablesDB(simbolo, moneda, montoF);

                                    } else if(isNaN(montoFosedeGlobal)) {
                                        updateFOSEDEVariablesDB(simbolo, moneda, montoF, fosedeExiste[0].ID);
                                    }
                                }
                            }
                        });
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "El monto FOSEDE no puede ser igual a 0.",
                            overlay: true,
                            closeConfirm: true
                        });
                    }
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "Ingrese un nombre para la moneda menor a 71 caracteres.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "El simbolo no puede llevar un punto.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese un simbolo para la moneda menor a 6 caracteres.",
                overlay: true,
                closeConfirm: true
            });
        }
        /*} else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese un valor para la tasa de cambio.",
                overlay: true,
                closeConfirm: true
            });
        }*/
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Ingrese un valor en el campo ingresar monto.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function createFOSEDEVariablesDB (simbolo, moneda, montoFosede) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into FOSEDE (simbolo, moneda, montoFosede) values ('"+simbolo+"', '"+moneda+"', "+montoFosede+")", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en inserción de monto FOSEDE.",
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
                    loadFosede();
                });
            }
        });
    }); // fin transaction
}

function updateFOSEDEVariablesDB (monedaNombre, simbolo, montoFosede, id) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("update FOSEDE set moneda = '"+monedaNombre+"', simbolo = '"+simbolo+"', montoFosede = "+montoFosede+" where ID = "+id, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err);
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en modificación de monto FOSEDE.",
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
                    loadFosede();
                });
            }
        });
    }); // fin transaction
}
//	**********		Fin Tasa de Cambio		**********











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
    $("#app_root").load("src/reportes.html");
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

var cleanup = function () {
    delete window.electron;
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
    delete window.cleanup;
};