import { runCommand } from './commands.js';

export async function msgBox({ title, message, isError = false }: { title: String, message: String, isError: Boolean }): Promise<void> {
    const command: string = `messagebox.exe`;
    const parameters: string = `"${title}" "${message}" ${isError}`;
    await runCommand({ command, parameters });
}