import { match } from "assert";

export class Spec {
  children: Array<Spec>;
  wordsBreakers: Array<String>;
  patternsBreakers: Array<RegExp>;

  constructor(public readonly index: string,
              public name: string,
              public line_number: number,
              public file_path: string,
              public readonly parent?: Spec) {
    this.children = [];
    this.wordsBreakers = ['quando', 'com', 'e o', 'sem', 'se'];
    this.patternsBreakers = [/^(GET \w+)/, /^(POST \w+)/, /^(PUT \w+)/, /^(PATCH \w+)/, /^(DELETE \w+)/];
  }

  size(): number {
    if (this.getSpecType() == SpecType.Example) {
      return 1;
    } else if ([SpecType.Group, SpecType.GroupRoot].includes(this.getSpecType())) {
      return this.children.map(spec => spec.size()).reduce((acc, size) => acc += size);
    } else {
      return 0;
    }
  }

  findIndexInNear(index: string): Spec|any {
    let found = null;
    this.children.forEach(function(child) {
      if (child.index == index) {
        found = child;
        return;
      }
    });
    return found;
  }

  addIndex(index: string, name: string, line_number: number, file_path: string): Spec {
    let nameWithoutParentName = this.nameWithoutParentsName(name, this);

    nameWithoutParentName = this.phraseBreaker(nameWithoutParentName)

    const child = new Spec(index, nameWithoutParentName, line_number, file_path, this);
    this.children.push(child);
    this.sortChildren();
    return child;
  }

  nameWithoutParentsName(name: string, parent: Spec): string {
    if (parent.parent) {
      name = this.nameWithoutParentsName(name, parent.parent);
    }

    return name.replace(parent.name, '').replace(/^\s/, '');
  }

  phraseBreaker(phrase: string): string {
    // phrase starts with method name
    if (phrase.startsWith('.') || phrase.startsWith('#')) {
      return phrase.substring(0, phrase.indexOf(' '));
    }
    //

    this.patternsBreakers.forEach(function(pattern) {
      const patternMatched = phrase.match(pattern);
      if (patternMatched) {
        phrase = phrase.substring(0, patternMatched[0].length);
        return;
      }
    });

    this.wordsBreakers.forEach(function(word) {
      const wordWithSpaces = ` ${word} `;
      if (phrase.indexOf(wordWithSpaces) > 0) {
        phrase = phrase.substring(0, phrase.indexOf(wordWithSpaces));
        return;
      }
    });

    return phrase;
  }

  sortChildren(): void {
    this.children.sort((child, otherChild) => { return child.index.localeCompare(otherChild.index) });
  }

  getSpecType(): SpecType {
    if (this.index == 'Specs') return SpecType.Root;
    if (this.index.endsWith('/')) return SpecType.Folder;
    if (this.index.endsWith('.rb')) return SpecType.File;
    if (this.index.match(/\[\d\]/)) return SpecType.GroupRoot;
    if (this.index.startsWith('[') && this.children.length > 0) return SpecType.Group;
    return SpecType.Example;
  }

  // iconPath = {
  //   light: path.join(__filename, '..', '..', 'media', 'file_type_rspec_icon.svg'),
  //   dark: path.join(__filename, '..', '..', 'media', 'file_type_rspec_icon.svg')
  // };
}

export enum SpecType {
  Root, Folder, File, GroupRoot, Group, Example
}
