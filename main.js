const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const path = require('path');
const url = require('url');
const fs = require('fs');
  
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win
  let version
  
  function createWindow () {
    /*fs.readFile('./conf.dar', 'utf-8', (err, data) => {
      if(err) {
        console.log("No existe");
        let writeStream = fs.createWriteStream('conf.dar');
        writeStream.write('aef35ghhjdk74hja83ksnfjk888sfsf', 'base64');
      } else {
        //
      }
    });*/
    /*fs.readFile('../keys.txt', 'utf-8', (err, data) => {
      if(err) {
        return;
      }
      // Change how to handle the file content
      //console.log("The file content is : " + data);
      if(data.localeCompare("XBOS-SQWA-IOWQ-QWPO") == 0){*/
        // Create the browser window.
        win = new BrowserWindow({
          'minHeight': 690,
          'minWidth': 1220,
          'frame': true
        })
        //win.setFullScreen(true)
        win.maximize()
      
        // and load the index.html of the app.
        //win.loadFile('index.html') ó
        win.loadURL( url.format({
          pathname: path.join(__dirname, 'index.html'),
          protocol: 'file:',
          slashes: true
        }) )
        //win.openDevTools();
        /*win.webContents.once('dom-ready', () => {
          win.webContents.openDevTools()
        })*/

        //win.setMenu(null)
      
        // Open the DevTools.
        //win.webContents.openDevTools()
      
        // Emitted when the window is closed.
        win.on('closed', () => {
          // Dereference the window object, usually you would store windows
          // in an array if your app supports multi windows, this is the time
          // when you should delete the corresponding element.
          win = null
        })

        const template = [
          // { role: 'appMenu' }
          {
            label: "TOLOC RCL",
            submenu: [
              { label: 'Versión', click() {version.show()} },
              { role: 'quit', label: 'Cerrar Programa' }
            ]
          },
          // { role: 'editMenu' }
          {
            label: 'Edición',
            submenu: [
              { role: 'undo', label: 'Deshacer' },
              { role: 'redo', label: 'Rehacer' },
              { type: 'separator' },
              { role: 'cut', label: 'Cortar' },
              { role: 'copy', label: 'Copiar' },
              { role: 'paste', label: 'Pegar' },
              ...(process.platform === 'darwin' ? [
                { role: 'pasteAndMatchStyle', label: 'Pegar e Igualar Estilo' },
                { role: 'delete', label: 'Eliminar' },
                { role: 'selectAll', label: 'Seleccionar Todo' },
                { type: 'separator' },
                {
                  label: 'Voz',
                  submenu: [
                    { role: 'startspeaking', label: 'Empezar a hablar' },
                    { role: 'stopspeaking', label: 'Parar de hablar' }
                  ]
                }
              ] : [
                { role: 'delete', label: 'Eliminar' },
                { type: 'separator' },
                { role: 'selectAll', label: 'Seleccionar Todo' }
              ])
            ]
          },
          // { role: 'viewMenu' }
          {
            label: 'Vista',
            submenu: [
              { role: 'reload', label: 'Refrescar' },
              { role: 'forcereload', label: 'Forzar Refrescado' },
              { role: 'toggledevtools', label: 'Herramientas de Desarrollador' },
              { type: 'separator' },
              { role: 'resetzoom', label: 'Reset Zoom' },
              { role: 'zoomin', label: 'Zoom Adentro' },
              { role: 'zoomout', label: 'Zoom Afuera' },
              { type: 'separator' },
              { role: 'togglefullscreen', label: 'Pantalla Completa' }
            ]
          }
        ]
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)

        version = new BrowserWindow({
          'minHeight': 390,
          'minWidth': 620,
          'frame': false,
          'show': false
        })

        version.loadURL( url.format({
          pathname: path.join(__dirname, 'src/version.html'),
          protocol: 'file:',
          slashes: true
        }) )

        ipcMain.on('hide', function () {
          version.hide()
        })
      //}
    //});
  }
  
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)
  
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })
  
  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.