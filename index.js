$("#app_root").load("src/variables.html");
//setTimeout(function(){ $("#app_root").empty(); }, 4000);

var variableDeVariable = null;
var nombrePadre = null;
var nombreHijo = null;
var descripcionHijo = null;

function setNombrePadre (object) {
	nombrePadre = object;
}

function setNombreHijo (object) {
	nombreHijo = object;
}

function setDescripcionHijo (object) {
	descripcionHijo = object;
}

function setVariableDeVariable (object) {
	variableDeVariable = object;
}

function getNombrePadre (object) {
	return nombrePadre;
}

function getNombreHijo (object) {
	return nombreHijo;
}

function getDescripcionHijo (object) {
	return descripcionHijo;
}

function getVariableDeVariable (object) {
	return variableDeVariable;
}
