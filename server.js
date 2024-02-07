const app = require('./src/app.js')

const PORT = 1000

app.listen(PORT, function () {
  console.log('Started application on port %d', PORT)
})
