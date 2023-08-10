import { runCommand } from './commands.js';

/**
 * Build nodejs SEA, build script
 * 
 * @since 0.0.1
 */
export async function buildExecutable(): Promise<void> {
    console.log({ message: `Building executable` });

    console.log({ message: `Creating blob` });
    const nodeBin: string = `node`;
    const blobParameters: string = `--experimental-sea-config sea-config.json`;
    await runCommand({ command: nodeBin, parameters: blobParameters });

    console.log({ message: `Copying node binary` });
    const binaryName: string = `./sea/dist/cdp-auth.exe`;
    const nodeCopyParameters: string = `-e "require('fs').copyFileSync(process.execPath, '${binaryName}')"`;
    await runCommand({ command: nodeBin, parameters: nodeCopyParameters });

    console.log({ message: `Removing signature` });
    const signtoolBin: string = `signtool`;
    const signtoolUnsigningParameters: string = `remove /s ${binaryName}`;
    await runCommand({ command: signtoolBin, parameters: signtoolUnsigningParameters });

    console.log({ message: `Injecting script` });
    const npxBin: string = `npx`;
    const fuseRandomBytes: string = `fce680ab2cc467b6e072b8b5df1996b2`
    const injectionParameters1: string = `postject ${binaryName} NODE_SEA_BLOB ./sea/sea-prep.blob`;
    const injectionParameters2: string = `--sentinel-fuse NODE_SEA_FUSE_${fuseRandomBytes}`;
    const injectionParameters: string = `${injectionParameters1} ${injectionParameters2}`;
    await runCommand({ command: npxBin, parameters: injectionParameters });

    console.log({ message: `Built unsigned node sea binary` });
}

