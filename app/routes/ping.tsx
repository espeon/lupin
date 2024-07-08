import { LoaderFunction } from '@remix-run/node';
import { EventStream } from '@remix-sse/server';
import { PingEmitter } from '~/utils/ping';

const newPingClient = async (target: string, port: number, times: number, send: (event: string) => void) => {
  const emitter = new PingEmitter();

  emitter.on("pingSuccess", (result: any) => {
    send(`data: ${JSON.stringify(result)}\n\n`);
  });

  emitter.on("pingError", (result: any) => {
    send(`data: ${JSON.stringify(result)}\n\n`);
  });

  await emitter.multiplePings(target, times, port);
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const target = url.searchParams.get('target') || 'example.com';
  const times = parseInt(url.searchParams.get('times') || '5', 10);
  const port = parseInt(url.searchParams.get('port') || '443', 10);

  return new EventStream(request, async (send) => {

    const pingClients: Promise<void>[] = [];
    const targets = target.split(','); // Assuming target can be a comma-separated list

    targets.forEach((tgt) => {
      const pingClientPromise = newPingClient(tgt.trim(), port, times, send);
      pingClients.push(pingClientPromise);
    });

    await Promise.all(pingClients);

    send(`done:\n\n`);

    return () => {
      console.log("close");
    };
  });
};
