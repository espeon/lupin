import { SearchOutput } from "country-code-lookup";
import React, { useEffect, useState } from "react";
import { PingResult, SiteInfo } from "~/utils/ping";
import PingResultRow from "./pingResultRow";
import { HostResult } from "~/utils/host";

const DEFAULT = {
  defaultTarget: "",
};

type PingResults = {
  [key: string]: PingResult[];
};
type SiteInfos = {
  [key: string]: SiteInfo;
};

export default function Host() {
  const { defaultTarget } = DEFAULT;
  const [isLoading, setIsLoading] = useState(false);
  const [host, setHost] = useState<HostResult | string | null>();
  const [target, setTarget] = useState(defaultTarget);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (target === "") return;

    fetch(`/api/host?target=${target}`)
      .then((res) => res.json())
      .then((data: HostResult) => {
        if (data.ipv4Results.length === 0 && data.ipv6Results.length === 0 && data.mxResults.length === 0) {
          setHost("No results found");
          return;
        }
        setHost(data);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4">
        <label className="flex flex-col flex-1 justify-end">
          <div className="text-sm">Target URL</div>
          <input
            type="text"
            value={target}
            placeholder="nlayer.net"
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
            Run
          </button>
        </div>
      </form>
      <div className="mt-4">
        {typeof host === "string" && <p>{host}</p>}
        {typeof host !== null && typeof host !== "string" && host && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-2">
              <h3 className="text-xl w-12 text-right">IPv4:</h3>
              <div className="flex flex-col gap-1 border-l pl-2 pt-0.5">
                {host.ipv4Results.length === 0 && (
                  <div className="font-mono">No results found</div>
                )}
                {host.ipv4Results.map((result) => (
                  <div className="font-mono">{result} </div>
                ))}
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <h3 className="text-xl w-12 text-right">IPv6:</h3>
              <div className="flex flex-col gap-1 border-l pl-2 pt-0.5">
                {host.ipv6Results.length === 0 && (
                  <div className="font-mono">No results found</div>
                )}
                {host.ipv6Results.map((result) => (
                  <div className="font-mono">{result} </div>
                ))}
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <h3 className="text-xl w-12 text-right">MX:</h3>
              <div className="flex flex-col gap-1 border-l pl-2 pt-0.5">
                {host.mxResults.length === 0 && <div className="font-mono">No results found</div>}
                {host.mxResults.map((result) => (
                  <div className="font-mono">{result} </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
