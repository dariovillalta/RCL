const electron = require('electron');
const path = require('path');
const remote = require('electron').remote;
const sql = require('mssql');
const XLSX = require('xlsx-style');

const config = {
    user: 'admin',
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
		loadVariables();
		loadVariableVariables();
		loadVariablesMainDB();
		loadVariablesIMG();
		loadLists();
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


/*****************TIPO DE LISTAS*****************
*   1)Manual Contable                           *
*   2)Cuentas Operativas                        *
*   3)Exclusiones FOSEDE                        *
*   4)Tipo de Personas                          *
*   5)Tipo de Sub-Personas                      *
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

var montoFosedeGlobal = null;
var variablesDBGlobal = null;

function loadVariablesMainDB () {
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
			equacion.charAt(i) != "√" && equacion.charAt(i) != "+" && equacion.charAt(i) != "-" && isNaN(equacion.charAt(i)))
			variable+=equacion[i];
		else
			return variable;
	};
	return variable;
}

function balanceEquacion (equacion) {
    console.log('equacion');
    console.log(equacion);
    var partesEquacion = equacion.split("=");
    console.log('partesEquacion');
    console.log(partesEquacion);
    if(partesEquacion.length == 1)
        return 0;
    else if(partesEquacion.length > 2)
        return 1;
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
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("insert into Variables (fullLogo, smallLogo, formula, formulaMATHLIVE, montoFosede) values ('', '', '"+equacion+"', '"+formulaMATHLIVE+"', 0)", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Insert FOSEDE Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed Insert FOSEDE Variables");
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
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("update Variables set formula = '"+equacion+"', formulaMATHLIVE = '"+formulaMATHLIVE+"' where ID = 1", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack update FOSEDE Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed update FOSEDE Variables");
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
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from FormulaVariables", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed Variables");
                    console.log(result);
                    if(result.recordset.length > 0){
                    	arregloVariables = result.recordset;
                    	console.log('arregloVariables');
                    	console.log(arregloVariables);
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
		},
        /*{
            "targets": 5,
            "className": "text-center",
            "render": function (data, type, row, meta) {
                var content = '';
                if(row["null"])
                    return data;
                else {
                    if(row.tablaAplicar == 1)
                        content+='<td> <div class="select-style" style="width:10em;"><select id="variablesTabla'+row.ID+'" required="required"> <option value="1" selected="selected">Activos</option> <option value="2">Depósitos</option> <option value="0">Ninguna Tabla</option> </select></div> </td>';
                    else if(row.tablaAplicar == 2)
                        content+='<td> <div class="select-style" style="width:10em;"><select id="variablesTabla'+row.ID+'" required="required"> <option value="1">Activos</option> <option value="2" selected="selected">Depósitos</option> <option value="0">Ninguna Tabla</option> </select></div> </td>';
                    else
                        content+='<td> <div class="select-style" style="width:10em;"><select id="variablesTabla'+row.ID+'" required="required"> <option value="1">Activos</option> <option value="2">Depósitos</option> <option value="0" selected="selected">Ninguna Tabla</option> </select></div> </td>';
                    return content;
                }
            }
        }*/]
	});
	if ( $.fn.dataTable.isDataTable( '#datatable_variables' ) )
		table.MakeCellsEditable("destroy");

	table.row.add( {
		"null": "<td class='details-control'></td>",
        "ID": id,
        "nombre": "<input type='text' id='nombre"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "variables": "<input type='text' id='variables"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "descripcion": "<input type='text' id='descripcion"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        //"tablaAplicar": "<div class='select-style'><select id='tabla"+id+"' required='required'> <option value='1'>Activos</option> <option value='2'>Depósitos</option> <option value='0'>Ninguna Tabla</option> </select></div>",
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
    console.log('csvFile');
    console.log(csvFile);
 
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
    var arregloVariablesAsociadas = jQuery.grep(arregloVariableDeVariables, function( object ) {
        return object.idVariable === rowdata.ID;
    });
	var div = '<div style="padding: 0% 3%; margin: -1% 0% -3% 0%;">';
	var tabla = '<table class="table table-bordered">'+
			      '<thead>'+
			        '<tr>'+
			          '<th>#</th>'+
			          '<th>Nombre</th>'+
			          '<th>Descripción</th>'+
			          '<th>Factor</th>'+
                      '<th>Tabla</th>'+
			          '<th>Guardar</th>'+
			          '<th>Borrar</th>'+
			        '</tr>'+
			      '</thead>'+
			      '<tbody>';
	for (var i = 0; i < arregloVariablesAsociadas.length; i++) {
		tabla+= '<tr><td>'+(i+1)+'</td><td> <input type="text" id="variablesdeVariablesNombre'+rowdata.ID+''+i+'" required="required" class="form-control" value="'+arregloVariablesAsociadas[i].nombre+'"> </td>';
		tabla+='<td> <input type="text" id="variablesdeVariablesDescripcion'+rowdata.ID+''+i+'" required="required" class="form-control" value="'+arregloVariablesAsociadas[i].descripcion+'"> </td>';
		tabla+='<td> <input type="text" id="variablesdeVariablesFactor'+rowdata.ID+''+i+'" required="required" class="form-control" value="'+arregloVariablesAsociadas[i].factor+'"> </td>';
        if(arregloVariablesAsociadas[i].tablaAplicar == 1)
            tabla+='<td> <div class="select-style" style="width:10em;"><select id="variablesdeVariablesTabla'+rowdata.ID+''+i+'" required="required"> <option value="1" selected="selected">Balance General</option> <option value="2">Captaciones</option> <option value="3">Prestamos</option> <option value="4">Cartera de Crédito</option> </select></div> </td>';
        else if(arregloVariablesAsociadas[i].tablaAplicar == 2)
            tabla+='<td> <div class="select-style" style="width:10em;"><select id="variablesdeVariablesTabla'+rowdata.ID+''+i+'" required="required"> <option value="1">Balance General</option> <option value="2" selected="selected">Captaciones</option> <option value="3">Prestamos</option> <option value="4">Cartera de Crédito</option> </select></div> </td>';
        else if(arregloVariablesAsociadas[i].tablaAplicar == 3)
            tabla+='<td> <div class="select-style" style="width:10em;"><select id="variablesdeVariablesTabla'+rowdata.ID+''+i+'" required="required"> <option value="1">Balance General</option> <option value="2">Captaciones</option> <option value="3" selected="selected">Prestamos</option> <option value="4">Cartera de Crédito</option> </select></div> </td>';
        else if(arregloVariablesAsociadas[i].tablaAplicar == 4)
            tabla+='<td> <div class="select-style" style="width:10em;"><select id="variablesdeVariablesTabla'+rowdata.ID+''+i+'" required="required"> <option value="1">Balance General</option> <option value="2">Captaciones</option> <option value="3">Prestamos</option> <option value="4" selected="selected">Cartera de Crédito</option> </select></div> </td>';
        /*else
            tabla+='<td> <div class="select-style" style="width:10em;"><select id="variablesdeVariablesTabla'+rowdata.ID+''+i+'" required="required"> <option value="1">Activos</option> <option value="2">Depósitos</option> <option value="0" selected="selected">Ninguna Tabla</option> </select></div> </td>';*/
		tabla+='<td><a class="btn btn-app" onclick="updateVariableDeVariable('+arregloVariablesAsociadas[i].ID+','+i+','+rowdata.ID+')"> <i class="fa fa-save"></i> Guardar </a></td>';
		tabla+='<td><a class="btn btn-app" onclick="deleteVariableDeVariable('+arregloVariablesAsociadas[i].ID+','+arregloVariablesAsociadas[i].Nombre+')"> <i class="fa fa-eraser"></i> Eliminar </a></td></tr>';
	};
    //Nombres Originales
    //tabla+='<td> <div class="select-style" style="width:10em;"><select id="variablesdeVariablesTabla'+rowdata.ID+''+i+'" required="required"> <option value="1" selected="selected">Balance General/Manual Contable</option> <option value="2">Depósitos/Captaciones</option> <option value="3">Prestamos/Crédito</option> <option value="4">Cartera de Crédito/Linea de Crédito</option> </select></div> </td>';

	//Add new
	tabla+= '<tr><td></td><td> <input type="text" id="variablesdeVariablesNombre'+rowdata.ID+'" required="required" class="form-control"> </td>';
	tabla+='<td> <input type="text" id="variablesdeVariablesDescripcion'+rowdata.ID+'" required="required" class="form-control"> </td>';
	tabla+='<td> <input type="text" id="variablesdeVariablesFactor'+rowdata.ID+'" required="required" class="form-control"> </td>';
    tabla+='<td> <div class="select-style" style="width:10em;"><select id="variablesdeVariablesTabla'+rowdata.ID+'" required="required"> <option value="1" selected="selected">Balance General</option> <option value="2">Captaciones</option> <option value="3">Prestamos/Crédito</option> <option value="4">Cartera de Crédito</option> </select></div> </td>';
	tabla+='<td><a class="btn btn-app" onclick="createVariableDeVariable('+rowdata.ID+')"> <i class="fa fa-save"></i> Guardar </a></td>';
	tabla+='<td></td></tr>';
	tabla+='</tbody>'+
	    	'</table>';
	div+=tabla;
	div+='</div>';
    return div;
}

function saveNewVariable (index) {
	var nombre = $("#nombre"+index).val();
	var variables = $("#variables"+index).val();
	var descripcion = $("#descripcion"+index).val();
	if(nombre.length > 0 && nombre.length < 61){
		if(variables.length > 0 && variables.length < 11){
			if(descripcion.length < 701){
				const transaction = new sql.Transaction( pool1 );
			    transaction.begin(err => {
			        var rolledBack = false
			 
			        transaction.on('rollback', aborted => {
			            // emited with aborted === true
			     
			            rolledBack = true
			        })
			        const request = new sql.Request(transaction);
			        request.query("insert into FormulaVariables (nombre, variables, descripcion) values ('"+nombre+"', '"+variables+"', '"+descripcion+"')", (err, result) => {
			            if (err) {
			                if (!rolledBack) {
			                    console.log('error en rolledBack New Variables');
			                    transaction.rollback(err => {
			                        console.log('error en rolledBack');
			                        console.log(err);
			                    });
			                }
			            }  else {
			                transaction.commit(err => {
			                    // ... error checks
			                    console.log("Transaction committed New Variables");
			                    console.log(result);
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
}

function modifyVariable (row) {
    var nuevaTabla = $("#variablesTabla"+row.ID).val();
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("update FormulaVariables set nombre = '"+row.nombre+"', variables = '"+row.variables+"', descripcion = '"+row.descripcion+"', tablaAplicar = "+nuevaTabla+" where ID = '"+row.ID+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Update Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed Update Variables");
                    console.log(result);
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
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("delete from FormulaVariables where ID = '"+row.ID+"' ", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Delete Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed Delete Variables");
                    console.log(result);
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
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from VariablesdeVariablesFormula", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed VariablesdeVariables");
                    console.log(result);
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
	var factor = $("#variablesdeVariablesFactor"+rowdataID).val();
    var tabla = $("#variablesdeVariablesTabla"+rowdataID).val();
	if(nombre.length > 0 && nombre.length < 41){
		if(descripcion.length < 701){
			if(factor.length > 0){
				if(!isNaN(factor)){
                    if(tabla.length > 0 && !isNaN(tabla)) {
    					const transaction = new sql.Transaction( pool1 );
    				    transaction.begin(err => {
    				        var rolledBack = false
    				 
    				        transaction.on('rollback', aborted => {
    				            // emited with aborted === true
    				     
    				            rolledBack = true
    				        })
    				        const request = new sql.Request(transaction);
    				        request.query("insert into VariablesdeVariablesFormula (idVariable, nombre, descripcion, factor, tablaAplicar) values ("+rowdataID+", '"+nombre+"', '"+descripcion+"', "+factor+", "+tabla+")", (err, result) => {
    				            if (err) {
    				                if (!rolledBack) {
    				                    console.log('error en rolledBack Insert VariablesdeVariables');
    				                    transaction.rollback(err => {
    				                        console.log('error en rolledBack');
    				                        console.log(err);
    				                    });
    				                }
    				            }  else {
    				                transaction.commit(err => {
    				                    // ... error checks
    				                    console.log("Transaction committed Insert VariablesdeVariables");
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
}

function updateVariableDeVariable (variableID, index, parentVariableId) {
	var nombre = $("#variablesdeVariablesNombre"+parentVariableId+""+index).val();
	var descripcion = $("#variablesdeVariablesDescripcion"+parentVariableId+""+index).val();
	var factor = $("#variablesdeVariablesFactor"+parentVariableId+""+index).val();
    var tabla = $("#variablesdeVariablesTabla"+parentVariableId+""+index).val();
	if(nombre.length > 0 && nombre.length < 41){
		if(descripcion.length < 701){
			if(factor.length > 0){
				if(!isNaN(factor)){
                    if(!isNaN(tabla) && tabla.length > 0){
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
    					    	if(value){
    					    		const transaction = new sql.Transaction( pool1 );
    							    transaction.begin(err => {
    							        var rolledBack = false
    							 
    							        transaction.on('rollback', aborted => {
    							            // emited with aborted === true
    							     
    							            rolledBack = true
    							        })
    							        const request = new sql.Request(transaction);
    							        request.query("update VariablesdeVariablesFormula set nombre = '"+nombre+"', descripcion = '"+descripcion+"', factor = "+factor+", tablaAplicar = "+tabla+" where ID = "+variableID+" ", (err, result) => {
    							            if (err) {
    							                if (!rolledBack) {
    							                    console.log('error en rolledBack Update VariablesdeVariables');
    							                    transaction.rollback(err => {
    							                        console.log('error en rolledBack');
    							                        console.log(err);
    							                    });
    							                }
    							            }  else {
    							                transaction.commit(err => {
    							                    // ... error checks
    							                    console.log("Transaction committed Update VariablesdeVariables");
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
    					    	}
    					  	}
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
			        var rolledBack = false
			 
			        transaction.on('rollback', aborted => {
			            // emited with aborted === true
			     
			            rolledBack = true
			        })
			        const request = new sql.Request(transaction);
			        request.query("delete from VariablesdeVariablesFormula where ID = "+variableID+" ", (err, result) => {
			            if (err) {
			                if (!rolledBack) {
			                    console.log('error en rolledBack Delete VariablesdeVariables');
			                    transaction.rollback(err => {
			                        console.log('error en rolledBack');
			                        console.log(err);
			                    });
			                }
			            }  else {
			                transaction.commit(err => {
			                    // ... error checks
			                    console.log("Transaction committed Delete VariablesdeVariables");
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
	$("#datatable_variablesOfVariables").find("tr:gt(0)").remove();
	var html = '';
    for(var i = 0; i < arregloVariableDeVariables.length; i++){
        var nombreTablaAplicar;
        if(arregloVariableDeVariables[i].tablaAplicar == 1)
            nombreTablaAplicar = 'Activos';
        else if(arregloVariableDeVariables[i].tablaAplicar == 2)
            nombreTablaAplicar = 'Depósitos';
        html += '<tr><td>' + (i+1) + '</td><td>' + arregloVariableDeVariables[i].idVariable + '</td><td>' + arregloVariableDeVariables[i].nombre + '</td><td>' + arregloVariableDeVariables[i].descripcion + '</td><td><button type="button" class="btn btn-success" onclick="goRules('+i+')"><span class="glyphicon glyphicon-pencil"></span></button></td><td><button type="button" class="btn btn-danger" onclick="deleteVariableOfVariable('+i+')"><span class="glyphicon glyphicon-trash"></span></button></td></tr>';
    }
	$('#datatable_variablesOfVariables tr').first().after(html);
}

function deleteVariableOfVariable (index) {
	$("body").overhang({
	  	type: "confirm",
	  	primary: "#f5a433",
	  	accent: "#dc9430",
	  	yesColor: "#3498DB",
	  	message: 'Esta seguro que desea eliminar a '+arregloVariableDeVariables[index].nombre+'?',
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
			        request.query("delete from VariablesdeVariablesFormula where ID = "+arregloVariableDeVariables[index].ID+" ", (err, result) => {
			            if (err) {
			                if (!rolledBack) {
			                    console.log('error en rolledBack Delete VariablesdeVariables');
			                    transaction.rollback(err => {
			                        console.log('error en rolledBack');
			                        console.log(err);
			                    });
			                }
			            }  else {
			                transaction.commit(err => {
			                    // ... error checks
			                    console.log("Transaction committed Delete VariablesdeVariables");
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
        request.query("select * from Listas where tipo <> 4 and tipo <> 5", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Listas');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed Listas");
                    console.log(result);
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
	loadListLists();
}

$("#elementoSaldo").val("0");//para que no tire error al crear sin mover de dropdown
function showListsFields (idLista) {
    var tipoLista = arregloListas.filter(function(object) {
                        return object.tipo == idLista;
                    });
    if(tipoLista[0].tipo == 1) { //Manual Contable
        $("#elementoNombre").attr("placeholder", "Ingrese nombre de cuenta");
        $("#elementoValor").attr("placeholder", "Ingrese número de cuenta");
        $("#elementoValor").show();
        $("#saldoCuenOpField").hide();
        $("#elementoNombre").val("");
        $("#elementoValor").val("");
        $("#elementoSaldo").val("0");
    } else if(tipoLista[0].tipo == 2) { //Cuentas Operativas
        $("#elementoNombre").attr("placeholder", "Ingrese nombre de cuenta");
        $("#elementoValor").attr("placeholder", "Ingrese ID de cliente");
        $("#elementoValor").show();
        $("#saldoCuenOpField").show();
        $("#elementoNombre").val("");
        $("#elementoValor").val("");
        $("#elementoSaldo").val("");
    } else if(tipoLista[0].tipo == 3) { //Exclusiones FOSEDE
        $("#elementoNombre").attr("placeholder", "Ingrese ID de persona");
        $("#elementoValor").hide();
        $("#saldoCuenOpField").hide();
        $("#elementoNombre").val("");
        $("#elementoValor").val("1");
        $("#elementoSaldo").val("0");
    }
}

function loadListLists () {
	var idLista = $("#elementosDeListaUpdate").val();
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables where idLista = "+idLista, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Listas Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed Listas Variables");
                    console.log(result);
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
    var tipo = $("input[name='listaValorRadioALAC']").val();
	if(nombre.length > 0 && nombre.length < 61){
		const transaction = new sql.Transaction( pool1 );
	    transaction.begin(err => {
	        var rolledBack = false
	 
	        transaction.on('rollback', aborted => {
	            // emited with aborted === true
	     
	            rolledBack = true
	        })
	        const request = new sql.Request(transaction);
	        request.query("insert into Listas (nombre, tipo) values ('"+nombre+"', "+tipo+")", (err, result) => {
	            if (err) {
	                if (!rolledBack) {
	                    console.log('error en rolledBack Listas creation');
	                    transaction.rollback(err => {
	                        console.log('error en rolledBack');
	                        console.log(err);
	                    });
	                }
	            }  else {
	                transaction.commit(err => {
	                    // ... error checks
	                    console.log("Transaction committed Listas creation");
	                    console.log(result);
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
						        var rolledBack = false
						 
						        transaction.on('rollback', aborted => {
						            // emited with aborted === true
						     
						            rolledBack = true
						        })
						        const request = new sql.Request(transaction);
						        request.query("update Listas set nombre = '"+nombre+"' where ID = "+listaId, (err, result) => {
						            if (err) {
						                if (!rolledBack) {
						                    console.log('error en rolledBack Listas creation');
						                    transaction.rollback(err => {
						                        console.log('error en rolledBack');
						                        console.log(err);
						                    });
						                }
						            }  else {
						                transaction.commit(err => {
						                    // ... error checks
						                    console.log("Transaction committed Listas creation");
						                    console.log(result);
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
			        var rolledBack = false
			 
			        transaction.on('rollback', aborted => {
			            // emited with aborted === true
			     
			            rolledBack = true
			        })
			        const request = new sql.Request(transaction);
			        request.query("delete from Listas where ID = "+listaId, (err, result) => {
			            if (err) {
			                if (!rolledBack) {
			                    console.log('error en rolledBack Listas creation');
			                    transaction.rollback(err => {
			                        console.log('error en rolledBack');
			                        console.log(err);
			                    });
			                }
			            }  else {
			                transaction.commit(err => {
			                    // ... error checks
			                    console.log("Transaction committed Listas creation");
			                    console.log(result);
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

function createElementList () {
	var idLista = $("#elementosDeLista").val();
	var nombre = $("#elementoNombre").val();
	var valor = $("#elementoValor").val();
    var saldo = parseFloat($("#elementoSaldo").val());
    /*if(saldo.length == 0)
        saldo = 0;*/
	if(idLista != null) {
		if(idLista.length > 0) {
			if(nombre.length > 0 && nombre.length < 121){
				if(valor.length > 0 && valor.length < 51){
                    if(saldo.toString().length > 0){
                        if(!isNaN(saldo)){
        					const transaction = new sql.Transaction( pool1 );
        				    transaction.begin(err => {
        				        var rolledBack = false
        				 
        				        transaction.on('rollback', aborted => {
        				            // emited with aborted === true
        				     
        				            rolledBack = true
        				        })
        				        const request = new sql.Request(transaction);
        				        request.query("insert into ListasVariables (idLista, nombre, valor, saldo) values ("+idLista+",'"+nombre+"','"+valor+"',"+saldo+")", (err, result) => {
        				            if (err) {
        				                if (!rolledBack) {
        				                    console.log('error en rolledBack Listas Variables');
        				                    transaction.rollback(err => {
        				                        console.log('error en rolledBack');
        				                        console.log(err);
        				                    });
        				                }
        				            }  else {
        				                transaction.commit(err => {
        				                    // ... error checks
        				                    console.log("Transaction committed Listas Variables");
        				                    console.log(result);
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
                                            $("#elementoSaldo").val('');
        									loadListLists();
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
						        var rolledBack = false
						 
						        transaction.on('rollback', aborted => {
						            // emited with aborted === true
						     
						            rolledBack = true
						        })
						        const request = new sql.Request(transaction);
						        request.query("update ListasVariables set idLista = "+idLista+", nombre = '"+nombre+"', valor = '"+valor+"' where ID = "+listasVariablesSeleccionada.ID, (err, result) => {
						            if (err) {
						                if (!rolledBack) {
						                    console.log('error en rolledBack Listas Variables');
						                    transaction.rollback(err => {
						                        console.log('error en rolledBack');
						                        console.log(err);
						                    });
						                }
						            }  else {
						                transaction.commit(err => {
						                    // ... error checks
						                    console.log("Transaction committed Listas Variables");
						                    console.log(result);
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
											loadListLists();
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
			                    console.log('error en rolledBack Listas creation');
			                    transaction.rollback(err => {
			                        console.log('error en rolledBack');
			                        console.log(err);
			                    });
			                }
			            }  else {
			                transaction.commit(err => {
			                    // ... error checks
			                    console.log("Transaction committed Listas creation");
			                    console.log(result);
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
			                    loadListLists();
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

var dialog = remote.dialog;

function importExcel () {
	var nombre = $('#hojaNombre').val();
	var columnaNumero = $('#numeroCuenta').val();
	var columnaNombre = $('#nombreCuenta').val();
	var filaInicial = $('#filaInicial').val();
	var filaFinal = $('#filaFinal').val();
	if(nombre.length > 0) {
		//if(columnaNumero.length > 0) {
			if( columnaNumero.length == 0 || isNaN(columnaNumero) ) {
				if(columnaNombre.length > 0) {
					if( isNaN(columnaNombre) ) {
						if(filaInicial.length > 0) {
							if( !isNaN(filaInicial) ) {
								if(filaFinal.length == 0)
									filaFinal = 0;
								if( !isNaN(filaFinal) ) {
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
										var sheet = workbook.Sheets[nombre];
										if(sheet != null) {
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
											columnaNombre = columnaNombre.toUpperCase();
											filaInicial = parseInt(filaInicial);
											filaFinal = parseInt(filaFinal);
											if(filaFinal != 0){
												for (var i = filaInicial; i <= filaFinal; i++) {
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
    													if(nombreCuenta.length>0)
    														arregloDeElementos.push({idLista: idLista, nombre: nombreCuenta, valor: numeroCuenta});
                                                    }
												};
											} else {
												var finalRow = sheet["!ref"].split(":")[1].replace(/[A-Z]/g, "");
												finalRow = parseInt(finalRow);
												for (var i = filaInicial; i <= finalRow; i++) {
                                                    if(sheet[columnaNombre+i] != undefined && sheet[columnaNombre+i].v.length > 0) {
                                                        console.log('i = '+i);
                                                        console.log('sheet[columnaNombre+i].v');
                                                        console.log(sheet[columnaNombre+i].v);
    													var numeroCuenta = '';
                                                        if(columnaNumero.length>0)
                                                            numeroCuenta = sheet[columnaNumero+i].v;
    													var nombreCuenta = sheet[columnaNombre+i].v;
                                                        if(columnaNumero.length>0)
    													   numeroCuenta = numeroCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
    													nombreCuenta = nombreCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
    													nombreCuenta = nombreCuenta.toLowerCase();
    													nombreCuenta = UpperCasefirst(nombreCuenta);
    													if(nombreCuenta.length>0)
    														arregloDeElementos.push({idLista: idLista, nombre: nombreCuenta, valor: numeroCuenta});
                                                    }
												};
											}
											modifyListExcel(tipo, function(ID) {
                                                var nombreError = '', tieneNombreError = false, valorError = '', tieneValorError = false;
												for (var i = 0; i < arregloDeElementos.length; i++) {
                                                    if(arregloDeElementos[i].nombre.length < 121) {
                                                        if(arregloDeElementos[i].valor.length < 51) {
                                                            createElementListExcel(ID, arregloDeElementos[i].nombre, arregloDeElementos[i].valor);
                                                        } else {
                                                            valorError = arregloDeElementos[i].valor;
                                                            tieneValorError = true;
                                                            break;
                                                        }
                                                    } else {
                                                        nombreError = arregloDeElementos[i].nombre;
                                                        tieneNombreError = true;
                                                        break;
                                                    }
												}
                                                if(tieneNombreError) {
                                                    $("body").overhang({
                                                        type: "error",
                                                        primary: "#f84a1d",
                                                        accent: "#d94e2a",
                                                        message: "Error, la longitud debe ser menor a 121 carácteres para: "+nombreError+".",
                                                        overlay: true,
                                                        closeConfirm: true
                                                    });
                                                }
                                                if(tieneValorError) {
                                                    $("body").overhang({
                                                        type: "error",
                                                        primary: "#f84a1d",
                                                        accent: "#d94e2a",
                                                        message: "Error, la longitud debe ser menor a 51 carácteres para: "+valorError+".",
                                                        overlay: true,
                                                        closeConfirm: true
                                                    });
                                                }
											}); /*Balance General*/
											$("body").overhang({
											  	type: "success",
											  	primary: "#40D47E",
								  				accent: "#27AE60",
											  	message: nombreLista+" importado con éxito.",
											  	duration: 2,
											  	overlay: true
											});
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
				  	message: "Ingrese una letra válida para la columna del valor del elemento.",
				  	overlay: true,
                    closeConfirm: true
				});
			}
		/*} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "Ingrese la columna para el valor del elemento.",
			  	duration: 2,
			  	overlay: true
			});
		}*/
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Ingrese un nombre de hoja del archivo de excel.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function createListExcel (nombre, tipo, callback) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("insert into Listas (nombre, tipo) values ('"+nombre+"',"+tipo+")", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Listas creation');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
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
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select ID from Listas where tipo = "+tipo, (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Listas creation');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log(result);
                    callback(result.recordset[0].ID);
                });
            }
        });
    }); // fin transaction
}

function createElementListExcel (idLista, nombre, valor) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("insert into ListasVariables (idLista, nombre, valor) values ("+idLista+",'"+nombre+"','"+valor+"')", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Listas Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log('done excel ListasVariables');
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
//	**********		Fin Manual Contable y Listas		**********





//	**********		Tasa de Cambio		**********
function showDollar () {
	$("#lempiraInput").hide();
	$("#dollarInput").show();
	//$("#lempiraInputCambio").show();
	//$("#dollarInputCambio").hide();
	//$("#lempiraRadio").prop("checked", true);
	$("#lempiraInputCambio").prop('disabled', false);
}

function showLempira () {
	$("#lempiraInput").show();
	$("#dollarInput").hide();
	//$("#lempiraInputCambio").hide();
	//$("#dollarInputCambio").show();
	//$("#dollarRadio").prop("checked", true);
	$("#lempiraInputCambio").prop('disabled', true);
}

function calculateRateChange () {
	if($("#dollarInput").val().length > 0 || $("#lempiraInput").val().length > 0){
		var prefix, tasa, montoF;
		if( $('#dollarInputRadio').is(':checked') ) {
			prefix = 'L ';
			montoF = parseFloat($("#dollarInput").val().split(" ")[1].replace(/,/g,""));
			tasa = parseFloat($("#lempiraInputCambio").val().split(" ")[1].replace(/,/g,""));
		}else {
			/*prefix = '$ ';
			montoF = parseFloat($("#lempiraInput").val().split(" ")[1]);
			tasa = parseFloat($("#dollarInputCambio").val().split(" ")[1]);*/
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
	if($("#dollarInput").val().length > 0 || $("#lempiraInput").val().length > 0){
		var tasa, montoF;
		if( $('#dollarInputRadio').is(':checked') ) {
			montoF = parseFloat($("#dollarInput").val().split(" ")[1].replace(/,/g,""));
			tasa = parseFloat($("#lempiraInputCambio").val().split(" ")[1].replace(/,/g,""));
		}else {
			montoF = parseFloat($("#lempiraInput").val().split(" ")[1].replace(/,/g,""));
			tasa = 1;
		}
		var fosede = math.multiply(math.bignumber(montoF), math.bignumber(tasa));
		fosede = math.round(fosede, 2);
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
		  	message: "Ingrese un valor en el campo ingresar monto.",
		  	overlay: true,
            closeConfirm: true
		});
	}
}

function createFOSEDEVariablesDB (montoFosede) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("insert into Variables (fullLogo, smallLogo, formula, formulaMATHLIVE, montoFosede) values ('', '', '', '', "+montoFosede+")", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack Insert FOSEDE Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed Insert FOSEDE Variables");
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
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("update Variables set montoFosede = "+montoFosede+" where ID = 1", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack update FOSEDE Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("Transaction committed update FOSEDE Variables");
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
                });
            }
        });
    }); // fin transaction
}

function saveActivosDB (indexTabla) {
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
                    }
                }
            });
        }
    } else if(indice == 1) {
        var cuenta = $("#cuentaConexionActivos").val();
        var nombre = $("#nombreConexionActivos").val();
        var saldo = $("#saldoConexionActivos").val();
        var moneda = $("#monedaConexionActivos").val();
        var tipoCuenta = $("#tipoCuentaConexionActivos").val();
        var sucursal = $("#sucursalConexionActivos").val();
        var columnaExtra1 = $("#columnaExtra1ConexionActivos").val();
        var columnaExtra2 = $("#columnaExtra2ConexionActivos").val();
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
                                                                        var arregloDeActivos = [];
                                                                        cuenta = cuenta.toUpperCase();
                                                                        nombre = nombre.toUpperCase();
                                                                        saldo = saldo.toUpperCase();
                                                                        moneda = moneda.toUpperCase();
                                                                        tipoCuenta = tipoCuenta.toUpperCase();
                                                                        sucursal = sucursal.toUpperCase();
                                                                        columnaExtra1 = columnaExtra1.toUpperCase();
                                                                        columnaExtra2 = columnaExtra2.toUpperCase();
                                                                        filaInicial = parseInt(filaInicial);
                                                                        filaFinal = parseInt(filaFinal);
                                                                        if(filaFinal != 0) {
                                                                            for (var i = filaInicial; i <= filaFinal; i++) {
                                                                                if(sheet[cuenta+i] != undefined) {
                                                                                    var activoCuenta = sheet[cuenta+i].v;
                                                                                    var activoNombre = sheet[nombre+i].v;
                                                                                    var activoSaldo = sheet[saldo+i].v;
                                                                                    var activoMoneda = sheet[moneda+i].v;
                                                                                    var activoTipoCuenta = sheet[tipoCuenta+i].v;
                                                                                    var activoSucursal = sheet[sucursal+i].v;
                                                                                    var activoColumnaExtra1 = '';
                                                                                    if(columnaExtra1.length > 0)
                                                                                        activoColumnaExtra1 = sheet[columnaExtra1+i].v;
                                                                                    var activoColumnaExtra2 = '';
                                                                                    if(columnaExtra2.length > 0)
                                                                                        activoColumnaExtra2 = sheet[columnaExtra2+i].v;
                                                                                    activoCuenta = activoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                    activoNombre = activoNombre.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                    activoMoneda = activoMoneda.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                    activoTipoCuenta = activoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                    //activoMonto = activoMonto.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                    activoSucursal = activoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                    activoNombre = activoNombre.toLowerCase();
                                                                                    activoNombre = UpperCasefirst(activoNombre);
                                                                                    activoMoneda = activoMoneda.toLowerCase();
                                                                                    activoMoneda = UpperCasefirst(activoMoneda);
                                                                                    activoTipoCuenta = activoTipoCuenta.toLowerCase();
                                                                                    activoTipoCuenta = UpperCasefirst(activoTipoCuenta);
                                                                                    activoSucursal = activoSucursal.toLowerCase();
                                                                                    activoSucursal = UpperCasefirst(activoSucursal);
                                                                                    arregloDeActivos.push({cuenta: activoCuenta, nombre: activoNombre, saldo: activoSaldo, moneda: activoMoneda, tipoCuenta: activoTipoCuenta, sucursal: activoSucursal, columnaExtra1: activoColumnaExtra1, columnaExtra2: activoColumnaExtra2});
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
                                                                                    var activoTipoCuenta = sheet[tipoCuenta+i].v;
                                                                                    var activoSucursal = sheet[sucursal+i].v;
                                                                                    var activoColumnaExtra1 = '';
                                                                                    if(columnaExtra1.length > 0)
                                                                                        activoColumnaExtra1 = sheet[columnaExtra1+i].v;
                                                                                    var activoColumnaExtra2 = '';
                                                                                    if(columnaExtra2.length > 0)
                                                                                        activoColumnaExtra2 = sheet[columnaExtra2+i].v;
                                                                                    activoCuenta = activoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                    activoNombre = activoNombre.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                    //activoMonto = activoMonto.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                    activoSucursal = activoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                    activoNombre = activoNombre.toLowerCase();
                                                                                    activoNombre = UpperCasefirst(activoNombre);
                                                                                    activoMoneda = activoMoneda.toLowerCase();
                                                                                    activoMoneda = UpperCasefirst(activoMoneda);
                                                                                    activoTipoCuenta = activoTipoCuenta.toLowerCase();
                                                                                    activoTipoCuenta = UpperCasefirst(activoTipoCuenta);
                                                                                    activoSucursal = activoSucursal.toLowerCase();
                                                                                    activoSucursal = UpperCasefirst(activoSucursal);
                                                                                    arregloDeActivos.push({cuenta: activoCuenta, nombre: activoNombre, saldo: activoSaldo, moneda: activoMoneda, tipoCuenta: activoTipoCuenta, sucursal: activoSucursal, columnaExtra1: activoColumnaExtra1, columnaExtra2: activoColumnaExtra2});
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
                                                    message: "Ingrese una letra para la columna del campo de tipo de cuenta válida.",
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
}

function createAsset (activo) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Activos (cuenta, nombre, saldo, moneda, tipoCuenta, sucursal, columnaExtra1, columnaExtra2) values ('"+activo.cuenta+"','"+activo.nombre+"',"+activo.saldo+",'"+activo.moneda+"','"+activo.tipoCuenta+"','"+activo.sucursal+"','"+activo.columnaExtra1+"','"+activo.columnaExtra2+"')", (err, result) => {
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
                                                            importAssets(arreglo, usuario, constrasena, server, basedatos, tabla, tipo, indexTabla);
                                                        }
                                                    }
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
                                                        importAssets(arreglo, usuario, constrasena, server, basedatos, tabla, tipo, indexTabla);
                                                    }
                                                }
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

function importAssets(arreglo, usuario, constrasena, server, basedatos, tabla, tipo, indexTabla) {
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
        var columnaExtra1 = $("#columnaExtra1ConexionActivos").val();
        var columnaExtra2 = $("#columnaExtra2ConexionActivos").val();
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
                                                var valorColumnaExtra1 = '';
                                                var valorColumnaExtra2 = '';
                                                if(valorArreglo[columnaExtra1].length > 0)
                                                    valorColumnaExtra1 = valorArreglo[columnaExtra1];
                                                if(valorArreglo[columnaExtra2].length > 0)
                                                    valorColumnaExtra2 = valorArreglo[columnaExtra2];
                                                const transaction = new sql.Transaction( pool1 );
                                                transaction.begin(err => {
                                                    var rolledBack = false;
                                                    transaction.on('rollback', aborted => {
                                                        rolledBack = true;
                                                    });
                                                    const request = new sql.Request(transaction);
                                                    request.query("insert into Activos (cuenta, nombre, saldo, moneda, tipoCuenta, sucursal, columnaExtra1, columnaExtra2) values ('"+valorArreglo[cuenta]+"','"+valorArreglo[nombre]+"',"+valorArreglo[saldo]+",'"+valorArreglo[moneda]+"','"+valorArreglo[tipoCuenta]+"','"+valorArreglo[sucursal]+"','"+valorColumnaExtra1+"','"+valorColumnaExtra2+"')", (err, result) => {
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
        var columnaExtra1 = $("#columnaExtra1ConexionDepositos").val();
        var columnaExtra2 = $("#columnaExtra2ConexionDepositos").val();
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
                                                        var valorColumnaExtra1 = '';
                                                        var valorColumnaExtra2 = '';
                                                        if(valorArreglo[columnaExtra1].length > 0)
                                                            valorColumnaExtra1 = valorArreglo[columnaExtra1];
                                                        if(valorArreglo[columnaExtra2].length > 0)
                                                            valorColumnaExtra2 = valorArreglo[columnaExtra2];
                                                        const transaction = new sql.Transaction( pool1 );
                                                        transaction.begin(err => {
                                                            var rolledBack = false;
                                                            transaction.on('rollback', aborted => {
                                                                rolledBack = true;
                                                            });
                                                            const request = new sql.Request(transaction);
                                                            request.query("insert into Depositos (idCLiente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, sucursal, columnaExtra1, columnaExtra2) values ('"+valorDepositos[idcliente]+"','"+valorDepositos[nombrecliente]+"','"+valorDepositos[tipoPersona]+"','"+valorDepositos[tipoSubPersona]+"',"+valorDepositos[saldo]+",'"+valorDepositos[moneda]+"','"+valorDepositos[tipoCuenta]+"','"+valorDepositos[sucursal]+"','"+valorColumnaExtra1+"','"+valorColumnaExtra2+"')", (err, result) => {
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
    }
}

function saveDepositosDB (indexTabla) {
    var elemento = $("ul#myTabDepositos li.active");
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
        var columnaExtra1 = $("#columnaExtra1ConexionDepositos").val();
        var columnaExtra2 = $("#columnaExtra2ConexionDepositos").val();
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
                                                                                        columnaExtra1 = columnaExtra1.toUpperCase();
                                                                                        columnaExtra2 = columnaExtra2.toUpperCase();
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
                                                                                                    var activoColumnaExtra1 = '';
                                                                                                    if(columnaExtra1.length > 0)
                                                                                                        activoColumnaExtra1 = sheet[columnaExtra1+i].v;
                                                                                                    var activoColumnaExtra2 = '';
                                                                                                    if(columnaExtra2.length > 0)
                                                                                                        activoColumnaExtra2 = sheet[columnaExtra2+i].v;
                                                                                                    //depositoIDCLiente = depositoIDCLiente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                    depositoNombreCliente = depositoNombreCliente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                    depositoTipoCuenta = depositoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                    //activoMonto = activoMonto.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                    depositoSucursal = depositoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                    depositoNombreCliente = depositoNombreCliente.toLowerCase();
                                                                                                    depositoNombreCliente = UpperCasefirst(depositoNombreCliente);
                                                                                                    depositoTipoCuenta = depositoTipoCuenta.toLowerCase();
                                                                                                    depositoTipoCuenta = UpperCasefirst(depositoTipoCuenta);
                                                                                                    depositoSucursal = depositoSucursal.toLowerCase();
                                                                                                    depositoSucursal = UpperCasefirst(depositoSucursal);
                                                                                                    arregloDeDepositos.push({idCLiente: depositoIDCLiente, nombreCliente: depositoNombreCliente, tipoPersona: depositoTipoPersona, tipoSubPersona: depositoTipoSubPersona, saldo: depositoTotalDepositos, moneda: depositoMoneda, tipoCuenta: depositoTipoCuenta, sucursal: depositoSucursal, columnaExtra1: activoColumnaExtra1, columnaExtra2: activoColumnaExtra2});
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
                                                                                                    var activoColumnaExtra1 = '';
                                                                                                    if(columnaExtra1.length > 0)
                                                                                                        activoColumnaExtra1 = sheet[columnaExtra1+i].v;
                                                                                                    var activoColumnaExtra2 = '';
                                                                                                    if(columnaExtra2.length > 0)
                                                                                                        activoColumnaExtra2 = sheet[columnaExtra2+i].v;
                                                                                                    //depositoIDCLiente = depositoIDCLiente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                    depositoNombreCliente = depositoNombreCliente.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                    depositoTipoCuenta = depositoTipoCuenta.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                    //activoMonto = activoMonto.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                    depositoSucursal = depositoSucursal.toString().replace(/[!@#$%^&*(),.?":{}|<>]*/g, '');
                                                                                                    depositoNombreCliente = depositoNombreCliente.toLowerCase();
                                                                                                    depositoNombreCliente = UpperCasefirst(depositoNombreCliente);
                                                                                                    depositoTipoCuenta = depositoTipoCuenta.toLowerCase();
                                                                                                    depositoTipoCuenta = UpperCasefirst(depositoTipoCuenta);
                                                                                                    depositoSucursal = depositoSucursal.toLowerCase();
                                                                                                    depositoSucursal = UpperCasefirst(depositoSucursal);
                                                                                                    arregloDeDepositos.push({idCLiente: depositoIDCLiente, nombreCliente: depositoNombreCliente, tipoPersona: depositoTipoPersona, tipoSubPersona: depositoTipoSubPersona, saldo: depositoTotalDepositos, moneda: depositoMoneda, tipoCuenta: depositoTipoCuenta, sucursal: depositoSucursal, columnaExtra1: activoColumnaExtra1, columnaExtra2: activoColumnaExtra2});
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
}

function createDeposit (deposito) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("insert into Depositos (idCLiente, nombreCliente, tipoPersona, tipoSubPersona, saldo, moneda, tipoCuenta, sucursal, columnaExtra1, columnaExtra2) values ('"+deposito.idCLiente+"','"+deposito.nombreCliente+"','"+deposito.tipoPersona+"','"+deposito.tipoSubPersona+"',"+deposito.saldo+",'"+deposito.moneda+"','"+deposito.tipoCuenta+"','"+deposito.sucursal+"','"+deposito.columnaExtra1+"','"+deposito.columnaExtra2+"')", (err, result) => {
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

function renderConections () {
	$(".coneccionesTabla").remove();
	for (var i = 0; i < arregloVariables.length; i++) {
		window['ConnectionTest'+i] = new Function(
		     'return function hola(){'+
		     	'$("#testConnection'+i+'").prop("disabled", true);'+
				'setTimeout(\' $("#testConnection'+i+'").prop("disabled", false); \', 3000);'+
				'var user = $("#activosUserDB'+i+'").val();'+
				'var password = $("#activosPasswordDB'+i+'").val();'+
				'var server = $("#activosServerDB'+i+'").val();'+
				'var database = $("#activosDataBaseDB'+i+'").val();'+
				'var table = $("#activosTableDB'+i+'").val();'+
                'const sql = require("mssql");'+
                'console.log("sql");'+
                'console.log("sql");'+
                'console.log("sql");'+
                'console.log(sql);'+
				'if(user.length > 0){'+
					'if(password.length > 0){'+
						'if(server.length > 0){'+
							'if(database.length > 0){'+
								'if(table.length > 0){'+
									'const pool = new sql.ConnectionPool({'+
									    'user: user,'+
									    'password: password,'+
									    'server: server,'+
									    'database: database'+
									'});'+
									'pool.connect(err => {'+
										'pool.request()'+
									    '.query("select * from "+table, (err, result) => {'+
									    	'if(err){'+
									    		'$("body").overhang({'+
												  	'type: "error",'+
												  	'primary: "#f84a1d",'+
													'accent: "#d94e2a",'+
												  	'message: "Intento de conexión fallido.",'+
												  	'duration: 2,'+
												  	'overlay: true'+
												'});'+
									    	'} else {'+
									    		'$("body").overhang({'+
												  	'type: "success",'+
												  	'primary: "#40D47E",'+
									  				'accent: "#27AE60",'+
												  	'message: "Conexión realizada con exito.",'+
												  	'duration: 2,'+
												  	'overlay: true'+
												'});'+
									    	'}'+
									    '});'+
									'});'+
								'} else {'+
									'$("body").overhang({'+
									  	'type: "error",'+
									  	'primary: "#f84a1d",'+
										'accent: "#d94e2a",'+
									  	'message: "Ingrese un valor en el campo de ingresar el nombre de la tabla.",'+
									  	'duration: 2,'+
									  	'overlay: true'+
									'});'+
								'}'+
							'} else {'+
								'$("body").overhang({'+
								  	'type: "error",'+
								  	'primary: "#f84a1d",'+
									'accent: "#d94e2a",'+
								  	'message: "Ingrese un valor en el campo de ingresar el nombre de la base de datos.",'+
								  	'duration: 2,'+
								  	'overlay: true'+
								'});'+
							'}'+
						'} else {'+
							'$("body").overhang({'+
							  	'type: "error",'+
							  	'primary: "#f84a1d",'+
								'accent: "#Ingrese un valor en el campo de ingresar dirección del servidor.",'+
							  	'duration: 2,'+
							  	'overlay: true'+
							'});'+
						'}'+
					'} else {'+
						'$("body").overhang({'+
						  	'type: "error",'+
						  	'primary: "#f84a1d",'+
							'accent: "#d94e2a",'+
						  	'message: "Ingrese un valor en el campo de ingresar contraseña.",'+
						  	'duration: 2,'+
						  	'overlay: true'+
						'});'+
					'}'+
				'} else {'+
					'$("body").overhang({'+
					  	'type: "error",'+
					  	'primary: "#f84a1d",'+
						'accent: "#d94e2a",'+
					  	'message: "Ingrese un valor en el campo de ingresar nombre de usuario.",'+
					  	'duration: 2,'+
					  	'overlay: true'+
					'});'+
				'}'+
			'}'
		)();

		window['saveConections'+i] = new Function(
		     'return function hola(tipoPar){'+
				'var usuario = $("#activosUserDB'+i+'").val();'+
				'var constrasena = $("#activosPasswordDB'+i+'").val();'+
				'var server = $("#activosServerDB'+i+'").val();'+
				'var basedatos = $("#activosDataBaseDB'+i+'").val();'+
				'var tabla = $("#activosTableDB'+i+'").val();'+
				'var tipo = "mssql";'+
                'const sql = require("mssql");'+
				'if(usuario.length>0 && usuario.length<101){'+
					'if(constrasena.length>0 && constrasena.length<101){'+
						'if(server.length>0 && server.length<101){'+
							'if(basedatos.length>0 && basedatos.length<101){'+
								'if(tabla.length>0 && tabla.length<101){'+
									'if(tipo.length>0 && tipo.length<11){'+
										'if(!isNaN(idVariable)){'+
                                            'const pool = new sql.ConnectionPool({'+
                                                'user: "SA",'+
                                                'password: "password111!",'+
                                                'server: "localhost",'+
                                                'database: "RCL_Dev"'+
                                            '});'+
                                            'pool.connect(err => {'+
                                                'pool.request()'+
                                                '.query("insert into Bases (usuario, constrasena, server, basedatos, tabla, tipo, idVariable) values (\'"+usuario+"\',\'"+constrasena+"\',\'"+server+"\',\'"+basedatos+"\',\'"+tabla+"\',\'"+tipo+"\',"+idVariable+")", (err, result) => {'+
                                                    'if(err){'+
                                                        'console.log("err");'+
                                                        'console.log(err);'+
                                                        '$("body").overhang({'+
                                                            'type: "error",'+
                                                            'primary: "#f84a1d",'+
                                                            'accent: "#d94e2a",'+
                                                            'message: "Intento de conexión fallido.",'+
                                                            'duration: 2,'+
                                                            'overlay: true'+
                                                        '});'+
                                                    '} else {'+
                                                        '$("body").overhang({'+
                                                            'type: "success",'+
                                                            'primary: "#40D47E",'+
                                                            'accent: "#27AE60",'+
                                                            'message: "Conexión realizada con exito.",'+
                                                            'duration: 2,'+
                                                            'overlay: true'+
                                                        '});'+
                                                    '}'+
                                                '});'+
                                            '});'+
										'} else {'+
											'$("body").overhang({'+
											  	'type: "error",'+
											  	'primary: "#f84a1d",'+
												'accent: "#d94e2a",'+
											  	'message: "Ingrese un número valido para el id de variable.",'+
											  	'duration: 2,'+
											  	'overlay: true'+
											'});'+
										'}'+
									'} else {'+
										'$("body").overhang({'+
										  	'type: "error",'+
										  	'primary: "#f84a1d",'+
											'accent: "#d94e2a",'+
										  	'message: "El tamaño del tipo de la db no puede ser igual 0 ó mayor a 10.",'+
										  	'duration: 2,'+
										  	'overlay: true'+
										'});'+
									'}'+
								'} else {'+
									'$("body").overhang({'+
									  	'type: "error",'+
									  	'primary: "#f84a1d",'+
										'accent: "#d94e2a",'+
									  	'message: "El tamaño del nombre de la tabla de la db no puede ser igual 0 ó mayor a 100.",'+
									  	'duration: 2,'+
									  	'overlay: true'+
									'});'+
								'}'+
							'} else {'+
								'$("body").overhang({'+
								  	'type: "error",'+
								  	'primary: "#f84a1d",'+
									'accent: "#d94e2a",'+
								  	'message: "El tamaño del nombre de la base de datos no puede ser igual 0 ó mayor a 100.",'+
								  	'duration: 2,'+
								  	'overlay: true'+
								'});'+
							'}'+
						'} else {'+
							'$("body").overhang({'+
							  	'type: "error",'+
							  	'primary: "#f84a1d",'+
								'accent: "#d94e2a",'+
							  	'message: "El tamaño del nombre del servidor de la db no puede ser igual 0 ó mayor a 100.",'+
							  	'duration: 2,'+
							  	'overlay: true'+
							'});'+
						'}'+
					'} else {'+
						'$("body").overhang({'+
						  	'type: "error",'+
						  	'primary: "#f84a1d",'+
							'accent: "#d94e2a",'+
						  	'message: "El tamaño de la constraseña de la db no puede ser igual 0 ó mayor a 100.",'+
						  	'duration: 2,'+
						  	'overlay: true'+
						'});'+
					'}'+
				'} else {'+
					'$("body").overhang({'+
					  	'type: "error",'+
					  	'primary: "#f84a1d",'+
						'accent: "#d94e2a",'+
					  	'message: "El tamaño del nombre de usuario de la db no puede ser igual 0 ó mayor a 100.",'+
					  	'duration: 2,'+
					  	'overlay: true'+
					'});'+
				'}'+
			'}'
		)();

		var content = 	'<div id="alac_div" class="row">'+
					        '<div class="col-md-12">'+
					          	'<div class="x_panel">'+
					            	'<div class="x_title">'+
					              		'<h2>Importar '+arregloVariables[i].nombre+'</h2>'+
					              		'<ul class="nav navbar-right panel_toolbox">'+
					                		'<li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a>'+
					                		'</li>'+
					              		'</ul>'+
					              		'<div class="clearfix"></div>'+
					            	'</div>'+
					            	'<div class="x_content">'+
						              	'<div class="col-md-12 col-sm-12 col-xs-12">'+
							                '<div class="x_panel" role="tabpanel" data-example-id="togglable-tabs">'+
							                  	'<ul id="myTab" class="nav nav-tabs bar_tabs" role="tablist">'+
							                    	'<li role="presentation" class="active"><a href="#tab_content1" id="home-tab" role="tab" data-toggle="tab" aria-expanded="true">Conexi&oacute;n a una Base de Datos MSSQL</a>'+
							                    	'</li>'+
							                    	'<li role="presentation" class=""><a href="#tab_content2" role="tab" id="profile-tab" data-toggle="tab" aria-expanded="false">Excel</a>'+
							                    	'</li>'+
							                  	'</ul>'+
							                  	'<div id="myTabContent" class="tab-content">'+
							                    	'<div role="tabpanel" class="tab-pane fade active in" id="tab_content1" aria-labelledby="home-tab">'+
							                      		'<div class="col-md-6">'+
							                        		'<div class="form-group">'+
							                          			'<label>Usuario</label>'+
							                          			'<input id="activosUserDB'+(i)+'" type="text" class="form-control" placeholder="Ingrese el nombre de usuario de la base de datos">'+
							                        		'</div>'+
							                      		'</div>'+
							                      		'<div class="col-md-6">'+
								                        	'<div class="form-group">'+
							                          			'<label>Contrase&ntilde;a</label>'+
							                          			'<input id="activosPasswordDB'+(i)+'" type="password" class="form-control" placeholder="Ingrese la contrase&ntilde;a de la base de datos">'+
							                        		'</div>'+
							                      		'</div>'+
							                      		'<div class="col-md-6">'+
							                        		'<div class="form-group">'+
							                          			'<label>Servidor</label>'+
							                          			'<input id="activosServerDB'+(i)+'" type="text" class="form-control" placeholder="Ingrese la direcci&oacute;n del servidor de la base de datos">'+
							                        		'</div>'+
							                      		'</div>'+
							                      		'<div class="col-md-6">'+
							                        		'<div class="form-group">'+
							                          			'<label>Base de Datos</label>'+
							                          			'<input id="activosDataBaseDB'+(i)+'" type="text" class="form-control" placeholder="Ingrese el nombre de la base de datos">'+
							                        		'</div>'+
							                      		'</div>'+
							                      		'<div class="col-md-6">'+
							                        		'<div class="form-group">'+
							                          			'<label>Tabla</label>'+
							                          			'<input id="activosTableDB'+(i)+'" type="text" class="form-control" placeholder="Ingrese el nombre de la tabla">'+
							                        		'</div>'+
							                      		'</div>'+
							                      		'<div class="col-md-6">'+
							                        		'<br/>'+
							                        		'<button id="testConnection'+(i)+'" onclick="ConnectionTest'+i+'()" type="button" class="btn btn-primary" style="margin-top:1%;">Probar Conexi&oacute;n</button>'+
							                      		'</div>'+
							                    	'</div>'+
							                    	'<div role="tabpanel" class="tab-pane fade" id="tab_content2" aria-labelledby="profile-tab">'+
							                      		'<button onclick="activosExcelUpload'+(i)+'()" type="button" class="col-md-5 btn btn-primary" style="margin-top:1.6em;">Seleccionar Archivo</button>'+
							                      		'<div class="col-md-6">'+
							                        		'<div class="form-group">'+
							                          			'<label>Hoja</label>'+
							                          			'<input id="activosTableExcel'+(i)+'" type="text" class="form-control" placeholder="Ingrese el nombre de la hoja de excel">'+
							                        		'</div>'+
							                      		'</div>'+
							                    	'</div>'+
							                	'</div>'+
							            	'</div>'+
							            	'<br/>'+
							            	'<h4 class="text-center">Mapeo de Campos</h4>'+
							            	'<table class="table table-striped">'+
							                	'<thead>'+
							                    	'<tr>'+
							                      		'<th>#</th>'+
							                      		'<th>Campo</th>'+
							                      		'<th>Origen</th>'+
							                    	'</tr>'+
							                	'</thead>'+
							                	'<tbody>'+
							                    	'<tr>'+
							                      		'<th scope="row">1</th>'+
							                      		'<td>Cuenta</td>'+
							                      		'<td>'+
							                        		'<input type="text" id="lempiraInputCambio" required="required" class="form-control">'+
							                      		'</td>'+
							                    	'</tr>'+
							                    	'<tr>'+
							                      		'<th scope="row">2</th>'+
							                      		'<td>ID Persona</td>'+
							                      		'<td>'+
							                        		'<input type="text" id="lempiraInputCambio" required="required" class="form-control">'+
							                      		'</td>'+
							                    	'</tr>'+
							                    	'<tr>'+
							                      		'<th scope="row">3</th>'+
							                      		'<td>Monto</td>'+
							                      		'<td>'+
							                        		'<input type="text" id="lempiraInputCambio" required="required" class="form-control">'+
							                      		'</td>'+
							                    	'</tr>'+
							                	'</tbody>'+
							            	'</table>'+
							            	'<br/>'+
							            	'<div class="ln_solid"></div>'+
						            		'<div id="wrapper">'+
						                  		'<button id="mostrar" onclick="saveConections'+i+'()" type="button" class="btn btn-success">Guardar</button>'+
						                	'</div>'+
						            	'</div>'+
						        	'</div>'+
						    	'</div>'+
							'</div>'+
						'</div>';

		//arregloVariables[i]
		$(".right_col").append(content);
	};
}

function saveConections () {
	/*var arreglo = 'arreglo'+arregloVariables['+i+'].variables+'+i+';
	var usuario = $("#activosUserDB'+i+'").val();
	var constrasena = $("#activosPasswordDB'+i+'").val();
	var server = $("#activosServerDB'+i+'").val();
	var basedatos = $("#activosDataBaseDB'+i+'").val();
	var tabla = $("#activosTableDB'+i+'").val();
	var tipo = tipoPar;
	var idVariable = arregloVariables['+i+'].ID;
	var existe = arregloConecciones.filter(function(object) {
        return (object.tipo == tipo && object.idVariable == idVariable);
    });
    if(existe.length == 0) {
		if(arreglo.length>0 && arreglo.length<21){
			if(usuario.length>0 && usuario.length<101){
				if(constrasena.length>0 && constrasena.length<101){
					if(server.length>0 && server.length<101){
						if(basedatos.length>0 && basedatos.length<101){
							if(tabla.length>0 && tabla.length<101){
								if(tipo.length>0 && tipo.length<11){
									if(!isNaN(idVariable)){
										const transaction = new sql.Transaction( pool1 );
									    transaction.begin(err => {
									        var rolledBack = false
									 
									        transaction.on('rollback', aborted => {
									            // emited with aborted === true
									     
									            rolledBack = true
									        })
									        const request = new sql.Request(transaction);
									        request.query("insert intro Bases (arreglo, usuario, constrasena, server, basedatos, tabla, tipo, idVariable) values ('"+arreglo+"','"+usuario+"','"+constrasena+"','"+server+"','"+basedatos+"','"+tabla+"','"+tipo+"',"+idVariable+")", (err, result) => {
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
									                });
									            }
									        });
									    }); // fin transaction
									} else {
										$("body").overhang({
										  	type: "error",
										  	primary: "#f84a1d",
											accent: "#d94e2a",
										  	message: "Ingrese un número valido para el id de variable.",
										  	duration: 2,
										  	overlay: true
										});
									}
								} else {
									$("body").overhang({
									  	type: "error",
									  	primary: "#f84a1d",
										accent: "#d94e2a",
									  	message: "El tamaño del tipo de la db no puede ser igual 0 ó mayor a 10.",
									  	duration: 2,
									  	overlay: true
									});
								}
							} else {
								$("body").overhang({
								  	type: "error",
								  	primary: "#f84a1d",
									accent: "#d94e2a",
								  	message: "El tamaño del nombre de la tabla de la db no puede ser igual 0 ó mayor a 100.",
								  	duration: 2,
								  	overlay: true
								});
							}
						} else {
							$("body").overhang({
							  	type: "error",
							  	primary: "#f84a1d",
								accent: "#d94e2a",
							  	message: "El tamaño del nombre de la base de datos no puede ser igual 0 ó mayor a 100.",
							  	duration: 2,
							  	overlay: true
							});
						}
					} else {
						$("body").overhang({
						  	type: "error",
						  	primary: "#f84a1d",
							accent: "#d94e2a",
						  	message: "El tamaño del nombre del servidor de la db no puede ser igual 0 ó mayor a 100.",
						  	duration: 2,
						  	overlay: true
						});
					}
				} else {
					$("body").overhang({
					  	type: "error",
					  	primary: "#f84a1d",
						accent: "#d94e2a",
					  	message: "El tamaño de la constraseña de la db no puede ser igual 0 ó mayor a 100.",
					  	duration: 2,
					  	overlay: true
					});
				}
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "El tamaño del nombre de usuario de la db no puede ser igual 0 ó mayor a 100.",
				  	duration: 2,
				  	overlay: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "El tamaño del nombre del arreglo no puede ser igual 0 ó mayor a 11.",
			  	duration: 2,
			  	overlay: true
			});
		}
	} else {
		//
	}*/
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
									  	overlay: true
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

function logout () {
	$("#app_root").empty();
    $("#app_root").load("src/login.html");
	session.defaultSession.clearStorageData([], (data) => {});
}

function goRules (index) {
    var variableID = arregloVariableDeVariables[index].ID;
    var nombrePadre = arregloVariables[(arregloVariableDeVariables[index].idVariable-1)].nombre;
    var nombreHijo = arregloVariableDeVariables[index].nombre;
    var descripcionHijo = arregloVariableDeVariables[index].descripcion;
    var factorHijo = arregloVariableDeVariables[index].factor;
    var tablaHijo = arregloVariableDeVariables[index].tablaAplicar;
    setVariableDeVariableID(variableID);
    setNombrePadre(nombrePadre);
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
    } else {
        $("#app_root").empty();
        $("#app_root").load("src/variableDetail.html");
    }
    /*$.getScript("src/variableDetail.js").done(function( script, textStatus ) {
    	loadText(nombrePadre, nombreHijo, descripcionHijo, arregloVariableDeVariables[index]);
    	});*/
  	//html.find('script[src="src/variables.js"]').remove();
}

function goRCL () {
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
}