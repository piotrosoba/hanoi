import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'


import Puck from './components/Puck'
import Stick from './components/Stick'
import Basis from './components/Basis'
import Floor from './components/Floor'

export default class Game {
  constructor(canvas) {
    this.STICK_RADIUS = 0.5
    this.STICK_COLOR = 0xc28a29
    this.PUCK_HEIGHT = 1
    this.PUCK_RADIUS_STEP = 0.3
    this.PUCK_MAX_RADIUS = 3
    this.DISTANCE_BETWEEN_STICKS = 2.5 * this.PUCK_MAX_RADIUS
    this.PUCKS_QUANTITY = 8
    this.PUCKS_COLORS = [0xff0000, 0xfa7a11, 0xffc021, 0xffd900, 0xddff00, 0xa6ff00, 0x00ffae, 0x00bbff,]
    this.STICK_HEIGHT = (this.PUCKS_QUANTITY + 1) * this.PUCK_HEIGHT / 2
    this.SPEED = 1
    window.game = this
    this.canvas = canvas

    this.makeScene()
    this.makeCamera()
    this.addTransformControl()
    this.addLight()
    this.animate()
    this.initSlider()

    this.addFloor()
    this.addBasis()
    this.addPucks()
    this.addSticks()

    this.smallestPuck = this.pucks[this.pucks.length - 1]
    this.smallestPuckStep = true

    this.nextStep()
  }

  addLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)

    const light = new THREE.DirectionalLight(0xffffff,)
    light.position.set(4.263356228449997, 6.924253511044325, 6.679265606906219)
    light.castShadow = true

    light.shadow.mapSize = new THREE.Vector2(1024, 1024)
    light.shadow.camera.left = -10
    light.shadow.camera.right = 10
    light.shadow.camera.top = 10
    window.light = light

    this.scene.add(light)
  }

  addTransformControl() {
    this.transformControl = new TransformControls(this.camera, this.canvas)

    this.transformControl.addEventListener('dragging-changed', evt => {
      this.orbitControl.enabled = !evt.value
    })
    this.scene.add(this.transformControl)

  }


  makeScene() {
    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true })
    this.renderer.shadowMap.enabled = true
    this.renderer.setPixelRatio(window.devicePixelRatio)
  }

  makeCamera() {
    this.camera = new THREE.PerspectiveCamera(50, this.canvas.width / this.canvas.height, 1, 3000)
    this.camera.position.set(0, 0, 25)

    this.updateCamera()
    window.addEventListener('resize', this.updateCamera)

    this.orbitControl = new OrbitControls(this.camera, this.canvas)
    this.orbitControl.enableDamping = true
    this.orbitControl.enablePan = false
    this.orbitControl.maxPolarAngle = Math.PI / 2.2
    this.orbitControl.minPolarAngle = Math.PI / 8
  }

  updateCamera = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight, true)
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }


  animate = () => {
    this.orbitControl.update()
    this.renderer.render(this.scene, this.camera)
    window.requestAnimationFrame(this.animate)
  }

  addFloor() {
    this.floor = new Floor(this)
    this.scene.add(this.floor)
  }

  addBasis() {
    this.basis = new Basis(this)
    this.scene.add(this.basis)
  }

  addSticks() {
    this.sticks = [-this.DISTANCE_BETWEEN_STICKS, 0, this.DISTANCE_BETWEEN_STICKS].map((x, index) => {
      const stick = new Stick(this)
      if (index === 0) {
        this.pucks.forEach(puck => {
          puck.stick = stick
          stick.pucks.push(puck)
        })
      }
      stick.index = index
      stick.position.setX(x)
      this.scene.add(stick)
      return stick
    })
  }

  addPucks() {
    this.pucks = []

    for (let i = 0; i < this.PUCKS_QUANTITY; i++) {
      const color = this.PUCKS_COLORS[i]
      const puck = new Puck(this, this.PUCK_MAX_RADIUS - this.PUCK_RADIUS_STEP * i, color)
      puck.position.setY(i * this.PUCK_HEIGHT / 2)
      puck.position.setX(-this.PUCK_MAX_RADIUS * 2.5)
      this.scene.add(puck)
      this.pucks.push(puck)
    }
  }

  nextStep() {
    if (this.sticks[2].pucks.length === this.PUCKS_QUANTITY) {
      this.higlightPucks()
      return
    }

    if (this.smallestPuckStep) {
      const currentIndex = this.smallestPuck.stick.index
      const nextIndex = currentIndex === 2 ? 0 : currentIndex + 1
      this.smallestPuck.goToStick(this.sticks[nextIndex])
    } else {
      const smallestPuckIndex = this.smallestPuck.stick.index
      const indexes = [0, 1, 2].filter(el => el !== smallestPuckIndex)

      const stick = this.sticks[indexes[0]]
      const stick2 = this.sticks[indexes[1]]

      const stickPuck = stick.pucks[stick.pucks.length - 1]
      const stick2Puck = stick2.pucks[stick2.pucks.length - 1]

      let puck
      if (!stickPuck) puck = stick2Puck
      if (!stick2Puck) puck = stickPuck
      if (!puck) puck = stickPuck.radius < stick2Puck.radius ? stickPuck : stick2Puck

      const destinationStickIndex = indexes.find(el => el !== puck.stick.index)
      const destinationStick = this.sticks[destinationStickIndex]
      puck.goToStick(destinationStick)

    }

    this.smallestPuckStep = !this.smallestPuckStep
  }

  higlightPucks() {
    let index = 0
    const change = () => {
      this.pucks.forEach((puck, i) => {
        const color = this.PUCKS_COLORS[(index + i) % this.PUCKS_QUANTITY]
        puck.children.forEach(mesh => mesh.material.color.setHex(color))
      })
      index++
    }
    change()
    setInterval(change, 100)
  }

  initSlider() {
    const slider = document.querySelector('#speed')
    slider.addEventListener('input', () => this.SPEED = slider.value)
  }
}