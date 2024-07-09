import EventEmitter from "events";
import { spawn } from "child_process";
import { icymip, SiteInfo } from "./ping";

/*
hostline|xmitline|pingline|dnsline|timestampline|mplsline

hostline:
h <pos> <host IP>

xmitline:
x <pos> <seqnum>

pingline:
p <pos> <pingtime (ms)> <seqnum>

dnsline: 
d <pos> <hostname>

timestampline:
t <pos> <pingtime> <timestamp>

mplsline:
m <pos> <label> <traffic_class> <bottom_stack> <ttl>
*/

export interface Host {
    type: "h";
    hop: number;
    host: string;
    location: SiteInfo;
}

export interface Xmit {
    type: "x";
    hop: number;
    seqnum: number;
}

export interface Ping {
    type: "p";
    hop: number;
    pingtime: number;
    seqnum: number;
}

export interface Dns {
    type: "d";
    hop: number;
    hostname: string;
}

export interface Timestamp {
    type: "t";
    hop: number;
    pingtime: number;
    timestamp: string;
}

export interface Mpls {
    type: "m";
    hop: number;
    label: number;
    traffic_class: number;
    bottom_stack: number;
    ttl: number;
}

export type MtrData = Host | Xmit | Ping | Dns | Timestamp | Mpls;

export class Mtr extends EventEmitter {
  constructor() {
    super();
  }

  startMtr(target: string, port: number = 443) {
    let cycles = 8;
    const mtr = spawn("mtr", ["-lc", String(cycles), target]);
    mtr.stdout.on("data", (data) => {
      this.parseData(data);
    });

    // Listen for the close event
    mtr.stdout.on("close", () => {
      this.emit("close");
    });

    // Listen for the exit event
    mtr.on("exit", (code, signal) => {
      this.emit("exit", { code, signal });
    });
  }

  parseData(data: Buffer) {
    const lines = data.toString().split("\n");
    lines.forEach(async (line) => {
      const parsedLine = await this.parseLine(line);
      if (parsedLine) {
        this.emit("data", parsedLine);
      }
    });
  }

  async parseLine(line: string): Promise<MtrData | null> {
    const parts = line.split(" ");
    if (parts.length === 0) return null;
    switch (parts[0]) {
      case "h":
        let loc: SiteInfo = await icymip(parts[2]);
        return {
          type: "h",
          hop: parseInt(parts[1], 10),
          host: parts[2],
          location: loc,
        };
      case "x":
        return {
          type: "x",
          hop: parseInt(parts[1], 10),
          seqnum: parseInt(parts[2], 10),
        };
      case "p":
        return {
          type: "p",
          hop: parseInt(parts[1], 10),
          pingtime: parseInt(parts[2], 10),
          seqnum: parseInt(parts[3], 10),
        };
      case "d":
        return {
          type: "d",
          hop: parseInt(parts[1], 10),
          hostname: parts[2],
        };
      case "t":
        return {
          type: "t",
          hop: parseInt(parts[1], 10),
          pingtime: parseInt(parts[2], 10),
          timestamp: parts[3],
        };
      case "m":
        return {
          type: "m",
          hop: parseInt(parts[1], 10),
          label: parseInt(parts[2], 10),
          traffic_class: parseInt(parts[3], 10),
          bottom_stack: parseInt(parts[4], 10),
          ttl: parseInt(parts[5], 10),
        };
      default:
        return null;
    }
  }
}
