const electron = require('electron');
const remote = require('electron').remote;
const sql = require('mssql');
const nodemailer = require('nodemailer');

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
	if(err)
		console.log(err);
	else{
		console.log('pool loaded');
		//loadVariablesMainDB();
		var hoy =  new Date();
		var primerDia = new Date(hoy.getFullYear(), 0, 1);
		var ultimoDia = new Date(hoy.getFullYear(), 11, 31);
		loadFOSEDE();
		loadRCL(primerDia, ultimoDia, "", 30);
		loadAssets(primerDia, ultimoDia);
		loadDeposits(primerDia, ultimoDia);
		loadLoans(primerDia, ultimoDia);
	}
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rcllugonhn@gmail.com',
        pass: 'SoFtPr0t3cT'
    }
});

var mailOptions = {
    from: 'rcllugonhn@gmail.com',
    to: 'dario.villalta@gmail.com',
    subject: 'Sending Email using Node.js',
    html: '<h1>Welcome</h1><p>That was easy!</p>'
};

function mail () {
    console.log('llamado');
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}

var session = remote.session;

session.defaultSession.cookies.get({}, (error, cookies) => {
	var permisosVariables = false;
	for (var i = 0; i < cookies.length; i++) {
		if(cookies[i].name == "name"){
			$("#nameUser").text(cookies[i].value);
			$("#navbar_name").text(cookies[i].value);
		} else if(cookies[i].name == "formula"){
			if(cookies[i].value == "1")
				permisosVariables = true;
		} else if(cookies[i].name == "fosede"){
			if(cookies[i].value == "1")
				permisosVariables = true;
		}else if(cookies[i].name == "usuarios"){
			if(cookies[i].value == "0")
				$("#userLabel").hide();
		}
	};
	if(!permisosVariables)
		$("#varLabel").hide();
});

/* ****************** 		LOADING IMG 	********* */
/*var filepathFullLogo = '';
var filepathSmallLogo = '';
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
                    console.log(err);
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    if(result.recordset.length > 0){
                    	if(result.recordset[0].fullLogo.length > 0){
                    		filepathFullLogo = result.recordset[0].fullLogo;
                    		$("#fullLogo").attr("src",filepathFullLogo);
                    	} else
                    		filepathFullLogo = '';
                    	if(result.recordset[0].smallLogo.length > 0){
                    		filepathSmallLogo = result.recordset[0].smallLogo;
                    		$("#smallLogo").attr("src",filepathSmallLogo);
                    		$("#smallLogo").css("height","3.4em");
                    	} else
                    		filepathSmallLogo = '';
                    } else {
                    	filepathFullLogo = '';
                    	filepathSmallLogo = '';
                    }
                });
            }
        });
    }); // fin transaction
}*/
/* ****************** 		END LOADING IMG 	********* */
var chart_plot_02_data = [];
var arregloFOSEDE = [];

init_daterangepicker();

function loadRCL (fechaInicial, fechaFinal, moneda, tipoProyeccion) {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from Totales where esRCL = '"+true+"' and fecha between '"+formatDateCreation(fechaInicial)+"' and '"+formatDateCreation(fechaFinal)+"' and tipoProyeccion = "+tipoProyeccion/*"' and moneda = '"+moneda+"'"*/, (err, result) => {
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
                    if(result.recordset.length > 0){
                    	chart_plot_02_data = [];
                    	for (var i = 0; i < result.recordset.length; i++) {
                    		result.recordset[i].fecha = new Date(result.recordset[i].fecha.getUTCFullYear(), result.recordset[i].fecha.getUTCMonth(), result.recordset[i].fecha.getUTCDate());
                    		result.recordset[i].total*=100
                    		chart_plot_02_data.push([result.recordset[i].fecha.getTime(), result.recordset[i].total]);
                    	};
                    } else {
                    	chart_plot_02_data = [];
                    }
                    if(chart_plot_02_data.length > 0)
                    	init_flot_chart2();
                    console.log(chart_plot_02_data)
                });
            }
        });
    }); // fin transaction
}

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
                        for (var i = 0; i < arregloFOSEDE.length; i++) {
                        	/*var newOption = new Option(arregloFOSEDE[i].moneda, i, false, false);
							$('#selectMoneda').append(newOption).trigger('change');*/
                        };
                    } else {
                        arregloFOSEDE = [];
                    }
                });
            }
        });
    }); // fin transaction
}

function loadAssets (fechaInicial, fechaFinal) {
	//Set top Assets
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select TOP 5 * from Activos where fecha between '"+formatDateCreation(fechaInicial)+"' and '"+formatDateCreation(fechaFinal)+"' order by saldo DESC", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err);
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de Activos.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            } else {
                transaction.commit(err => {
                	var content = '';
                    if(result.recordset.length > 0){
                    	for (var i = 0; i < result.recordset.length; i++) {
                    		var simbolo = getSimbolo(result.recordset[i].moneda);
                    		content +=	'<article class="media event">'+
					                    	'<a class="pull-left date">'+
					                      		'<p class="month">'+getMonth(result.recordset[i].fecha.getUTCMonth())+'</p>'+
					                      		'<p class="day">'+result.recordset[i].fecha.getUTCDate()+'</p>'+
					                    	'</a>'+
					                    	'<div class="media-body">'+
					                      		'<a class="title" href="#">'+result.recordset[i].cuenta+'</a>'+
					                      		'<small style="margin-left: 3%;">'+simbolo+' '+result.recordset[i].saldo.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+'</small>'+
					                      		'<p>'+result.recordset[i].nombre+'</p>'+
					                    	'</div>'+
					                  	'</article>';
                    	};
                    }
                    $("#listActivos").empty();
                    $("#listActivos").append(content);
                });
            }
        });
    }); // fin transaction top Assets

	//Get sum Assets
    const transaction2 = new sql.Transaction( pool1 );
    transaction2.begin(err => {
        var rolledBack = false;
        transaction2.on('rollback', aborted => {
            rolledBack = true;
        });
        const request2 = new sql.Request(transaction2);
        request2.query("select SUM(saldo) from Activos where fecha between '"+formatDateCreation(fechaInicial)+"' and '"+formatDateCreation(fechaFinal)+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err);
                    transaction2.rollback(err => {
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
                transaction2.commit(err => {
                	$("#totalALAC").text("");
                    if(result.recordset.length > 0){
                    	var total = result.recordset[0][Object.keys(result.recordset[0])[0]];
                        if(total != null)
                    	   $("#totalALAC").text(total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                        else
                            $("#totalALAC").text("0.00");
                    }
                });
            }
        });
    }); // fin transaction sum Assets
}

function loadDeposits (fechaInicial, fechaFinal) {
	//Set top Assets
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select TOP 5 * from Depositos where fecha between '"+formatDateCreation(fechaInicial)+"' and '"+formatDateCreation(fechaFinal)+"' order by saldo DESC", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err);
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de Depositos.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            } else {
                transaction.commit(err => {
                	var content = '';
                    if(result.recordset.length > 0){
                    	for (var i = 0; i < result.recordset.length; i++) {
                    		var simbolo = getSimbolo(result.recordset[i].moneda);
                    		content +=	'<article class="media event">'+
					                    	'<a class="pull-left date">'+
					                      		'<p class="month">'+getMonth(result.recordset[i].fecha.getUTCMonth())+'</p>'+
					                      		'<p class="day">'+result.recordset[i].fecha.getUTCDate()+'</p>'+
					                    	'</a>'+
					                    	'<div class="media-body">'+
					                      		'<a class="title" href="#">'+result.recordset[i].tipoPersona+'</a>'+
					                      		'<small style="margin-left: 3%;">'+simbolo+' '+result.recordset[i].saldo.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+'</small>'+
					                      		'<p>'+result.recordset[i].nombreCliente+'</p>'+
					                    	'</div>'+
					                  	'</article>';
                    	};
                    }
                    $("#listDepositos").empty();
                    $("#listDepositos").append(content);
                });
            }
        });
    }); // fin transaction top Assets

	//Get sum Assets
    const transaction2 = new sql.Transaction( pool1 );
    transaction2.begin(err => {
        var rolledBack = false;
        transaction2.on('rollback', aborted => {
            rolledBack = true;
        });
        const request2 = new sql.Request(transaction2);
        request2.query("select SUM(saldo) from Depositos where fecha between '"+formatDateCreation(fechaInicial)+"' and '"+formatDateCreation(fechaFinal)+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err);
                    transaction2.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de Depositos.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            } else {
                transaction2.commit(err => {
                	$("#totalDepositos").text("");
                    if(result.recordset.length > 0){
                    	var total = result.recordset[0][Object.keys(result.recordset[0])[0]];
                        if(total != null)
                    	   $("#totalDepositos").text(total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                        else
                            $("#totalDepositos").text("0.00");
                    }
                });
            }
        });
    }); // fin transaction sum Assets
}

function loadLoans (fechaInicial, fechaFinal) {
	//Set top Assets
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select TOP 5 * from Prestamos where fecha between '"+formatDateCreation(fechaInicial)+"' and '"+formatDateCreation(fechaFinal)+"' order by saldo DESC", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err);
                    transaction.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de Prestamos.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            } else {
                transaction.commit(err => {
                	var content = '';
                    if(result.recordset.length > 0){
                    	for (var i = 0; i < result.recordset.length; i++) {
                    		var simbolo = getSimbolo(result.recordset[i].moneda);
                    		content +=	'<article class="media event">'+
					                    	'<a class="pull-left date">'+
					                      		'<p class="month">'+getMonth(result.recordset[i].fecha.getUTCMonth())+'</p>'+
					                      		'<p class="day">'+result.recordset[i].fecha.getUTCDate()+'</p>'+
					                    	'</a>'+
					                    	'<div class="media-body">'+
					                      		'<a class="title" href="#">'+result.recordset[i].tipoPersona+'</a>'+
					                      		'<small style="margin-left: 3%;">'+simbolo+' '+result.recordset[i].saldo.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+'</small>'+
					                      		'<p>'+result.recordset[i].nombreCliente+'</p>'+
					                    	'</div>'+
					                  	'</article>';
                    	};
                    }
                    $("#listPrestamos").empty();
                    $("#listPrestamos").append(content);
                });
            }
        });
    }); // fin transaction top Assets

	//Get sum Assets
    const transaction2 = new sql.Transaction( pool1 );
    transaction2.begin(err => {
        var rolledBack = false;
        transaction2.on('rollback', aborted => {
            rolledBack = true;
        });
        const request2 = new sql.Request(transaction2);
        request2.query("select SUM(saldo) from Prestamos where fecha between '"+formatDateCreation(fechaInicial)+"' and '"+formatDateCreation(fechaFinal)+"'", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log(err);
                    transaction2.rollback(err => {
                        $("body").overhang({
				            type: "error",
				            primary: "#f84a1d",
				            accent: "#d94e2a",
				            message: "Error en conección con la tabla de Prestamos.",
				            overlay: true,
				            closeConfirm: true
				        });
                    });
                }
            } else {
                transaction2.commit(err => {
                	$("#totalPrestamos").text("");
                    if(result.recordset.length > 0){
                    	var total = result.recordset[0][Object.keys(result.recordset[0])[0]];
                        if(total != null)
                    	   $("#totalPrestamos").text(total.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                        else
                            $("#totalPrestamos").text("0.00");
                    }
                });
            }
        });
    }); // fin transaction sum Assets
}

function getSimbolo (moneda) {
	for (var i = 0; i < arregloFOSEDE.length; i++) {
		if(arregloFOSEDE[i].moneda.localeCompare(moneda) == 0)
			return arregloFOSEDE[i].simbolo;
	};
	return '';
}

function init_daterangepicker() {
	if( typeof ($.fn.daterangepicker) === 'undefined'){ return; }
	console.log('init_daterangepicker');

	var cb = function(start, end, label) {
	  	console.log(start.toISOString(), end.toISOString(), label);
	  	$('#tituloRCL span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
	};

	var optionSet1 = {
	  	startDate: moment().subtract(29, 'days'),
	  	endDate: moment(),
	  	minDate: '01/01/2019',
	  	maxDate: moment(),
	  	dateLimit: {
			days: 60
	  	},
	  	grid: { hoverable: true },
	  	showDropdowns: true,
	  	showWeekNumbers: true,
	  	timePicker: false,
	  	timePickerIncrement: 1,
	  	timePicker12Hour: true,
	  	ranges: {
			'Hoy': [moment(), moment()],
			'Ayer': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
			'Últimos 7 Días': [moment().subtract(6, 'days'), moment()],
			'Últimos 30 Días': [moment().subtract(29, 'days'), moment()],
			'Este Mes': [moment().startOf('month'), moment().endOf('month')],
			'Último Mes': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
	  	},
	  	opens: 'left',
	  	buttonClasses: ['btn btn-default'],
	  	applyClass: 'btn-small btn-primary',
	  	cancelClass: 'btn-small',
	  	format: 'DD/MM/YYYY',
	  	separator: ' to ',
	  	locale: {
			applyLabel: 'Mostrar',
			cancelLabel: 'Limpiar',
			fromLabel: 'Desde',
			toLabel: 'Hasta',
			customRangeLabel: 'Personalizado',
			daysOfWeek: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
			monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
			firstDay: 1
	  	}
	};
	
	$('#tituloRCL span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
	$('#tituloRCL').daterangepicker(optionSet1, cb);
	$('#tituloRCL').on('show.daterangepicker', function() {
	  	//console.log("show event fired");
	});
	$('#tituloRCL').on('hide.daterangepicker', function() {
	  	//console.log("hide event fired");
	});
	$('#tituloRCL').on('apply.daterangepicker', function(ev, picker) {
	  	//console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
	  	loadRCL(picker.startDate.toDate(), picker.endDate.toDate(), "", 30);
	  	loadAssets(picker.startDate.toDate(), picker.endDate.toDate());
	  	loadDeposits(picker.startDate.toDate(), picker.endDate.toDate());
		loadLoans(picker.startDate.toDate(), picker.endDate.toDate());
	});
	$('#tituloRCL').on('cancel.daterangepicker', function(ev, picker) {
	  	//console.log("cancel event fired");
	});
	$('#options1').click(function() {
	  	$('#tituloRCL').data('daterangepicker').setOptions(optionSet1, cb);
	});
	$('#options2').click(function() {
	  	$('#tituloRCL').data('daterangepicker').setOptions(optionSet2, cb);
	});
	$('#destroy').click(function() {
	  	$('#tituloRCL').data('daterangepicker').remove();
	});

}

function gd(year, month, day) {
	return new Date(year, month - 1, day).getTime();
}

function init_flot_chart2(){

	var randNum = function() {
	  return (Math.floor(Math.random() * (1 + 40 - 20))) + 20;
	};
		
	if( typeof ($.plot) === 'undefined'){ return; }
	
	console.log('init_flot_chart');
	
	
	/*for (var i = 0; i < 30; i++) {
	  chart_plot_02_data.push([new Date(Date.today().add(i).days()).getTime(), randNum() + i + i + 10]);
	}*/
	
	var chart_plot_02_settings = {
		grid: {
			show: true,
			aboveData: true,
			color: "#3f3f3f",
			labelMargin: 10,
			axisMargin: 0,
			borderWidth: 0,
			borderColor: null,
			minBorderMargin: 5,
			clickable: true,
			hoverable: true,
			autoHighlight: true,
			mouseActiveRadius: 100
		},
		series: {
			lines: {
				show: true,
				fill: true,
				lineWidth: 2,
				steps: false
			},
			points: {
				show: true,
				radius: 4.5,
				symbol: "circle",
				lineWidth: 3.0
			}
		},
		legend: {
			position: "ne",
			margin: [0, -25],
			noColumns: 0,
			labelBoxBorderColor: null,
			labelFormatter: function(label, series) {
				return label + '&nbsp;&nbsp;';
			},
			width: 40,
			height: 1
		},
		colors: ['#96CA59', '#3F97EB', '#72c380', '#6f7a8a', '#f7cb38', '#5a8022', '#2c7282'],
		shadowSize: 0,
		tooltip: true,
		tooltipOpts: {
			content: "%s: %y.0",
			xDateFormat: "%d/%m",
		shifts: {
			x: -30,
			y: -50
		},
		defaultTheme: false
		},
		yaxis: {
			min: 0
		},
		xaxis: {
			mode: "time",
			minTickSize: [1, "day"],
			timeformat: "%d/%m/%y",
			min: chart_plot_02_data[0][0],
			max: chart_plot_02_data[chart_plot_02_data.length-1][chart_plot_02_data[chart_plot_02_data.length-1][chart_plot_02_data[chart_plot_02_data.length-1].length-1]]
		}
	};
	
	
	if ($("#calculoRCL").length){
		console.log('Plot2');
		
		$.plot( $("#calculoRCL"),
		[{ 
			label: "Ratio de Cobertura de Liquidez", 
			data: chart_plot_02_data, 
			lines: { 
				fillColor: "rgba(150, 202, 89, 0.12)" 
			}, 
			points: { 
				fillColor: "#fff" } 
		}], chart_plot_02_settings);
		
	}

	$("<div id='tooltip'></div>").css({
		position: "absolute",
		display: "none",
		border: "3px solid #fdd",
		padding: "2px",
		"background-color": "#fee",
		opacity: 0.80
	}).appendTo("body");

	$("#calculoRCL").bind("plothover", function (event, pos, item) {
		if (item) {
			var x = item.datapoint[0].toFixed(2),
				y = item.datapoint[1].toFixed(2);
			var timestamp = moment(parseInt(item.datapoint[0])).format("D/M/YYYY");

			$("#tooltip").html(item.series.label + " <br> " + timestamp +' - ' + x + " = " + y+"%")
				.css({top: item.pageY+5, left: item.pageX+5})
				.fadeIn(200);
		} else {
			$("#tooltip").hide();
		}
	});

	$("#calculoRCL").bind("plotclick", function (event, pos, item) {
		console.log('yea2');
	});
  
}

function formatDateCreation(date) {
    var day = date.getDate();
    var monthIndex = date.getMonth();
    monthIndex++;
    var year = date.getFullYear();
    return year + '-' + monthIndex + '-' + day;
}

function getMonth(mes) {
    var monthNames = [
        "Ene", "Feb", "Mar",
        "Abr", "May", "Jun", "Jul",
        "Ago", "Sep", "Oct",
        "Nov", "Dec"
    ];
    return monthNames[mes];
}



//	**********		Route Change		**********
function goVariables () {
	$("#app_root").empty();
    cleanupSelectedList();
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
    cleanupSelectedList();
	cleanup();
    $("#app_root").load("src/users.html");
}

function goConnections () {
    $("#app_root").empty();
    cleanupSelectedList();
    cleanup();
    $("#app_root").load("src/importaciones.html");
}

function goConfig () {
    $("#app_root").empty();
    cleanupSelectedList();
    cleanup();
    $("#app_root").load("src/config.html");
}

function logout () {
    $("#app_full").empty();
    session.defaultSession.clearStorageData([], (data) => {});
    cleanup();
    $("#app_full").load("src/login.html");
}

function goRCL () {
	$("#app_root").empty();
	cleanup();
    $("#app_root").load("src/rcl.html");
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

function goAssets () {
    $("#app_root").empty();
    cleanupSelectedList();
    cleanup();
    $("#app_root").load("src/mantenimientoActivos.html");
}

function goDeposits () {
    $("#app_root").empty();
    cleanupSelectedList();
    cleanup();
    $("#app_root").load("src/mantenimientoDepositos.html");
}

function goLoans () {
    $("#app_root").empty();
    cleanupSelectedList();
    cleanup();
    $("#app_root").load("src/mantenimientoPrestamos.html");
}

function goLists () {
    $("#app_root").empty();
    cleanupSelectedList();
    cleanup();
    $("#app_root").load("src/variablesLists.html");
}

var cleanup = function () {
    delete window.electron;
    delete window.remote;
    delete window.path;
    delete window.sql;
    delete window.config;
    delete window.pool1;
    delete window.session;
    delete window.user;
    delete window.password;
    delete window.serve;
    delete window.database;
    delete window.filepathFullLogo;
    delete window.filepathSmallLogo;
    delete window.loadVariablesMainDB;
    delete window.chart_plot_02_data;
    delete window.arregloFOSEDE;
    delete window.loadRCL;
    delete window.init_daterangepicker;
    delete window.gd;
    delete window.init_flot_chart2;
    delete window.goVariables;
    delete window.goHome;
    delete window.goUsers;
    delete window.goConnections;
    delete window.logout;
    delete window.goRCL;
};

function cleanupSelectedList () {
    $(".side-menu li").each(function( i ) {
        if ($(this).hasClass("active"))
            $(this).removeClass("active")
    });
}















function createRowsSelect () {
    seconds = 0;
    myInterval = setInterval(incrementSeconds, 1000);
    var contador = 0;
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from ListasVariables", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en ListasVariables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    var arr = result.recordset;
                    var maximo = arr.length;
                    for (var i = 0; i < arr.length; i++) {
                        let temporal = arr[i];
                        const transaction = new sql.Transaction( pool1 );
                        transaction.begin(err => {
                            var rolledBack = false;
                            transaction.on('rollback', aborted => {
                                // emited with aborted === true
                                rolledBack = true;
                            })
                            const request = new sql.Request(transaction);
                            request.query("insert into ListasVariables (idLista, nombre, valor, saldo, fechaCreacion, fechaCaducidad, puesto) values ("+1+",'"+temporal.nombre+"','"+temporal.cuenta+"',0,'"+formatDateCreation(temporal.fechaCreacion)+"','"+formatDateCreation(temporal.fechaCaducidad)+"','')", (err, result) => {
                                if (err) {
                                    if (!rolledBack) {
                                        transaction.rollback(err => {
                                            $("body").overhang({
                                                type: "error",
                                                primary: "#f84a1d",
                                                accent: "#d94e2a",
                                                message: "Error en ListasBanco.",
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
                                        contador++;
                                        if(contador == maximo)
                                            stopTimer();
                                    });
                                }
                            });
                        }); // fin create
                    };
                });
            }
        });
    }); // fin select
}

function createRows () {
    seconds = 0;
    myInterval = setInterval(incrementSeconds, 1000);
    var contador = 0;
    var temporal = {nombre: "Prueba1", cuenta: "333333", fechaInicio: new Date(), fechaFinal: new Date()};
    for (var i = 0; i < 25000; i++) {
        const transaction = new sql.Transaction( pool1 );
        transaction.begin(err => {
            var rolledBack = false;
            transaction.on('rollback', aborted => {
                // emited with aborted === true
                rolledBack = true;
            })
            const request = new sql.Request(transaction);
            request.query("insert into ListasVariables (idLista, nombre, valor, saldo, fechaCreacion, fechaCaducidad, puesto) values ("+1+",'"+temporal.nombre+"','"+temporal.cuenta+"',0,'"+formatDateCreation(temporal.fechaInicio)+"','"+formatDateCreation(temporal.fechaFinal)+"','')", (err, result) => {
                if (err) {
                    if (!rolledBack) {
                        transaction.rollback(err => {
                            $("body").overhang({
                                type: "error",
                                primary: "#f84a1d",
                                accent: "#d94e2a",
                                message: "Error en ListasBanco.",
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
                        contador++;
                        if(contador == 25000)
                            stopTimer();
                    });
                }
            });
        }); // fin create
    };
}

function selectRows () {
    seconds = 0;
    myInterval = setInterval(incrementSeconds, 1000);
    var contador = 0;
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("select * from ListasBanco", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en ListasBanco.",
                            overlay: true,
                            closeConfirm: true
                        });
                        stopTimer();
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log(result.recordset);
                    $("body").overhang({
                        type: "success",
                        primary: "#40D47E",
                        accent: "#27AE60",
                        message: "Select con éxito.",
                        duration: 2,
                        overlay: true
                    });
                    contador++;
                    if(contador == 25000)
                        stopTimer();
                });
            }
        });
    }); // fin select
}
var seconds = 0;
var myInterval;
function incrementSeconds() {
    seconds += 1;
}

function stopTimer() {
    console.log("You have been here for " + seconds + " seconds.");
    clearInterval(myInterval);
}

function deleteRows () {
    seconds = 0;
    myInterval = setInterval(incrementSeconds, 1000);
    var contador = 0;
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            rolledBack = true;
        })
        const request = new sql.Request(transaction);
        request.query("delete * from ListasBanco", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    transaction.rollback(err => {
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en ListasBanco.",
                            overlay: true,
                            closeConfirm: true
                        });
                        stopTimer();
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    var arr = result.recordset;
                    contador++;
                    if(contador == 25000)
                        stopTimer();
                });
            }
        });
    }); // fin select
}