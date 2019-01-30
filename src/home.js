const electron = require('electron');
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
		loadVariablesMainDB();
		loadRCL();
	}
});

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
var filepathFullLogo = '';
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
var chart_plot_02_data = [];

init_daterangepicker();

function loadRCL () {
    const transaction = new sql.Transaction( pool1 );
    transaction.begin(err => {
        var rolledBack = false;
        transaction.on('rollback', aborted => {
            rolledBack = true;
        });
        const request = new sql.Request(transaction);
        request.query("select * from RCL ", (err, result) => {
            if (err) {
                if (!rolledBack) {
                    console.log('error en rolledBack MainDB Variables');
                    transaction.rollback(err => {
                        console.log('error en rolledBack');
                        console.log(err);
                    });
                }
            } else {
                transaction.commit(err => {
                    console.log("Transaction committed MainDB Variables");
                    console.log(result);
                    if(result.recordset.length > 0){
                    	//chart_plot_02_data = result.recordset;
                    	//[new Date(Date.today().add(i).days()).getTime(), randNum() + i + i + 10]
                    	for (var i = 0; i < result.recordset.length; i++) {
                    		chart_plot_02_data.push([result.recordset[i].fecha.getTime(), result.recordset[i].RCL]);
                    	};
                    } else {
                    	chart_plot_02_data = [];
                    }
                    console.log('antesssssss');
                    console.log(chart_plot_02_data);
                    init_flot_chart2();
                });
            }
        });
    }); // fin transaction
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
	  console.log("show event fired");
	});
	$('#tituloRCL').on('hide.daterangepicker', function() {
	  console.log("hide event fired");
	});
	$('#tituloRCL').on('apply.daterangepicker', function(ev, picker) {
	  console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
	});
	$('#tituloRCL').on('cancel.daterangepicker', function(ev, picker) {
	  console.log("cancel event fired");
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
			max: chart_plot_02_data[0][0]
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

			$("#tooltip").html(item.series.label + " <br> " + timestamp +' - ' + x + " = " + y)
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

function goRCL () {
	$("#app_root").empty();
    $("#app_root").load("src/rcl.html");
}