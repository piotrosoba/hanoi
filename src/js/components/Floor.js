import * as THREE from 'three'

export default class Floor extends THREE.Mesh {
  constructor(game) {
    const geometry = new THREE.PlaneGeometry(5000, 5000, 1, 1)
    const material = new THREE.MeshPhongMaterial({ color: 0xb0b0b0, shininess: 0 })
    super(geometry, material)
    this.game = game

    this.rotation.x = - Math.PI / 2
    this.position.y = -game.PUCK_HEIGHT / 2
    this.castShadow = true
    this.receiveShadow = true
  }
}