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
		loadVariablesIMG();
        loadEmails();
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
                });
            }
        });
    }); // fin transaction
}

var correos = [];

function renderEmails () {
    var content = '';
    for (var i = 0; i < correos.length; i++) {
        content+='<li>'+
                    '<p>'+correos[i].correo+'</p>'+
                    '<button style="position: absolute; right: 10px; margin: 0; position: absolute; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" onclick="deleteEmail('+correos[i].ID+')">Eliminar</button>'+
                  '</li>';
    };
    $("#listaCorreos").empty();
    $("#listaCorreos").append(content);
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
    var porcentaje = $('#porcentajeCorreoValue').val().split(/[ |%|_|__]/)[0];
    console.log(correo)
    console.log(porcentaje)
    if(correo.length > 0 && correo.length < 60) {
        if(!isNaN(porcentaje)) {
            const transaction = new sql.Transaction( pool1 );
            transaction.begin(err => {
                var rolledBack = false;
                transaction.on('rollback', aborted => {
                    // emited with aborted === true
                    rolledBack = true;
                });
                const request = new sql.Request(transaction);
                request.query("insert into Correos (correo, porcentajeEnviar) values ('"+correo+"', "+porcentaje+")", (err, result) => {
                    if (err) {
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
                            message: "Error en modificación de Correo.",
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
}

function deleteEmail (id) {
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
                    request.query("delete from Correos where ID = "+id, (err, result) => {
                        if (err) {
                            if (!rolledBack) {
                                transaction.rollback(err => {
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en eliminación de Correo.",
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
                                    message: "Correo eliminado con éxito.",
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
    delete window.clockpicker;
    delete window.config;
    delete window.pool1;
    delete window.session;
    delete window.cleanup;
};