import * as path from 'path';
import * as vscode from 'vscode';
import { Spec, SpecType } from './Spec'

export class ExampleTreeFactory {
  static createExampleTree(spec: Spec): ExampleTree {
    // TODO: improve this
    if (spec.getSpecType() == SpecType.Root) {
      return new ExampleTreeRoot(spec);
    } else if (spec.getSpecType() == SpecType.Folder) {
      return new ExampleTreeFolder(spec);
    } else if (spec.getSpecType() == SpecType.File) {
      return new ExampleTreeFile(spec);
    } else if (spec.getSpecType() == SpecType.GroupRoot) {
      return new ExampleTreeGroupRoot(spec);
    } else if (spec.getSpecType() == SpecType.Example) {
      return new ExampleTreeExample(spec);
    } else {
      return new ExampleTree(spec);
    }
  }
}

export class ExampleTree extends vscode.TreeItem {
  constructor(public readonly spec: Spec) {
    super(spec.name);
    this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
  }

  get tooltip(): string {
    return `${this.spec.index} ${this.spec.name}`;
  }

  get description(): string {
    return `${this.spec.index} (${this.spec.size()} examples)`; 
  }

  children(): ExampleTree[] {
    return this.spec.children.map(spec => ExampleTreeFactory.createExampleTree(spec));
  }

  getCollapsibleState(specType: SpecType) {
    if (specType == SpecType.Example) {
      return vscode.TreeItemCollapsibleState.None;
    }

    return vscode.TreeItemCollapsibleState.Collapsed;
  }
}

class ExampleTreeRoot extends ExampleTree {
  constructor(public readonly spec: Spec) {
    super(spec);

    this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;

    this.iconPath = {
      light: path.join(__filename, '..', '..', 'media', 'rspec_icon.svg'),
      dark: path.join(__filename, '..', '..', 'media', 'rspec_icon.svg')
    }
  }

  get description(): string {
    return 'tree root';
  }
}

class ExampleTreeFolder extends ExampleTree {
  constructor(public readonly spec: Spec) {
    super(spec);
    this.iconPath = new vscode.ThemeIcon('file-directory');
  }

  get description(): string {
    return '';
  }
}

class ExampleTreeFile extends ExampleTree {
  constructor(public readonly spec: Spec) {
    super(spec);
    this.iconPath = new vscode.ThemeIcon('file-code');
  }

  get description(): string {
    return '';
  }
}

class ExampleTreeGroupRoot extends ExampleTree {
  constructor(public readonly spec: Spec) {
    super(spec);
    this.iconPath = new vscode.ThemeIcon('ruby');
  }

  get description(): string {
    return `${this.spec.size()} examples`;
  }
}

class ExampleTreeExample extends ExampleTree {
  constructor(public readonly spec: Spec) {
    super(spec);

    if (spec.name.match(/^(example at .*)/)) {
      const fileNameMatch = this.spec.file_path.match(/\w+.rb/)
      if (fileNameMatch) {
        const fileName = fileNameMatch[0];
        this.label = `example at ${fileNameMatch}`;
      }
    }

    this.collapsibleState = vscode.TreeItemCollapsibleState.None;
    this.command = {
      command: 'extension.showLineOfFile',
      title: '',
      arguments: [
        spec.file_path,
        spec.line_number -1
      ]
    }
  }

  get description(): string {
    return `${this.spec.index} | line ${this.spec.line_number}`;
  }
}
