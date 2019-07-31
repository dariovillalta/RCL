//config

requirejs.config({
	baseUrl: 'src',
	shim: {
        bootstrap: {
            deps: [ "jquery" ]
        },
        customJS: {
            deps: [ "jquery" ]
        }
    },
	paths: {
		/*configJS: 'config',
		graficosJS: 'graficos',
		homeJS: 'home',
		importacionesJS: 'importaciones',
		loginJS: 'login',
		mantenimientoActivosJS: 'mantenimientoActivos',
		mantenimientoDepositosJS: 'mantenimientoDepositos',
		mantenimientoPrestamosJS: 'mantenimientoPrestamos',
		rclJS: 'rcl',
		reportesJS: 'reportes',
		templateJS: 'template',
		usersJS: 'users',
		variableDetailJS: 'variableDetail',
		variableDetailALACJS: 'variableDetailALAC',
		variableDetailCreditoJS: 'variableDetailCredito',
		variablesJS: 'variables',
		variablesListsJS: 'variablesLists',*/
		jQuery: 'libs/jquery/dist/jquery.min',
		bootstrap: 'libs/bootstrap/dist/js/bootstrap.min',
		customJS: 'libs/custom.min',
		switchery: 'libs/switchery/dist/switchery.min',
		inputmask: 'libs/jquery.inputmask/dist/min/jquery.inputmask.bundle.min',
		jqueryUI: 'libs/jquery-ui/jquery-ui.min',
		overhang: 'libs/overhang/overhang.min',
		bootstrapDatepicker: 'libs/bootstrap-datepicker/bootstrap-datepicker',
		bootstrapDatepickerES: 'libs/bootstrap-datepicker/locales/bootstrap-datepicker.es',
		clockpicker: 'libs/clockpicker-gh-pages/dist/bootstrap-clockpicker.min',
		iCheck: 'libs/iCheck/icheck.min',
		moment: 'libs/moment/min/moment.min',
		select2: 'libs/select2/select2.min',
		flot: 'libs/flot/jquery.flot.min',
		flotTime: 'libs/flot/jquery.flot.time.min',
		flotResize: 'libs/flot/jquery.flot.resize.min',
		morris: 'libs/morris/morris.min',
		raphael: 'libs/raphael/raphael-min',
		chart: 'libs/Chart/dist/Chart',
		echarts: 'libs/echarts/dist/echarts.min',
		echartsWorld: 'libs/echarts/map/js/world',
		dateJS: 'libs/DateJS/build/date',
		datatables: 'libs/datatables.net/js/jquery.dataTables.min',
		dataTablesEditor: 'libs/datatables.net/js/jquery.dataTablesEditor',
		datatablesBootstrap: 'libs/datatables.net-bs/js/dataTables.bootstrap.min',
		datatablesButtons: 'libs/datatables.net-buttons/js/dataTables.buttons.min',
		buttonsBootstrap: 'libs/datatables.net-buttons-bs/js/buttons.bootstrap.min',
		buttonsColVis: 'libs/datatables.net-buttons/js/buttons.colVis.min',
		buttonsFlash: 'libs/datatables.net-buttons/js/buttons.flash.min',
		buttonsHtml5: 'libs/datatables.net-buttons/js/buttons.html5.min',
		buttonsPrint: 'libs/datatables.net-buttons/js/buttons.print.min',
		dataTablesFixedHeader: 'libs/datatables.net-fixedheader/js/dataTables.fixedHeader.min',
		dataTablesKeyTable: 'libs/datatables.net-keytable/js/dataTables.keyTable.min',
		dataTablesResponsive: 'libs/datatables.net-responsive/js/dataTables.responsive.min',
		responsiveBootstrap: 'libs/datatables.net-responsive-bs/js/responsive.bootstrap',
		datatablesScroller: 'libs/datatables.net-scroller/js/dataTables.scroller.min',
		jszip: 'libs/jszip/dist/jszip.min',
		pdfmake: 'libs/pdfmake/build/pdfmake.min',
		vfsfonts: 'libs/pdfmake/build/vfs_fonts',
		mathlive: 'libs/mathlive-master/dist/mathlive',
		math: 'libs/mathjs/math'
	}
});