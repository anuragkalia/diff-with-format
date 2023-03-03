import * as vscode from "vscode";
import { getHeadFile } from "./git-operations";

class GitDiffFormatProvider implements vscode.TextDocumentContentProvider {
  onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  async provideTextDocumentContent(
    uri: vscode.Uri
  ): Promise<string | undefined> {
    const origUri = vscode.Uri.parse(uri.path);
    const type = uri.query;

    let text: string | undefined;

    if (type === "head") {
      const headText = await getHeadFile(origUri);
      text = headText;
    } else if (type === "worktree") {
      const document = await vscode.workspace.openTextDocument(origUri);
      text = document.getText();
    }

    return text;
  }
}

export { GitDiffFormatProvider };
