import util from "./util.mjs"

const getClock = function() {
	//return "23:55:00"
	const d = new Date()
	const fix0 = n => n < 10 ? "0" + n : n
	return fix0(d.getHours()) + ":" + fix0(d.getMinutes()) + ":" + fix0(d.getSeconds())
}	

const showLifeGame = function(canvas, opt) {
	let { fps, pattern, showclock } = opt
	var g = util.getContext(canvas)
	var imagedata = null
	let fbuf_u8 = null
	let fbuf = null
	let fbuf2_u8 = null
	let fbuf2 = null
	let gw, gh
	const get = function(x, y) {
		if (x == -1)
			x = gw - 1
		else if (x == gw)
			x = 0
		if (y == -1)
			y = gh - 1
		else if (y == gh)
			y = 0
		return fbuf[y * gw + x] == fgcolor
	}
	const fgcolor = 0xffffffff
	const bgcolor = 0xff000000
	
	g.draw = function() {
		if (imagedata == null) {
			gw = g.cw
			gh = g.ch
			imagedata = g.getImageData(0, 0, gw, gh)

			const buffer1 = new ArrayBuffer(imagedata.data.length)
			fbuf_u8 = new Uint8ClampedArray(buffer1)
			fbuf = new Uint32Array(buffer1)

			const buffer2 = new ArrayBuffer(imagedata.data.length)
			fbuf2_u8 = new Uint8ClampedArray(buffer2)
			fbuf2 = new Uint32Array(buffer2)

			for (var i = 0; i < gw * gh; i++) {
				fbuf[i] = fbuf2[i] = bgcolor
			}
			
			if (!pattern) {
				const fillratio = 16
				const fillw = .95
				const offx = Math.floor(gw * (1 - fillw) / 2)
				const offy = Math.floor(gh * (1 - fillw) / 2)
				for (let i = gw * gh * fillw * fillw / fillratio; i >= 0; i--) {
					const x = offx + util.rnd(gw * fillw)
					const y = offy + util.rnd(gh * fillw)
					fbuf[y * gw + x] = fgcolor
				}
			} else {
				const ss = pattern.split('\n')
				for (let i = 0; i < ss.length; i++) {
					const s = ss[i]
					for (let j = 0; j < s.length; j++) {
						const c = s.charAt(j)
						if (c == '■' || c == 'O') {
							fbuf[(i + ((gh - ss.length) >> 1)) * gw + j + ((gw - s.length) >> 1)] = fgcolor
						}
					}
				}
			}
		}
		for (let i = 0; i < gh; i++) {
			for (let j = 0; j < gw; j++) {
				let n = 0
				n += get(j - 1, i - 1)
				n += get(j, i - 1)
				n += get(j + 1, i - 1)
				n += get(j - 1, i)
				n += get(j + 1, i)
				n += get(j - 1, i + 1)
				n += get(j, i + 1)
				n += get(j + 1, i + 1)
				if (n == 3)
					fbuf2[i * gw + j] = fgcolor
				else if (n == 2 && fbuf[i * gw + j] == fgcolor)
					fbuf2[i * gw + j] = fgcolor
				else
					fbuf2[i * gw + j] = bgcolor
			}
		}
		const tmp = fbuf
		fbuf = fbuf2
		fbuf2 = tmp
		const tmp_u8 = fbuf_u8
		fbuf_u8 = fbuf2_u8
		fbuf2_u8 = tmp_u8

		imagedata.data.set(fbuf_u8)
		g.putImageData(imagedata, 0, 0)
		
		if (showclock) {
			g.setColor(255, 255, 255, .5)
			g.fillTextCenter(getClock(), gw / 2, gh / 2, gw / 8 * 2 * .7, 'PT Mono')
		}
	}
	g.init()
	let bkw, bkh

	if (!fps)
		fps = 5
	// fps checker
	let bkt = new Date().getTime()
	let fcnt = 0
	const checkFPS = function() {
		fcnt++
		if (fcnt == 20) {
			const t = new Date().getTime()
			const dt = t - bkt
			console.log('fps', 20000 / dt, 'target', fps)
			fcnt = 0
			bkt = t
		}
 }
	setInterval(function() {
		if (bkw != canvas.clientWidth || bkh != canvas.clientHeight) {
		   bkw = canvas.clientWidth
			 bkh = canvas.clientHeight
			 console.log(bkw + "," + bkh)
		   imagedata = null
		   g.init()
	   } else {
		   g.draw()
		 }
		 checkFPS()
	}, 1000 / fps)

	if (window.fullscreen) {
		fullscreen.onclick = function() {
			const target = canvas
			if (target.webkitRequestFullscreen) {
				target.webkitRequestFullscreen() //Chrome15+, Safari5.1+, Opera15+
			} else if (target.mozRequestFullScreen) {
				target.mozRequestFullScreen() //FF10+
			} else if (target.msRequestFullscreen) {
				target.msRequestFullscreen() //IE11+
			} else if (target.requestFullscreen) {
				target.requestFullscreen() // HTML5 Fullscreen API仕様
			} else {
				alert('your browser does not support fullscreen')
			}
		}
	}
}

export default { showLifeGame }
