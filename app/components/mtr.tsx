import { useEffect, useState } from "react";
import {
  Dns,
  Host,
  Mpls,
  Mtr,
  MtrData,
  Ping,
  Timestamp,
  Xmit,
} from "../utils/mtr";
import { stdDev } from "~/utils/math";

type MtrHopMap = {
  [key: number]: MtrHop;
};

export interface MtrHop {
  host?: Host;
  dns?: Dns;
  xmit?: Xmit[];
  packets?: Ping[];
  timestamp?: Timestamp[];
  mpls?: Mpls[];
}

const MtrStream = () => {
  const [data, setData] = useState<MtrHopMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [target, setTarget] = useState<string>("");
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
        setIsLoading(false);
      } else if (eventSource !== null) {
        setIsLoading(true);
      }
    };
  }, [eventSource]);

  useEffect(() => {
    if (target === "") setIsLoading(true);
    else setIsLoading(false);
  }, [target]);

  function reset() {
    setData({})
    setIsLoading(true);
    setTimeout(() => console.log("Component state has been partially reset"), 10);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventSource = new EventSource("/api/mtr?target=" + target);

    eventSource.onmessage = (event) => {
      if (event.data.includes("data: ")) {
        const res: MtrData = JSON.parse(event.data.slice(5));
        if (res.type === "h") {
          setData((prev) => ({
            ...prev,
            [res.hop]: {
              host: res,
            },
          }));
        } else if (res.type === "d") {
          setData((prev) => ({
            ...prev,
            [res.hop]: {
              ...prev[res.hop],
              dns: res,
            },
          }));
        } else if (res.type === "x") {
          setData((prev) => ({
            ...prev,
            [res.hop]: {
              ...prev[res.hop],
              xmit: [...(prev[res.hop]?.xmit ?? []), res],
            },
          }));
        } else if (res.type === "p") {
          setData((prev) => ({
            ...prev,
            [res.hop]: {
              ...prev[res.hop],
              packets: [...(prev[res.hop]?.packets ?? []), res],
            },
          }));
        } else if (res.type === "t") {
          setData((prev) => ({
            ...prev,
            [res.hop]: {
              ...prev[res.hop],
              timestamp: [...(prev[res.hop]?.timestamp ?? []), res],
            },
          }));
        } else if (res.type === "m") {
          setData((prev) => ({
            ...prev,
            [res.hop]: {
              ...prev[res.hop],
              mpls: [...(prev[res.hop]?.mpls ?? []), res],
            },
          }));
        }
        console.log(data);
      } else if (event.data.includes("done:")) {
        setIsLoading(false);
        eventSource.close();
      }
    };

    eventSource.addEventListener("close", () => {
      setIsLoading(false);
      eventSource.close();
    });

    eventSource.addEventListener("exit", (event) => {
      const { code, signal } = JSON.parse(event.data);
      console.log({ code, signal });
      eventSource.close();
    });

    setEventSource(eventSource);

    return () => {
      eventSource.close();
    };
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4">
        <label className="flex flex-col flex-1 justify-end">
          <div className="text-sm">Target URL</div>
          <input
            type="text"
            value={target}
            placeholder="1e100.net"
            className="border shadow-sm rounded-lg p-1 px-2 bg-white dark:bg-gray-900"
            onChange={(e) => setTarget(e.target.value)}
          />
        </label>
        <div className="flex flex-col">
          <div className="flex-1" />
          <button
            type="submit"
            className="border border-black dark:border-white rounded-xl h-[2.135rem] w-16 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Ping
          </button>
        </div>
      </form>

      <div className="h-8">
        <div className="text-xl font-semibold text-slate-700/75 dark:text-slate-200/75 flex place-items-end align-text-bottom h-full">
          <span className="font-normal mr-1">{data[0] && "Tracing "}</span>{" "}
          {target || ""}
        </div>
      </div>
      <table className="table-fixed min-w-full max-w-sc w-[768px]">
        <thead
          className={`text-slate-700/75 dark:text-slate-200/75 font-thin border-b border-gray-500/50 transition-all duration-150 ${
            isLoading
              ? "opacity-30 border-gray-500/10"
              : "opacity-100 border-gray-500/50"
          }`}
        >
          <tr>
            <th className="text-start font-light py-2 w-10">Hop</th>
            <th className="text-start font-light py-2">IP</th>
            <th className="text-start font-light py-2">Location</th>
            <th className="text-start font-light py-2 w-12">Loss</th>
            <th className="text-start font-light py-2 w-14">Sent</th>
            <th className="text-start font-light py-2 w-16">Last</th>
            <th className="text-start font-light py-2 w-16">Avg</th>
            <th className="text-start font-light py-2 w-16">Best</th>
            <th className="text-start font-light py-2 w-16">Worst</th>
            <th className="text-start font-light py-2 w-16">St. Dev.</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            Object.keys(data).map((hopNum, i, arr) => {
              let hop = data[i];
              return (
                <tr key={hopNum}>
                  <td>{hopNum}</td>
                  <td>
                    {hop?.host?.host || "?"}
                    <span className="text-sm text-slate-700/75 ml-1.5">
                      {hop?.dns?.hostname && ` (${hop?.dns?.hostname})`}
                    </span>
                  </td>
                  <td className="text-sm text-slate-500/85">
                    {`${
                      (hop?.host?.location?.ip_lookup?.city?.names.en &&
                        `${hop?.host?.location?.ip_lookup?.city.names.en},`) ||
                      ""
                    } ${
                      hop?.host?.location?.ip_lookup?.country?.names.en || ""
                    }` || ""}
                    {hop?.host?.location.rev_dns &&
                      ` (${hop?.host?.location.rev_dns.split(",")[0]}${
                        hop?.host?.location.rev_dns.split(",").length > 1 ? `, +${hop?.host?.location.rev_dns.split(",").length - 1}` : ""
                      })`}
                  </td>
                  {/* compare btwn xmit and packets for loss */}
                  <td className="">{hop?.packets && hop?.xmit && ((hop?.xmit.length - hop?.packets.length) / hop?.xmit.length * 100).toFixed(0) + "%"}</td>
                  <td className="">{hop?.packets && hop?.packets.length}</td>
                  <td className="">{(hop?.packets && (hop?.packets[hop?.packets.length - 1].pingtime/1000).toFixed(2)) || ""}</td>
                  <td className="">{(hop?.packets && (hop?.packets.map(p => p.pingtime).reduce((a, b) => a + b, 0) / hop?.packets.length/1000).toFixed(2)) || ""}</td>
                  <td className="">{(hop?.packets && (hop?.packets.sort((a, b) => a.pingtime - b.pingtime)[0].pingtime/1000).toFixed(2)) || ""}</td>
                  <td className="">{(hop?.packets && (hop?.packets.sort((a, b) => b.pingtime - a.pingtime)[0].pingtime/1000).toFixed(2)) || ""}</td>
                  {/* st. dev. */}
                  <td className="">{(hop?.packets && stdDev(hop?.packets.map(p => p.pingtime/1000)).toFixed(2)) || ""}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default MtrStream;
