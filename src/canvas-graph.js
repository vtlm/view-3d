var offsX=600,offsY=0,resX=1,resY=1


const drawGrid = (ctx, width, height, stepsW, stepsH) => {
  let dW = width / stepsW
  let dH = height / stepsH

  ctx.lineWidth = 1

  for (let i = 1; i < stepsW; i++) {
    ctx.beginPath()
    ctx.strokeStyle = i == (stepsW / 2).toFixed(0) ? '#222222' : '#dddddd'
    ctx.moveTo(dW * i, 0)
    ctx.lineTo(dW * i, height)
    ctx.stroke()
    ctx.fillText(((-dW * i + offsX) / resX).toFixed(2), dW * i, offsY - 5)
  }
  for (let i = 1; i < stepsH; i++) {
    ctx.beginPath()
    ctx.strokeStyle = i == stepsH.toFixed(0) ? '#222222' : '#dddddd'
    ctx.moveTo(0, dH * i)
    ctx.lineTo(width, dH * i)
    ctx.stroke()
    ctx.fillText(((-dH * i + offsY) / resY).toFixed(2), 5, dH * i)
  }
}

const drawRect = (ctx, x, y, w, h, colorId) => {
  // console.log(objColors,colorId)
  let ltx = x - w / 2.0
  let lty = y - h //2.0
  let csWSize = w * 0.75
  let csHSize = h * 0.175
  // ctx.strokeStyle = '#444444'
  ctx.rect(ltx, lty, w, h)
  ctx.fillStyle = objColors[colorId] //'#fff2ac'
  ctx.fillRect(ltx, lty, w, h)
  // ctx.stroke()
  ctx.moveTo(x - csWSize, y)
  ctx.lineTo(x + csWSize, y)
  ctx.moveTo(x, y - csHSize)
  ctx.lineTo(x, y + csHSize)
  ctx.stroke()
}

export {drawRect,drawGrid}
