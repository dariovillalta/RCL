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
		loadVariables();
		loadVariableVariables();
		loadVariablesMainDB();
        loadFosede();
        loadLists();
        loadListListsExcelAll();
	}
});

/*var session = remote.session;

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
});*/


/*****************TIPO DE LISTAS*****************
*   1)Manual Contable                           *
*   2)Categoria de Clasificación                *
*   3)Exclusiones FOSEDE                        *
*   4)Tipo de Personas                          *
*   5)Tipo de Sub-Personas                      *
*   6)Cuentas Operativas Clientes               *
*   7)Agencias                                  *
*   8)Tipos Crédito                             *
*   9)Tipos Deposito                            *
************************************************/

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


var variablesDBGlobal = null;

function loadVariablesMainDB () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from Variables", (err, result) => {
            if (err) {
                console.log(err);
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
                        variablesDBGlobal = result.recordset[0];
                        if(result.recordset[0].formula.length > 0){
                            formulaMATHLIVEGlobal = result.recordset[0].formulaMATHLIVE;
                        } else {
                            formulaMATHLIVEGlobal = null;
                        }
                        if(formulaMATHLIVEGlobal != null)
                            $("#salida").text(formulaMATHLIVEGlobal);
                        else
                            $("#salida").text("f(x)");
                        mathfield = MathLive.makeMathField('salida');

                        /*if(result.recordset[0].fullLogo.length > 0){
                            filepathFullLogo = result.recordset[0].fullLogo;
                            $("#fullLogo").attr("src",result.recordset[0].fullLogo);
                        } else
                            filepathFullLogo = '';
                        if(result.recordset[0].smallLogo.length > 0){
                            filepathSmallLogo = result.recordset[0].smallLogo;
                            $("#smallLogo").attr("src",result.recordset[0].smallLogo);
                        }*/
                    }
                });
            }
        });
    }); // fin transaction
}

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
                console.log(err);
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
                        if(result.recordset[0].montoFosede > 1)
                            montoFosedeGlobal = result.recordset;
                        else
                            montoFosedeGlobal = 0.00;
                    } else {
                        montoFosedeGlobal = 0.00;
                    }
                });
            }
        });
    }); // fin transaction
}

var arregloListas = [];
var arregloListasVariablesTotes = [];

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
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                        arregloListas = result.recordset;
                    } else {
                        arregloListas = [];
                    }
                });
            }
        });
    }); // fin transaction
}

function loadListListsExcelAll () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select distinct idLista from ListasVariables", (err, result) => {
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
                        arregloListasVariablesTotes = result.recordset;
                    } else {
                        arregloListasVariablesTotes = [];
                    }
                    console.log(arregloListasVariablesTotes)
                });
            }
        });
    }); // fin transaction
}


//	**********		Formula		**********
var formulaMATHLIVEGlobal = null;
//var formulaMATHLIVEGlobal = 'RCL=\\frac {1}{2}+3';

function verifyAndSaveFormula (equacion, formulaMATHLIVE) {
	if(equacion.length > 0 && equacion.length < 101){
		if(existenVariables(equacion) === 0){
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "No existen variables creadas en el sistema, por favor cree una en la tabla de abajo.",
			  	overlay: true,
                closeConfirm: true
			});
		} else if(existenVariables(equacion) === 1){
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "Las variables ingresadas en la formula no concuerdan con las variables de la base de datos.",
			  	overlay: true,
                closeConfirm: true
			});
		} else if(balanceEquacion(equacion) === 0){
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "La formula no tiene un simbolo de asignación.",
                overlay: true,
                closeConfirm: true
            });
        } else if(balanceEquacion(equacion) === 1){
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "La formula tiene más de un simbolo de asignación.",
                overlay: true,
                closeConfirm: true
            });
        } else if(balanceEquacion(equacion) === 2){
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Solo se puede asignar a una sola variable.",
                overlay: true,
                closeConfirm: true
            });
        } else if(balanceEquacion(equacion) === 3){
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Solo se puede asignar a variables.",
                overlay: true,
                closeConfirm: true
            });
        } else if(balanceEquacion(equacion) === 5){
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Se tiene que asignar a una variable.",
                overlay: true,
                closeConfirm: true
            });
        } else {
			$("body").overhang({
			  	type: "confirm",
			  	primary: "#f5a433",
			  	accent: "#dc9430",
			  	yesColor: "#3498DB",
			  	message: 'Esta seguro que desea guardar la formula '+equacion+'?',
			  	overlay: true,
			  	yesMessage: "Guardar",
			  	noMessage: "Cancelar",
			  	callback: function (value) {
			    	if(value){
			    		if(variablesDBGlobal == null)
							createFormulaVariablesDB(equacion, formulaMATHLIVE);
						else 
							updateFormulaVariablesDB(equacion, formulaMATHLIVE);
			    	}
			  	}
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "La equación debe tener una longitud mayor a 0 y menor a 101.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function existenVariables (equacion) {
	if(arregloVariables.length > 0) {
		var variable = [];
		for (var i = 0; i < equacion.length; i++) {
			if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
				equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
				equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-" && isNaN(equacion.charAt(i))) {
				var pal = getVariable(equacion, i);
				variable.push(pal);
				i+=pal.length;
			}
		};
		var noExisteUna = false;
		for (var i = 0; i < variable.length; i++) {
			noExisteUna = false;
			for (var j = 0; j < arregloVariables.length; j++) {
				if( variable[i].toLowerCase() == arregloVariables[j].variables.toLowerCase()){
					noExisteUna = true;
					break;
				}
			};
			if(!noExisteUna)
				return 1;
		};
		return 2;
	} else
		return 0;
}

function getVariable (equacion, index) {
	var variable = '';
	for (var i = index; i < equacion.length; i++) {
		if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
			equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
			equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-")
			variable+=equacion[i];
		else
			return variable;
	};
	return variable;
}

function balanceEquacion (equacion) {
    var partesEquacion = equacion.split("=");
    if(partesEquacion.length == 1)
        return 0;
    else if(partesEquacion.length > 2)
        return 1;
    else if(partesEquacion[1].localeCompare("") == 0)
        return 5;
    var parte1 = partesEquacion[0].split(/[+-\/*><<=>=!=]+/);
    var parte2 = partesEquacion[1].split(/[+-\/*><<=>=!=]+/);
    if(parte1.length > 1) {
        if(parte2.length > 1)
            return 2;
    } else if(parte2.length > 1) {
        if(parte1.length > 1)
            return 2;
    }
    var existe = false;
    if(parte1.length == 1) {
        for (var j = 0; j < arregloVariables.length; j++) {
            if( parte1[0].toLowerCase() == arregloVariables[j].variables.toLowerCase()){
                existe = true;
                break;
            }
        };
    } else if(parte2.length == 1) {
        for (var j = 0; j < arregloVariables.length; j++) {
            if( parte2[0].toLowerCase() == arregloVariables[j].variables.toLowerCase()){
                existe = true;
                break;
            }
        };
    }
    if(!existe) {
        if(parte2.length == 1) {
            for (var j = 0; j < arregloVariables.length; j++) {
                if( parte2[0].toLowerCase() == arregloVariables[j].variables.toLowerCase()){
                    existe = true;
                    break;
                }
            };
        }
        return 3;
    }
    return 4;
}

function existeArregloVariables (variable) {
    for (var i = 0; i < arregloVariables.length; i++) {
        if( variable.toLowerCase() == arregloVariables[i].variables.toLowerCase())
            return true;
    };
    return false;
}

function existeArregloVariablesDeVariables (variable) {
    for (var i = 0; i < arregloVariableDeVariables.length; i++) {
        if( variable.toLowerCase() == arregloVariableDeVariables[i].nombre.toLowerCase())
            return true;
    };
    return false;
}

function printVariables () {
	$("#contenedorTextoVariables").empty();
	var content = '';
	for (var i = 0; i < arregloVariables.length; i++) {
		content+= '<h4>'+arregloVariables[i].nombre+' &#8594; '+arregloVariables[i].variables+'</h4>'+
                  	'<div class="container-fluid paddingToText">'+
                  		'<b>'+arregloVariables[i].nombre+' ('+arregloVariables[i].variables+'):</b> '+arregloVariables[i].descripcion+
                  	'</div>'+
                  	'<br/>';
	};
	$("#contenedorTextoVariables").append(content);
}

function createFormulaVariablesDB (equacion, formulaMATHLIVE) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Variables (fullLogo, smallLogo, formula, formulaMATHLIVE, minimoRCL, permisoInicio, horaProgramada) values ('', '', '"+equacion+"', '"+formulaMATHLIVE+"', 0, 'false', 0)", (err, result) => {
            if (err) {
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en inserción de la formula.",
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
                        message: "Formula guardada con exito.",
                        duration: 1,
                        overlay: true
                    });
                    loadVariablesMainDB();
                });
            }
        });
    }); // fin transaction
}

function updateFormulaVariablesDB (equacion, formulaMATHLIVE) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("update Variables set formula = '"+equacion+"', formulaMATHLIVE = '"+formulaMATHLIVE+"' where ID = 1", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err);
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en modificación de la formula.",
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
					  	message: "Formula guardada con exito.",
					  	duration: 1,
					  	overlay: true
					});
                    loadVariablesMainDB();
                });
            }
        });
    }); // fin transaction
}
//	**********		Fin Formula		**********





//	**********		Variables		**********
var arregloVariables = [];
var arregloVariableDeVariables = [];

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
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de FormulaVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                    	arregloVariables = result.recordset;
                    	loadVariablesTable();
                    	printVariables();
                    } else{
                    	arregloVariables = [];
                    	loadVariablesTable();
                    	printVariables();
                    }
                });
            }
        });
    }); // fin transaction
}

function loadVariablesTable () {
	var id;
	if(arregloVariables.length > 0)
		id = arregloVariables[arregloVariables.length-1].ID+1;
	else
		id = 1;
	if ( $.fn.dataTable.isDataTable( '#datatable_variables' ) )
		$("#datatable_variables").dataTable().fnDestroy();
	$( "#datatable_variables tbody").unbind( "click" );
	var table = $('#datatable_variables').DataTable({
		"data": arregloVariables,
		dom: "Bflrtip",
        keys: true,
	  	buttons: [
			{
			  	extend: "copyHtml5",
			  	className: "btn-sm"
			},
			{
			  	extend: "csvHtml5",
			  	className: "btn-sm",
			  	action : function( e, dt, button, config ) {
			  		for (var i = 0; i < $('#datatable_variables tbody tr').length; i++) {
			  			var this1 = $('#datatable_variables tbody tr')[i];
			  			var element = $( this1 );
			  			if(element[0].nextSibling){
				  			if( element[0].nextSibling.className == 'even' || element[0].nextSibling.className == 'odd' )
				  				$( element[0].firstChild ).trigger( "click" );
				  		}
			  		};
                    exportTableToCSV.apply(this, [$('#datatable_variables'), 'export.csv']);
                }
			},
			{
			  	extend: "excelHtml5",
			  	className: "btn-sm",
			  	/*customize: function( xlsx ) {
	                var sheet = xlsx.xl.worksheets['sheet1.xml'];
	                $('row:first c', sheet).attr( 's', '42' );
	            }*/
			},
			{
			  	extend: "pdfHtml5",
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
			{
                "class":          "details-control",
                "orderable":      false,
                "data":           null,
                "defaultContent": "",
            },
			{ "data": "ID" },
	        { "data": "nombre" },
	        { "data": "variables" },
	        { "data": "descripcion" },
	        { "data": "Guardar" },
	        { "data": "Eliminar" }
	    ],
	    "columnDefs": [ {
    	        "targets": -2,
    	        "defaultContent": '<a class="btn btn-app updateVariable"> <i class="fa fa-save"></i> Guardar </a>',
    	        "className": "text-center"
    	    },
    	    {
    	        "targets": -1,
    	        "defaultContent": '<a class="btn btn-app deleteVariable"> <i class="fa fa-eraser"></i> Eliminar </a>',
    	        "className": "text-center"
    	    },
    	    {
        		"targets": 0,
        		"className": "text-center",
        		"orderable": false
    		},
    	    {
    	        "targets": 1,
    	        "className": "text-center"
    		},
    	    {
    		    "targets": 2,
    		    "className": "text-center"
    		},
    	    {
    		    "targets": 3,
    		    "className": "text-center"
    		},
    	    {
    		    "targets": 4,
    		    "className": "text-center"
    		}
        ]
	});
	if ( $.fn.dataTable.isDataTable( '#datatable_variables' ) )
		table.MakeCellsEditable("destroy");

	table.row.add( {
		"null": "<td class='details-control'></td>",
        "ID": id,
        "nombre": "<input type='text' id='nombre"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "variables": "<input type='text' id='variables"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "descripcion": "<input type='text' id='descripcion"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "Guardar": "<a class='btn btn-app' onclick='saveNewVariable("+id+")'> <i class='fa fa-save'></i> Guardar </a>",
        "Eliminar": ""
    } ).draw();

    $("#datatable_variables tbody tr:last")[0].firstChild.className = '';

    table.MakeCellsEditable({
    	"onUpdate": function() { return; },
        "columns": [2,3,4],
        "confirmationButton": false,
		"inputTypes": [
			{
                "column":2, 
                "type": "text",
                "options":null
            },
            {
                "column":3, 
                "type": "text",
                "options":null
            }
			,{
                "column": 4,
                "type":"text",
                "options":null
            }
        ]
    });

    table.page('last').draw('page');

    // Array to track the ids of the details displayed rows
    var detailRows = [];
 
    $('#datatable_variables tbody').on( 'click', 'tr td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var idx = $.inArray( tr.attr('id'), detailRows );
 
        if ( row.child.isShown() ) {
            tr.removeClass( 'details' );
            row.child.hide();
 
            // Remove from the 'open' array
            detailRows.splice( idx, 1 );
        }
        else {
            tr.addClass( 'details' );
            row.child( format( row.data() ) ).show();
            initMathField(row.data());
 
            // Add to the 'open' array
            if ( idx === -1 ) {
                detailRows.push( tr.attr('id') );
            }
        }
    } );
 
    // On each draw, loop over the `detailRows` array and show any child rows
    table.on( 'draw', function () {
        $.each( detailRows, function ( i, id ) {
            $('#'+id+' td.details-control').trigger( 'click' );
        } );
    } );

	$('#datatable_variables tbody').on( 'click', 'tr a.updateVariable', function () {
        var data = table.row( $(this).parents('tr') ).data();
        if(!/\s/.test(data.variables)) {
            if(!/_/.test(data.variables)) {
        		if(data.nombre.length > 0 && data.nombre.length < 61){
        			if(data.variables.length > 0 && data.variables.length < 11){
        				if(data.descripcion.length < 701){
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
        					    		modifyVariable(data);
        					  	}
        					});
        				} else {
        					$("body").overhang({
        					  	type: "error",
        					  	primary: "#f84a1d",
        						accent: "#d94e2a",
        					  	message: "La descripción de la variable debe tener una longitud menor a 701.",
        					  	overlay: true,
                                closeConfirm: true
        					});
        				}
        			} else {
        				$("body").overhang({
        				  	type: "error",
        				  	primary: "#f84a1d",
        					accent: "#d94e2a",
        				  	message: "La representación de la variable en la formula debe tener más de una letra y menos de 11.",
        				  	overlay: true,
                            closeConfirm: true
        				});
        			}
        		} else {
        			$("body").overhang({
        			  	type: "error",
        			  	primary: "#f84a1d",
        				accent: "#d94e2a",
        			  	message: "El nombre de la variable debe tener una longitud mayor a 0 y menor a 61.",
        			  	overlay: true,
                        closeConfirm: true
        			});
        		}
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "El campo de variables no puede contener el caracter: '_'.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "El campo de variables no puede contener espacios.",
                overlay: true,
                closeConfirm: true
            });
        }
    } );

	$('#datatable_variables tbody').on( 'click', 'tr a.deleteVariable', function () {
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
	//loadVariablesofVariableTable();
}

function exportTableToCSV($table, filename) {
 
    //rescato los títulos y las filas
    var $Tabla_Nueva = $table.find('tr:has(td,th)');
    // elimino la tabla interior.
    var Tabla_Nueva2= $Tabla_Nueva.filter(function() {
        return (this.childElementCount != 1 );
    });
 
    var $rows = Tabla_Nueva2,
        // Temporary delimiter characters unlikely to be typed by keyboard
        // This is to avoid accidentally splitting the actual contents
        tmpColDelim = String.fromCharCode(11), // vertical tab character
        tmpRowDelim = String.fromCharCode(0), // null character
 
        // Solo Dios Sabe por que puse esta linea
        colDelim = (filename.indexOf("xls") !=-1)? '"\t"': '","',
        rowDelim = '"\r\n"',
 
 
        // Grab text from table into CSV formatted string
        csv = '"' + $rows.map(function (i, row) {
            var $row = $(row);
            var   $cols = $row.find('td:not(.hidden),th:not(.hidden)');
 
            return $cols.map(function (j, col) {
                var $col = $(col);
                var text = $col.text().replace(/\./g, '');
                return text.replace('"', '""'); // escape double quotes
 
            }).get().join(tmpColDelim);
            csv =csv +'"\r\n"' +'fin '+'"\r\n"';
        }).get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim) + '"';
 
      download_csv(csv, filename);
 }
 
 
 
function download_csv(csv, filename) {
    var csvFile;
    var downloadLink;
 
    // CSV FILE
    csvFile = new Blob([csv], {type: "text/csv"});
 
    // Download link
    downloadLink = document.createElement("a");
 
    // File name
    downloadLink.download = filename;
 
    // We have to create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);
 
    // Make sure that the link is not displayed
    downloadLink.style.display = "none";
 
    // Add the link to your DOM
    document.body.appendChild(downloadLink);
 
    // Lanzamos
    downloadLink.click();
 }

function format ( rowdata ) {
    var formula = '';
    if(rowdata.formulaMATHLIVE != null && rowdata.formulaMATHLIVE.length > 0)
        formula = rowdata.formulaMATHLIVE;
    else
        formula = 'f(x)';
	var div = '<div style="padding: 0% 5%; margin: -1% 0% -1% 0%; height: 18em; background-color: #F5FFFA; border-right-style: solid; border-left-style: solid;">';
            div+='<div style="height: 80%; display: flex; align-items: center; justify-content: center;">';
                div+='<div id="wrapper">';
                    div+='<div id="formulaVariable'+rowdata.ID+'" class="formula_styleSub">';
                        div+=formula;
                    div+='</div>';
                div+='</div>';
	        div+='</div>';
            div+='<div id="wrapper">';
                div+='<button onclick="resetFormulaVariable('+rowdata.ID+', \''+formula+'\')" type="button" class="btn btn-info">Resetear</button>';
                div+='<button id="mostrar" onclick="saveFormulaVariable('+rowdata.ID+')" type="button" class="btn btn-success">Guardar</button>';
            div+='</div>';
        div+='</div>';
    return div;
}

var mathfieldVariable;

function initMathField ( rowdata ) {
    window['mathfieldVariable'+rowdata.ID] = MathLive.makeMathField('formulaVariable'+rowdata.ID);
}

function resetFormulaVariable ( id, formula ) {
    $("#formulaVariable"+id).text(formula);
    window['mathfieldVariable'+id] = MathLive.makeMathField("formulaVariable"+id);
}

function saveFormulaVariable ( id ) {
    var formulaVarDeFormula = window['mathfieldVariable'+id].text();
    var resultado = '';
    for (var i = 0; i < formulaVarDeFormula.length; i++) {
        var tipo = '';
        if(formulaVarDeFormula.charAt(i) == '\\')
            tipo = getType(formulaVarDeFormula, i);
        else if( formulaVarDeFormula.charAt(i) == '{' )
            resultado+='(';
        else if( formulaVarDeFormula.charAt(i) == '}' )
            resultado+=')';
        else if( formulaVarDeFormula.charAt(i) == '(' )
            resultado+='(';
        else if( formulaVarDeFormula.charAt(i) == ')' )
            resultado+=')';
        else if( formulaVarDeFormula.charAt(i) != ' ' || formulaVarDeFormula.charAt(i) == '<' || formulaVarDeFormula.charAt(i) == '>' )
            resultado+=formulaVarDeFormula.charAt(i);
        if(tipo.length>0){
            if(tipo == 'le')
                resultado+='<=';
            else if(tipo == 'ge')
                resultado+='>=';
            else if(tipo == 'ne')
                resultado+='!=';
            else if(tipo == 'frac')
                resultado+='/';
            else if(tipo == 'sqrt')
                resultado+='√';
            else if(tipo == 'times')
                resultado+='*';
            i+=tipo.length;
        }
    }
    var banderaPosiciones = [];
    for (var i = 0; i < resultado.length; i++) {
        var fraccion = '';
        if(resultado.charAt(i) == '/' && !banderaPosiciones[i]){
            var posNumerado = countPosFractioParenthes(resultado, i);
            banderaPosiciones[posNumerado] = true;
            resultado = [resultado.slice(0, i), resultado.slice(i+1, posNumerado+1), "/", resultado.slice(posNumerado+1) ].join('');
        }
    }
    saveSubVariableFormula(resultado, formulaVarDeFormula, id);
}

function saveSubVariableFormula (equacion, formulaMATHLIVE, id) {
    if(equacion.length > 0 && equacion.length < 101){
        if(existenVariablesSubVar(equacion) === 0){
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "No existen sub-variables creadas en el sistema, por favor cree una en la tabla de sub-variables.",
                overlay: true,
                closeConfirm: true
            });
        } else if(existenVariablesSubVar(equacion) === 1){
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Las variables ingresadas en la formula no concuerdan con las variables de la base de datos.",
                overlay: true,
                closeConfirm: true
            });
        } else if(existenVariablesSubVar(equacion) === 3){
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "La formula no puede llevar ninguna asignación(=).",
                overlay: true,
                closeConfirm: true
            });
        } else if(mismaVariablesSubVar(equacion, id) === 1){
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "La formula no puede contener la misma variable padre.",
                overlay: true,
                closeConfirm: true
            });
        } else {
            $("body").overhang({
                type: "confirm",
                primary: "#f5a433",
                accent: "#dc9430",
                yesColor: "#3498DB",
                message: 'Esta seguro que desea guardar la formula '+equacion+'?',
                overlay: true,
                yesMessage: "Guardar",
                noMessage: "Cancelar",
                callback: function (value) {
                    if(value){
                        updateVariableFormula(equacion, formulaMATHLIVE, id);
                    }
                }
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "La equación debe tener una longitud mayor a 0 y menor a 101.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function existenVariablesSubVar (equacion) {
    if(arregloVariableDeVariables.length > 0 || arregloVariables.length > 0) {
        if(equacion.split("=").length == 1) {
            var variable = [];
            for (var i = 0; i < equacion.length; i++) {
                if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
                    equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
                    equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-" && isNaN(equacion.charAt(i))) {
                    var pal = getVariableSubVar(equacion, i);
                    variable.push(pal);
                    i+=pal.length;
                }
            };
            var noExisteUna = false;
            for (var i = 0; i < variable.length; i++) {
                noExisteUna = false;
                for (var j = 0; j < arregloVariableDeVariables.length; j++) {
                    if( variable[i].toLowerCase() == arregloVariableDeVariables[j].nombre.toLowerCase()){
                        noExisteUna = true;
                        break;
                    }
                };
                for (var j = 0; j < arregloVariables.length; j++) {
                    if( variable[i].toLowerCase() == arregloVariables[j].variables.toLowerCase()){
                        noExisteUna = true;
                        break;
                    }
                };
                if(!noExisteUna)
                    return 1;
            };
            return 2;
        } else
            return 3;
    } else
        return 0;
}

function mismaVariablesSubVar (equacion, id) {
    var encontro = arregloVariables.filter(function(object) {
                        return object.ID == id;
                    });
    var variable = [];
    for (var i = 0; i < equacion.length; i++) {
        if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
            equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
            equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-" && isNaN(equacion.charAt(i))) {
            var pal = getVariableSubVar(equacion, i);
            variable.push(pal);
            i+=pal.length;
        }
    };
    var noExisteUna = false;
    for (var i = 0; i < variable.length; i++) {
        if( variable[i].toLowerCase() == encontro[0].variables.toLowerCase()){
            noExisteUna = true;
            break;
        }
    };
    if(noExisteUna)
        return 1;
    return 0;
}

function getVariableSubVar (equacion, index) {
    var variable = '';
    for (var i = index; i < equacion.length; i++) {
        if(equacion.charAt(i) != "(" && equacion.charAt(i) != ")" && equacion.charAt(i) != "<" && equacion.charAt(i) != ">" && 
            equacion.charAt(i) != "!" && equacion.charAt(i) != "=" && equacion.charAt(i) != "/" && equacion.charAt(i) != "*" && 
            equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-")
            variable+=equacion[i];
        else
            return variable;
    };
    return variable;
}

function updateVariableFormula (formula, formulaMATHLIVE, id) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("update FormulaVariables set formula = '"+formula+"', formulaMATHLIVE = '"+formulaMATHLIVE+"' where ID = '"+id+"'", (err, result) => {
            if (err) {
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en modificación de la formua para una variable.",
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
                        message: "Variable modificada con éxito.",
                        duration: 1,
                        overlay: true
                    });
                });
            }
        });
    }); // fin transaction
}

function saveNewVariable (index) {
	var nombre = $("#nombre"+index).val();
	var variables = $("#variables"+index).val();
	var descripcion = $("#descripcion"+index).val();
    if(!/\s/.test(variables)) {
        if(!/_/.test(variables)) {
            if(!existeArregloVariables(variables)) {
                if(!existeArregloVariablesDeVariables(variables)) {
                	if(nombre.length > 0 && nombre.length < 61){
                		if(variables.length > 0 && variables.length < 11){
                			if(descripcion.length < 701){
                				const transaction = new sql.Transaction( pool1 );
                			    transaction.begin(err => {
                			        var rolledBack = false;
                			        transaction.on('rollback', aborted => {
                			            // emited with aborted === true
                			            rolledBack = true;
                			        });
                			        const request = new sql.Request(transaction);
                			        request.query("insert into FormulaVariables (nombre, variables, descripcion, formula, formulaMATHLIVE) values ('"+nombre+"', '"+variables+"', '"+descripcion+"', '', '')", (err, result) => {
                			            if (err) {
                                            console.log(err);
                			                if (!rolledBack) {
                			                    transaction.rollback(err => {
                			                        $("body").overhang({
                                                        type: "error",
                                                        primary: "#f84a1d",
                                                        accent: "#d94e2a",
                                                        message: "Error en inserción en la tabla de FormulaVariables.",
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
                								  	message: "Variable creada con exito.",
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
                				  	message: "La descripción de la variable debe tener una longitud menor a 701.",
                				  	overlay: true,
                                    closeConfirm: true
                				});
                			}
                		} else {
                			$("body").overhang({
                			  	type: "error",
                			  	primary: "#f84a1d",
                				accent: "#d94e2a",
                			  	message: "La representación de la variable en la formula debe tener más de una letra y menos de 11.",
                			  	overlay: true,
                                closeConfirm: true
                			});
                		}
                	} else {
                		$("body").overhang({
                		  	type: "error",
                		  	primary: "#f84a1d",
                			accent: "#d94e2a",
                		  	message: "El nombre de la variable debe tener longitud mayor a 0 y menor a 61.",
                		  	overlay: true,
                            closeConfirm: true
                		});
                	}
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "La variable "+variables+" ya existe en la tabla de sub-variables.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "La variable "+variables+" ya existe en la tabla de variables.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "El campo de variables no puede contener el caracter: '_'.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "El campo de variables no puede contener espacios.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function modifyVariable (row) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("update FormulaVariables set nombre = '"+row.nombre+"', variables = '"+row.variables+"', descripcion = '"+row.descripcion+"' where ID = '"+row.ID+"'", (err, result) => {
            if (err) {
                console.log(err);
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en modificación de variable "+row.nombre+".",
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
					  	message: "Variable modificada con éxito.",
					  	duration: 1,
					  	overlay: true
					});
                });
            }
        });
    }); // fin transaction
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
        request.query("delete from FormulaVariables where ID = '"+row.ID+"' ", (err, result) => {
            if (err) {
                console.log(err);
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
					  	duration: 1,
					  	overlay: true
					});
                });
            }
        });
    }); // fin transaction
}

function loadVariableVariables () {
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
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                    	arregloVariableDeVariables = result.recordset;
                    	loadVariablesTable();
                    	loadVariablesofVariableTable();
                    } else{
                    	arregloVariableDeVariables = [];
                    	loadVariablesTable();
                    	loadVariablesofVariableTable();
                    }
                });
            }
        });
    }); // fin transaction
}

function createVariableDeVariable (rowdataID) {
	var nombre = $("#variablesdeVariablesNombre"+rowdataID).val();
	var descripcion = $("#variablesdeVariablesDescripcion"+rowdataID).val();
	var factor = $("#variablesdeVariablesFactor"+rowdataID).val().split(/[ |%]/)[0];
    var tabla = $("#variablesdeVariablesTabla"+rowdataID).val();
    if(!/\s/.test(nombre)) {
        if(!/_/.test(nombre)) {
            if(!existeArregloVariablesDeVariables(nombre)) {
                if(!existeArregloVariables(nombre)) {
                	if(nombre.length > 0 && nombre.length < 41){
                		if(descripcion.length < 701){
                			if(factor.length > 0){
                				if(!isNaN(factor)){
                                    if(tabla.length > 0 && !isNaN(tabla)) {
                    					const transaction = new sql.Transaction( pool1 );
                    				    transaction.begin(err => {
                    				        var rolledBack = false;
                    				        transaction.on('rollback', aborted => {
                    				            // emited with aborted === true
                    				            rolledBack = true;
                    				        });
                    				        const request = new sql.Request(transaction);
                    				        request.query("insert into VariablesdeVariablesFormula (nombre, descripcion, factor, tablaAplicar) values ('"+nombre+"', '"+descripcion+"', "+factor+", "+tabla+")", (err, result) => {
                    				            if (err) {
                                                    console.log(err);
                    				                if (!rolledBack) {
                    				                    transaction.rollback(err => {
                    				                        $("body").overhang({
                                                                type: "error",
                                                                primary: "#f84a1d",
                                                                accent: "#d94e2a",
                                                                message: "Error en inserción a la tabla VariablesdeVariablesFormula.",
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
                    									  	message: "Variable creada con exito.",
                    									  	duration: 1,
                    									  	overlay: true
                    									});
                    				                    loadVariableVariables();
                    				                });
                    				            }
                    				        });
                    				    }); // fin transaction
                                    } else {
                                        $("body").overhang({
                                            type: "error",
                                            primary: "#f84a1d",
                                            accent: "#d94e2a",
                                            message: "Ingrese un número válido para la tabla.",
                                            overlay: true,
                                            closeConfirm: true
                                        });
                                    }
                				} else {
                					$("body").overhang({
                					  	type: "error",
                					  	primary: "#f84a1d",
                						accent: "#d94e2a",
                					  	message: "Ingrese un número válido para el factor.",
                					  	overlay: true,
                                        closeConfirm: true
                					});
                				}
                			} else {
                				$("body").overhang({
                				  	type: "error",
                				  	primary: "#f84a1d",
                					accent: "#d94e2a",
                				  	message: "Ingrese un valor numérico para el factor.",
                				  	overlay: true,
                                    closeConfirm: true
                				});
                			}
                		} else {
                			$("body").overhang({
                			  	type: "error",
                			  	primary: "#f84a1d",
                				accent: "#d94e2a",
                			  	message: "La descripción de la variable debe tener longitud menor a 701.",
                			  	overlay: true,
                                closeConfirm: true
                			});
                		}
                	} else {
                		$("body").overhang({
                		  	type: "error",
                		  	primary: "#f84a1d",
                			accent: "#d94e2a",
                		  	message: "El nombre de la variable debe tener longitud mayor a 0 y menor a 41.",
                		  	overlay: true,
                            closeConfirm: true
                		});
                	}
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "La variable "+nombre+" ya existe en la tabla de variables.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "La variable "+nombre+" ya existe en la tabla de sub-variables.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "El nombre de la variable no puede contener el caracter: '_'.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "El nombre de la variable no puede contener espacios.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function updateVariableDeVariable (row) {
	var nombre = row.nombre;
	var descripcion = row.descripcion;
	var factor = row.factor;
    var tabla = row.tablaAplicar;
    if(!/\s/.test(nombre)) {
        if(!/_/.test(nombre)) {
        	if(nombre.length > 0 && nombre.length < 41){
        		if(descripcion.length < 701){
        			if(factor.toString().length > 0){
        				if(!isNaN(factor)){
                            if(!isNaN(tabla) && tabla.toString().length > 0){
        			    		const transaction = new sql.Transaction( pool1 );
        					    transaction.begin(err => {
        					        var rolledBack = false;
        					        transaction.on('rollback', aborted => {
        					            // emited with aborted === true
        					            rolledBack = true;
        					        });
        					        const request = new sql.Request(transaction);
        					        request.query("update VariablesdeVariablesFormula set nombre = '"+nombre+"', descripcion = '"+descripcion+"', factor = "+factor+", tablaAplicar = "+tabla+" where ID = "+row.ID+" ", (err, result) => {
        					            if (err) {
                                            console.log(err);
        					                if (!rolledBack) {
        					                    transaction.rollback(err => {
        					                        $("body").overhang({
                                                        type: "error",
                                                        primary: "#f84a1d",
                                                        accent: "#d94e2a",
                                                        message: "Error en modificación en la tabla de VariablesdeVariablesFormula.",
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
        					                    loadVariableVariables();
        					                });
        					            }
        					        });
        					    }); // fin transaction
                            } else {
                                $("body").overhang({
                                    type: "error",
                                    primary: "#f84a1d",
                                    accent: "#d94e2a",
                                    message: "Ingrese un número válido para la tabla.",
                                    overlay: true,
                                    closeConfirm: true
                                });
                            }
        				} else {
        					$("body").overhang({
        					  	type: "error",
        					  	primary: "#f84a1d",
        						accent: "#d94e2a",
        					  	message: "Ingrese un número válido para el factor.",
        					  	overlay: true,
                                closeConfirm: true
        					});
        				}
        			} else {
        				$("body").overhang({
        				  	type: "error",
        				  	primary: "#f84a1d",
        					accent: "#d94e2a",
        				  	message: "Ingrese un valor numérico para el factor.",
        				  	overlay: true,
                            closeConfirm: true
        				});
        			}
        		} else {
        			$("body").overhang({
        			  	type: "error",
        			  	primary: "#f84a1d",
        				accent: "#d94e2a",
        			  	message: "La descripción de la variable debe tener longitud menor a 701.",
        			  	overlay: true,
                        closeConfirm: true
        			});
        		}
        	} else {
        		$("body").overhang({
        		  	type: "error",
        		  	primary: "#f84a1d",
        			accent: "#d94e2a",
        		  	message: "El nombre de la variable debe tener longitud mayor a 0 y menor a 41.",
        		  	overlay: true,
                    closeConfirm: true
        		});
        	}
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "El nombre de la variable no puede contener el caracter: '_'.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "El nombre de la variable no puede contener espacios.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function deleteVariableDeVariable (variableID, variableNombre) {
	$("body").overhang({
	  	type: "confirm",
	  	primary: "#f5a433",
	  	accent: "#dc9430",
	  	yesColor: "#3498DB",
	  	message: 'Esta seguro que desea eliminar a '+variableNombre+'?',
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
			        request.query("delete from VariablesdeVariablesFormula where ID = "+variableID+" ", (err, result) => {
			            if (err) {
                            console.log(err);
			                if (!rolledBack) {
			                    transaction.rollback(err => {
			                        $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en eliminación de la variable "+variableNombre+".",
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
								  	message: "Variable eliminada con exito.",
								  	duration: 1,
								  	overlay: true
								});
			                    loadVariableVariables();
			                });
			            }
			        });
			    }); // fin transaction
	    	}
	  	}
	});
}

function loadVariablesofVariableTable () {
	var id;
    if(arregloVariableDeVariables.length > 0)
        id = arregloVariableDeVariables[arregloVariableDeVariables.length-1].ID+1;
    else
        id = 1;
    if ( $.fn.dataTable.isDataTable( '#datatable_variablesOfVariables' ) )
        $("#datatable_variablesOfVariables").dataTable().fnDestroy();
    $( "#datatable_variablesOfVariables tbody").unbind( "click" );
    var table = $('#datatable_variablesOfVariables').DataTable({
        "data": arregloVariableDeVariables,
        dom: "Bflrtip",
        keys: true,
        buttons: [
            {
                extend: "copyHtml5",
                className: "btn-sm"
            },
            {
                extend: "csvHtml5",
                className: "btn-sm"/*,
                action : function( e, dt, button, config ) {
                    for (var i = 0; i < $('#datatable_variablesOfVariables tbody tr').length; i++) {
                        var this1 = $('#datatable_variablesOfVariables tbody tr')[i];
                        var element = $( this1 );
                        if(element[0].nextSibling){
                            if( element[0].nextSibling.className == 'even' || element[0].nextSibling.className == 'odd' )
                                $( element[0].firstChild ).trigger( "click" );
                        }
                    };
                    exportTableToCSV.apply(this, [$('#datatable_variablesOfVariables'), 'export.csv']);
                }*/
            },
            {
                extend: "excelHtml5",
                className: "btn-sm",
            },
            {
                extend: "pdfHtml5",
                className: "btn-sm"
            }
        ],
        "fnDrawCallback": function ( oSettings ) {
            $("#variablesdeVariablesFactor"+id).inputmask("9[9][9]%",{placeholder:" ", clearMaskOnLostFocus: true });
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
            { "data": "nombre" },
            { "data": "descripcion" },
            { "data": "factor" },
            { "data": "tablaAplicar" },
            { "data": "Guardar" },
            { "data": "Eliminar" },
            { "data": "Editar Filtros" }
        ],
        "columnDefs": [ {
            "targets": -3,
            "defaultContent": '<a class="btn btn-app updateVariableOfVariable"> <i class="fa fa-save"></i> Guardar </a>',
            "className": "text-center"
        },
        {
            "targets": -2,
            "defaultContent": '<a class="btn btn-app deleteVariablOfVariablee"> <i class="fa fa-eraser"></i> Eliminar </a>',
            "className": "text-center"
        },
        {
            "targets": -1,
            "defaultContent": '<a class="btn btn-app customizeVariableOfVariable"> <i class="fa fa-pencil"></i> Personalizar </a>',
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
        },
        {
            "targets": 3,
            "className": "text-center"
        },
        {
            "targets": 4,
            "className": "text-center"
        }]
    });
    if ( $.fn.dataTable.isDataTable( '#datatable_variablesOfVariables' ) )
        table.MakeCellsEditable("destroy");

    table.row.add( {
        "ID": id,
        "nombre": "<input type='text' id='variablesdeVariablesNombre"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "descripcion": "<input type='text' id='variablesdeVariablesDescripcion"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "factor": "<input type='text' id='variablesdeVariablesFactor"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "tablaAplicar": "<div class='select-style' style='width:10em;'><select id='variablesdeVariablesTabla"+id+"' required='required'> <option value='1' selected='selected'>Balance General</option> <option value='2'>Captaciones</option> <option value='3'>Cartera de Crédito</option> </select></div>",
        "Guardar": "<a class='btn btn-app' onclick='createVariableDeVariable("+id+")'> <i class='fa fa-save'></i> Guardar </a>",
        "Eliminar": "",
        "Editar Filtros": ""
    } ).draw();


    $("#variablesdeVariablesFactor"+id).inputmask("9[9][9]%",{placeholder:" ", clearMaskOnLostFocus: true }); //default

    //$("#datatable_variablesOfVariables tbody tr:last")[0].firstChild.className = '';

    table.MakeCellsEditable({
        "onUpdate": function() { return; },
        "columns": [1,2,3, 4],
        "confirmationButton": false,
        "inputTypes": [
            {
                "column":1, 
                "type": "text",
                "options":null
            },
            {
                "column":2, 
                "type": "text",
                "options":null
            },
            {
                "column":3, 
                "type": "text",
                "options":null
            }
            ,{
                "column": 4,
                "type":"list",
                "options": [
                    { "value": "1", "display": "Balance General" },
                    { "value": "2", "display": "Captaciones" },
                    { "value": "3", "display": "Cartera de Crédito" }
                ]
            }
        ]
    });

    table.page('last').draw('page');

    $('#datatable_variablesOfVariables tbody').on( 'click', 'tr a.updateVariableOfVariable', function () {
        var data = table.row( $(this).parents('tr') ).data();
        if(data.nombre.length > 0 && data.nombre.length < 41){
            if(data.tablaAplicar.toString().length > 0){
                if(data.descripcion.length < 701){
                    if(data.factor.toString().length > 0){
                        if(!isNaN(data.factor)){
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
                                        updateVariableDeVariable(data);
                                }
                            });
                        } else {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "Ingrese un valor válido para el factor.",
                                overlay: true,
                                closeConfirm: true
                            });
                        }
                    } else {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Ingrese un valor para el factor.",
                            overlay: true,
                            closeConfirm: true
                        });
                    }
                } else {
                    $("body").overhang({
                        type: "error",
                        primary: "#f84a1d",
                        accent: "#d94e2a",
                        message: "La descripción de la variable debe tener una longitud menor a 701.",
                        overlay: true,
                        closeConfirm: true
                    });
                }
            } else {
                $("body").overhang({
                    type: "error",
                    primary: "#f84a1d",
                    accent: "#d94e2a",
                    message: "Seleccione una tabla para la variable.",
                    overlay: true,
                    closeConfirm: true
                });
            }
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "El nombre de la variable debe tener una longitud mayor a 0 y menor a 61.",
                overlay: true,
                closeConfirm: true
            });
        }
    } );

    $('#datatable_variablesOfVariables tbody').on( 'click', 'tr a.deleteVariablOfVariablee', function () {
        var data = table.row( $(this).parents('tr') ).data();
        deleteVariableOfVariable(data.ID, data.nombre);
    } );

    $('#datatable_variablesOfVariables tbody').on( 'click', 'tr a.customizeVariableOfVariable', function () {
        var data = table.row( $(this).parents('tr') ).data();
        goRules(data.ID);
    } );
}

function deleteVariableOfVariable (id, nombre) {
	$("body").overhang({
	  	type: "confirm",
	  	primary: "#f5a433",
	  	accent: "#dc9430",
	  	yesColor: "#3498DB",
	  	message: 'Esta seguro que desea eliminar a '+nombre+'?',
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
                    request.query("delete from Reglas where variablePadre = "+id+" ", (err, result) => {
                        if (err) {
                            console.log(err);
                            if (!rolledBack) {
                                transaction.rollback(err => {
                                    $("body").overhang({
                                        type: "error",
                                        primary: "#f84a1d",
                                        accent: "#d94e2a",
                                        message: "Error en eliminación sub-variables de: "+nombre+".",
                                        overlay: true,
                                        closeConfirm: true
                                    });
                                });
                            }
                        }  else {
                            transaction.commit(err => {
                                // ... error checks
                                const transaction1 = new sql.Transaction( pool1 );
                                transaction1.begin(err => {
                                    var rolledBack1 = false;
                                    transaction1.on('rollback', aborted => {
                                        // emited with aborted === true
                                        rolledBack1 = true;
                                    });
                                    const request1 = new sql.Request(transaction1);
                                    request1.query("delete from VariablesdeVariablesFormula where ID = "+id+" ", (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            if (!rolledBack1) {
                                                transaction1.rollback(err => {
                                                    $("body").overhang({
                                                        type: "error",
                                                        primary: "#f84a1d",
                                                        accent: "#d94e2a",
                                                        message: "Error en eliminación de la variable "+nombre+".",
                                                        overlay: true,
                                                        closeConfirm: true
                                                    });
                                                });
                                            }
                                        }  else {
                                            transaction1.commit(err => {
                                                // ... error checks
                                                $("body").overhang({
                                                    type: "success",
                                                    primary: "#40D47E",
                                                    accent: "#27AE60",
                                                    message: "Variable eliminada con exito.",
                                                    duration: 1,
                                                    overlay: true
                                                });
                                                loadVariableVariables();
                                            });
                                        }
                                    });
                                }); // fin sub-transaction
                            });
                        }
                    });
                }); // fin transaction
	    	}
	  	}
	});
}
//	**********		Fin Variables		**********











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

function goRules (index) {
    var variableID = arregloVariableDeVariables.filter(function(object) {
                        return (object.ID == index );
                    });
    var nombreHijo = variableID[0].nombre;
    var descripcionHijo = variableID[0].descripcion;
    var factorHijo = variableID[0].factor;
    var tablaHijo = variableID[0].tablaAplicar;
    setVariableDeVariableID(variableID[0].ID);
    setNombreHijo(nombreHijo);
    setDescripcionHijo(descripcionHijo);
    setFactorHijo(factorHijo);
    setTablaHijo(tablaHijo);
    if(tablaHijo == 1) {
        var encontroLista = arregloListas.filter(function(object) {
                    return (object.tipo == 1 );
                });
        var encontroElementoDeLista = false;
        for (var i = 0; i < arregloListasVariablesTotes.length; i++) {
            if(arregloListasVariablesTotes[i].idLista == encontroLista[0].ID) {
                encontroElementoDeLista = true;
                break;
            }
        };
        if(encontroElementoDeLista) {
            cleanup();
            $("#app_root").empty();
            $("#app_root").load("src/variableDetailALAC.html");
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Cree un elemento de la lista de Manual Contable primero.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else if(tablaHijo == 2) {
        if(montoFosedeGlobal != null && montoFosedeGlobal != 0) {
            cleanup();
            $("#app_root").empty();
            $("#app_root").load("src/variableDetail.html");
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Ingrese un valor para el monto FOSEDE.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else if(tablaHijo == 3) {
        cleanup();
        $("#app_root").empty();
        $("#app_root").load("src/variableDetailCredito.html");
    }
}

function goRCL () {
    cleanup();
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
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
    delete window.loadVariablesIMG;
    /*delete window.filepathFullLogo;
    delete window.filepathSmallLogo;*/
    delete window.loadVariablesIMG;
    delete window.variablesDBGlobal;
    delete window.montoFosedeGlobal;
    delete window.loadVariablesMainDB;
    delete window.formulaMATHLIVEGlobal;
    delete window.verifyAndSaveFormula;
    delete window.existenVariables;
    delete window.getVariable;
    delete window.balanceEquacion;
    delete window.existeArregloVariables;
    delete window.existeArregloVariablesDeVariables;
    delete window.printVariables;
    delete window.createFormulaVariablesDB;
    delete window.updateFormulaVariablesDB;
    delete window.arregloVariables;
    delete window.arregloVariableDeVariables;
    delete window.loadVariables;
    delete window.loadVariablesTable;
    delete window.exportTableToCSV;
    delete window.download_csv;
    delete window.format;
    delete window.mathfieldVariable;
    delete window.initMathField;
    delete window.resetFormulaVariable;
    delete window.saveFormulaVariable;
    delete window.saveSubVariableFormula;
    delete window.existenVariablesSubVar;
    delete window.mismaVariablesSubVar;
    delete window.getVariableSubVar;
    delete window.updateVariableFormula;
    delete window.saveNewVariable;
    delete window.modifyVariable;
    delete window.deleteVariable;
    delete window.loadVariableVariables;
    delete window.createVariableDeVariable;
    delete window.updateVariableDeVariable;
    delete window.deleteVariableDeVariable;
    delete window.loadVariablesofVariableTable;
    delete window.deleteVariableOfVariable;
    delete window.goVariables;
    delete window.goHome;
    delete window.goUsers;
    delete window.goConnections;
    delete window.logout;
    delete window.goRules;
    delete window.goRCL;
    delete window.cleanup;
};