import Interactable, { KnownInteractableTypes } from '../Interactable';
import { BoundingBox } from '../../../types/CoveyTownSocket';

export default class FishingArea extends Interactable {
  getType(): KnownInteractableTypes {
    return 'fishingArea';
  }

  public getBoundingBox(): BoundingBox {
    const { x, y, width, height } = this.getBounds();
    return { x, y, width, height };
  }

  addedToScene(): void {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
  }
}
