import { json, LoaderFunction } from "@remix-run/node";
import { runHost } from "~/utils/host";

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const host = url.searchParams.get('target');
    if (!host) {
      return json({ error: 'Please provide a hostname' }, { status: 400 });
    }
    return runHost(host);
  }
  