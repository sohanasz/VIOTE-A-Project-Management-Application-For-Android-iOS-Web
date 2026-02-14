export class Block {
  static minimumTextInputHeight = 60;

  constructor(blockType, text, meta) {
    this.id = null;
    this.blockType = blockType;
    this.text = text;
    this.meta = meta;
    this.isFocused = false;
    this.textInputHeight = Block.minimumTextInputHeight;
  }
}

export class Heading extends Block {
  constructor() {
    super("heading", "Heading", {});
  }
}

export class Paragraph extends Block {
  constructor() {
    super("paragraph", "Paragraph", {});
  }
}
export class BulletPoint {
  constructor(id: number | null, text: string) {
    this.id = id;
    this.text = text;
    this.textInputHeight = Block.minimumTextInputHeight;
  }
}
export class BulletList extends Block {
  static preString = "•";
  constructor() {
    super("bulletList", "", {});

    this.text = [new BulletPoint(1, "Your text")];
    this.currentBulletPointId = null;
  }
  upgradeToNumeric() {
    this.blockType = "numericList";
    return this;
  }
}
