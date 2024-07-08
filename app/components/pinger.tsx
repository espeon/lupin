import { SearchOutput } from "country-code-lookup";
import React, { useEffect, useState } from "react";
import { PingResult, SiteInfo } from "~/utils/ping";
import PingResultRow from "./pingResultRow";

const DEFAULT = {
  defaultTarget: "",
  defaultTimes: 5,
  defaultPort: 443,
};

type PingResults = {
  [key: string]: PingResult[]
}
type SiteInfos = {
  [key: string]: SiteInfo
}

export default function Ping() {
  const { defaultTarget, defaultTimes, defaultPort } = DEFAULT;
  const [isLoading, setIsLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [pingResults, setPingResults] = useState<PingResults>({});
  const [siteInfo, setSiteInfo] = useState<SiteInfos>({});
  const [target, setTarget] = useState(defaultTarget);
  const [times, setTimes] = useState(defaultTimes);
  const [port, setPort] = useState(defaultPort);
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
  
  // doesnt work when inside the form pepega
  function disableForm() {
    setPingResults({});
    setSiteInfo({});
    setIsLoading(true);
    setTimeout(() => console.log("Component state has been partially reset"), 10);
    console.log(pingResults, siteInfo);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(target === "") return;
    console.log("Set isLoading");
    disableForm();
    // clearing results and siteInfo
    console.log("submit", target, times, port);

    if (eventSource) {
      eventSource.close();
      setIsLoading(true);
    }

    // set up event source
    const newEventSource = new EventSource(
      `/ping?target=${target}&times=${times}&port=${port}`
    );
    newEventSource.onmessage = (event) => {
      if (event.data.includes("data:")) {
        // get rid of data:
        let data = event.data.replace("data:", "");
        console.log(data);
        const thisEvent: PingResult = JSON.parse(data);
        // if we have ipinfo, set the info
        if (thisEvent.ipinfo) {
          setSiteInfo({
            ...siteInfo,
            [thisEvent.pop]: thisEvent.ipinfo,
          });
        }
        console.log([...pingResults[thisEvent.pop] ?? [], thisEvent])
        setPingResults((prevResults) => ({
          ...prevResults,
          [thisEvent.pop]: [...(prevResults[thisEvent.pop] || []), thisEvent],
        }));
        console.log("pingResults", pingResults);
      } else if (event.data.includes("done:")) {
        // destroy event source when done
        eventSource?.close();
        setIsLoading(false);
      } else {
        console.log("Unexpected event: ", event.data);
      }
    };
    setEventSource(newEventSource);
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
        <label className="flex flex-col">
          <div className="text-sm">Times to ping</div>
          <input
            type="number"
            value={times}
            className="border shadow-sm rounded-lg p-1 px-2"
            onChange={(e) => setTimes(parseInt(e.target.value, 10))}
          />
        </label>
        <label className="flex flex-col">
          <div className="text-sm">Port</div>
          <input
            type="number"
            value={port}
            className="border shadow-sm rounded-lg p-1 px-2"
            onChange={(e) => setPort(parseInt(e.target.value, 10))}
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

      <ul className="mt-4 overflow-x-auto">
        <div className="h-8">
          <div className="text-xl font-semibold text-slate-700/75 dark:text-slate-200/75 flex place-items-end align-text-bottom h-full">
            <span className="font-normal mr-1">
              {!siteInfo && `Tak${isLoading ? "ing" : "e"} the Mr. `}Ping
              {siteInfo ? "ing" : " Challenge!"}
            </span>{" "}
            {pingResults["us-east-1"]?.[0]?.host || siteInfo["us-east-1"]?.ip || ""}
          </div>
        </div>
        <table className="table-fixed min-w-full max-w-sc w-[768px]">
          <thead
            className={`text-slate-700/75 dark:text-slate-200/75 font-thin border-b border-gray-500/50 transition-all duration-150 ${
              isLoading || siteInfo
                ? "opacity-30 border-gray-500/10"
                : "opacity-100 border-gray-500/50"
            }`}
          >
            <tr>
              <th className="text-start font-light py-2 w-28">POP</th>
              <th className="text-start font-light py-2">Host</th>
              <th className="text-start font-light py-2">IP</th>
              <th className="text-start font-light py-2 w-12">Loss</th>
              <th className="text-start font-light py-2 w-12">Sent</th>
              <th className="text-start font-light py-2 w-12">Last</th>
              <th className="text-start font-light py-2 w-16">Avg</th>
              <th className="text-start font-light py-2 w-16">Best</th>
              <th className="text-start font-light py-2 w-16">Worst</th>
              <th className="text-start font-light py-2 w-16">St. Dev.</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(pingResults).map((pop) => (
              <PingResultRow
                key={pop}
                pingResults={pingResults[pop]}
                siteInfo={siteInfo?.[pop]}
              />
            ))}
          </tbody>
        </table>
      </ul>
    </div>
  );
}
