const electron = require('electron');
const remote = require('electron').remote;
const sql = require('mssql');
const XLSX = require('xlsx-style');

var user = getUser();
var password = getPassword();
var server = getServer();
var database = getDataBase();

const myWorker = new Worker("src/loading.js");

const config = {
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
    },
    options: {
        useUTC: false
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
		loadConections();
        loadFOSEDE();
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

var dialog = remote.dialog;

$('#fechaImportacion').datepicker({
    format: "dd-mm-yyyy",
    todayHighlight: true,
    viewMode: "days", 
    minViewMode: "days",
    language: 'es'
});

var arregloFOSEDE = [];
/* ******************       FOSEDE     ********* */
function loadFOSEDE () {
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
                        arregloFOSEDE = result.recordset;
                    } else {
                        arregloFOSEDE = [];
                    }
                });
            }
        });
    }); // fin transaction
}
/* ******************       END FOSEDE     ********* */

function existeMonedaFOSEDE (moneda) {
    for (var i = 0; i < arregloFOSEDE.length; i++) {
        if(arregloFOSEDE[i].moneda.toLowerCase().localeCompare(moneda.toLowerCase()) == 0) {
            return true;
        }
    };
    return false;
}





//	**********		Activos Conexion		**********
var arregloConecciones = [];
function loadConections () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Bases", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Bases.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                    	arregloConecciones = result.recordset;
                    } else {
                    	arregloConecciones = [];
                    }
                    loadFieldsActivos();
                });
            }
        });
    }); // fin transaction
}

//  **********      Activos Conexion        **********
var arregloCamposActivos = [];
function loadFieldsActivos () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Activos_Campos", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Bases.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloCamposActivos = result.recordset;
                    } else {
                        arregloCamposActivos = [];
                    }
                    loadFieldsDepositos();
                });
            }
        });
    }); // fin transaction
}
//  **********      Depositos Conexion        **********
var arregloCamposDepositos = [];
function loadFieldsDepositos () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Depositos_Campos", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Bases.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloCamposDepositos = result.recordset;
                    } else {
                        arregloCamposDepositos = [];
                    }
                    loadFieldsPrestamos();
                });
            }
        });
    }); // fin transaction
}
//  **********      Prestamos Conexion        **********
var arregloCamposPrestamos = [];
function loadFieldsPrestamos () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Prestamos_Campos", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Bases.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloCamposPrestamos = result.recordset;
                    } else {
                        arregloCamposPrestamos = [];
                    }
                    renderFields();
                });
            }
        });
    }); // fin transaction
}

function renderFields () {
    var activeView = 1, tipo = 'mssql';

    var usuarioActivos;
    var constrasenaActivos;
    var serverActivos;
    var basedatosActivos;
    var tablaActivos;

    var usuarioDepositos;
    var constrasenaDepositos;
    var serverDepositos;
    var basedatosDepositos;
    var tablaDepositos;

    var usuarioPrestamos;
    var constrasenaPrestamos;
    var serverPrestamos;
    var basedatosPrestamos;
    var tablaPrestamos;

    var cuenta;
    var nombre;
    var saldo;
    var moneda;
    var sucursal;
    var fechaImportacion;

    var idClienteDepositos;
    var numCuenta;
    var nombreClienteDepositos;
    var tipoPersonaDepositos;
    var tipoSubPersonaDepositos;
    var saldoDepositos;
    var monedaDepositos;
    var tipoCuenta;
    var fechaInicioDepositos;
    var fechaFinalDepositos;
    var sucursalDepositos;
    var fechaImportacionDepositos;

    var idClientePrestamos;
    var nombreClientePrestamos;
    var tipoPersonaPrestamos;
    var tipoSubPersonaPrestamos;
    var numPrestamo;
    var saldoPrestamos;
    var monedaPrestamos;
    var diasMora;
    var amortizaciones;
    var sobregiro;
    var contingente;
    var clasificacionCartera;
    var tipoCredito;
    var esperado30;
    var esperado60;
    var esperado90;
    var esperado120;
    var clausulasRestrictivas;
    var financiacionGarantizada;
    var valorFinanciacion;
    var alac;
    var factor;
    var fechaInicioPrestamos;
    var fechaFinalPrestamos;
    var montoOtorgado;
    var sucursalPrestamos;
    var fechaImportacionPrestamos;
    if(activeView == 1) {
        for (var i = 0; i < arregloConecciones.length; i++) {
            if(arregloConecciones[i].tipo.localeCompare(tipo) == 0) {
                if(arregloConecciones[i].arreglo.localeCompare("arregloActivos") == 0) {
                    $("#activosUserDB").val(arregloConecciones[i].usuario);
                    $("#activosPasswordDB").val(arregloConecciones[i].constrasena);
                    $("#activosServerDB").val(arregloConecciones[i].server);
                    $("#activosDataBaseDB").val(arregloConecciones[i].basedatos);
                    $("#activosTableDB").val(arregloConecciones[i].tabla);
                } else if(arregloConecciones[i].arreglo.localeCompare("arregloDepositos") == 0) {
                    $("#depositosUserDB").val(arregloConecciones[i].usuario);
                    $("#depositosPasswordDB").val(arregloConecciones[i].constrasena);
                    $("#depositosServerDB").val(arregloConecciones[i].server);
                    $("#depositosDataBaseDB").val(arregloConecciones[i].basedatos);
                    $("#depositosTableDB").val(arregloConecciones[i].tabla);
                } else if(arregloConecciones[i].arreglo.localeCompare("arregloPrestamos") == 0) {
                    $("#prestamosUserDB").val(arregloConecciones[i].usuario);
                    $("#prestamosPasswordDB").val(arregloConecciones[i].constrasena);
                    $("#prestamosServerDB").val(arregloConecciones[i].server);
                    $("#prestamosDataBaseDB").val(arregloConecciones[i].basedatos);
                    $("#prestamosTableDB").val(arregloConecciones[i].tabla);
                }
            }
        };
        for (var i = 0; i < arregloCamposActivos.length; i++) {
            if(arregloCamposActivos[i].tipo.localeCompare(tipo) == 0) {
                $("#cuentaConexionActivos").val(arregloCamposActivos[i].cuenta);
                $("#nombreConexionActivos").val(arregloCamposActivos[i].nombre);
                $("#saldoConexionActivos").val(arregloCamposActivos[i].saldo);
                $("#monedaConexionActivos").val(arregloCamposActivos[i].moneda);
                $("#sucursalConexionActivos").val(arregloCamposActivos[i].sucursal);
                $("#fechaImportacionConexionActivos").val(arregloCamposActivos[i].fecha);
            }
        };
        for (var i = 0; i < arregloCamposDepositos.length; i++) {
            if(arregloCamposDepositos[i].tipo.localeCompare(tipo) == 0) {
                $("#idClienteConexionDepositos").val(arregloCamposDepositos[i].idCliente);
                $("#numCuentaConexionDepositos").val(arregloCamposDepositos[i].numCuenta);
                $("#nombreClienteConexionDepositos").val(arregloCamposDepositos[i].nombreCliente);
                $("#tipoPersonaClienteConexionDepositos").val(arregloCamposDepositos[i].tipoPersona);
                $("#tipoSubPersonaClienteConexionDepositos").val(arregloCamposDepositos[i].tipoSubPersona);
                $("#saldoConexionDepositos").val(arregloCamposDepositos[i].saldo);
                $("#monedaConexionDepositos").val(arregloCamposDepositos[i].moneda);
                $("#tipoCuentaConexionDepositos").val(arregloCamposDepositos[i].tipoCuenta);
                $("#fechaInicioConexionDepositos").val(arregloCamposDepositos[i].fechaInicio);
                $("#fechaFinalConexionDepositos").val(arregloCamposDepositos[i].fechaFinal);
                $("#sucursalConexionDepositos").val(arregloCamposDepositos[i].sucursal);
                $("#fechaImportacionConexionDepositos").val(arregloCamposDepositos[i].fecha);
            }
        };
        for (var i = 0; i < arregloCamposPrestamos.length; i++) {
            if(arregloCamposPrestamos[i].tipo.localeCompare(tipo) == 0) {
                $("#idClienteConexionPrestamos").val(arregloCamposPrestamos[i].idCliente);
                $("#nombreClienteConexionPrestamos").val(arregloCamposPrestamos[i].nombreCliente);
                $("#tipoPersonaClienteConexionPrestamos").val(arregloCamposPrestamos[i].tipoPersona);
                $("#tipoSubPersonaClienteConexionPrestamos").val(arregloCamposPrestamos[i].tipoSubPersona);
                $("#numPrestamoConexionPrestamos").val(arregloCamposPrestamos[i].numPrestamo);
                $("#saldoConexionPrestamos").val(arregloCamposPrestamos[i].saldo);
                $("#monedaConexionPrestamos").val(arregloCamposPrestamos[i].moneda);
                $("#moraConexionPrestamos").val(arregloCamposPrestamos[i].diasMora);
                $("#amortizacionesConexionPrestamos").val(arregloCamposPrestamos[i].amortizacion);
                $("#sobregirosConexionPrestamos").val(arregloCamposPrestamos[i].sobregiro);
                $("#contingenteConexionPrestamos").val(arregloCamposPrestamos[i].contingente);
                $("#clasificacionCarteraConexionPrestamos").val(arregloCamposPrestamos[i].clasificacionCartera);
                $("#tipoCreditoConexionPrestamos").val(arregloCamposPrestamos[i].tipoCredito);
                $("#esperado30ConexionPrestamos").val(arregloCamposPrestamos[i].pago30);
                $("#esperado60ConexionPrestamos").val(arregloCamposPrestamos[i].pago60);
                $("#esperado90ConexionPrestamos").val(arregloCamposPrestamos[i].pago90);
                $("#esperado120ConexionPrestamos").val(arregloCamposPrestamos[i].pago120);
                $("#clausulasRestrictivasConexionPrestamos").val(arregloCamposPrestamos[i].clausulasRestrictivas);
                $("#financiacionGarantizadaConexionPrestamos").val(arregloCamposPrestamos[i].esFinanciacionGarantizada);
                $("#valorFinanciacionConexionPrestamos").val(arregloCamposPrestamos[i].valorFinanciacion);
                $("#alacConexionPrestamos").val(arregloCamposPrestamos[i].alac);
                $("#factorConexionPrestamos").val(arregloCamposPrestamos[i].factor);
                $("#fechaInicioConexionPrestamos").val(arregloCamposPrestamos[i].fechaInicio);
                $("#fechaExpiracionConexionPrestamos").val(arregloCamposPrestamos[i].fechaFinal);
                $("#montoOtorgadoConexionPrestamos").val(arregloCamposPrestamos[i].montoOtorgado);
                $("#sucursalConexionPrestamos").val(arregloCamposPrestamos[i].sucursal);
                $("#fechaImportacionConexionPrestamos").val(arregloCamposPrestamos[i].fecha);
            }
        };
    }
}

var arregloErroresExcel = [];
var arregloErroresInsercion = [];
var contadorInserciones = 0;
var totalInserciones = 0;
var insertoEnDBListas = false;

function saveActivosDB (indexTabla) {
    var entrar = true, campo = '';
    if($.trim($("#cuentaConexionActivos").val()).length == 0) {
        entrar = false;
        campo = 'número de cuenta';
    } else if($.trim($("#nombreConexionActivos").val()).length == 0) {
        entrar = false;
        campo = 'nombre';
    } else if($.trim($("#saldoConexionActivos").val()).length == 0) {
        entrar = false;
        campo = 'saldo';
    } else if($.trim($("#monedaConexionActivos").val()).length == 0) {
        entrar = false;
        campo = 'moneda';
    } else if($.trim($("#sucursalConexionActivos").val()).length == 0) {
        entrar = false;
        campo = 'agencia';
    } else if($.trim($("#activosUserDB").val()).length == 0 && $("ul#myTabActivos li.active")[0].value == 0) {
        entrar = false;
        campo = 'usuario de la base de datos';
    } else if($.trim($("#activosPasswordDB").val()).length == 0 && $("ul#myTabActivos li.active")[0].value == 0) {
        entrar = false;
        campo = 'contraseña de la base de datos';
    } else if($.trim($("#activosServerDB").val()).length == 0 && $("ul#myTabActivos li.active")[0].value == 0) {
        entrar = false;
        campo = 'servidor de la base de datos';
    } else if($.trim($("#activosDataBaseDB").val()).length == 0 && $("ul#myTabActivos li.active")[0].value == 0) {
        entrar = false;
        campo = 'nombre de la base de datos';
    } else if($.trim($("#activosTableDB").val()).length == 0 && $("ul#myTabActivos li.active")[0].value == 0) {
        entrar = false;
        campo = 'tabla de la base de datos';
    }
    if(entrar) {
        var elemento = $("ul#myTabActivos li.active");
        var indice = elemento[0].value;
        //Indice 1 = Excel
        arregloErroresExcel = [];
        arregloErroresInsercion = [];
        contadorInserciones = 0;
        totalInserciones = 0;
        insertoEnDBListas = false;
        if(indice == 0) {
            var existe = arregloConecciones.filter(function(object) {
                            return object.tipo == "mssql" && object.arreglo == 'arregloActivos';
                        });
            if(existe.length > 0) {
                $("body").overhang({
                    type: "confirm",
                    primary: "#f5a433",
                    accent: "#dc9430",
                    yesColor: "#3498DB",
                    message: 'Ya existe una conneción para esta base de datos. Esta seguro que desea modificarla?',
                    overlay: true,
                    yesMessage: "Modificar",
                    noMessage: "Cancelar",
                    callback: function (value) {
                        if(value){
                            modifyConnection(existe[0].ID, indexTabla);
                            saveFields("mssql", indexTabla);
                        }
                    }
                });
            } else {
                $("body").overhang({
                    type: "confirm",
                    primary: "#f5a433",
                    accent: "#dc9430",
                    yesColor: "#3498DB",
                    message: 'Esta seguro que desea guardar la conneción?',
                    overlay: true,
                    yesMessage: "Guardar",
                    noMessage: "Cancelar",
                    callback: function (value) {
                        if(value){
                            createConnection(indice, indexTabla);
                            saveFields("mssql", indexTabla);
                        }
                    }
                });
            }
        } else if(indice == 1) {
            if(arregloFOSEDE.length > 0) {
                var cuenta = $.trim($("#cuentaConexionActivos").val());
                var nombre = $.trim($("#nombreConexionActivos").val());
                var saldo = $.trim($("#saldoConexionActivos").val());
                var moneda = $.trim($("#monedaConexionActivos").val());
                var sucursal = $.trim($("#sucursalConexionActivos").val());
                var nombreHoja = $.trim($("#activosTableExcel").val());
                var fechaImportacion = $.trim($("#fechaImportacionConexionActivos").val());
                var filaInicial = $.trim($("#activosExcelInicio").val());
                var filaFinal = $.trim($("#activosExcelFinal").val());
                myWorker.postMessage("init");
                $( ".loadingScreen" ).fadeIn();
                $("#descripcionLoading").text('');
                setTimeout(function(){
                    if(cuenta.length > 0) {
                        if(isNaN(cuenta)) {
                            if(nombre.length > 0) {
                                if(isNaN(nombre)) {
                                    if(moneda.length > 0) {
                                        if(isNaN(moneda)) {
                                            if(saldo.length > 0) {
                                                if(isNaN(saldo)) {
                                                    if(sucursal.length > 0) {
                                                        if(isNaN(sucursal)) {
                                                            if(fechaImportacion.length > 0) {
                                                                if(isNaN(fechaImportacion)) {
                                                                    if(nombreHoja.length > 0) {
                                                                        if(!isNaN(filaInicial) && filaInicial.length>0) {
                                                                            var file = dialog.showOpenDialog({
                                                                                title: 'Seleccione un archivo',
                                                                                filters: [{
                                                                                    name: "Spreadsheets",
                                                                                    extensions: "xls|xlsx|xlsm|xlsb|xml|xlw|xlc|csv|txt|dif|sylk|slk|prn|ods|fods|uos|dbf|wks|123|wq1|qpw".split("|")
                                                                                }],
                                                                                properties: ['openFile']
                                                                            });
                                                                            var workbook;
                                                                            if(file != undefined && file.length > 0) {
                                                                                workbook = XLSX.readFile(file[0]);
                                                                                var sheet = workbook.Sheets[nombreHoja];
                                                                                if(sheet != null) {
                                                                                    if(filaFinal.length == 0)
                                                                                        filaFinal = 0;
                                                                                    var arregloDeActivos = [];
                                                                                    cuenta = cuenta.toUpperCase();
                                                                                    nombre = nombre.toUpperCase();
                                                                                    saldo = saldo.toUpperCase();
                                                                                    moneda = moneda.toUpperCase();
                                                                                    sucursal = sucursal.toUpperCase();
                                                                                    fechaImportacion = fechaImportacion.toUpperCase();
                                                                                    filaInicial = parseInt(filaInicial);
                                                                                    filaFinal = parseInt(filaFinal);
                                                                                    if(filaFinal != 0) {
                                                                                        for (var i = filaInicial; i <= filaFinal; i++) {
                                                                                            if(sheet[cuenta+i] != undefined && sheet[cuenta+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[saldo+i] != undefined && sheet[saldo+i].v.toString().length > 0 && sheet[moneda+i] != undefined && sheet[moneda+i].v.toString().length > 0 && sheet[sucursal+i] != undefined && sheet[sucursal+i].v.toString().length > 0 && sheet[fechaImportacion+i] != undefined && sheet[fechaImportacion+i].w.toString().length > 0) {
                                                                                                var activoCuenta = $.trim(sheet[cuenta+i].v);
                                                                                                var activoNombre = $.trim(sheet[nombre+i].v);
                                                                                                var activoSaldo = $.trim(sheet[saldo+i].v);
                                                                                                var activoMoneda = $.trim(sheet[moneda+i].v);
                                                                                                var activoSucursal = $.trim(sheet[sucursal+i].v);
                                                                                                var activoFechaImportacion = $.trim(sheet[fechaImportacion+i].w);
                                                                                                activoCuenta = activoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                activoNombre = activoNombre.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                activoMoneda = activoMoneda.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                activoSucursal = activoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                activoNombre = activoNombre.toLowerCase();
                                                                                                activoNombre = UpperCasefirst(activoNombre);
                                                                                                activoMoneda = activoMoneda.toLowerCase();
                                                                                                activoMoneda = UpperCasefirst(activoMoneda);
                                                                                                if(existeMonedaFOSEDE(activoMoneda)) {
                                                                                                    arregloDeActivos.push({cuenta: activoCuenta, nombre: activoNombre, saldo: activoSaldo, moneda: activoMoneda, sucursal: activoSucursal, fechaImportacion: activoFechaImportacion});
                                                                                                    totalInserciones++;
                                                                                                } else 
                                                                                                    arregloErroresInsercion.push({b: "Activo: "+activoCuenta, c: "No existe un monto FOSEDE para el tipo de moneda"});
                                                                                            } else if(sheet[cuenta+i] != undefined || sheet[nombre+i] != undefined|| sheet[saldo+i] != undefined || sheet[moneda+i] != undefined|| sheet[sucursal+i] != undefined || sheet[fechaImportacion+i] != undefined)
                                                                                                arregloErroresExcel.push(i);
                                                                                        };
                                                                                    } else {
                                                                                        var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
                                                                                        finalRow = parseInt(finalRow);
                                                                                        for (var i = filaInicial; i <= finalRow; i++) {
                                                                                            console.log('YAAA');
                                                                                            if(sheet[cuenta+i] != undefined && sheet[cuenta+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[saldo+i] != undefined && sheet[saldo+i].v.toString().length > 0 && sheet[moneda+i] != undefined && sheet[moneda+i].v.toString().length > 0 && sheet[sucursal+i] != undefined && sheet[sucursal+i].v.toString().length > 0 && sheet[fechaImportacion+i] != undefined && sheet[fechaImportacion+i].w.toString().length > 0) {
                                                                                                var activoCuenta = $.trim(sheet[cuenta+i].v);
                                                                                                var activoNombre = $.trim(sheet[nombre+i].v);
                                                                                                var activoSaldo = $.trim(sheet[saldo+i].v);
                                                                                                var activoMoneda = $.trim(sheet[moneda+i].v);
                                                                                                var activoSucursal = $.trim(sheet[sucursal+i].v);
                                                                                                var activoFechaImportacion = $.trim(sheet[fechaImportacion+i].w);
                                                                                                activoCuenta = activoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                activoNombre = activoNombre.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                activoSucursal = activoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                activoNombre = activoNombre.toLowerCase();
                                                                                                activoNombre = UpperCasefirst(activoNombre);
                                                                                                activoMoneda = activoMoneda.toLowerCase();
                                                                                                activoMoneda = UpperCasefirst(activoMoneda);
                                                                                                if(existeMonedaFOSEDE(activoMoneda)) {
                                                                                                    arregloDeActivos.push({cuenta: activoCuenta, nombre: activoNombre, saldo: activoSaldo, moneda: activoMoneda, sucursal: activoSucursal, fechaImportacion: activoFechaImportacion});
                                                                                                    totalInserciones++;
                                                                                                } else 
                                                                                                    arregloErroresInsercion.push({b: "Activo: "+activoCuenta, c: "No existe un monto FOSEDE para el tipo de moneda"});
                                                                                            } else if(sheet[cuenta+i] != undefined || sheet[nombre+i] != undefined|| sheet[saldo+i] != undefined || sheet[moneda+i] != undefined|| sheet[sucursal+i] != undefined || sheet[fechaImportacion+i] != undefined)
                                                                                                arregloErroresExcel.push(i);
                                                                                        };
                                                                                    }
                                                                                    for (var i = 0; i < arregloDeActivos.length; i++) {
                                                                                        if(arregloDeActivos[i].cuenta.length < 31) {
                                                                                            if(arregloDeActivos[i].nombre.length < 120) {
                                                                                                if(arregloDeActivos[i].saldo.toString().length < 20) {
                                                                                                    if(arregloDeActivos[i].moneda.length < 31) {
                                                                                                        if(arregloDeActivos[i].sucursal.length < 51) {
                                                                                                            if(Date.parse(new Date(arregloDeActivos[i].fechaImportacion))) {
                                                                                                                //createAsset( arregloDeActivos[i] );
                                                                                                            } else {
                                                                                                                arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "La fecha de importación no es valida"});
                                                                                                                contadorInserciones++;
                                                                                                            }
                                                                                                        } else {
                                                                                                            arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "El valor de sucursal es mayor a 50 caracteres"});
                                                                                                            contadorInserciones++;
                                                                                                        }
                                                                                                    } else {
                                                                                                        arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "El valor de la moneda es mayor a 30 caracteres"});
                                                                                                        contadorInserciones++;
                                                                                                    }
                                                                                                } else {
                                                                                                    arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "El valor del saldo es mayor a 20 caracteres"});
                                                                                                    contadorInserciones++;
                                                                                                }
                                                                                            } else {
                                                                                                arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "El valor es mayor a 120 caracteres"});
                                                                                                contadorInserciones++;
                                                                                            }
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "El valor de la cuenta es mayor a 30 caracteres"});
                                                                                            contadorInserciones++;
                                                                                        }
                                                                                    };
                                                                                    if(arregloDeActivos.length == 0) {
                                                                                        $("body").overhang({
                                                                                            type: "error",
                                                                                            primary: "#f84a1d",
                                                                                            accent: "#d94e2a",
                                                                                            message: "Error al insertar variable en columna inexistente o el archivo estaba vacio.",
                                                                                            overlay: true,
                                                                                            closeConfirm: true
                                                                                        });
                                                                                        $(".loadingScreen").hide();
                                                                                        stopTimer();
                                                                                        printErrorFile();
                                                                                    } else {
                                                                                        if(arregloErroresInsercion.length > 0 || arregloErroresExcel.length > 0) {
                                                                                            $("body").overhang({
                                                                                                type: "confirm",
                                                                                                primary: "#f5a433",
                                                                                                accent: "#dc9430",
                                                                                                yesColor: "#3498DB",
                                                                                                message: 'Se encontrarón errores en el archivo. Desea importar igual?',
                                                                                                overlay: true,
                                                                                                yesMessage: "Importar",
                                                                                                noMessage: "Cancelar",
                                                                                                callback: function (value) {
                                                                                                    if(value){
                                                                                                        for (var i = 0; i < arregloDeActivos.length; i++) {
                                                                                                            if(arregloDeActivos[i].cuenta.length < 31) {
                                                                                                                if(arregloDeActivos[i].nombre.length < 120) {
                                                                                                                    if(arregloDeActivos[i].saldo.toString().length < 20) {
                                                                                                                        if(arregloDeActivos[i].moneda.length < 31) {
                                                                                                                            if(arregloDeActivos[i].sucursal.length < 51) {
                                                                                                                                if(Date.parse(new Date(arregloDeActivos[i].fechaImportacion))) {
                                                                                                                                    createAsset( arregloDeActivos[i] );
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        };
                                                                                                    } else {
                                                                                                        $(".loadingScreen").hide();
                                                                                                        stopTimer();
                                                                                                    }
                                                                                                }
                                                                                            });
                                                                                        } else {
                                                                                            for (var i = 0; i < arregloDeActivos.length; i++) {
                                                                                                if(arregloDeActivos[i].cuenta.length < 31) {
                                                                                                    if(arregloDeActivos[i].nombre.length < 120) {
                                                                                                        if(arregloDeActivos[i].saldo.toString().length < 20) {
                                                                                                            if(arregloDeActivos[i].moneda.length < 31) {
                                                                                                                if(arregloDeActivos[i].sucursal.length < 51) {
                                                                                                                    if(Date.parse(new Date(arregloDeActivos[i].fechaImportacion))) {
                                                                                                                        createAsset( arregloDeActivos[i] );
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            };
                                                                                        }
                                                                                    }
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
                                                                            } else {
                                                                                $(".loadingScreen").hide();
                                                                                stopTimer();
                                                                            }
                                                                        } else {
                                                                            $("body").overhang({
                                                                                type: "error",
                                                                                primary: "#f84a1d",
                                                                                accent: "#d94e2a",
                                                                                message: "Ingrese un valor para la fila inicial de la hoja de excel.",
                                                                                overlay: true,
                                                                                closeConfirm: true
                                                                            });
                                                                            $(".loadingScreen").hide();
                                                                            stopTimer();
                                                                        }
                                                                    } else {
                                                                        $("body").overhang({
                                                                            type: "error",
                                                                            primary: "#f84a1d",
                                                                            accent: "#d94e2a",
                                                                            message: "Ingrese un valor para el nombre de la hoja de excel.",
                                                                            overlay: true,
                                                                            closeConfirm: true
                                                                        });
                                                                        $(".loadingScreen").hide();
                                                                        stopTimer();
                                                                    }
                                                                } else {
                                                                    $("body").overhang({
                                                                        type: "error",
                                                                        primary: "#f84a1d",
                                                                        accent: "#d94e2a",
                                                                        message: "Ingrese una letra para la columna de fecha de importación válida.",
                                                                        overlay: true,
                                                                        closeConfirm: true
                                                                    });
                                                                    $(".loadingScreen").hide();
                                                                    stopTimer();
                                                                }
                                                            } else {
                                                                $("body").overhang({
                                                                    type: "error",
                                                                    primary: "#f84a1d",
                                                                    accent: "#d94e2a",
                                                                    message: "Ingrese un valor para la columna de fecha de importación.",
                                                                    overlay: true,
                                                                    closeConfirm: true
                                                                });
                                                                $(".loadingScreen").hide();
                                                                stopTimer();
                                                            }
                                                        } else {
                                                            $("body").overhang({
                                                                type: "error",
                                                                primary: "#f84a1d",
                                                                accent: "#d94e2a",
                                                                message: "Ingrese una letra para la columna del campo de sucursal válida.",
                                                                overlay: true,
                                                                closeConfirm: true
                                                            });
                                                            $(".loadingScreen").hide();
                                                            stopTimer();
                                                        }
                                                    } else {
                                                        $("body").overhang({
                                                            type: "error",
                                                            primary: "#f84a1d",
                                                            accent: "#d94e2a",
                                                            message: "Ingrese un valor para la columna del campo de sucursal.",
                                                            overlay: true,
                                                            closeConfirm: true
                                                        });
                                                        $(".loadingScreen").hide();
                                                        stopTimer();
                                                    }
                                                } else {
                                                    $("body").overhang({
                                                        type: "error",
                                                        primary: "#f84a1d",
                                                        accent: "#d94e2a",
                                                        message: "Ingrese una letra para la columna del campo de saldo válida.",
                                                        overlay: true,
                                                        closeConfirm: true
                                                    });
                                                    $(".loadingScreen").hide();
                                                    stopTimer();
                                                }
                                            } else {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#f84a1d",
                                                    accent: "#d94e2a",
                                                    message: "Ingrese un valor para la columna del campo de saldo.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                                $(".loadingScreen").hide();
                                                stopTimer();
                                            }
                                        } else {
                                            $("body").overhang({
                                                type: "error",
                                                primary: "#f84a1d",
                                                accent: "#d94e2a",
                                                message: "Ingrese una letra para la columna del campo de moneda válida.",
                                                overlay: true,
                                                closeConfirm: true
                                            });
                                            $(".loadingScreen").hide();
                                            stopTimer();
                                        }
                                    } else {
                                        $("body").overhang({
                                            type: "error",
                                            primary: "#f84a1d",
                                            accent: "#d94e2a",
                                            message: "Ingrese un valor para la columna del campo de moneda.",
                                            overlay: true,
                                            closeConfirm: true
                                        });
                                        $(".loadingScreen").hide();
                                        stopTimer();
                                    }
                                } else {
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Ingrese una letra para la columna del campo de nombre válida.",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                    $(".loadingScreen").hide();
                                    stopTimer();
                                }
                            } else {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Ingrese un valor para la columna del campo de nombre.",
                                    overlay: true,
                                    closeConfirm: true
                                });
                                $(".loadingScreen").hide();
                                stopTimer();
                            }
                        } else {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "Ingrese una letra para la columna del campo de cuenta válida.",
                                overlay: true,
                                closeConfirm: true
                            });
                            $(".loadingScreen").hide();
                            stopTimer();
                        }
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Ingrese un valor para la columna del campo de cuenta.",
                            overlay: true,
                            closeConfirm: true
                        });
                        $(".loadingScreen").hide();
                        stopTimer();
                    }
                }, 3000);
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "No existen valores del monto FOSEDE. Creé un valor antes de importar",
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
            message: "Ingrese un valor para la columna de "+campo+".",
            overlay: true,
            closeConfirm: true
        });
    }
}

function createAsset (activo) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Activos (cuenta, nombre, saldo, moneda, sucursal, fecha) values ('"+$.trim(activo.cuenta)+"','"+$.trim(activo.nombre)+"',"+activo.saldo+",'"+$.trim(activo.moneda)+"','"+$.trim(activo.sucursal)+"','"+formatDateCreation(new Date(activo.fechaImportacion))+"')", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        contadorInserciones++;
                        arregloErroresInsercion.push({b: "Activo: "+activo.nombre, c: "Error en inserción mssql"});
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

function createConnection (indexTipo, indexTabla) {
    var arreglo;
    var usuario;
    var constrasena;
    var server;
    var basedatos;
    var tabla;
    var tipo;
    if(indexTipo == 0)
        tipo = 'mssql';
    else if(indexTipo == 1)
        tipo = 'excel';
    if(indexTabla == 0) {
        arreglo = 'arregloActivos';
        usuario = $.trim($("#activosUserDB").val());
        constrasena = $.trim($("#activosPasswordDB").val());
        server = $.trim($("#activosServerDB").val());
        basedatos = $.trim($("#activosDataBaseDB").val());
        tabla = $.trim($("#activosTableDB").val());
    } else if(indexTabla == 1) {
        arreglo = 'arregloDepositos';
        usuario = $.trim($("#depositosUserDB").val());
        constrasena = $.trim($("#depositosPasswordDB").val());
        server = $.trim($("#depositosServerDB").val());
        basedatos = $.trim($("#depositosDataBaseDB").val());
        tabla = $.trim($("#depositosTableDB").val());
    } else if(indexTabla == 2) {
        arreglo = 'arregloPrestamos';
        usuario = $.trim($("#prestamosUserDB").val());
        constrasena = $.trim($("#prestamosPasswordDB").val());
        server = $.trim($("#prestamosServerDB").val());
        basedatos = $.trim($("#prestamosDataBaseDB").val());
        tabla = $.trim($("#prestamosTableDB").val());
    }
    if(arreglo.length>0 && arreglo.length<21){
        if(usuario.length>0 && usuario.length<101){
            if(constrasena.length>0 && constrasena.length<101){
                if(server.length>0 && server.length<101){
                    if(basedatos.length>0 && basedatos.length<101){
                        if(tabla.length>0 && tabla.length<101){
                            if(tipo.length>0 && tipo.length<11){
                                const transaction = new sql.Transaction( pool1 );
                                transaction.begin(err => {
                                    var rolledBack = false;
                                    transaction.on('rollback', aborted => {
                                        rolledBack = true;
                                    });
                                    const request = new sql.Request(transaction);
                                    request.query("insert into Bases (arreglo, usuario, constrasena, server, basedatos, tabla, tipo) values ('"+arreglo+"','"+usuario+"','"+constrasena+"','"+server+"','"+basedatos+"','"+tabla+"','"+tipo+"')", (err, result) => {
                                        if (err) {
                                            if (!rolledBack) {
                                                transaction.rollback(err => {
                                                    $("body").overhang({
                                                        type: "error",
                                                        primary: "#40D47E",
                                                        accent: "#27AE60",
                                                        message: "Error al insertar campos de conneción con la base de datos.",
                                                        overlay: true,
                                                        closeConfirm: true
                                                    });
                                                });
                                            }
                                        }  else {
                                            transaction.commit(err => {
                                                // ... error checks
                                                /*$("body").overhang({
                                                    type: "confirm",
                                                    primary: "#f5a433",
                                                    accent: "#dc9430",
                                                    yesColor: "#3498DB",
                                                    message: 'Importar los valores de la base de datos ahora?',
                                                    overlay: true,
                                                    yesMessage: "Importar",
                                                    noMessage: "Cancelar",
                                                    callback: function (value) {
                                                        if(value){
                                                            importAssets(arreglo, usuario, constrasena, server, basedatos, tabla, indexTabla);
                                                        }
                                                    }
                                                });*/
                                                loadConections();
                                            });
                                        }
                                    });
                                }); // fin transaction
                            } else {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "El tamaño del tipo de la db no puede ser igual 0 ó mayor a 10.",
                                    overlay: true,
                                    closeConfirm: true
                                });
                            }
                        } else {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "El tamaño del nombre de la tabla de la db no puede ser igual 0 ó mayor a 100.",
                                overlay: true,
                                closeConfirm: true
                            });
                        }
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "El tamaño del nombre de la base de datos no puede ser igual 0 ó mayor a 100.",
                            overlay: true,
                            closeConfirm: true
                        });
                    }
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "El tamaño del nombre del servidor de la db no puede ser igual 0 ó mayor a 100.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "El tamaño de la constraseña de la db no puede ser igual 0 ó mayor a 100.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "El tamaño del nombre de usuario de la db no puede ser igual 0 ó mayor a 100.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "El tamaño del nombre del arreglo no puede ser igual 0 ó mayor a 11.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function modifyConnection (id, indexTabla) {
    var arreglo;
    var usuario;
    var constrasena;
    var server;
    var basedatos;
    var tabla;
    if(indexTabla == 0) {
        arreglo = 'arregloActivos';
        usuario = $.trim($("#activosUserDB").val());
        constrasena = $.trim($("#activosPasswordDB").val());
        server = $.trim($("#activosServerDB").val());
        basedatos = $.trim($("#activosDataBaseDB").val());
        tabla = $.trim($("#activosTableDB").val());
    } else if(indexTabla == 1) {
        arreglo = 'arregloDepositos';
        usuario = $.trim($("#depositosUserDB").val());
        constrasena = $.trim($("#depositosPasswordDB").val());
        server = $.trim($("#depositosServerDB").val());
        basedatos = $.trim($("#depositosDataBaseDB").val());
        tabla = $.trim($("#depositosTableDB").val());
    } else if(indexTabla == 2) {
        arreglo = 'arregloPrestamos';
        usuario = $.trim($("#prestamosUserDB").val());
        constrasena = $.trim($("#prestamosPasswordDB").val());
        server = $.trim($("#prestamosServerDB").val());
        basedatos = $.trim($("#prestamosDataBaseDB").val());
        tabla = $.trim($("#prestamosTableDB").val());
    }
    if(arreglo.length>0 && arreglo.length<21){
        if(usuario.length>0 && usuario.length<101){
            if(constrasena.length>0 && constrasena.length<101){
                if(server.length>0 && server.length<101){
                    if(basedatos.length>0 && basedatos.length<101){
                        if(tabla.length>0 && tabla.length<101){
                            const transaction = new sql.Transaction( pool1 );
                            transaction.begin(err => {
                                var rolledBack = false;
                                transaction.on('rollback', aborted => {
                                    // emited with aborted === true
                                    rolledBack = true;
                                });
                                const request = new sql.Request(transaction);
                                request.query("update Bases set arreglo = '"+arreglo+"', usuario = '"+usuario+"', constrasena = '"+constrasena+"', server = '"+server+"', basedatos = '"+basedatos+"', tabla = '"+tabla+"' where ID = "+id, (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction.rollback(err => {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error al modificar campos de conneción con la base de datos.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction.commit(err => {
                                            // ... error checks
                                            /*$("body").overhang({
                                                type: "confirm",
                                                primary: "#f5a433",
                                                accent: "#dc9430",
                                                yesColor: "#3498DB",
                                                message: 'Importar los valores de la base de datos ahora?',
                                                overlay: true,
                                                yesMessage: "Importar",
                                                noMessage: "Cancelar",
                                                callback: function (value) {
                                                    if(value){
                                                        importAssets(arreglo, usuario, constrasena, server, basedatos, tabla, indexTabla);
                                                    }
                                                }
                                            });*/
                                            loadConections();
                                        });
                                    }
                                });
                            }); // fin transaction
                        } else {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "El tamaño del nombre de la tabla de la db no puede ser igual 0 ó mayor a 100.",
                                overlay: true,
                                closeConfirm: true
                            });
                        }
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "El tamaño del nombre de la base de datos no puede ser igual 0 ó mayor a 100.",
                            overlay: true,
                            closeConfirm: true
                        });
                    }
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "El tamaño del nombre del servidor de la db no puede ser igual 0 ó mayor a 100.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "El tamaño de la constraseña de la db no puede ser igual 0 ó mayor a 100.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "El tamaño del nombre de usuario de la db no puede ser igual 0 ó mayor a 100.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "El tamaño del nombre del arreglo no puede ser igual 0 ó mayor a 11.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function importAssets(arreglo, usuario, constrasena, server, basedatos, tabla, indexTabla) {
    /*if(tamanoActivos > 0) {
        $("body").overhang({
            type: "confirm",
            primary: "#f5a433",
            accent: "#dc9430",
            yesColor: "#3498DB",
            message: 'Ya existen activos en la base de datos. Desea añadir nuevos o sobrescribir los existentes?',
            overlay: true,
            yesMessage: "Añadir Nuevos",
            noMessage: "Borrar y Guardar",
            callback: function (value) {
                if(value){
                    //createConnection(indice, indexTabla);
                } else {
                    //
                }
            }
        });
    } else {
        //
    }*/
    if(indexTabla == 0 ) {
        var cuenta = $.trim($("#cuentaConexionActivos").val());
        var nombre = $.trim($("#nombreConexionActivos").val());
        var saldo = $.trim($("#saldoConexionActivos").val());
        var moneda = $.trim($("#monedaConexionActivos").val());
        var sucursal = $.trim($("#sucursalConexionActivos").val());
        var fechaImportacion = $.trim($("#fechaImportacionConexionActivos").val());
        if(cuenta.length > 0) {
            if(nombre.length > 0) {
                if(saldo.length > 0) {
                    if(moneda.length > 0) {
                        if(sucursal.length > 0) {
                            if(fechaImportacion.length > 0) {
                                const pool = new sql.ConnectionPool({
                                    user: usuario,
                                    password: constrasena,
                                    server: server,
                                    database: basedatos
                                });

                                pool.connect(err => {
                                    pool.request().query("select * from "+tabla, (err, result) => {
                                        if (err) {
                                            $("body").overhang({
                                                type: "error",
                                                primary: "#f84a1d",
                                                accent: "#d94e2a",
                                                message: "Error al conectarse con la tabla "+tabla+" de la base de datos.",
                                                overlay: true,
                                                closeConfirm: true
                                            });
                                        }  else {
                                            totalInserciones = result.recordset.length;
                                            for (var i = 0; i < result.recordset.length; i++) {
                                                let valorArreglo = result.recordset[i];
                                                valorArreglo[fechaImportacion] = new Date(valorArreglo[fechaImportacion].getUTCFullYear(), valorArreglo[fechaImportacion].getUTCMonth(), valorArreglo[fechaImportacion].getUTCDate());
                                                const transaction = new sql.Transaction( pool1 );
                                                transaction.begin(err => {
                                                    var rolledBack = false;
                                                    transaction.on('rollback', aborted => {
                                                        rolledBack = true;
                                                    });
                                                    const request = new sql.Request(transaction);
                                                    request.query("insert into Activos (cuenta, nombre, saldo, moneda, sucursal, fecha) values ('"+valorArreglo[cuenta]+"','"+valorArreglo[nombre]+"',"+valorArreglo[saldo]+",'"+valorArreglo[moneda]+"','"+valorArreglo[sucursal]+"','"+formatDateCreation(valorArreglo[fechaImportacion])+"')", (err, result) => {
                                                        if (err) {
                                                            if (!rolledBack) {
                                                                transaction.rollback(err => {
                                                                    contadorInserciones++;
                                                                    arregloErroresInsercion.push({b: "Activo: "+nombre, c: "Error en inserción mssql"});
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
                                            };
                                        }
                                    });
                                }); // fin transaction2
                            } else {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Ingrese un valor para la fecha de importación.",
                                    overlay: true,
                                    closeConfirm: true
                                });
                            }
                        } else {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "Ingrese un valor para el nombre de la columna de sucursal.",
                                overlay: true,
                                closeConfirm: true
                            });
                        }
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Ingrese un valor para el nombre de la columna de el nombre de la moneda.",
                            overlay: true,
                            closeConfirm: true
                        });
                    }
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "Ingrese un valor para el nombre de la columna de el saldo del activo.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Ingrese un valor para el nombre de la columna de el nombre del activo.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese un valor para el nombre de la columna de la cuenta del activo.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else if(indexTabla == 1 ) {
        var idcliente = $.trim($("#idClienteConexionDepositos").val());
        var nombrecliente = $.trim($("#nombreClienteConexionDepositos").val());
        var tipoPersona = $.trim($("#tipoPersonaClienteConexionDepositos").val());
        var tipoSubPersona = $.trim($("#tipoSubPersonaClienteConexionDepositos").val());
        var saldo = $.trim($("#saldoConexionDepositos").val());
        var moneda = $.trim($("#monedaConexionDepositos").val());
        var tipoCuenta = $.trim($("#tipoCuentaConexionDepositos").val());
        var fechaInicio = $.trim($("#fechaInicioConexionDepositos").val());
        var fechaFinal = $.trim($("#fechaFinalConexionDepositos").val());
        var sucursal = $.trim($("#sucursalConexionDepositos").val());
        var fechaImportacion = $.trim($("#fechaImportacionConexionDepositos").val());
        if(idcliente.length > 0) {
            if(nombrecliente.length > 0) {
                if(tipoPersona.length > 0) {
                    if(tipoSubPersona.length > 0) {
                        if(saldo.length > 0) {
                            if(moneda.length > 0) {
                                if(tipoCuenta.length > 0) {
                                    if(fechaInicio.length > 0) {
                                        if(fechaFinal.length > 0) {
                                            if(sucursal.length > 0) {
                                                if(fechaImportacion.length > 0) {
                                                    const pool = new sql.ConnectionPool({
                                                        user: usuario,
                                                        password: constrasena,
                                                        server: server,
                                                        database: basedatos
                                                    });

                                                    pool.connect(err => {
                                                        pool.request().query("select * from "+tabla, (err, result) => {
                                                            if (err) {
                                                                $("body").overhang({
                                                                    type: "error",
                                                                    primary: "#f84a1d",
                                                                    accent: "#d94e2a",
                                                                    message: "Error al conectarse con la tabla "+tabla+" de la base de datos.",
                                                                    overlay: true,
                                                                    closeConfirm: true
                                                                });
                                                            }  else {
                                                                totalInserciones = result.recordset.length;
                                                                for (var i = 0; i < result.recordset.length; i++) {
                                                                    let valorDepositos = result.recordset[i];
                                                                    valorDepositos[fechaImportacion] = new Date(valorDepositos[fechaImportacion].getUTCFullYear(), valorDepositos[fechaImportacion].getUTCMonth(), valorDepositos[fechaImportacion].getUTCDate());
                                                                    if(valorDepositos[idcliente].length < 31) {
                                                                        if(valorDepositos[nombrecliente].length < 81) {
                                                                            if(valorDepositos[tipoPersona].length < 81) {
                                                                                if(valorDepositos[tipoSubPersona].length < 81) {
                                                                                    if(valorDepositos[saldo].toString().length < 21) {
                                                                                        if(valorDepositos[moneda].length < 31) {
                                                                                            if(valorDepositos[tipoCuenta].length < 101) {
                                                                                                if(Date.parse(valorDepositos[fechaInicio])) {
                                                                                                    if(Date.parse(valorDepositos[fechaFinal])) {
                                                                                                        if(valorDepositos[sucursal].length < 51) {
                                                                                                            if(Date.parse(valorDepositos[fechaImportacion])) {
                                                                                                                const transaction = new sql.Transaction( pool1 );
                                                                                                                transaction.begin(err => {
                                                                                                                    var rolledBack = false;
                                                                                                                    transaction.on('rollback', aborted => {
                                                                                                                        rolledBack = true;
                                                                                                                    });
                                                                                                                    const request = new sql.Request(transaction);
                                                                                                                    request.query("insert into Depositos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, plazoResidual, sucursal, fecha) values ('"+valorDepositos[idcliente]+"','"+valorDepositos[nombrecliente]+"','"+valorDepositos[tipoPersona]+"','"+valorDepositos[tipoSubPersona]+"',"+valorDepositos[saldo]+",'"+valorDepositos[moneda]+"','"+valorDepositos[tipoCuenta]+"',"+valorDepositos[plazoResidual]+",'"+valorDepositos[sucursal]+"','"+formatDateCreation(valorDepositos[fechaImportacion])+"')", (err, result) => {
                                                                                                                        if (err) {
                                                                                                                            if (!rolledBack) {
                                                                                                                                transaction.rollback(err => {
                                                                                                                                    contadorInserciones++;
                                                                                                                                    arregloErroresInsercion.push({b: valorDepositos[idcliente], c: "Error en inserción mssql"});
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
                                                                                                            } else {
                                                                                                                arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "La fecha de importación no es valida"});
                                                                                                            }
                                                                                                        } else {
                                                                                                            arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "El valor del sucursal es mayor a 50 caracteres"});
                                                                                                        }
                                                                                                    } else {
                                                                                                        arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "Ingrese una fecha valida para la fecha final"});
                                                                                                    }
                                                                                                } else {
                                                                                                    arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "Ingrese una fecha valida para fecha de inicio"});
                                                                                                }
                                                                                            } else {
                                                                                                arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "El valor del tipo de cuenta es mayor a 100 caracteres"});
                                                                                            }
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "El valor de la moneda es mayor a 30 caracteres"});
                                                                                        }
                                                                                    } else {
                                                                                        arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "El valor del saldo es mayor a 20 caracteres"});
                                                                                    }
                                                                                } else {
                                                                                    arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "El valor del tipo de sub-persona es mayor a 80 caracteres"});
                                                                                }
                                                                            } else {
                                                                                arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "El valor del tipo de persona es mayor a 80 caracteres"});
                                                                            }
                                                                        } else {
                                                                            arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "El valor del nombre del cliente es mayor a 80 caracteres"});
                                                                        }
                                                                    } else {
                                                                        arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "El valor del identificador del cliente es mayor a 30 caracteres"});
                                                                    }
                                                                };
                                                            }
                                                        });
                                                    }); // fin transaction2
                                                } else {
                                                    $("body").overhang({
                                                        type: "error",
                                                        primary: "#f84a1d",
                                                        accent: "#d94e2a",
                                                        message: "Ingrese un valor para la fecha de importación.",
                                                        overlay: true,
                                                        closeConfirm: true
                                                    });
                                                }
                                            } else {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#f84a1d",
                                                    accent: "#d94e2a",
                                                    message: "Ingrese un valor para el nombre de la sucursal del depósito.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            }
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
                                        message: "Ingrese un valor para el tipo de la cuenta del depósito.",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                }
                            } else {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Ingrese un valor para el nombre de la moneda del depósito.",
                                    overlay: true,
                                    closeConfirm: true
                                });
                            }
                        } else {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "Ingrese un valor para el saldo del depósito.",
                                overlay: true,
                                closeConfirm: true
                            });
                        }
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Ingrese un valor para el tipo de sub-persona del depósito.",
                            overlay: true,
                            closeConfirm: true
                        });
                    }
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "Ingrese un valor para el tipo de persona del depósito.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Ingrese un valor para el nombre del cliente del depósito.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese un valor para el id del cliente del depósito.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else if(indexTabla == 2 ) {
        var identificador = $.trim($("#idClienteConexionPrestamos").val());
        var nombre = $.trim($("#nombreClienteConexionPrestamos").val());
        var tipoPersona = $.trim($("#tipoPersonaClienteConexionPrestamos").val());
        var tipoSubPersona = $.trim($("#tipoSubPersonaClienteConexionPrestamos").val());
        var numPrestamo = $.trim($("#numPrestamoConexionPrestamos").val());
        var saldo = $.trim($("#saldoConexionPrestamos").val());
        var moneda = $.trim($("#monedaConexionPrestamos").val());
        var diasMora = $.trim($("#moraConexionPrestamos").val());
        var amortizaciones = $.trim($("#amortizacionesConexionPrestamos").val());
        var sobregiro = $.trim($("#sobregirosConexionPrestamos").val());
        var contingente = $.trim($("#contingenteConexionPrestamos").val());
        var clasificacionCartera = $.trim($("#clasificacionCarteraConexionPrestamos").val());
        var tipoCredito = $.trim($("#tipoCreditoConexionPrestamos").val());
        var esperado30 = $.trim($("#esperado30ConexionPrestamos").val());
        var esperado60 = $.trim($("#esperado60ConexionPrestamos").val());
        var esperado90 = $.trim($("#esperado90ConexionPrestamos").val());
        var esperado120 = $.trim($("#esperado120ConexionPrestamos").val());
        var clausulasRestrictivas = $.trim($("#clausulasRestrictivasConexionPrestamos").val());
        var financiacionGarantizada = $.trim($("#financiacionGarantizadaConexionPrestamos").val());
        var valorFinanciacion = $.trim($("#valorFinanciacionConexionPrestamos").val());
        var alac = $.trim($("#alacConexionPrestamos").val());
        var factor = $.trim($("#factorConexionPrestamos").val());
        var fechaInicio = $.trim($("#fechaInicioConexionPrestamos").val());
        var fechaFinal = $.trim($("#fechaExpiracionConexionPrestamos").val());
        var montoOtorgado = $.trim($("#montoOtorgadoConexionPrestamos").val());
        var sucursal = $.trim($("#sucursalConexionPrestamos").val());
        var fechaImportacion = $.trim($("#fechaImportacionConexionPrestamos").val());
        /*var nombreHoja = $.trim($("#prestamosTableExcel").val());
        var filaInicial = $.trim($("#prestamosExcelInicio").val());
        var filaFinal = $.trim($("#prestamosExcelFinal").val());*/
        const pool = new sql.ConnectionPool({
            user: usuario,
            password: constrasena,
            server: server,
            database: basedatos
        });

        pool.connect(err => {
            pool.request().query("select * from "+tabla, (err, result) => {
                if (err) {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "Error al conectarse con la tabla "+tabla+" de la base de datos.",
                        overlay: true,
                        closeConfirm: true
                    });
                }  else {
                    totalInserciones = result.recordset.length;
                    for (var i = 0; i < result.recordset.length; i++) {
                        let valorDepositos = result.recordset[i];
                        valorDepositos[fechaImportacion] = new Date(valorDepositos[fechaImportacion].getUTCFullYear(), valorDepositos[fechaImportacion].getUTCMonth(), valorDepositos[fechaImportacion].getUTCDate());
                        if(valorDepositos[identificador].toString().length < 31) {
                            if(valorDepositos[nombre].toString().length < 81) {
                                if(valorDepositos[tipoPersona].toString().length < 81) {
                                    if(valorDepositos[tipoSubPersona].toString().length < 81) {
                                        if(valorDepositos[numPrestamo].toString().length < 51) {
                                            if(valorDepositos[saldo].toString().length < 21) {
                                                if(valorDepositos[moneda].toString().length < 31) {
                                                    if(valorDepositos[montoOtorgado].toString().length < 21) {
                                                        if(valorDepositos[diasMora].toString().length < 21) {
                                                            if(valorDepositos[amortizaciones].toString().length < 21) {
                                                                if(valorDepositos[sobregiro].toString().length < 21) {
                                                                    if(valorDepositos[contingente].toString().length < 21) {
                                                                        if(valorDepositos[clasificacionCartera].toString().length < 3) {
                                                                            if(valorDepositos[tipoCredito].toString().length < 81) {
                                                                                if(valorDepositos[esperado30].toString().length < 21) {
                                                                                    if(valorDepositos[esperado60].toString().length < 21) {
                                                                                        if(valorDepositos[esperado90].toString().length < 21) {
                                                                                            if(valorDepositos[esperado120].toString().length < 21) {
                                                                                                if(valorDepositos[clausulasRestrictivas] != undefined) {
                                                                                                    if(valorDepositos[financiacionGarantizada] != undefined) {
                                                                                                        if(valorDepositos[valorFinanciacion].toString().length < 21) {
                                                                                                            if(valorDepositos[alac].toString().length < 30) {
                                                                                                                if(valorDepositos[factor].toString().length > 0) {
                                                                                                                    if(Date.parse(valorDepositos[fechaInicio])) {
                                                                                                                        if(Date.parse(valorDepositos[fechaFinal])) {
                                                                                                                            if(valorDepositos[sucursal].length < 51) {
                                                                                                                                if(Date.parse(valorDepositos[fechaImportacion])) {
                                                                                                                                    const transaction = new sql.Transaction( pool1 );
                                                                                                                                    transaction.begin(err => {
                                                                                                                                        var rolledBack = false;
                                                                                                                                        transaction.on('rollback', aborted => {
                                                                                                                                            rolledBack = true;
                                                                                                                                        });
                                                                                                                                        const request = new sql.Request(transaction);
                                                                                                                                        request.query("insert into Prestamos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, clausulasRestrictivas, esFinanciacionGarantizada, valorFinanciacion, alac, factor, fechaInicio, fechaFinal, sucursal, fecha) values ('"+valorDepositos[identificador]+"','"+valorDepositos[nombre]+"','"+valorDepositos[tipoPersona]+"','"+valorDepositos[tipoSubPersona]+"',"+valorDepositos[numPrestamo]+","+valorDepositos[saldo]+",'"+valorDepositos[moneda]+"',"+valorDepositos[montoOtorgado]+","+valorDepositos[diasMora]+","+valorDepositos[amortizaciones]+","+valorDepositos[sobregiro]+","+valorDepositos[contingente]+",'"+valorDepositos[clasificacionCartera]+"','"+valorDepositos[tipoCredito]+"',"+valorDepositos[esperado30]+","+valorDepositos[esperado60]+","+valorDepositos[esperado90]+","+valorDepositos[esperado120]+",'"+valorDepositos[clausulasRestrictivas]+"','"+valorDepositos[financiacionGarantizada]+"',"+valorDepositos[valorFinanciacion]+",'"+valorDepositos[alac]+"',"+valorDepositos[factor]+",'"+formatDateCreation(valorDepositos[fechaInicio])+"','"+formatDateCreation(valorDepositos[fechaFinal])+"','"+valorDepositos[sucursal]+"','"+formatDateCreation(valorDepositos[fechaImportacion])+"')", (err, result) => {
                                                                                                                                            if (err) {
                                                                                                                                                if (!rolledBack) {
                                                                                                                                                    transaction.rollback(err => {
                                                                                                                                                        contadorInserciones++;
                                                                                                                                                        arregloErroresInsercion.push({b: valorDepositos[numPrestamo], c: "Error en inserción mssql"});
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
                                                                                                                                } else {
                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "La fecha de importación no es valida"});
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de sucursal es mayor a 50 caracteres"});
                                                                                                                            }
                                                                                                                        } else {
                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "La fecha final no es valida"});
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "La fecha inicial no es valida"});
                                                                                                                    }
                                                                                                                } else {
                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El factor no es valido"});
                                                                                                                }
                                                                                                            } else {
                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor del alac no es valido"});
                                                                                                            }
                                                                                                        } else {
                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de la financiación no es valida"});
                                                                                                        }
                                                                                                    } else {
                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "La financiacion garantizada no es valida"});
                                                                                                    }
                                                                                                } else {
                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de clausulas restrictivas tiene que ser mayor a 0 caracteres"});
                                                                                                }
                                                                                            } else {
                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de pago en 120 días es mayor a 20 caracteres"});
                                                                                            }
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de pago en 90 días es mayor a 20 caracteres"});
                                                                                        }
                                                                                    } else {
                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de pago en 60 días es mayor a 20 caracteres"});
                                                                                    }
                                                                                } else {
                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de pago en 30 días es mayor a 20 caracteres"});
                                                                                }
                                                                            } else {
                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de tipo de crédito es mayor a 80 caracteres"});
                                                                            }
                                                                        } else {
                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de clasificación de cartera es mayor a 2 caracteres"});
                                                                        }
                                                                    } else {
                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de contingente es mayor a 20 caracteres"});
                                                                    }
                                                                } else {
                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de sobregiro es mayor a 20 caracteres"});
                                                                }
                                                            } else {
                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de amortización es mayor a 20 caracteres"});
                                                            }
                                                        } else {
                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de días de mora es mayor a 20 caracteres"});
                                                        }
                                                    } else {
                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de monto otorgado es mayor a 20 caracteres"});
                                                    }
                                                } else {
                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de moneda es mayor a 30 caracteres"});
                                                }
                                            } else {
                                                arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de saldo es mayor a 20 caracteres"});
                                            }
                                        } else {
                                            arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de número de préstamo es mayor a 50 caracteres"});
                                        }
                                    } else {
                                        arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de tipo de sub-persona es mayor a 80 caracteres"});
                                    }
                                } else {
                                    arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de tipo de persona es mayor a 80 caracteres"});
                                }
                            } else {
                                arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de nombre del cliente es mayor a 80 caracteres"});
                            }
                        } else {
                            arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de identificador del cliente es mayor a 30 caracteres"});
                        }
                    };
                }
            });
        }); // fin transaction2
    }
}

function saveDepositosDB (indexTabla) {
    var entrar = true, campo = '';
    if($.trim($("#idClienteConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'id del cliente';
    } else if($.trim($("#numCuentaConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'número de cuenta';
    } else if($.trim($("#nombreClienteConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'nombre del cliente';
    } else if($.trim($("#tipoPersonaClienteConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'tipo de persona';
    } else if($.trim($("#tipoSubPersonaClienteConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'tipo de sub-persona';
    } else if($.trim($("#saldoConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'saldo';
    } else if($.trim($("#monedaConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'moneda';
    } else if($.trim($("#tipoCuentaConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'tipo de cuenta';
    } else if($.trim($("#fechaInicioConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'fecha de inicio';
    } else if($.trim($("#fechaFinalConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'fecha final';
    } else if($.trim($("#sucursalConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'agencia';
    } else if($.trim($("#depositosUserDB").val()).length == 0 && $("ul#myTabDepositos li.active")[0].value == 0) {
        entrar = false;
        campo = 'usuario de la base de datos';
    } else if($.trim($("#depositosPasswordDB").val()).length == 0 && $("ul#myTabDepositos li.active")[0].value == 0) {
        entrar = false;
        campo = 'contraseña de la base de datos';
    } else if($.trim($("#depositosServerDB").val()).length == 0 && $("ul#myTabDepositos li.active")[0].value == 0) {
        entrar = false;
        campo = 'depositos de la base de datos';
    } else if($.trim($("#depositosDataBaseDB").val()).length == 0 && $("ul#myTabDepositos li.active")[0].value == 0) {
        entrar = false;
        campo = 'nombre de la base de datos';
    } else if($.trim($("#depositosTableDB").val()).length == 0 && $("ul#myTabDepositos li.active")[0].value == 0) {
        entrar = false;
        campo = 'tabla de la base de datos';
    }
    if(entrar) {
        arregloErroresExcel = [];
        arregloErroresInsercion = [];
        contadorInserciones = 0;
        totalInserciones = 0;
        insertoEnDBListas = false;
        var elemento = $("ul#myTabDepositos li.active");
        var indice = elemento[0].value;
        //Indice 1 = Excel
        if(indice == 0) {
            var existe = arregloConecciones.filter(function(object) {
                            return object.tipo == "mssql" && object.arreglo == 'arregloDepositos';
                        });
            if(existe.length > 0) {
                $("body").overhang({
                    type: "confirm",
                    primary: "#f5a433",
                    accent: "#dc9430",
                    yesColor: "#3498DB",
                    message: 'Ya existe una conneción para esta base de datos. Esta seguro que desea modificarla?',
                    overlay: true,
                    yesMessage: "Modificar",
                    noMessage: "Cancelar",
                    callback: function (value) {
                        if(value){
                            modifyConnection(existe[0].ID, indexTabla);
                            saveFields("mssql", indexTabla);
                        }
                    }
                });
            } else {
                $("body").overhang({
                    type: "confirm",
                    primary: "#f5a433",
                    accent: "#dc9430",
                    yesColor: "#3498DB",
                    message: 'Esta seguro que desea guardar la conneción?',
                    overlay: true,
                    yesMessage: "Guardar",
                    noMessage: "Cancelar",
                    callback: function (value) {
                        if(value){
                            createConnection(indice, indexTabla);
                            saveFields("mssql", indexTabla);
                        }
                    }
                });
            }
        } else if(indice == 1) {
            if(arregloFOSEDE.length > 0) {
                var identificador = $.trim($("#idClienteConexionDepositos").val());
                var numCuenta = $.trim($("#numCuentaConexionDepositos").val());
                var nombre = $.trim($("#nombreClienteConexionDepositos").val());
                var tipoPersona = $.trim($("#tipoPersonaClienteConexionDepositos").val());
                var tipoSubPersona = $.trim($("#tipoSubPersonaClienteConexionDepositos").val());
                var saldo = $.trim($("#saldoConexionDepositos").val());
                var moneda = $.trim($("#monedaConexionDepositos").val());
                var tipoCuenta = $.trim($("#tipoCuentaConexionDepositos").val());
                var fechaInicio = $.trim($("#fechaInicioConexionDepositos").val());
                var fechaFinal = $.trim($("#fechaFinalConexionDepositos").val());
                var sucursal = $.trim($("#sucursalConexionDepositos").val());
                var fechaImportacion = $.trim($("#fechaImportacionConexionDepositos").val());
                var nombreHoja = $.trim($("#depositosTableExcel").val());
                var filaInicial = $.trim($("#depositosExcelInicio").val());
                var filaFinal = $.trim($("#depositosExcelFinal").val());
                myWorker.postMessage("init");
                $( ".loadingScreen" ).fadeIn();
                $("#descripcionLoading").text('');
                setTimeout(function() {
                    if(identificador.length > 0) {
                        if(isNaN(identificador)) {
                            if(numCuenta.length > 0) {
                                if(isNaN(numCuenta)) {
                                    if(nombre.length > 0) {
                                        if(isNaN(nombre)) {
                                            if(tipoPersona.length > 0) {
                                                if(isNaN(tipoPersona)) {
                                                    if(tipoSubPersona.length > 0) {
                                                        if(isNaN(tipoSubPersona)) {
                                                            if(saldo.length > 0) {
                                                                if(isNaN(saldo)) {
                                                                    if(moneda.length > 0) {
                                                                        if(isNaN(moneda)) {
                                                                            if(tipoCuenta.length > 0) {
                                                                                if(isNaN(tipoCuenta)) {
                                                                                    if(fechaInicio.length > 0) {
                                                                                        if(isNaN(fechaInicio)) {
                                                                                            if(fechaFinal.length > 0) {
                                                                                                if(isNaN(fechaFinal)) {
                                                                                                    if(sucursal.length > 0) {
                                                                                                        if(isNaN(sucursal)) {
                                                                                                            if(fechaImportacion.length > 0) {
                                                                                                                if(isNaN(fechaImportacion)) {
                                                                                                                    if(nombreHoja.length > 0) {
                                                                                                                        if(!isNaN(filaInicial) && filaInicial.length>0) {
                                                                                                                            var file = dialog.showOpenDialog({
                                                                                                                                title: 'Seleccione un archivo',
                                                                                                                                filters: [{
                                                                                                                                    name: "Spreadsheets",
                                                                                                                                    extensions: "xls|xlsx|xlsm|xlsb|xml|xlw|xlc|csv|txt|dif|sylk|slk|prn|ods|fods|uos|dbf|wks|123|wq1|qpw".split("|")
                                                                                                                                }],
                                                                                                                                properties: ['openFile']
                                                                                                                            });
                                                                                                                            var workbook;
                                                                                                                            if(file != undefined && file.length > 0) {
                                                                                                                                workbook = XLSX.readFile(file[0]);
                                                                                                                                var sheet = workbook.Sheets[nombreHoja];
                                                                                                                                if(sheet != null) {
                                                                                                                                    if(filaFinal.length == 0)
                                                                                                                                        filaFinal = 0;
                                                                                                                                    var arregloDeDepositos = [];
                                                                                                                                    identificador = identificador.toUpperCase();
                                                                                                                                    numCuenta = numCuenta.toUpperCase();
                                                                                                                                    nombre = nombre.toUpperCase();
                                                                                                                                    tipoPersona = tipoPersona.toUpperCase();
                                                                                                                                    tipoSubPersona = tipoSubPersona.toUpperCase();
                                                                                                                                    saldo = saldo.toUpperCase();
                                                                                                                                    moneda = moneda.toUpperCase();
                                                                                                                                    tipoCuenta = tipoCuenta.toUpperCase();
                                                                                                                                    fechaInicio = fechaInicio.toUpperCase();
                                                                                                                                    fechaFinal = fechaFinal.toUpperCase();
                                                                                                                                    sucursal = sucursal.toUpperCase();
                                                                                                                                    fechaImportacion = fechaImportacion.toUpperCase();
                                                                                                                                    filaInicial = parseInt(filaInicial);
                                                                                                                                    filaFinal = parseInt(filaFinal);
                                                                                                                                    if(filaFinal != 0) {
                                                                                                                                        for (var i = filaInicial; i <= filaFinal; i++) {
                                                                                                                                            if(sheet[identificador+i] != undefined && sheet[identificador+i].v.toString().length > 0 && sheet[numCuenta+i] != undefined && sheet[numCuenta+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[tipoPersona+i] != undefined && sheet[tipoPersona+i].v.toString().length > 0 && sheet[tipoSubPersona+i] != undefined && sheet[tipoSubPersona+i].v.toString().length > 0 && sheet[saldo+i] != undefined && sheet[saldo+i].v.toString().length > 0 && sheet[moneda+i] != undefined && sheet[moneda+i].v.toString().length > 0 && sheet[tipoCuenta+i] != undefined && sheet[tipoCuenta+i].v.toString().length > 0 && sheet[fechaInicio+i] != undefined && sheet[fechaInicio+i].w.toString().length > 0 && sheet[fechaFinal+i] != undefined && sheet[fechaFinal+i].w.toString().length > 0 && sheet[sucursal+i] != undefined && sheet[sucursal+i].v.toString().length > 0 && sheet[fechaImportacion+i] != undefined && sheet[fechaImportacion+i].w.toString().length > 0) {
                                                                                                                                                var depositoIDCLiente = $.trim(sheet[identificador+i].v);
                                                                                                                                                var depositoNumCuenta = $.trim(sheet[numCuenta+i].v);
                                                                                                                                                var depositoNombreCliente = $.trim(sheet[nombre+i].v);
                                                                                                                                                var depositoTipoPersona = $.trim(sheet[tipoPersona+i].v);
                                                                                                                                                var depositoTipoSubPersona = $.trim(sheet[tipoSubPersona+i].v);
                                                                                                                                                var depositoTotalDepositos = $.trim(sheet[saldo+i].v);
                                                                                                                                                var depositoMoneda = $.trim(sheet[moneda+i].v);
                                                                                                                                                var depositoTipoCuenta = $.trim(sheet[tipoCuenta+i].v);
                                                                                                                                                var depositoFechaInicio = $.trim(sheet[fechaInicio+i].w);
                                                                                                                                                var depositoFechaFinal = $.trim(sheet[fechaFinal+i].w);
                                                                                                                                                var depositoSucursal = $.trim(sheet[sucursal+i].v);
                                                                                                                                                var depositoFechaImportacion = $.trim(sheet[fechaImportacion+i].w);
                                                                                                                                                depositoNombreCliente = depositoNombreCliente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                                depositoTipoCuenta = depositoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                                depositoSucursal = depositoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                                depositoNombreCliente = depositoNombreCliente.toLowerCase();
                                                                                                                                                depositoNombreCliente = UpperCasefirst(depositoNombreCliente);
                                                                                                                                                depositoMoneda = depositoMoneda.toLowerCase();
                                                                                                                                                depositoMoneda = UpperCasefirst(depositoMoneda);
                                                                                                                                                if(existeMonedaFOSEDE(depositoMoneda)) {
                                                                                                                                                    arregloDeDepositos.push({idCLiente: depositoIDCLiente, numCuenta: depositoNumCuenta, nombreCliente: depositoNombreCliente, tipoPersona: depositoTipoPersona, tipoSubPersona: depositoTipoSubPersona, saldo: depositoTotalDepositos, moneda: depositoMoneda, tipoCuenta: depositoTipoCuenta, fechaInicio: depositoFechaInicio, fechaFinal: depositoFechaFinal, sucursal: depositoSucursal, fechaImportacion: depositoFechaImportacion});
                                                                                                                                                    totalInserciones++;
                                                                                                                                                } else 
                                                                                                                                                    arregloErroresInsercion.push({b: "Deposito: "+depositoNumCuenta, c: "No existe un monto FOSEDE para el tipo de moneda"});
                                                                                                                                            } else if(sheet[identificador+i] != undefined || sheet[nombre+i] != undefined || sheet[tipoPersona+i] != undefined || sheet[tipoSubPersona+i] != undefined || sheet[saldo+i] != undefined || sheet[moneda+i] != undefined || sheet[tipoCuenta+i] != undefined || sheet[sucursal+i] != undefined || sheet[fechaImportacion+i] != undefined)
                                                                                                                                                arregloErroresExcel.push(i);
                                                                                                                                        };
                                                                                                                                    } else {
                                                                                                                                        var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
                                                                                                                                        finalRow = parseInt(finalRow);
                                                                                                                                        for (var i = filaInicial; i <= finalRow; i++) {
                                                                                                                                            if(sheet[identificador+i] != undefined && sheet[identificador+i].v.toString().length > 0 && sheet[numCuenta+i] != undefined && sheet[numCuenta+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[tipoPersona+i] != undefined && sheet[tipoPersona+i].v.toString().length > 0 && sheet[tipoSubPersona+i] != undefined && sheet[tipoSubPersona+i].v.toString().length > 0 && sheet[saldo+i] != undefined && sheet[saldo+i].v.toString().length > 0 && sheet[moneda+i] != undefined && sheet[moneda+i].v.toString().length > 0 && sheet[tipoCuenta+i] != undefined && sheet[tipoCuenta+i].v.toString().length > 0 && sheet[fechaInicio+i] != undefined && sheet[fechaInicio+i].w.toString().length > 0 && sheet[fechaFinal+i] != undefined && sheet[fechaFinal+i].w.toString().length > 0 && sheet[sucursal+i] != undefined && sheet[sucursal+i].v.toString().length > 0 && sheet[fechaImportacion+i] != undefined && sheet[fechaImportacion+i].w.toString().length > 0) {
                                                                                                                                                var depositoIDCLiente = $.trim(sheet[identificador+i].v);
                                                                                                                                                var depositoNumCuenta = $.trim(sheet[numCuenta+i].v);
                                                                                                                                                var depositoNombreCliente = $.trim(sheet[nombre+i].v);
                                                                                                                                                var depositoTipoPersona = $.trim(sheet[tipoPersona+i].v);
                                                                                                                                                var depositoTipoSubPersona = $.trim(sheet[tipoSubPersona+i].v);
                                                                                                                                                var depositoTotalDepositos = $.trim(sheet[saldo+i].v);
                                                                                                                                                var depositoMoneda = $.trim(sheet[moneda+i].v);
                                                                                                                                                var depositoTipoCuenta = $.trim(sheet[tipoCuenta+i].v);
                                                                                                                                                var depositoFechaInicio = $.trim(sheet[fechaInicio+i].w);
                                                                                                                                                var depositoFechaFinal = $.trim(sheet[fechaFinal+i].w);
                                                                                                                                                var depositoSucursal = $.trim(sheet[sucursal+i].v);
                                                                                                                                                var depositoFechaImportacion = $.trim(sheet[fechaImportacion+i].w);
                                                                                                                                                depositoNombreCliente = depositoNombreCliente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                                depositoTipoCuenta = depositoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                                depositoSucursal = depositoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                                depositoNombreCliente = depositoNombreCliente.toLowerCase();
                                                                                                                                                depositoNombreCliente = UpperCasefirst(depositoNombreCliente);
                                                                                                                                                depositoMoneda = depositoMoneda.toLowerCase();
                                                                                                                                                depositoMoneda = UpperCasefirst(depositoMoneda);
                                                                                                                                                if(existeMonedaFOSEDE(depositoMoneda)) {
                                                                                                                                                    arregloDeDepositos.push({idCLiente: depositoIDCLiente, numCuenta: depositoNumCuenta, nombreCliente: depositoNombreCliente, tipoPersona: depositoTipoPersona, tipoSubPersona: depositoTipoSubPersona, saldo: depositoTotalDepositos, moneda: depositoMoneda, tipoCuenta: depositoTipoCuenta, fechaInicio: depositoFechaInicio, fechaFinal: depositoFechaFinal, sucursal: depositoSucursal, fechaImportacion: depositoFechaImportacion});
                                                                                                                                                    totalInserciones++;
                                                                                                                                                } else 
                                                                                                                                                    arregloErroresInsercion.push({b: "Deposito: "+depositoNumCuenta, c: "No existe un monto FOSEDE para el tipo de moneda"});
                                                                                                                                            } else if(sheet[identificador+i] != undefined || sheet[nombre+i] != undefined || sheet[tipoPersona+i] != undefined || sheet[tipoSubPersona+i] != undefined || sheet[saldo+i] != undefined || sheet[moneda+i] != undefined || sheet[tipoCuenta+i] != undefined || sheet[sucursal+i] != undefined || sheet[fechaImportacion+i] != undefined)
                                                                                                                                                arregloErroresExcel.push(i);
                                                                                                                                        };
                                                                                                                                    }

                                                                                                                                    for (var i = 0; i < arregloDeDepositos.length; i++) {
                                                                                                                                        if(arregloDeDepositos[i].idCLiente.toString().length < 31) {
                                                                                                                                            if(arregloDeDepositos[i].numCuenta.toString().length < 31) {
                                                                                                                                                if(arregloDeDepositos[i].nombreCliente.length < 81) {
                                                                                                                                                    if(arregloDeDepositos[i].tipoPersona.length < 81) {
                                                                                                                                                        if(arregloDeDepositos[i].tipoSubPersona.length < 81) {
                                                                                                                                                            if(!isNaN(arregloDeDepositos[i].saldo)) {
                                                                                                                                                                if(arregloDeDepositos[i].moneda.length < 31) {
                                                                                                                                                                    if(arregloDeDepositos[i].tipoCuenta.length < 101) {
                                                                                                                                                                        if(Date.parse(new Date(arregloDeDepositos[i].fechaFinal)) || (arregloDeDepositos[i].fechaFinal.toString().length > 0 && isValidDateString(arregloDeDepositos[i].fechaFinal))  || arregloDeDepositos[i].fechaFinal.toString().length == 0) {
                                                                                                                                                                            if(Date.parse(new Date(arregloDeDepositos[i].fechaInicio)) || (arregloDeDepositos[i].fechaInicio.toString().length > 0 && isValidDateString(arregloDeDepositos[i].fechaInicio)) || arregloDeDepositos[i].fechaInicio.toString().length == 0) {
                                                                                                                                                                                if(arregloDeDepositos[i].sucursal.length < 51) {
                                                                                                                                                                                    if(Date.parse(new Date(arregloDeDepositos[i].fechaImportacion)) || isValidDateString(arregloDeDepositos[i].fechaImportacion)) {
                                                                                                                                                                                        //createDeposit( arregloDeDepositos[i] );
                                                                                                                                                                                    } else {
                                                                                                                                                                                        arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor fecha de importación no es valido"});
                                                                                                                                                                                        contadorInserciones++;
                                                                                                                                                                                    }
                                                                                                                                                                                } else {
                                                                                                                                                                                    arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor del sucursal es mayor a 50 caracteres"});
                                                                                                                                                                                    contadorInserciones++;
                                                                                                                                                                                }
                                                                                                                                                                            } else {
                                                                                                                                                                                arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor de fecha final no es valido"});
                                                                                                                                                                                contadorInserciones++;
                                                                                                                                                                            }
                                                                                                                                                                        } else {
                                                                                                                                                                            arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor de fecha de inicio no es valido"});
                                                                                                                                                                            contadorInserciones++;
                                                                                                                                                                        }
                                                                                                                                                                    } else {
                                                                                                                                                                        arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor del tipo de cuenta es mayor a 100 caracteres"});
                                                                                                                                                                        contadorInserciones++;
                                                                                                                                                                    }
                                                                                                                                                                } else {
                                                                                                                                                                    arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor de la moneda es mayor a 30 caracteres"});
                                                                                                                                                                    contadorInserciones++;
                                                                                                                                                                }
                                                                                                                                                            } else {
                                                                                                                                                                arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor del saldo es mayor a 20 caracteres"});
                                                                                                                                                                contadorInserciones++;
                                                                                                                                                            }
                                                                                                                                                        } else {
                                                                                                                                                            arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor del tipo de sub-persona es mayor a 80 caracteres"});
                                                                                                                                                            contadorInserciones++;
                                                                                                                                                        }
                                                                                                                                                    } else {
                                                                                                                                                        arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor del tipo de persona es mayor a 80 caracteres"});
                                                                                                                                                        contadorInserciones++;
                                                                                                                                                    }
                                                                                                                                                } else {
                                                                                                                                                    arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor del nombre del cliente es mayor a 80 caracteres"});
                                                                                                                                                    contadorInserciones++;
                                                                                                                                                }
                                                                                                                                            } else {
                                                                                                                                                arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor de número de cuenta es mayor a 30 caracteres"});
                                                                                                                                                contadorInserciones++;
                                                                                                                                            }
                                                                                                                                        } else {
                                                                                                                                            arregloErroresInsercion.push({b: "Deposito: "+arregloDeDepositos[i].numCuenta, c: "El valor del identificador del cliente es mayor a 30 caracteres"});
                                                                                                                                            contadorInserciones++;
                                                                                                                                        }
                                                                                                                                    };
                                                                                                                                    if(arregloDeDepositos.length == 0) {
                                                                                                                                        $("body").overhang({
                                                                                                                                            type: "error",
                                                                                                                                            primary: "#f84a1d",
                                                                                                                                            accent: "#d94e2a",
                                                                                                                                            message: "Error al insertar variable en columna inexistente o el archivo estaba vacio.",
                                                                                                                                            overlay: true,
                                                                                                                                            closeConfirm: true
                                                                                                                                        });
                                                                                                                                        $(".loadingScreen").hide();
                                                                                                                                        stopTimer();
                                                                                                                                        printErrorFile();
                                                                                                                                    } else {
                                                                                                                                        if(arregloErroresExcel.length > 0 || arregloErroresInsercion.length > 0 ) {
                                                                                                                                            $("body").overhang({
                                                                                                                                                type: "confirm",
                                                                                                                                                primary: "#f5a433",
                                                                                                                                                accent: "#dc9430",
                                                                                                                                                yesColor: "#3498DB",
                                                                                                                                                message: 'Se encontrarón errores en el archivo. Desea importar igual?',
                                                                                                                                                overlay: true,
                                                                                                                                                yesMessage: "Importar",
                                                                                                                                                noMessage: "Cancelar",
                                                                                                                                                callback: function (value) {
                                                                                                                                                    if(value) {
                                                                                                                                                        for (var i = 0; i < arregloDeDepositos.length; i++) {
                                                                                                                                                            if(arregloDeDepositos[i].idCLiente.toString().length < 31) {
                                                                                                                                                                if(arregloDeDepositos[i].nombreCliente.length < 81) {
                                                                                                                                                                    if(arregloDeDepositos[i].tipoPersona.length < 81) {
                                                                                                                                                                        if(arregloDeDepositos[i].tipoSubPersona.length < 81) {
                                                                                                                                                                            if(!isNaN(arregloDeDepositos[i].saldo)) {
                                                                                                                                                                                if(arregloDeDepositos[i].moneda.length < 31) {
                                                                                                                                                                                    if(arregloDeDepositos[i].tipoCuenta.length < 101) {
                                                                                                                                                                                        if(Date.parse(new Date(arregloDeDepositos[i].fechaFinal)) || (arregloDeDepositos[i].fechaFinal.toString().length > 0 && isValidDateString(arregloDeDepositos[i].fechaFinal))  || arregloDeDepositos[i].fechaFinal.toString().length == 0) {
                                                                                                                                                                                            if(Date.parse(new Date(arregloDeDepositos[i].fechaInicio)) || (arregloDeDepositos[i].fechaInicio.toString().length > 0 && isValidDateString(arregloDeDepositos[i].fechaInicio)) || arregloDeDepositos[i].fechaInicio.toString().length == 0) {
                                                                                                                                                                                                if(arregloDeDepositos[i].sucursal.length < 51) {
                                                                                                                                                                                                    if(Date.parse(new Date(arregloDeDepositos[i].fechaImportacion)) || isValidDateString(arregloDeDepositos[i].fechaImportacion)) {
                                                                                                                                                                                                        createDeposit( arregloDeDepositos[i] );
                                                                                                                                                                                                    }
                                                                                                                                                                                                }
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        }
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        };
                                                                                                                                                    } else {
                                                                                                                                                        $(".loadingScreen").hide();
                                                                                                                                                        stopTimer();
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                                        } else {
                                                                                                                                            for (var i = 0; i < arregloDeDepositos.length; i++) {
                                                                                                                                                if(arregloDeDepositos[i].idCLiente.toString().length < 31) {
                                                                                                                                                    if(arregloDeDepositos[i].nombreCliente.length < 81) {
                                                                                                                                                        if(arregloDeDepositos[i].tipoPersona.length < 81) {
                                                                                                                                                            if(arregloDeDepositos[i].tipoSubPersona.length < 81) {
                                                                                                                                                                if(!isNaN(arregloDeDepositos[i].saldo)) {
                                                                                                                                                                    if(arregloDeDepositos[i].moneda.length < 31) {
                                                                                                                                                                        if(arregloDeDepositos[i].tipoCuenta.length < 101) {
                                                                                                                                                                            if(Date.parse(new Date(arregloDeDepositos[i].fechaFinal)) || (arregloDeDepositos[i].fechaFinal.toString().length > 0 && isValidDateString(arregloDeDepositos[i].fechaFinal))  || arregloDeDepositos[i].fechaFinal.toString().length == 0) {
                                                                                                                                                                                if(Date.parse(new Date(arregloDeDepositos[i].fechaInicio)) || (arregloDeDepositos[i].fechaInicio.toString().length > 0 && isValidDateString(arregloDeDepositos[i].fechaInicio)) || arregloDeDepositos[i].fechaInicio.toString().length == 0) {
                                                                                                                                                                                    if(arregloDeDepositos[i].sucursal.length < 51) {
                                                                                                                                                                                        if(Date.parse(new Date(arregloDeDepositos[i].fechaImportacion)) || isValidDateString(arregloDeDepositos[i].fechaImportacion)) {
                                                                                                                                                                                            createDeposit( arregloDeDepositos[i] );
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        }
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            };
                                                                                                                                        }
                                                                                                                                    }
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
                                                                                                                            } else {
                                                                                                                                $(".loadingScreen").hide();
                                                                                                                                stopTimer();
                                                                                                                            }
                                                                                                                        } else {
                                                                                                                            $("body").overhang({
                                                                                                                                type: "error",
                                                                                                                                primary: "#f84a1d",
                                                                                                                                accent: "#d94e2a",
                                                                                                                                message: "Ingrese un valor para la fila inicial de la hoja de excel.",
                                                                                                                                overlay: true,
                                                                                                                                closeConfirm: true
                                                                                                                            });
                                                                                                                            $(".loadingScreen").hide();
                                                                                                                            stopTimer();
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        $("body").overhang({
                                                                                                                            type: "error",
                                                                                                                            primary: "#f84a1d",
                                                                                                                            accent: "#d94e2a",
                                                                                                                            message: "Ingrese un valor para el nombre de la hoja de excel.",
                                                                                                                            overlay: true,
                                                                                                                            closeConfirm: true
                                                                                                                        });
                                                                                                                        $(".loadingScreen").hide();
                                                                                                                        stopTimer();
                                                                                                                    }
                                                                                                                } else {
                                                                                                                    $("body").overhang({
                                                                                                                        type: "error",
                                                                                                                        primary: "#f84a1d",
                                                                                                                        accent: "#d94e2a",
                                                                                                                        message: "Ingrese una letra para la fecha de importación.",
                                                                                                                        overlay: true,
                                                                                                                        closeConfirm: true
                                                                                                                    });
                                                                                                                    $(".loadingScreen").hide();
                                                                                                                    stopTimer();
                                                                                                                }
                                                                                                            } else {
                                                                                                                $("body").overhang({
                                                                                                                    type: "error",
                                                                                                                    primary: "#f84a1d",
                                                                                                                    accent: "#d94e2a",
                                                                                                                    message: "Ingrese un valor para la fecha de importación.",
                                                                                                                    overlay: true,
                                                                                                                    closeConfirm: true
                                                                                                                });
                                                                                                                $(".loadingScreen").hide();
                                                                                                                stopTimer();
                                                                                                            }
                                                                                                        } else {
                                                                                                            $("body").overhang({
                                                                                                                type: "error",
                                                                                                                primary: "#f84a1d",
                                                                                                                accent: "#d94e2a",
                                                                                                                message: "Ingrese una letra para la columna del campo de sucursal.",
                                                                                                                overlay: true,
                                                                                                                closeConfirm: true
                                                                                                            });
                                                                                                            $(".loadingScreen").hide();
                                                                                                            stopTimer();
                                                                                                        }
                                                                                                    } else {
                                                                                                        $("body").overhang({
                                                                                                            type: "error",
                                                                                                            primary: "#f84a1d",
                                                                                                            accent: "#d94e2a",
                                                                                                            message: "Ingrese un valor para la columna del campo de sucursal.",
                                                                                                            overlay: true,
                                                                                                            closeConfirm: true
                                                                                                        });
                                                                                                        $(".loadingScreen").hide();
                                                                                                        stopTimer();
                                                                                                    }
                                                                                                } else {
                                                                                                    $("body").overhang({
                                                                                                        type: "error",
                                                                                                        primary: "#f84a1d",
                                                                                                        accent: "#d94e2a",
                                                                                                        message: "Ingrese una letra para la columna de fecha final.",
                                                                                                        overlay: true,
                                                                                                        closeConfirm: true
                                                                                                    });
                                                                                                    $(".loadingScreen").hide();
                                                                                                    stopTimer();
                                                                                                }
                                                                                            } else {
                                                                                                $("body").overhang({
                                                                                                    type: "error",
                                                                                                    primary: "#f84a1d",
                                                                                                    accent: "#d94e2a",
                                                                                                    message: "Ingrese un valor para la columna de fecha final.",
                                                                                                    overlay: true,
                                                                                                    closeConfirm: true
                                                                                                });
                                                                                                $(".loadingScreen").hide();
                                                                                                stopTimer();
                                                                                            }
                                                                                        } else {
                                                                                            $("body").overhang({
                                                                                                type: "error",
                                                                                                primary: "#f84a1d",
                                                                                                accent: "#d94e2a",
                                                                                                message: "Ingrese una letra para la columna de fecha de inicio.",
                                                                                                overlay: true,
                                                                                                closeConfirm: true
                                                                                            });
                                                                                            $(".loadingScreen").hide();
                                                                                            stopTimer();
                                                                                        }
                                                                                    } else {
                                                                                        $("body").overhang({
                                                                                            type: "error",
                                                                                            primary: "#f84a1d",
                                                                                            accent: "#d94e2a",
                                                                                            message: "Ingrese un valor para la columna de fecha de inicio.",
                                                                                            overlay: true,
                                                                                            closeConfirm: true
                                                                                        });
                                                                                        $(".loadingScreen").hide();
                                                                                        stopTimer();
                                                                                    }
                                                                                } else {
                                                                                    $("body").overhang({
                                                                                        type: "error",
                                                                                        primary: "#f84a1d",
                                                                                        accent: "#d94e2a",
                                                                                        message: "Ingrese una letra para la columna del campo de tipode cuenta.",
                                                                                        overlay: true,
                                                                                        closeConfirm: true
                                                                                    });
                                                                                    $(".loadingScreen").hide();
                                                                                    stopTimer();
                                                                                }
                                                                            } else {
                                                                                $("body").overhang({
                                                                                    type: "error",
                                                                                    primary: "#f84a1d",
                                                                                    accent: "#d94e2a",
                                                                                    message: "Ingrese un valor para la columna del campo de tipo de cuenta.",
                                                                                    overlay: true,
                                                                                    closeConfirm: true
                                                                                });
                                                                                $(".loadingScreen").hide();
                                                                                stopTimer();
                                                                            }
                                                                        } else {
                                                                            $("body").overhang({
                                                                                type: "error",
                                                                                primary: "#f84a1d",
                                                                                accent: "#d94e2a",
                                                                                message: "Ingrese una letra para la columna del campo de moneda.",
                                                                                overlay: true,
                                                                                closeConfirm: true
                                                                            });
                                                                            $(".loadingScreen").hide();
                                                                            stopTimer();
                                                                        }
                                                                    } else {
                                                                        $("body").overhang({
                                                                            type: "error",
                                                                            primary: "#f84a1d",
                                                                            accent: "#d94e2a",
                                                                            message: "Ingrese un valor para la columna del campo de moneda.",
                                                                            overlay: true,
                                                                            closeConfirm: true
                                                                        });
                                                                        $(".loadingScreen").hide();
                                                                        stopTimer();
                                                                    }
                                                                } else {
                                                                    $("body").overhang({
                                                                        type: "error",
                                                                        primary: "#f84a1d",
                                                                        accent: "#d94e2a",
                                                                        message: "Ingrese una letra para la columna de saldo de deposito válida.",
                                                                        overlay: true,
                                                                        closeConfirm: true
                                                                    });
                                                                    $(".loadingScreen").hide();
                                                                    stopTimer();
                                                                }
                                                            } else {
                                                                $("body").overhang({
                                                                    type: "error",
                                                                    primary: "#f84a1d",
                                                                    accent: "#d94e2a",
                                                                    message: "Ingrese un valor para la columna de saldo de deposito.",
                                                                    overlay: true,
                                                                    closeConfirm: true
                                                                });
                                                                $(".loadingScreen").hide();
                                                                stopTimer();
                                                            }
                                                        } else {
                                                            $("body").overhang({
                                                                type: "error",
                                                                primary: "#f84a1d",
                                                                accent: "#d94e2a",
                                                                message: "Ingrese una letra para la columna de saldo de deposito válida.",
                                                                overlay: true,
                                                                closeConfirm: true
                                                            });
                                                            $(".loadingScreen").hide();
                                                            stopTimer();
                                                        }
                                                    } else {
                                                        $("body").overhang({
                                                            type: "error",
                                                            primary: "#f84a1d",
                                                            accent: "#d94e2a",
                                                            message: "Ingrese un valor para la columna de saldo de deposito.",
                                                            overlay: true,
                                                            closeConfirm: true
                                                        });
                                                        $(".loadingScreen").hide();
                                                        stopTimer();
                                                    }
                                                } else {
                                                    $("body").overhang({
                                                        type: "error",
                                                        primary: "#f84a1d",
                                                        accent: "#d94e2a",
                                                        message: "Ingrese una letra para la columna de tipo de persona válida.",
                                                        overlay: true,
                                                        closeConfirm: true
                                                    });
                                                    $(".loadingScreen").hide();
                                                    stopTimer();
                                                }
                                            } else {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#f84a1d",
                                                    accent: "#d94e2a",
                                                    message: "Ingrese un valor para la columna de tipo de persona.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                                $(".loadingScreen").hide();
                                                stopTimer();
                                            }
                                        } else {
                                            $("body").overhang({
                                                type: "error",
                                                primary: "#f84a1d",
                                                accent: "#d94e2a",
                                                message: "Ingrese una letra para la columna del campo de nombre válida.",
                                                overlay: true,
                                                closeConfirm: true
                                            });
                                            $(".loadingScreen").hide();
                                            stopTimer();
                                        }
                                    } else {
                                        $("body").overhang({
                                            type: "error",
                                            primary: "#f84a1d",
                                            accent: "#d94e2a",
                                            message: "Ingrese un valor para la columna del campo de nombre.",
                                            overlay: true,
                                            closeConfirm: true
                                        });
                                        $(".loadingScreen").hide();
                                        stopTimer();
                                    }
                                } else {
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Ingrese una letra para la columna del campo de número de cuenta válido.",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                    $(".loadingScreen").hide();
                                    stopTimer();
                                }
                            } else {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Ingrese un valor para la columna del campo de número de cuenta.",
                                    overlay: true,
                                    closeConfirm: true
                                });
                                $(".loadingScreen").hide();
                                stopTimer();
                            }
                        } else {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "Ingrese una letra para la columna del campo de id del cliente válida.",
                                overlay: true,
                                closeConfirm: true
                            });
                            $(".loadingScreen").hide();
                            stopTimer();
                        }
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Ingrese un valor para la columna del campo de id del cliente.",
                            overlay: true,
                            closeConfirm: true
                        });
                        $(".loadingScreen").hide();
                        stopTimer();
                    }
                }, 3000);
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "No existen valores del monto FOSEDE. Creé un valor antes de importar",
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
            message: "Ingrese un valor para la columna de "+campo+".",
            overlay: true,
            closeConfirm: true
        });
    }
}

function createDeposit (deposito) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Depositos (idCliente, numCuenta, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, fechaInicio, fechaFinal, sucursal, fecha) values ('"+$.trim(deposito.idCLiente)+"',"+deposito.numCuenta+",'"+$.trim(deposito.nombreCliente.replace(/'/g, ''))+"','"+$.trim(deposito.tipoPersona)+"','"+$.trim(deposito.tipoSubPersona)+"',"+deposito.saldo+",'"+$.trim(deposito.moneda)+"','"+$.trim(deposito.tipoCuenta)+"','"+formatDateCreation(new Date(deposito.fechaInicio))+"','"+formatDateCreation(new Date(deposito.fechaFinal))+"','"+$.trim(deposito.sucursal)+"','"+formatDateCreation(new Date(deposito.fechaImportacion))+"')", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        contadorInserciones++;
                        arregloErroresInsercion.push({b: "Deposito: "+deposito.numCuenta, c: "Error en inserción mssql"});
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

function savePrestamosDB (indexTabla) {
    var entrar = true, campo = '';
    if($.trim($("#idClienteConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'id del cliente';
    } else if($.trim($("#nombreClienteConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'nombre del cliente';
    } else if($.trim($("#tipoPersonaClienteConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'tipo de persona';
    } else if($.trim($("#tipoSubPersonaClienteConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'tipo de sub-persona';
    } else if($.trim($("#numPrestamoConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'número de prestamo';
    } else if($.trim($("#saldoConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'saldo';
    } else if($.trim($("#monedaConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'moneda';
    } else if($.trim($("#moraConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'días de mora';
    } else if($.trim($("#amortizacionesConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'amortización';
    } else if($.trim($("#sobregirosConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'sobregiro';
    } else if($.trim($("#contingenteConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'contingente';
    } else if($.trim($("#clasificacionCarteraConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'clasificación de cartéra';
    } else if($.trim($("#montoOtorgadoConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'monto otorgado';
    } else if($.trim($("#esperado30ConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'pago esperado en 30 días';
    } else if($.trim($("#esperado60ConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'pago esperado en 60 días';
    } else if($.trim($("#esperado90ConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'pago esperado en 90 días';
    } else if($.trim($("#esperado120ConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'pago esperado en 120 días';
    } else if($.trim($("#clausulasRestrictivasConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'clausulas restrictivas';
    } else if($.trim($("#financiacionGarantizadaConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'financiación garantizada';
    } else if($.trim($("#valorFinanciacionConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'valor de la financiación';
    } else if($.trim($("#alacConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'ALAC';
    } else if($.trim($("#factorConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'factor';
    } else if($.trim($("#fechaInicioConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'fecha de inicio del préstamo';
    } else if($.trim($("#fechaExpiracionConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'fecha final del préstamo';
    } else if($.trim($("#sucursalConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'agencia';
    } else if($.trim($("#prestamosUserDB").val()).length == 0 && $("ul#myTabPrestamos li.active")[0].value == 0) {
        entrar = false;
        campo = 'usuario de la base de datos';
    } else if($.trim($("#prestamosPasswordDB").val()).length == 0 && $("ul#myTabPrestamos li.active")[0].value == 0) {
        entrar = false;
        campo = 'contraseña de la base de datos';
    } else if($.trim($("#prestamosServerDB").val()).length == 0 && $("ul#myTabPrestamos li.active")[0].value == 0) {
        entrar = false;
        campo = 'servidor de la base de datos';
    } else if($.trim($("#prestamosDataBaseDB").val()).length == 0 && $("ul#myTabPrestamos li.active")[0].value == 0) {
        entrar = false;
        campo = 'nombre de la base de datos';
    } else if($.trim($("#prestamosTableDB").val()).length == 0 && $("ul#myTabPrestamos li.active")[0].value == 0) {
        entrar = false;
        campo = 'tabla de la base de datos';
    }
    if(entrar) {
        arregloErroresExcel = [];
        arregloErroresInsercion = [];
        contadorInserciones = 0;
        totalInserciones = 0;
        insertoEnDBListas = false;
        var elemento = $("ul#myTabPrestamos li.active");
        var indice = elemento[0].value;
        //Indice 1 = Excel
        if(indice == 0) {
            var existe = arregloConecciones.filter(function(object) {
                            return object.tipo == "mssql" && object.arreglo == 'arregloPrestamos';
                        });
            if(existe.length > 0) {
                $("body").overhang({
                    type: "confirm",
                    primary: "#f5a433",
                    accent: "#dc9430",
                    yesColor: "#3498DB",
                    message: 'Ya existe una conneción para esta base de datos. Esta seguro que desea modificarla?',
                    overlay: true,
                    yesMessage: "Modificar",
                    noMessage: "Cancelar",
                    callback: function (value) {
                        if(value){
                            modifyConnection(existe[0].ID, indexTabla);
                            saveFields("mssql", indexTabla);
                        }
                    }
                });
            } else {
                $("body").overhang({
                    type: "confirm",
                    primary: "#f5a433",
                    accent: "#dc9430",
                    yesColor: "#3498DB",
                    message: 'Esta seguro que desea guardar la conneción?',
                    overlay: true,
                    yesMessage: "Guardar",
                    noMessage: "Cancelar",
                    callback: function (value) {
                        if(value){
                            createConnection(indice, indexTabla);
                            saveFields("mssql", indexTabla);
                        }
                    }
                });
            }
        } else if(indice == 1) {
            if(arregloFOSEDE.length > 0) {
                myWorker.postMessage("init");
                $( ".loadingScreen" ).fadeIn( "slow", function() {
                });
                $("#descripcionLoading").text('');
                var identificador = $.trim($("#idClienteConexionPrestamos").val());
                var nombre = $.trim($("#nombreClienteConexionPrestamos").val());
                var tipoPersona = $.trim($("#tipoPersonaClienteConexionPrestamos").val());
                var tipoSubPersona = $.trim($("#tipoSubPersonaClienteConexionPrestamos").val());
                var numPrestamo = $.trim($("#numPrestamoConexionPrestamos").val());
                var saldo = $.trim($("#saldoConexionPrestamos").val());
                var moneda = $.trim($("#monedaConexionPrestamos").val());
                var diasMora = $.trim($("#moraConexionPrestamos").val());
                var amortizaciones = $.trim($("#amortizacionesConexionPrestamos").val());
                var sobregiro = $.trim($("#sobregirosConexionPrestamos").val());
                var contingente = $.trim($("#contingenteConexionPrestamos").val());
                var clasificacionCartera = $.trim($("#clasificacionCarteraConexionPrestamos").val());
                var tipoCredito = $.trim($("#tipoCreditoConexionPrestamos").val());
                var esperado30 = $.trim($("#esperado30ConexionPrestamos").val());
                var esperado60 = $.trim($("#esperado60ConexionPrestamos").val());
                var esperado90 = $.trim($("#esperado90ConexionPrestamos").val());
                var esperado120 = $("#esperado120ConexionPrestamos").val();
                var clausulasRestrictivas = $.trim($("#clausulasRestrictivasConexionPrestamos").val());
                var financiacionGarantizada = $.trim($("#financiacionGarantizadaConexionPrestamos").val());
                var valorFinanciacion = $.trim($("#valorFinanciacionConexionPrestamos").val());
                var alac = $.trim($("#alacConexionPrestamos").val());
                var factor = $.trim($("#factorConexionPrestamos").val());
                var fechaInicio = $.trim($("#fechaInicioConexionPrestamos").val());
                var fechaFinal = $.trim($("#fechaExpiracionConexionPrestamos").val());
                var montoOtorgado = $.trim($("#montoOtorgadoConexionPrestamos").val());
                var sucursal = $.trim($("#sucursalConexionPrestamos").val());
                var fechaImportacion = $.trim($("#fechaImportacionConexionPrestamos").val());
                var nombreHoja = $.trim($("#prestamosTableExcel").val());
                var filaInicial = $.trim($("#prestamosExcelInicio").val());
                var filaFinal = $.trim($("#prestamosExcelFinal").val());
                setTimeout(function() {
                    if(isNaN(identificador)) {
                        if(isNaN(nombre)) {
                            if(isNaN(tipoPersona)) {
                                if(isNaN(tipoSubPersona)) {
                                    if(isNaN(numPrestamo)) {
                                        if(isNaN(saldo)) {
                                            if(isNaN(moneda)) {
                                                if(isNaN(diasMora)) {
                                                    if(isNaN(amortizaciones)) {
                                                        if(isNaN(sobregiro)) {
                                                            if(isNaN(contingente)) {
                                                                if(isNaN(clasificacionCartera)) {
                                                                    if(isNaN(tipoCredito)) {
                                                                        if(isNaN(esperado30)) {
                                                                            if(isNaN(esperado60)) {
                                                                                if(isNaN(esperado90)) {
                                                                                    if(isNaN(esperado120)) {
                                                                                        if(isNaN(clausulasRestrictivas)) {
                                                                                            if(isNaN(financiacionGarantizada)) {
                                                                                                if(isNaN(valorFinanciacion)) {
                                                                                                    if(isNaN(alac)) {
                                                                                                        if(isNaN(factor)) {
                                                                                                            if(isNaN(fechaInicio)) {
                                                                                                                if(isNaN(fechaFinal)) {
                                                                                                                    if(isNaN(montoOtorgado)) {
                                                                                                                        if(isNaN(sucursal)) {
                                                                                                                            if(isNaN(fechaImportacion)) {
                                                                                                                                if(nombreHoja.length > 0) {
                                                                                                                                    if(!isNaN(filaInicial) && filaInicial.length>0) {
                                                                                                                                        var file = dialog.showOpenDialog({
                                                                                                                                            title: 'Seleccione un archivo',
                                                                                                                                            filters: [{
                                                                                                                                                name: "Spreadsheets",
                                                                                                                                                extensions: "xls|xlsx|xlsm|xlsb|xml|xlw|xlc|csv|txt|dif|sylk|slk|prn|ods|fods|uos|dbf|wks|123|wq1|qpw".split("|")
                                                                                                                                            }],
                                                                                                                                            properties: ['openFile']
                                                                                                                                        });
                                                                                                                                        var workbook;
                                                                                                                                        if(file != undefined && file.length > 0) {
                                                                                                                                            workbook = XLSX.readFile(file[0]);
                                                                                                                                            var sheet = workbook.Sheets[nombreHoja];
                                                                                                                                            if(sheet != null) {
                                                                                                                                                if(filaFinal.length == 0)
                                                                                                                                                    filaFinal = 0;
                                                                                                                                                var arregloDePrestamos = [];
                                                                                                                                                identificador = identificador.toUpperCase();
                                                                                                                                                nombre = nombre.toUpperCase();
                                                                                                                                                tipoPersona = tipoPersona.toUpperCase();
                                                                                                                                                tipoSubPersona = tipoSubPersona.toUpperCase();
                                                                                                                                                numPrestamo = numPrestamo.toUpperCase();
                                                                                                                                                saldo = saldo.toUpperCase();
                                                                                                                                                moneda = moneda.toUpperCase();
                                                                                                                                                diasMora = diasMora.toUpperCase();
                                                                                                                                                amortizaciones = amortizaciones.toUpperCase();
                                                                                                                                                sobregiro = sobregiro.toUpperCase();
                                                                                                                                                contingente = contingente.toUpperCase();
                                                                                                                                                clasificacionCartera = clasificacionCartera.toUpperCase();
                                                                                                                                                tipoCredito = tipoCredito.toUpperCase();
                                                                                                                                                esperado30 = esperado30.toUpperCase();
                                                                                                                                                esperado60 = esperado60.toUpperCase();
                                                                                                                                                esperado90 = esperado90.toUpperCase();
                                                                                                                                                esperado120 = esperado120.toUpperCase();
                                                                                                                                                clausulasRestrictivas = clausulasRestrictivas.toUpperCase();
                                                                                                                                                financiacionGarantizada = financiacionGarantizada.toUpperCase();
                                                                                                                                                valorFinanciacion = valorFinanciacion.toUpperCase();
                                                                                                                                                alac = alac.toUpperCase();
                                                                                                                                                factor = factor.toUpperCase();
                                                                                                                                                fechaInicio = fechaInicio.toUpperCase();
                                                                                                                                                fechaFinal = fechaFinal.toUpperCase();
                                                                                                                                                montoOtorgado = montoOtorgado.toUpperCase();
                                                                                                                                                sucursal = sucursal.toUpperCase();
                                                                                                                                                fechaImportacion = fechaImportacion.toUpperCase();
                                                                                                                                                filaInicial = parseInt(filaInicial);
                                                                                                                                                filaFinal = parseInt(filaFinal);
                                                                                                                                                if(filaFinal != 0) {
                                                                                                                                                    for (var i = filaInicial; i <= filaFinal; i++) {
                                                                                                                                                        if(sheet[identificador+i] != undefined && sheet[identificador+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[tipoPersona+i] != undefined && sheet[tipoPersona+i].v.toString().length > 0 && sheet[tipoSubPersona+i] != undefined && sheet[tipoSubPersona+i].v.toString().length > 0 && sheet[fechaImportacion+i] != undefined && sheet[fechaImportacion+i].w.toString().length > 0) {
                                                                                                                                                            var prestamoIDCLiente = $.trim(sheet[identificador+i].v);
                                                                                                                                                            var prestamoNombreCliente = $.trim(sheet[nombre+i].v);
                                                                                                                                                            var prestamoTipoPersona = $.trim(sheet[tipoPersona+i].v);
                                                                                                                                                            var prestamoTipoSubPersona = $.trim(sheet[tipoSubPersona+i].v);
                                                                                                                                                            var prestamoNumPrestamo = $.trim(sheet[numPrestamo+i].v);
                                                                                                                                                            var prestamoTotalDepositos = $.trim(sheet[saldo+i].v);
                                                                                                                                                            var prestamoMoneda = $.trim(sheet[moneda+i].v);
                                                                                                                                                            var prestamoDiasMora = $.trim(sheet[diasMora+i].v);
                                                                                                                                                            var prestamoAmortizaciones = $.trim(sheet[amortizaciones+i].v);
                                                                                                                                                            var prestamoSobregiro = $.trim(sheet[sobregiro+i].v);
                                                                                                                                                            var prestamoContingente = $.trim(sheet[contingente+i].v);
                                                                                                                                                            var prestamoClasificacionCartera = $.trim(sheet[clasificacionCartera+i].v);
                                                                                                                                                            var prestamoTipoCredito = $.trim(sheet[tipoCredito+i].v);
                                                                                                                                                            var prestamoEsperado30 = $.trim(sheet[esperado30+i].v);
                                                                                                                                                            var prestamoEsperado60 = $.trim(sheet[esperado60+i].v);
                                                                                                                                                            var prestamoEsperado90 = $.trim(sheet[esperado90+i].v);
                                                                                                                                                            var prestamoEsperado120 = $.trim(sheet[esperado120+i].v);
                                                                                                                                                            var prestamoClausulasRestrictivas = $.trim(sheet[clausulasRestrictivas+i].v);
                                                                                                                                                            var prestamoFinanciacionGarantizada = $.trim(sheet[financiacionGarantizada+i].v);
                                                                                                                                                            var prestamoValorFinanciacion = $.trim(sheet[valorFinanciacion+i].v);
                                                                                                                                                            var prestamoALAC;
                                                                                                                                                            if(sheet[alac+i] != undefined)
                                                                                                                                                                prestamoALAC = $.trim(sheet[alac+i].v);
                                                                                                                                                            else
                                                                                                                                                                prestamoALAC = '';
                                                                                                                                                            var prestamoFactor = sheet[factor+i].v;
                                                                                                                                                            var prestamoFechaInicio = new Date($.trim(sheet[fechaInicio+i].w));
                                                                                                                                                            var prestamoFechaFinal = new Date($.trim(sheet[fechaFinal+i].w));
                                                                                                                                                            var prestamoMontoOtorgado = $.trim(sheet[montoOtorgado+i].v);
                                                                                                                                                            var prestamoSucursal = $.trim(sheet[sucursal+i].v);
                                                                                                                                                            var prestamoFechaImportacion = new Date($.trim(sheet[fechaImportacion+i].w));
                                                                                                                                                            prestamoIDCLiente = prestamoIDCLiente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                                            prestamoSucursal = prestamoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                                            prestamoNombreCliente = prestamoNombreCliente.toLowerCase();
                                                                                                                                                            prestamoNombreCliente = UpperCasefirst(prestamoNombreCliente);
                                                                                                                                                            prestamoSucursal = prestamoSucursal.toLowerCase();
                                                                                                                                                            prestamoSucursal = UpperCasefirst(prestamoSucursal);
                                                                                                                                                            prestamoMoneda = prestamoMoneda.toLowerCase();
                                                                                                                                                            prestamoMoneda = UpperCasefirst(prestamoMoneda);
                                                                                                                                                            if(existeMonedaFOSEDE(prestamoMoneda)) {
                                                                                                                                                                arregloDePrestamos.push({idCliente: prestamoIDCLiente, nombreCliente: prestamoNombreCliente, tipoPersona: prestamoTipoPersona, tipoSubPersona: prestamoTipoSubPersona, numPrestamo: prestamoNumPrestamo, saldo: prestamoTotalDepositos, moneda: prestamoMoneda, montoOtorgado: prestamoMontoOtorgado, diasMora: prestamoDiasMora, amortizacion: prestamoAmortizaciones, sobregiro: prestamoSobregiro, contingente: prestamoContingente, clasificacionCartera: prestamoClasificacionCartera, tipoCredito: prestamoTipoCredito, pago30: prestamoEsperado30, pago60: prestamoEsperado60, pago90: prestamoEsperado90, pago120: prestamoEsperado120, clausulasRestrictivas: prestamoClausulasRestrictivas, financiacionGarantizada: prestamoFinanciacionGarantizada, valorFinanciacion: prestamoValorFinanciacion, alac: prestamoALAC, factor: prestamoFactor, fechaInicio: prestamoFechaInicio, fechaFinal: prestamoFechaFinal, sucursal: prestamoSucursal, fechaImportacion: prestamoFechaImportacion});
                                                                                                                                                                totalInserciones++;
                                                                                                                                                            } else 
                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+prestamoNumPrestamo, c: "No existe un monto FOSEDE para el tipo de moneda"});
                                                                                                                                                        } else if(sheet[identificador+i] != undefined|| sheet[nombre+i] != undefined|| sheet[tipoPersona+i] != undefined || sheet[tipoSubPersona+i] != undefined || sheet[fechaImportacion+i] != undefined)
                                                                                                                                                            arregloErroresExcel.push(i);
                                                                                                                                                    };
                                                                                                                                                } else {
                                                                                                                                                    var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
                                                                                                                                                    finalRow = parseInt(finalRow);
                                                                                                                                                    for (var i = filaInicial; i <= finalRow; i++) {
                                                                                                                                                        if(sheet[identificador+i] != undefined && sheet[identificador+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[tipoPersona+i] != undefined && sheet[tipoPersona+i].v.toString().length > 0 && sheet[tipoSubPersona+i] != undefined && sheet[tipoSubPersona+i].v.toString().length > 0 && sheet[fechaImportacion+i] != undefined && sheet[fechaImportacion+i].w.toString().length > 0) {
                                                                                                                                                            var prestamoIDCLiente = $.trim(sheet[identificador+i].v);
                                                                                                                                                            var prestamoNombreCliente = $.trim(sheet[nombre+i].v);
                                                                                                                                                            var prestamoTipoPersona = $.trim(sheet[tipoPersona+i].v);
                                                                                                                                                            var prestamoTipoSubPersona = $.trim(sheet[tipoSubPersona+i].v);
                                                                                                                                                            var prestamoNumPrestamo = $.trim(sheet[numPrestamo+i].v);
                                                                                                                                                            var prestamoTotalDepositos = $.trim(sheet[saldo+i].v);
                                                                                                                                                            var prestamoMoneda = $.trim(sheet[moneda+i].v);
                                                                                                                                                            var prestamoDiasMora = $.trim(sheet[diasMora+i].v);
                                                                                                                                                            var prestamoAmortizaciones = $.trim(sheet[amortizaciones+i].v);
                                                                                                                                                            var prestamoSobregiro = $.trim(sheet[sobregiro+i].v);
                                                                                                                                                            var prestamoContingente = $.trim(sheet[contingente+i].v);
                                                                                                                                                            var prestamoClasificacionCartera = $.trim(sheet[clasificacionCartera+i].v);
                                                                                                                                                            var prestamoTipoCredito = $.trim(sheet[tipoCredito+i].v);
                                                                                                                                                            var prestamoEsperado30 = $.trim(sheet[esperado30+i].v);
                                                                                                                                                            var prestamoEsperado60 = $.trim(sheet[esperado60+i].v);
                                                                                                                                                            var prestamoEsperado90 = $.trim(sheet[esperado90+i].v);
                                                                                                                                                            var prestamoEsperado120 = $.trim(sheet[esperado120+i].v);
                                                                                                                                                            var prestamoClausulasRestrictivas = $.trim(sheet[clausulasRestrictivas+i].v);
                                                                                                                                                            var prestamoFinanciacionGarantizada = $.trim(sheet[financiacionGarantizada+i].v);
                                                                                                                                                            var prestamoValorFinanciacion = $.trim(sheet[valorFinanciacion+i].v);
                                                                                                                                                            var prestamoALAC;
                                                                                                                                                            if(sheet[alac+i] != undefined)
                                                                                                                                                                prestamoALAC = $.trim(sheet[alac+i].v);
                                                                                                                                                            else
                                                                                                                                                                prestamoALAC = '';
                                                                                                                                                            var prestamoFactor = $.trim(sheet[factor+i].v);
                                                                                                                                                            var prestamoFechaInicio = new Date($.trim(sheet[fechaInicio+i].w));
                                                                                                                                                            var prestamoFechaFinal = new Date($.trim(sheet[fechaFinal+i].w));
                                                                                                                                                            var prestamoMontoOtorgado = $.trim(sheet[montoOtorgado+i].v);
                                                                                                                                                            var prestamoSucursal = $.trim(sheet[sucursal+i].v);
                                                                                                                                                            var prestamoFechaImportacion = new Date($.trim(sheet[fechaImportacion+i].w));
                                                                                                                                                            prestamoIDCLiente = prestamoIDCLiente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                                            prestamoSucursal = prestamoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                                            prestamoNombreCliente = prestamoNombreCliente.toLowerCase();
                                                                                                                                                            prestamoNombreCliente = UpperCasefirst(prestamoNombreCliente);
                                                                                                                                                            prestamoSucursal = prestamoSucursal.toLowerCase();
                                                                                                                                                            prestamoSucursal = UpperCasefirst(prestamoSucursal);
                                                                                                                                                            prestamoMoneda = prestamoMoneda.toLowerCase();
                                                                                                                                                            prestamoMoneda = UpperCasefirst(prestamoMoneda);
                                                                                                                                                            if(existeMonedaFOSEDE(prestamoMoneda)) {
                                                                                                                                                                arregloDePrestamos.push({idCliente: prestamoIDCLiente, nombreCliente: prestamoNombreCliente, tipoPersona: prestamoTipoPersona, tipoSubPersona: prestamoTipoSubPersona, numPrestamo: prestamoNumPrestamo, saldo: prestamoTotalDepositos, moneda: prestamoMoneda, montoOtorgado: prestamoMontoOtorgado, diasMora: prestamoDiasMora, amortizacion: prestamoAmortizaciones, sobregiro: prestamoSobregiro, contingente: prestamoContingente, clasificacionCartera: prestamoClasificacionCartera, tipoCredito: prestamoTipoCredito, pago30: prestamoEsperado30, pago60: prestamoEsperado60, pago90: prestamoEsperado90, pago120: prestamoEsperado120, clausulasRestrictivas: prestamoClausulasRestrictivas, financiacionGarantizada: prestamoFinanciacionGarantizada, valorFinanciacion: prestamoValorFinanciacion, alac: prestamoALAC, factor: prestamoFactor, fechaInicio: prestamoFechaInicio, fechaFinal: prestamoFechaFinal, sucursal: prestamoSucursal, fechaImportacion: prestamoFechaImportacion});
                                                                                                                                                                totalInserciones++;
                                                                                                                                                            } else 
                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+prestamoNumPrestamo, c: "No existe un monto FOSEDE para el tipo de moneda"});
                                                                                                                                                        } else if(sheet[identificador+i] != undefined|| sheet[nombre+i] != undefined|| sheet[tipoPersona+i] != undefined || sheet[tipoSubPersona+i] != undefined || sheet[fechaImportacion+i] != undefined)
                                                                                                                                                            arregloErroresExcel.push(i);
                                                                                                                                                    };
                                                                                                                                                }
                                                                                                                                                for (var i = 0; i < arregloDePrestamos.length; i++) {
                                                                                                                                                    if(arregloDePrestamos[i].idCliente.length < 31) {
                                                                                                                                                        if(arregloDePrestamos[i].nombreCliente.length < 81) {
                                                                                                                                                            if(arregloDePrestamos[i].tipoPersona.length < 81) {
                                                                                                                                                                if(arregloDePrestamos[i].tipoSubPersona.length < 81) {
                                                                                                                                                                    if(arregloDePrestamos[i].numPrestamo.toString().length < 51) {
                                                                                                                                                                        if(arregloDePrestamos[i].saldo.toString().length < 21) {
                                                                                                                                                                            if(arregloDePrestamos[i].moneda.length < 31) {
                                                                                                                                                                                if(arregloDePrestamos[i].montoOtorgado.toString().length < 21) {
                                                                                                                                                                                    if(arregloDePrestamos[i].diasMora.toString().length < 21) {
                                                                                                                                                                                        if(arregloDePrestamos[i].amortizacion.toString().length < 21) {
                                                                                                                                                                                            if(arregloDePrestamos[i].sobregiro.toString().length < 21) {
                                                                                                                                                                                                if(arregloDePrestamos[i].contingente.toString().length < 21) {
                                                                                                                                                                                                    if(arregloDePrestamos[i].clasificacionCartera.length <= 3) {
                                                                                                                                                                                                        if(arregloDePrestamos[i].tipoCredito.length < 81) {
                                                                                                                                                                                                            if(arregloDePrestamos[i].pago30.toString().length < 21) {
                                                                                                                                                                                                                if(arregloDePrestamos[i].pago60.toString().length < 21) {
                                                                                                                                                                                                                    if(arregloDePrestamos[i].pago90.toString().length < 21) {
                                                                                                                                                                                                                        if(arregloDePrestamos[i].pago120.toString().length < 21) {
                                                                                                                                                                                                                            if(arregloDePrestamos[i].clausulasRestrictivas.toString().length > 0) {
                                                                                                                                                                                                                                if(arregloDePrestamos[i].financiacionGarantizada.toString().length > 0) {
                                                                                                                                                                                                                                    if(arregloDePrestamos[i].valorFinanciacion.toString().length < 21) {
                                                                                                                                                                                                                                        if(arregloDePrestamos[i].alac.toString().length < 31) {
                                                                                                                                                                                                                                            if(!isNaN(arregloDePrestamos[i].factor)) {
                                                                                                                                                                                                                                                if(Date.parse(new Date(arregloDePrestamos[i].fechaInicio)) || arregloDePrestamos[i].fechaInicio.toString().length == 0 || isValidDateString(arregloDePrestamos[i].fechaInicio)) {
                                                                                                                                                                                                                                                    if(Date.parse(new Date(arregloDePrestamos[i].fechaFinal)) || arregloDePrestamos[i].fechaFinal.toString().length == 0 || isValidDateString(arregloDePrestamos[i].fechaFinal)) {
                                                                                                                                                                                                                                                        if(arregloDePrestamos[i].sucursal.length < 51) {
                                                                                                                                                                                                                                                            if(Date.parse(new Date(arregloDePrestamos[i].fechaImportacion)) || isValidDateString(arregloDePrestamos[i].fechaImportacion)) {
                                                                                                                                                                                                                                                                //createLoan( arregloDePrestamos[i] );
                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "La fecha de importación no es valida"});
                                                                                                                                                                                                                                                                contadorInserciones++;
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de sucursal es mayor a 50 caracteres"});
                                                                                                                                                                                                                                                            contadorInserciones++;
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "La fecha final no es valida"});
                                                                                                                                                                                                                                                        contadorInserciones++;
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "La fecha inicial no es valida"});
                                                                                                                                                                                                                                                    contadorInserciones++;
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El factor ingresado no es valido"});
                                                                                                                                                                                                                                                contadorInserciones++;
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El número de cuenta del ALAC no es valido"});
                                                                                                                                                                                                                                            contadorInserciones++;
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor financiacion no es valido"});
                                                                                                                                                                                                                                        contadorInserciones++;
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de financiación garantizada tiene que ser mayor a 0 caracteres"});
                                                                                                                                                                                                                                    contadorInserciones++;
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de clausulas restrictivas tiene que ser mayor a 0 caracteres"});
                                                                                                                                                                                                                                contadorInserciones++;
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de pago en 120 días es mayor a 20 caracteres"});
                                                                                                                                                                                                                            contadorInserciones++;
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de pago en 90 días es mayor a 20 caracteres"});
                                                                                                                                                                                                                        contadorInserciones++;
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de pago en 60 días es mayor a 20 caracteres"});
                                                                                                                                                                                                                    contadorInserciones++;
                                                                                                                                                                                                                }
                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de pago en 30 días es mayor a 20 caracteres"});
                                                                                                                                                                                                                contadorInserciones++;
                                                                                                                                                                                                            }
                                                                                                                                                                                                        } else {
                                                                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de tipo de crédito es mayor a 80 caracteres"});
                                                                                                                                                                                                            contadorInserciones++;
                                                                                                                                                                                                        }
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de clasificación de cartera es mayor a 2 caracteres"});
                                                                                                                                                                                                        contadorInserciones++;
                                                                                                                                                                                                    }
                                                                                                                                                                                                } else {
                                                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de contingente es mayor a 20 caracteres"});
                                                                                                                                                                                                    contadorInserciones++;
                                                                                                                                                                                                }
                                                                                                                                                                                            } else {
                                                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de sobregiro es mayor a 20 caracteres"});
                                                                                                                                                                                                contadorInserciones++;
                                                                                                                                                                                            }
                                                                                                                                                                                        } else {
                                                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de amortización es mayor a 20 caracteres"});
                                                                                                                                                                                            contadorInserciones++;
                                                                                                                                                                                        }
                                                                                                                                                                                    } else {
                                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de días de mora es mayor a 20 caracteres"});
                                                                                                                                                                                        contadorInserciones++;
                                                                                                                                                                                    }
                                                                                                                                                                                } else {
                                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de monto otorgado es mayor a 20 caracteres"});
                                                                                                                                                                                    contadorInserciones++;
                                                                                                                                                                                }
                                                                                                                                                                            } else {
                                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de moneda es mayor a 30 caracteres"});
                                                                                                                                                                                contadorInserciones++;
                                                                                                                                                                            }
                                                                                                                                                                        } else {
                                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de saldo es mayor a 20 caracteres"});
                                                                                                                                                                            contadorInserciones++;
                                                                                                                                                                        }
                                                                                                                                                                    } else {
                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de número de préstamo es mayor a 50 caracteres"});
                                                                                                                                                                        contadorInserciones++;
                                                                                                                                                                    }
                                                                                                                                                                } else {
                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de tipo de sub-persona es mayor a 80 caracteres"});
                                                                                                                                                                    contadorInserciones++;
                                                                                                                                                                }
                                                                                                                                                            } else {
                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de tipo de persona es mayor a 80 caracteres"});
                                                                                                                                                                contadorInserciones++;
                                                                                                                                                            }
                                                                                                                                                        } else {
                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de nombre del cliente es mayor a 80 caracteres"});
                                                                                                                                                            contadorInserciones++;
                                                                                                                                                        }
                                                                                                                                                    } else {
                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de identificador del cliente es mayor a 30 caracteres"});
                                                                                                                                                        contadorInserciones++;
                                                                                                                                                    }
                                                                                                                                                };
                                                                                                                                                if(arregloDePrestamos.length == 0) {
                                                                                                                                                    $("body").overhang({
                                                                                                                                                        type: "error",
                                                                                                                                                        primary: "#f84a1d",
                                                                                                                                                        accent: "#d94e2a",
                                                                                                                                                        message: "Error al insertar variable en columna inexistente o el archivo estaba vacio.",
                                                                                                                                                        overlay: true,
                                                                                                                                                        closeConfirm: true
                                                                                                                                                    });
                                                                                                                                                    $(".loadingScreen").hide();
                                                                                                                                                    stopTimer();
                                                                                                                                                    printErrorFile();
                                                                                                                                                } else {
                                                                                                                                                    if(arregloErroresExcel.length > 0 || arregloErroresInsercion.length > 0 ) {
                                                                                                                                                        $("body").overhang({
                                                                                                                                                            type: "confirm",
                                                                                                                                                            primary: "#f5a433",
                                                                                                                                                            accent: "#dc9430",
                                                                                                                                                            yesColor: "#3498DB",
                                                                                                                                                            message: 'Se encontrarón errores en el archivo. Desea importar igual?',
                                                                                                                                                            overlay: true,
                                                                                                                                                            yesMessage: "Importar",
                                                                                                                                                            noMessage: "Cancelar",
                                                                                                                                                            callback: function (value) {
                                                                                                                                                                if(value) {
                                                                                                                                                                    for (var i = 0; i < arregloDePrestamos.length; i++) {
                                                                                                                                                                        if(arregloDePrestamos[i].idCliente.length < 31) {
                                                                                                                                                                            if(arregloDePrestamos[i].nombreCliente.length < 81) {
                                                                                                                                                                                if(arregloDePrestamos[i].tipoPersona.length < 81) {
                                                                                                                                                                                    if(arregloDePrestamos[i].tipoSubPersona.length < 81) {
                                                                                                                                                                                        if(arregloDePrestamos[i].numPrestamo.toString().length < 51) {
                                                                                                                                                                                            if(arregloDePrestamos[i].saldo.toString().length < 21) {
                                                                                                                                                                                                if(arregloDePrestamos[i].moneda.length < 31) {
                                                                                                                                                                                                    if(arregloDePrestamos[i].montoOtorgado.toString().length < 21) {
                                                                                                                                                                                                        if(arregloDePrestamos[i].diasMora.toString().length < 21) {
                                                                                                                                                                                                            if(arregloDePrestamos[i].amortizacion.toString().length < 21) {
                                                                                                                                                                                                                if(arregloDePrestamos[i].sobregiro.toString().length < 21) {
                                                                                                                                                                                                                    if(arregloDePrestamos[i].contingente.toString().length < 21) {
                                                                                                                                                                                                                        if(arregloDePrestamos[i].clasificacionCartera.length <= 3) {
                                                                                                                                                                                                                            if(arregloDePrestamos[i].tipoCredito.length < 81) {
                                                                                                                                                                                                                                if(arregloDePrestamos[i].pago30.toString().length < 21) {
                                                                                                                                                                                                                                    if(arregloDePrestamos[i].pago60.toString().length < 21) {
                                                                                                                                                                                                                                        if(arregloDePrestamos[i].pago90.toString().length < 21) {
                                                                                                                                                                                                                                            if(arregloDePrestamos[i].pago120.toString().length < 21) {
                                                                                                                                                                                                                                                if(arregloDePrestamos[i].clausulasRestrictivas.toString().length > 0) {
                                                                                                                                                                                                                                                    if(arregloDePrestamos[i].financiacionGarantizada.toString().length > 0) {
                                                                                                                                                                                                                                                        if(arregloDePrestamos[i].valorFinanciacion.toString().length < 21) {
                                                                                                                                                                                                                                                            if(arregloDePrestamos[i].alac.toString().length < 31) {
                                                                                                                                                                                                                                                                if(!isNaN(arregloDePrestamos[i].factor)) {
                                                                                                                                                                                                                                                                    if(Date.parse(new Date(arregloDePrestamos[i].fechaInicio)) || arregloDePrestamos[i].fechaInicio.toString().length == 0 || isValidDateString(arregloDePrestamos[i].fechaInicio)) {
                                                                                                                                                                                                                                                                        if(Date.parse(new Date(arregloDePrestamos[i].fechaFinal)) || arregloDePrestamos[i].fechaFinal.toString().length == 0 || isValidDateString(arregloDePrestamos[i].fechaFinal)) {
                                                                                                                                                                                                                                                                            if(arregloDePrestamos[i].sucursal.length < 51) {
                                                                                                                                                                                                                                                                                if(Date.parse(new Date(arregloDePrestamos[i].fechaImportacion)) || isValidDateString(arregloDePrestamos[i].fechaImportacion)) {
                                                                                                                                                                                                                                                                                    createLoan( arregloDePrestamos[i] );
                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                }
                                                                                                                                                                                                            }
                                                                                                                                                                                                        }
                                                                                                                                                                                                    }
                                                                                                                                                                                                }
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        }
                                                                                                                                                                    };
                                                                                                                                                                } else {
                                                                                                                                                                    $(".loadingScreen").hide();
                                                                                                                                                                    stopTimer();
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        });
                                                                                                                                                    } else {
                                                                                                                                                        for (var i = 0; i < arregloDePrestamos.length; i++) {
                                                                                                                                                            if(arregloDePrestamos[i].idCliente.length < 31) {
                                                                                                                                                                if(arregloDePrestamos[i].nombreCliente.length < 81) {
                                                                                                                                                                    if(arregloDePrestamos[i].tipoPersona.length < 81) {
                                                                                                                                                                        if(arregloDePrestamos[i].tipoSubPersona.length < 81) {
                                                                                                                                                                            if(arregloDePrestamos[i].numPrestamo.toString().length < 51) {
                                                                                                                                                                                if(arregloDePrestamos[i].saldo.toString().length < 21) {
                                                                                                                                                                                    if(arregloDePrestamos[i].moneda.length < 31) {
                                                                                                                                                                                        if(arregloDePrestamos[i].montoOtorgado.toString().length < 21) {
                                                                                                                                                                                            if(arregloDePrestamos[i].diasMora.toString().length < 21) {
                                                                                                                                                                                                if(arregloDePrestamos[i].amortizacion.toString().length < 21) {
                                                                                                                                                                                                    if(arregloDePrestamos[i].sobregiro.toString().length < 21) {
                                                                                                                                                                                                        if(arregloDePrestamos[i].contingente.toString().length < 21) {
                                                                                                                                                                                                            if(arregloDePrestamos[i].clasificacionCartera.length <= 3) {
                                                                                                                                                                                                                if(arregloDePrestamos[i].tipoCredito.length < 81) {
                                                                                                                                                                                                                    if(arregloDePrestamos[i].pago30.toString().length < 21) {
                                                                                                                                                                                                                        if(arregloDePrestamos[i].pago60.toString().length < 21) {
                                                                                                                                                                                                                            if(arregloDePrestamos[i].pago90.toString().length < 21) {
                                                                                                                                                                                                                                if(arregloDePrestamos[i].pago120.toString().length < 21) {
                                                                                                                                                                                                                                    if(arregloDePrestamos[i].clausulasRestrictivas.toString().length > 0) {
                                                                                                                                                                                                                                        if(arregloDePrestamos[i].financiacionGarantizada.toString().length > 0) {
                                                                                                                                                                                                                                            if(arregloDePrestamos[i].valorFinanciacion.toString().length < 21) {
                                                                                                                                                                                                                                                if(arregloDePrestamos[i].alac.toString().length < 31) {
                                                                                                                                                                                                                                                    if(!isNaN(arregloDePrestamos[i].factor)) {
                                                                                                                                                                                                                                                        if(Date.parse(new Date(arregloDePrestamos[i].fechaInicio)) || arregloDePrestamos[i].fechaInicio.toString().length == 0 || isValidDateString(arregloDePrestamos[i].fechaInicio)) {
                                                                                                                                                                                                                                                            if(Date.parse(new Date(arregloDePrestamos[i].fechaFinal)) || arregloDePrestamos[i].fechaFinal.toString().length == 0 || isValidDateString(arregloDePrestamos[i].fechaFinal)) {
                                                                                                                                                                                                                                                                if(arregloDePrestamos[i].sucursal.length < 51) {
                                                                                                                                                                                                                                                                    if(Date.parse(new Date(arregloDePrestamos[i].fechaImportacion)) || isValidDateString(arregloDePrestamos[i].fechaImportacion)) {
                                                                                                                                                                                                                                                                        createLoan( arregloDePrestamos[i] );
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                }
                                                                                                                                                                                                            }
                                                                                                                                                                                                        }
                                                                                                                                                                                                    }
                                                                                                                                                                                                }
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        }
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        };
                                                                                                                                                    }
                                                                                                                                                }
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
                                                                                                                                        } else {
                                                                                                                                            $(".loadingScreen").hide();
                                                                                                                                            stopTimer();
                                                                                                                                        }
                                                                                                                                    } else {
                                                                                                                                        $("body").overhang({
                                                                                                                                            type: "error",
                                                                                                                                            primary: "#f84a1d",
                                                                                                                                            accent: "#d94e2a",
                                                                                                                                            message: "Ingrese un valor para la fila inicial de la hoja de excel.",
                                                                                                                                            overlay: true,
                                                                                                                                            closeConfirm: true
                                                                                                                                        });
                                                                                                                                        $(".loadingScreen").hide();
                                                                                                                                        stopTimer();
                                                                                                                                    }
                                                                                                                                } else {
                                                                                                                                    $("body").overhang({
                                                                                                                                        type: "error",
                                                                                                                                        primary: "#f84a1d",
                                                                                                                                        accent: "#d94e2a",
                                                                                                                                        message: "Ingrese un valor para el nombre de la hoja de excel.",
                                                                                                                                        overlay: true,
                                                                                                                                        closeConfirm: true
                                                                                                                                    });
                                                                                                                                    $(".loadingScreen").hide();
                                                                                                                                    stopTimer();
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                $("body").overhang({
                                                                                                                                    type: "error",
                                                                                                                                    primary: "#f84a1d",
                                                                                                                                    accent: "#d94e2a",
                                                                                                                                    message: "Ingrese una letra para la columna de fecha de importación.",
                                                                                                                                    overlay: true,
                                                                                                                                    closeConfirm: true
                                                                                                                                });
                                                                                                                                $(".loadingScreen").hide();
                                                                                                                                stopTimer();
                                                                                                                            }
                                                                                                                        } else {
                                                                                                                            $("body").overhang({
                                                                                                                                type: "error",
                                                                                                                                primary: "#f84a1d",
                                                                                                                                accent: "#d94e2a",
                                                                                                                                message: "Ingrese una letra para la columna del campo de sucursal.",
                                                                                                                                overlay: true,
                                                                                                                                closeConfirm: true
                                                                                                                            });
                                                                                                                            $(".loadingScreen").hide();
                                                                                                                            stopTimer();
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        $("body").overhang({
                                                                                                                            type: "error",
                                                                                                                            primary: "#f84a1d",
                                                                                                                            accent: "#d94e2a",
                                                                                                                            message: "Ingrese una letra para la columna del monto otorgado.",
                                                                                                                            overlay: true,
                                                                                                                            closeConfirm: true
                                                                                                                        });
                                                                                                                        $(".loadingScreen").hide();
                                                                                                                        stopTimer();
                                                                                                                    }
                                                                                                                } else {
                                                                                                                    $("body").overhang({
                                                                                                                        type: "error",
                                                                                                                        primary: "#f84a1d",
                                                                                                                        accent: "#d94e2a",
                                                                                                                        message: "Ingrese una letra para la columna de fecha de final del préstamo.",
                                                                                                                        overlay: true,
                                                                                                                        closeConfirm: true
                                                                                                                    });
                                                                                                                    $(".loadingScreen").hide();
                                                                                                                    stopTimer();
                                                                                                                }
                                                                                                            } else {
                                                                                                                $("body").overhang({
                                                                                                                    type: "error",
                                                                                                                    primary: "#f84a1d",
                                                                                                                    accent: "#d94e2a",
                                                                                                                    message: "Ingrese una letra para la columna de fecha de inicio del préstamo.",
                                                                                                                    overlay: true,
                                                                                                                    closeConfirm: true
                                                                                                                });
                                                                                                                $(".loadingScreen").hide();
                                                                                                                stopTimer();
                                                                                                            }
                                                                                                        } else {
                                                                                                            $("body").overhang({
                                                                                                                type: "error",
                                                                                                                primary: "#f84a1d",
                                                                                                                accent: "#d94e2a",
                                                                                                                message: "Ingrese una letra para la columna de factor.",
                                                                                                                overlay: true,
                                                                                                                closeConfirm: true
                                                                                                            });
                                                                                                            $(".loadingScreen").hide();
                                                                                                            stopTimer();
                                                                                                        }
                                                                                                    } else {
                                                                                                        $("body").overhang({
                                                                                                            type: "error",
                                                                                                            primary: "#f84a1d",
                                                                                                            accent: "#d94e2a",
                                                                                                            message: "Ingrese una letra para la columna de alac.",
                                                                                                            overlay: true,
                                                                                                            closeConfirm: true
                                                                                                        });
                                                                                                        $(".loadingScreen").hide();
                                                                                                        stopTimer();
                                                                                                    }
                                                                                                } else {
                                                                                                    $("body").overhang({
                                                                                                        type: "error",
                                                                                                        primary: "#f84a1d",
                                                                                                        accent: "#d94e2a",
                                                                                                        message: "Ingrese una letra para la columna de valor de la financiación.",
                                                                                                        overlay: true,
                                                                                                        closeConfirm: true
                                                                                                    });
                                                                                                    $(".loadingScreen").hide();
                                                                                                    stopTimer();
                                                                                                }
                                                                                            } else {
                                                                                                $("body").overhang({
                                                                                                    type: "error",
                                                                                                    primary: "#f84a1d",
                                                                                                    accent: "#d94e2a",
                                                                                                    message: "Ingrese una letra para la columna de financiación garantizada.",
                                                                                                    overlay: true,
                                                                                                    closeConfirm: true
                                                                                                });
                                                                                                $(".loadingScreen").hide();
                                                                                                stopTimer();
                                                                                            }
                                                                                        } else {
                                                                                            $("body").overhang({
                                                                                                type: "error",
                                                                                                primary: "#f84a1d",
                                                                                                accent: "#d94e2a",
                                                                                                message: "Ingrese una letra para la columna de fecha de clausulas restrictivas.",
                                                                                                overlay: true,
                                                                                                closeConfirm: true
                                                                                            });
                                                                                            $(".loadingScreen").hide();
                                                                                            stopTimer();
                                                                                        }
                                                                                    
                                                                                    } else {
                                                                                        $("body").overhang({
                                                                                            type: "error",
                                                                                            primary: "#f84a1d",
                                                                                            accent: "#d94e2a",
                                                                                            message: "Ingrese una letra para la columna del pago esperado en 120 días.",
                                                                                            overlay: true,
                                                                                            closeConfirm: true
                                                                                        });
                                                                                        $(".loadingScreen").hide();
                                                                                        stopTimer();
                                                                                    }
                                                                                } else {
                                                                                    $("body").overhang({
                                                                                        type: "error",
                                                                                        primary: "#f84a1d",
                                                                                        accent: "#d94e2a",
                                                                                        message: "Ingrese una letra para la columna del pago esperado en 90 días.",
                                                                                        overlay: true,
                                                                                        closeConfirm: true
                                                                                    });
                                                                                    $(".loadingScreen").hide();
                                                                                    stopTimer();
                                                                                }
                                                                            } else {
                                                                                $("body").overhang({
                                                                                    type: "error",
                                                                                    primary: "#f84a1d",
                                                                                    accent: "#d94e2a",
                                                                                    message: "Ingrese una letra para la columna del pago esperado en 60 días.",
                                                                                    overlay: true,
                                                                                    closeConfirm: true
                                                                                });
                                                                                $(".loadingScreen").hide();
                                                                                stopTimer();
                                                                            }
                                                                        } else {
                                                                            $("body").overhang({
                                                                                type: "error",
                                                                                primary: "#f84a1d",
                                                                                accent: "#d94e2a",
                                                                                message: "Ingrese una letra para la columna del pago esperado en 30 días.",
                                                                                overlay: true,
                                                                                closeConfirm: true
                                                                            });
                                                                            $(".loadingScreen").hide();
                                                                            stopTimer();
                                                                        }
                                                                    } else {
                                                                        $("body").overhang({
                                                                            type: "error",
                                                                            primary: "#f84a1d",
                                                                            accent: "#d94e2a",
                                                                            message: "Ingrese una letra para la columna de tipo de crédito.",
                                                                            overlay: true,
                                                                            closeConfirm: true
                                                                        });
                                                                        $(".loadingScreen").hide();
                                                                        stopTimer();
                                                                    }
                                                                } else {
                                                                    $("body").overhang({
                                                                        type: "error",
                                                                        primary: "#f84a1d",
                                                                        accent: "#d94e2a",
                                                                        message: "Ingrese una letra para la columna de clasificación de cartéra.",
                                                                        overlay: true,
                                                                        closeConfirm: true
                                                                    });
                                                                    $(".loadingScreen").hide();
                                                                    stopTimer();
                                                                }
                                                            } else {
                                                                $("body").overhang({
                                                                    type: "error",
                                                                    primary: "#f84a1d",
                                                                    accent: "#d94e2a",
                                                                    message: "Ingrese una letra para la columna del campo de contingente.",
                                                                    overlay: true,
                                                                    closeConfirm: true
                                                                });
                                                                $(".loadingScreen").hide();
                                                                stopTimer();
                                                            }
                                                        } else {
                                                            $("body").overhang({
                                                                type: "error",
                                                                primary: "#f84a1d",
                                                                accent: "#d94e2a",
                                                                message: "Ingrese una letra para la columna de sobregiro.",
                                                                overlay: true,
                                                                closeConfirm: true
                                                            });
                                                            $(".loadingScreen").hide();
                                                            stopTimer();
                                                        }
                                                    } else {
                                                        $("body").overhang({
                                                            type: "error",
                                                            primary: "#f84a1d",
                                                            accent: "#d94e2a",
                                                            message: "Ingrese una letra para la columna de amortizaciones.",
                                                            overlay: true,
                                                            closeConfirm: true
                                                        });
                                                        $(".loadingScreen").hide();
                                                        stopTimer();
                                                    }
                                                } else {
                                                    $("body").overhang({
                                                        type: "error",
                                                        primary: "#f84a1d",
                                                        accent: "#d94e2a",
                                                        message: "Ingrese una letra para la columna de días de mora.",
                                                        overlay: true,
                                                        closeConfirm: true
                                                    });
                                                    $(".loadingScreen").hide();
                                                    stopTimer();
                                                }
                                            } else {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#f84a1d",
                                                    accent: "#d94e2a",
                                                    message: "Ingrese una letra para la columna del campo de moneda.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                                $(".loadingScreen").hide();
                                                stopTimer();
                                            }
                                        } else {
                                            $("body").overhang({
                                                type: "error",
                                                primary: "#f84a1d",
                                                accent: "#d94e2a",
                                                message: "Ingrese una letra para la columna de saldo de deposito válida.",
                                                overlay: true,
                                                closeConfirm: true
                                            });
                                            $(".loadingScreen").hide();
                                            stopTimer();
                                        }
                                    } else {
                                        $("body").overhang({
                                            type: "error",
                                            primary: "#f84a1d",
                                            accent: "#d94e2a",
                                            message: "Ingrese una letra para la columna de saldo de número de prestamo válida.",
                                            overlay: true,
                                            closeConfirm: true
                                        });
                                        $(".loadingScreen").hide();
                                        stopTimer();
                                    }
                                } else {
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Ingrese una letra para la columna de saldo de deposito válida.",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                    $(".loadingScreen").hide();
                                    stopTimer();
                                }
                            } else {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Ingrese una letra para la columna de tipo de persona válida.",
                                    overlay: true,
                                    closeConfirm: true
                                });
                                $(".loadingScreen").hide();
                                stopTimer();
                            }
                        } else {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "Ingrese una letra para la columna del campo de nombre válida.",
                                overlay: true,
                                closeConfirm: true
                            });
                            $(".loadingScreen").hide();
                            stopTimer();
                        }
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Ingrese una letra para la columna del campo de id del cliente válida.",
                            overlay: true,
                            closeConfirm: true
                        });
                        $(".loadingScreen").hide();
                        stopTimer();
                    }
                }, 3000);
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "No existen valores del monto FOSEDE. Creé un valor antes de importar",
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
            message: "Ingrese un valor para la columna de "+campo+".",
            overlay: true,
            closeConfirm: true
        });
    }
}

function createLoan (prestamo) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Prestamos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, clausulasRestrictivas, esFinanciacionGarantizada, valorFinanciacion, alac, factor, fechaInicio, fechaFinal, sucursal, fecha) values ('"+$.trim(prestamo.idCliente)+"','"+$.trim(prestamo.nombreCliente)+"','"+$.trim(prestamo.tipoPersona)+"','"+$.trim(prestamo.tipoSubPersona)+"',"+prestamo.numPrestamo+","+prestamo.saldo+",'"+$.trim(prestamo.moneda)+"',"+prestamo.montoOtorgado+","+prestamo.diasMora+","+prestamo.amortizacion+","+prestamo.sobregiro+","+prestamo.contingente+",'"+$.trim(prestamo.clasificacionCartera)+"','"+$.trim(prestamo.tipoCredito)+"',"+prestamo.pago30+","+prestamo.pago60+","+prestamo.pago90+","+prestamo.pago120+",'"+prestamo.clausulasRestrictivas+"','"+prestamo.financiacionGarantizada+"',"+prestamo.valorFinanciacion+",'"+$.trim(prestamo.alac)+"',"+prestamo.factor+",'"+formatDateCreation(prestamo.fechaInicio)+"','"+formatDateCreation(prestamo.fechaFinal)+"','"+$.trim(prestamo.sucursal)+"','"+formatDateCreation(prestamo.fechaImportacion)+"')", (err, result) => {
            if (err) {
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        contadorInserciones++;
                        arregloErroresInsercion.push({b: "Prestamo: "+prestamo.numPrestamo, c: "Error en inserción mssql"});
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

function saveFields (tipoDB, indexTabla) {
    if(indexTabla == 0) {
        var cuenta = $.trim($("#cuentaConexionActivos").val());
        var nombre = $.trim($("#nombreConexionActivos").val());
        var saldo = $.trim($("#saldoConexionActivos").val());
        var moneda = $.trim($("#monedaConexionActivos").val());
        var sucursal = $.trim($("#sucursalConexionActivos").val());
        var fechaImportacion = $.trim($("#fechaImportacionConexionActivos").val());
        var tipo = tipoDB;

        const transaction = new sql.Transaction( pool1 );
        transaction.begin(err => {
            var rolledBack = false;
            transaction.on('rollback', aborted => {
                // emited with aborted === true
                rolledBack = true;
            });
            const request = new sql.Request(transaction);
            request.query("select * from Activos_Campos", (err, result) => {
                if (err) {
                    if (!rolledBack) {
                        transaction.rollback(err => {
                            $("body").overhang({
                                type: "error",
                                primary: "#40D47E",
                                accent: "#27AE60",
                                message: "Error en conneción con campos de tabla activos.",
                                overlay: true,
                                closeConfirm: true
                            });
                        });
                    }
                }  else {
                    transaction.commit(err => {
                        // ... error checks
                        var existe = result.recordset.filter(function(object) {
                            return object.tipo == tipoDB;
                        });
                        if(existe.length > 0) {
                            const transaction2 = new sql.Transaction( pool1 );
                            transaction2.begin(err => {
                                var rolledBack = false;
                                transaction2.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request2 = new sql.Request(transaction2);
                                request2.query("update Activos_Campos set cuenta = '"+cuenta+"', nombre = '"+nombre+"', saldo = '"+saldo+"', moneda = '"+moneda+"', sucursal = '"+sucursal+"', fecha = '"+fechaImportacion+"' where ID = "+existe[0].ID, (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            console.log(err)
                                            transaction2.rollback(err => {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error en modificación de campos de tabla activos.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction2.commit(err => {
                                            // ... error checks
                                            console.log("modifico campos activos");
                                            $("body").overhang({
                                                type: "success",
                                                primary: "#40D47E",
                                                accent: "#27AE60",
                                                message: "Campos guardados satisfactoriamente.",
                                                duration: 2,
                                                overlay: true
                                            });
                                        });
                                    }
                                });
                            }); // fin transaction2
                        } else {
                            const transaction2 = new sql.Transaction( pool1 );
                            transaction2.begin(err => {
                                var rolledBack = false;
                                transaction2.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request = new sql.Request(transaction2);
                                request.query("insert into Activos_Campos (cuenta, nombre, saldo, moneda, sucursal, fecha, tipo) values ('"+cuenta+"','"+nombre+"','"+saldo+"','"+moneda+"','"+sucursal+"','"+fechaImportacion+"','"+tipo+"')", (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction2.rollback(err => {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error en inserción de campos de tabla activos.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction2.commit(err => {
                                            // ... error checks
                                            console.log("inserto campos activos");
                                            $("body").overhang({
                                                type: "success",
                                                primary: "#40D47E",
                                                accent: "#27AE60",
                                                message: "Campos guardados satisfactoriamente.",
                                                duration: 2,
                                                overlay: true
                                            });
                                        });
                                    }
                                });
                            }); // fin transaction2
                        }
                    });
                }
            });
        }); // fin transaction
    } else if(indexTabla == 1) {
        var idCliente = $.trim($("#idClienteConexionDepositos").val());
        var numCuenta = $.trim($("#numCuentaConexionDepositos").val());
        var nombreCliente = $.trim($("#nombreClienteConexionDepositos").val());
        var tipoPersona = $.trim($("#tipoPersonaClienteConexionDepositos").val());
        var tipoSubPersona = $.trim($("#tipoSubPersonaClienteConexionDepositos").val());
        var saldo = $.trim($("#saldoConexionDepositos").val());
        var moneda = $.trim($("#monedaConexionDepositos").val());
        var tipoCuenta = $.trim($("#tipoCuentaConexionDepositos").val());
        var fechaInicio = $.trim($("#fechaInicioConexionDepositos").val());
        var fechaFinal = $.trim($("#fechaFinalConexionDepositos").val());
        var sucursal = $.trim($("#sucursalConexionDepositos").val());
        var fechaImportacion = $.trim($("#fechaImportacionConexionDepositos").val());
        var tipo = tipoDB;
        const transaction = new sql.Transaction( pool1 );
        transaction.begin(err => {
            var rolledBack = false;
            transaction.on('rollback', aborted => {
                // emited with aborted === true
                rolledBack = true;
            });
            const request = new sql.Request(transaction);
            request.query("select * from Depositos_Campos", (err, result) => {
                if (err) {
                    if (!rolledBack) {
                        transaction.rollback(err => {
                            $("body").overhang({
                                type: "error",
                                primary: "#40D47E",
                                accent: "#27AE60",
                                message: "Error en conneción con campos de tabla depósitos.",
                                overlay: true,
                                closeConfirm: true
                            });
                        });
                    }
                }  else {
                    transaction.commit(err => {
                        // ... error checks
                        console.log("Transaction committed MainDB Variables");
                        console.log(result);
                        var existe = result.recordset.filter(function(object) {
                            return object.tipo == tipoDB;
                        });
                        if(existe.length > 0) {
                            console.log(existe)
                            const transaction2 = new sql.Transaction( pool1 );
                            transaction2.begin(err => {
                                var rolledBack = false;
                                transaction2.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request2 = new sql.Request(transaction2);
                                request2.query("update Depositos_Campos set idCliente = '"+idCliente+"', numCuenta = '"+numCuenta+"', nombreCliente = '"+nombreCliente+"', tipoPersona = '"+tipoPersona+"', tipoSubPersona = '"+tipoSubPersona+"', saldo = '"+saldo+"', moneda = '"+moneda+"', tipoCuenta = '"+tipoCuenta+"', fechaInicio = '"+fechaInicio+"', fechaFinal = '"+fechaFinal+"' , sucursal = '"+sucursal+"', fecha = '"+fechaImportacion+"' where ID = "+existe[0].ID, (err, result) => {
                                    if (err) {
                                        console.log(err)
                                        if (!rolledBack) {
                                            transaction2.rollback(err => {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error en modificación de campos de tabla depósitos.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction2.commit(err => {
                                            // ... error checks
                                            console.log("modifico campos depositos");
                                            $("body").overhang({
                                                type: "success",
                                                primary: "#40D47E",
                                                accent: "#27AE60",
                                                message: "Campos guardados satisfactoriamente.",
                                                duration: 2,
                                                overlay: true
                                            });
                                        });
                                    }
                                });
                            }); // fin transaction2
                        } else {
                            const transaction2 = new sql.Transaction( pool1 );
                            transaction2.begin(err => {
                                var rolledBack = false;
                                transaction2.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request2 = new sql.Request(transaction2);
                                request2.query("insert into Depositos_Campos (idCliente, numCuenta, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, fechaInicio, fechaFinal, sucursal, fecha, tipo) values ('"+idCliente+"','"+numCuenta+"','"+nombreCliente+"','"+tipoPersona+"','"+tipoSubPersona+"','"+saldo+"','"+moneda+"','"+tipoCuenta+"','"+fechaInicio+"','"+fechaFinal+"','"+sucursal+"','"+fechaImportacion+"','"+tipo+"')", (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction2.rollback(err => {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error en inserción de campos de tabla depósitos.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction2.commit(err => {
                                            // ... error checks
                                            console.log("inserto campos depositos");
                                            $("body").overhang({
                                                type: "success",
                                                primary: "#40D47E",
                                                accent: "#27AE60",
                                                message: "Campos guardados satisfactoriamente.",
                                                duration: 2,
                                                overlay: true
                                            });
                                        });
                                    }
                                });
                            }); // fin transaction2
                        }
                    });
                }
            });
        }); // fin transaction
    } else if(indexTabla == 2) {
        var idCliente = $.trim($("#idClienteConexionPrestamos").val());
        var nombreCliente = $.trim($("#nombreClienteConexionPrestamos").val());
        var tipoPersona = $.trim($("#tipoPersonaClienteConexionPrestamos").val());
        var tipoSubPersona = $.trim($("#tipoSubPersonaClienteConexionPrestamos").val());
        var numPrestamo = $.trim($("#numPrestamoConexionPrestamos").val());
        var saldo = $.trim($("#saldoConexionPrestamos").val());
        var moneda = $.trim($("#monedaConexionPrestamos").val());
        var diasMora = $.trim($("#moraConexionPrestamos").val());
        var amortizaciones = $.trim($("#amortizacionesConexionPrestamos").val());
        var sobregiro = $.trim($("#sobregirosConexionPrestamos").val());
        var contingente = $.trim($("#contingenteConexionPrestamos").val());
        var clasificacionCartera = $.trim($("#clasificacionCarteraConexionPrestamos").val());
        var tipoCredito = $.trim($("#tipoCreditoConexionPrestamos").val());
        var esperado30 = $.trim($("#esperado30ConexionPrestamos").val());
        var esperado60 = $.trim($("#esperado60ConexionPrestamos").val());
        var esperado90 = $.trim($("#esperado90ConexionPrestamos").val());
        var esperado120 = $.trim($("#esperado120ConexionPrestamos").val());
        var clausulasRestrictivas = $.trim($("#clausulasRestrictivasConexionPrestamos").val());
        var financiacionGarantizada = $.trim($("#financiacionGarantizadaConexionPrestamos").val());
        var valorFinanciacion = $.trim($("#valorFinanciacionConexionPrestamos").val());
        var alac = $.trim($("#alacConexionPrestamos").val());
        var factor = $.trim($("#factorConexionPrestamos").val());
        var fechaInicio = $.trim($("#fechaInicioConexionPrestamos").val());
        var fechaFinal = $.trim($("#fechaExpiracionConexionPrestamos").val());
        var montoOtorgado = $.trim($("#montoOtorgadoConexionPrestamos").val());
        var sucursal = $.trim($("#sucursalConexionPrestamos").val());
        var fechaImportacion = $.trim($("#fechaImportacionConexionPrestamos").val());
        var tipo = tipoDB;
        const transaction = new sql.Transaction( pool1 );
        transaction.begin(err => {
            var rolledBack = false;
            transaction.on('rollback', aborted => {
                // emited with aborted === true
                rolledBack = true;
            });
            const request = new sql.Request(transaction);
            request.query("select * from Prestamos_Campos", (err, result) => {
                if (err) {
                    if (!rolledBack) {
                        transaction.rollback(err => {
                            $("body").overhang({
                                type: "error",
                                primary: "#40D47E",
                                accent: "#27AE60",
                                message: "Error en conneción con campos de tabla préstamos.",
                                overlay: true,
                                closeConfirm: true
                            });
                        });
                    }
                }  else {
                    transaction.commit(err => {
                        // ... error checks
                        console.log("Transaction committed MainDB Variables");
                        console.log(result);
                        var existe = result.recordset.filter(function(object) {
                            return object.tipo == tipoDB;
                        });
                        if(existe.length > 0) {
                            const transaction2 = new sql.Transaction( pool1 );
                            transaction2.begin(err => {
                                var rolledBack = false;
                                transaction2.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request2 = new sql.Request(transaction2);
                                request2.query("update Prestamos_Campos set idCliente = '"+idCliente+"', nombreCliente = '"+nombreCliente+"', tipoPersona = '"+tipoPersona+"', tipoSubPersona = '"+tipoSubPersona+"', numPrestamo = '"+numPrestamo+"', saldo = '"+saldo+"', moneda = '"+moneda+"', montoOtorgado = '"+montoOtorgado+"', diasMora = '"+diasMora+"', amortizacion = '"+amortizaciones+"', sobregiro = '"+sobregiro+"', contingente = '"+contingente+"', clasificacionCartera = '"+clasificacionCartera+"', tipoCredito = '"+tipoCredito+"', pago30 = '"+esperado30+"', pago60 = '"+esperado60+"', pago90 = '"+esperado90+"', pago120 = '"+esperado120+"', clausulasRestrictivas = '"+clausulasRestrictivas+"', esFinanciacionGarantizada = '"+financiacionGarantizada+"', valorFinanciacion = '"+valorFinanciacion+"', alac = '"+alac+"', factor = '"+factor+"', fechaInicio = '"+fechaInicio+"', fechaFinal = '"+fechaFinal+"', sucursal = '"+sucursal+"', fecha = '"+fechaImportacion+"' where ID = "+existe[0].ID, (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction2.rollback(err => {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error en modificación de campos de tabla préstamos.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction2.commit(err => {
                                            // ... error checks
                                            console.log("modifico campos prestamos");
                                            $("body").overhang({
                                                type: "success",
                                                primary: "#40D47E",
                                                accent: "#27AE60",
                                                message: "Campos guardados satisfactoriamente.",
                                                duration: 2,
                                                overlay: true
                                            });
                                        });
                                    }
                                });
                            }); // fin transaction2
                        } else {
                            const transaction2 = new sql.Transaction( pool1 );
                            transaction2.begin(err => {
                                var rolledBack = false;
                                transaction2.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request2 = new sql.Request(transaction2);
                                request2.query("insert into Prestamos_Campos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, clausulasRestrictivas, esFinanciacionGarantizada, valorFinanciacion, alac, factor, fechaInicio, fechaFinal, sucursal, fecha, tipo) values ('"+idCliente+"','"+nombreCliente+"','"+tipoPersona+"','"+tipoSubPersona+"','"+numPrestamo+"','"+saldo+"','"+moneda+"','"+montoOtorgado+"','"+diasMora+"','"+amortizaciones+"','"+sobregiro+"','"+contingente+"','"+clasificacionCartera+"','"+tipoCredito+"','"+esperado30+"','"+esperado60+"','"+esperado90+"','"+esperado120+"','"+clausulasRestrictivas+"','"+financiacionGarantizada+"','"+valorFinanciacion+"','"+alac+"','"+factor+"','"+fechaInicio+"','"+fechaFinal+"','"+sucursal+"','"+fechaImportacion+"','"+tipo+"')", (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction2.rollback(err => {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error en inserción de campos de tabla préstamos.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction2.commit(err => {
                                            // ... error checks
                                            console.log("inserto campos prestamos");
                                            $("body").overhang({
                                                type: "success",
                                                primary: "#40D47E",
                                                accent: "#27AE60",
                                                message: "Campos guardados satisfactoriamente.",
                                                duration: 2,
                                                overlay: true
                                            });
                                        });
                                    }
                                });
                            }); // fin transaction2
                        }
                    });
                }
            });
        }); // fin transaction
    }
}

function connectionTest (indexTabla) {
	$("#testConnection").prop('disabled', true);

    var arreglo;
    var user;
    var password;
    var server;
    var database;
    var table;
    if(indexTabla == 0) {
        arreglo = 'arregloActivos';
        user = $.trim($("#activosUserDB").val());
        password = $.trim($("#activosPasswordDB").val());
        server = $.trim($("#activosServerDB").val());
        database = $.trim($("#activosDataBaseDB").val());
        table = $.trim($("#activosTableDB").val());
    } else if(indexTabla == 1) {
        arreglo = 'arregloDepositos';
        user = $.trim($("#depositosUserDB").val());
        password = $.trim($("#depositosPasswordDB").val());
        server = $.trim($("#depositosServerDB").val());
        database = $.trim($("#depositosDataBaseDB").val());
        table = $.trim($("#depositosTableDB").val());
    } else if(indexTabla == 2) {
        arreglo = 'arregloPrestamos';
        user = $.trim($("#prestamosUserDB").val());
        password = $.trim($("#prestamosPasswordDB").val());
        server = $.trim($("#prestamosServerDB").val());
        database = $.trim($("#prestamosDataBaseDB").val());
        table = $.trim($("#prestamosTableDB").val());
    }
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
						    .query('select TOP 3 * from '+table, (err, result) => {
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
						  	message: "Ingrese un valor en el campo de ingresar el nombre de la tabla.",
						  	overlay: true,
                            closeConfirm: true
						});
					}
				} else {
					$("body").overhang({
					  	type: "error",
					  	primary: "#f84a1d",
						accent: "#d94e2a",
					  	message: "Ingrese un valor en el campo de ingresar el nombre de la base de datos.",
					  	overlay: true,
                        closeConfirm: true
					});
				}
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#Ingrese un valor en el campo de ingresar dirección del servidor.",
				  	overlay: true,
                    closeConfirm: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "Ingrese un valor en el campo de ingresar contraseña.",
			  	overlay: true,
                closeConfirm: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Ingrese un valor en el campo de ingresar nombre de usuario.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function importFromConnection () {
    /*var content = '<div style="display: flex; align-items: center; justify-content: center; height: 25vh; text-align: center;">'+
                        '<ul class="b">'+
                            '<li>Coffee</li>'+
                            '<li>Tea</li>'+
                            '<li>Coca Cola</li>'+
                        '</ul>'+
                    '</div>';
    $("body").overhang({
        type: "error",
        primary: "#f84a1d",
        accent: "#d94e2a",
        message: content,
        html: true,
        overlay: true,
        closeConfirm: true
    });*/
    var fechaSeleccionada = $("#fechaImportacion").datepicker('getDate');
    if (Object.prototype.toString.call(fechaSeleccionada) === "[object Date]") {
        if (isNaN(fechaSeleccionada.getTime())) {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Seleccione una fecha.",
                overlay: true,
                closeConfirm: true
            });
        } else {
            var idSeleccionTabla = $("input[name='coneccionesRadio']:checked").val();
            var nombreArreglo = '', tablaErrorMes = '';
            if(idSeleccionTabla == 1) {
                nombreArreglo = 'arregloActivos';
                tablaErrorMes = 'activos';
            } else if(idSeleccionTabla == 2) {
                nombreArreglo = 'arregloDepositos';
                tablaErrorMes = 'depositos';
            } else if(idSeleccionTabla == 3) {
                nombreArreglo = 'arregloPrestamos';
                tablaErrorMes = 'prestamos';
            }
            arregloErroresExcel = [];
            arregloErroresInsercion = [];
            contadorInserciones = 0;
            totalInserciones = 0;
            insertoEnDBListas = false;
            var tipoSeleccionConnecion = $("#selectDeConneciones").val();
            if(idSeleccionTabla == 1) {
                var existe = arregloConecciones.filter(function(object) {
                                return object.tipo == tipoSeleccionConnecion && object.arreglo == nombreArreglo;
                            });
                if(existe.length > 0) {
                    $("body").overhang({
                        type: "confirm",
                        primary: "#f5a433",
                        accent: "#dc9430",
                        yesColor: "#3498DB",
                        message: 'Esta seguro que desea realizar la Importación?',
                        overlay: true,
                        yesMessage: "Importar",
                        noMessage: "Cancelar",
                        callback: function (value) {
                            if(value){
                                var user = existe[0].usuario;
                                var password = existe[0].constrasena;
                                var server = existe[0].server;
                                var database = existe[0].basedatos;
                                var table = existe[0].tabla;
                                myWorker.postMessage("init");
                                $( ".loadingScreen" ).fadeIn( "slow", function() {
                                });
                                $("#descripcionLoading").text('');
                                if(tipoSeleccionConnecion == 'mssql') {
                                    const transactionCampos = new sql.Transaction( pool1 );
                                    transactionCampos.begin(err => {
                                        var rolledBack = false;
                                        transactionCampos.on('rollback', aborted => {
                                            rolledBack = true;
                                        });
                                        const request = new sql.Request(transactionCampos);
                                        request.query("select * from Activos_Campos", (err, result) => {
                                            if (err) {
                                                if (!rolledBack) {
                                                    transactionCampos.rollback(err => {
                                                        $("body").overhang({
                                                            type: "error",
                                                            primary: "#f84a1d",
                                                            accent: "#d94e2a",
                                                            message: "Error en conneción Activos_Campos.",
                                                            overlay: true,
                                                            closeConfirm: true
                                                        });
                                                        $(".loadingScreen").hide();
                                                        stopTimer();
                                                    });
                                                }
                                            }  else {
                                                transactionCampos.commit(err => {
                                                    // ... error checks
                                                    var campos = result.recordset.filter(function(object) {
                                                                                    return object.tipo == tipoSeleccionConnecion;
                                                                                });
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
                                                        .query("select * from "+table+" where "+campos[0].fecha+" = '"+formatDateCreation(fechaSeleccionada)+"'", (err, result) => {
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
                                                                    if($.trim(valorArreglo[campos[0].cuenta]).length < 31) {
                                                                        if($.trim(valorArreglo[campos[0].nombre]).length < 120) {
                                                                            if($.trim(valorArreglo[campos[0].saldo].toString()).length < 20) {
                                                                                if($.trim(valorArreglo[campos[0].moneda]).length < 30) {
                                                                                    if( existeMonedaFOSEDE( $.trim(valorArreglo[campos[0].moneda]) ) ) {
                                                                                        if($.trim(valorArreglo[campos[0].sucursal]).length < 50) {
                                                                                            if(Date.parse(valorArreglo[campos[0].fecha]) || isValidDateString(valorArreglo[campos[0].fecha]) ) {

                                                                                                if (Object.prototype.toString.call(valorArreglo[campos[0].fecha]) === "[object Date]") {
                                                                                                    if (!isNaN(valorArreglo[campos[0].fecha].getTime())) {
                                                                                                        if(valorArreglo[campos[0].fecha] != undefined && valorArreglo[campos[0].fecha].length != 0 ) {
                                                                                                            valorArreglo[campos[0].fecha] = new Date(valorArreglo[campos[0].fecha].getUTCFullYear(), valorArreglo[campos[0].fecha].getUTCMonth(), valorArreglo[campos[0].fecha].getUTCDate());
                                                                                                            valorArreglo[campos[0].fecha] = formatDateCreation(valorArreglo[campos[0].fecha]);
                                                                                                        } else {
                                                                                                            valorArreglo[campos[0].fecha] = '2001-01-01';
                                                                                                        }
                                                                                                    } else {
                                                                                                        if(valorArreglo[campos[0].fecha] != undefined && valorArreglo[campos[0].fecha].length != 0 ) {
                                                                                                            valorArreglo[campos[0].fecha] = formatDateCreationString(valorArreglo[campos[0].fecha]);
                                                                                                        } else {
                                                                                                            valorArreglo[campos[0].fecha] = '2001-01-01';
                                                                                                        }
                                                                                                    }
                                                                                                } else {
                                                                                                    if(valorArreglo[campos[0].fecha] != undefined && valorArreglo[campos[0].fecha].length != 0 ) {
                                                                                                        valorArreglo[campos[0].fecha] = formatDateCreationString(valorArreglo[campos[0].fecha]);
                                                                                                    } else {
                                                                                                        valorArreglo[campos[0].fecha] = '2001-01-01';
                                                                                                    }
                                                                                                }
                                                                                                const transaction = new sql.Transaction( pool1 );
                                                                                                transaction.begin(err => {
                                                                                                    var rolledBack = false;
                                                                                                    transaction.on('rollback', aborted => {
                                                                                                        rolledBack = true;
                                                                                                    });
                                                                                                    const request = new sql.Request(transaction);
                                                                                                    request.query("insert into Activos (cuenta, nombre, saldo, moneda, sucursal, fecha) values ('"+$.trim(valorArreglo[campos[0].cuenta])+"','"+$.trim(valorArreglo[campos[0].nombre])+"',"+valorArreglo[campos[0].saldo]+",'"+$.trim(valorArreglo[campos[0].moneda])+"','"+$.trim(valorArreglo[campos[0].sucursal])+"','"+valorArreglo[campos[0].fecha]+"')", (err, result) => {
                                                                                                        if (err) {
                                                                                                            console.log(err);
                                                                                                            if (!rolledBack) {
                                                                                                                transaction.rollback(err => {
                                                                                                                    contadorInserciones++;
                                                                                                                    arregloErroresInsercion.push({b: "Activo: "+nombre, c: "Error en inserción mssql"});
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
                                                                                                arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor de fecha de importación no es valido"});
                                                                                                contadorInserciones++;
                                                                                                printErrorFile();
                                                                                            }
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor de sucursal es mayor a 50 caracteres"});
                                                                                            contadorInserciones++;
                                                                                            printErrorFile();
                                                                                        }
                                                                                    } else {
                                                                                        arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor del campo de moneda no existe en valores FOSEDE"});
                                                                                        contadorInserciones++;
                                                                                        printErrorFile();
                                                                                    }
                                                                                } else {
                                                                                    arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor de la moneda es mayor a 30 caracteres"});
                                                                                    contadorInserciones++;
                                                                                    printErrorFile();
                                                                                }
                                                                            } else {
                                                                                arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor del saldo es mayor a 20 caracteres"});
                                                                                contadorInserciones++;
                                                                                printErrorFile();
                                                                            }
                                                                        } else {
                                                                            arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor es mayor a 120 caracteres"});
                                                                            contadorInserciones++;
                                                                            printErrorFile();
                                                                        }
                                                                    } else {
                                                                        arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor de la cuenta es mayor a 30 caracteres"});
                                                                        contadorInserciones++;
                                                                        printErrorFile();
                                                                    }
                                                                };
                                                                if(result.recordset.length == 0) {
                                                                    $(".loadingScreen").hide();
                                                                    stopTimer();
                                                                    $("body").overhang({
                                                                        type: "success",
                                                                        primary: "#40D47E",
                                                                        accent: "#27AE60",
                                                                        message: "No se encontrarón valores para esa fecha.",
                                                                        duration: 2,
                                                                        overlay: true
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }); // fin pool connect
                                                });
                                            }
                                        });
                                    }); // fin transaction
                                } //fin mssql
                            }
                        }
                    });
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "No existe una conneción guardado de tipo "+tipoSeleccionConnecion+" para la tabla de "+tablaErrorMes+".",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else if(idSeleccionTabla == 2) {
                var existe = arregloConecciones.filter(function(object) {
                                return object.tipo == tipoSeleccionConnecion && object.arreglo == nombreArreglo;
                            });
                if(existe.length > 0) {
                    $("body").overhang({
                        type: "confirm",
                        primary: "#f5a433",
                        accent: "#dc9430",
                        yesColor: "#3498DB",
                        message: 'Esta seguro que desea realizar la Importación?',
                        overlay: true,
                        yesMessage: "Importar",
                        noMessage: "Cancelar",
                        callback: function (value) {
                            if(value){
                                var user = existe[0].usuario;
                                var password = existe[0].constrasena;
                                var server = existe[0].server;
                                var database = existe[0].basedatos;
                                var table = existe[0].tabla;
                                myWorker.postMessage("init");
                                $( ".loadingScreen" ).fadeIn( "slow", function() {
                                });
                                $("#descripcionLoading").text('');
                                if(tipoSeleccionConnecion == 'mssql') {
                                    const transactionCampos = new sql.Transaction( pool1 );
                                    transactionCampos.begin(err => {
                                        var rolledBack = false;
                                        transactionCampos.on('rollback', aborted => {
                                            rolledBack = true;
                                        });
                                        const request = new sql.Request(transactionCampos);
                                        request.query("select * from Depositos_Campos", (err, result) => {
                                            if (err) {
                                                if (!rolledBack) {
                                                    console.log(err)
                                                    transactionCampos.rollback(err => {
                                                        $("body").overhang({
                                                            type: "error",
                                                            primary: "#f84a1d",
                                                            accent: "#d94e2a",
                                                            message: "Error en conneción Depositos_Campos.",
                                                            overlay: true,
                                                            closeConfirm: true
                                                        });
                                                        $(".loadingScreen").hide();
                                                        stopTimer();
                                                    });
                                                }
                                            }  else {
                                                transactionCampos.commit(err => {
                                                    // ... error checks
                                                    var campos = result.recordset.filter(function(object) {
                                                                                    return object.tipo == tipoSeleccionConnecion;
                                                                                });
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
                                                        .query("select * from "+table+" where "+campos[0].fecha+" = '"+formatDateCreation(fechaSeleccionada)+"'", (err, result) => {
                                                            if(err){
                                                                console.log(err)
                                                                $("body").overhang({
                                                                    type: "error",
                                                                    primary: "#f84a1d",
                                                                    accent: "#d94e2a",
                                                                    message: "Intento de conexión fallido depósitos.",
                                                                    overlay: true,
                                                                    closeConfirm: true
                                                                });
                                                                $(".loadingScreen").hide();
                                                                stopTimer();
                                                            } else {
                                                                totalInserciones = result.recordset.length;
                                                                console.log("totalInserciones = "+totalInserciones);
                                                                for (var i = 0; i < result.recordset.length; i++) {
                                                                    let valorArreglo = result.recordset[i];
                                                                    if(result.recordset.length-1 == i) {
                                                                        console.log("contadorInserciones = "+contadorInserciones);
                                                                        $(".loadingScreen").hide();
                                                                        stopTimer();
                                                                    }
                                                                    if($.trim(valorArreglo[campos[0].idCliente]).length < 31) {
                                                                        if($.trim(valorArreglo[campos[0].nombreCliente]).length < 81) {
                                                                            if($.trim(valorArreglo[campos[0].tipoPersona]).length < 81) {
                                                                                if($.trim(valorArreglo[campos[0].tipoSubPersona]).length < 81) {
                                                                                    if($.trim(valorArreglo[campos[0].saldo]).toString().length < 21) {
                                                                                        if($.trim(valorArreglo[campos[0].moneda]).length < 31) {
                                                                                            if( existeMonedaFOSEDE( $.trim(valorArreglo[campos[0].moneda]) ) ) {
                                                                                                if($.trim(valorArreglo[campos[0].tipoCuenta]).length < 101) {
                                                                                                    if(valorArreglo[campos[0].fechaInicio] == undefined || valorArreglo[campos[0].fechaInicio].length == 0 || Date.parse(valorArreglo[campos[0].fechaInicio]) || isValidDateString(valorArreglo[campos[0].fechaInicio])) {
                                                                                                        if(valorArreglo[campos[0].fechaFinal] == undefined || valorArreglo[campos[0].fechaFinal].length == 0 || Date.parse(valorArreglo[campos[0].fechaFinal]) || isValidDateString(valorArreglo[campos[0].fechaFinal])) {
                                                                                                            if($.trim(valorArreglo[campos[0].sucursal]).length < 51) {
                                                                                                                if(Date.parse(valorArreglo[campos[0].fecha]) || isValidDateString(valorArreglo[campos[0].fecha]) ) {
                                                                                                                    //valorArreglo[campos[0].fechaInicio] = new Date(valorArreglo[campos[0].fechaInicio].getUTCFullYear(), valorArreglo[campos[0].fechaInicio].getUTCMonth(), valorArreglo[campos[0].fechaInicio].getUTCDate());
                                                                                                                    //valorArreglo[campos[0].fechaFinal] = new Date(valorArreglo[campos[0].fechaFinal].getUTCFullYear(), valorArreglo[campos[0].fechaFinal].getUTCMonth(), valorArreglo[campos[0].fechaFinal].getUTCDate());
                                                                                                                    //valorArreglo[campos[0].fecha] = new Date(valorArreglo[campos[0].fecha].getUTCFullYear(), valorArreglo[campos[0].fecha].getUTCMonth(), valorArreglo[campos[0].fecha].getUTCDate());
                                                                                                                    if (Object.prototype.toString.call(valorArreglo[campos[0].fecha]) === "[object Date]") {
                                                                                                                        if (!isNaN(valorArreglo[campos[0].fecha].getTime())) {
                                                                                                                            if(valorArreglo[campos[0].fecha] != undefined && valorArreglo[campos[0].fecha].length != 0 ) {
                                                                                                                                valorArreglo[campos[0].fecha] = new Date(valorArreglo[campos[0].fecha].getUTCFullYear(), valorArreglo[campos[0].fecha].getUTCMonth(), valorArreglo[campos[0].fecha].getUTCDate());
                                                                                                                                valorArreglo[campos[0].fecha] = formatDateCreation(valorArreglo[campos[0].fecha]);
                                                                                                                            } else {
                                                                                                                                valorArreglo[campos[0].fecha] = '2001-01-01';
                                                                                                                            }
                                                                                                                        } else {
                                                                                                                            if(valorArreglo[campos[0].fecha] != undefined && valorArreglo[campos[0].fecha].length != 0 ) {
                                                                                                                                valorArreglo[campos[0].fecha] = formatDateCreationString(valorArreglo[campos[0].fecha]);
                                                                                                                            } else {
                                                                                                                                valorArreglo[campos[0].fecha] = '2001-01-01';
                                                                                                                            }
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        if(valorArreglo[campos[0].fecha] != undefined && valorArreglo[campos[0].fecha].length != 0 ) {
                                                                                                                            valorArreglo[campos[0].fecha] = formatDateCreationString(valorArreglo[campos[0].fecha]);
                                                                                                                        } else {
                                                                                                                            valorArreglo[campos[0].fecha] = '2001-01-01';
                                                                                                                        }
                                                                                                                    }

                                                                                                                    if (Object.prototype.toString.call(valorArreglo[campos[0].fechaInicio]) === "[object Date]") {
                                                                                                                        if (!isNaN(valorArreglo[campos[0].fechaInicio].getTime())) {
                                                                                                                            if(valorArreglo[campos[0].fechaInicio] != undefined && valorArreglo[campos[0].fechaInicio].length != 0 ) {
                                                                                                                                valorArreglo[campos[0].fechaInicio] = new Date(valorArreglo[campos[0].fechaInicio].getUTCFullYear(), valorArreglo[campos[0].fechaInicio].getUTCMonth(), valorArreglo[campos[0].fechaInicio].getUTCDate());
                                                                                                                                valorArreglo[campos[0].fechaInicio] = formatDateCreation(valorArreglo[campos[0].fechaInicio]);
                                                                                                                            } else {
                                                                                                                                valorArreglo[campos[0].fechaInicio] = '2001-01-01';
                                                                                                                            }
                                                                                                                        } else {
                                                                                                                            if(valorArreglo[campos[0].fechaInicio] != undefined && valorArreglo[campos[0].fechaInicio].length != 0 ) {
                                                                                                                                valorArreglo[campos[0].fechaInicio] = formatDateCreationString(valorArreglo[campos[0].fechaInicio]);
                                                                                                                            } else {
                                                                                                                                valorArreglo[campos[0].fechaInicio] = '2001-01-01';
                                                                                                                            }
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        if(valorArreglo[campos[0].fechaInicio] != undefined && valorArreglo[campos[0].fechaInicio].length != 0 ) {
                                                                                                                            valorArreglo[campos[0].fechaInicio] = formatDateCreationString(valorArreglo[campos[0].fechaInicio]);
                                                                                                                        } else {
                                                                                                                            valorArreglo[campos[0].fechaInicio] = '2001-01-01';
                                                                                                                        }
                                                                                                                    }

                                                                                                                    if (Object.prototype.toString.call(valorArreglo[campos[0].fechaFinal]) === "[object Date]") {
                                                                                                                        if (!isNaN(valorArreglo[campos[0].fechaFinal].getTime())) {
                                                                                                                            if(valorArreglo[campos[0].fechaFinal] != undefined && valorArreglo[campos[0].fechaFinal].length != 0 ) {
                                                                                                                                valorArreglo[campos[0].fechaFinal] = new Date(valorArreglo[campos[0].fechaFinal].getUTCFullYear(), valorArreglo[campos[0].fechaFinal].getUTCMonth(), valorArreglo[campos[0].fechaFinal].getUTCDate());
                                                                                                                                valorArreglo[campos[0].fechaFinal] = formatDateCreation(valorArreglo[campos[0].fechaFinal]);
                                                                                                                            } else {
                                                                                                                                valorArreglo[campos[0].fechaFinal] = '2001-01-01';
                                                                                                                            }
                                                                                                                        } else {
                                                                                                                            if(valorArreglo[campos[0].fechaFinal] != undefined && valorArreglo[campos[0].fechaFinal].length != 0 ) {
                                                                                                                                valorArreglo[campos[0].fechaFinal] = formatDateCreationString(valorArreglo[campos[0].fechaFinal]);
                                                                                                                            } else {
                                                                                                                                valorArreglo[campos[0].fechaFinal] = '2001-01-01';
                                                                                                                            }
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        if(valorArreglo[campos[0].fechaFinal] != undefined && valorArreglo[campos[0].fechaFinal].length != 0 ) {
                                                                                                                            valorArreglo[campos[0].fechaFinal] = formatDateCreationString(valorArreglo[campos[0].fechaFinal]);
                                                                                                                        } else {
                                                                                                                            valorArreglo[campos[0].fechaFinal] = '2001-01-01';
                                                                                                                        }
                                                                                                                    }
                                                                                                                    const transaction = new sql.Transaction( pool1 );
                                                                                                                    transaction.begin(err => {
                                                                                                                        var rolledBack = false;
                                                                                                                        transaction.on('rollback', aborted => {
                                                                                                                            rolledBack = true;
                                                                                                                        });
                                                                                                                        const request = new sql.Request(transaction);
                                                                                                                        request.query("insert into Depositos (idCliente, numCuenta, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, fechaInicio, fechaFinal, sucursal, fecha) values ('"+$.trim(valorArreglo[campos[0].idCliente])+"',"+$.trim(valorArreglo[campos[0].numCuenta])+",'"+$.trim(valorArreglo[campos[0].nombreCliente].replace(/'/g, ''))+"','"+$.trim(valorArreglo[campos[0].tipoPersona])+"','"+$.trim(valorArreglo[campos[0].tipoSubPersona])+"',"+valorArreglo[campos[0].saldo]+",'"+$.trim(valorArreglo[campos[0].moneda])+"','"+$.trim(valorArreglo[campos[0].tipoCuenta])+"','"+valorArreglo[campos[0].fechaInicio]+"','"+valorArreglo[campos[0].fechaFinal]+"','"+$.trim(valorArreglo[campos[0].sucursal])+"','"+valorArreglo[campos[0].fecha]+"')", (err, result) => {
                                                                                                                            if (err) {
                                                                                                                                console.log(err);
                                                                                                                                if (!rolledBack) {
                                                                                                                                    transaction.rollback(err => {
                                                                                                                                        contadorInserciones++;
                                                                                                                                        arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "Error en inserción mssql"});
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
                                                                                                                } else {
                                                                                                                    arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor de la fecha de importación no es valido"});
                                                                                                                    contadorInserciones++;
                                                                                                                    console.log("err: El valor de la fecha de importación no es valido")
                                                                                                                    console.log(valorArreglo);
                                                                                                                    printErrorFile();
                                                                                                                }
                                                                                                            } else {
                                                                                                                arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor del sucursal es mayor a 50 caracteres"});
                                                                                                                contadorInserciones++;
                                                                                                                console.log("err: El valor del sucursal es mayor a 50 caracteres")
                                                                                                                console.log(valorArreglo);
                                                                                                                printErrorFile();
                                                                                                            }
                                                                                                        } else {
                                                                                                            arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor de fecha final no es valido"});
                                                                                                            contadorInserciones++;
                                                                                                            console.log("err: El valor de fecha final no es valido")
                                                                                                            console.log(valorArreglo);
                                                                                                            printErrorFile();
                                                                                                        }
                                                                                                    } else {
                                                                                                        arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor de fecha de inicio no es valido"});
                                                                                                        contadorInserciones++;
                                                                                                        console.log("err: El valor de fecha de inicio no es valido")
                                                                                                        console.log(valorArreglo);
                                                                                                        printErrorFile();
                                                                                                    }
                                                                                                } else {
                                                                                                    arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor del tipo de cuenta es mayor a 100 caracteres"});
                                                                                                    contadorInserciones++;
                                                                                                    console.log("err: El valor del tipo de cuenta es mayor a 100 caracteres")
                                                                                                    console.log(valorArreglo);
                                                                                                    printErrorFile();
                                                                                                }
                                                                                            } else {
                                                                                                arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor del campo de moneda no existe en valores FOSEDE"});
                                                                                                contadorInserciones++;
                                                                                                console.log("err: El tipo de moneda no existe en FOSEDE")
                                                                                                console.log(valorArreglo);
                                                                                                printErrorFile();
                                                                                            }
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor de la moneda es mayor a 30 caracteres"});
                                                                                            contadorInserciones++;
                                                                                            console.log("err: El valor de la moneda es mayor a 30 caracteres")
                                                                                            console.log(valorArreglo);
                                                                                            printErrorFile();
                                                                                        }
                                                                                    } else {
                                                                                        arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor del saldo es mayor a 20 caracteres"});
                                                                                        contadorInserciones++;
                                                                                        console.log("err: El valor del saldo es mayor a 20 caracteres")
                                                                                        console.log(valorArreglo);
                                                                                        printErrorFile();
                                                                                    }
                                                                                } else {
                                                                                    arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor del tipo de sub-persona es mayor a 80 caracteres"});
                                                                                    contadorInserciones++;
                                                                                    console.log("err: El valor del tipo de sub-persona es mayor a 80 caracteres")
                                                                                    console.log(valorArreglo);
                                                                                    printErrorFile();
                                                                                }
                                                                            } else {
                                                                                arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor del tipo de persona es mayor a 80 caracteres"});
                                                                                contadorInserciones++;
                                                                                console.log("err: El valor del tipo de persona es mayor a 80 caracteres")
                                                                                console.log(valorArreglo);
                                                                                printErrorFile();
                                                                            }
                                                                        } else {
                                                                            arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor del nombre del cliente es mayor a 80 caracteres"});
                                                                            contadorInserciones++;
                                                                            console.log("err: El valor del nombre del cliente es mayor a 80 caracteres")
                                                                            console.log(valorArreglo);
                                                                            printErrorFile();
                                                                        }
                                                                    } else {
                                                                        arregloErroresInsercion.push({b: "Deposito: "+valorArreglo[campos[0].numCuenta], c: "El valor del identificador del cliente es mayor a 30 caracteres"});
                                                                        contadorInserciones++;
                                                                        console.log("err: El valor del identificador del cliente es mayor a 30 caracteres")
                                                                        console.log(valorArreglo);
                                                                        printErrorFile();
                                                                    }
                                                                };
                                                                if(result.recordset.length == 0) {
                                                                    $(".loadingScreen").hide();
                                                                    stopTimer();
                                                                    $("body").overhang({
                                                                        type: "success",
                                                                        primary: "#40D47E",
                                                                        accent: "#27AE60",
                                                                        message: "No se encontrarón valores para esa fecha.",
                                                                        duration: 2,
                                                                        overlay: true
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }); // fin pool connect
                                                });
                                            }
                                        });
                                    }); // fin transaction
                                } //fin mssql
                            }
                        }
                    });
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "No existe una conneción guardado de tipo "+tipoSeleccionConnecion+" para la tabla de "+tablaErrorMes+".",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else if(idSeleccionTabla == 3) {
                var existe = arregloConecciones.filter(function(object) {
                                return object.tipo == tipoSeleccionConnecion && object.arreglo == nombreArreglo;
                            });
                if(existe.length > 0) {
                    $("body").overhang({
                        type: "confirm",
                        primary: "#f5a433",
                        accent: "#dc9430",
                        yesColor: "#3498DB",
                        message: 'Esta seguro que desea realizar la Importación?',
                        overlay: true,
                        yesMessage: "Importar",
                        noMessage: "Cancelar",
                        callback: function (value) {
                            if(value){
                                var user = existe[0].usuario;
                                var password = existe[0].constrasena;
                                var server = existe[0].server;
                                var database = existe[0].basedatos;
                                var table = existe[0].tabla;
                                myWorker.postMessage("init");
                                $( ".loadingScreen" ).fadeIn( "slow", function() {
                                });
                                $("#descripcionLoading").text('');
                                if(tipoSeleccionConnecion == 'mssql') {
                                    const transactionCampos = new sql.Transaction( pool1 );
                                    transactionCampos.begin(err => {
                                        var rolledBack = false;
                                        transactionCampos.on('rollback', aborted => {
                                            rolledBack = true;
                                        });
                                        const request = new sql.Request(transactionCampos);
                                        request.query("select * from Prestamos_Campos", (err, result) => {
                                            if (err) {
                                                if (!rolledBack) {
                                                    transactionCampos.rollback(err => {
                                                        $("body").overhang({
                                                            type: "error",
                                                            primary: "#f84a1d",
                                                            accent: "#d94e2a",
                                                            message: "Error en conneción Prestamos_Campos.",
                                                            overlay: true,
                                                            closeConfirm: true
                                                        });
                                                        $(".loadingScreen").hide();
                                                        stopTimer();
                                                    });
                                                }
                                            }  else {
                                                transactionCampos.commit(err => {
                                                    // ... error checks
                                                    var campos = result.recordset.filter(function(object) {
                                                                                    return object.tipo == tipoSeleccionConnecion;
                                                                                });
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
                                                        .query("select * from "+table+" where "+campos[0].fecha+" = '"+formatDateCreation(fechaSeleccionada)+"'", (err, result) => {
                                                            if(err){
                                                                console.log(err)
                                                                $("body").overhang({
                                                                    type: "error",
                                                                    primary: "#f84a1d",
                                                                    accent: "#d94e2a",
                                                                    message: "Intento de conexión fallido préstamos.",
                                                                    overlay: true,
                                                                    closeConfirm: true
                                                                });
                                                                $(".loadingScreen").hide();
                                                                stopTimer();
                                                            } else {
                                                                totalInserciones = result.recordset.length;
                                                                console.log("totalInserciones = "+totalInserciones);
                                                                for (var i = 0; i < result.recordset.length; i++) {
                                                                    let valorArreglo = result.recordset[i];
                                                                    if(result.recordset.length-1 == i) {
                                                                        console.log("contadorInserciones = "+contadorInserciones);
                                                                        $(".loadingScreen").hide();
                                                                        stopTimer();
                                                                    }
                                                                    /*console.log(valorArreglo)
                                                                    console.log(valorArreglo[campos[0].idCliente])
                                                                    console.log(campos[0].idCLiente)
                                                                    console.log(campos)
                                                                    console.log(valorArreglo[campos[0].nombreCliente])
                                                                    console.log(valorArreglo[campos[0].tipoPersona])
                                                                    console.log(valorArreglo[campos[0].tipoSubPersona])
                                                                    console.log(valorArreglo[campos[0].numPrestamo])
                                                                    console.log(valorArreglo[campos[0].saldo])
                                                                    console.log(valorArreglo[campos[0].moneda])
                                                                    console.log(valorArreglo[campos[0].montoOtorgado])
                                                                    console.log(valorArreglo[campos[0].tipoCuenta])
                                                                    console.log(valorArreglo[campos[0].diasMora])
                                                                    console.log(campos[0].diasMora)
                                                                    console.log(valorArreglo[campos[0].amortizacion])
                                                                    console.log(valorArreglo[campos[0].sobregiro])
                                                                    console.log(valorArreglo[campos[0].contingente])
                                                                    console.log(valorArreglo[campos[0].clasificacionCartera])
                                                                    console.log(valorArreglo[campos[0].tipoCredito])
                                                                    console.log(valorArreglo[campos[0].pago30])
                                                                    console.log(valorArreglo[campos[0].pago60])
                                                                    console.log(valorArreglo[campos[0].pago90])
                                                                    console.log(valorArreglo[campos[0].pago120])
                                                                    console.log(valorArreglo[campos[0].clausulasRestrictivas])
                                                                    console.log(formatDateCreation(new Date()))
                                                                    console.log(valorArreglo[campos[0].sucursal])*/
                                                                    if($.trim(valorArreglo[campos[0].idCliente]).length < 31) {
                                                                        if($.trim(valorArreglo[campos[0].nombreCliente]).length < 81) {
                                                                            if($.trim(valorArreglo[campos[0].tipoPersona]).length < 81) {
                                                                                if($.trim(valorArreglo[campos[0].tipoSubPersona]).length < 81) {
                                                                                    if($.trim(valorArreglo[campos[0].numPrestamo]).toString().length < 51) {
                                                                                        if($.trim(valorArreglo[campos[0].saldo].toString()).length < 21) {
                                                                                            if($.trim(valorArreglo[campos[0].moneda]).length < 31) {
                                                                                                if( existeMonedaFOSEDE( $.trim(valorArreglo[campos[0].moneda]) ) ) {
                                                                                                    if($.trim(valorArreglo[campos[0].montoOtorgado].toString()).length < 21) {
                                                                                                        if($.trim(valorArreglo[campos[0].diasMora].toString()).length < 21) {
                                                                                                            if($.trim(valorArreglo[campos[0].amortizacion].toString()).length < 21) {
                                                                                                                if($.trim(valorArreglo[campos[0].sobregiro].toString()).length < 21) {
                                                                                                                    if($.trim(valorArreglo[campos[0].contingente].toString()).length < 21) {
                                                                                                                        if($.trim(valorArreglo[campos[0].clasificacionCartera]).length < 3) {
                                                                                                                            if($.trim(valorArreglo[campos[0].tipoCredito]).length < 81) {
                                                                                                                                if($.trim(valorArreglo[campos[0].pago30].toString()).length < 21) {
                                                                                                                                    if($.trim(valorArreglo[campos[0].pago60].toString()).length < 21) {
                                                                                                                                        if($.trim(valorArreglo[campos[0].pago90].toString()).length < 21) {
                                                                                                                                            if($.trim(valorArreglo[campos[0].pago120].toString()).length < 21) {
                                                                                                                                                if(valorArreglo[campos[0].clausulasRestrictivas] != undefined) {
                                                                                                                                                    if(valorArreglo[campos[0].esFinanciacionGarantizada] != undefined) {
                                                                                                                                                        if($.trim(valorArreglo[campos[0].valorFinanciacion].toString()).length < 21) {
                                                                                                                                                            if($.trim(valorArreglo[campos[0].alac].toString()).length < 30) {
                                                                                                                                                                if( !isNaN(valorArreglo[campos[0].factor]) ) {
                                                                                                                                                                    if(valorArreglo[campos[0].fechaInicio] == undefined || valorArreglo[campos[0].fechaInicio].length == 0 || Date.parse(valorArreglo[campos[0].fechaInicio]) || isValidDateString(valorArreglo[campos[0].fecha])) {
                                                                                                                                                                        if(valorArreglo[campos[0].fechaFinal] == undefined || valorArreglo[campos[0].fechaFinal].length == 0 || Date.parse(valorArreglo[campos[0].fechaFinal]) || isValidDateString(valorArreglo[campos[0].fecha])) {
                                                                                                                                                                            if($.trim(valorArreglo[campos[0].sucursal]).length < 51) {
                                                                                                                                                                                if(Date.parse(valorArreglo[campos[0].fecha]) || isValidDateString(valorArreglo[campos[0].fecha])) {
                                                                                                                                                                                    //valorArreglo[campos[0].fecha] = new Date(valorArreglo[campos[0].fecha].getUTCFullYear(), valorArreglo[campos[0].fecha].getUTCMonth(), valorArreglo[campos[0].fecha].getUTCDate());
                                                                                                                                                                                    //valorArreglo[campos[0].fechaInicio] = new Date(valorArreglo[campos[0].fechaInicio].getUTCFullYear(), valorArreglo[campos[0].fechaInicio].getUTCMonth(), valorArreglo[campos[0].fechaInicio].getUTCDate());
                                                                                                                                                                                    //valorArreglo[campos[0].fechaFinal] = new Date(valorArreglo[campos[0].fechaFinal].getUTCFullYear(), valorArreglo[campos[0].fechaFinal].getUTCMonth(), valorArreglo[campos[0].fechaFinal].getUTCDate());
                                                                                                                                                                                    if (Object.prototype.toString.call(valorArreglo[campos[0].fecha]) === "[object Date]") {
                                                                                                                                                                                        if (!isNaN(valorArreglo[campos[0].fecha].getTime())) {
                                                                                                                                                                                            if(valorArreglo[campos[0].fecha] != undefined && valorArreglo[campos[0].fecha].length != 0 ) {
                                                                                                                                                                                                valorArreglo[campos[0].fecha] = new Date(valorArreglo[campos[0].fecha].getUTCFullYear(), valorArreglo[campos[0].fecha].getUTCMonth(), valorArreglo[campos[0].fecha].getUTCDate());
                                                                                                                                                                                                valorArreglo[campos[0].fecha] = formatDateCreation(valorArreglo[campos[0].fecha]);
                                                                                                                                                                                            } else {
                                                                                                                                                                                                valorArreglo[campos[0].fecha] = '2001-01-01';
                                                                                                                                                                                            }
                                                                                                                                                                                        } else {
                                                                                                                                                                                            if(valorArreglo[campos[0].fecha] != undefined && valorArreglo[campos[0].fecha].length != 0 ) {
                                                                                                                                                                                                valorArreglo[campos[0].fecha] = formatDateCreationString(valorArreglo[campos[0].fecha]);
                                                                                                                                                                                            } else {
                                                                                                                                                                                                valorArreglo[campos[0].fecha] = '2001-01-01';
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    } else {
                                                                                                                                                                                        if(valorArreglo[campos[0].fecha] != undefined && valorArreglo[campos[0].fecha].length != 0 ) {
                                                                                                                                                                                            valorArreglo[campos[0].fecha] = formatDateCreationString(valorArreglo[campos[0].fecha]);
                                                                                                                                                                                        } else {
                                                                                                                                                                                            valorArreglo[campos[0].fecha] = '2001-01-01';
                                                                                                                                                                                        }
                                                                                                                                                                                    }

                                                                                                                                                                                    if (Object.prototype.toString.call(valorArreglo[campos[0].fechaInicio]) === "[object Date]") {
                                                                                                                                                                                        if (!isNaN(valorArreglo[campos[0].fechaInicio].getTime())) {
                                                                                                                                                                                            if(valorArreglo[campos[0].fechaInicio] != undefined && valorArreglo[campos[0].fechaInicio].length != 0 ) {
                                                                                                                                                                                                valorArreglo[campos[0].fechaInicio] = new Date(valorArreglo[campos[0].fechaInicio].getUTCFullYear(), valorArreglo[campos[0].fechaInicio].getUTCMonth(), valorArreglo[campos[0].fechaInicio].getUTCDate());
                                                                                                                                                                                                valorArreglo[campos[0].fechaInicio] = formatDateCreation(valorArreglo[campos[0].fechaInicio]);
                                                                                                                                                                                            } else {
                                                                                                                                                                                                valorArreglo[campos[0].fechaInicio] = '2001-01-01';
                                                                                                                                                                                            }
                                                                                                                                                                                        } else {
                                                                                                                                                                                            if(valorArreglo[campos[0].fechaInicio] != undefined && valorArreglo[campos[0].fechaInicio].length != 0 ) {
                                                                                                                                                                                                valorArreglo[campos[0].fechaInicio] = formatDateCreationString(valorArreglo[campos[0].fechaInicio]);
                                                                                                                                                                                            } else {
                                                                                                                                                                                                valorArreglo[campos[0].fechaInicio] = '2001-01-01';
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    } else {
                                                                                                                                                                                        if(valorArreglo[campos[0].fechaInicio] != undefined && valorArreglo[campos[0].fechaInicio].length != 0 ) {
                                                                                                                                                                                            valorArreglo[campos[0].fechaInicio] = formatDateCreationString(valorArreglo[campos[0].fechaInicio]);
                                                                                                                                                                                        } else {
                                                                                                                                                                                            valorArreglo[campos[0].fechaInicio] = '2001-01-01';
                                                                                                                                                                                        }
                                                                                                                                                                                    }

                                                                                                                                                                                    if (Object.prototype.toString.call(valorArreglo[campos[0].fechaFinal]) === "[object Date]") {
                                                                                                                                                                                        if (!isNaN(valorArreglo[campos[0].fechaFinal].getTime())) {
                                                                                                                                                                                            if(valorArreglo[campos[0].fechaFinal] != undefined && valorArreglo[campos[0].fechaFinal].length != 0 ) {
                                                                                                                                                                                                valorArreglo[campos[0].fechaFinal] = new Date(valorArreglo[campos[0].fechaFinal].getUTCFullYear(), valorArreglo[campos[0].fechaFinal].getUTCMonth(), valorArreglo[campos[0].fechaFinal].getUTCDate());
                                                                                                                                                                                                valorArreglo[campos[0].fechaFinal] = formatDateCreation(valorArreglo[campos[0].fechaFinal]);
                                                                                                                                                                                            } else {
                                                                                                                                                                                                valorArreglo[campos[0].fechaFinal] = '2001-01-01';
                                                                                                                                                                                            }
                                                                                                                                                                                        } else {
                                                                                                                                                                                            if(valorArreglo[campos[0].fechaFinal] != undefined && valorArreglo[campos[0].fechaFinal].length != 0 ) {
                                                                                                                                                                                                valorArreglo[campos[0].fechaFinal] = formatDateCreationString(valorArreglo[campos[0].fechaFinal]);
                                                                                                                                                                                            } else {
                                                                                                                                                                                                valorArreglo[campos[0].fechaFinal] = '2001-01-01';
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    } else {
                                                                                                                                                                                        if(valorArreglo[campos[0].fechaFinal] != undefined && valorArreglo[campos[0].fechaFinal].length != 0 ) {
                                                                                                                                                                                            valorArreglo[campos[0].fechaFinal] = formatDateCreationString(valorArreglo[campos[0].fechaFinal]);
                                                                                                                                                                                        } else {
                                                                                                                                                                                            valorArreglo[campos[0].fechaFinal] = '2001-01-01';
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                    const transaction = new sql.Transaction( pool1 );
                                                                                                                                                                                    transaction.begin(err => {
                                                                                                                                                                                        var rolledBack = false;
                                                                                                                                                                                        transaction.on('rollback', aborted => {
                                                                                                                                                                                            rolledBack = true;
                                                                                                                                                                                        });
                                                                                                                                                                                        const request = new sql.Request(transaction);
                                                                                                                                                                                        request.query("insert into Prestamos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, clausulasRestrictivas, esFinanciacionGarantizada, valorFinanciacion, alac, factor, fechaInicio, fechaFinal, sucursal, fecha) values ('"+$.trim(valorArreglo[campos[0].idCliente])+"','"+$.trim(valorArreglo[campos[0].nombreCliente].replace(/'/g, ''))+"','"+$.trim(valorArreglo[campos[0].tipoPersona])+"','"+$.trim(valorArreglo[campos[0].tipoSubPersona])+"',"+$.trim(valorArreglo[campos[0].numPrestamo])+","+valorArreglo[campos[0].saldo]+",'"+$.trim(valorArreglo[campos[0].moneda])+"',"+valorArreglo[campos[0].montoOtorgado]+","+valorArreglo[campos[0].diasMora]+","+valorArreglo[campos[0].amortizacion]+","+valorArreglo[campos[0].sobregiro]+","+valorArreglo[campos[0].contingente]+",'"+$.trim(valorArreglo[campos[0].clasificacionCartera])+"','"+$.trim(valorArreglo[campos[0].tipoCredito])+"',"+valorArreglo[campos[0].pago30]+","+valorArreglo[campos[0].pago60]+","+valorArreglo[campos[0].pago90]+","+valorArreglo[campos[0].pago120]+",'"+valorArreglo[campos[0].clausulasRestrictivas]+"','"+valorArreglo[campos[0].esFinanciacionGarantizada]+"',"+valorArreglo[campos[0].valorFinanciacion]+",'"+$.trim(valorArreglo[campos[0].alac])+"',"+valorArreglo[campos[0].factor]+",'"+valorArreglo[campos[0].fechaInicio]+"','"+valorArreglo[campos[0].fechaFinal]+"','"+$.trim(valorArreglo[campos[0].sucursal])+"','"+valorArreglo[campos[0].fecha]+"')", (err, result) => {
                                                                                                                                                                                            if (err) {
                                                                                                                                                                                                if (!rolledBack) {
                                                                                                                                                                                                    console.log(err);
                                                                                                                                                                                                    transaction.rollback(err => {
                                                                                                                                                                                                        contadorInserciones++;
                                                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "Error en inserción mssql"});
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
                                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de sucursal es mayor a 50 caracteres"});
                                                                                                                                                                                    contadorInserciones++;
                                                                                                                                                                                    console.log("Err: El valor de sucursal es mayor a 50 caracteres")
                                                                                                                                                                                    console.log(valorArreglo);
                                                                                                                                                                                    printErrorFile();
                                                                                                                                                                                }
                                                                                                                                                                            } else {
                                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de sucursal es mayor a 50 caracteres"});
                                                                                                                                                                                contadorInserciones++;
                                                                                                                                                                                console.log("Err: El valor de sucursal es mayor a 50 caracteres")
                                                                                                                                                                                console.log(valorArreglo);
                                                                                                                                                                                printErrorFile();
                                                                                                                                                                            }
                                                                                                                                                                        } else {
                                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "La fecha final no es valida"});
                                                                                                                                                                            contadorInserciones++;
                                                                                                                                                                            console.log("Err: La fecha final no es valida")
                                                                                                                                                                            console.log(valorArreglo);
                                                                                                                                                                            printErrorFile();
                                                                                                                                                                        }
                                                                                                                                                                    } else {
                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "La fecha inicial no es valida"});
                                                                                                                                                                        contadorInserciones++;
                                                                                                                                                                        console.log("Err: La fecha inicial no es valida")
                                                                                                                                                                        console.log(valorArreglo);
                                                                                                                                                                        printErrorFile();
                                                                                                                                                                    }
                                                                                                                                                                } else {
                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor del factor no es valido"});
                                                                                                                                                                    contadorInserciones++;
                                                                                                                                                                    console.log("Err: El valor del factor no es valido")
                                                                                                                                                                    console.log(valorArreglo);
                                                                                                                                                                    printErrorFile();
                                                                                                                                                                }
                                                                                                                                                            } else {
                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor del alac no es valido"});
                                                                                                                                                                contadorInserciones++;
                                                                                                                                                                console.log("Err: El valor del alac no es valido")
                                                                                                                                                                console.log(valorArreglo);
                                                                                                                                                                printErrorFile();
                                                                                                                                                            }
                                                                                                                                                        } else {
                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor la financiación no es valido"});
                                                                                                                                                            contadorInserciones++;
                                                                                                                                                            console.log("Err: El valor la financiación no es valido")
                                                                                                                                                            console.log(valorArreglo);
                                                                                                                                                            printErrorFile();
                                                                                                                                                        }
                                                                                                                                                    } else {
                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de clausulas restrictivas no es valido"});
                                                                                                                                                        contadorInserciones++;
                                                                                                                                                        console.log("Err: El valor de clausulas restrictivas no es valido")
                                                                                                                                                        console.log(valorArreglo);
                                                                                                                                                        printErrorFile();
                                                                                                                                                    }
                                                                                                                                                } else {
                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de clausulas restrictivas tiene que ser mayor a 0 caracteres"});
                                                                                                                                                    contadorInserciones++;
                                                                                                                                                    console.log("Err: El valor de clausulas restrictivas tiene que ser mayor a 0 caracteres")
                                                                                                                                                    console.log(valorArreglo);
                                                                                                                                                    printErrorFile();
                                                                                                                                                }
                                                                                                                                            } else {
                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de pago en 120 días es mayor a 20 caracteres"});
                                                                                                                                                contadorInserciones++;
                                                                                                                                                console.log("Err: El valor de pago en 120 días es mayor a 20 caracteres")
                                                                                                                                                console.log(valorArreglo);
                                                                                                                                                printErrorFile();
                                                                                                                                            }
                                                                                                                                        } else {
                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de pago en 90 días es mayor a 20 caracteres"});
                                                                                                                                            contadorInserciones++;
                                                                                                                                            console.log("Err: El valor de pago en 90 días es mayor a 20 caracteres")
                                                                                                                                            console.log(valorArreglo);
                                                                                                                                            printErrorFile();
                                                                                                                                        }
                                                                                                                                    } else {
                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de pago en 60 días es mayor a 20 caracteres"});
                                                                                                                                        contadorInserciones++;
                                                                                                                                        console.log("Err: El valor de pago en 60 días es mayor a 20 caracteres")
                                                                                                                                        console.log(valorArreglo);
                                                                                                                                        printErrorFile();
                                                                                                                                    }
                                                                                                                                } else {
                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de pago en 30 días es mayor a 20 caracteres"});
                                                                                                                                    contadorInserciones++;
                                                                                                                                    console.log("Err: El valor de pago en 30 días es mayor a 20 caracteres")
                                                                                                                                    console.log(valorArreglo);
                                                                                                                                    printErrorFile();
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de tipo de crédito es mayor a 80 caracteres"});
                                                                                                                                contadorInserciones++;
                                                                                                                                console.log("Err: El valor de tipo de crédito es mayor a 80 caracteres")
                                                                                                                                console.log(valorArreglo);
                                                                                                                                printErrorFile();
                                                                                                                            }
                                                                                                                        } else {
                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de clasificación de cartera es mayor a 2 caracteres"});
                                                                                                                            contadorInserciones++;
                                                                                                                            console.log("Err: El valor de clasificación de cartera es mayor a 2 caracteres")
                                                                                                                            console.log(valorArreglo);
                                                                                                                            printErrorFile();
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de contingente es mayor a 20 caracteres"});
                                                                                                                        contadorInserciones++;
                                                                                                                        console.log("Err: El valor de contingente es mayor a 20 caracteres")
                                                                                                                        console.log(valorArreglo);
                                                                                                                        printErrorFile();
                                                                                                                    }
                                                                                                                } else {
                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de sobregiro es mayor a 20 caracteres"});
                                                                                                                    contadorInserciones++;
                                                                                                                    console.log("Err: El valor de sobregiro es mayor a 20 caracteres")
                                                                                                                    console.log(valorArreglo);
                                                                                                                    printErrorFile();
                                                                                                                }
                                                                                                            } else {
                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de amortización es mayor a 20 caracteres"});
                                                                                                                contadorInserciones++;
                                                                                                                console.log("Err: El valor de amortización es mayor a 20 caracteres")
                                                                                                                console.log(valorArreglo);
                                                                                                                printErrorFile();
                                                                                                            }
                                                                                                        } else {
                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de días de mora es mayor a 20 caracteres"});
                                                                                                            contadorInserciones++;
                                                                                                            console.log("Err: El valor de días de mora es mayor a 20 caracteres")
                                                                                                            console.log(valorArreglo);
                                                                                                            printErrorFile();
                                                                                                        }
                                                                                                    } else {
                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de monto otorgado es mayor a 20 caracteres"});
                                                                                                        contadorInserciones++;
                                                                                                        console.log("Err: El valor de monto otorgado es mayor a 20 caracteres")
                                                                                                        console.log(valorArreglo);
                                                                                                        printErrorFile();
                                                                                                    }
                                                                                                } else {
                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor del campo de moneda no existe en valores FOSEDE"});
                                                                                                    contadorInserciones++;
                                                                                                    console.log("err: El tipo de moneda no existe en FOSEDE")
                                                                                                    console.log(valorArreglo);
                                                                                                    printErrorFile();
                                                                                                }
                                                                                            } else {
                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de moneda es mayor a 30 caracteres"});
                                                                                                contadorInserciones++;
                                                                                                console.log("Err: El valor de moneda es mayor a 30 caracteres")
                                                                                                console.log(valorArreglo);
                                                                                                printErrorFile();
                                                                                            }
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de saldo es mayor a 20 caracteres"});
                                                                                            contadorInserciones++;
                                                                                            console.log("Err: El valor de saldo es mayor a 20 caracteres")
                                                                                            console.log(valorArreglo);
                                                                                            printErrorFile();
                                                                                        }
                                                                                    } else {
                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de número de préstamo es mayor a 50 caracteres"});
                                                                                        contadorInserciones++;
                                                                                        console.log("Err: El valor de número de préstamo es mayor a 50 caracteres")
                                                                                        console.log(valorArreglo);
                                                                                        printErrorFile();
                                                                                    }
                                                                                } else {
                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de tipo de sub-persona es mayor a 80 caracteres"});
                                                                                    contadorInserciones++;
                                                                                    console.log("Err: El valor de tipo de sub-persona es mayor a 80 caracteres")
                                                                                    console.log(valorArreglo);
                                                                                    printErrorFile();
                                                                                }
                                                                            } else {
                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de tipo de persona es mayor a 80 caracteres"});
                                                                                contadorInserciones++;
                                                                                console.log("Err: El valor de tipo de persona es mayor a 80 caracteres")
                                                                                console.log(valorArreglo);
                                                                                printErrorFile();
                                                                            }
                                                                        } else {
                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de nombre del cliente es mayor a 80 caracteres"});
                                                                            contadorInserciones++;
                                                                            console.log("Err: El valor de nombre del cliente es mayor a 80 caracteres")
                                                                            console.log(valorArreglo);
                                                                            printErrorFile();
                                                                        }
                                                                    } else {
                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de identificador del cliente es mayor a 30 caracteres"});
                                                                        contadorInserciones++;
                                                                        console.log("Err: El valor de identificador del cliente es mayor a 30 caracteres")
                                                                        console.log(valorArreglo);
                                                                        printErrorFile();
                                                                    }
                                                                };
                                                                if(result.recordset.length == 0) {
                                                                    $(".loadingScreen").hide();
                                                                    stopTimer();
                                                                    $("body").overhang({
                                                                        type: "success",
                                                                        primary: "#40D47E",
                                                                        accent: "#27AE60",
                                                                        message: "No se encontrarón valores para esa fecha.",
                                                                        duration: 2,
                                                                        overlay: true
                                                                    });
                                                                }
                                                                /*$("body").overhang({
                                                                    type: "success",
                                                                    primary: "#40D47E",
                                                                    accent: "#27AE60",
                                                                    message: "Conexión realizada con éxito.",
                                                                    overlay: true
                                                                });*/
                                                            }
                                                        });
                                                    }); // fin pool connect
                                                });
                                            }
                                        });
                                    }); // fin transaction
                                } //fin mssql
                            }
                        }
                    });
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "No existe una conneción guardada de tipo "+tipoSeleccionConnecion+" para la tabla de "+tablaErrorMes+".",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            }
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Seleccione una fecha valida.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function isValidDateString (date) {
    if(date.includes("-"))
        partes = date.split("-");
    else if(date.includes("/"))
        partes = date.split("/");
    if(partes[0].length == 4) {
        if(partes[1].length <= 2) {
            if(partes[2].length <= 2) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function formatDateCreation(date) {
    //formato si es STRING
    //aaaa/mm/dd
    //aaaa-mm-dd
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
    /*console.log(monthIndex.toString().length);
    console.log(monthIndex);
    if(monthIndex.toString().length == 1)
        monthIndex='0'+monthIndex;
    if(day.toString().length == 1)
        day='0'+day;
    console.log(year + '-' + monthIndex + '-' + day);*/
    return year + '-' + monthIndex + '-' + day;
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

function printErrorFile () {
    console.log("totalInserciones = "+totalInserciones + "\t\tcontadorInserciones = "+contadorInserciones);
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
                        rgb: "e3f2fd"
                    },
                    fgColor: {
                        rgb: "e3f2fd"
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
                        rgb: "e3f2fd"
                    },
                    fgColor: {
                        rgb: "e3f2fd"
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
        workbook.Sheets.Errores["!cols"].push({ wpx: 450 });
        if(arregloErroresExcel.length > 0 || arregloErroresInsercion.length > 0) {
            var wbout = XLSX.write(workbook, {bookType:'xlsx', bookSST:false, type: 'binary'});
            XLSX.writeFile(workbook, "ErroresImportacionExcel.xlsx");
            var content = '<div class="row" id="wrapper"> Archivo de error de importaciones creado en directorio del ejecutable del programa. </div>';
            var type = 'error';
            $(".loadingScreen").hide();
            $(".dots").text("");
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Archivo de error de importaciones creado en directorio del ejecutable del programa.",
                overlay: true,
                closeConfirm: true
            });
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
        } else if(insertoEnDBListas) {
            $(".loadingScreen").hide();
            stopTimer();
            $("body").overhang({
                type: "success",
                primary: "#40D47E",
                accent: "#27AE60",
                message: "Importación con éxito.",
                duration: 2,
                overlay: true
            });
        }
    }
}

function UpperCasefirst(string) {
    if(string.length>0)
        return string.charAt(0).toUpperCase() + string.slice(1);
    else
        return;
}
//	**********		Fin Activos Conexion		**********

















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

myWorker.onmessage = function(e) {
    $("#descripcionLoading").text(contadorInserciones+" / "+totalInserciones);
    if($(".dots").text().length<3) {
        $(".dots").text($(".dots").text()+".");
    } else {
        $(".dots").text("");
        $(".dots").text($(".dots").text()+".");
    }
}

function stopTimer() {
    $(".dots").text("");
    clearTimeout(myInterval);
    myWorker.terminate();
}

//  **********      Fin interval      **********




















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
    $("#app_full").empty();
    session.defaultSession.clearStorageData([], (data) => {});
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