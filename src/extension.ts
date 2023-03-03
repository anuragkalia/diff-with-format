import * as vscode from "vscode";
import { GitDiffFormatProvider } from "./provider";

const DIFF_WITH_FORMAT_SCHEME = "diff-with-format";

export function activate(context: vscode.ExtensionContext) {
  const disposable1 = vscode.workspace.registerTextDocumentContentProvider(
    DIFF_WITH_FORMAT_SCHEME,
    new GitDiffFormatProvider()
  );

  const disposable2 = vscode.commands.registerTextEditorCommand(
    "diff-with-format.find-formatted-diff-with-head",
    async (textEditor) => {
      if (textEditor.document.uri.scheme === "file") {
        const editorUri = textEditor.document.uri;

        const headUri = vscode.Uri.parse(
          `${DIFF_WITH_FORMAT_SCHEME}:${editorUri}?head`
        );

        const workTreeUri = vscode.Uri.parse(
          `${DIFF_WITH_FORMAT_SCHEME}:${editorUri}?worktree`
        );

        const { editor: headEditor } = await openEditorAndFormat(headUri);
        const { editor: worktreeEditor } = await openEditorAndFormat(
          workTreeUri
        );

        await vscode.commands.executeCommand(
          "vscode.diff",
          headEditor.document.uri,
          worktreeEditor.document.uri
        );
      } else {
        vscode.window.showInformationMessage("Can only be run on an open file");
      }
    }
  );

  context.subscriptions.push(disposable2, disposable1);
}

async function openEditorAndFormat(uri: vscode.Uri) {
  const document = await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(document);

  const textEdits: vscode.TextEdit[] = await vscode.commands.executeCommand(
    "vscode.executeFormatDocumentProvider",
    document.uri
  );

  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.set(document.uri, textEdits);
  let success = await vscode.workspace.applyEdit(workspaceEdit);

  return {
    editor,
    formatted: success,
  };
}

export function deactivate() {}
