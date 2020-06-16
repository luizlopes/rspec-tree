// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { SpecExamplesProvider } from './SpecExamplesProvider'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const fileName = '/spec_doc.json';

	let disposable = vscode.commands.registerCommand('spec-tree.loadRspecDoc', () => {
    var file;
    try {
      file = fs.readFileSync(vscode.workspace.rootPath + fileName, 'utf-8');
    } catch (error) {
      vscode.window.showInformationMessage('Can\'t open file spec_doc.json :(');
      return;
    }

    try {
      const specExamplesProvider = new SpecExamplesProvider(file);
    
    
      let disposable = vscode.window.registerTreeDataProvider('spec-tree.SpecExamples', specExamplesProvider);
      vscode.window.createTreeView('spec-tree.SpecExamples', {
        treeDataProvider: specExamplesProvider
      });

      vscode.window.showInformationMessage('The file /spec_doc.json was loaded!');

      return disposable;
    } catch (error) {
      vscode.window.showInformationMessage(`Error on loading file spec_doc.json: ${error}`);
      return;
    }
	});

  context.subscriptions.push(disposable);

  vscode.commands.registerCommand('extension.showLineOfFile', (fileName, lineNumber) => {
    vscode.workspace.openTextDocument(
      vscode.Uri.parse(vscode.workspace.rootPath + fileName)
    ).then(document => {
      vscode.window.showTextDocument(document).then(editor => {
        if (editor) {
          const position = editor.selection.active;
          var newPosition = position.with(lineNumber, 0);
          var newSelection = new vscode.Selection(newPosition, newPosition);
          var range = new vscode.Range(newPosition, newPosition);
          editor.selection = newSelection;
          editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
        }
      });
    });
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
