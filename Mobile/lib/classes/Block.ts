export class Note {
  constructor(title, content) {
    this.title = title;
    this.content = content;
    this.blockOrders = [];
  }
}

export class Block {
  static minimumTextInputHeight = 60;

  constructor(blockType, text, meta) {
    this.id = null;
    this.order = null;
    this.blockType = blockType;
    this.text = text;
    this.meta = meta;
    this.textInputHeight = Block.minimumTextInputHeight;
    this.version = 0;
  }
}

export class Heading extends Block {
  constructor(meta = {}) {
    super("heading", "Heading", meta);
  }
}

export class Paragraph extends Block {
  constructor(meta = {}) {
    super("paragraph", "Paragraph", meta);
  }
}

export class BulletList extends Block {
  static preString = "•";
  constructor(meta = {}) {
    super("bulletList", "", meta);

    this.text = [new BulletPoint(1, "Your text")];
    this.currentBulletPointId = null;
  }
  upgradeToNumeric() {
    this.blockType = "numericList";
    return this;
  }
}

export class BulletPoint {
  constructor(id: number | null, text: string) {
    this.id = id;
    this.order = null;
    this.text = text;
    this.textInputHeight = Block.minimumTextInputHeight;
    this.version = 0;
  }
}

export class BlockMeta {
  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.createdBy = null;
    this.lastUpdatedBy = null;
  }
}
