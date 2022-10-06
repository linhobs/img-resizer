const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron")
const path = require("path")
const os = require("os")
const fs = require("fs")
const ResizeImg = require("resize-img")
isMac = process.platform === "darwin"
const isDev = process.env.NODE_ENV !== "production"
let mainWindow
const createMainWindow = () => {
  // create main window
  mainWindow = new BrowserWindow({
    title: "Image Resizer",
    width: isDev ? 1000 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  })
  //   if (isDev) {
  //     mainWindow.webContents.openDevTools()
  //   }
  // load file into main window
  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"))
}

// create about window
const createAboutWindow = () => {
  // create main window
  const aboutWindow = new BrowserWindow({
    title: "About Image Resizer",
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
  })
  // load file into main window
  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"))
}

// app is ready
app.whenReady().then(() => {
  createMainWindow()
  //   implement menu
  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)
  //   remove mainwindow from memory to avoid memory leaks
  mainWindow.on("closed", () => (mainWindow = null))
  app.on("activate", () => {
    // create window if there is no window already
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

// menu template for custom menu
const menu = [
  // spread in new items based on the platform
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ label: "About" }],
        },
      ]
    : []),
  { role: "fileMenu" },
  ...(!isMac
    ? [
        {
          label: "Help",
          submenu: [{ label: "About", click: createAboutWindow }],
        },
      ]
    : []),
]
// response to ipcrenderere resize
ipcMain.on("image:resize", (e, options) => {
  options.destination = path.join(os.homedir(), "linhobs/imgResizer")
  resizeImage(options)
})

async function resizeImage({ imgPath, width, height, destination }) {
  try {
    const newPath = await ResizeImg(fs.readFileSync(imgPath), {
      // the + converts automatically to a number
      width: +width,
      height: +height,
    })
    const filename = path.basename(imgPath)
    // create destination folder if it doesn't exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true })
    }

    // write file to destination
    fs.writeFileSync(path.join(destination, filename), newPath)
    // send success to renderer
    mainWindow.webContents.send("image:done")
    // open destination folder
    shell.openPath(destination)
  } catch (error) {
    console.log("Error: " + error)
  }
}

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit() //  close the window immediately
  }
})
