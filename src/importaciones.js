const electron = require('electron');
const path = require('path');
const remote = require('electron').remote;
const sql = require('mssql');
const XLSX = require('xlsx-style');

const config = {
    user: 'SA',
    password: 'password111!',
    server: 'localhost',
    database: 'RCL_Dev',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

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
        loadVariablesIMG();
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
                    		$("#fullLogo").css("height","3.3em");
                    		/*$("#fullLogo").css("display","block");
                    		$("#fullLogo").css("margin-left","auto");
                    		$("#fullLogo").css("margin-right","auto");*/
                    	} else
                    		filepathFullLogo = '';
                    	if(result.recordset[0].smallLogo.length > 0){
                    		filepathSmallLogo = result.recordset[0].smallLogo;
                    		$("#smallLogo").attr("src",filepathSmallLogo);
                    		$("#smallLogo").css("height","3.4em");
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
                    //renderSelectConnections();
                });
            }
        });
    }); // fin transaction
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
    } else if($.trim($("#activosUserDB").val()).length == 0 && $("ul#myTabActivos li.active").value == 1) {
        entrar = false;
        campo = 'usuario de la base de datos';
    } else if($.trim($("#activosPasswordDB").val()).length == 0 && $("ul#myTabActivos li.active").value == 1) {
        entrar = false;
        campo = 'contraseña de la base de datos';
    } else if($.trim($("#activosServerDB").val()).length == 0 && $("ul#myTabActivos li.active").value == 1) {
        entrar = false;
        campo = 'servidor de la base de datos';
    } else if($.trim($("#activosDataBaseDB").val()).length == 0 && $("ul#myTabActivos li.active").value == 1) {
        entrar = false;
        campo = 'nombre de la base de datos';
    } else if($.trim($("#activosTableDB").val()).length == 0 && $("ul#myTabActivos li.active").value == 1) {
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
            var cuenta = $.trim($("#cuentaConexionActivos").val());
            var nombre = $.trim($("#nombreConexionActivos").val());
            var saldo = $.trim($("#saldoConexionActivos").val());
            var moneda = $.trim($("#monedaConexionActivos").val());
            var sucursal = $.trim($("#sucursalConexionActivos").val());
            var nombreHoja = $.trim($("#activosTableExcel").val());
            var filaInicial = $.trim($("#activosExcelInicio").val());
            var filaFinal = $.trim($("#activosExcelFinal").val());
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
                                                            if(file.length > 0) {
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
                                                                    filaInicial = parseInt(filaInicial);
                                                                    filaFinal = parseInt(filaFinal);
                                                                    if(filaFinal != 0) {
                                                                        for (var i = filaInicial; i <= filaFinal; i++) {
                                                                            if(sheet[cuenta+i] != undefined && sheet[cuenta+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[saldo+i] != undefined && sheet[saldo+i].v.toString().length > 0 && sheet[moneda+i] != undefined && sheet[moneda+i].v.toString().length > 0 && sheet[sucursal+i] != undefined && sheet[sucursal+i].v.toString().length > 0) {
                                                                                var activoCuenta = sheet[cuenta+i].v;
                                                                                var activoNombre = sheet[nombre+i].v;
                                                                                var activoSaldo = sheet[saldo+i].v;
                                                                                var activoMoneda = sheet[moneda+i].v;
                                                                                var activoSucursal = sheet[sucursal+i].v;
                                                                                activoCuenta = activoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoNombre = activoNombre.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoMoneda = activoMoneda.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoSucursal = activoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoNombre = activoNombre.toLowerCase();
                                                                                activoNombre = UpperCasefirst(activoNombre);
                                                                                activoMoneda = activoMoneda.toLowerCase();
                                                                                activoMoneda = UpperCasefirst(activoMoneda);
                                                                                arregloDeActivos.push({cuenta: activoCuenta, nombre: activoNombre, saldo: activoSaldo, moneda: activoMoneda, sucursal: activoSucursal});
                                                                                totalInserciones++;
                                                                            } else if(sheet[cuenta+i] != undefined || sheet[nombre+i] != undefined|| sheet[saldo+i] != undefined || sheet[moneda+i] != undefined|| sheet[sucursal+i] != undefined)
                                                                                arregloErroresExcel.push(i);
                                                                        };
                                                                    } else {
                                                                        var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
                                                                        finalRow = parseInt(finalRow);
                                                                        for (var i = filaInicial; i <= finalRow; i++) {
                                                                            if(sheet[cuenta+i] != undefined && sheet[cuenta+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[saldo+i] != undefined && sheet[saldo+i].v.toString().length > 0 && sheet[moneda+i] != undefined && sheet[moneda+i].v.toString().length > 0 && sheet[sucursal+i] != undefined && sheet[sucursal+i].v.toString().length > 0) {
                                                                                var activoCuenta = sheet[cuenta+i].v;
                                                                                var activoNombre = sheet[nombre+i].v;
                                                                                var activoSaldo = sheet[saldo+i].v;
                                                                                var activoMoneda = sheet[moneda+i].v;
                                                                                var activoSucursal = sheet[sucursal+i].v;
                                                                                activoCuenta = activoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoNombre = activoNombre.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoSucursal = activoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoNombre = activoNombre.toLowerCase();
                                                                                activoNombre = UpperCasefirst(activoNombre);
                                                                                activoMoneda = activoMoneda.toLowerCase();
                                                                                activoMoneda = UpperCasefirst(activoMoneda);
                                                                                arregloDeActivos.push({cuenta: activoCuenta, nombre: activoNombre, saldo: activoSaldo, moneda: activoMoneda, sucursal: activoSucursal});
                                                                                totalInserciones++;
                                                                            } else if(sheet[cuenta+i] != undefined || sheet[nombre+i] != undefined|| sheet[saldo+i] != undefined || sheet[moneda+i] != undefined|| sheet[sucursal+i] != undefined)
                                                                                arregloErroresExcel.push(i);
                                                                        };
                                                                    }
                                                                    for (var i = 0; i < arregloDeActivos.length; i++) {
                                                                        if(arregloDeActivos[i].cuenta.length < 31) {
                                                                            if(arregloDeActivos[i].nombre.length < 120) {
                                                                                if(arregloDeActivos[i].saldo.toString().length < 20) {
                                                                                    if(arregloDeActivos[i].moneda.length < 30) {
                                                                                        if(arregloDeActivos[i].sucursal.length < 50) {
                                                                                            createAsset( arregloDeActivos[i] );
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "El valor de sucursal es mayor a 50 caracteres"});
                                                                                        }
                                                                                    } else {
                                                                                        arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "El valor de la moneda es mayor a 30 caracteres"});
                                                                                    }
                                                                                } else {
                                                                                    arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "El valor del saldo es mayor a 20 caracteres"});
                                                                                }
                                                                            } else {
                                                                                arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "El valor es mayor a 120 caracteres"});
                                                                            }
                                                                        } else {
                                                                            arregloErroresInsercion.push({b: "Activo: "+arregloDeActivos[i].cuenta, c: "El valor de la cuenta es mayor a 30 caracteres"});
                                                                        }
                                                                    };
                                                                    /*$("body").overhang({
                                                                        type: "success",
                                                                        primary: "#40D47E",
                                                                        accent: "#27AE60",
                                                                        message: "Activos importados con éxito.",
                                                                        duration: 2,
                                                                        overlay: true
                                                                    });*/
                                                                } else {
                                                                    $("body").overhang({
                                                                        type: "error",
                                                                        primary: "#f84a1d",
                                                                        accent: "#d94e2a",
                                                                        message: "Error al abrir hoja de excel.",
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
                                                                message: "Ingrese un valor para la fila inicial de la hoja de excel.",
                                                                overlay: true,
                                                                closeConfirm: true
                                                            });
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
        request.query("insert into Activos (cuenta, nombre, saldo, moneda, sucursal, fecha) values ('"+activo.cuenta+"','"+activo.nombre+"',"+activo.saldo+",'"+activo.moneda+"','"+activo.sucursal+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
                                                $("body").overhang({
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
                                                });
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
                                            $("body").overhang({
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
                                            });
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
        if(cuenta.length > 0) {
            if(nombre.length > 0) {
                if(saldo.length > 0) {
                    if(moneda.length > 0) {
                        if(sucursal.length > 0) {
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
                                            var valorArreglo = result.recordset[i];
                                            const transaction = new sql.Transaction( pool1 );
                                            transaction.begin(err => {
                                                var rolledBack = false;
                                                transaction.on('rollback', aborted => {
                                                    rolledBack = true;
                                                });
                                                const request = new sql.Request(transaction);
                                                request.query("insert into Activos (cuenta, nombre, saldo, moneda, sucursal, fecha) values ('"+valorArreglo[cuenta]+"','"+valorArreglo[nombre]+"',"+valorArreglo[saldo]+",'"+valorArreglo[moneda]+"','"+valorArreglo[sucursal]+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
                                        };
                                    }
                                });
                            }); // fin transaction2
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
        var idcliente = $.trim($("#cuentaConexionActivos").val());
        var nombrecliente = $.trim($("#nombreConexionActivos").val());
        var tipoPersona = $.trim($("#tipoPersonaClienteConexionDepositos").val());
        var tipoSubPersona = $.trim($("#tipoSubPersonaClienteConexionDepositos").val());
        var saldo = $.trim($("#saldoConexionActivos").val());
        var moneda = $.trim($("#monedaConexionDepositos").val());
        var tipoCuenta = $.trim($("#tipoCuentaConexionDepositos").val());
        var plazoResidual = $.trim($("#plazoResidualConexionDepositos").val());
        var sucursal = $.trim($("#sucursalConexionActivos").val());
        if(idcliente.length > 0) {
            if(nombrecliente.length > 0) {
                if(tipoPersona.length > 0) {
                    if(tipoSubPersona.length > 0) {
                        if(saldo.length > 0) {
                            if(moneda.length > 0) {
                                if(tipoCuenta.length > 0) {
                                    if(plazoResidual.length > 0) {
                                        if(sucursal.length > 0) {
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
                                                            var valorDepositos = result.recordset[i];
                                                            if(valorDepositos[idcliente].length < 31) {
                                                                if(valorDepositos[nombreCliente].length < 81) {
                                                                    if(valorDepositos[tipoPersona].length < 81) {
                                                                        if(valorDepositos[tipoSubPersona].length < 81) {
                                                                            if(valorDepositos[saldo].length < 21) {
                                                                                if(valorDepositos[moneda].length < 31) {
                                                                                    if(valorDepositos[tipoCuenta].length < 101) {
                                                                                        if(!isNaN(valorDepositos[plazoResidual])) {
                                                                                            if(valorDepositos[sucursal].length < 51) {
                                                                                                const transaction = new sql.Transaction( pool1 );
                                                                                                transaction.begin(err => {
                                                                                                    var rolledBack = false;
                                                                                                    transaction.on('rollback', aborted => {
                                                                                                        rolledBack = true;
                                                                                                    });
                                                                                                    const request = new sql.Request(transaction);
                                                                                                    request.query("insert into Depositos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, plazoResidual, sucursal, fecha) values ('"+valorDepositos[idcliente]+"','"+valorDepositos[nombrecliente]+"','"+valorDepositos[tipoPersona]+"','"+valorDepositos[tipoSubPersona]+"',"+valorDepositos[saldo]+",'"+valorDepositos[moneda]+"','"+valorDepositos[tipoCuenta]+"',"+valorDepositos[plazoResidual]+",'"+valorDepositos[sucursal]+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
                                                                                            } else {
                                                                                                arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "El valor del sucursal es mayor a 50 caracteres"});
                                                                                            }
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Deposito de: "+valorDepositos[idcliente], c: "Ingrese un número valido para el plazo residual"});
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
                                            message: "Ingrese un valor para el plazo residual.",
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
        var tipoCuenta = $.trim($("#tipoCuentaConexionPrestamos").val());
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
        var fechaInicio = $.trim($("#fechaInicioConexionPrestamos").val());
        var fechaFinal = $.trim($("#fechaExpiracionConexionPrestamos").val());
        var montoOtorgado = $.trim($("#montoOtorgadoConexionPrestamos").val());
        var sucursal = $.trim($("#sucursalConexionPrestamos").val());
        var nombreHoja = $.trim($("#prestamosTableExcel").val());
        var filaInicial = $.trim($("#prestamosExcelInicio").val());
        var filaFinal = $.trim($("#prestamosExcelFinal").val());
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
                        var valorDepositos = result.recordset[i];
                        if(valorDepositos[idCliente].length < 31) {
                            if(valorDepositos[nombreCliente].length < 81) {
                                if(valorDepositos[tipoPersona].length < 81) {
                                    if(valorDepositos[tipoSubPersona].length < 81) {
                                        if(valorDepositos[numPrestamo].toString().length < 51) {
                                            if(valorDepositos[saldo].toString().length < 21) {
                                                if(valorDepositos[moneda].length < 31) {
                                                    if(valorDepositos[montoOtorgado].toString().length < 21) {
                                                        if(valorDepositos[tipoCuenta].length < 101) {
                                                            if(valorDepositos[diasMora].toString().length < 21) {
                                                                if(valorDepositos[amortizacion].toString().length < 21) {
                                                                    if(valorDepositos[sobregiro].toString().length < 21) {
                                                                        if(valorDepositos[contingente].toString().length < 21) {
                                                                            if(valorDepositos[clasificacionCartera].length < 3) {
                                                                                if(valorDepositos[tipoCredito].length < 81) {
                                                                                    if(valorDepositos[pago30].toString().length < 21) {
                                                                                        if(valorDepositos[pago60].toString().length < 21) {
                                                                                            if(valorDepositos[pago90].toString().length < 21) {
                                                                                                if(valorDepositos[pago120].toString().length < 21) {
                                                                                                    if(valorDepositos[clausulasRestrictivas].length > 0) {
                                                                                                        if(Date.parse(valorDepositos[fechaInicio])) {
                                                                                                            if(Date.parse(valorDepositos[fechaFinal])) {
                                                                                                                if(valorDepositos[sucursal].length < 51) {
                                                                                                                    const transaction = new sql.Transaction( pool1 );
                                                                                                                    transaction.begin(err => {
                                                                                                                        var rolledBack = false;
                                                                                                                        transaction.on('rollback', aborted => {
                                                                                                                            rolledBack = true;
                                                                                                                        });
                                                                                                                        const request = new sql.Request(transaction);
                                                                                                                        request.query("insert into Prestamos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, tipoCuenta, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, clausulasRestrictivas, fechaInicio, fechaFinal, sucursal, fecha) values ('"+valorDepositos[identificador]+"','"+valorDepositos[nombre]+"','"+valorDepositos[tipoPersona]+"','"+valorDepositos[tipoSubPersona]+"',"+valorDepositos[numPrestamo]+","+valorDepositos[saldo]+",'"+valorDepositos[moneda]+"',"+valorDepositos[montoOtorgado]+",'"+valorDepositos[tipoCuenta]+"',"+valorDepositos[diasMora]+","+valorDepositos[amortizaciones]+","+valorDepositos[sobregiro]+","+valorDepositos[contingente]+",'"+valorDepositos[clasificacionCartera]+"','"+valorDepositos[tipoCredito]+"',"+valorDepositos[esperado30]+","+valorDepositos[esperado60]+","+valorDepositos[esperado90]+","+valorDepositos[esperado120]+",'"+valorDepositos[clausulasRestrictivas]+"','"+formatDateCreation(valorDepositos[fechaInicio])+"','"+formatDateCreation(valorDepositos[fechaFinal])+"','"+valorDepositos[sucursal]+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorDepositos[numPrestamo], c: "El valor de tipo de cuenta es mayor a 100 caracteres"});
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
    } else if($.trim($("#plazoResidualConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'plazo residual';
    } else if($.trim($("#sucursalConexionDepositos").val()).length == 0) {
        entrar = false;
        campo = 'agencia';
    } else if($.trim($("#depositosUserDB").val()).length == 0 && $("ul#myTabDepositos li.active").value == 1) {
        entrar = false;
        campo = 'usuario de la base de datos';
    } else if($.trim($("#depositosPasswordDB").val()).length == 0 && $("ul#myTabDepositos li.active").value == 1) {
        entrar = false;
        campo = 'contraseña de la base de datos';
    } else if($.trim($("#depositosServerDB").val()).length == 0 && $("ul#myTabDepositos li.active").value == 1) {
        entrar = false;
        campo = 'depositos de la base de datos';
    } else if($.trim($("#depositosDataBaseDB").val()).length == 0 && $("ul#myTabDepositos li.active").value == 1) {
        entrar = false;
        campo = 'nombre de la base de datos';
    } else if($.trim($("#depositosTableDB").val()).length == 0 && $("ul#myTabDepositos li.active").value == 1) {
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
            var identificador = $.trim($("#idClienteConexionDepositos").val());
            var nombre = $.trim($("#nombreClienteConexionDepositos").val());
            var tipoPersona = $.trim($("#tipoPersonaClienteConexionDepositos").val());
            var tipoSubPersona = $.trim($("#tipoSubPersonaClienteConexionDepositos").val());
            var saldo = $.trim($("#saldoConexionDepositos").val());
            var moneda = $.trim($("#monedaConexionDepositos").val());
            var tipoCuenta = $.trim($("#tipoCuentaConexionDepositos").val());
            var plazoResidual = $.trim($("#plazoResidualConexionDepositos").val());
            var sucursal = $.trim($("#sucursalConexionDepositos").val());
            var nombreHoja = $.trim($("#depositosTableExcel").val());
            var filaInicial = $.trim($("#depositosExcelInicio").val());
            var filaFinal = $.trim($("#depositosExcelFinal").val());
            if(identificador.length > 0) {
                if(isNaN(identificador)) {
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
                                                                    if(plazoResidual.length > 0) {
                                                                        if(isNaN(plazoResidual)) {
                                                                            if(sucursal.length > 0) {
                                                                                if(isNaN(sucursal)) {
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
                                                                                            if(file.length > 0) {
                                                                                                workbook = XLSX.readFile(file[0]);
                                                                                                var sheet = workbook.Sheets[nombreHoja];
                                                                                                if(sheet != null) {
                                                                                                    if(filaFinal.length == 0)
                                                                                                        filaFinal = 0;
                                                                                                    var arregloDeDepositos = [];
                                                                                                    identificador = identificador.toUpperCase();
                                                                                                    nombre = nombre.toUpperCase();
                                                                                                    tipoPersona = tipoPersona.toUpperCase();
                                                                                                    tipoSubPersona = tipoSubPersona.toUpperCase();
                                                                                                    saldo = saldo.toUpperCase();
                                                                                                    moneda = moneda.toUpperCase();
                                                                                                    tipoCuenta = tipoCuenta.toUpperCase();
                                                                                                    plazoResidual = plazoResidual.toUpperCase();
                                                                                                    sucursal = sucursal.toUpperCase();
                                                                                                    filaInicial = parseInt(filaInicial);
                                                                                                    filaFinal = parseInt(filaFinal);
                                                                                                    if(filaFinal != 0) {
                                                                                                        for (var i = filaInicial; i <= filaFinal; i++) {
                                                                                                            if(sheet[identificador+i] != undefined && sheet[identificador+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[tipoPersona+i] != undefined && sheet[tipoPersona+i].v.toString().length > 0 && sheet[tipoSubPersona+i] != undefined && sheet[tipoSubPersona+i].v.toString().length > 0 && sheet[saldo+i] != undefined && sheet[saldo+i].v.toString().length > 0 && sheet[moneda+i] != undefined && sheet[moneda+i].v.toString().length > 0 && sheet[tipoCuenta+i] != undefined && sheet[tipoCuenta+i].v.toString().length > 0 && sheet[plazoResidual+i] != undefined && sheet[plazoResidual+i].v.toString().length > 0 && sheet[sucursal+i] != undefined && sheet[sucursal+i].v.toString().length > 0) {
                                                                                                                var depositoIDCLiente = sheet[identificador+i].v;
                                                                                                                var depositoNombreCliente = sheet[nombre+i].v;
                                                                                                                var depositoTipoPersona = sheet[tipoPersona+i].v;
                                                                                                                var depositoTipoSubPersona = sheet[tipoSubPersona+i].v;
                                                                                                                var depositoTotalDepositos = sheet[saldo+i].v;
                                                                                                                var depositoMoneda = sheet[moneda+i].v;
                                                                                                                var depositoTipoCuenta = sheet[tipoCuenta+i].v;
                                                                                                                var depositoPlazoResidual = parseInt(sheet[plazoResidual+i].v);
                                                                                                                var depositoSucursal = sheet[sucursal+i].v;
                                                                                                                depositoNombreCliente = depositoNombreCliente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                depositoTipoCuenta = depositoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                depositoSucursal = depositoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                depositoNombreCliente = depositoNombreCliente.toLowerCase();
                                                                                                                depositoNombreCliente = UpperCasefirst(depositoNombreCliente);
                                                                                                                arregloDeDepositos.push({idCLiente: depositoIDCLiente, nombreCliente: depositoNombreCliente, tipoPersona: depositoTipoPersona, tipoSubPersona: depositoTipoSubPersona, saldo: depositoTotalDepositos, moneda: depositoMoneda, tipoCuenta: depositoTipoCuenta, plazoResidual: depositoPlazoResidual, sucursal: depositoSucursal});
                                                                                                                totalInserciones++;
                                                                                                            } else if(sheet[identificador+i] != undefined || sheet[nombre+i] != undefined || sheet[tipoPersona+i] != undefined || sheet[tipoSubPersona+i] != undefined || sheet[saldo+i] != undefined || sheet[moneda+i] != undefined || sheet[tipoCuenta+i] != undefined || sheet[sucursal+i] != undefined)
                                                                                                                arregloErroresExcel.push(i);
                                                                                                        };
                                                                                                    } else {
                                                                                                        var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
                                                                                                        finalRow = parseInt(finalRow);
                                                                                                        for (var i = filaInicial; i <= finalRow; i++) {
                                                                                                            if(sheet[identificador+i] != undefined && sheet[identificador+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[tipoPersona+i] != undefined && sheet[tipoPersona+i].v.toString().length > 0 && sheet[tipoSubPersona+i] != undefined && sheet[tipoSubPersona+i].v.toString().length > 0 && sheet[saldo+i] != undefined && sheet[saldo+i].v.toString().length > 0 && sheet[moneda+i] != undefined && sheet[moneda+i].v.toString().length > 0 && sheet[tipoCuenta+i] != undefined && sheet[tipoCuenta+i].v.toString().length > 0 && sheet[plazoResidual+i] != undefined && sheet[plazoResidual+i].v.toString().length > 0 && sheet[sucursal+i] != undefined && sheet[sucursal+i].v.toString().length > 0) {
                                                                                                                var depositoIDCLiente = sheet[identificador+i].v;
                                                                                                                var depositoNombreCliente = sheet[nombre+i].v;
                                                                                                                var depositoTipoPersona = sheet[tipoPersona+i].v;
                                                                                                                var depositoTipoSubPersona = sheet[tipoSubPersona+i].v;
                                                                                                                var depositoTotalDepositos = sheet[saldo+i].v;
                                                                                                                var depositoMoneda = sheet[moneda+i].v;
                                                                                                                var depositoTipoCuenta = sheet[tipoCuenta+i].v;
                                                                                                                var depositoPlazoResidual = sheet[plazoResidual+i].v;
                                                                                                                var depositoSucursal = sheet[sucursal+i].v;
                                                                                                                //depositoIDCLiente = depositoIDCLiente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                depositoNombreCliente = depositoNombreCliente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                depositoTipoCuenta = depositoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                //activoMonto = activoMonto.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                depositoSucursal = depositoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                depositoNombreCliente = depositoNombreCliente.toLowerCase();
                                                                                                                depositoNombreCliente = UpperCasefirst(depositoNombreCliente);
                                                                                                                arregloDeDepositos.push({idCLiente: depositoIDCLiente, nombreCliente: depositoNombreCliente, tipoPersona: depositoTipoPersona, tipoSubPersona: depositoTipoSubPersona, saldo: depositoTotalDepositos, moneda: depositoMoneda, tipoCuenta: depositoTipoCuenta, plazoResidual: depositoPlazoResidual, sucursal: depositoSucursal});
                                                                                                                totalInserciones++;
                                                                                                            } else if(sheet[identificador+i] != undefined || sheet[nombre+i] != undefined || sheet[tipoPersona+i] != undefined || sheet[tipoSubPersona+i] != undefined || sheet[saldo+i] != undefined || sheet[moneda+i] != undefined || sheet[tipoCuenta+i] != undefined || sheet[sucursal+i] != undefined)
                                                                                                                arregloErroresExcel.push(i);
                                                                                                        };
                                                                                                    }
                                                                                                    for (var i = 0; i < arregloDeDepositos.length; i++) {
                                                                                                        if(arregloDeDepositos[i].idCLiente.length < 31) {
                                                                                                            if(arregloDeDepositos[i].nombreCliente.length < 81) {
                                                                                                                if(arregloDeDepositos[i].tipoPersona.length < 81) {
                                                                                                                    if(arregloDeDepositos[i].tipoSubPersona.length < 81) {
                                                                                                                        if(arregloDeDepositos[i].saldo.length < 21) {
                                                                                                                            if(arregloDeDepositos[i].moneda.length < 31) {
                                                                                                                                if(arregloDeDepositos[i].tipoCuenta.length < 101) {
                                                                                                                                    if(!isNaN(arregloDeDepositos[i].plazoResidual)) {
                                                                                                                                        if(arregloDeDepositos[i].sucursal.length < 51) {
                                                                                                                                            createDeposit( arregloDeDepositos[i] );
                                                                                                                                        } else {
                                                                                                                                            arregloErroresInsercion.push({b: "Deposito de: "+arregloDeDepositos[i].idCLiente, c: "El valor del sucursal es mayor a 50 caracteres"});
                                                                                                                                        }
                                                                                                                                    } else {
                                                                                                                                        arregloErroresInsercion.push({b: "Deposito de: "+arregloDeDepositos[i].idCLiente, c: "El valor del plazo residual no es un número valido"});
                                                                                                                                    }
                                                                                                                                } else {
                                                                                                                                    arregloErroresInsercion.push({b: "Deposito de: "+arregloDeDepositos[i].idCLiente, c: "El valor del tipo de cuenta es mayor a 100 caracteres"});
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                arregloErroresInsercion.push({b: "Deposito de: "+arregloDeDepositos[i].idCLiente, c: "El valor de la moneda es mayor a 30 caracteres"});
                                                                                                                            }
                                                                                                                        } else {
                                                                                                                            arregloErroresInsercion.push({b: "Deposito de: "+arregloDeDepositos[i].idCLiente, c: "El valor del saldo es mayor a 20 caracteres"});
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        arregloErroresInsercion.push({b: "Deposito de: "+arregloDeDepositos[i].idCLiente, c: "El valor del tipo de sub-persona es mayor a 80 caracteres"});
                                                                                                                    }
                                                                                                                } else {
                                                                                                                    arregloErroresInsercion.push({b: "Deposito de: "+arregloDeDepositos[i].idCLiente, c: "El valor del tipo de persona es mayor a 80 caracteres"});
                                                                                                                }
                                                                                                            } else {
                                                                                                                arregloErroresInsercion.push({b: "Deposito de: "+arregloDeDepositos[i].idCLiente, c: "El valor del nombre del cliente es mayor a 80 caracteres"});
                                                                                                            }
                                                                                                        } else {
                                                                                                            arregloErroresInsercion.push({b: "Deposito de: "+arregloDeDepositos[i].idCLiente, c: "El valor del identificador del cliente es mayor a 30 caracteres"});
                                                                                                        }
                                                                                                    };
                                                                                                    /*$("body").overhang({
                                                                                                        type: "success",
                                                                                                        primary: "#40D47E",
                                                                                                        accent: "#27AE60",
                                                                                                        message: "Depositos importados con éxito.",
                                                                                                        overlay: true
                                                                                                    });*/
                                                                                                } else {
                                                                                                    $("body").overhang({
                                                                                                        type: "error",
                                                                                                        primary: "#f84a1d",
                                                                                                        accent: "#d94e2a",
                                                                                                        message: "Error al abrir hoja de excel.",
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
                                                                                                message: "Ingrese un valor para la fila inicial de la hoja de excel.",
                                                                                                overlay: true,
                                                                                                closeConfirm: true
                                                                                            });
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
                                                                            }
                                                                        } else {
                                                                            $("body").overhang({
                                                                                type: "error",
                                                                                primary: "#f84a1d",
                                                                                accent: "#d94e2a",
                                                                                message: "Ingrese una letra para la columna del campo de plazo residual.",
                                                                                overlay: true,
                                                                                closeConfirm: true
                                                                            });
                                                                        }
                                                                    } else {
                                                                        $("body").overhang({
                                                                            type: "error",
                                                                            primary: "#f84a1d",
                                                                            accent: "#d94e2a",
                                                                            message: "Ingrese un valor para la columna del campo de plazo residual.",
                                                                            overlay: true,
                                                                            closeConfirm: true
                                                                        });
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
        request.query("insert into Depositos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, plazoResidual, sucursal, fecha) values ('"+deposito.idCliente+"','"+deposito.nombreCliente+"','"+deposito.tipoPersona+"','"+deposito.tipoSubPersona+"',"+deposito.saldo+",'"+deposito.moneda+"','"+deposito.tipoCuenta+"',"+deposito.plazoResidual+",'"+deposito.sucursal+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
    } else if($.trim($("#tipoCuentaConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'tipo de cuenta';
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
    } else if($.trim($("#fechaInicioConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'fecha de inicio del préstamo';
    } else if($.trim($("#fechaExpiracionConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'fecha final del préstamo';
    } else if($.trim($("#sucursalConexionPrestamos").val()).length == 0) {
        entrar = false;
        campo = 'agencia';
    } else if($.trim($("#prestamosUserDB").val()).length == 0 && $("ul#myTabDepositos li.active")[0].value == 1) {
        entrar = false;
        campo = 'usuario de la base de datos';
    } else if($.trim($("#prestamosPasswordDB").val()).length == 0 && $("ul#myTabDepositos li.active")[0].value == 1) {
        entrar = false;
        campo = 'contraseña de la base de datos';
    } else if($.trim($("#prestamosServerDB").val()).length == 0 && $("ul#myTabDepositos li.active")[0].value == 1) {
        entrar = false;
        campo = 'servidor de la base de datos';
    } else if($.trim($("#prestamosDataBaseDB").val()).length == 0 && $("ul#myTabDepositos li.active")[0].value == 1) {
        entrar = false;
        campo = 'nombre de la base de datos';
    } else if($.trim($("#prestamosTableDB").val()).length == 0 && $("ul#myTabDepositos li.active")[0].value == 1) {
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
            var identificador = $.trim($("#idClienteConexionPrestamos").val());
            var nombre = $.trim($("#nombreClienteConexionPrestamos").val());
            var tipoPersona = $.trim($("#tipoPersonaClienteConexionPrestamos").val());
            var tipoSubPersona = $.trim($("#tipoSubPersonaClienteConexionPrestamos").val());
            var numPrestamo = $.trim($("#numPrestamoConexionPrestamos").val());
            var saldo = $.trim($("#saldoConexionPrestamos").val());
            var moneda = $.trim($("#monedaConexionPrestamos").val());
            var tipoCuenta = $.trim($("#tipoCuentaConexionPrestamos").val());
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
            var fechaInicio = $.trim($("#fechaInicioConexionPrestamos").val());
            var fechaFinal = $.trim($("#fechaExpiracionConexionPrestamos").val());
            var montoOtorgado = $.trim($("#montoOtorgadoConexionPrestamos").val());
            var sucursal = $.trim($("#sucursalConexionDepositos").val());
            var nombreHoja = $.trim($("#prestamosTableExcel").val());
            var filaInicial = $.trim($("#prestamosExcelInicio").val());
            var filaFinal = $.trim($("#prestamosExcelFinal").val());
            if(isNaN(identificador)) {
                if(isNaN(nombre)) {
                    if(isNaN(tipoPersona)) {
                        if(isNaN(tipoSubPersona)) {
                            if(isNaN(numPrestamo)) {
                                if(isNaN(saldo)) {
                                    if(isNaN(moneda)) {
                                        if(isNaN(tipoCuenta)) {
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
                                                                                        if(isNaN(fechaInicio)) {
                                                                                            if(isNaN(fechaFinal)) {
                                                                                                if(isNaN(montoOtorgado)) {
                                                                                                    if(isNaN(sucursal)) {
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
                                                                                                                if(file.length > 0) {
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
                                                                                                                        tipoCuenta = tipoCuenta.toUpperCase();
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
                                                                                                                        fechaInicio = fechaInicio.toUpperCase();
                                                                                                                        fechaFinal = fechaFinal.toUpperCase();
                                                                                                                        montoOtorgado = montoOtorgado.toUpperCase();
                                                                                                                        sucursal = sucursal.toUpperCase();
                                                                                                                        filaInicial = parseInt(filaInicial);
                                                                                                                        filaFinal = parseInt(filaFinal);
                                                                                                                        if(filaFinal != 0) {
                                                                                                                            for (var i = filaInicial; i <= filaFinal; i++) {
                                                                                                                                if(sheet[identificador+i] != undefined && sheet[identificador+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[tipoPersona+i] != undefined && sheet[tipoPersona+i].v.toString().length > 0 && sheet[tipoSubPersona+i] != undefined && sheet[tipoSubPersona+i].v.toString().length > 0) {
                                                                                                                                    var prestamoIDCLiente = sheet[identificador+i].v;
                                                                                                                                    var prestamoNombreCliente = sheet[nombre+i].v;
                                                                                                                                    var prestamoTipoPersona = sheet[tipoPersona+i].v;
                                                                                                                                    var prestamoTipoSubPersona = sheet[tipoSubPersona+i].v;
                                                                                                                                    var prestamoNumPrestamo = sheet[numPrestamo+i].v;
                                                                                                                                    var prestamoTotalDepositos = sheet[saldo+i].v;
                                                                                                                                    var prestamoMoneda = sheet[moneda+i].v;
                                                                                                                                    var prestamoTipoCuenta = sheet[tipoCuenta+i].v;
                                                                                                                                    var prestamoDiasMora = sheet[diasMora+i].v;
                                                                                                                                    var prestamoAmortizaciones = sheet[amortizaciones+i].v;
                                                                                                                                    var prestamoSobregiro = sheet[sobregiro+i].v;
                                                                                                                                    var prestamoContingente = sheet[contingente+i].v;
                                                                                                                                    var prestamoClasificacionCartera = sheet[clasificacionCartera+i].v;
                                                                                                                                    var prestamoTipoCredito = sheet[tipoCredito+i].v;
                                                                                                                                    var prestamoEsperado30 = sheet[esperado30+i].v;
                                                                                                                                    var prestamoEsperado60 = sheet[esperado60+i].v;
                                                                                                                                    var prestamoEsperado90 = sheet[esperado90+i].v;
                                                                                                                                    var prestamoEsperado120 = sheet[esperado120+i].v;
                                                                                                                                    var prestamoClausulasRestrictivas = sheet[clausulasRestrictivas+i].v;
                                                                                                                                    var prestamoFechaInicio = sheet[fechaInicio+i].v;
                                                                                                                                    var prestamoFechaFinal = sheet[fechaFinal+i].v;
                                                                                                                                    var prestamoMontoOtorgado = sheet[montoOtorgado+i].v;
                                                                                                                                    var prestamoSucursal = sheet[sucursal+i].v;
                                                                                                                                    prestamoIDCLiente = prestamoIDCLiente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                    prestamoTipoCuenta = prestamoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                    prestamoSucursal = prestamoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                    prestamoNombreCliente = prestamoNombreCliente.toLowerCase();
                                                                                                                                    prestamoNombreCliente = UpperCasefirst(prestamoNombreCliente);
                                                                                                                                    arregloDePrestamos.push({idCliente: prestamoIDCLiente, nombreCliente: prestamoNombreCliente, tipoPersona: prestamoTipoPersona, tipoSubPersona: prestamoTipoSubPersona, numPrestamo: prestamoNumPrestamo, saldo: prestamoTotalDepositos, moneda: prestamoMoneda, tipoCuenta: prestamoTipoCuenta, montoOtorgado: prestamoMontoOtorgado, diasMora: prestamoDiasMora, amortizacion: prestamoAmortizaciones, sobregiro: prestamoSobregiro, contingente: prestamoContingente, clasificacionCartera: prestamoClasificacionCartera, tipoCredito: prestamoTipoCredito, pago30: prestamoEsperado30, pago60: prestamoEsperado60, pago90: prestamoEsperado90, pago120: prestamoEsperado120, clausulasRestrictivas: prestamoClausulasRestrictivas, fechaInicio: formatDateCreation(prestamoFechaInicio), fechaFinal: formatDateCreation(prestamoFechaFinal), sucursal: prestamoSucursal});
                                                                                                                                    totalInserciones++;
                                                                                                                                } else if(sheet[identificador+i] != undefined|| sheet[nombre+i] != undefined|| sheet[tipoPersona+i] != undefined || sheet[tipoSubPersona+i] != undefined)
                                                                                                                                    arregloErroresExcel.push(i);
                                                                                                                            };
                                                                                                                        } else {
                                                                                                                            var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
                                                                                                                            finalRow = parseInt(finalRow);
                                                                                                                            for (var i = filaInicial; i <= finalRow; i++) {
                                                                                                                                if(sheet[identificador+i] != undefined && sheet[identificador+i].v.toString().length > 0 && sheet[nombre+i] != undefined && sheet[nombre+i].v.toString().length > 0 && sheet[tipoPersona+i] != undefined && sheet[tipoPersona+i].v.toString().length > 0 && sheet[tipoSubPersona+i] != undefined && sheet[tipoSubPersona+i].v.toString().length > 0) {
                                                                                                                                    var prestamoIDCLiente = sheet[identificador+i].v;
                                                                                                                                    var prestamoNombreCliente = sheet[nombre+i].v;
                                                                                                                                    var prestamoTipoPersona = sheet[tipoPersona+i].v;
                                                                                                                                    var prestamoTipoSubPersona = sheet[tipoSubPersona+i].v;
                                                                                                                                    var prestamoNumPrestamo = sheet[numPrestamo+i].v;
                                                                                                                                    var prestamoTotalDepositos = sheet[saldo+i].v;
                                                                                                                                    var prestamoMoneda = sheet[moneda+i].v;
                                                                                                                                    var prestamoTipoCuenta = sheet[tipoCuenta+i].v;
                                                                                                                                    var prestamoDiasMora = sheet[diasMora+i].v;
                                                                                                                                    var prestamoAmortizaciones = sheet[amortizaciones+i].v;
                                                                                                                                    var prestamoSobregiro = sheet[sobregiro+i].v;
                                                                                                                                    var prestamoContingente = sheet[contingente+i].v;
                                                                                                                                    var prestamoClasificacionCartera = sheet[clasificacionCartera+i].v;
                                                                                                                                    var prestamoTipoCredito = sheet[tipoCredito+i].v;
                                                                                                                                    var prestamoEsperado30 = sheet[esperado30+i].v;
                                                                                                                                    var prestamoEsperado60 = sheet[esperado60+i].v;
                                                                                                                                    var prestamoEsperado90 = sheet[esperado90+i].v;
                                                                                                                                    var prestamoEsperado120 = sheet[esperado120+i].v;
                                                                                                                                    var prestamoClausulasRestrictivas = sheet[clausulasRestrictivas+i].v;
                                                                                                                                    var prestamoFechaInicio = sheet[fechaInicio+i].v;
                                                                                                                                    var prestamoFechaFinal = sheet[fechaFinal+i].v;
                                                                                                                                    var prestamoMontoOtorgado = sheet[montoOtorgado+i].v;
                                                                                                                                    var prestamoSucursal = sheet[sucursal+i].v;
                                                                                                                                    //depositoIDCLiente = depositoIDCLiente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                    prestamoIDCLiente = prestamoIDCLiente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                    prestamoTipoCuenta = prestamoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                    //activoMonto = activoMonto.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                    prestamoSucursal = prestamoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                                                    prestamoNombreCliente = prestamoNombreCliente.toLowerCase();
                                                                                                                                    prestamoNombreCliente = UpperCasefirst(prestamoNombreCliente);
                                                                                                                                    /*depositoTipoCuenta = depositoTipoCuenta.toLowerCase();
                                                                                                                                    depositoTipoCuenta = UpperCasefirst(depositoTipoCuenta);
                                                                                                                                    depositoSucursal = depositoSucursal.toLowerCase();
                                                                                                                                    depositoSucursal = UpperCasefirst(depositoSucursal);*/
                                                                                                                                    arregloDePrestamos.push({idCliente: prestamoIDCLiente, nombreCliente: prestamoNombreCliente, tipoPersona: prestamoTipoPersona, tipoSubPersona: prestamoTipoSubPersona, numPrestamo: prestamoNumPrestamo, saldo: prestamoTotalDepositos, moneda: prestamoMoneda, tipoCuenta: prestamoTipoCuenta, montoOtorgado: prestamoMontoOtorgado, diasMora: prestamoDiasMora, amortizacion: prestamoAmortizaciones, sobregiro: prestamoSobregiro, contingente: prestamoContingente, clasificacionCartera: prestamoClasificacionCartera, tipoCredito: prestamoTipoCredito, pago30: prestamoEsperado30, pago60: prestamoEsperado60, pago90: prestamoEsperado90, pago120: prestamoEsperado120, clausulasRestrictivas: prestamoClausulasRestrictivas, fechaInicio: formatDateCreation(prestamoFechaInicio), fechaFinal: formatDateCreation(prestamoFechaFinal), sucursal: prestamoSucursal});
                                                                                                                                    totalInserciones++;
                                                                                                                                } else if(sheet[identificador+i] != undefined|| sheet[nombre+i] != undefined|| sheet[tipoPersona+i] != undefined || sheet[tipoSubPersona+i] != undefined)
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
                                                                                                                                                            if(arregloDePrestamos[i].tipoCuenta.length < 101) {
                                                                                                                                                                if(arregloDePrestamos[i].diasMora.toString().length < 21) {
                                                                                                                                                                    if(arregloDePrestamos[i].amortizacion.toString().length < 21) {
                                                                                                                                                                        if(arregloDePrestamos[i].sobregiro.toString().length < 21) {
                                                                                                                                                                            if(arregloDePrestamos[i].contingente.toString().length < 21) {
                                                                                                                                                                                if(arregloDePrestamos[i].clasificacionCartera.length < 3) {
                                                                                                                                                                                    if(arregloDePrestamos[i].tipoCredito.length < 81) {
                                                                                                                                                                                        if(arregloDePrestamos[i].pago30.toString().length < 21) {
                                                                                                                                                                                            if(arregloDePrestamos[i].pago60.toString().length < 21) {
                                                                                                                                                                                                if(arregloDePrestamos[i].pago90.toString().length < 21) {
                                                                                                                                                                                                    if(arregloDePrestamos[i].pago120.toString().length < 21) {
                                                                                                                                                                                                        if(arregloDePrestamos[i].clausulasRestrictivas.length > 0) {
                                                                                                                                                                                                            if(Date.parse(arregloDePrestamos[i].fechaInicio)) {
                                                                                                                                                                                                                if(Date.parse(arregloDePrestamos[i].fechaFinal)) {
                                                                                                                                                                                                                    if(arregloDePrestamos[i].sucursal.length < 51) {
                                                                                                                                                                                                                        createLoan( arregloDePrestamos[i] );
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de sucursal es mayor a 50 caracteres"});
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "La fecha final no es valida"});
                                                                                                                                                                                                                }
                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "La fecha inicial no es valida"});
                                                                                                                                                                                                            }
                                                                                                                                                                                                        } else {
                                                                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de clausulas restrictivas tiene que ser mayor a 0 caracteres"});
                                                                                                                                                                                                        }
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de pago en 120 días es mayor a 20 caracteres"});
                                                                                                                                                                                                    }
                                                                                                                                                                                                } else {
                                                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de pago en 90 días es mayor a 20 caracteres"});
                                                                                                                                                                                                }
                                                                                                                                                                                            } else {
                                                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de pago en 60 días es mayor a 20 caracteres"});
                                                                                                                                                                                            }
                                                                                                                                                                                        } else {
                                                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de pago en 30 días es mayor a 20 caracteres"});
                                                                                                                                                                                        }
                                                                                                                                                                                    } else {
                                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de tipo de crédito es mayor a 80 caracteres"});
                                                                                                                                                                                    }
                                                                                                                                                                                } else {
                                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de clasificación de cartera es mayor a 2 caracteres"});
                                                                                                                                                                                }
                                                                                                                                                                            } else {
                                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de contingente es mayor a 20 caracteres"});
                                                                                                                                                                            }
                                                                                                                                                                        } else {
                                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de sobregiro es mayor a 20 caracteres"});
                                                                                                                                                                        }
                                                                                                                                                                    } else {
                                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de amortización es mayor a 20 caracteres"});
                                                                                                                                                                    }
                                                                                                                                                                } else {
                                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de días de mora es mayor a 20 caracteres"});
                                                                                                                                                                }
                                                                                                                                                            } else {
                                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de tipo de cuenta es mayor a 100 caracteres"});
                                                                                                                                                            }
                                                                                                                                                        } else {
                                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de monto otorgado es mayor a 20 caracteres"});
                                                                                                                                                        }
                                                                                                                                                    } else {
                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de moneda es mayor a 30 caracteres"});
                                                                                                                                                    }
                                                                                                                                                } else {
                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de saldo es mayor a 20 caracteres"});
                                                                                                                                                }
                                                                                                                                            } else {
                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de número de préstamo es mayor a 50 caracteres"});
                                                                                                                                            }
                                                                                                                                        } else {
                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de tipo de sub-persona es mayor a 80 caracteres"});
                                                                                                                                        }
                                                                                                                                    } else {
                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de tipo de persona es mayor a 80 caracteres"});
                                                                                                                                    }
                                                                                                                                } else {
                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de nombre del cliente es mayor a 80 caracteres"});
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+arregloDePrestamos[i].numPrestamo, c: "El valor de identificador del cliente es mayor a 30 caracteres"});
                                                                                                                            }
                                                                                                                        };
                                                                                                                        /*$("body").overhang({
                                                                                                                            type: "success",
                                                                                                                            primary: "#40D47E",
                                                                                                                            accent: "#27AE60",
                                                                                                                            message: "Préstamos importados con éxito.",
                                                                                                                            overlay: true
                                                                                                                        });*/
                                                                                                                    } else {
                                                                                                                        $("body").overhang({
                                                                                                                            type: "error",
                                                                                                                            primary: "#f84a1d",
                                                                                                                            accent: "#d94e2a",
                                                                                                                            message: "Error al abrir hoja de excel.",
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
                                                                                                                    message: "Ingrese un valor para la fila inicial de la hoja de excel.",
                                                                                                                    overlay: true,
                                                                                                                    closeConfirm: true
                                                                                                                });
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
                                            }
                                        } else {
                                            $("body").overhang({
                                                type: "error",
                                                primary: "#f84a1d",
                                                accent: "#d94e2a",
                                                message: "Ingrese una letra para la columna del campo de tipo de cuenta.",
                                                overlay: true,
                                                closeConfirm: true
                                            });
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
        request.query("insert into Prestamos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, tipoCuenta, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, clausulasRestrictivas, fechaInicio, fechaFinal, sucursal, fecha) values ('"+prestamo.idCliente+"','"+prestamo.nombreCliente+"','"+prestamo.tipoPersona+"','"+prestamo.tipoSubPersona+"',"+prestamo.numPrestamo+","+prestamo.saldo+",'"+prestamo.moneda+"',"+prestamo.montoOtorgado+",'"+prestamo.tipoCuenta+"',"+prestamo.diasMora+","+prestamo.amortizacion+","+prestamo.sobregiro+","+prestamo.contingente+",'"+prestamo.clasificacionCartera+"','"+prestamo.tipoCredito+"',"+prestamo.pago30+","+prestamo.pago60+","+prestamo.pago90+","+prestamo.pago120+",'"+prestamo.clausulasRestrictivas+"','"+formatDateCreation(prestamo.fechaInicio)+"','"+formatDateCreation(prestamo.fechaFinal)+"','"+prestamo.sucursal+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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

function saveFields (tipoDB, indexTabla) {
    if(indexTabla == 0) {
        var cuenta = $.trim($("#cuentaConexionActivos").val());
        var nombre = $.trim($("#nombreConexionActivos").val());
        var saldo = $.trim($("#saldoConexionActivos").val());
        var moneda = $.trim($("#monedaConexionActivos").val());
        var sucursal = $.trim($("#sucursalConexionActivos").val());
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
                            const transaction = new sql.Transaction( pool1 );
                            transaction.begin(err => {
                                var rolledBack = false;
                                transaction.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request = new sql.Request(transaction);
                                request.query("update Activos_Campos set values cuenta = '"+cuenta+"', nombre = '"+nombre+"', saldo = '"+saldo+"', moneda = '"+moneda+"', sucursal = '"+sucursal+"' where ID = "+existe[0].ID, (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction.rollback(err => {
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
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("modifico campos activos");
                                        });
                                    }
                                });
                            }); // fin transaction
                        } else {
                            const transaction = new sql.Transaction( pool1 );
                            transaction.begin(err => {
                                var rolledBack = false;
                                transaction.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request = new sql.Request(transaction);
                                request.query("insert into Activos_Campos (cuenta, nombre, saldo, moneda, sucursal, tipo) values ('"+cuenta+"','"+nombre+"','"+saldo+"','"+moneda+"','"+sucursal+"','"+tipo+"')", (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction.rollback(err => {
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
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("inserto campos activos");
                                        });
                                    }
                                });
                            }); // fin transaction
                        }
                    });
                }
            });
        }); // fin transaction
    } else if(indexTabla == 1) {
        var idCliente = $.trim($("#idClienteConexionDepositos").val());
        var nombreCliente = $.trim($("#nombreClienteConexionDepositos").val());
        var tipoPersona = $.trim($("#tipoPersonaClienteConexionDepositos").val());
        var tipoSubPersona = $.trim($("#tipoSubPersonaClienteConexionDepositos").val());
        var saldo = $.trim($("#saldoConexionDepositos").val());
        var moneda = $.trim($("#monedaConexionDepositos").val());
        var tipoCuenta = $.trim($("#tipoCuentaConexionDepositos").val());
        var plazoResidual = $.trim($("#plazoResidualConexionDepositos").val());
        var sucursal = $.trim($("#sucursalConexionDepositos").val());
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
                            const transaction = new sql.Transaction( pool1 );
                            transaction.begin(err => {
                                var rolledBack = false;
                                transaction.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request = new sql.Request(transaction);
                                request.query("update Depositos_Campos set values idCliente = '"+idCliente+"', nombreCliente = '"+nombreCliente+"', tipoPersona = '"+tipoPersona+"', tipoSubPersona = '"+tipoSubPersona+"', saldo = '"+saldo+"', moneda = '"+moneda+"', tipoCuenta = '"+tipoCuenta+"', plazoResidual = "+plazoResidual+", sucursal = '"+sucursal+"' where ID = "+existe[0].ID, (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction.rollback(err => {
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
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("modifico campos depositos");
                                        });
                                    }
                                });
                            }); // fin transaction
                        } else {
                            const transaction = new sql.Transaction( pool1 );
                            transaction.begin(err => {
                                var rolledBack = false;
                                transaction.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request = new sql.Request(transaction);
                                request.query("insert into Depositos_Campos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, plazoResidual, sucursal, tipo) values ('"+idCliente+"','"+nombreCliente+"','"+tipoPersona+"','"+tipoSubPersona+"','"+saldo+"','"+moneda+"','"+tipoCuenta+"',"+plazoResidual+",'"+sucursal+"','"+tipo+"')", (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction.rollback(err => {
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
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("inserto campos depositos");
                                        });
                                    }
                                });
                            }); // fin transaction
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
        var tipoCuenta = $.trim($("#tipoCuentaConexionPrestamos").val());
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
        var fechaInicio = $.trim($("#fechaInicioConexionPrestamos").val());
        var fechaFinal = $.trim($("#fechaExpiracionConexionPrestamos").val());
        var montoOtorgado = $.trim($("#montoOtorgadoConexionPrestamos").val());
        var sucursal = $.trim($("#sucursalConexionPrestamos").val());
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
                            const transaction = new sql.Transaction( pool1 );
                            transaction.begin(err => {
                                var rolledBack = false;
                                transaction.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request = new sql.Request(transaction);
                                request.query("update Prestamos_Campos set values idCliente = '"+idCliente+"', nombreCliente = '"+nombreCliente+"', tipoPersona = '"+tipoPersona+"', tipoSubPersona = '"+tipoSubPersona+"', numPrestamo = '"+numPrestamo+"', saldo = '"+saldo+"', moneda = '"+moneda+"', montoOtorgado = '"+montoOtorgado+"', tipoCuenta = '"+tipoCuenta+"', diasMora = '"+diasMora+"', amortizacion = '"+amortizaciones+"', sobregiro = '"+sobregiro+"', contingente = '"+contingente+"', clasificacionCartera = '"+clasificacionCartera+"', tipoCredito = '"+tipoCredito+"', pago30 = '"+esperado30+"', pago60 = '"+esperado60+"', pago90 = '"+esperado90+"', pago120 = '"+esperado120+"', clausulasRestrictivas = '"+clausulasRestrictivas+"', fechaInicio = '"+fechaInicio+"', fechaFinal = '"+fechaFinal+"', sucursal = '"+sucursal+"' where ID = "+existe[0].ID, (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction.rollback(err => {
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
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("modifico campos prestamos");
                                        });
                                    }
                                });
                            }); // fin transaction
                        } else {
                            const transaction = new sql.Transaction( pool1 );
                            transaction.begin(err => {
                                var rolledBack = false;
                                transaction.on('rollback', aborted => {
                                    rolledBack = true;
                                });
                                const request = new sql.Request(transaction);
                                request.query("insert into Prestamos_Campos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, tipoCuenta, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, clausulasRestrictivas, fechaInicio, fechaFinal, sucursal, tipo) values ('"+idCliente+"','"+nombreCliente+"','"+tipoPersona+"','"+tipoSubPersona+"','"+numPrestamo+"','"+saldo+"','"+moneda+"','"+montoOtorgado+"','"+tipoCuenta+"','"+diasMora+"','"+amortizaciones+"','"+sobregiro+"','"+contingente+"','"+clasificacionCartera+"','"+tipoCredito+"','"+esperado30+"','"+esperado60+"','"+esperado90+"','"+esperado120+"','"+clausulasRestrictivas+"','"+fechaInicio+"','"+fechaFinal+"','"+sucursal+"','"+tipo+"')", (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            transaction.rollback(err => {
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
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("inserto campos prestamos");
                                        });
                                    }
                                });
                            }); // fin transaction
                        }
                    });
                }
            });
        }); // fin transaction
    }
}

function connectionTest (indexTabla) {
	$("#testConnection").prop('disabled', true);
	setTimeout(" $('#testConnection').prop('disabled', false); ", 3000);

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
									  	message: "Conexión realizada con exito.",
									  	overlay: true
									});
						    	}
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
                                                            message: "Intento de conexión fallido activos.",
                                                            overlay: true,
                                                            closeConfirm: true
                                                        });
                                                    } else {
                                                        for (var i = 0; i < result.recordset.length; i++) {
                                                            var valorArreglo = result.recordset[i];
                                                            if(valorArreglo[campos[0].cuenta].length < 31) {
                                                                if(valorArreglo[campos[0].nombre].length < 120) {
                                                                    if(valorArreglo[campos[0].saldo].toString().length < 20) {
                                                                        if(valorArreglo[campos[0].moneda].length < 30) {
                                                                            if(valorArreglo[campos[0].sucursal].length < 50) {
                                                                                const transaction = new sql.Transaction( pool1 );
                                                                                transaction.begin(err => {
                                                                                    var rolledBack = false;
                                                                                    transaction.on('rollback', aborted => {
                                                                                        rolledBack = true;
                                                                                    });
                                                                                    const request = new sql.Request(transaction);
                                                                                    request.query("insert into Activos (cuenta, nombre, saldo, moneda, sucursal, fecha) values ('"+valorArreglo[campos[0].cuenta]+"','"+valorArreglo[campos[0].nombre]+"',"+valorArreglo[campos[0].saldo]+",'"+valorArreglo[campos[0].moneda]+"','"+valorArreglo[campos[0].sucursal]+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
                                                                                arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor de sucursal es mayor a 50 caracteres"});
                                                                            }
                                                                        } else {
                                                                            arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor de la moneda es mayor a 30 caracteres"});
                                                                        }
                                                                    } else {
                                                                        arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor del saldo es mayor a 20 caracteres"});
                                                                    }
                                                                } else {
                                                                    arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor es mayor a 120 caracteres"});
                                                                }
                                                            } else {
                                                                arregloErroresInsercion.push({b: "Activo: "+valorArreglo[campos[0].cuenta], c: "El valor de la cuenta es mayor a 30 caracteres"});
                                                            }
                                                        };
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
                                            transactionCampos.rollback(err => {
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#f84a1d",
                                                    accent: "#d94e2a",
                                                    message: "Error en conneción Depositos_Campos.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });

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
                                                            message: "Intento de conexión fallido depósitos.",
                                                            overlay: true,
                                                            closeConfirm: true
                                                        });
                                                    } else {
                                                        for (var i = 0; i < result.recordset.length; i++) {
                                                            var valorArreglo = result.recordset[i];
                                                            if(valorArreglo[campos[0].idCliente].length < 31) {
                                                                if(valorArreglo[campos[0].nombreCliente].length < 81) {
                                                                    if(valorArreglo[campos[0].tipoPersona].length < 81) {
                                                                        if(valorArreglo[campos[0].tipoSubPersona].length < 81) {
                                                                            if(valorArreglo[campos[0].saldo].length < 21) {
                                                                                if(valorArreglo[campos[0].moneda].length < 31) {
                                                                                    if(valorArreglo[campos[0].tipoCuenta].length < 101) {
                                                                                        if(!isNaN(valorArreglo[campos[0].plazoResidual])) {
                                                                                            if(valorArreglo[campos[0].sucursal].length < 51) {
                                                                                                const transaction = new sql.Transaction( pool1 );
                                                                                                transaction.begin(err => {
                                                                                                    var rolledBack = false;
                                                                                                    transaction.on('rollback', aborted => {
                                                                                                        rolledBack = true;
                                                                                                    });
                                                                                                    const request = new sql.Request(transaction);
                                                                                                    request.query("insert into Depositos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, plazoResidual, sucursal, fecha) values ('"+valorArreglo[campos[0].idCliente]+"','"+valorArreglo[campos[0].nombreCliente]+"','"+valorArreglo[campos[0].tipoPersona]+"','"+valorArreglo[campos[0].tipoSubPersona]+"',"+valorArreglo[campos[0].saldo]+",'"+valorArreglo[campos[0].moneda]+"','"+valorArreglo[campos[0].tipoCuenta]+"',"+valorArreglo[campos[0].plazoResidual]+",'"+valorArreglo[campos[0].sucursal]+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
                                                                                            } else {
                                                                                                arregloErroresInsercion.push({b: "Deposito de: "+valorArreglo[campos[0].idCliente], c: "El valor del sucursal es mayor a 50 caracteres"});
                                                                                            }
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Deposito de: "+valorArreglo[campos[0].idCliente], c: "El valor del plazo residual no es un número valido"});
                                                                                        }
                                                                                    } else {
                                                                                        arregloErroresInsercion.push({b: "Deposito de: "+valorArreglo[campos[0].idCliente], c: "El valor del tipo de cuenta es mayor a 100 caracteres"});
                                                                                    }
                                                                                } else {
                                                                                    arregloErroresInsercion.push({b: "Deposito de: "+valorArreglo[campos[0].idCliente], c: "El valor de la moneda es mayor a 30 caracteres"});
                                                                                }
                                                                            } else {
                                                                                arregloErroresInsercion.push({b: "Deposito de: "+valorArreglo[campos[0].idCliente], c: "El valor del saldo es mayor a 20 caracteres"});
                                                                            }
                                                                        } else {
                                                                            arregloErroresInsercion.push({b: "Deposito de: "+valorArreglo[campos[0].idCliente], c: "El valor del tipo de sub-persona es mayor a 80 caracteres"});
                                                                        }
                                                                    } else {
                                                                        arregloErroresInsercion.push({b: "Deposito de: "+valorArreglo[campos[0].idCliente], c: "El valor del tipo de persona es mayor a 80 caracteres"});
                                                                    }
                                                                } else {
                                                                    arregloErroresInsercion.push({b: "Deposito de: "+valorArreglo[campos[0].idCliente], c: "El valor del nombre del cliente es mayor a 80 caracteres"});
                                                                }
                                                            } else {
                                                                arregloErroresInsercion.push({b: "Deposito de: "+valorArreglo[campos[0].idCliente], c: "El valor del identificador del cliente es mayor a 30 caracteres"});
                                                            }
                                                        };
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
                                                            message: "Intento de conexión fallido préstamos.",
                                                            overlay: true,
                                                            closeConfirm: true
                                                        });
                                                    } else {
                                                        for (var i = 0; i < result.recordset.length; i++) {
                                                            var valorArreglo = result.recordset[i];
                                                            var valorArregloFechaInicio = result.recordset[i].fechaInicio;
                                                            var valorArregloFechaFinal = result.recordset[i].fechaFinal;
                                                            console.log(valorArreglo)
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
                                                            console.log(valorArreglo[campos[0].sucursal])
                                                            if(valorArreglo[campos[0].idCliente].length < 31) {
                                                                if(valorArreglo[campos[0].nombreCliente].length < 81) {
                                                                    if(valorArreglo[campos[0].tipoPersona].length < 81) {
                                                                        if(valorArreglo[campos[0].tipoSubPersona].length < 81) {
                                                                            if(valorArreglo[campos[0].numPrestamo].toString().length < 51) {
                                                                                if(valorArreglo[campos[0].saldo].toString().length < 21) {
                                                                                    if(valorArreglo[campos[0].moneda].length < 31) {
                                                                                        if(valorArreglo[campos[0].montoOtorgado].toString().length < 21) {
                                                                                            if(valorArreglo[campos[0].tipoCuenta].length < 101) {
                                                                                                if(valorArreglo[campos[0].diasMora].toString().length < 21) {
                                                                                                    if(valorArreglo[campos[0].amortizacion].toString().length < 21) {
                                                                                                        if(valorArreglo[campos[0].sobregiro].toString().length < 21) {
                                                                                                            if(valorArreglo[campos[0].contingente].toString().length < 21) {
                                                                                                                if(valorArreglo[campos[0].clasificacionCartera].length < 3) {
                                                                                                                    if(valorArreglo[campos[0].tipoCredito].length < 81) {
                                                                                                                        if(valorArreglo[campos[0].pago30].toString().length < 21) {
                                                                                                                            if(valorArreglo[campos[0].pago60].toString().length < 21) {
                                                                                                                                if(valorArreglo[campos[0].pago90].toString().length < 21) {
                                                                                                                                    if(valorArreglo[campos[0].pago120].toString().length < 21) {
                                                                                                                                        if(valorArreglo[campos[0].clausulasRestrictivas].length > 0) {
                                                                                                                                            if(Date.parse(valorArregloFechaInicio)) {
                                                                                                                                                if(Date.parse(valorArregloFechaFinal)) {
                                                                                                                                                    if(valorArreglo[campos[0].sucursal].length < 51) {
                                                                                                                                                        const transaction = new sql.Transaction( pool1 );
                                                                                                                                                            transaction.begin(err => {
                                                                                                                                                                var rolledBack = false;
                                                                                                                                                                transaction.on('rollback', aborted => {
                                                                                                                                                                    rolledBack = true;
                                                                                                                                                                });
                                                                                                                                                                const request = new sql.Request(transaction);
                                                                                                                                                                request.query("insert into Prestamos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, tipoCuenta, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, clausulasRestrictivas, fechaInicio, fechaFinal, sucursal, fecha) values ('"+valorArreglo[campos[0].idCliente]+"','"+valorArreglo[campos[0].nombreCliente]+"','"+valorArreglo[campos[0].tipoPersona]+"','"+valorArreglo[campos[0].tipoSubPersona]+"',"+valorArreglo[campos[0].numPrestamo]+","+valorArreglo[campos[0].saldo]+",'"+valorArreglo[campos[0].moneda]+"',"+valorArreglo[campos[0].montoOtorgado]+",'"+valorArreglo[campos[0].tipoCuenta]+"',"+valorArreglo[campos[0].diasMora]+","+valorArreglo[campos[0].amortizacion]+","+valorArreglo[campos[0].sobregiro]+","+valorArreglo[campos[0].contingente]+",'"+valorArreglo[campos[0].clasificacionCartera]+"','"+valorArreglo[campos[0].tipoCredito]+"',"+valorArreglo[campos[0].pago30]+","+valorArreglo[campos[0].pago60]+","+valorArreglo[campos[0].pago90]+","+valorArreglo[campos[0].pago120]+",'"+valorArreglo[campos[0].clausulasRestrictivas]+"','"+formatDateCreation(new Date())+"','"+formatDateCreation(new Date())+"','"+valorArreglo[campos[0].sucursal]+"','"+formatDateCreation(new Date())+"')", (err, result) => {
                                                                                                                                                                    if (err) {
                                                                                                                                                                        if (!rolledBack) {
                                                                                                                                                                            console.log('error en rolledBack MainDB Variables');
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
                                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de sucursal es mayor a 50 caracteres"});
                                                                                                                                                    }
                                                                                                                                                } else {
                                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "La fecha final no es valida"});
                                                                                                                                                }
                                                                                                                                            } else {
                                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "La fecha inicial no es valida"});
                                                                                                                                            }
                                                                                                                                        } else {
                                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de clausulas restrictivas tiene que ser mayor a 0 caracteres"});
                                                                                                                                        }
                                                                                                                                    } else {
                                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de pago en 120 días es mayor a 20 caracteres"});
                                                                                                                                    }
                                                                                                                                } else {
                                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de pago en 90 días es mayor a 20 caracteres"});
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de pago en 60 días es mayor a 20 caracteres"});
                                                                                                                            }
                                                                                                                        } else {
                                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de pago en 30 días es mayor a 20 caracteres"});
                                                                                                                        }
                                                                                                                    } else {
                                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de tipo de crédito es mayor a 80 caracteres"});
                                                                                                                    }
                                                                                                                } else {
                                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de clasificación de cartera es mayor a 2 caracteres"});
                                                                                                                }
                                                                                                            } else {
                                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de contingente es mayor a 20 caracteres"});
                                                                                                            }
                                                                                                        } else {
                                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de sobregiro es mayor a 20 caracteres"});
                                                                                                        }
                                                                                                    } else {
                                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de amortización es mayor a 20 caracteres"});
                                                                                                    }
                                                                                                } else {
                                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de días de mora es mayor a 20 caracteres"});
                                                                                                }
                                                                                            } else {
                                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de tipo de cuenta es mayor a 100 caracteres"});
                                                                                            }
                                                                                        } else {
                                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de monto otorgado es mayor a 20 caracteres"});
                                                                                        }
                                                                                    } else {
                                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de moneda es mayor a 30 caracteres"});
                                                                                    }
                                                                                } else {
                                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de saldo es mayor a 20 caracteres"});
                                                                                }
                                                                            } else {
                                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de número de préstamo es mayor a 50 caracteres"});
                                                                            }
                                                                        } else {
                                                                            arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de tipo de sub-persona es mayor a 80 caracteres"});
                                                                        }
                                                                    } else {
                                                                        arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de tipo de persona es mayor a 80 caracteres"});
                                                                    }
                                                                } else {
                                                                    arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de nombre del cliente es mayor a 80 caracteres"});
                                                                }
                                                            } else {
                                                                arregloErroresInsercion.push({b: "Prestamo: "+valorArreglo[campos[0].numPrestamo], c: "El valor de identificador del cliente es mayor a 30 caracteres"});
                                                            }
                                                        };
                                                        $("body").overhang({
                                                            type: "success",
                                                            primary: "#40D47E",
                                                            accent: "#27AE60",
                                                            message: "Conexión realizada con exito.",
                                                            overlay: true
                                                        });
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

function formatDateCreation(date) {
    console.log(date);
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

function printErrorFile () {
    console.log('contadorInserciones')
    console.log(contadorInserciones)
    console.log('totalInserciones')
    console.log(totalInserciones)
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

function logout () {
	$("#app_root").empty();
    $("#app_root").load("src/login.html");
	session.defaultSession.clearStorageData([], (data) => {});
}

function goRCL () {
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
}

function goReports () {
    $("#app_root").empty();
    $("#app_root").load("src/reportes.html");
}