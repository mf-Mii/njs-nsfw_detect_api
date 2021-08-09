/*
const express = require('express');
const app = express();
const port = 19000;
const axios = require('axios'); //you can use any http client
const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');
const multer = require('multer');
const jpeg = require('jpeg-js');
const upload = multer();
*/
const port = 19000
const express = require('express')
const multer = require('multer')
const jpeg = require('jpeg-js')

const tf = require('@tensorflow/tfjs-node')
const nsfw = require('nsfwjs')

const app = express()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './data_work')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })
//const upload = multer()

let _model

const convert = async (img) => {
  // Decoded image in UInt8 Byte array
  const image = await jpeg.decode(img, true)

  const numChannels = 3
  const numPixels = image.width * image.height
  const values = new Int32Array(numPixels * numChannels)

  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; ++c)
      values[i * numChannels + c] = image.data[i * 4 + c]

  return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32')
}

app.post('/nsfw', upload.single('image'), async (req, res) => {
    console.log(req)
  if (!req.file) res.status(400).send('Missing image multipart/form-data')
  else {
    const image = await convert(req.file.buffer)
    const predictions = await _model.classify(image)
    image.dispose()
    res.json(predictions)
  }
})

const load_model = async () => {
  _model = await nsfw.load()
}

// Keep the model in memory, make sure it's loaded only once
load_model().then(() => app.listen(port))

// curl --request POST localhost:8080/nsfw --header 'Content-Type: multipart/form-data' --data-binary 'image=@/full/path/to/picture.jpg'


