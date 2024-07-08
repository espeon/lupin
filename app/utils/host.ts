import { exec } from 'child_process'

export interface HostResult {
    hostname: string;
    ipv4Results: string[];
    ipv6Results: string[];
    mxResults: string[];
  }
/**
 * Runs a command and returns a Promise that resolves with the stdout.
 * @param cmd - The command to run.
 * @returns A Promise that resolves with the stdout of the command.
 */
function run(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout: string, stderr: string) => {
        if (error) return reject(error)
        if (stderr) return reject(stderr)
        resolve(stdout)
      })
    })
  }
export async function runHost(hostname: string): Promise<HostResult> {
  try {
    const result = await run(`host ${hostname}`)
    if(!result) {
      throw new Error('No results returned from Host command')
    }
    const lines = result.split("\n");
    console.log(lines)

    let v4: string[] = [];
    let v6: string[] = [];
    let mx: string[] = [];

    lines.forEach((line: string) => {
        if (line.includes("mail is handled by ")) {
            const parts = line.split("mail is handled by ");
            mx.push(parts[1]);
        } else if (line.includes("has address ")) {
            const parts = line.split("has address ");
                v4.push(parts[1]);
        } else if (line.includes("has IPv6 address ")) {
            const parts = line.split("has IPv6 address ");
            v6.push(parts[1]);
        }
    })


    return {
      hostname: hostname,
      ipv4Results: v4,
      ipv6Results: v6,
      mxResults: mx,
    };
  } catch (error) {
    console.error(error);
    return {
      hostname: hostname,
      ipv4Results: [],
      ipv6Results: [],
      mxResults: [],
    };
  }
}