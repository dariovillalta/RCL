const electron = require('electron');
const path = require('path');
const remote = require('electron').remote;
const sql = require('mssql');

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
	else{
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
			  	duration: 3,
			  	overlay: true
			});
		} else if(existenVariables(equacion) === 1){
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "Las variables ingresadas en la formula no concuerdan con las variables de la base de datos.",
			  	duration: 3,
			  	overlay: true
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
		  	duration: 3,
		  	overlay: true
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
        request.query("update Variables set formula = "+equacion+", formulaMATHLIVE = "+formulaMATHLIVE+" where ID = 1", (err, result) => {
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
					  	duration: 3,
					  	overlay: true
					});
				}
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "La representación de la variable en la formula debe tener más de una letra y menos de 11.",
				  	duration: 3,
				  	overlay: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "El nombre de la variable debe tener una longitud mayor a 0 y menor a 61.",
			  	duration: 3,
			  	overlay: true
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
			          /*'<th>Cuenta</th>'+*/
			          '<th>Guardar</th>'+
			          '<th>Borrar</th>'+
			        '</tr>'+
			      '</thead>'+
			      '<tbody>';
	for (var i = 0; i < arregloVariablesAsociadas.length; i++) {
		tabla+= '<tr><td>'+i+'</td><td> <input type="text" id="variablesdeVariablesNombre'+rowdata.ID+''+i+'" required="required" class="form-control" value="'+arregloVariablesAsociadas[i].nombre+'"> </td>';
		tabla+='<td> <input type="text" id="variablesdeVariablesDescripcion'+rowdata.ID+''+i+'" required="required" class="form-control" value="'+arregloVariablesAsociadas[i].descripcion+'"> </td>';
		//tabla+='<td> <input type="text" id="variablesdeVariablesCuenta'+rowdata.ID+''+i+'" required="required" class="form-control" value="'+arregloVariablesAsociadas[i].cuenta+'"> </td>';
		tabla+='<td><a class="btn btn-app" onclick="updateVariableDeVariable('+arregloVariablesAsociadas[i].ID+','+i+','+rowdata.ID+')"> <i class="fa fa-save"></i> Guardar </a></td>';
		tabla+='<td><a class="btn btn-app" onclick="deleteVariableDeVariable('+arregloVariablesAsociadas[i].ID+','+arregloVariablesAsociadas[i].Nombre+')"> <i class="fa fa-eraser"></i> Eliminar </a></td></tr>';
	};

	//Add new
	tabla+= '<tr><td></td><td> <input type="text" id="variablesdeVariablesNombre'+rowdata.ID+'" required="required" class="form-control"> </td>';
	tabla+='<td> <input type="text" id="variablesdeVariablesDescripcion'+rowdata.ID+'" required="required" class="form-control"> </td>';
	//tabla+='<td> <input type="text" id="variablesdeVariablesCuenta'+rowdata.ID+'" required="required" class="form-control"> </td>';
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
				  	duration: 3,
				  	overlay: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "La representación de la variable en la formula debe tener más de una letra y menos de 11.",
			  	duration: 3,
			  	overlay: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "El nombre de la variable debe tener longitud mayor a 0 y menor a 61.",
		  	duration: 3,
		  	overlay: true
		});
	}
}

function modifyVariable (row) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("update FormulaVariables set nombre = '"+row.nombre+"', variables = '"+row.variables+"', descripcion = '"+row.descripcion+"' where ID = '"+row.ID+"'", (err, result) => {
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
	if(nombre.length > 0 && nombre.length < 41){
		if(descripcion.length < 701){
			const transaction = new sql.Transaction( pool1 );
		    transaction.begin(err => {
		        var rolledBack = false
		 
		        transaction.on('rollback', aborted => {
		            // emited with aborted === true
		     
		            rolledBack = true
		        })
		        const request = new sql.Request(transaction);
		        request.query("insert into VariablesdeVariablesFormula (idVariable, nombre, descripcion) values ("+rowdataID+", '"+nombre+"', '"+descripcion+"')", (err, result) => {
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
			  	message: "La descripción de la variable debe tener longitud menor a 701.",
			  	duration: 3,
			  	overlay: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "El nombre de la variable debe tener longitud mayor a 0 y menor a 41.",
		  	duration: 3,
		  	overlay: true
		});
	}
}

function updateVariableDeVariable (variableID, index, parentVariableId) {
	var nombre = $("#variablesdeVariablesNombre"+parentVariableId+""+index).val();
	var descripcion = $("#variablesdeVariablesDescripcion"+parentVariableId+""+index).val();
	if(nombre.length > 0 && nombre.length < 41){
		if(descripcion.length < 701){
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
					        request.query("update VariablesdeVariablesFormula set nombre = '"+nombre+"', descripcion = '"+descripcion+"' where ID = "+variableID+" ", (err, result) => {
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
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "La descripción de la variable debe tener longitud menor a 701.",
			  	duration: 3,
			  	overlay: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "El nombre de la variable debe tener longitud mayor a 0 y menor a 41.",
		  	duration: 3,
		  	overlay: true
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

/*function loadVariablesofVariableTable () {
	var id;
	if(arregloVariableDeVariables.length > 0)
		id = arregloVariableDeVariables[arregloVariableDeVariables.length-1].ID+1;
	else
		id = 1;
	if(arregloVariables.length > 0){
		for (var i = 0; i < arregloVariableDeVariables.length; i++) {
			console.log(arregloVariableDeVariables[i]);
			var varia = arregloVariables.filter(function(object) {
				console.log(object);
				if(!isNaN(arregloVariableDeVariables[i].idVariable))
		        	return (arregloVariableDeVariables[i].idVariable == object.ID );
		        return;
		    });
		    console.log(varia);
		    if(!isNaN(arregloVariableDeVariables[i].idVariable))
		    	arregloVariableDeVariables[i].idVariable = varia[0].nombre;
		};
	}
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
			{ "data": "idVariable" },
	        { "data": "nombre" },
	        { "data": "descripcion" },
	        { "data": "cuenta" },
	        { "data": "Guardar" },
	        { "data": "Eliminar" }
	    ],
	    "columnDefs": [ {
	        "targets": -2,
	        "defaultContent": '<a class="btn btn-app updateVariableOfVariable"> <i class="fa fa-save"></i> Guardar </a>',
	        "className": "text-center"
	    },
	    {
	        "targets": -1,
	        "defaultContent": '<a class="btn btn-app deleteVariableOfVariable"> <i class="fa fa-eraser"></i> Eliminar </a>',
	        "className": "text-center"
	    },
	    {
		      "targets": 0,
		      "className": "text-center"
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

	var opcionesVarPadre = '';
	opcionesVarPadre+='<select id="padreVarofVarN">';
	for (var i = 0; i < arregloVariables.length; i++) {
		opcionesVarPadre+='<option value="'+arregloVariables[i].ID+'">'+arregloVariables[i].nombre+'</option>';
	};
	opcionesVarPadre+='</select>';

	table.row.add( {
        "ID": id,
        "idVariable": opcionesVarPadre,
        "nombre": "<input type='text' id='nombreVarofVarN"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "descripcion": "<input type='text' id='descripcionVarofVarN"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "cuenta": "<input type='text' id='cuentaVarofVarN"+id+"' required='required' class='form-control col-md-7 col-xs-12'>",
        "Guardar": "<a class='btn btn-app' onclick='saveNewVariableVarofVarN("+id+")'> <i class='fa fa-save'></i> Guardar </a>",
        "Eliminar": ""
    } ).draw();

	var opciones = [];
    for (var i = 0; i < arregloVariables.length; i++) {
    	opciones.push({ "value": arregloVariables[i].ID, "display": arregloVariables[i].nombre });
    };

    table.MakeCellsEditable({
    	"onUpdate": function() { return; },
        "columns": [1,2,3,4],
        "confirmationButton": false,
		"inputTypes": [
			{
				"column":1,
				"type": "list",
                "options": opciones
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
                "type":"text",
                "options":null
            }
        ]
    });

	$('#datatable_variablesOfVariables tbody').on( 'click', 'tr a.updateVariableOfVariable', function () {
        var data = table.row( $(this).parents('tr') ).data();
		if(data.nombre.length > 0 && data.nombre.length < 41){
			if(data.cuenta.length > 0 && data.cuenta.length < 41){
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
					    		modifyVariableofVarN(data);
					  	}
					});
				} else {
					$("body").overhang({
					  	type: "error",
					  	primary: "#f84a1d",
						accent: "#d94e2a",
					  	message: "La descripción de la variable debe tener una longitud menor a 701.",
					  	duration: 3,
					  	overlay: true
					});
				}
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "La cuenta de la variable debe tener más de una letra y menos de 41.",
				  	duration: 3,
				  	overlay: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "El nombre de la variable debe tener una longitud mayor a 0 y menor a 41.",
			  	duration: 3,
			  	overlay: true
			});
		}
    } );

	$('#datatable_variablesOfVariables tbody').on( 'click', 'tr a.deleteVariableOfVariable', function () {
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
		    		deleteVariableofVarN(data);
		  	}
		});
	} );
}

function saveNewVariableVarofVarN (id) {
	var nombre = $("#nombreVarofVarN"+id).val();
	var cuenta = $("#cuentaVarofVarN"+id).val();
	var descripcion = $("#descripcionVarofVarN"+id).val();
	var padre = $("#padreVarofVarN").val();
	if(nombre.length > 0 && nombre.length < 41){
		if(cuenta.length > 0 && cuenta.length < 41){
			if(descripcion.length < 701){
				if(padre.length > 0){
					const transaction = new sql.Transaction( pool1 );
				    transaction.begin(err => {
				        var rolledBack = false
				 
				        transaction.on('rollback', aborted => {
				            // emited with aborted === true
				     
				            rolledBack = true
				        })
				        const request = new sql.Request(transaction);
				        request.query("insert into VariablesdeVariablesFormula (idVariable, nombre, descripcion, cuenta) values ("+padre+", '"+nombre+"', '"+descripcion+"','"+cuenta+"')", (err, result) => {
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
					  	message: "Seleccione una variable padre asociada a la nueva variable.",
					  	duration: 3,
					  	overlay: true
					});
				}
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#d94e2a",
				  	message: "La descripción de la variable debe tener una longitud menor a 701.",
				  	duration: 3,
				  	overlay: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "La cuenta de la variable debe tener más de una letra y menos de 41.",
			  	duration: 3,
			  	overlay: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "El nombre de la variable debe tener longitud mayor a 0 y menor a 41.",
		  	duration: 3,
		  	overlay: true
		});
	}
}

function modifyVariableofVarN (data) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("update VariablesdeVariablesFormula set idVariable = "+data.idVariable+", nombre = '"+data.nombre+"', descripcion = '"+data.descripcion+"', cuenta = '"+data.cuenta+"' where ID = "+data.ID+" ", (err, result) => {
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

function deleteVariableofVarN (data) {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("delete from FormulaVariables where ID = '"+data.ID+"' ", (err, result) => {
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
}*/

//	**********		Fin Variables		**********





//	**********		Manual Contable y Listas		**********
var arregloListas = [];
var arregloListasVariables = [];
var listasVariablesSeleccionada = null;

function loadLists () {
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false
 
        transaction.on('rollback', aborted => {
            // emited with aborted === true
     
            rolledBack = true
        })
        const request = new sql.Request(transaction);
        request.query("select * from Listas", (err, result) => {
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

function renderVariableListSelect () {
	var ulHTML = '';
	for (var i = 0; i < arregloListasVariables.length; i++) {
		ulHTML+='<li><p><button type="button" class="flat" onclick="showModalEditListVariable('+i+')">Editar</button>';
		ulHTML+=arregloListasVariables[i].nombre+'</p></li>';
	};
	$("#listsElements").empty();
	$("#listsElements").append(ulHTML);
}

function createList () {
	var nombre = $("#nameList").val();
	if(nombre.length > 0 && nombre.length < 61){
		const transaction = new sql.Transaction( pool1 );
	    transaction.begin(err => {
	        var rolledBack = false
	 
	        transaction.on('rollback', aborted => {
	            // emited with aborted === true
	     
	            rolledBack = true
	        })
	        const request = new sql.Request(transaction);
	        request.query("insert into Listas (nombre) values ('"+nombre+"')", (err, result) => {
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
		  	duration: 2,
		  	overlay: true
		});
	}
}

function updateList () {
	var nombre = $("#elementoNombreEdit").val();
	var listaId = $("#elementosDeListaEdit").val();
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
		  	duration: 2,
		  	overlay: true
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
	if(idLista.length > 0) {
		if(nombre.length > 0 && nombre.length < 121){
			if(nombre.length > 0 && nombre.length < 51){
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
				  	message: "El valor del elemento de la lista debe tener una longitud mayor a 0 y menor a 51.",
				  	duration: 2,
				  	overlay: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "El nombre del elemento de la lista debe tener una longitud mayor a 0 y menor a 121.",
			  	duration: 2,
			  	overlay: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Seleccione una lista.",
		  	duration: 2,
		  	overlay: true
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
				  	duration: 2,
				  	overlay: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "El nombre del elemento de la lista debe tener una longitud mayor a 0 y menor a 121.",
			  	duration: 2,
			  	overlay: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Seleccione una lista.",
		  	duration: 2,
		  	overlay: true
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
			  	duration: 2,
			  	overlay: true
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
			  	duration: 2,
			  	overlay: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Ingrese un valor en el campo ingresar monto.",
		  	duration: 2,
		  	overlay: true
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

function activosConnectionTest () {
	$("#testConnection").prop('disabled', true);
	setTimeout(" $('#testConnection').prop('disabled', false); ", 3000);
	var user = $("#activosUserDB").val();
	var password = $("#activosPasswordDB").val();
	var server = $("#activosServerDB").val();
	var database = $("#activosDataBaseDB").val();
	var table = $("#activosTableDB").val();
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
									  	duration: 2,
									  	overlay: true
									});
						    	} else {
						    		$("body").overhang({
									  	type: "success",
									  	primary: "#40D47E",
						  				accent: "#27AE60",
									  	message: "Conexión realizada con exito.",
									  	duration: 2,
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
						  	duration: 2,
						  	overlay: true
						});
					}
				} else {
					$("body").overhang({
					  	type: "error",
					  	primary: "#f84a1d",
						accent: "#d94e2a",
					  	message: "Ingrese un valor en el campo de ingresar el nombre de la base de datos.",
					  	duration: 2,
					  	overlay: true
					});
				}
			} else {
				$("body").overhang({
				  	type: "error",
				  	primary: "#f84a1d",
					accent: "#Ingrese un valor en el campo de ingresar dirección del servidor.",
				  	duration: 2,
				  	overlay: true
				});
			}
		} else {
			$("body").overhang({
			  	type: "error",
			  	primary: "#f84a1d",
				accent: "#d94e2a",
			  	message: "Ingrese un valor en el campo de ingresar contraseña.",
			  	duration: 2,
			  	overlay: true
			});
		}
	} else {
		$("body").overhang({
		  	type: "error",
		  	primary: "#f84a1d",
			accent: "#d94e2a",
		  	message: "Ingrese un valor en el campo de ingresar nombre de usuario.",
		  	duration: 2,
		  	overlay: true
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
	$("#app_root").empty();
	var nombrePadre = arregloVariables[(arregloVariableDeVariables[index].idVariable-1)].nombre;
	var nombreHijo = arregloVariableDeVariables[index].nombre;
	var descripcionHijo = arregloVariableDeVariables[index].descripcion;
	$("#app_root").load("src/variableDetail.html");
	setVariableDeVariable(arregloVariableDeVariables[index]);
	setNombrePadre(nombrePadre);
	setNombreHijo(nombreHijo);
	setDescripcionHijo(descripcionHijo);
	/*$.getScript("src/variableDetail.js").done(function( script, textStatus ) {
    	loadText(nombrePadre, nombreHijo, descripcionHijo, arregloVariableDeVariables[index]);
  	});*/
  	//html.find('script[src="src/variables.js"]').remove();
}