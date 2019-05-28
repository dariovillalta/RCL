const electron = require('electron');
const remote = require('electron').remote;
const sql = require('mssql');
const md5 = require('js-md5');

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
	if(err) {
		$("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Error en conección con la base de datos.",
            overlay: true,
            closeConfirm: true
        });
	} else{
		console.log('pool loaded');
		loadUsers();
		loadPolicies();
		loadVariablesIMG();
	}
});

var session = remote.session;

session.defaultSession.cookies.get({}, (error, cookies) => {
	var permisosVariables = false;
	for (var i = 0; i < cookies.length; i++) {
		if(cookies[i].name == "name"){
			$("#nameUser").text(cookies[i].value);
			$("#navbar_name").text(cookies[i].value);
		} else if(cookies[i].name == "formula"){
			if(cookies[i].value == "1")
				permisosVariables = true;
		} else if(cookies[i].name == "fosede"){
			if(cookies[i].value == "1")
				permisosVariables = true;
		}else if(cookies[i].name == "usuarios"){
			if(cookies[i].value == "0")
				$("#userLabel").hide();
		}
	};
	if(!permisosVariables)
		$("#varLabel").hide();
});

/* ****************** 		LOADING IMG 	********* */
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
                    		/*$("#fullLogo").css("display","block");
                    		$("#fullLogo").css("margin-left","auto");
                    		$("#fullLogo").css("margin-right","auto");*/
                    	} else
                    		filepathFullLogo = '';
                    	if(result.recordset[0].smallLogo.length > 0){
                    		filepathSmallLogo = result.recordset[0].smallLogo;
                    		$("#smallLogo").attr("src",filepathSmallLogo);
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
/* ****************** 		END LOADING IMG 	********* */

//	**********		Users		**********
function resetUsers () {
	$("#name").val("");
	$("#lastname").val("");
	$("#username").val("");
	$("#password").val("");
	changeSwitchery($('#formulaIsChecked'), true);
	changeSwitchery($('#fosedeIsChecked'), true);
	changeSwitchery($('#usuariosIsChecked'), true);
}

function createUser () {
	var firstname = $("#name").val();
	var lastname = $("#lastname").val();
	var username = $("#username").val();
	var password = $("#password").val();
	var formulaPermiso;
	if($("#formulaIsChecked").is(':checked'))
		formulaPermiso = '1';
	else
		formulaPermiso = '0';
	var fosedePermiso;
	if($("#fosedeIsChecked").is(':checked'))
		fosedePermiso = '1';
	else
		fosedePermiso = '0';
	var usuariosPermiso;
	if($("#usuariosIsChecked").is(':checked'))
		usuariosPermiso = '1';
	else
		usuariosPermiso = '0';
	var fechaPass = formatDateCreation( new Date() );
	if( minLengthValidation(password) ){
		if( specialCharacValidation(password) ){
			if( minUpperCaseValidation(password) ){
				if( minLowerCaseValidation(password) ){
					if( minSpecialCharacValidation(password) ){
						if( minNumberValidation(password) ){
							//if( minNumberValidation(password) ){
								const transaction = new sql.Transaction( pool1 );
							    transaction.begin(err => {
							        var rolledBack = false;
							        transaction.on('rollback', aborted => {
							            // emited with aborted === true
							            rolledBack = true;
							        });
							        const request = new sql.Request(transaction);
							        request.query("insert into Usuarios (Nombre, Apellido, Usuario, Contrasena, formulaPermiso, fosedePermiso, usuariosPermiso, cambioPass) values ('"+firstname+"','"+lastname+"','"+username+"','"+md5(password)+"','"+formulaPermiso+"','"+fosedePermiso+"','"+usuariosPermiso+"','"+fechaPass+"')", (err, result) => {
							            if (err) {
							                if (!rolledBack) {
							                    transaction.rollback(err => {
							                        $("body").overhang({
											            type: "error",
											            primary: "#f84a1d",
											            accent: "#d94e2a",
											            message: "Error en inserción en la tabla de Usuarios.",
											            overlay: true,
											            closeConfirm: true
											        });
							                    });
							                }
							            }  else {
							                transaction.commit(err => {
							                    // ... error checks
							                    loadUsers();
							                    $("body").overhang({
												  	type: "success",
												  	primary: "#40D47E",
									  				accent: "#27AE60",
												  	message: "Usuario creado con éxito.",
												  	duration: 2,
												  	overlay: true
												});
							                });
							            }
							        });
							    }); // fin transaction
							/*} else{
								$("body").overhang({
								  	type: "error",
								  	primary: "#f84a1d",
									accent: "#d94e2a",
								  	message: "Contraseña no cumple política de mínimo de números.",
								  	duration: 2,
								  	overlay: true
								});
							}*/
						} else{
							$("body").overhang({
							  	type: "error",
							  	primary: "#f84a1d",
								accent: "#d94e2a",
							  	message: "Contraseña no cumple política de mínimo de números.",
							  	duration: 2,
							  	overlay: true,
                            	closeConfirm: true
							});
						}
					} else{
						$("body").overhang({
						  	type: "error",
						  	primary: "#f84a1d",
							accent: "#d94e2a",
						  	message: "Contraseña no cumple política de mínimo de caracteres especiales.",
						  	duration: 2,
						  	overlay: true,
                            closeConfirm: true
						});
					}
				} else{
					$("body").overhang({
					  	type: "error",
					  	primary: "#f84a1d",
						accent: "#d94e2a",
					  	message: "Contraseña no cumple política de letras minúsculas.",
					  	duration: 2,
					  	overlay: true,
                        closeConfirm: true
					});
				}
			} else{
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "Contraseña no cumple política de letras mayúsculas.",
				  	duration: 2,
				  	overlay: true,
                    closeConfirm: true
				});
			}
		} else{
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "Contraseña no cumple política de caracteres especiales.",
			  	duration: 2,
			  	overlay: true,
                closeConfirm: true
			});
		}
	} else{
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Contraseña no cumple política de longitud.",
		  	duration: 2,
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function minLengthValidation (password) {
	return password.length >= politicas.longitudMin;
}
function specialCharacValidation (password) {
	console.log(password);
	if(politicas.carEspeciales == '0'){
		var letraNormal = new RegExp('^[a-zA-Z0-9]*$');
		return letraNormal.test(password);
	} else
		return true;
}
function minUpperCaseValidation (password) {
	var numUpperCase = password.length - password.replace(/[A-Z]/g, '').length;
	return numUpperCase >= politicas.minMay;
}
function minLowerCaseValidation (password) {
	var numLowerCase = password.length - password.replace(/[a-z]/g, '').length;
	return numLowerCase >= politicas.minMin;
}
function minSpecialCharacValidation (password) {
	var numSpecialChar = password.length - password.replace(/[!@#$%^&*(),.?":{}|<>]*/g, '').length;
	return numSpecialChar >= politicas.minCarEspeciales;
}
function minNumberValidation (password) {
	var numMinNumber = password.length - password.replace(/[0-9]/g, '').length;
	return numMinNumber >= politicas.minNum;
}
function daysValidation (password) {
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
//	**********		Fin Users		**********

//	**********		Users Table		**********
var arregloUsuarios = [];
var userListClicked;
function loadUsers () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Usuarios", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de Usuarios.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                    	arregloUsuarios = result.recordset;
                    	loadTable();
                    } else {
                    	arregloUsuarios = [];
                    	loadTable();
                    }
                });
            }
        });
    }); // fin transaction
}

function loadTable () {
	if ( $.fn.dataTable.isDataTable( '#datatable_usuarios' ) )
		$("#datatable_usuarios").dataTable().fnDestroy();
	var table = $('#datatable_usuarios').DataTable({
		"data": arregloUsuarios,
		dom: "Blfrtip",
	  	buttons: [
			{
			  extend: "copy",
			  text: "Copiar",
			  className: "btn-sm"
			},
			{
			  extend: "csv",
			  className: "btn-sm"
			}
		],
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
	        { "data": "Nombre" },
	        { "data": "Apellido" },
	        { "data": "Usuario" },
	        { "data": "formulaPermiso" },
	        { "data": "fosedePermiso" },
	        { "data": "usuariosPermiso" },
	        { "data": "Modificar" },
	        { "data": "Eliminar" }
	    ],
	    "columnDefs": [ {
	        "targets": -1,
	        "defaultContent": '<button type="button" class="btn btn-danger buttonTableUserDele"><span class="glyphicon glyphicon-trash"></span></button>',
	        "className": "text-center"
	    },{
	        "targets": -2,
	        "defaultContent": '<button type="button" class="btn btn-success buttonTableUserEdit" data-toggle="modal" href="#modalUpdate"><span class="glyphicon glyphicon-pencil"></span></button>',
	        "className": "text-center"
	    },
	    {
		      "targets": 0, // your case first column
		      "className": "text-center"
		},
	    {
		      "targets": 1, // your case first column
		      "className": "text-center"
		},
	    {
		      "targets": 2, // your case first column
		      "className": "text-center"
		},
	    {
		      "targets": 3, // your case first column
		      "className": "text-center"
		},
	    {
		      "targets": 4, // your case first column
		      "className": "text-center"
		},
	    {
		      "targets": 5, // your case first column
		      "className": "text-center"
		},
	    {
		      "targets": 6, // your case first column
		      "className": "text-center"
		}],
	    keys: true
	});

	$( "#datatable_usuarios tbody").unbind( "click" );
	$('#datatable_usuarios tbody').on( 'click', 'button.buttonTableUserEdit', function () {
	    var data = table.row( $(this).parents('tr') ).data();
	    $("#nameEdit").val(data.Nombre);
		$("#lastnameEdit").val(data.Apellido);
		$("#usernameEdit").val(data.Usuario);
		var mostrarSpanFormula;
		if(data.formulaPermiso == '1')
			mostrarSpanFormula = true;
		else
			mostrarSpanFormula = false;
		$("#formulaSpanEdit").toggle(mostrarSpanFormula);
	  	$("#formulaNoSpanEdit").toggle(!mostrarSpanFormula);
	  	changeSwitchery($('#formulaIsCheckedEdit'), mostrarSpanFormula);
	  	var mostrarSpanFosede;
		if(data.fosedePermiso == '1')
			mostrarSpanFosede = true;
		else
			mostrarSpanFosede = false;
		$("#fosedeSpanEdit").toggle(mostrarSpanFosede);
	  	$("#fosedeNoSpanEdit").toggle(!mostrarSpanFosede);
		changeSwitchery($('#fosedeIsCheckedEdit'), mostrarSpanFosede);
		var mostrarSpanUsuarios;
		if(data.usuariosPermiso == '1')
			mostrarSpanUsuarios = true;
		else
			mostrarSpanUsuarios = false;
		$("#usuariosSpanEdit").toggle(mostrarSpanUsuarios);
	  	$("#usuariosNoSpanEdit").toggle(!mostrarSpanUsuarios);
		changeSwitchery($('#usuariosIsCheckedEdit'), mostrarSpanUsuarios);
		userListClicked = data;
	} );
	$('#datatable_usuarios tbody').on( 'click', 'button.buttonTableUserDele', function () {
	    var data = table.row( $(this).parents('tr') ).data();
	    userListClicked = data;

	    $("body").overhang({
		  	type: "confirm",
		  	primary: "#f5a433",
		  	accent: "#dc9430",
		  	yesColor: "#3498DB",
		  	message: 'Esta seguro que desea eliminar el usuario '+data.Nombre+'?',
		  	overlay: true,
		  	yesMessage: "Borrar",
		  	noMessage: "Cancelar",
		  	callback: function (value) {
		    	if(value)
		    		deleteUser();
		  	}
		});
	} );
}

function showConfirmModalUpdate () {
	$("body").overhang({
	  	type: "confirm",
	  	primary: "#f5a433",
	  	accent: "#dc9430",
	  	yesColor: "#3498DB",
	  	message: 'Esta seguro que desea aplicar los cambios al usuario '+userListClicked.Nombre+'?',
	  	overlay: true,
	  	yesMessage: "Aplicar",
	  	noMessage: "Cancelar",
	  	callback: function (value) {
	    	if(value)
	    		updateUser();
	  	}
	});
}

function updateUser () {
	var firstname = $("#nameEdit").val();
	var lastname = $("#lastnameEdit").val();
	var username = $("#usernameEdit").val();
	var password = $("#passwordEdit").val();
	var formulaPermiso;
	if($("#formulaIsCheckedEdit").is(':checked'))
		formulaPermiso = '1';
	else
		formulaPermiso = '0';
	var fosedePermiso;
	if($("#fosedeIsCheckedEdit").is(':checked'))
		fosedePermiso = '1';
	else
		fosedePermiso = '0';
	var usuariosPermiso;
	if($("#usuariosIsCheckedEdit").is(':checked'))
		usuariosPermiso = '1';
	else
		usuariosPermiso = '0';
	var fechaPass = formatDateCreation( new Date() );
	if( password.length>0 ) {
		if( minLengthValidation(password) ){
			if( specialCharacValidation(password) ){
				if( minUpperCaseValidation(password) ){
					if( minLowerCaseValidation(password) ){
						if( minSpecialCharacValidation(password) ){
							if( minNumberValidation(password) ){
								//if( minNumberValidation(password) ){
									const transaction = new sql.Transaction( pool1 );
								    transaction.begin(err => {
								        var rolledBack = false;
								        transaction.on('rollback', aborted => {
								            // emited with aborted === true
								            rolledBack = true;
								        });
								        const request = new sql.Request(transaction);
								        request.query("update Usuarios set Nombre = '"+firstname+"', Apellido = '"+lastname+"', Usuario = '"+username+"', Contrasena = '"+md5(password)+"', formulaPermiso = '"+formulaPermiso+"', fosedePermiso = '"+fosedePermiso+"', usuariosPermiso = '"+usuariosPermiso+"', cambioPass = '"+fechaPass+"' where ID = '"+userListClicked.ID+"' ", (err, result) => {
								            if (err) {
								                if (!rolledBack) {
								                    transaction.rollback(err => {
								                        $("body").overhang({
												            type: "error",
												            primary: "#f84a1d",
												            accent: "#d94e2a",
												            message: "Error en modificación en la tabla de Usuarios.",
												            overlay: true,
												            closeConfirm: true
												        });
								                    });
								                }
								            }  else {
								                transaction.commit(err => {
								                    // ... error checks
								                    loadUsers();
								                    $("body").overhang({
													  	type: "success",
													  	primary: "#40D47E",
										  				accent: "#27AE60",
													  	message: "Usuario modificado con éxito.",
													  	duration: 2,
													  	overlay: true
													});
								                    $('#modalUpdate').modal('toggle');
								                });
								            }
								        });
								    }); // fin transaction
								/*} else{
									$("body").overhang({
									  	type: "error",
									  	primary: "#f84a1d",
										accent: "#d94e2a",
									  	message: "Contraseña no cumple política de mínimo de números.",
									  	duration: 2,
									  	overlay: true
									});
								}*/
							} else{
								$("body").overhang({
								  	type: "error",
								  	primary: "#f84a1d",
									accent: "#d94e2a",
								  	message: "Contraseña no cumple política de mínimo de números.",
								  	duration: 2,
								  	overlay: true,
                            		closeConfirm: true
								});
							}
						} else{
							$("body").overhang({
							  	type: "error",
							  	primary: "#f84a1d",
								accent: "#d94e2a",
							  	message: "Contraseña no cumple política de mínimo de caracteres especiales.",
							  	duration: 2,
							  	overlay: true,
                            	closeConfirm: true
							});
						}
					} else{
						$("body").overhang({
						  	type: "error",
						  	primary: "#f84a1d",
							accent: "#d94e2a",
						  	message: "Contraseña no cumple política de letras minúsculas.",
						  	duration: 2,
						  	overlay: true,
                            closeConfirm: true
						});
					}
				} else{
					$("body").overhang({
					  	type: "error",
					  	primary: "#f84a1d",
						accent: "#d94e2a",
					  	message: "Contraseña no cumple política de letras mayúsculas.",
					  	duration: 2,
					  	overlay: true,
                        closeConfirm: true
					});
				}
			} else{
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "Contraseña no cumple política de caracteres especiales.",
				  	duration: 2,
				  	overlay: true,
                    closeConfirm: true
				});
			}
		} else{
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "Contraseña no cumple política de longitud.",
			  	duration: 2,
			  	overlay: true,
                closeConfirm: true
			});
		}
	} else{
		const transaction = new sql.Transaction( pool1 );
	    transaction.begin(err => {
	        var rolledBack = false;
	        transaction.on('rollback', aborted => {
	            // emited with aborted === true
	            rolledBack = true;
	        });
	        const request = new sql.Request(transaction);
	        request.query("update Usuarios set Nombre = '"+firstname+"', Apellido = '"+lastname+"', Usuario = '"+username+"', formulaPermiso = '"+formulaPermiso+"', fosedePermiso = '"+fosedePermiso+"', usuariosPermiso = '"+usuariosPermiso+"' where ID = '"+userListClicked.ID+"' ", (err, result) => {
	            if (err) {
	                if (!rolledBack) {
	                    transaction.rollback(err => {
	                        $("body").overhang({
					            type: "error",
					            primary: "#f84a1d",
					            accent: "#d94e2a",
					            message: "Error en modificación en la tabla de Usuarios.",
					            overlay: true,
					            closeConfirm: true
					        });
	                    });
	                }
	            }  else {
	                transaction.commit(err => {
	                    // ... error checks
	                    loadUsers();
	                    $("body").overhang({
						  	type: "success",
						  	primary: "#40D47E",
			  				accent: "#27AE60",
						  	message: "Usuario modificado con éxito.",
						  	duration: 2,
						  	overlay: true
						});
	                    $('#modalUpdate').modal('toggle');
	                });
	            }
	        });
	    }); // fin transaction
	}
}

function deleteUser () {
	const transaction = new sql.Transaction( pool1 );
	transaction.begin(err => {
		var rolledBack = false;
	    transaction.on('rollback', aborted => {
	        // emited with aborted === true
	        rolledBack = true;
	    });
	    const request = new sql.Request(transaction);
	    request.query("delete from Usuarios where ID = '"+userListClicked.ID+"'", (err, result) => {
	    	if (err) {
	    		if (!rolledBack) {
	    			transaction.rollback(err => {
	                    // ... error checks
	                    $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en eliminación en la tabla de Usuarios.",
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
					  	message: "Usuario eliminado con éxito.",
					  	duration: 2,
					  	overlay: true
					});
		            loadUsers();
		        });
		    }
	    });
	}); // fin transaction
}
//	**********		Fin Users		**********


//	**********		Policies		**********
var politicas;
function loadPolicies () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Contrasena", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de políticas de contraseña.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                    	politicas = result.recordset[0];
                    	showPolicies();
                    } else
                    	createPolicies();
                });
            }
        });
    }); // fin transaction
}

function createPolicies () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Contrasena (longitudMin, carEspeciales, minMay, minMin, minCarEspeciales, minNum, diasVigencia) values ("+0+", '"+1+"', "+0+", "+0+", "+0+", "+0+", "+0+")", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en inserción en la tabla de Usuarios.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    politicas = {
                    	longitudMin: 0,
                    	carEspeciales: '1',
                    	minMay: 0,
                    	minMin: 0,
                    	minCarEspeciales: 0,
                    	minNum: 0,
                    	diasVigencia: 0
                    };
                    showPolicies();
                });
            }
        });
    }); // fin transaction
}

function showPolicies () {
	$("#longMin").val(politicas.longitudMin);
	var mostrarSpan;
	if(politicas.carEspeciales == '1')
		mostrarSpan = true;
	else
		mostrarSpan = false;
	changeSwitchery($('#carEspIsChecked'), mostrarSpan);
	$("#carEspSpan").toggle(mostrarSpan);
  	$("#carEspNoSpan").toggle(!mostrarSpan);
	$("#minMayu").val(politicas.minMay);
	$("#minMinu").val(politicas.minMin);
	$("#minCarEsp").val(politicas.minCarEspeciales);
	$("#minNum").val(politicas.minNum);
	$("#diaVige").val(politicas.diasVigencia);

	$("#longMin").inputmask({"clearMaskOnLostFocus": "true"});
	$("#minMayu").inputmask({"clearMaskOnLostFocus": "true"});
	$("#minMinu").inputmask({"clearMaskOnLostFocus": "true"});
	$("#minCarEsp").inputmask({"clearMaskOnLostFocus": "true"});
	$("#minNum").inputmask({"clearMaskOnLostFocus": "true"});
	$("#diaVige").inputmask({"clearMaskOnLostFocus": "true"});
}

function resetPolicies () {
	$("#longMin").val(0);
	changeSwitchery($('#carEspIsChecked'), true);
	$("#carEspSpan").toggle(true);
  	$("#carEspNoSpan").toggle(false);
	$("#minMayu").val(0);
	$("#minMinu").val(0);
	$("#minCarEsp").val(0);
	$("#minNum").val(0);
	$("#diaVige").val(0);
	
	$("#longMin").inputmask({"clearMaskOnLostFocus": "true"});
	$("#minMayu").inputmask({"clearMaskOnLostFocus": "true"});
	$("#minMinu").inputmask({"clearMaskOnLostFocus": "true"});
	$("#minCarEsp").inputmask({"clearMaskOnLostFocus": "true"});
	$("#minNum").inputmask({"clearMaskOnLostFocus": "true"});
	$("#diaVige").inputmask({"clearMaskOnLostFocus": "true"});
}

function savePolicies () {
	var longitudMininma = parseInt($("#longMin").val());
	var caracteresEspeciales;
	if($("#carEspIsChecked").is(':checked'))
		caracteresEspeciales = '1';
	else
		caracteresEspeciales = '0';
	var minimoMayuscula = parseInt($("#minMayu").val());
	var minimoMinuscula = parseInt($("#minMinu").val());
	var minCarEspeciales = parseInt($("#minCarEsp").val());
	var minimoNumeros = parseInt($("#minNum").val());
	var diasVigencia = parseInt($("#diaVige").val());
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("update Contrasena set longitudMin = "+ longitudMininma +", carEspeciales = "+ caracteresEspeciales +", minMay = "+ minimoMayuscula +", minMin = "+ minimoMinuscula +", minCarEspeciales = "+ minCarEspeciales +", minNum = "+ minimoNumeros +", diasVigencia = "+ diasVigencia +" where ID = 1", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en modificación en la tabla de políticas de contraseña.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    loadPolicies();
                    $("body").overhang({
					  	type: "success",
					  	primary: "#40D47E",
		  				accent: "#27AE60",
					  	message: "Política modificada con éxito.",
					  	duration: 2,
					  	overlay: true
					});
                });
            }
        });
    }); // fin transaction
}

function changeSwitchery(element, checked) {
  	if ( ( element.is(':checked') && checked == false ) || ( !element.is(':checked') && checked == true ) ) {
    	element.parent().find('.switchery').trigger('click');
  	}
}
//	**********		Fin Policies		**********

//	**********		Text Permission Toggle		**********
$( "#formulaIsChecked" ).click(function() {
  	$("#formulaSpan").toggle(this.checked);
  	$("#formulaNoSpan").toggle(!this.checked);
});

$( "#fosedeIsChecked" ).click(function() {
  	$("#fosedeSpan").toggle(this.checked);
  	$("#fosedeNoSpan").toggle(!this.checked);
});

$( "#carEspIsChecked" ).click(function() {
  	$("#carEspSpan").toggle(this.checked);
  	$("#carEspNoSpan").toggle(!this.checked);
});

$( "#formulaIsCheckedEdit" ).click(function() {
  	$("#formulaSpanEdit").toggle(this.checked);
  	$("#formulaNoSpanEdit").toggle(!this.checked);
});

$( "#fosedeIsCheckedEdit" ).click(function() {
  	$("#fosedeSpanEdit").toggle(this.checked);
  	$("#fosedeNoSpanEdit").toggle(!this.checked);
});

$( "#usuariosIsChecked" ).click(function() {
  	$("#usuariosSpan").toggle(this.checked);
  	$("#usuariosNoSpan").toggle(!this.checked);
});

$( "#usuariosIsCheckedEdit" ).click(function() {
  	$("#usuariosSpanEdit").toggle(this.checked);
  	$("#usuariosNoSpanEdit").toggle(!this.checked);
});



//	**********		Logo		**********
var dialog = remote.dialog;
var filepathFullLogo = '';
var filepathSmallLogo = '';
var objetoBandera = null;

function showDialogFullLogo () {
	dialog.showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png'] }]}, (filepath) => {
		$("#fullLogoUpload").attr("src",filepath);
		//filepathFullLogo = "data:image/png;base64," + getBase64Image(document.getElementById("fullLogoUpload"));
		filepathFullLogo = getBase64Image(document.getElementById("fullLogoUpload"));
		setTimeout(function(){
			filepathFullLogo = getBase64Image(document.getElementById("fullLogoUpload"));
		}, 500);
	});
}

function showDialogLogo () {
	dialog.showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png'] }]}, (filepath) => {
		$("#smallLogoUpload").attr("src",filepath);
		//filepathSmallLogo = "data:image/png;base64," + getBase64Image(document.getElementById("smallLogoUpload"));
		filepathSmallLogo = getBase64Image(document.getElementById("smallLogoUpload"));
		setTimeout(function(){
			filepathSmallLogo = getBase64Image(document.getElementById("smallLogoUpload"));
		}, 500);
	});
}

function getBase64Image(img) {
  	var canvas = document.createElement("canvas");
  	canvas.width = img.naturalWidth;
  	canvas.height = img.naturalHeight;
  	var ctx = canvas.getContext("2d");
  	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  	var dataURL = canvas.toDataURL();
  	return dataURL;
}

function verifyImg () {
	if(objetoBandera != null)
		modifyImages();
	else
		saveImages();
}

function saveImages () {
	if(filepathFullLogo.length > 0 || filepathSmallLogo.length > 0) {
		/*if(filepathFullLogo.length > 0)
			filepathFullLogo = "data:image/png;base64," + getBase64Image(document.getElementById("fullLogoUpload"));
		if(filepathSmallLogo.length > 0)
			filepathSmallLogo = "data:image/png;base64," + getBase64Image(document.getElementById("smallLogoUpload"));*/
		const transaction = new sql.Transaction( pool1 );
	    transaction.begin(err => {
	        var rolledBack = false;
	        transaction.on('rollback', aborted => {
	            // emited with aborted === true
	            rolledBack = true;
	        });
	        const request = new sql.Request(transaction);
	        request.query("insert into Variables (fullLogo, smallLogo, formula, formulaMATHLIVE, minimoRCL) values ('"+filepathFullLogo+"','"+filepathSmallLogo+"','','', 0)", (err, result) => {
	            if (err) {
	                if (!rolledBack) {
	                    transaction.rollback(err => {
	                        $("body").overhang({
					            type: "error",
					            primary: "#f84a1d",
					            accent: "#d94e2a",
					            message: "Error en inserción de logo.",
					            overlay: true,
					            closeConfirm: true
					        });
	                    });
	                }
	            }  else {
	                transaction.commit(err => {
	                    // ... error checks
	                    loadUsers();
	                    $("body").overhang({
						  	type: "success",
						  	primary: "#40D47E",
			  				accent: "#27AE60",
						  	message: "Logo guardado con éxito.",
						  	duration: 2,
						  	overlay: true
						});
						loadVariablesIMG();
	                });
	            }
	        });
	    }); // fin transaction
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Ingrese por lo menos un logo.",
		  	duration: 2,
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function modifyImages () {
	var noEntro = true;
	if(filepathFullLogo.length > 0) {
		noEntro = false;
		/*if(filepathFullLogo.length > 0)
			filepathFullLogo = "data:image/png;base64," + getBase64Image(document.getElementById("fullLogoUpload"));*/
		const transaction = new sql.Transaction( pool1 );
	    transaction.begin(err => {
	        var rolledBack = false;
	        transaction.on('rollback', aborted => {
	            // emited with aborted === true
	            rolledBack = true;
	        });
	        const request = new sql.Request(transaction);
	        request.query("update Variables set fullLogo = '"+filepathFullLogo+"' where ID = 1", (err, result) => {
	            if (err) {
	                if (!rolledBack) {
	                    transaction.rollback(err => {
	                        $("body").overhang({
					            type: "error",
					            primary: "#f84a1d",
					            accent: "#d94e2a",
					            message: "Error en modificación de logo.",
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
						  	message: "Logo modificado con éxito.",
						  	duration: 2,
						  	overlay: true
						});
						loadVariablesIMG();
	                });
	            }
	        });
	    }); // fin transaction
	}
	if(filepathSmallLogo.length > 0) {
		noEntro = false;
		/*if(filepathSmallLogo.length > 0)
			filepathSmallLogo = "data:image/png;base64," + getBase64Image(document.getElementById("smallLogo"));*/
		const transaction = new sql.Transaction( pool1 );
	    transaction.begin(err => {
	        var rolledBack = false;
	        transaction.on('rollback', aborted => {
	            // emited with aborted === true
	            rolledBack = true;
	        });
	        const request = new sql.Request(transaction);
	        request.query("update Variables set smallLogo = '"+filepathSmallLogo+"' where ID = 1", (err, result) => {
	            if (err) {
	                if (!rolledBack) {
	                    transaction.rollback(err => {
	                        $("body").overhang({
					            type: "error",
					            primary: "#f84a1d",
					            accent: "#d94e2a",
					            message: "Error en modificación de logo.",
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
						  	message: "Logo modificado con éxito.",
						  	duration: 2,
						  	overlay: true
						});
						loadVariablesIMG();
	                });
	            }
	        });
	    }); // fin transaction
	}
	if(noEntro) {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Ingrese por lo menos un logo.",
		  	duration: 2,
		  	overlay: true,
            closeConfirm: true
		});
	}
}

//	**********		Fin Logo		**********


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
	session.defaultSession.clearStorageData([], (data) => {});
    $("#app_root").load("src/login.html");
}

function goConnections () {
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/importaciones.html");
}

function goConfig () {
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/config.html");
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