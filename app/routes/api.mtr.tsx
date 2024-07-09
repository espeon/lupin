import { json, LoaderFunction } from '@remix-run/node';
import {Mtr} from '../utils/mtr';
import { EventStream } from '@remix-sse/server';

let mtrService = new Mtr();

export let loader: LoaderFunction = ({ request }) => {
  // get param target
  const url = new URL(request.url);
  const target = url.searchParams.get('target') || 'example.com';
  return new EventStream(request, async (send) => {
    mtrService.on('data', (data) => {
      console.log(data);
      send(`data: ${JSON.stringify(data)}`);
    })

    mtrService.on('close', () => {
      send('done:\n');
    });

    mtrService.on('exit', ({ code, signal }) => {
      send(`done: { code: ${code}, signal: ${signal} }\n`);
    });

    mtrService.startMtr(target);

    return () => {
      console.log("close");
    };
  });
};