const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function run() {

  const millPath = path.join(os.homedir(), 'mill', 'bin');

  try {
    const millVersion = core.getInput('mill-version');
    
    var cachedMillPath = tc.find('mill', millVersion);
    if (!cachedMillPath) {
      core.info('no cached version found');
      core.info('downloading mill');
      await tc.downloadTool(`https://github.com/lihaoyi/mill/releases/download/${millVersion}/${millVersion}-assembly`, millPath);
      // await io.mkdirP(millPath);
      // await io.cp(downloadPath, `${millPath}/mill`, { force: true });
      fs.chmodSync(`${millPath}`, '0755')
      cachedMillPath = await tc.cacheDir(millPath, 'mill', millVersion);
    } else {
      core.info(`using cached version of mill: ${cachedMillPath}`);
    }
    core.addPath(cachedMillPath);

    // warm up mill, this populates ~/.mill
    // TODO: once caching across workflow invocations is available, this dorectory should be cached too
    //       (note that caching would only help for multiple jobs, as data is cached in the home directory
    //       which is shared across steps)
    await exec.exec('mill', ['version']);
  }
  catch (error) {
    core.setFailed(error.message);
  }

}

run()
