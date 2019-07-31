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
		var hoy = new Date();
        loadLoans(hoy, hoy);
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



/*Var DECLAR*/
var arregloActivos = [];









/* ****************** 		LOADING IMG 	****************** */
/*var filepathFullLogo = '';
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
                    	} else
                    		filepathFullLogo = '';
                    	if(result.recordset[0].smallLogo.length > 0){
                    		filepathSmallLogo = result.recordset[0].smallLogo;
                    		$("#smallLogo").attr("src",filepathSmallLogo);
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
}*/
/* ****************** 		END LOADING IMG 	****************** */

/* ******************       LOADING TOTALS  ********* */
function loadLoans (inicioF, finalF) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from Prestamos where fecha between '"+formatDateCreation(inicioF)+"' and '"+formatDateCreation(finalF)+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error al conectarse con la tabla de Totales.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    if(result.recordset.length > 0){
                        for (var i = 0; i < result.recordset.length; i++) {
                            result.recordset[i].fecha =  new Date(result.recordset[i].fecha.getUTCFullYear(), result.recordset[i].fecha.getUTCMonth(), result.recordset[i].fecha.getUTCDate());
                        };
                        arregloActivos = result.recordset;
                    } else{
                        arregloActivos = [];
                    }
                    renderTable();
                });
            }
        });
    }); // fin transaction
}

$('#fechaInicioPrestamos').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});
$('#fechaFinalPrestamos').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});





/********								INIT											********/
function renderTable () {
    if ( $.fn.dataTable.isDataTable( '#datatable_prestamos' ) )
        $("#datatable_prestamos").dataTable().fnDestroy();
    $( "#datatable_prestamos tbody").unbind( "click" );
    var table = $('#datatable_prestamos').DataTable({
        "data": arregloActivos,
        dom: "Bflrtip",
        buttons: [
            {
                extend: "copyHtml5",
                className: "btn-sm"
            },
            {
                extend: "csvHtml5",
                className: "btn-sm"
            },
            {
                extend: "excelHtml5",
                className: "btn-sm"
            },
            {
                extend: "pdfHtml5",
                className: "btn-sm"
            }
        ],
        rowCallback: function(row, data, index){
            $(row).find('td:eq(3)').html(parseDate(data.fecha));
        },
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
            { "data": "idCliente" },
            { "data": "nombreCliente" },
            { "data": "tipoPersona" },
            { "data": "tipoSubPersona" },
            { "data": "numPrestamo" },
            { "data": "saldo" },
            { "data": "moneda" },
            { "data": "diasMora" },
            { "data": "amortizacion" },
            { "data": "sobregiro" },
            { "data": "contingente" },
            { "data": "clasificacionCartera" },
            { "data": "tipoCredito" },
            { "data": "pago30" },
            { "data": "pago60" },
            { "data": "pago90" },
            { "data": "pago120" },
            { "data": "clausulasRestrictivas" },
            { "data": "esFinanciacionGarantizada" },
            { "data": "valorFinanciacion" },
            { "data": "alac" },
            { "data": "factor" },
            { "data": "fechaInicio" },
            { "data": "fechaFinal" },
            { "data": "montoOtorgado" },
            { "data": "sucursal" },
            { "data": "fecha" },
            { "data": "Borrar" }
        ],
        "columnDefs": [
            { className: "text-center", "targets": [ 0 ] },
            { className: "text-center", "targets": [ 1 ] },
            { className: "text-center", "targets": [ 2 ] },
            { className: "text-center", "targets": [ 3 ] },
            { className: "text-center", "targets": [ 4 ] },
            { className: "text-center", "targets": [ 5 ] },
            { className: "text-center", "targets": [ 6 ] },
            { className: "text-center", "targets": [ 7 ] },
            { className: "text-center", "targets": [ 8 ] },
            { className: "text-center", "targets": [ 9 ] },
            { className: "text-center", "targets": [ 10 ] },
            { className: "text-center", "targets": [ 11 ] },
            { className: "text-center", "targets": [ 12 ] },
            { className: "text-center", "targets": [ 13 ] },
            { className: "text-center", "targets": [ 14 ] },
            { className: "text-center", "targets": [ 15 ] },
            { className: "text-center", "targets": [ 16 ] },
            { className: "text-center", "targets": [ 17 ] },
            { className: "text-center", "targets": [ 18 ] },
            { className: "text-center", "targets": [ 19 ] },
            { className: "text-center", "targets": [ 20 ] },
            { className: "text-center", "targets": [ 21 ] },
            { className: "text-center", "targets": [ 22 ] },
            { className: "text-center", "targets": [ 23 ] },
            { className: "text-center", "targets": [ 24 ] },
            { className: "text-center", "targets": [ 25 ] },
            { className: "text-center", "targets": [ 26 ] },
            {
                "targets": -1,
                "defaultContent": '<a class="btn btn-app deleteVariable"> <i class="fa fa-eraser"></i> Eliminar </a>',
                "className": "text-center"
            }

        ]
    });

    $('#datatable_prestamos tbody').on( 'click', 'tr a.deleteVariable', function () {
        var data = table.row( $(this).parents('tr') ).data();
        $("body").overhang({
            type: "confirm",
            primary: "#f5a433",
            accent: "#dc9430",
            yesColor: "#3498DB",
            message: 'Esta seguro que desea eliminar '+data.nombre+'?',
            overlay: true,
            yesMessage: "Eliminar",
            noMessage: "Cancelar",
            callback: function (value) {
                if(value)
                    deleteVariable(data);
            }
        });
    } );
}

function parseDate (date) {
    var meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    var dia = date.getDate();
    var mes = meses[date.getMonth()];
    var anio = date.getFullYear();
    return dia + " " + mes + ", " + anio;
}

function deleteVariable (row) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("delete from Prestamos where ID = '"+row.ID+"' ", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en eliminación de variable "+row.nombre+".",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    loadVariables();
                    $("body").overhang({
                        type: "success",
                        primary: "#40D47E",
                        accent: "#27AE60",
                        message: "Variable eliminada con exito.",
                        duration: 2,
                        overlay: true
                    });
                    var fechaInicio = $("#fechaInicioPrestamos").datepicker('getDate');
                    var fechaFinal = $("#fechaFinalPrestamos").datepicker('getDate');
                    if (Object.prototype.toString.call(fechaInicio) === "[object Date]") {
                        if (isNaN(fechaInicio.getTime())) {
                            var hoy = new Date();
                            loadLoans(hoy, hoy);
                        } else {
                            if (Object.prototype.toString.call(fechaFinal) === "[object Date]") {
                                if (isNaN(fechaFinal.getTime())) {
                                    var hoy = new Date();
                                    loadLoans(hoy, hoy);
                                } else {
                                    loadLoans(fechaInicio, fechaFinal);
                                }
                            } else {
                                var hoy = new Date();
                                loadLoans(hoy, hoy);
                            }
                        }
                    } else {
                        var hoy = new Date();
                        loadLoans(hoy, hoy);
                    }
                });
            }
        });
    }); // fin transaction
}













//  **********      Filter        **********
function checkDates () {
    var fechaInicio = $("#fechaInicioPrestamos").datepicker('getDate');
    var fechaFinal = $("#fechaFinalPrestamos").datepicker('getDate');
    if (Object.prototype.toString.call(fechaInicio) === "[object Date]") {
        if (isNaN(fechaInicio.getTime())) {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese una fecha de inicio.",
                overlay: true,
                closeConfirm: true
            });
        } else {
            if (Object.prototype.toString.call(fechaFinal) === "[object Date]") {
                if (isNaN(fechaFinal.getTime())) {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "Ingrese una fecha final.",
                        overlay: true,
                        closeConfirm: true
                    });
                } else {
                    loadLoans(fechaInicio, fechaFinal);
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Ingrese una fecha final.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Ingrese una fecha de inicio.",
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
    monthIndex++;
    var year = date.getFullYear();
    return year + '-' + monthIndex + '-' + day;
}
//  **********      END Filter        **********














//	**********		Route Change		**********
function goVariables () {
	$("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/variables.html");
}

function goHome () {
	$("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/home.html");
}

function goUsers () {
	$("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/users.html");
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

function logout () {
    $("#app_full").empty();
    session.defaultSession.clearStorageData([], (data) => {});
    //cleanup();
    $("#app_full").load("src/login.html");
}

function goRCL () {
	$("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/rcl.html");
}

function goReports () {
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/elegirReporteria.html");
}

function goGraphics () {
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/graficos.html");
}

function goLists () {
    $("#app_root").empty();
    //cleanup();
    $("#app_root").load("src/variablesLists.html");
}