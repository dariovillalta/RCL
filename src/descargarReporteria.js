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
	}
});

$("input[name='table_records']").on('ifChanged', function(event){
    renderFields();
});

function renderFields () {
	if( $("#esVarRCL").is(':checked') || $("#esNum").is(':checked') || $("#esDen").is(':checked') || $("#esVariable").is(':checked') || $("#esSubVariable").is(':checked') || $("#esCuenta").is(':checked')) { //Es Boolean
		$("#operacionIgualDIV").show();
		$("#operacionListaDIV").hide();
		$("#alegebraicaDIV").hide();
		$("#valorExisteDIV").show();
		$("#valorInputDIV").hide();
		$("#existe").prop('checked', true);
		var campo;
		if( $("#esVarRCL").is(':checked') )
			campo = 'Es Variable RCL';
		else if( $("#esNum").is(':checked') )
			campo = 'Variable es parte del Numerador';
		else if( $("#esDen").is(':checked') )
			campo = 'Variable es parte del Denominador';
		else if( $("#esVariable").is(':checked') )
			campo = 'Es Variable Padre';
		else if( $("#esSubVariable").is(':checked') )
			campo = 'Es Sub-Variable';
		else if( $("#esCuenta").is(':checked') )
			campo = 'Es Cuenta Contable';
		$("#campo").text(campo);
	} else if( $("#volumen").is(':checked') || $("#influencia").is(':checked') || $("#numerador").is(':checked') || $("#denominador").is(':checked') || $("#totalRCL").is(':checked') || $("#total").is(':checked') || $("#calce").is(':checked') ) { //numero
		$("#operacionIgualDIV").hide();
		$("#operacionListaDIV").hide();
		$("#alegebraicaDIV").show();
		$("#valorExisteDIV").hide();
		$("#valorInputDIV").show();
		var campo;
		if( $("#volumen").is(':checked') )
			campo = 'Total del volumen de la Variable';
		else if( $("#influencia").is(':checked') )
			campo = 'Total de la influencia de la Variable';
		else if( $("#numerador").is(':checked') )
			campo = 'Total valor del Numerador';
		else if( $("#denominador").is(':checked') )
			campo = 'Total valor del Denominador';
		else if( $("#totalRCL").is(':checked') )
			campo = 'Total calculado de RCL';
		else if( $("#total").is(':checked') )
			campo = 'Total de Variable';
		$("#campo").text(campo);
	} else if( $("#moneda").is(':checked') || $("#sucursal").is(':checked') || $("#nombreVariable").is(':checked') ) { //string
		$("#operacionIgualDIV").hide();
		$("#operacionListaDIV").show();
		$("#alegebraicaDIV").hide();
		$("#valorExisteDIV").hide();
		$("#valorInputDIV").show();
		var campo;
		if( $("#moneda").is(':checked') )
			campo = 'Moneda';
		else if( $("#sucursal").is(':checked') )
			campo = 'Sucursal';
		else if( $("#nombreVariable").is(':checked') )
			campo = 'Nombre de Variable';
		$("#campo").text(campo);
	}
}

var camposExportar = [
	{nombre: "Es RCL",campo: "esRCL", idHTML: "esVarRCL", valor: []},
	{nombre: "Nombre Variable",campo: "nombreVariable", idHTML: "nombreVariable", valor: []},
	{nombre: "Es Numerador",campo: "esNumerador", idHTML: "esNum", valor: []},
	{nombre: "Es Denominador",campo: "esDenominador", idHTML: "esDen", valor: []},
	{nombre: "Tipo de Proyección",campo: "tipoProyeccion", idHTML: "calce", valor: []},
	{nombre: "Volumen Fórmula",campo: "volumenFormula", idHTML: "volumen", valor: []},
	{nombre: "Influencia Fórmula",campo: "influenciaFormula", idHTML: "influencia", valor: []},
	{nombre: "Numerador",campo: "numerador", idHTML: "numerador", valor: []},
	{nombre: "Denominador",campo: "denominador", idHTML: "denominador", valor: []},
	{nombre: "Moneda",campo: "moneda", idHTML: "moneda", valor: []},
	{nombre: "Sucursal",campo: "sucursal", idHTML: "sucursal", valor: []},
	{nombre: "Tipo",campo: "tipo", idHTML: "esVariable", valor: []},
	{nombre: "Tipo",campo: "tipo", idHTML: "esSubVariable", valor: []},
	{nombre: "Tipo",campo: "tipo", idHTML: "esCuenta", valor: []},
	{nombre: "Total RCL",campo: "totalRCL", idHTML: "totalRCL", valor: []},
	{nombre: "Total",campo: "total", idHTML: "total", valor: []}
];

function createRules () {
	if( $("#esVarRCL").is(':checked')) {
		if($("#existe").is(':checked')) {
			camposExportar[0].valor[0] = true;
		} else {
			camposExportar[0].valor[0] = false;
		}
	} else if($("#esNum").is(':checked')) {
		if($("#existe").is(':checked')) {
			camposExportar[2].valor[0] = true;
		} else {
			camposExportar[2].valor[0] = false;
		}
	} else if($("#esDen").is(':checked')) {
		if($("#existe").is(':checked')) {
			camposExportar[3].valor[0] = true;
		} else {
			camposExportar[3].valor[0] = false;
		}
	} else if($("#esVariable").is(':checked')) {
		if($("#existe").is(':checked')) {
			camposExportar[11].valor[0] = true;
		} else {
			camposExportar[11].valor[0] = false;
		}
	} else if($("#esSubVariable").is(':checked')) {
		if($("#existe").is(':checked')) {
			camposExportar[12].valor[0] = true;
		} else {
			camposExportar[12].valor[0] = false;
		}
	} else if($("#esCuenta").is(':checked')) {
		if($("#existe").is(':checked')) {
			camposExportar[13].valor[0] = true;
		} else {
			camposExportar[13].valor[0] = false;
		}
	} else if($("#calce").is(':checked')) {
		var op, valor = $("#inputLista").val();
		if($("#menor").is(':checked')) {
			op = "<";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#mayor").is(':checked')) {
			op = ">";
		} else if($("#mayorigual").is(':checked')) {
			op = ">=";
		} else if($("#igual").is(':checked')) {
			op = "==";
		} else if($("#noigual").is(':checked')) {
			op = "!=";
		}
		camposExportar[4].valor.push(op+" "+valor);
	} else if($("#volumen").is(':checked')) {
		var op, valor = $("#inputLista").val();
		if($("#menor").is(':checked')) {
			op = "<";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#mayor").is(':checked')) {
			op = ">";
		} else if($("#mayorigual").is(':checked')) {
			op = ">=";
		} else if($("#igual").is(':checked')) {
			op = "==";
		} else if($("#noigual").is(':checked')) {
			op = "!=";
		}
		camposExportar[5].valor.push(op+" "+valor);
	} else if($("#influencia").is(':checked')) {
		var op, valor = $("#inputLista").val();
		if($("#menor").is(':checked')) {
			op = "<";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#mayor").is(':checked')) {
			op = ">";
		} else if($("#mayorigual").is(':checked')) {
			op = ">=";
		} else if($("#igual").is(':checked')) {
			op = "==";
		} else if($("#noigual").is(':checked')) {
			op = "!=";
		}
		camposExportar[6].valor.push(op+" "+valor);
	} else if($("#numerador").is(':checked')) {
		var op, valor = $("#inputLista").val();
		if($("#menor").is(':checked')) {
			op = "<";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#mayor").is(':checked')) {
			op = ">";
		} else if($("#mayorigual").is(':checked')) {
			op = ">=";
		} else if($("#igual").is(':checked')) {
			op = "==";
		} else if($("#noigual").is(':checked')) {
			op = "!=";
		}
		camposExportar[7].valor.push(op+" "+valor);
	} else if($("#denominador").is(':checked')) {
		var op, valor = $("#inputLista").val();
		if($("#menor").is(':checked')) {
			op = "<";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#mayor").is(':checked')) {
			op = ">";
		} else if($("#mayorigual").is(':checked')) {
			op = ">=";
		} else if($("#igual").is(':checked')) {
			op = "==";
		} else if($("#noigual").is(':checked')) {
			op = "!=";
		}
		camposExportar[8].valor.push(op+" "+valor);
	} else if($("#totalRCL").is(':checked')) {
		var op, valor = $("#inputLista").val();
		if($("#menor").is(':checked')) {
			op = "<";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#mayor").is(':checked')) {
			op = ">";
		} else if($("#mayorigual").is(':checked')) {
			op = ">=";
		} else if($("#igual").is(':checked')) {
			op = "==";
		} else if($("#noigual").is(':checked')) {
			op = "!=";
		}
		camposExportar[14].valor.push(op+" "+valor);
	} else if($("#total").is(':checked')) {
		var op, valor = $("#inputLista").val();
		if($("#menor").is(':checked')) {
			op = "<";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#menorigual").is(':checked')) {
			op = "<=";
		} else if($("#mayor").is(':checked')) {
			op = ">";
		} else if($("#mayorigual").is(':checked')) {
			op = ">=";
		} else if($("#igual").is(':checked')) {
			op = "==";
		} else if($("#noigual").is(':checked')) {
			op = "!=";
		}
		camposExportar[15].valor.push(op+" "+valor);
	} else if($("#moneda").is(':checked')) {
		var valor = $("#inputLista").val();
		if($("#seEncuentra").is(':checked')) {
			camposExportar[9].valor.push(".localeCompare('"+valor+"') == 0");
		} else {
			camposExportar[9].valor.push(".localeCompare('"+valor+"') != 0");
		}
	} else if($("#sucursal").is(':checked')) {
		var valor = $("#inputLista").val();
		if($("#seEncuentra").is(':checked')) {
			camposExportar[10].valor.push(".localeCompare('"+valor+"') == 0");
		} else {
			camposExportar[10].valor.push(".localeCompare('"+valor+"') != 0");
		}
	} else if($("#nombreVariable").is(':checked')) {
		var valor = $("#inputLista").val();
		if($("#seEncuentra").is(':checked')) {
			camposExportar[10].valor.push(".localeCompare('"+valor+"') == 0");
		} else {
			camposExportar[10].valor.push(".localeCompare('"+valor+"') != 0");
		}
	}
	renderFilters();
	$("body").overhang({
        type: "success",
        primary: "#40D47E",
        accent: "#27AE60",
        message: "Filtro Creado.",
        duration: 1,
        overlay: true
    });
}

renderFilters();
function renderFilters () {
  	var content = '';
  	$("#tablaFiltros").empty();
  	for (var i = 0; i < camposExportar.length; i++) {
  		content+="<tr><th>"+camposExportar[i].nombre+"</th>";
  		content+="<td>";
  		for (var j = 0; j < camposExportar[i].valor.length; j++) {
  			if(typeof camposExportar[i].valor[j] !== "boolean" && camposExportar[i].valor[j].indexOf("'") > -1)
  				content+=camposExportar[i].valor[j].split(/'/)[1];
  			else
  				content+=camposExportar[i].valor[j];
  			if(j+1 < camposExportar[i].valor.length)
  				content+=", ";
  		};
  		content+="</td></tr>";
  	};
  	$("#tablaFiltros").append(content);
}

function initCreateExcelFile () {
	//loadResults();
	createMethodsFilter();
}

function createMethodsFilter () {
	var content = '', contadorTabs = 0;
	for (var j = 0; j < camposExportar.length; j++) {
		if(j == 0 && camposExportar[j].valor.length > 0) {	//Es RCL
			content+=" and ";
			content+=" esRCL = '"+camposExportar[j].valor[0]+"'";
		} else if(j == 1 && camposExportar[j].valor.length > 0) {	//	Nombre Variable
			content+=" and ";
			for (var k = 0; k < camposExportar[j].valor.length; k++) {
				if(k > 0)
					content+=" or ";
				content+=" nombreVariable = '"+camposExportar[j].valor[k]+"'";
			};
		} else if(j == 2 && camposExportar[j].valor.length > 0) {	//es numerador
			content+=" and ";
			content+=" esNumerador = '"+camposExportar[j].valor[0]+"'";
		} else if(j == 3 && camposExportar[j].valor.length > 0) {	//es denominador
			content+=" and ";
			content+=" esNumerador != '"+camposExportar[j].valor[0]+"'";
		} else if(j == 4 && camposExportar[j].valor.length > 0) {	//tipo de proyeccion
			content+=" and ";
			for (var k = 0; k < camposExportar[j].valor.length; k++) {
				if(k > 0)
					content+=" or ";
				content+=" tipoProyeccion "+camposExportar[j].valor[k];
			};
		} else if(j == 5 && camposExportar[j].valor.length > 0) {	//volumen de formula
			content+=" and ";
			for (var k = 0; k < camposExportar[j].valor.length; k++) {
				if(k > 0)
					content+=" or ";
				content+=" volumenFormula "+camposExportar[j].valor[k];
			};
		} else if(j == 6 && camposExportar[j].valor.length > 0) {	//influencia de formula
			content+=" and ";
			for (var k = 0; k < camposExportar[j].valor.length; k++) {
				if(k > 0)
					content+=" or ";
				content+=" influenciaFormula "+camposExportar[j].valor[k];
			};
		} else if(j == 7 && camposExportar[j].valor.length > 0) {	//Numerador
			content+=" and ";
			for (var k = 0; k < camposExportar[j].valor.length; k++) {
				if(k > 0)
					content+=" or ";
				content+=" numerador "+camposExportar[j].valor[k];
			};
		} else if(j == 8 && camposExportar[j].valor.length > 0) {	//Denominador
			content+=" and ";
			for (var k = 0; k < camposExportar[j].valor.length; k++) {
				if(k > 0)
					content+=" or ";
				content+=" denominador "+camposExportar[j].valor[k];
			};
		} else if(j == 9 && camposExportar[j].valor.length > 0) {	//moneda
			content+=" and ";
			for (var k = 0; k < camposExportar[j].valor.length; k++) {
				if(k > 0)
					content+=" or ";
				content+=" moneda = '"+camposExportar[j].valor[k]+"'";
			};
		} else if(j == 10 && camposExportar[j].valor.length > 0) {	//sucursal
			content+=" and ";
			for (var k = 0; k < camposExportar[j].valor.length; k++) {
				if(k > 0)
					content+=" or ";
				content+=" sucursal = '"+camposExportar[j].valor[k]+"'";
			};
		} else if(j == 11 && camposExportar[j].valor.length > 0) {	//esVariable
			content+=" and ";
			if(camposExportar[j].valor[0]) {
				content+=" tipo = 'variable'";
			} else {
				content+=" tipo != 'variable'";
			}
		} else if(j == 12 && camposExportar[j].valor.length > 0) {	//esSubVariable
			content+=" and ";
			if(camposExportar[j].valor[0]) {
				content+=" tipo = 'subVariable'";
			} else {
				content+=" tipo != 'subVariable'";
			}
		} else if(j == 13 && camposExportar[j].valor.length > 0) {	//esSubVariable
			content+=" and ";
			if(camposExportar[j].valor[0]) {
				content+=" tipo = 'cuenta'";
			} else {
				content+=" tipo != 'cuenta'";
			}
		} else if(j == 14 && camposExportar[j].valor.length > 0) {	//totalRCL
			content+=" and ";
			for (var k = 0; k < camposExportar[j].valor.length; k++) {
				if(k > 0)
					content+=" or ";
				content+=" totalRCL "+camposExportar[j].valor[k];
			};
		} else if(j == 15 && camposExportar[j].valor.length > 0) {	//total
			content+=" and ";
			for (var k = 0; k < camposExportar[j].valor.length; k++) {
				if(k > 0)
					content+=" or ";
				content+=" total "+camposExportar[j].valor[k];
			};
		}
	}
	loadResults(content);
}

function loadResults (content) {
	var fechaInicial = new Date(2019, 1, 1), fechaFinal = new Date(2019, 12, 31);
	arregloFechas = [];
	arregloInserciones = [];
	const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Totales where fecha <= '"+formatDateCreation(fechaFinal)+"' and fecha >= '"+formatDateCreation(fechaInicial)+"' "+content, (err, result) => {
            if (err) {
                if (!rolledBack) {
                	console.log(err);
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con la tabla de Totales.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            } else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0) {
                    	for (var i = 0; i < result.recordset.length; i++) {
                    		if(!existeFecha(result.recordset[i].fecha)) {
                    			arregloFechas.push(result.recordset[i].fecha);
                    			arregloFechas.sort(); ///VERI SI FUNKA
                    		}
                    	};
                    	arregloTotales = result.recordset;
                    } else {
                    }
                    console.log("RESULTADOS");
                    console.log(arregloTotales);
                    creatingExcel();
                });
            }
        });
    }); // fin transaction
}

var arregloFechas = [];
var arregloTotales = [];

function existeFecha (fecha) {
	for (var i = 0; i < arregloFechas.length; i++) {
		if(arregloFechas[i].getTime() == fecha.getTime() )
			return true;
	};
	return false;
}

function creatingExcel () {
	var longitudCeldas = (arregloFechas.length * 13) - 1;
	var workbook = {
        SheetNames : ["Libro1"],
        Sheets: {
            "Libro1": {
                "!merges":[],
                "!ref":"A1:"+"L"+(6+arregloTotales.length)
            }
        }
    };
    //TITULO A1
    workbook.Sheets.Libro1["A1"] = {
        v: "Reporte por Calce de Resutlados RCL",
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
    workbook.Sheets.Libro1["!merges"].push({s:{r:0,c:0},e:{r:0,c:longitudCeldas}});

    //HORA DE CREACION
    var fechaDeCreacion = new Date();
    var txtFechaCreacion = "Hora y fecha de creacion: "+fechaDeCreacion.getHours()+":"+fechaDeCreacion.getMinutes()+" - "+fechaDeCreacion.getDate()+" de "+espanol(fechaDeCreacion.getMonth())+" "+fechaDeCreacion.getFullYear();
    workbook.Sheets.Libro1["A2"] = {
        v: txtFechaCreacion,
        s: {
            font: {
              color: {
                rgb: '000000'
              },
              sz : 14
            },
            alignment: {
                horizontal: "center"
            }
        }
    };
    workbook.Sheets.Libro1["!merges"].push({s:{r:1,c:0},e:{r:1,c:longitudCeldas}});

    //FECHAS
    var fechaInicial = new Date(), fechaFinal = new Date();
    var txtFechaCreacion = "Fechas: "+fechaInicial.getDate()+" de "+espanol(fechaInicial.getMonth())+" "+fechaInicial.getFullYear()+" - "+fechaFinal.getDate()+" de "+espanol(fechaFinal.getMonth())+" "+fechaFinal.getFullYear();
    workbook.Sheets.Libro1["A3"] = {
        v: txtFechaCreacion,
        s: {
            font: {
              color: {
                rgb: '000000'
              },
              sz : 14
            },
            alignment: {
                horizontal: "center"
            }
        }
    };
    workbook.Sheets.Libro1["!merges"].push({s:{r:1,c:0},e:{r:1,c:longitudCeldas}});

  
    for (var i = 0; i < arregloFechas.length; i++) {
    	//TITULOS COLUMNAS
	    workbook.Sheets.Libro1["A5"] = {
	        v: "Fecha: "+arregloFechas[i].getDate()+" de "+espanol(arregloFechas[i].getMonth())+" "+arregloFechas[i].getFullYear(),
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
	                rgb: "01579b"
	              },
	              fgColor: {
	                rgb: "01579b"
	              }
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["!merges"].push({s:{r:1,c:0},e:{r:1,c:longitudCeldas.length}});
	    workbook.Sheets.Libro1["A6"] = {
	        v: "Nombre de Variable",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["B6"] = {
	        v: "Volumen de Fórmula",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["C6"] = {
	        v: "Influencia de Fórmula",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["D6"] = {
	        v: "Moneda",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["E6"] = {
	        v: "Sucursal",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["F6"] = {
	        v: "Tipo",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["G6"] = {
	        v: "Tabla",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["H6"] = {
	        v: "Total RCL",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["I6"] = {
	        v: "Proyección 30 Días",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["J6"] = {
	        v: "Proyección 60 Días",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["K6"] = {
	        v: "Proyección 90 Días",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };
	    workbook.Sheets.Libro1["L6"] = {
	        v: "Proyección 120 Días",
	        s: {
	            font: {
	              color: {
	                rgb: 'ffffff'
	              },
	              bold: true,
	              sz : 15
	            },
	            fill: {
	              	patternType: "solid",
	              	bgColor: {
	                	rgb: "01579b"
	              	},
	              	fgColor: {
	                	rgb: "01579b"
	              	}
	            },
	            alignment: {
	                horizontal: "center"
	            }
	        }
	    };

	    //RESULTADOS
	    for (var j = 0; j < arregloTotales.length; j++) {
	    	//var celda = toColumnName(j);
	    	var index = search(arregloTotales[j].nombreVariable);
	    	if(index == -1) {
	    		index = 7 + arregloInserciones.length;
	    		arregloInserciones.push(arregloTotales[j]);
	    	} else
	    		index += 7;
	    	workbook.Sheets.Libro1["A"+index] = {
		        v: arregloTotales[j].nombreVariable,
		        s: {
		            font: {
		              color: {
		                rgb: '000'
		              },
		              bold: false,
		              sz : 13
		            },
		            alignment: {
		                horizontal: "center"
		            }
		        }
		    };
		    workbook.Sheets.Libro1["B"+index] = {
		        v: arregloTotales[j].volumenFormula,
		        t:'n',
		        s: {
		            font: {
		              color: {
		                rgb: '000'
		              },
		              bold: false,
		              sz : 13
		            },
		            alignment: {
		                horizontal: "center"
		            }
		        }
		    };
		    workbook.Sheets.Libro1["C"+index] = {
		        v: arregloTotales[j].influenciaFormula,
		        t:'n',
		        s: {
		            font: {
		              color: {
		                rgb: '000'
		              },
		              bold: false,
		              sz : 13
		            },
		            alignment: {
		                horizontal: "center"
		            }
		        }
		    };
		    workbook.Sheets.Libro1["D"+index] = {
		        v: arregloTotales[j].moneda,
		        s: {
		            font: {
		              color: {
		                rgb: '000'
		              },
		              bold: false,
		              sz : 13
		            },
		            alignment: {
		                horizontal: "center"
		            }
		        }
		    };
		    workbook.Sheets.Libro1["E"+index] = {
		        v: arregloTotales[j].sucursal,
		        s: {
		            font: {
		              color: {
		                rgb: '000'
		              },
		              bold: false,
		              sz : 13
		            },
		            alignment: {
		                horizontal: "center"
		            }
		        }
		    };
		    workbook.Sheets.Libro1["F"+index] = {
		        v: arregloTotales[j].tipo,

		        s: {
		            font: {
		              color: {
		                rgb: '000'
		              },
		              bold: false,
		              sz : 13
		            },
		            alignment: {
		                horizontal: "center"
		            }
		        }
		    };
		    workbook.Sheets.Libro1["G"+index] = {
		        v: arregloTotales[j].tablaAplicar,
		        t:'n',
		        s: {
		            font: {
		              color: {
		                rgb: '000'
		              },
		              bold: false,
		              sz : 13
		            },
		            alignment: {
		                horizontal: "center"
		            }
		        }
		    };
		    workbook.Sheets.Libro1["H"+index] = {
		        v: arregloTotales[j].totalRCL,
		        t:'n',
		        s: {
		            font: {
		              color: {
		                rgb: '000'
		              },
		              bold: false,
		              sz : 13
		            },
		            alignment: {
		                horizontal: "center"
		            }
		        }
		    };
		    if(arregloTotales[j].tipoProyeccion == 30) {
			    workbook.Sheets.Libro1["I"+index] = {
			        v: arregloTotales[j].total,
			        t:'n',
			        s: {
			            font: {
			              color: {
			                rgb: '000'
			              },
			              bold: false,
			              sz : 13
			            },
			            alignment: {
			                horizontal: "center"
			            }
			        }
			    };
			} else if(arregloTotales[j].tipoProyeccion == 60) {
			    workbook.Sheets.Libro1["J"+index] = {
			        v: arregloTotales[j].total,
			        t:'n',
			        s: {
			            font: {
			              color: {
			                rgb: '000'
			              },
			              bold: false,
			              sz : 13
			            },
			            alignment: {
			                horizontal: "center"
			            }
			        }
			    };
			} else if(arregloTotales[j].tipoProyeccion == 90) {
			    workbook.Sheets.Libro1["K"+index] = {
			        v: arregloTotales[j].total,
			        t:'n',
			        s: {
			            font: {
			              color: {
			                rgb: '000'
			              },
			              bold: false,
			              sz : 13
			            },
			            alignment: {
			                horizontal: "center"
			            }
			        }
			    };
			} else if(arregloTotales[j].tipoProyeccion == 120) {
			    workbook.Sheets.Libro1["L"+index] = {
			        v: arregloTotales[j].total,
			        t:'n',
			        s: {
			            font: {
			              color: {
			                rgb: '000'
			              },
			              bold: false,
			              sz : 13
			            },
			            alignment: {
			                horizontal: "center"
			            }
			        }
			    };
			}
	    }; // FIN FOR RESULTADOS
    };
    console.log("FIN")
    $("body").overhang({
        type: "success",
        primary: "#40D47E",
        accent: "#27AE60",
        message: "Resultados guardados satisfactoriamente.",
        duration: 1,
        overlay: true
    });

    //DESCARGAR
    var wbout = XLSX.write(workbook, {bookType:'xlsx', bookSST:false, type: 'binary'});
    XLSX.writeFile(workbook, "./Reporte.xlsx");
}

var arregloInserciones = [];

function search (nombreVariable) {
	for (var i = 0; i < arregloInserciones.length; i++) {
		if(arregloInserciones[i].nombreVariable.localeCompare(nombreVariable) == 0)
			return i;
	};
	return -1;
}

function espanol(mes) {
    var mesEspanol = '';
    switch(mes){
        case 0: mesEspanol = 'Enero';
            break;
        case 1: mesEspanol = 'Febrero';
            break;
        case 2: mesEspanol = 'Marzo';
            break;
        case 3: mesEspanol = 'Abril';
            break;
        case 4: mesEspanol = 'Mayo';
            break;
        case 5: mesEspanol = 'Junio';
            break;
        case 6: mesEspanol = 'Julio';
            break;
        case 7: mesEspanol = 'Agosto';
            break;
        case 8: mesEspanol = 'Septiembre';
            break;
        case 9: mesEspanol = 'Octubre';
            break;
        case 10: mesEspanol = 'Noviembre';
            break;
        case 11: mesEspanol = 'Diciembre';
            break;
    }
    return mesEspanol;
}

function toColumnName(num) {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
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
    return year + '-' + monthIndex + '-' + day;
}