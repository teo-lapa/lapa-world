import { cp, mkdtemp, rm, access, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
await access(join(root,'dist','index.html'));
const git=(args,cwd=root)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const remote=git(['remote','get-url','origin']);
if(!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?$/.test(remote))throw new Error('Expected a GitHub HTTPS origin without embedded credentials.');
const authorName=git(['config','user.name']);
const authorEmail=git(['config','user.email']);
const parent=resolve(tmpdir());
const stage=await mkdtemp(join(parent,'lapa-world-pages-'));
try {
  git(['init','-b','gh-pages'],stage);
  git(['remote','add','origin',remote],stage);
  // Preserve branch history when updating an existing deployment.
  const existing=git(['ls-remote','--heads',remote,'gh-pages']);
  if(existing){git(['fetch','--depth=1','origin','gh-pages'],stage);git(['reset','--soft','FETCH_HEAD'],stage);}
  await cp(join(root,'dist'),stage,{recursive:true});
  await writeFile(join(stage,'.nojekyll'),'');
  git(['add','--all'],stage);
  git(['-c',`user.name=${authorName}`,'-c',`user.email=${authorEmail}`,'commit','-m',`Publish LAPA World ${git(['rev-parse','--short','HEAD'])}`],stage);
  git(['push','origin','HEAD:gh-pages'],stage);
  console.log('Published build to gh-pages.');
} finally {
  const verified=resolve(stage);
  if(dirname(verified)===parent&&basename(verified).startsWith('lapa-world-pages-'))await rm(verified,{recursive:true,force:true});
}
