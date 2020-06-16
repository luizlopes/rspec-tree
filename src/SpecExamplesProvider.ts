import * as vscode from 'vscode';
import { Spec } from './Spec'
import { ExampleTree, ExampleTreeFactory } from './ExampleTree'

export class SpecExamplesProvider implements vscode.TreeDataProvider<ExampleTree> {
  allSpecs: Spec;
  exampleTree: ExampleTree;

  constructor(file: any) {
    const rspecDocJSON = JSON.parse(file);
    this.allSpecs = this.loadSpecs(rspecDocJSON);
    this.exampleTree = ExampleTreeFactory.createExampleTree(this.allSpecs);
  }

  getTreeItem(element: ExampleTree): vscode.TreeItem {
    return element;
  }

  getChildren(element: ExampleTree): Thenable<ExampleTree[]> {
    if (element) {
      return Promise.resolve(element.children());
    } else {
      return Promise.resolve([this.exampleTree]);
    }
  }

  private loadSpecs(specDocJson: any): Spec {
    const allFilesTree = new Spec('Specs', 'Specs', -1, '');

    var specFileName = '';
    var specGroupRoot: Spec;

    const bind = this;
    specDocJson.examples.forEach(function(element: any) {
      if (specFileName != element.id.match(/\w+.rb/)[0]) {
        specFileName = element.id.match(/\w+.rb/)[0];
        const specFileTree = bind.createFoldersAndFileTree(element, allFilesTree);
        specGroupRoot = bind.createGroupRootTree(element)
        specFileTree.children.push(specGroupRoot);
      }

      const index = bind.getIndexOf(element);

      const parentDescription = element.full_description.replace(element.description, '');
      const parent = bind.createParentsForSpec(specGroupRoot, bind.getParentIndexOf(index), parentDescription);

      parent.addIndex(index,
                      element.description,
                      element.line_number,
                      element.file_path.substring(1, element.file_path.length));
    });

    allFilesTree.sortChildren();

    return allFilesTree;
  }

  private createFoldersAndFileTree(element: any, allFilesTree: Spec) {
    const folderAndFilePattern = /(.*\/)(\w+.rb.*)(\[.*\])$/;
    const folderAndFileMatches = element.id.match(folderAndFilePattern);
    const folderPath = folderAndFileMatches[1];
    const fileName = folderAndFileMatches[2];
    const specFolderTree = this.createParentsForPath(allFilesTree, folderPath);
    const specFileTree = specFolderTree.findIndexInNear(fileName);
    if (specFileTree) {
      return specFileTree;
    } else {
      return specFolderTree.addIndex(fileName, fileName, -1, element.file_path);
    }
  }

  private createGroupRootTree(element: any) {
    const firstWordMatch = element.full_description.match(/^[a-zA-Z0-9_:]+/);
    const groupRootIndex = element.id.match(/\[(\d)/)[1];
    return new Spec(`[${groupRootIndex}]`, firstWordMatch[0], -1, '');
    // return new Spec('[1]', firstWordMatch[0], -1, '');
  }

  private createParentsForPath(root: Spec, directParent: string): Spec {
    if (directParent == './spec/') {
      return root;
    }

    const parentOfParent = this.createParentsForPath(root, this.getParentPathOf(directParent));
    const directParentFound = parentOfParent.findIndexInNear(this.getLastPathOf(directParent));
    if (directParentFound) {
      return directParentFound;
    } else {
      return parentOfParent.addIndex(this.getLastPathOf(directParent), this.getLastPathOf(directParent), -1, '');
    }
  }

  private getParentPathOf(path: string): string {
    return path.replace(this.getLastPathOf(path), '');
  }

  private getLastPathOf(path: string): string {
    const path_regex = /\w+\/$/;
    const path_match = path.match(path_regex);
    if (path_match) {
      return path_match[0];
    } else {
      return '';
    }
  }

  private createParentsForSpec(root: Spec, directParent: string, description: string): Spec {
    if (directParent.match(/\[\d\]/)) {
      return root;
    }

    const parentOfParent = this.createParentsForSpec(root, this.getParentIndexOf(directParent), description);
    const directParentFound = parentOfParent.findIndexInNear(directParent);
    if (directParentFound) {
      return directParentFound;
    } else {
      return parentOfParent.addIndex(directParent, description, -1, '');
    }
  }

  private getIndexOf(element: any): string {
    const index_regex = /(\[[0-9-:]*\])$/;
    const index_match = element.id.match(index_regex);
    const index = index_match[0];
    return index;
  }

  private getParentIndexOf(index: any): string {
    const parent_index_regex = /(\[.*:)(.*\])/;
    const parent_index_match = index.match(parent_index_regex);
    const parent_index = parent_index_match[1].substring(0, parent_index_match[1].length - 1) + ']';

    return parent_index;
  }
}
