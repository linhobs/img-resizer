// Some JavaScript to load the image and show the form. There is no actual backend functionality. This is just the UI

const form = document.querySelector("#img-form")
const img = document.querySelector("#img")
const fileName = document.querySelector("#filename")
const widthInput = document.querySelector("#width")
const heightInput = document.querySelector("#height")
const outputPath = document.querySelector("#outputpath")

function loadImage(e) {
  const file = e.target.files[0]

  if (!isFileImage(file)) {
    alert("Please select an image file")
    return
  }

  // get dimensions of the image
  const image = new Image()
  image.src = URL.createObjectURL(file)
  image.onload = () => {
    widthInput.value = image.width
    heightInput.value = image.height
  }

  form.style.display = "block"
  fileName.innerText = file.name
  // using path and join because of preloads
  outputPath.innerText = path.join(os.homedir(), "linhobs/imgResizer")
}

// ipcrenderer nonsense for image
function sendImage(e) {
  e.preventDefault()
  const imgPath = img.files[0].path
  const width = widthInput.value
  const height = heightInput.value
  if (width === "" && height === "") {
    alertError("Please enter a valid width and/or height")
    return
  }
  if (!img.files[0]) {
    alertError("Please select an image")
    return
  }
  // use ipcrenderer to send to main js for resizing
  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height,
  })
}

// catch ipc event
ipcRenderer.on("image:done", () => {
  alertSuccess(
    `Image resize successfully, new dimensions ${widthInput.value} X ${heightInput.value}`
  )
})

function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"]
  return file && acceptedImageTypes.includes(file["type"])
}

img.addEventListener("change", loadImage)
form.addEventListener("submit", sendImage)

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  })
}
function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  })
}
