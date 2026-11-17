import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const remote = 'https://github.com/NPCLABS-19/four-four-fretboard.git';
const run = (command, args, cwd = root, env = process.env) => execFileSync(command, args, { cwd, env, stdio: 'inherit' });
const read = (args, cwd = root) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

run('npm', ['run', 'check']);
run('npm', ['run', 'build'], root, { ...process.env, GITHUB_PAGES: 'true', PUBLIC_HIDE_OVERVIEW: process.env.PUBLIC_HIDE_OVERVIEW ?? 'true', PUBLIC_SOUND_DEFAULT: process.env.PUBLIC_SOUND_DEFAULT ?? 'on' });
const stage = mkdtempSync(join(tmpdir(), 'four-four-pages-'));
try {
  run('git', ['init', '-b', 'gh-pages'], stage);
  run('git', ['remote', 'add', 'origin', remote], stage);
  if (read(['ls-remote', '--heads', remote, 'gh-pages'])) {
    run('git', ['fetch', '--depth=1', 'origin', 'gh-pages'], stage);
    run('git', ['reset', '--hard', 'FETCH_HEAD'], stage);
    run('git', ['rm', '-r', '--ignore-unmatch', '.'], stage);
  }
  for (const name of readdirSync(join(root, 'dist'))) {
    cpSync(join(root, 'dist', name), join(stage, name), { recursive: true });
  }
  // Local research ledgers and contact sheets are not part of the website.
  for (const name of ['asset-sources.json', 'cover-candidates.json', 'contact-sheet.jpg']) {
    rmSync(join(stage, 'images', name), { force: true });
  }
  writeFileSync(join(stage, '.nojekyll'), '');
  run('git', ['config', 'user.name', read(['config', 'user.name'])], stage);
  run('git', ['config', 'user.email', read(['config', 'user.email'])], stage);
  run('git', ['add', '.'], stage);
  if (read(['status', '--porcelain'], stage)) {
    run('git', ['commit', '-m', 'Deploy 4/4 fretboard'], stage);
    run('git', ['push', 'origin', 'HEAD:gh-pages'], stage);
  }
  console.log('Published branch: https://npclabs-19.github.io/four-four-fretboard/');
} finally {
  rmSync(stage, { recursive: true, force: true });
}
