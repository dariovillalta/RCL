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
$('.clockpicker').clockpicker();
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
		//loadVariablesIMG();
        loadVariables();
        loadVariablesOfVariables();
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

/* ******************       SEARCH     ********* */
function filterDiv () {
    var text = $( "#buscarDiv" ).val();
    console.log("111");
    var posiciones = [];
    $(".filtrarRow>div>div>div>h2").each( function( key, value ) {
        var $BOX_PANEL = $(this).closest('.x_panel'),
            $ICON = $(this).find('i'),
            $BOX_CONTENT = $BOX_PANEL.find('.x_content');
        if($(this).text().indexOf(text) == -1) {
            //$(this).siblings().find(".collapse-link").trigger("click");
            console.log("11");
            console.log($(this));
            console.log($BOX_CONTENT);
            console.log($BOX_PANEL);
            $BOX_CONTENT.slideToggle(200, function(){
                $BOX_PANEL.removeAttr('style');
            });
            posiciones.push(0);
            /*$BOX_CONTENT.slideToggle(200);
            $BOX_PANEL.css('height', 'auto');*/
        } else {
            console.log("22");
            console.log($(this));
            console.log($BOX_CONTENT);
            console.log($BOX_PANEL);
            posiciones.push(1);
            /*$BOX_CONTENT.slideToggle(200, function(){
                $BOX_PANEL.removeAttr('style');
            });*/
            $BOX_CONTENT.slideToggle(200);
            $BOX_PANEL.css('height', 'auto');
        }
        $ICON.toggleClass('fa-chevron-up fa-chevron-down');
    });
    for (var i = 0; i < posiciones.length; i++) {
        if(posiciones[i] == 1) {
            //
        }
    };
    console.log("YEAAAH");
    console.log($(".filtrarRow>div>div>div>ul>li>a"));
}
/* ******************       FIN SEARCH     ********* */

/* ****************** 		LOADING IMG 	********* */
/*var filepathFullLogo = '';
var filepathSmallLogo = '';*/
var variablesDBGlobal;
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
                    	/*objetoBandera = result.recordset[0];
                    	if(result.recordset[0].fullLogo.length > 0){
                    		filepathFullLogo = result.recordset[0].fullLogo;
                    		$("#fullLogo").attr("src",filepathFullLogo);
                    	} else
                    		filepathFullLogo = '';
                    	if(result.recordset[0].smallLogo.length > 0){
                    		filepathSmallLogo = result.recordset[0].smallLogo;
                    		$("#smallLogo").attr("src",filepathSmallLogo);
                    	} else
                    		filepathSmallLogo = '';*/
                        variablesDBGlobal = result.recordset[0].minimoRCL;
                        $("#porcentajeActual").text(variablesDBGlobal+" %");
                    } else {
                    	/*filepathFullLogo = '';
                    	filepathSmallLogo = '';*/
                    }
                });
            }
        });
    }); // fin transaction
}
/* ****************** 		END LOADING IMG 	********* */

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

$('#fechaProgra').datepicker({
    dateFormat: '', 
    timeFormat: 'hh:mm tt',
    timeOnly: true
});

var arregloVariables = [];
function loadVariables () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
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
                            message: "Error en conneción con tabla de FormulaVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    var content = '';
                    arregloVariables = result.recordset;
                    for (var i = 0; i < arregloVariables.length; i++) {
                        content+='<option value = '+i+'>'+arregloVariables[i].variables+'</option>'
                    };
                    $("#selectVariables").empty();
                    $("#selectVariables").append(content);
                    $("#selectVariablesCompar").empty();
                    $("#selectVariablesCompar").append(content);
                    loadEmails();
                });
            }
        });
    }); // fin transaction
}

var arregloSubVariables = [];
function loadVariablesOfVariables () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from VariablesdeVariablesFormula", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conneción con tabla de VariablesdeVariablesFormula.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    var content = '';
                    arregloSubVariables = result.recordset;
                    for (var i = 0; i < arregloSubVariables.length; i++) {
                        content+='<option value = '+i+'>'+arregloSubVariables[i].nombre+'</option>'
                    };
                    $("#selectSubVariables").empty();
                    $("#selectSubVariables").append(content);
                    $("#selectSubVariablesCompar").empty();
                    $("#selectSubVariablesCompar").append(content);
                });
            }
        });
    }); // fin transaction
}

$("#selectVariablesCompar").prop("disabled", true);
$("#selectSubVariablesCompar").prop("disabled", true);
$("input[name='selectVerComparacionRadio']").prop("disabled", true);
$("input[name='alertaRadio']").change(function(){
    if($('#enviarAlerta').is(':checked')) {
        $("#selectVariablesCompar").prop("disabled", false);
        $("#selectSubVariablesCompar").prop("disabled", false);
        $("input[name='selectVerComparacionRadio']").prop("disabled", false);
        if($('#selectVerVariablesComparacion').is(':checked')) {
            $("#selectVariablesCompar").prop("disabled", false);
            $("#selectSubVariablesCompar").prop("disabled", true);
        } else {
            $("#selectVariablesCompar").prop("disabled", true);
            $("#selectSubVariablesCompar").prop("disabled", false);
        }
    } else {
        $("#selectVariablesCompar").prop("disabled", true);
        $("#selectSubVariablesCompar").prop("disabled", true);
        $("input[name='selectVerComparacionRadio']").prop("disabled", true);
    }
});
$("input[name='selectVerComparacionRadio']").change(function(){
    if($('#selectVerVariablesComparacion').is(':checked')) {
        $("#selectVariablesCompar").prop("disabled", false);
        $("#selectSubVariablesCompar").prop("disabled", true);
    } else {
        $("#selectVariablesCompar").prop("disabled", true);
        $("#selectSubVariablesCompar").prop("disabled", false);
    }
});


$("#selectSubVariables").prop("disabled", true);
$("input[name='selectVerVariablesRadio']").change(function(){
    if($('#selectVerVariables').is(':checked')) {
        $("#selectVariables").prop("disabled", false);
        $("#selectSubVariables").prop("disabled", true);
    } else {
        $("#selectVariables").prop("disabled", true);
        $("#selectSubVariables").prop("disabled", false);
    }
});

var correos = [];
var alertas = [];

function loadEmails () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Correos", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conneción con tabla de correos.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    correos = result.recordset;
                    renderEmails();
                    loadAlerts();
                });
            }
        });
    }); // fin transaction
}

function renderEmails () {
    var content = '';
    var contentSelect = '';
    for (var i = 0; i < correos.length; i++) {
        content+='<li>'+
                    '<p>'+correos[i].correo+'</p>'+
                    '<button style="position: absolute; right: 10px; margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" onclick="deleteEmail('+correos[i].ID+')">Eliminar</button>'+
                  '</li>';
        contentSelect+='<option value="'+correos[i].ID+'">'+correos[i].correo+'</option>';
    };
    $("#listaCorreos").empty();
    $("#listaCorreos").append(content);
    $("#correoValueSelect").empty();
    $("#correoValueSelect").append(contentSelect);
}

function loadAlerts () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from EnviarCorreos", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conneción con tabla de enviarcorreos.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    alertas = result.recordset;
                    renderAlerts();
                });
            }
        });
    }); // fin transaction
}

function renderAlerts () {
    var content = '';
    for (var i = 0; i < alertas.length; i++) {
        var varSel = arregloVariables.filter(function(object) {
            return ( object.ID == alertas[i].variableID );
        });
        var corrSel = correos.filter(function(object) {
            return ( object.ID == alertas[i].idCorreo );
        });
        if(varSel.length == 1 && corrSel.length == 1) {
            content+='<li>'+
                        '<p>'+corrSel[0].correo+': '+varSel[0].variables+' - '+alertas[i].porcentajeEnviar+'%</p>'+
                        '<button style="position: absolute; right: 10px; margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" onclick="deleteAlert('+correos[i].ID+')">Eliminar</button>'+
                      '</li>';
        }
    };
    $("#listaAlertas").empty();
    $("#listaAlertas").append(content);
}

function checkMinRCL () {
    var monto = $('#minimoRCL').val().split(/[ |%|_|__]/)[0];
    console.log(monto)
    if(!isNaN(monto)) {
        $("body").overhang({
            type: "confirm",
            primary: "#f5a433",
            accent: "#dc9430",
            yesColor: "#3498DB",
            message: 'Esta seguro que desea guardar el valor de RCL mínimo '+monto+'?',
            overlay: true,
            yesMessage: "Guardar",
            noMessage: "Cancelar",
            callback: function (value) {
                if(value){
                    if(variablesDBGlobal == null)
                        createMinimunRCL(monto);
                    else 
                        updateMinimunRCL(monto);
                }
            }
        });
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Ingrese un número válido.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function createMinimunRCL (monto) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Variables (fullLogo, smallLogo, formula, formulaMATHLIVE, minimoRCL, permisoInicio, horaProgramada) values ('', '', '', '', "+monto+", 'false','')", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en inserción del monto mínimo del RCL.",
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
                        message: "Monto mínimo del RCL guardado con éxito.",
                        duration: 1,
                        overlay: true
                    });
                    loadVariablesIMG();
                });
            }
        });
    }); // fin transaction
}

function updateMinimunRCL (monto) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("update Variables set minimoRCL = "+monto+" where ID = 1", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en modificación del monto mínimo del RCL.",
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
                        message: "Monto mínimo del RCL guardado con éxito.",
                        duration: 1,
                        overlay: true
                    });
                    loadVariablesIMG();
                });
            }
        });
    }); // fin transaction
}

function createEmail () {
    var correo = $('#correoValue').val();
    var nombrePersona = $('#nombrePersona').val();
    if(correo.length > 0 && correo.length < 60) {
        if(nombrePersona.length > 0 && nombrePersona.length < 60) {
            const transaction = new sql.Transaction( pool1 );
            transaction.begin(err => {
                var rolledBack = false;
                transaction.on('rollback', aborted => {
                    // emited with aborted === true
                    rolledBack = true;
                });
                const request = new sql.Request(transaction);
                request.query("insert into Correos (correo, nombrePersona) values ('"+correo+"', '"+nombrePersona+"')", (err, result) => {
                    if (err) {
                        console.log(err);
                        if (!rolledBack) {
                            transaction.rollback(err => {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Error en inserción de Correo.",
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
                                message: "Correo guardado con éxito.",
                                duration: 1,
                                overlay: true
                            });
                            loadEmails();
                        });
                    }
                });
            }); // fin transaction
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "El campo del nombre debe tener una longitud mayor a 0 y menor a 61.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "El campo de correo electrónico debe tener una longitud mayor a 0 y menor a 61.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function createAlert () {
    var correo = $('#correoValueSelect').val();
    var porcentaje = $('#porcentajeCorreoValue').val().split(/[ |%|_|__]/)[0];
    var variableID;
    var esVarPadre;
    var comparacionID = -1;
    var comparacionEsVarPadre = false;
    if($('#enviarAlerta').is(':checked')) {
        if($('#selectVerVariablesComparacion').is(':checked')) {
            var pos = $('#selectVariablesCompar').val();
            comparacionID = arregloVariables[pos].ID;
            comparacionEsVarPadre = true;
        } else {
            var pos = $('#selectSubVariablesCompar').val();
            comparacionID = arregloSubVariables[pos].ID;
            comparacionEsVarPadre = true;
        }
    }
    if($('#selectVerVariables').is(':checked')) {
        var pos = $('#selectVariables').val();
        variableID = arregloVariables[pos].ID;
        esVarPadre = true;
    } else {
        var pos = $('#selectSubVariables').val();
        variableID = arregloSubVariables[pos].ID;
        esVarPadre = false;
    }
    if(correo.length > 0 && correo.length < 60) {
        if(variableID != null && variableID != undefined) {
            if(!isNaN(porcentaje)) {
                const transaction = new sql.Transaction( pool1 );
                transaction.begin(err => {
                    var rolledBack = false;
                    transaction.on('rollback', aborted => {
                        // emited with aborted === true
                        rolledBack = true;
                    });
                    const request = new sql.Request(transaction);
                    request.query("insert into EnviarCorreos (idCorreo, variableID, esVarPadre, comparacionID, comparacionEsVarPadre, porcentajeEnviar) values ("+correo+", "+variableID+",'"+esVarPadre+"',"+comparacionID+",'"+comparacionEsVarPadre+"',"+porcentaje+")", (err, result) => {
                        if (err) {
                            console.log(err);
                            if (!rolledBack) {
                                transaction.rollback(err => {
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en inserción de Alerta.",
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
                                    message: "Alerta guardado con éxito.",
                                    duration: 1,
                                    overlay: true
                                });
                                loadAlerts();
                            });
                        }
                    });
                }); // fin transaction
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Ingrese un número válido.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Selecciones una variable a monitorear.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "El campo de correo electrónico debe tener una longitud mayor a 0 y menor a 61.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function updateEmail (id, correo) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("update Correos set correo = '"+correo+"' where ID = "+id, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en modificación de Alerta.",
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
                        message: "Alerta guardado con éxito.",
                        duration: 1,
                        overlay: true
                    });
                    loadEmails();
                });
            }
        });
    }); // fin transaction
}

function deleteAlert (id) {
    $("body").overhang({
        type: "confirm",
        primary: "#f5a433",
        accent: "#dc9430",
        yesColor: "#3498DB",
        message: 'Esta seguro que desea eliminar el correo electrónico?',
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
                    request.query("delete from EnviarCorreos where ID = "+id, (err, result) => {
                        if (err) {
                            if (!rolledBack) {
                                transaction.rollback(err => {
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en eliminación de Alerta.",
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
                                    message: "Alerta eliminado con éxito.",
                                    duration: 1,
                                    overlay: true
                                });
                                loadEmails();
                            });
                        }
                    });
                }); // fin transaction
            }
        }
    });
}

function saveHour () {
    var hora = $("#hora").val();
    console.log(hora);
}

function deleteHour () {
    $("body").overhang({
        type: "confirm",
        primary: "#f5a433",
        accent: "#dc9430",
        yesColor: "#3498DB",
        message: 'Esta seguro que desea desactivar el cálculo de RCL automatico?',
        overlay: true,
        yesMessage: "Desactivar",
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
                    request.query("update Variables set horaProgramada = '' where ID = 1", (err, result) => {
                        if (err) {
                            if (!rolledBack) {
                                transaction.rollback(err => {
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en desactivación de cálculo de RCL automático.",
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
                                    message: "Desactivación realizada con éxito.",
                                    duration: 1,
                                    overlay: true
                                });
                                //loadEmails();
                            });
                        }
                    });
                }); // fin transaction
            }
        }
    });
}
//	**********		Fin Manual Contable y Listas		**********






















//	**********		Route Change		**********
function goVariables () {
    cleanup();
	$("#app_root").empty();
    $("#app_root").load("src/variables.html");
}

function goHome () {
    cleanup();
	$("#app_root").empty();
    $("#app_root").load("src/home.html");
}

function goUsers () {
    cleanup();
	$("#app_root").empty();
    $("#app_root").load("src/users.html");
}

function goConnections () {
    cleanup();
    $("#app_root").empty();
    $("#app_root").load("src/importaciones.html");
}

function goConfig () {
    cleanup();
    $("#app_root").empty();
    $("#app_root").load("src/config.html");
}

function logout () {
    session.defaultSession.clearStorageData([], (data) => {});
    cleanup();
	$("#app_full").empty();
    $("#app_full").load("src/login.html");
}

function goReports () {
    cleanup();
    $("#app_root").empty();
    $("#app_root").load("src/elegirReporteria.html");
}

function goGraphics () {
    cleanup();
    $("#app_root").empty();
    $("#app_root").load("src/graficos.html");
}

function goRCL () {
    cleanup();
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
}

function goLists () {
    cleanup();
    $("#app_root").empty();
    $("#app_root").load("src/variablesLists.html");
}

var cleanup = function () {
    delete window.electron;
    delete window.remote;
    delete window.path;
    delete window.sql;
    delete window.clockpicker;
    delete window.config;
    delete window.pool1;
    delete window.session;
    delete window.cleanup;
};