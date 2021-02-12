import * as THREE from 'three'


export default class Stick extends THREE.Mesh {
  constructor(game) {
    const geometry = new THREE.CylinderGeometry(game.STICK_RADIUS, game.STICK_RADIUS, game.STICK_HEIGHT, 100)
    const material = new THREE.MeshPhongMaterial({ color: game.STICK_COLOR })

    super(geometry, material)
    this.game = game
    this.castShadow = true
    this.pucks = []
    this.position.setY(game.STICK_HEIGHT / 2)
  }
}