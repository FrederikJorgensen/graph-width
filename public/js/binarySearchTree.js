export default class BinarySearchTree {
  // constructor
  constructor() {
    this.root = null;
  }

  // insert
  insert(value) {
    if (this.root == null) {
      this.root = new Node(value);
      return true;
    }
    return this.root.insert(new Node(value));
  }
}
