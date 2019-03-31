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
	if(err)
		console.log(err);
	else {
		console.log('pool loaded');
		loadConections();
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
var filepathFullLogo = '';
var filepathSmallLogo = '';
function loadVariablesIMG () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from Variables", (err, result) => {
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
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from Bases", (err, result) => {
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

/*function renderSelectConnections () {
    var content = '';
    for (var i = 0; i < arregloConecciones.length; i++) {
        content+='<option value="'+i+'">'+arregloConecciones[i].tipo+'</option>';
    };
    $("#selectDeConneciones").append(content);
}*/

function saveActivosDB (indexTabla) {
    var entrar = true, campo = '';
    if($("#cuentaConexionActivos").val().length == 0) {
        entrar = false;
        campo = 'número de cuenta';
    } else if($("#nombreConexionActivos").val().length == 0) {
        entrar = false;
        campo = 'nombre';
    } else if($("#saldoConexionActivos").val().length == 0) {
        entrar = false;
        campo = 'saldo';
    } else if($("#monedaConexionActivos").val().length == 0) {
        entrar = false;
        campo = 'moneda';
    } else if($("#sucursalConexionActivos").val().length == 0) {
        entrar = false;
        campo = 'agencia';
    }
    if(entrar) {
        var elemento = $("ul#myTabActivos li.active");
        var indice = elemento[0].value;
        //Indice 1 = Excel
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
            var cuenta = $("#cuentaConexionActivos").val();
            var nombre = $("#nombreConexionActivos").val();
            var saldo = $("#saldoConexionActivos").val();
            var moneda = $("#monedaConexionActivos").val();
            var sucursal = $("#sucursalConexionActivos").val();
            var nombreHoja = $("#activosTableExcel").val();
            var filaInicial = $("#activosExcelInicio").val();
            var filaFinal = $("#activosExcelFinal").val();
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
                                                                            if(sheet[cuenta+i] != undefined) {
                                                                                var activoCuenta = sheet[cuenta+i].v;
                                                                                var activoNombre = sheet[nombre+i].v;
                                                                                var activoSaldo = sheet[saldo+i].v;
                                                                                var activoMoneda = sheet[moneda+i].v;
                                                                                var activoSucursal = sheet[sucursal+i].v;
                                                                                activoCuenta = activoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoNombre = activoNombre.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoMoneda = activoMoneda.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                //activoMonto = activoMonto.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoSucursal = activoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoNombre = activoNombre.toLowerCase();
                                                                                activoNombre = UpperCasefirst(activoNombre);
                                                                                activoMoneda = activoMoneda.toLowerCase();
                                                                                activoMoneda = UpperCasefirst(activoMoneda);
                                                                                /*activoTipoCuenta = activoTipoCuenta.toLowerCase();
                                                                                activoTipoCuenta = UpperCasefirst(activoTipoCuenta);
                                                                                activoSucursal = activoSucursal.toLowerCase();
                                                                                activoSucursal = UpperCasefirst(activoSucursal);*/
                                                                                arregloDeActivos.push({cuenta: activoCuenta, nombre: activoNombre, saldo: activoSaldo, moneda: activoMoneda, sucursal: activoSucursal});
                                                                            }
                                                                        };
                                                                    } else {
                                                                        var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
                                                                        finalRow = parseInt(finalRow);
                                                                        for (var i = filaInicial; i <= finalRow; i++) {
                                                                            if(sheet[cuenta+i] != undefined) {
                                                                                var activoCuenta = sheet[cuenta+i].v;
                                                                                var activoNombre = sheet[nombre+i].v;
                                                                                var activoSaldo = sheet[saldo+i].v;
                                                                                var activoMoneda = sheet[moneda+i].v;
                                                                                var activoSucursal = sheet[sucursal+i].v;
                                                                                activoCuenta = activoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoNombre = activoNombre.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                //activoMonto = activoMonto.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoSucursal = activoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                activoNombre = activoNombre.toLowerCase();
                                                                                activoNombre = UpperCasefirst(activoNombre);
                                                                                activoMoneda = activoMoneda.toLowerCase();
                                                                                activoMoneda = UpperCasefirst(activoMoneda);
                                                                                /*activoTipoCuenta = activoTipoCuenta.toLowerCase();
                                                                                activoTipoCuenta = UpperCasefirst(activoTipoCuenta);
                                                                                activoSucursal = activoSucursal.toLowerCase();
                                                                                activoSucursal = UpperCasefirst(activoSucursal);*/
                                                                                arregloDeActivos.push({cuenta: activoCuenta, nombre: activoNombre, saldo: activoSaldo, moneda: activoMoneda, sucursal: activoSucursal});
                                                                            }
                                                                        };
                                                                    }
                                                                    for (var i = 0; i < arregloDeActivos.length; i++) {
                                                                        createAsset( arregloDeActivos[i] );
                                                                    };
                                                                    $("body").overhang({
                                                                        type: "success",
                                                                        primary: "#40D47E",
                                                                        accent: "#27AE60",
                                                                        message: "Activos importados con éxito.",
                                                                        duration: 2,
                                                                        overlay: true
                                                                    });
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
                    console.log('error en rolledBack MainDB Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                        console.log('activo');
                        console.log(activo);
                        console.log('activo');
                        $("body").overhang({
                            type: "error",
                            primary: "#40D47E",
                            accent: "#27AE60",
                            message: "Error al crear activo.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed MainDB Variables");
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
        usuario = $("#activosUserDB").val();
        constrasena = $("#activosPasswordDB").val();
        server = $("#activosServerDB").val();
        basedatos = $("#activosDataBaseDB").val();
        tabla = $("#activosTableDB").val();
    } else if(indexTabla == 1) {
        arreglo = 'arregloDepositos';
        usuario = $("#depositosUserDB").val();
        constrasena = $("#depositosPasswordDB").val();
        server = $("#depositosServerDB").val();
        basedatos = $("#depositosDataBaseDB").val();
        tabla = $("#depositosTableDB").val();
    } else if(indexTabla == 2) {
        arreglo = 'arregloPrestamos';
        usuario = $("#prestamosUserDB").val();
        constrasena = $("#prestamosPasswordDB").val();
        server = $("#prestamosServerDB").val();
        basedatos = $("#prestamosDataBaseDB").val();
        tabla = $("#prestamosTableDB").val();
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
                                    })
                                    const request = new sql.Request(transaction);
                                    request.query("insert into Bases (arreglo, usuario, constrasena, server, basedatos, tabla, tipo) values ('"+arreglo+"','"+usuario+"','"+constrasena+"','"+server+"','"+basedatos+"','"+tabla+"','"+tipo+"')", (err, result) => {
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
        usuario = $("#activosUserDB").val();
        constrasena = $("#activosPasswordDB").val();
        server = $("#activosServerDB").val();
        basedatos = $("#activosDataBaseDB").val();
        tabla = $("#activosTableDB").val();
    } else if(indexTabla == 1) {
        arreglo = 'arregloDepositos';
        usuario = $("#depositosUserDB").val();
        constrasena = $("#depositosPasswordDB").val();
        server = $("#depositosServerDB").val();
        basedatos = $("#depositosDataBaseDB").val();
        tabla = $("#depositosTableDB").val();
    } else if(indexTabla == 2) {
        arreglo = 'arregloPrestamos';
        usuario = $("#prestamosUserDB").val();
        constrasena = $("#prestamosPasswordDB").val();
        server = $("#prestamosServerDB").val();
        basedatos = $("#prestamosDataBaseDB").val();
        tabla = $("#prestamosTableDB").val();
    }
    if(arreglo.length>0 && arreglo.length<21){
        if(usuario.length>0 && usuario.length<101){
            if(constrasena.length>0 && constrasena.length<101){
                if(server.length>0 && server.length<101){
                    if(basedatos.length>0 && basedatos.length<101){
                        if(tabla.length>0 && tabla.length<101){
                            const transaction = new sql.Transaction( pool1 );
                            transaction.begin(err => {
                                var rolledBack = false
                         
                                transaction.on('rollback', aborted => {
                                    // emited with aborted === true
                             
                                    rolledBack = true
                                })
                                const request = new sql.Request(transaction);
                                request.query("update Bases set arreglo = '"+arreglo+"', usuario = '"+usuario+"', constrasena = '"+constrasena+"', server = '"+server+"', basedatos = '"+basedatos+"', tabla = '"+tabla+"' where ID = "+id, (err, result) => {
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
        var cuenta = $("#cuentaConexionActivos").val();
        var nombre = $("#nombreConexionActivos").val();
        var saldo = $("#saldoConexionActivos").val();
        var moneda = $("#monedaConexionActivos").val();
        var tipoCuenta = $("#tipoCuentaConexionActivos").val();
        var sucursal = $("#sucursalConexionActivos").val();
        if(cuenta.length > 0) {
            if(nombre.length > 0) {
                if(saldo.length > 0) {
                    if(moneda.length > 0) {
                        if(tipoCuenta.length > 0) {
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
                                            console.log('error en rolledBack2 MainDB Variables');
                                            console.log(err);
                                        }  else {
                                            console.log("Transaction committed MainDB Variables =====");
                                            console.log(result);
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
                                message: "Ingrese un valor para el nombre de la columna de el tipo de cuenta.",
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
        var idcliente = $("#cuentaConexionActivos").val();
        var nombrecliente = $("#nombreConexionActivos").val();
        var tipoPersona = $("#tipoPersonaClienteConexionDepositos").val();
        var tipoSubPersona = $("#tipoSubPersonaClienteConexionDepositos").val();
        var saldo = $("#saldoConexionActivos").val();
        var moneda = $("#monedaConexionDepositos").val();
        var tipoCuenta = $("#tipoCuentaConexionDepositos").val();
        var sucursal = $("#sucursalConexionActivos").val();
        if(idcliente.length > 0) {
            if(nombrecliente.length > 0) {
                if(tipoPersona.length > 0) {
                    if(tipoSubPersona.length > 0) {
                        if(saldo.length > 0) {
                            if(moneda.length > 0) {
                                if(tipoCuenta.length > 0) {
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
                                                    console.log('error en rolledBack2 MainDB Variables');
                                                    console.log(err);
                                                }  else {
                                                    console.log("Transaction committed MainDB Variables =====");
                                                    console.log(result);
                                                    for (var i = 0; i < result.recordset.length; i++) {
                                                        var valorDepositos = result.recordset[i];
                                                        const transaction = new sql.Transaction( pool1 );
                                                        transaction.begin(err => {
                                                            var rolledBack = false;
                                                            transaction.on('rollback', aborted => {
                                                                rolledBack = true;
                                                            });
                                                            const request = new sql.Request(transaction);
                                                            request.query("insert into Depositos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, sucursal, fecha) values ('"+valorDepositos[idcliente]+"','"+valorDepositos[nombrecliente]+"','"+valorDepositos[tipoPersona]+"','"+valorDepositos[tipoSubPersona]+"',"+valorDepositos[saldo]+",'"+valorDepositos[moneda]+"','"+valorDepositos[tipoCuenta]+"','"+valorDepositos[sucursal]+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
        var identificador = $("#idClienteConexionPrestamos").val();
        var nombre = $("#nombreClienteConexionPrestamos").val();
        var tipoPersona = $("#tipoPersonaClienteConexionPrestamos").val();
        var tipoSubPersona = $("#tipoSubPersonaClienteConexionPrestamos").val();
        var numPrestamo = $("#numPrestamoConexionPrestamos").val();
        var saldo = $("#saldoConexionPrestamos").val();
        var moneda = $("#monedaConexionPrestamos").val();
        var tipoCuenta = $("#tipoCuentaConexionPrestamos").val();
        var diasMora = $("#moraConexionPrestamos").val();
        var amortizaciones = $("#amortizacionesConexionPrestamos").val();
        var sobregiro = $("#sobregirosConexionPrestamos").val();
        var contingente = $("#contingenteConexionPrestamos").val();
        var clasificacionCartera = $("#clasificacionCarteraConexionPrestamos").val();
        var tipoCredito = $("#tipoCreditoConexionPrestamos").val();
        var esperado30 = $("#esperado30ConexionPrestamos").val();
        var esperado60 = $("#esperado60ConexionPrestamos").val();
        var esperado90 = $("#esperado90ConexionPrestamos").val();
        var esperado120 = $("#esperado120ConexionPrestamos").val();
        var creditosRefinanciados = $("#creditosRefinanciadosConexionPrestamos").val();
        var clausulasRestrictivas = $("#clausulasRestrictivasConexionPrestamos").val();
        var fechaInicio = $("#fechaInicioConexionPrestamos").val();
        var fechaFinal = $("#fechaExpiracionConexionPrestamos").val();
        var montoOtorgado = $("#montoOtorgadoConexionPrestamos").val();
        var sucursal = $("#sucursalConexionPrestamos").val();
        var nombreHoja = $("#prestamosTableExcel").val();
        var filaInicial = $("#prestamosExcelInicio").val();
        var filaFinal = $("#prestamosExcelFinal").val();
        const pool = new sql.ConnectionPool({
            user: usuario,
            password: constrasena,
            server: server,
            database: basedatos
        });

        pool.connect(err => {
            pool.request().query("select * from "+tabla, (err, result) => {
                if (err) {
                    console.log('error en rolledBack2 MainDB Variables');
                    console.log(err);
                }  else {
                    console.log("Transaction committed MainDB Variables =====");
                    console.log(result);
                    for (var i = 0; i < result.recordset.length; i++) {
                        var valorDepositos = result.recordset[i];
                        const transaction = new sql.Transaction( pool1 );
                        transaction.begin(err => {
                            var rolledBack = false;
                            transaction.on('rollback', aborted => {
                                rolledBack = true;
                            });
                            const request = new sql.Request(transaction);
                            request.query("insert into Prestamos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, tipoCuenta, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, creditosRefinanciados, clausulasRestrictivas, fechaInicio, fechaFinal, sucursal, fecha) values ('"+valorDepositos[identificador]+"','"+valorDepositos[nombre]+"','"+valorDepositos[tipoPersona]+"','"+valorDepositos[tipoSubPersona]+"',"+valorDepositos[numPrestamo]+","+valorDepositos[saldo]+",'"+valorDepositos[moneda]+"',"+valorDepositos[montoOtorgado]+",'"+valorDepositos[tipoCuenta]+"',"+valorDepositos[diasMora]+","+valorDepositos[amortizaciones]+","+valorDepositos[sobregiro]+","+valorDepositos[contingente]+",'"+valorDepositos[clasificacionCartera]+"','"+valorDepositos[tipoCredito]+"',"+valorDepositos[esperado30]+","+valorDepositos[esperado60]+","+valorDepositos[esperado90]+","+valorDepositos[esperado120]+",'"+valorDepositos[creditosRefinanciados]+"','"+valorDepositos[clausulasRestrictivas]+"','"+formatDateCreation(valorDepositos[fechaInicio])+"','"+formatDateCreation(valorDepositos[fechaFinal])+"','"+valorDepositos[sucursal]+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
                                    });
                                }
                            });
                        }); // fin transaction
                    };
                }
            });
        }); // fin transaction2
    }
}

function saveDepositosDB (indexTabla) {
    var entrar = true, campo = '';
    if($("#idClienteConexionDepositos").val().length == 0) {
        entrar = false;
        campo = 'id del cliente';
    } else if($("#nombreClienteConexionDepositos").val().length == 0) {
        entrar = false;
        campo = 'nombre del cliente';
    } else if($("#tipoPersonaClienteConexionDepositos").val().length == 0) {
        entrar = false;
        campo = 'tipo de persona';
    } else if($("#tipoSubPersonaClienteConexionDepositos").val().length == 0) {
        entrar = false;
        campo = 'tipo de sub-persona';
    } else if($("#saldoConexionDepositos").val().length == 0) {
        entrar = false;
        campo = 'saldo';
    } else if($("#monedaConexionDepositos").val().length == 0) {
        entrar = false;
        campo = 'moneda';
    } else if($("#tipoCuentaConexionDepositos").val().length == 0) {
        entrar = false;
        campo = 'tipo de cuenta';
    } else if($("#sucursalConexionDepositos").val().length == 0) {
        entrar = false;
        campo = 'agencia';
    }
    if(entrar) {
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
            var identificador = $("#idClienteConexionDepositos").val();
            var nombre = $("#nombreClienteConexionDepositos").val();
            var tipoPersona = $("#tipoPersonaClienteConexionDepositos").val();
            var tipoSubPersona = $("#tipoSubPersonaClienteConexionDepositos").val();
            var saldo = $("#saldoConexionDepositos").val();
            var moneda = $("#monedaConexionDepositos").val();
            var tipoCuenta = $("#tipoCuentaConexionDepositos").val();
            var sucursal = $("#sucursalConexionDepositos").val();
            var nombreHoja = $("#depositosTableExcel").val();
            var filaInicial = $("#depositosExcelInicio").val();
            var filaFinal = $("#depositosExcelFinal").val();
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
                                                                                            sucursal = sucursal.toUpperCase();
                                                                                            filaInicial = parseInt(filaInicial);
                                                                                            filaFinal = parseInt(filaFinal);
                                                                                            if(filaFinal != 0) {
                                                                                                for (var i = filaInicial; i <= filaFinal; i++) {
                                                                                                    if(sheet[identificador+i] != undefined) {
                                                                                                        var depositoIDCLiente = sheet[identificador+i].v;
                                                                                                        var depositoNombreCliente = sheet[nombre+i].v;
                                                                                                        var depositoTipoPersona = sheet[tipoPersona+i].v;
                                                                                                        var depositoTipoSubPersona = sheet[tipoSubPersona+i].v;
                                                                                                        var depositoTotalDepositos = sheet[saldo+i].v;
                                                                                                        var depositoMoneda = sheet[moneda+i].v;
                                                                                                        var depositoTipoCuenta = sheet[tipoCuenta+i].v;
                                                                                                        var depositoSucursal = sheet[sucursal+i].v;
                                                                                                        //depositoIDCLiente = depositoIDCLiente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                        depositoNombreCliente = depositoNombreCliente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                        depositoTipoCuenta = depositoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                        //activoMonto = activoMonto.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                        depositoSucursal = depositoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                        depositoNombreCliente = depositoNombreCliente.toLowerCase();
                                                                                                        depositoNombreCliente = UpperCasefirst(depositoNombreCliente);
                                                                                                        /*depositoTipoCuenta = depositoTipoCuenta.toLowerCase();
                                                                                                        depositoTipoCuenta = UpperCasefirst(depositoTipoCuenta);
                                                                                                        depositoSucursal = depositoSucursal.toLowerCase();
                                                                                                        depositoSucursal = UpperCasefirst(depositoSucursal);*/
                                                                                                        arregloDeDepositos.push({idCLiente: depositoIDCLiente, nombreCliente: depositoNombreCliente, tipoPersona: depositoTipoPersona, tipoSubPersona: depositoTipoSubPersona, saldo: depositoTotalDepositos, moneda: depositoMoneda, tipoCuenta: depositoTipoCuenta, sucursal: depositoSucursal});
                                                                                                    }
                                                                                                };
                                                                                            } else {
                                                                                                var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
                                                                                                finalRow = parseInt(finalRow);
                                                                                                for (var i = filaInicial; i <= finalRow; i++) {
                                                                                                    if(sheet[identificador+i] != undefined) {
                                                                                                        var depositoIDCLiente = sheet[identificador+i].v;
                                                                                                        var depositoNombreCliente = sheet[nombre+i].v;
                                                                                                        var depositoTipoPersona = sheet[tipoPersona+i].v;
                                                                                                        var depositoTipoSubPersona = sheet[tipoSubPersona+i].v;
                                                                                                        var depositoTotalDepositos = sheet[saldo+i].v;
                                                                                                        var depositoMoneda = sheet[moneda+i].v;
                                                                                                        var depositoTipoCuenta = sheet[tipoCuenta+i].v;
                                                                                                        var depositoSucursal = sheet[sucursal+i].v;
                                                                                                        //depositoIDCLiente = depositoIDCLiente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                        depositoNombreCliente = depositoNombreCliente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                        depositoTipoCuenta = depositoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                        //activoMonto = activoMonto.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                        depositoSucursal = depositoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                        depositoNombreCliente = depositoNombreCliente.toLowerCase();
                                                                                                        depositoNombreCliente = UpperCasefirst(depositoNombreCliente);
                                                                                                        /*depositoTipoCuenta = depositoTipoCuenta.toLowerCase();
                                                                                                        depositoTipoCuenta = UpperCasefirst(depositoTipoCuenta);
                                                                                                        depositoSucursal = depositoSucursal.toLowerCase();
                                                                                                        depositoSucursal = UpperCasefirst(depositoSucursal);*/
                                                                                                        arregloDeDepositos.push({idCLiente: depositoIDCLiente, nombreCliente: depositoNombreCliente, tipoPersona: depositoTipoPersona, tipoSubPersona: depositoTipoSubPersona, saldo: depositoTotalDepositos, moneda: depositoMoneda, tipoCuenta: depositoTipoCuenta, sucursal: depositoSucursal});
                                                                                                    }
                                                                                                };
                                                                                            }
                                                                                            for (var i = 0; i < arregloDeDepositos.length; i++) {
                                                                                                createDeposit( arregloDeDepositos[i] );
                                                                                            };
                                                                                            $("body").overhang({
                                                                                                type: "success",
                                                                                                primary: "#40D47E",
                                                                                                accent: "#27AE60",
                                                                                                message: "Depositos importados con éxito.",
                                                                                                overlay: true
                                                                                            });
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
        request.query("insert into Depositos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, sucursal, fecha) values ('"+deposito.idCliente+"','"+deposito.nombreCliente+"','"+deposito.tipoPersona+"','"+deposito.tipoSubPersona+"',"+deposito.saldo+",'"+deposito.moneda+"','"+deposito.tipoCuenta+"','"+deposito.sucursal+"','"+formatDateCreation(new Date())+"')", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack MainDB Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                        $("body").overhang({
                            type: "error",
                            primary: "#40D47E",
                            accent: "#27AE60",
                            message: "Error al crear depositos.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed MainDB Variables");
                });
            }
        });
    }); // fin transaction
}

function savePrestamosDB (indexTabla) {
    var entrar = true, campo = '';
    if($("#idClienteConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'id del cliente';
    } else if($("#nombreClienteConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'nombre del cliente';
    } else if($("#tipoPersonaClienteConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'tipo de persona';
    } else if($("#tipoSubPersonaClienteConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'tipo de sub-persona';
    } else if($("#numPrestamoConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'número de prestamo';
    } else if($("#saldoConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'saldo';
    } else if($("#monedaConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'moneda';
    } else if($("#tipoCuentaConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'tipo de cuenta';
    } else if($("#moraConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'días de mora';
    } else if($("#amortizacionesConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'amortización';
    } else if($("#sobregirosConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'sobregiro';
    } else if($("#contingenteConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'contingente';
    } else if($("#clasificacionCarteraConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'clasificación de cartéra';
    } else if($("#montoOtorgadoConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'monto otorgado';
    } else if($("#esperado30ConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'pago esperado en 30 días';
    } else if($("#esperado60ConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'pago esperado en 60 días';
    } else if($("#esperado90ConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'pago esperado en 90 días';
    } else if($("#esperado120ConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'pago esperado en 120 días';
    } else if($("#creditosRefinanciadosConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'créditos refinanciados';
    } else if($("#clausulasRestrictivasConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'clausulas restrictivas';
    } else if($("#fechaInicioConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'fecha de inicio del préstamo';
    } else if($("#fechaExpiracionConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'fecha final del préstamo';
    } else if($("#sucursalConexionPrestamos").val().length == 0) {
        entrar = false;
        campo = 'agencia';
    }
    if(entrar) {
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
            var identificador = $("#idClienteConexionPrestamos").val();
            var nombre = $("#nombreClienteConexionPrestamos").val();
            var tipoPersona = $("#tipoPersonaClienteConexionPrestamos").val();
            var tipoSubPersona = $("#tipoSubPersonaClienteConexionPrestamos").val();
            var numPrestamo = $("#numPrestamoConexionPrestamos").val();
            var saldo = $("#saldoConexionPrestamos").val();
            var moneda = $("#monedaConexionPrestamos").val();
            var tipoCuenta = $("#tipoCuentaConexionPrestamos").val();
            var diasMora = $("#moraConexionPrestamos").val();
            var amortizaciones = $("#amortizacionesConexionPrestamos").val();
            var sobregiro = $("#sobregirosConexionPrestamos").val();
            var contingente = $("#contingenteConexionPrestamos").val();
            var clasificacionCartera = $("#clasificacionCarteraConexionPrestamos").val();
            var tipoCredito = $("#tipoCreditoConexionPrestamos").val();
            var esperado30 = $("#esperado30ConexionPrestamos").val();
            var esperado60 = $("#esperado60ConexionPrestamos").val();
            var esperado90 = $("#esperado90ConexionPrestamos").val();
            var esperado120 = $("#esperado120ConexionPrestamos").val();
            var creditosRefinanciados = $("#creditosRefinanciadosConexionPrestamos").val();
            var clausulasRestrictivas = $("#clausulasRestrictivasConexionPrestamos").val();
            var fechaInicio = $("#fechaInicioConexionPrestamos").val();
            var fechaFinal = $("#fechaExpiracionConexionPrestamos").val();
            var montoOtorgado = $("#montoOtorgadoConexionPrestamos").val();
            var sucursal = $("#sucursalConexionDepositos").val();
            var nombreHoja = $("#prestamosTableExcel").val();
            var filaInicial = $("#prestamosExcelInicio").val();
            var filaFinal = $("#prestamosExcelFinal").val();
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
                                                                                    if(isNaN(creditosRefinanciados)) {
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
                                                                                                                            creditosRefinanciados = creditosRefinanciados.toUpperCase();
                                                                                                                            clausulasRestrictivas = clausulasRestrictivas.toUpperCase();
                                                                                                                            fechaInicio = fechaInicio.toUpperCase();
                                                                                                                            fechaFinal = fechaFinal.toUpperCase();
                                                                                                                            montoOtorgado = montoOtorgado.toUpperCase();
                                                                                                                            sucursal = sucursal.toUpperCase();
                                                                                                                            filaInicial = parseInt(filaInicial);
                                                                                                                            filaFinal = parseInt(filaFinal);
                                                                                                                            if(filaFinal != 0) {
                                                                                                                                for (var i = filaInicial; i <= filaFinal; i++) {
                                                                                                                                    if(sheet[identificador+i] != undefined) {
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
                                                                                                                                        var prestamoCreditosRefinanciados = sheet[creditosRefinanciados+i].v;
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
                                                                                                                                        arregloDePrestamos.push({idCliente: prestamoIDCLiente, nombreCliente: prestamoNombreCliente, tipoPersona: prestamoTipoPersona, tipoSubPersona: prestamoTipoSubPersona, numPrestamo: prestamoNumPrestamo, saldo: prestamoTotalDepositos, moneda: prestamoMoneda, tipoCuenta: prestamoTipoCuenta, montoOtorgado: prestamoMontoOtorgado, diasMora: prestamoDiasMora, amortizacion: prestamoAmortizaciones, sobregiro: prestamoSobregiro, contingente: prestamoContingente, clasificacionCartera: prestamoClasificacionCartera, tipoCredito: prestamoTipoCredito, pago30: prestamoEsperado30, pago60: prestamoEsperado60, pago90: prestamoEsperado90, pago120: prestamoEsperado120, creditosRefinanciados: prestamoCreditosRefinanciados, clausulasRestrictivas: prestamoClausulasRestrictivas, fechaInicio: formatDateCreation(prestamoFechaInicio), fechaFinal: formatDateCreation(prestamoFechaFinal), sucursal: prestamoSucursal});
                                                                                                                                    }
                                                                                                                                };
                                                                                                                            } else {
                                                                                                                                var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
                                                                                                                                finalRow = parseInt(finalRow);
                                                                                                                                for (var i = filaInicial; i <= finalRow; i++) {
                                                                                                                                    if(sheet[identificador+i] != undefined) {
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
                                                                                                                                        var prestamoCreditosRefinanciados = sheet[creditosRefinanciados+i].v;
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
                                                                                                                                        arregloDePrestamos.push({idCliente: prestamoIDCLiente, nombreCliente: prestamoNombreCliente, tipoPersona: prestamoTipoPersona, tipoSubPersona: prestamoTipoSubPersona, numPrestamo: prestamoNumPrestamo, saldo: prestamoTotalDepositos, moneda: prestamoMoneda, tipoCuenta: prestamoTipoCuenta, montoOtorgado: prestamoMontoOtorgado, diasMora: prestamoDiasMora, amortizacion: prestamoAmortizaciones, sobregiro: prestamoSobregiro, contingente: prestamoContingente, clasificacionCartera: prestamoClasificacionCartera, tipoCredito: prestamoTipoCredito, pago30: prestamoEsperado30, pago60: prestamoEsperado60, pago90: prestamoEsperado90, pago120: prestamoEsperado120, creditosRefinanciados: prestamoCreditosRefinanciados, clausulasRestrictivas: prestamoClausulasRestrictivas, fechaInicio: formatDateCreation(prestamoFechaInicio), fechaFinal: formatDateCreation(prestamoFechaFinal), sucursal: prestamoSucursal});
                                                                                                                                    }
                                                                                                                                };
                                                                                                                            }
                                                                                                                            for (var i = 0; i < arregloDePrestamos.length; i++) {
                                                                                                                                createLoan( arregloDePrestamos[i] );
                                                                                                                            };
                                                                                                                            $("body").overhang({
                                                                                                                                type: "success",
                                                                                                                                primary: "#40D47E",
                                                                                                                                accent: "#27AE60",
                                                                                                                                message: "Préstamos importados con éxito.",
                                                                                                                                overlay: true
                                                                                                                            });
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
                                                                                            message: "Ingrese una letra para la columna de créditos refinanciados.",
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
        request.query("insert into Prestamos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, tipoCuenta, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, creditosRefinanciados, clausulasRestrictivas, fechaInicio, fechaFinal, sucursal, fecha) values ('"+prestamo.idCliente+"','"+prestamo.nombreCliente+"','"+prestamo.tipoPersona+"','"+prestamo.tipoSubPersona+"',"+prestamo.numPrestamo+","+prestamo.saldo+",'"+prestamo.moneda+"',"+prestamo.montoOtorgado+",'"+prestamo.tipoCuenta+"',"+prestamo.diasMora+","+prestamo.amortizacion+","+prestamo.sobregiro+","+prestamo.contingente+",'"+prestamo.clasificacionCartera+"','"+prestamo.tipoCredito+"',"+prestamo.pago30+","+prestamo.pago60+","+prestamo.pago90+","+prestamo.pago120+",'"+prestamo.creditosRefinanciados+"','"+prestamo.clausulasRestrictivas+"','"+formatDateCreation(prestamo.fechaInicio)+"','"+formatDateCreation(prestamo.fechaFinal)+"','"+prestamo.sucursal+"','"+formatDateCreation(new Date())+"')", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack MainDB Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                        $("body").overhang({
                            type: "error",
                            primary: "#40D47E",
                            accent: "#27AE60",
                            message: "Error al crear depositos.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed MainDB Variables");
                });
            }
        });
    }); // fin transaction
}

function saveFields (tipoDB, indexTabla) {
    if(indexTabla == 0) {
        var cuenta = $("#cuentaConexionActivos").val();
        var nombre = $("#nombreConexionActivos").val();
        var saldo = $("#saldoConexionActivos").val();
        var moneda = $("#monedaConexionActivos").val();
        var sucursal = $("#sucursalConexionActivos").val();
        var tipo = tipoDB;

        const transaction = new sql.Transaction( pool1 );
        transaction.begin(err => {
            var rolledBack = false
     
            transaction.on('rollback', aborted => {
                // emited with aborted === true
         
                rolledBack = true
            })
            const request = new sql.Request(transaction);
            request.query("select * from Activos_Campos", (err, result) => {
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
                                            console.log('error en rolledBack MainDB Variables');
                                            transaction.rollback(err => {
                                                console.log('error en rolledBack');
                                                console.log(err);
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error al crear activo.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("Transaction committed MainDB Variables");
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
                                            console.log('error en rolledBack MainDB Variables');
                                            transaction.rollback(err => {
                                                console.log('error en rolledBack');
                                                console.log(err);
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error al crear activo.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("Transaction committed MainDB Variables");
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
        var idCliente = $("#idClienteConexionDepositos").val();
        var nombreCliente = $("#nombreClienteConexionDepositos").val();
        var tipoPersona = $("#tipoPersonaClienteConexionDepositos").val();
        var tipoSubPersona = $("#tipoSubPersonaClienteConexionDepositos").val();
        var saldo = $("#saldoConexionDepositos").val();
        var moneda = $("#monedaConexionDepositos").val();
        var tipoCuenta = $("#tipoCuentaConexionDepositos").val();
        var sucursal = $("#sucursalConexionDepositos").val();
        var tipo = tipoDB;
        const transaction = new sql.Transaction( pool1 );
        transaction.begin(err => {
            var rolledBack = false
     
            transaction.on('rollback', aborted => {
                // emited with aborted === true
                rolledBack = true
            });
            const request = new sql.Request(transaction);
            request.query("select * from Depositos_Campos", (err, result) => {
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
                                request.query("update Depositos_Campos set values idCliente = '"+idCliente+"', nombreCliente = '"+nombreCliente+"', tipoPersona = '"+tipoPersona+"', tipoSubPersona = '"+tipoSubPersona+"', saldo = '"+saldo+"', moneda = '"+moneda+"', tipoCuenta = '"+tipoCuenta+"', sucursal = '"+sucursal+"' where ID = "+existe[0].ID, (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            console.log('error en rolledBack MainDB Variables');
                                            transaction.rollback(err => {
                                                console.log('error en rolledBack');
                                                console.log(err);
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error al crear activo.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("Transaction committed MainDB Variables");
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
                                request.query("insert into Depositos_Campos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, sucursal, tipo) values ('"+idCliente+"','"+nombreCliente+"','"+tipoPersona+"','"+tipoSubPersona+"','"+saldo+"','"+moneda+"','"+tipoCuenta+"','"+sucursal+"','"+tipo+"')", (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            console.log('error en rolledBack MainDB Variables');
                                            transaction.rollback(err => {
                                                console.log('error en rolledBack');
                                                console.log(err);
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error al crear activo.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("Transaction committed MainDB Variables");
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
        var idCliente = $("#idClienteConexionPrestamos").val();
        var nombreCliente = $("#nombreClienteConexionPrestamos").val();
        var tipoPersona = $("#tipoPersonaClienteConexionPrestamos").val();
        var tipoSubPersona = $("#tipoSubPersonaClienteConexionPrestamos").val();
        var numPrestamo = $("#numPrestamoConexionPrestamos").val();
        var saldo = $("#saldoConexionPrestamos").val();
        var moneda = $("#monedaConexionPrestamos").val();
        var tipoCuenta = $("#tipoCuentaConexionPrestamos").val();
        var diasMora = $("#moraConexionPrestamos").val();
        var amortizaciones = $("#amortizacionesConexionPrestamos").val();
        var sobregiro = $("#sobregirosConexionPrestamos").val();
        var contingente = $("#contingenteConexionPrestamos").val();
        var clasificacionCartera = $("#clasificacionCarteraConexionPrestamos").val();
        var tipoCredito = $("#tipoCreditoConexionPrestamos").val();
        var esperado30 = $("#esperado30ConexionPrestamos").val();
        var esperado60 = $("#esperado60ConexionPrestamos").val();
        var esperado90 = $("#esperado90ConexionPrestamos").val();
        var esperado120 = $("#esperado120ConexionPrestamos").val();
        var creditosRefinanciados = $("#creditosRefinanciadosConexionPrestamos").val();
        var clausulasRestrictivas = $("#clausulasRestrictivasConexionPrestamos").val();
        var fechaInicio = $("#fechaInicioConexionPrestamos").val();
        var fechaFinal = $("#fechaExpiracionConexionPrestamos").val();
        var montoOtorgado = $("#montoOtorgadoConexionPrestamos").val();
        var sucursal = $("#sucursalConexionPrestamos").val();
        var tipo = tipoDB;
        const transaction = new sql.Transaction( pool1 );
        transaction.begin(err => {
            var rolledBack = false
     
            transaction.on('rollback', aborted => {
                // emited with aborted === true
                rolledBack = true
            });
            const request = new sql.Request(transaction);
            request.query("select * from Prestamos_Campos", (err, result) => {
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
                                request.query("update Prestamos_Campos set values idCliente = '"+idCliente+"', nombreCliente = '"+nombreCliente+"', tipoPersona = '"+tipoPersona+"', tipoSubPersona = '"+tipoSubPersona+"', numPrestamo = '"+numPrestamo+"', saldo = '"+saldo+"', moneda = '"+moneda+"', montoOtorgado = '"+montoOtorgado+"', tipoCuenta = '"+tipoCuenta+"', diasMora = '"+diasMora+"', amortizacion = '"+amortizaciones+"', sobregiro = '"+sobregiro+"', contingente = '"+contingente+"', clasificacionCartera = '"+clasificacionCartera+"', tipoCredito = '"+tipoCredito+"', pago30 = '"+esperado30+"', pago60 = '"+esperado60+"', pago90 = '"+esperado90+"', pago120 = '"+esperado120+"', creditosRefinanciados = '"+creditosRefinanciados+"', clausulasRestrictivas = '"+clausulasRestrictivas+"', fechaInicio = '"+fechaInicio+"', fechaFinal = '"+fechaFinal+"', sucursal = '"+sucursal+"' where ID = "+existe[0].ID, (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            console.log('error en rolledBack MainDB Variables');
                                            transaction.rollback(err => {
                                                console.log('error en rolledBack');
                                                console.log(err);
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error al crear activo.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("Transaction committed MainDB Variables");
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
                                request.query("insert into Prestamos_Campos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, tipoCuenta, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, creditosRefinanciados, clausulasRestrictivas, fechaInicio, fechaFinal, sucursal, tipo) values ('"+idCliente+"','"+nombreCliente+"','"+tipoPersona+"','"+tipoSubPersona+"','"+numPrestamo+"','"+saldo+"','"+moneda+"','"+montoOtorgado+"','"+tipoCuenta+"','"+diasMora+"','"+amortizaciones+"','"+sobregiro+"','"+contingente+"','"+clasificacionCartera+"','"+tipoCredito+"','"+esperado30+"','"+esperado60+"','"+esperado90+"','"+esperado120+"','"+creditosRefinanciados+"','"+clausulasRestrictivas+"','"+fechaInicio+"','"+fechaFinal+"','"+sucursal+"','"+tipo+"')", (err, result) => {
                                    if (err) {
                                        if (!rolledBack) {
                                            console.log('error en rolledBack MainDB Variables');
                                            transaction.rollback(err => {
                                                console.log('error en rolledBack');
                                                console.log(err);
                                                $("body").overhang({
                                                    type: "error",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Error al crear activo.",
                                                    overlay: true,
                                                    closeConfirm: true
                                                });
                                            });
                                        }
                                    }  else {
                                        transaction.commit(err => {
                                            // ... error checks
                                            console.log("Transaction committed MainDB Variables");
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
        user = $("#activosUserDB").val();
        password = $("#activosPasswordDB").val();
        server = $("#activosServerDB").val();
        database = $("#activosDataBaseDB").val();
        table = $("#activosTableDB").val();
    } else if(indexTabla == 1) {
        arreglo = 'arregloDepositos';
        user = $("#depositosUserDB").val();
        password = $("#depositosPasswordDB").val();
        server = $("#depositosServerDB").val();
        database = $("#depositosDataBaseDB").val();
        table = $("#depositosTableDB").val();
    } else if(indexTabla == 2) {
        arreglo = 'arregloPrestamos';
        user = $("#prestamosUserDB").val();
        password = $("#prestamosPasswordDB").val();
        server = $("#prestamosServerDB").val();
        database = $("#prestamosDataBaseDB").val();
        table = $("#prestamosTableDB").val();
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
    var tipoSeleccionConnecion = $("#selectDeConneciones").val();
    if(idSeleccionTabla == 1) {
        var existe = arregloConecciones.filter(function(object) {
                        return object.tipo == tipoSeleccionConnecion && object.arreglo == nombreArreglo;
                    });
        if(existe.length > 0) {
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
                                console.log('error en rolledBack MainDB Variables');
                                transactionCampos.rollback(err => {
                                    console.log('error en rolledBack');
                                    console.log(err);
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en select * Activos_Campos.",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                });
                            }
                        }  else {
                            transactionCampos.commit(err => {
                                // ... error checks
                                console.log("Transaction committed MainDB Variables");
                                console.log(result);
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
                                                message: "Intento de conexión fallido.",
                                                overlay: true,
                                                closeConfirm: true
                                            });
                                        } else {
                                            for (var i = 0; i < result.recordset.length; i++) {
                                                var valorArreglo = result.recordset[i];
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
                                                            });
                                                        }
                                                    });
                                                }); // fin transaction
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
                                console.log('error en rolledBack MainDB Variables');
                                transactionCampos.rollback(err => {
                                    console.log('error en rolledBack');
                                    console.log(err);
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en select * Depositos_Campos.",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                });
                            }
                        }  else {
                            transactionCampos.commit(err => {
                                // ... error checks
                                console.log("Transaction committed MainDB Variables");
                                console.log(result);
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
                                                message: "Intento de conexión fallido.",
                                                overlay: true,
                                                closeConfirm: true
                                            });
                                        } else {
                                            for (var i = 0; i < result.recordset.length; i++) {
                                                var valorArreglo = result.recordset[i];
                                                const transaction = new sql.Transaction( pool1 );
                                                transaction.begin(err => {
                                                    var rolledBack = false;
                                                    transaction.on('rollback', aborted => {
                                                        rolledBack = true;
                                                    });
                                                    const request = new sql.Request(transaction);
                                                    request.query("insert into Depositos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, sucursal, fecha) values ('"+valorArreglo[campos[0].idCliente]+"','"+valorArreglo[campos[0].nombreCliente]+"','"+valorArreglo[campos[0].tipoPersona]+"','"+valorArreglo[campos[0].tipoSubPersona]+"',"+valorArreglo[campos[0].saldo]+",'"+valorArreglo[campos[0].moneda]+"','"+valorArreglo[campos[0].tipoCuenta]+"','"+valorArreglo[campos[0].sucursal]+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
                                                            });
                                                        }
                                                    });
                                                }); // fin transaction
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
                                console.log('error en rolledBack MainDB Variables');
                                transactionCampos.rollback(err => {
                                    console.log('error en rolledBack');
                                    console.log(err);
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en select * Prestamos_Campos.",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                });
                            }
                        }  else {
                            transactionCampos.commit(err => {
                                // ... error checks
                                console.log("Transaction committed MainDB Variables");
                                console.log(result);
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
                                                message: "Intento de conexión fallido.",
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
                                                console.log(valorArreglo[campos[0].creditosRefinanciados])
                                                console.log(valorArreglo[campos[0].clausulasRestrictivas])
                                                console.log(formatDateCreation(new Date()))
                                                console.log(valorArreglo[campos[0].sucursal])
                                                const transaction = new sql.Transaction( pool1 );
                                                transaction.begin(err => {
                                                    var rolledBack = false;
                                                    transaction.on('rollback', aborted => {
                                                        rolledBack = true;
                                                    });
                                                    const request = new sql.Request(transaction);
                                                    request.query("insert into Prestamos (idCliente, nombreCliente, tipoPersona, tipoSubPersona, numPrestamo, saldo, moneda, montoOtorgado, tipoCuenta, diasMora, amortizacion, sobregiro, contingente, clasificacionCartera, tipoCredito, pago30, pago60, pago90, pago120, creditosRefinanciados, clausulasRestrictivas, fechaInicio, fechaFinal, sucursal, fecha) values ('"+valorArreglo[campos[0].idCliente]+"','"+valorArreglo[campos[0].nombreCliente]+"','"+valorArreglo[campos[0].tipoPersona]+"','"+valorArreglo[campos[0].tipoSubPersona]+"',"+valorArreglo[campos[0].numPrestamo]+","+valorArreglo[campos[0].saldo]+",'"+valorArreglo[campos[0].moneda]+"',"+valorArreglo[campos[0].montoOtorgado]+",'"+valorArreglo[campos[0].tipoCuenta]+"',"+valorArreglo[campos[0].diasMora]+","+valorArreglo[campos[0].amortizacion]+","+valorArreglo[campos[0].sobregiro]+","+valorArreglo[campos[0].contingente]+",'"+valorArreglo[campos[0].clasificacionCartera]+"','"+valorArreglo[campos[0].tipoCredito]+"',"+valorArreglo[campos[0].pago30]+","+valorArreglo[campos[0].pago60]+","+valorArreglo[campos[0].pago90]+","+valorArreglo[campos[0].pago120]+",'"+valorArreglo[campos[0].creditosRefinanciados]+"','"+valorArreglo[campos[0].clausulasRestrictivas]+"','"+formatDateCreation(new Date())+"','"+formatDateCreation(new Date())+"','"+valorArreglo[campos[0].sucursal]+"','"+formatDateCreation(new Date())+"')", (err, result) => {
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
                                                            });
                                                        }
                                                    });
                                                }); // fin transaction
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