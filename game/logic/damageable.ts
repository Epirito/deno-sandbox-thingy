export interface DamageableComponent {
    damage(damage: number): void
}
export class SustainedDamageComponent implements DamageableComponent {
    private _integrity: number
    constructor(readonly total: number, private onDestroyed: ()=>void) {
      this._integrity = total; 
    }
    integrity() {return this._integrity}
    damage(damage: number) {
      this._integrity -= damage;
      if (this._integrity <= 0) {
        this.onDestroyed()
      }
    }
}
export class SingleHitComponent implements DamageableComponent {
    constructor(readonly threshold: number, private onDestroyed: ()=>void) {}
    damage(damage: number) {
        if (damage >= this.threshold) this.onDestroyed()
    }
}