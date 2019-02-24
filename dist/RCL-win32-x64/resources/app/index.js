$("#app_root").load("src/login.html");
//setTimeout(function(){ $("#app_root").empty(); }, 4000);

var variableDeVariableID = null;
var nombrePadre = null;
var nombreHijo = null;
var descripcionHijo = null;
var factorHijo = null;
var tablaHijo = null;

function setNombrePadre (object) {
	nombrePadre = object;
}

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

function getNombrePadre () {
	return nombrePadre;
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
