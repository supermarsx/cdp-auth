import { msgBox } from './notify.js';

export async function throwErrorAndQuit({ title, message, exitCode = 1 }: { title: string, message: string, exitCode: number }): Promise<void> {
    await msgBox({ title, message, isError: true });
    console.log(message);
    process.exit(exitCode);
}