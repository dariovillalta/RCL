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
		loadVariables();
		loadVariableVariables();
		loadVariablesMainDB();
		loadVariablesIMG();
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


/*****************TIPO DE LISTAS*****************
*   1)Manual Contable                           *
*   2)Cuentas Operativas                        *
*   3)Exclusiones FOSEDE                        *
*   4)Tipo de Personas                          *
*   5)Tipo de Sub-Personas                      *
*   6)Cuentas Operativas Clientes               *
*   7)Agencias                                  *
*   8)Tipos Crédito                             *
*   8)Tipos Deposito                            *
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

var montoFosedeGlobal = null;
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
                    	if(result.recordset[0].montoFosede > 1)
                    		montoFosedeGlobal = result.recordset[0].montoFosede;
                    	else
                    		montoFosedeGlobal = 0.00;

                    	var textoFOSEDE = montoFosedeGlobal.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                    	$("#montoActual").text("L. "+textoFOSEDE);
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
                    } else {
                    	montoFosedeGlobal = null;
                    	$("#montoActual").text("L. 0.00");
                    }
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
        request.query("insert into Variables (fullLogo, smallLogo, formula, formulaMATHLIVE, montoFosede) values ('', '', '"+equacion+"', '"+formulaMATHLIVE+"', 0)", (err, result) => {
            if (err) {
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
					  	duration: 2,
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
					  	duration: 2,
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
		}]
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
                    div+='<div id="formulaVariable'+rowdata.ID+'" class="formula_style">';
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
    if(arregloVariableDeVariables.length > 0) {
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
                        message: "Variable modificada con exito.",
                        duration: 2,
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
        								  	duration: 2,
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
					  	message: "Variable modificada con exito.",
					  	duration: 2,
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
            									  	duration: 2,
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
}

function updateVariableDeVariable (row) {
	var nombre = row.nombre;
	var descripcion = row.descripcion;
	var factor = row.factor;
    var tabla = row.tablaAplicar;
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
										  	message: "Variable modificada con exito.",
										  	duration: 2,
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
								  	duration: 2,
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
                    deleteVariableOfVariable(data.ID, data.nombre);
            }
        });
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
			        request.query("delete from VariablesdeVariablesFormula where ID = "+id+" ", (err, result) => {
			            if (err) {
			                if (!rolledBack) {
			                    transaction.rollback(err => {
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
			                transaction.commit(err => {
			                    // ... error checks
			                    $("body").overhang({
								  	type: "success",
								  	primary: "#40D47E",
					  				accent: "#27AE60",
								  	message: "Variable eliminada con exito.",
								  	duration: 2,
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
//	**********		Fin Variables		**********





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
	loadListListsExcel();
}

//$("#elementoSaldo").val("0");//para que no tire error al crear sin mover de dropdown
function showListsFields (idLista) {
    var tipoLista = arregloListas.filter(function(object) {
                        return object.ID == idLista;
                    });
    if(tipoLista[0].tipo == 1 || tipoLista[0].tipo == 2) { //Manual Contable
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

function loadListListsExcelAfterImport (idLista) {
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
                    var encontroLista = arregloListas.filter(function(object) {
                        return (object.tipo == 1 );
                    });
                    loadListListsExcelAfterImport(encontroLista[0].ID);
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
    //var tipo = $("input[name='listaValorRadioALAC']").val();
    var tipo = 10;
	if(nombre.length > 0 && nombre.length < 61){
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
						  	duration: 2,
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
											  	duration: 2,
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
								  	duration: 2,
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
    if(listaSeleccionada[0].tipo == 1 || listaSeleccionada[0].tipo == 2) { // Manual Contable y Cuentas Op Balance Gen
        nombre = $("#elementoNombre").val();
        valor = $("#elementoValor").val();
        fechaCreacion = $('#fechaCreacionManCon').datepicker('getDate');
        fechaCaducidad = $('#fechaCaducidadManCon').datepicker('getDate');
    } else if(listaSeleccionada[0].tipo == 6) { // Cuentas Operativas
        nombre = $("#elementoNombre").val();
        valor = $("#elementoValor").val();
        saldo = parseFloat($("#saldoCueOp").val());
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
        valor = '';
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
        				if(valor.length > 0 && valor.length < 51){
                            if(saldo.toString().length > 0){
                                if( (listaSeleccionada[0].tipo == 6 && puesto.length>0) || (listaSeleccionada[0].tipo == 3 && puesto.length>0) || listaSeleccionada[0].tipo == 1 || listaSeleccionada[0].tipo == 2 || listaSeleccionada[0].tipo == 4 || listaSeleccionada[0].tipo == 5 || listaSeleccionada[0].tipo == 7 || listaSeleccionada[0].tipo == 8 || listaSeleccionada[0].tipo == 10) {
                                    if(!isNaN(saldo)) {
                    					const transaction = new sql.Transaction( pool1 );
                    				    transaction.begin(err => {
                    				        var rolledBack = false;
                    				        transaction.on('rollback', aborted => {
                    				            // emited with aborted === true
                    				            rolledBack = true;
                    				        });
                    				        const request = new sql.Request(transaction);
                    				        request.query("insert into ListasVariables (idLista, nombre, valor, saldo, fechaCreacion, fechaCaducidad, puesto) values ("+idLista+",'"+nombre+"','"+valor+"',"+saldo+",'"+formatDateCreation(fechaCreacion)+"','"+formatDateCreation(fechaCaducidad)+"','"+puesto+"')", (err, result) => {
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
                    									  	duration: 2,
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
	var nombre = $("#elementoNombreUpdate").val();
	var valor = $("#elementoValorUpdate").val();
	if(idLista.length > 0) {
		if(nombre.length > 0 && nombre.length < 121){
			if(nombre.length > 0 && nombre.length < 51){
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
						        request.query("update ListasVariables set idLista = "+idLista+", nombre = '"+nombre+"', valor = '"+valor+"' where ID = "+listasVariablesSeleccionada.ID, (err, result) => {
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
											  	message: "Elemento de lista modificado con éxito.",
											  	duration: 2,
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
								  	duration: 2,
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
	$('#elementoNombreUpdate').val(listasVariablesSeleccionada.nombre);
	$('#elementoValorUpdate').val(listasVariablesSeleccionada.valor);
	$('#modalElement').modal('toggle');
}

$("input[name='listaRadio']").on('ifChanged', function(event){
    var valor = $("input[name='listaRadio']:checked").val();
    if (valor != undefined) {
        if(valor == 1) {
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
        } else if(valor == 2) {
            $('#labelNombreExcel').text("Columna de Nombre de Elemento");
            $('#labelCuentaExcel').text("Columna de Cuenta de Elemento");
            $('#labelFechaCreacionExcel').text("Columna de ID de Cliente de Elemento");
            $('#labelFechaCaducidadExcel').text("Columna de Saldo de la cuenta del Elemento");
            $("#nombreCuenta").attr("placeholder", "Nombre de Elemento");
            $("#numeroCuenta").attr("placeholder", "Cuenta de Elemento");
            $("#fechaCreacionModal").attr("placeholder", "ID de Cliente");
            $("#fechaCaducidadModal").attr("placeholder", "Saldo de cuenta");
            $('#saldoModalField').hide();
            $('#fechasModalField').show();
        } else if(valor == 3) {
            $('#labelNombreExcel').text("Columna de Nombre de Cliente");
            $('#labelCuentaExcel').text("Columna de ID de Cliente");
            $('#labelModalExcel').text("Columna de Nombre de puesto de la persona");
            $("#nombreCuenta").attr("placeholder", "Nombre de Cliente");
            $("#numeroCuenta").attr("placeholder", "ID de Cliente");
            $("#saldoCuenta").attr("placeholder", "Nombre de puesto");
            $('#fechasModalField').hide();
            $('#saldoModalField').show();
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
            extensions: "xls|xlsx|xlsm|xlsb|xml|xlw|xlc|csv|txt|dif|sylk|slk|prn|ods|fods|uos|dbf|wks|123|wq1|qpw".split("|")
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
    } else {
        $("body").overhang({
            type: "error",
            primary: "#f84a1d",
            accent: "#d94e2a",
            message: "Error al abrir archivo de excel.",
            overlay: true,
            closeConfirm: true
        });
    }
}

function importExcel () {
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
    } else if(valorTipoLista == 2) {
        textoTipoLista = 'el saldo de cuenta';
        textoTipoListaCuenta = 'número de cuenta';
    } else if(valorTipoLista == 2) {
        textoTipoLista = 'el nombre del puesto';
        textoTipoListaCuenta = 'id de cliente';
    }
	if(columnaNumero.length > 0) {
		if( columnaNumero.length == 0 || isNaN(columnaNumero) ) {
            if( (valorTipoLista == 1 && columnaFechaCreacion.length>0) || (valorTipoLista == 2 && columnaFechaCreacion.length>0) || valorTipoLista == 3 ) {
                if( (valorTipoLista == 1 && isNaN(columnaFechaCreacion)) || (valorTipoLista == 2 && isNaN(columnaFechaCreacion)) || valorTipoLista == 3 ) {
                    if( (valorTipoLista == 1 && isNaN(columnaFechaCaducidad)) || valorTipoLista == 2 || valorTipoLista == 3 ) {
                        if( (valorTipoLista == 1 && isNaN(columnaFechaCaducidad)) || valorTipoLista == 2 || valorTipoLista == 3 ) {
            				if(columnaNombre.length > 0) {
            					if( isNaN(columnaNombre) ) {
                                    if( (valorTipoLista == 1) || (valorTipoLista == 2) || (valorTipoLista == 3 && columnaSaldo.length > 0) ) {
                                        if( (valorTipoLista == 1) || (valorTipoLista == 2) || (valorTipoLista == 3 && isNaN(columnaSaldo)) ) {
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
                                                                    nombreLista = 'Cuentas Operativas';
                                                                    tipo = 2;
                                                                } else {
                                                                    nombreLista = 'Exclusiones FOSEDE';
                                                                    tipo = 3;
                                                                }
                    											var arregloDeElementos = [];
                    											var idLista = arregloListas.length+1;
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
                                                                            if(sheet[columnaNombre+i] != undefined && sheet[columnaNombre+i].v.length > 0 && sheet[columnaNumero+i] != undefined && (sheet[columnaNumero+i].v.length > 0 || sheet[columnaNumero+i].v.toString().length > 0) && sheet[columnaSaldo+i] != undefined && (sheet[columnaSaldo+i].v.length > 0 || sheet[columnaSaldo+i].v.toString().length)) {
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
                                                                                if(sheet[columnaNombre+i] != undefined || sheet[columnaNumero+i] != undefined || sheet[columnaFechaCreacion+i] != undefined || sheet[columnaFechaCaducidad+i] != undefined) {
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
                                                                loadLists();
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
        request.query("insert into Listas (nombre, tipo) values ('"+nombre+"',"+tipo+")", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en crear lista "+nombre+".",
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
        request.query("insert into ListasVariables (idLista, nombre, valor, saldo, fechaCreacion, fechaCaducidad, puesto) values ("+idLista+",'"+nombre+"','"+valor+"',"+saldo+",'"+fechaCreacion+"','"+fechaCaducidad+"','"+puesto+"')", (err, result) => {
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
                duration: 2,
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
	if($("#dollarInput").val().length > 0 || $("#lempiraInput").val().length > 0 || $("#euroInput").val().length > 0){
        if( ($("#dollarInput").val().length > 0 && $("#lempiraInputCambio").val().length > 0) || ($("#euroInput").val().length > 0 && $("#lempiraInputCambio").val().length > 0) || $("#lempiraInput").val().length > 0 ) {
    		var tasa, montoF;
    		if( $('#dollarInputRadio').is(':checked') ) {
    			montoF = parseFloat($("#dollarInput").val().split(" ")[1].replace(/,/g,""));
    			tasa = parseFloat($("#lempiraInputCambio").val().split(" ")[1].replace(/,/g,""));
    		}else if( $('#euroInputRadio').is(':checked') ) {
                montoF = parseFloat($("#euroInput").val().split(" ")[1].replace(/,/g,""));
                tasa = parseFloat($("#lempiraInputCambio").val().split(" ")[1].replace(/,/g,""));
            } else {
    			montoF = parseFloat($("#lempiraInput").val().split(" ")[1].replace(/,/g,""));
    			tasa = 1;
    		}
    		var fosede;
    		fosede = math.round(montoF, 4);
            tasa = math.round(tasa, 4);
            fosede = math.multiply(math.bignumber(fosede), math.bignumber(tasa));
    		if( fosede > 0){
    			var textoFOSEDE;
    			if(montoFosedeGlobal == null)
    				textoFOSEDE = '0.00';
    			else
    				textoFOSEDE = montoFosedeGlobal.toString();
    			var nuevoFosede = fosede.toString();
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
    						if(variablesDBGlobal == null)
    							createFOSEDEVariablesDB(fosede);
    						else 
    							updateFOSEDEVariablesDB(fosede);
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

function createFOSEDEVariablesDB (montoFosede) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Variables (fullLogo, smallLogo, formula, formulaMATHLIVE, montoFosede) values ('', '', '', '', "+montoFosede+")", (err, result) => {
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
					  	message: "Variable modificada con exito.",
					  	duration: 2,
					  	overlay: true
					});
                    loadVariablesMainDB();
                });
            }
        });
    }); // fin transaction
}

function updateFOSEDEVariablesDB (montoFosede) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("update Variables set montoFosede = "+montoFosede+" where ID = 1", (err, result) => {
            if (err) {
                if (!rolledBack) {
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
					  	message: "Variable modificada con exito.",
					  	duration: 2,
					  	overlay: true
					});
                    loadVariablesMainDB();
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

function logout () {
	$("#app_root").empty();
    cleanup();
    $("#app_root").load("src/login.html");
	session.defaultSession.clearStorageData([], (data) => {});
}

function goReports () {
    $("#app_root").empty();
    cleanup();
    $("#app_root").load("src/reportes.html");
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
        var encontroElementoDeLista = arregloListasVariables.filter(function(object) {
                    if(encontroLista.length == 0)
                        return false;
                    return (encontroLista[0].ID == object.idLista);
                });
        if(encontroElementoDeLista.length > 0 ) {
            $("#app_root").empty();
            cleanup();
            $("#app_root").load("src/variableDetailALAC.html");
        } else {
            $("body").overhang({
                type: "error",
                primary: "#f84a1d",
                accent: "#d94e2a",
                message: "Cree una elemento de la lista de Manual Contable primero.",
                overlay: true,
                closeConfirm: true
            });
        }
    } else if(tablaHijo == 2) {
        if(montoFosedeGlobal != null && montoFosedeGlobal != 0) {
            $("#app_root").empty();
            cleanup();
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
        $("#app_root").empty();
        cleanup();
        $("#app_root").load("src/variableDetailCredito.html");
    }
}

function goRCL () {
	$("#app_root").empty();
    cleanup();
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
    delete window.filepathFullLogo;
    delete window.filepathSmallLogo;
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