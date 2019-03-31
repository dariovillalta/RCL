$("#app_root").load("src/variables.html");
//setTimeout(function(){ $("#app_root").empty(); }, 4000);

var variableDeVariableID = null;
var nombreHijo = null;
var descripcionHijo = null;
var factorHijo = null;
var tablaHijo = null;

function setNombreHijo (object) {
	nombreHijo = object;
}

function setDescripcionHijo (object) {
	descripcionHijo = object;
}

function setFactorHijo (object) {
	factorHijo = object;
}

function setVariableDeVariableID (object) {
	variableDeVariableID = object;
}

function setTablaHijo (object) {
	tablaHijo = object;
}

function getNombreHijo () {
	return nombreHijo;
}

function getDescripcionHijo () {
	return descripcionHijo;
}

function getFactornHijo () {
	return factorHijo;
}

function getVariableDeVariableID () {
	return variableDeVariableID;
}

function getTablaHijo () {
	return tablaHijo;
}
