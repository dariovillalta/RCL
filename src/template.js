const electron = require('electron');
const remote = require('electron').remote;
const sql = require('mssql');

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
        loadVariablesIMG();
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

$("#app_root").empty();
$("#app_root").load("src/home.html");

/* ******************       LOADING IMG     ********* */
function loadVariablesIMG () {
    console.log("UGLY BOY");
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
                        $("body").overhang({
                            type: "error",
                            primary: "#f84a1d",
                            accent: "#d94e2a",
                            message: "Error en conección con tabla Variables.",
                            overlay: true,
                            closeConfirm: true
                        });
                    });
                }
            }  else {
                transaction.commit(err => {
                    // ... error checks
                    console.log("UGLY BOY 111");
                    if(result.recordset.length > 0){
                        console.log("UGLY BOY 2222");
                        console.log(result.recordset[0]);
                        if(result.recordset[0].fullLogo.length > 0){
                            $("#fullLogo").attr("src", result.recordset[0].fullLogo);
                            console.log("YEEE")
                            console.log(result.recordset[0].fullLogo)
                        }
                        if(result.recordset[0].smallLogo.length > 0){
                            $("#smallLogo").attr("src", result.recordset[0].smallLogo);
                        }
                    }
                });
            }
        });
    }); // fin transaction
}
/* ******************       END LOADING IMG     ********* */

//	**********		Route Change		**********
/*function goVariables () {
	$("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
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
    //cleanup();
    $("#app_root").load("src/users.html");
}

function goConnections () {
    $("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
    $("#app_root").load("src/importaciones.html");
}

function goConfig () {
    $("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
    $("#app_root").load("src/config.html");
}

function logout () {
	$("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
    session.defaultSession.clearStorageData([], (data) => {});
    $("#app_root").load("src/login.html");
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

function goLists () {
    $("#app_root").empty();
    cleanupSelectedList();
    //cleanup();
    $("#app_root").load("src/variablesLists.html");
}*/

function cleanupSelectedList () {
    console.log(";")
    $(".side-menu li").each( obj, function( i, val ) {
        console.log(obj)
        console.log(val)
    });
}