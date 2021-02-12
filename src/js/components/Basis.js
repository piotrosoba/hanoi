import * as THREE from 'three'

export default class Basis extends THREE.Mesh {
  constructor(game) {

    const geometry = new THREE.BoxGeometry(game.PUCK_MAX_RADIUS * 8, game.PUCK_HEIGHT / 2, game.PUCK_MAX_RADIUS * 2.5)
    const material = new THREE.MeshPhongMaterial({ color: game.STICK_COLOR })

    super(geometry, material)
    this.game = game
    this.castShadow = true
    this.receiveShadow = true
    this.position.setY(-game.PUCK_HEIGHT / 4)
  }

}