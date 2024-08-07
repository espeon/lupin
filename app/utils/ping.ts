import pingus from "pingus";
import dns from "dns";
import lookup, { SearchOutput } from "country-code-lookup";
import maxmind, { CityResponse } from "maxmind";
import { loadEnv } from "vite";
import { EventEmitter } from "events";

export interface SiteInfo {
  ip: string;
  rev_dns: string | null;
  ip_lookup: CityResponse | null;
}

export interface PingResult {
  pop: string;
  popFlag: string;
  host: string;
  alive: boolean;
  time: number | null;
  timestamp: string;
  ip: string;
  ips?: string[];
  ipinfo: SiteInfo | null;
  message?: string | null;
}

export class PingEmitter extends EventEmitter {

  async pingWebsite(
    host: string,
    port: number = 443,
    include_ipinfo: boolean = false,
    emit: boolean = false
  ): Promise<PingResult | null> {
    try {
      const result = await pingus.tcp({
        host: host,
        port: 443,
        timeout: 3000,
        dnsServer: "1.1.1.1",
      });

      if (result.ip?.label === host) {
        const rev_dns = await new Promise<string | null>((resolve, reject) => {
          dns.reverse(host, (err, res) => {
            if (err) {
              resolve(null);
            } else {
              resolve(res.join(","));
            }
          });
        });
        if (rev_dns) {
          host = rev_dns;
        }
      }

      const pingResult: PingResult = {
        pop:
          loadEnv(process.env.NODE_ENV, process.cwd(), "POP")[1] || "us-east-1",
        popFlag:
          loadEnv(process.env.NODE_ENV, process.cwd(), "POP_FLAG")[1] || "us",
        host: host,
        alive: true,
        time: result.time || null,
        timestamp: new Date().toISOString(),
        ip: result.ip?.label || "",
        ips: result.ips.map((ip) => ip.label),
        ipinfo: include_ipinfo
          ? await icymip(result.ip?.label || "")
          : null,
        message: result.banner,
      };

      if (emit) {
        this.emit("pingSuccess", pingResult);
      } else {
        return pingResult;
      }
    } catch (error: any) {
      const pingResult: PingResult = {
        pop:
          loadEnv(process.env.NODE_ENV, process.cwd(), "POP")[1] || "us-east-1",
        popFlag:
          loadEnv(process.env.NODE_ENV, process.cwd(), "POP_FLAG")[1] || "us",
        host: host,
        alive: false,
        time: null,
        timestamp: new Date().toISOString(),
        ip: "",
        ips: [],
        ipinfo: null,
        message: error.message,
      };

      if (emit) {
        this.emit("pingError", pingResult);
      } else {
        return pingResult;
      }
    }

    return null;
  }

  async multiplePings(
    host: string,
    numPings: number,
    port: number = 443
  ): Promise<void> {
    for (let i = 0; i < numPings; i++) {
      const result = await this.pingWebsite(host, port, i == 0);
      if (result && result.alive) {
        this.emit("pingSuccess", result);
      } else {
        this.emit("pingError", result);
      }
    }
  }
}

// https://git.io/GeoLite2-City.mmdb

export async function icymip(ip: string): Promise<SiteInfo> {
    const mm = await maxmind.open<CityResponse>('./mmdb/GeoLite2-City.mmdb');
    const geo = mm.get(ip);
    const rev_dns = await new Promise<string | null>((resolve, reject) => {
      dns.reverse(ip, (err, res) => {
        if (err) {
          resolve(null);
        } else {
          resolve(res.join(","));
        }
      });
    });
    return {
      ip: ip,
      rev_dns: rev_dns,
      ip_lookup: geo,
    };
  }