import * as THREE from 'three'


export default class Puck extends THREE.Group {
  constructor(game, radius, color) {
    super()
    this.game = game
    this.radius = radius

    const path = new THREE.LineCurve(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, game.PUCK_HEIGHT, 0)
    )
    const tubeMaterial = new THREE.MeshPhongMaterial({ color })
    const ringMaterial = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide })

    const innerGeometry = new THREE.TubeGeometry(path, 2, game.STICK_RADIUS, 100, true)
    const inner = new THREE.Mesh(innerGeometry, tubeMaterial)
    inner.castShadow = true
    this.add(inner)

    const outerGeometry = new THREE.TubeGeometry(path, 2, radius, 100, true)
    const outer = new THREE.Mesh(outerGeometry, tubeMaterial)
    outer.castShadow = false
    this.add(outer)

    const ringGeometry = new THREE.RingGeometry(game.STICK_RADIUS, radius, 100)

    const upperRing = new THREE.Mesh(ringGeometry, ringMaterial)
    upperRing.castShadow = true
    upperRing.rotation.x = Math.PI / 2
    upperRing.position.setY(game.PUCK_HEIGHT / 2)
    this.add(upperRing)

    const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial)
    bottomRing.castShadow = true
    bottomRing.rotation.x = Math.PI / 2
    this.add(bottomRing)
  }

  leaveCurrentStick(callback) {
    const go = () => {
      this.position.y += this.game.SPEED / 5
      if (this.position.y > this.game.STICK_HEIGHT) {
        this.position.y = this.game.STICK_HEIGHT
        callback && callback()
      } else {
        window.requestAnimationFrame(go)
      }
    }
    go()
  }

  followPath(path, stick, callback) {
    let ratio = 0
    const indexDiff = Math.abs(stick.index - this.stick.index)

    const go = () => {
      if (ratio > 1) ratio = 1
      const point = path.getPoint(ratio)
      this.position.x = point.x
      this.position.y = point.y
      if (ratio === 1) {
        callback && callback()
      } else {
        ratio += this.game.SPEED / (25 * indexDiff)
        window.requestAnimationFrame(go)
      }
    }
    go()
  }

  fallToStick(stick, callback) {
    const go = () => {
      this.position.y -= this.game.SPEED / 5
      if (this.position.y < stick.pucks.length * this.game.PUCK_HEIGHT / 2) {
        this.position.y = stick.pucks.length * this.game.PUCK_HEIGHT / 2
        this.stick.pucks.pop()
        stick.pucks.push(this)
        this.stick = stick
        callback && callback()
      } else {
        window.requestAnimationFrame(go)
      }
    }
    go()
  }

  goToStick(stick) {
    const currentStick = this.stick
    const path = new THREE.Path()

    path.moveTo(currentStick.position.x, this.game.STICK_HEIGHT)
    path.quadraticCurveTo(
      (currentStick.position.x + stick.position.x) / 2,
      this.game.STICK_HEIGHT * 2,
      stick.position.x,
      this.game.STICK_HEIGHT
    )

    this.leaveCurrentStick(
      () => this.followPath(path, stick,
        () => this.fallToStick(stick, () => this.game.nextStep())
      )
    )

  }
}