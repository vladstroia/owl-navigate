import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("owl-navigate.navigate", async () => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const filePath = activeEditor.document.fileName;
      const extension = path.extname(filePath);
      const baseName = path.basename(filePath, extension);
      const targetExtension = extension === ".xml" ? ".js" : ".xml";
	  const pathList = filePath.split('/');
	  const smallDirectory = pathList.slice(0,-1).join('/');
      let targetPath = searchFile(smallDirectory, baseName + targetExtension);
	  if (!targetPath) {
		const largeDirectory = pathList.slice(0, pathList.lastIndexOf('src')+1).join('/');
		targetPath = searchFile(largeDirectory, baseName + targetExtension);
	  }
      if (targetPath) {
        vscode.workspace.openTextDocument(targetPath).then((document) => {
          vscode.window.showTextDocument(document);
        });
      } else {
        vscode.window.showErrorMessage(`Corresponding '${baseName + targetExtension}' file not found.`);
      }
    }
  });

  context.subscriptions.push(disposable);
}
function searchFile(directory: string, filename: string): string | undefined {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    const fileStats = fs.statSync(filePath);
    if (fileStats.isDirectory()) {
      const xmlFilePath = searchFile(filePath, filename);
      if (xmlFilePath) {
        return xmlFilePath;
      }
    } else if (file === filename) {
      return filePath;
    }
  }
  return undefined;
}
// This method is called when your extension is deactivated
export function deactivate() {}
