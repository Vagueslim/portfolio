// Compatibility entrypoint: the old QA assumed four cards and the old Home menu.
import { spawnSync } from 'node:child_process';
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['test'], {
  stdio: 'inherit', shell: process.platform === 'win32'
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
