import * as vscode from "vscode";
import { basename, dirname } from "path";
import { exec as rawExec } from "child_process";
import { promisify } from "util";

const exec = promisify(rawExec);

type GitInfo =
  | { git: false }
  | { git: true; rootPath: string; relativePath: string };

async function runGit(...gitArgs: string[]) {
  const gitPath = vscode.workspace.getConfiguration().get("git.path");
  const git = gitPath || "git";

  const { stdout } = await exec([git, ...gitArgs].join(" "));
  return stdout;
}

async function getHeadFile(fileUri: vscode.Uri) {
  const gitInfo = await getGitInfo(fileUri.fsPath);

  if (gitInfo.git) {
    return await runGit(
      "-C",
      gitInfo.rootPath,
      "show",
      `HEAD:${gitInfo.relativePath}`
    );
  }
}

async function getGitInfo(filePath: string): Promise<GitInfo> {
  const parentDir = dirname(filePath);
  try {
    const gitDirPath = (
      await runGit("-C", parentDir, "rev-parse", "--git-dir")
    ).trim();

    if (gitDirPath === ".git") {
      return {
        git: true,
        rootPath: parentDir,
        relativePath: basename(filePath),
      };
    } else {
      const gitRootPath = gitDirPath.slice(0, gitDirPath.length - 4);

      return {
        git: true,
        rootPath: gitRootPath,
        relativePath: filePath.slice(gitRootPath.length),
      };
    }
  } catch (e) {
    console.error(e);
    return {
      git: false,
    };
  }
}

export { getHeadFile };
