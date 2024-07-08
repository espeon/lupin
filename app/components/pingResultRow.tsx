import { PingResult, SiteInfo } from "~/utils/ping";

export default function PingResultRow ({ pingResults, siteInfo }: { pingResults: PingResult[], siteInfo: SiteInfo | null }) {
    const revdns = siteInfo?.rev_dns?.split(",") || [];
    const last = pingResults[pingResults.length - 1];
    return (
            <tr>
              <td>🇺🇸 us-east-1</td>
              <td>{last?.host}</td>
              <td>
                {siteInfo?.ip}
                {siteInfo?.ip_lookup && (
                  <span
                    className={`text-sm text-slate-700/75 ml-1.5 ${
                      siteInfo.ip_lookup || siteInfo.rev_dns ? "" : "hidden"
                    }`}
                  >
                    ({revdns[0] + (revdns.length > 1 ? `, +${revdns.length - 1}` : "" )}
                    {siteInfo.ip_lookup &&
                      `${siteInfo.rev_dns ? " • " : ""}${[
                        siteInfo.ip_lookup.city,
                        siteInfo.ip_lookup.region,
                        siteInfo.ip_lookup_country?.country ??
                          siteInfo.ip_lookup.country,
                      ]
                        .filter((x: string) => (x == "" ? false : true))
                        .join(", ")}`}
                    )
                  </span>
                )}
              </td>
              <td>{pingResults.filter((r: { alive: any; }) => !r.alive).length}</td>
              <td>{pingResults.length}</td>
              <td>{last?.time}</td>
              <td>
                {(
                  pingResults.reduce((acc: any, r: { time: any; }) => acc + r.time!, 0) /
                  pingResults.length
                ).toFixed(1)}
              </td>
              <td>
                {pingResults
                  .sort((a: { time: any; }, b: { time: any; }) => a.time! - b.time!)[0]
                  .time?.toFixed(1)}
              </td>
              <td>
                {pingResults
                  .sort((a: { time: any; }, b: { time: any; }) => b.time! - a.time!)[0]
                  .time?.toFixed(1)}
              </td>
              <td>
                {(
                  pingResults
                    .sort((a: { time: any; }, b: { time: any; }) => b.time! - a.time!)
                    .reduce((acc: any, r: { time: any; }) => acc + r.time!, 0) / pingResults.length
                ).toFixed(1)}
              </td>
            </tr>
          )
        }