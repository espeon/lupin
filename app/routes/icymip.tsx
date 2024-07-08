import { json, LoaderFunction } from "@remix-run/node";
import geoip from "fast-geoip";
import dns from "dns";
import lookup from 'country-code-lookup'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const ip = url.searchParams.get('ip');
  if (!ip) {
    return json({ error: 'Please provide an IP address' }, { status: 400 });
  }
  const geo = await geoip.lookup(ip);
  const rev_dns = await new Promise<string | null>((resolve, reject) => {
    dns.reverse(ip, (err, res) => {
      if (err) {
        resolve(null);
      } else {
        resolve(res.join(','));
      }
    });
  });
  return json({
    ip: ip,
    rev_dns: rev_dns,
    ip_lookup: geo,
    ip_lookup_country: lookup.byIso(geo?.country ?? "SWE") ?? null
  });
}
