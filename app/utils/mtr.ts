import EventEmitter from 'events';
import { spawn } from 'child_process';

export interface Hop {
    type: 'x';
    hop: number;
    probe: number;
  }
  
  export interface Host {
    type: 'h';
    hop: number;
    host: string;
  }
  
  export interface PacketLoss {
    type: 'p';
    hop: number;
    loss: number;
    probe: number;
  }
  
  export type MtrData = Hop | Host | PacketLoss;

export class Mtr extends EventEmitter {
    constructor() {
        super();
    }

    startMtr(target: string, port: number = 443) {
        let cycles = 8;
        const mtr = spawn('mtr', [
            '-lc',
            String(cycles),
            target
        ]);
        mtr.stdout.on('data', (data) => {
            this.emit('data', data.toString());
        });
    }

    parseData(data: string) {
        const lines = data.split('\n');
        lines.forEach(line => {
            const parsedLine = this.parseLine(line);
            if(parsedLine) this.emit('data', parsedLine);
        });
    }

    parseLine(line: string): MtrData | null {
        const parts = line.split(' ');
}