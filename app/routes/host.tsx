import { useLoaderData } from "@remix-run/react";
import Host from "~/components/host";
import { ThemeToggle } from "~/components/themeToggle";

export default function Index() {
  return (
    <div className="flex flex-row pt-8 justify-center items-center px-4">
      <div className="max-w-screen-xl container">
        <h1 className="text-4xl mb-4">Lupin</h1>
        <div className="flex flex-row mb-4">
          <a href="/" className="text-lg mb-2 rounded-xl px-4 -ml-4 hover:bg-slate-500 duration-150">
            Ping
          </a>
          <a
            href="/host"
            className="text-lg mb-2 rounded-xl px-4 hover:bg-slate-500 bg-slate-500/40 duration-150"
          >
            Host
          </a>
          <a
            href="/traceroute"
            className="text-lg mb-2 rounded-xl px-4 hover:bg-slate-500 duration-150"
          >
            Traceroute
          </a>
          <div className="flex-1" />
          <ThemeToggle />
        </div>
        <Host />
      </div>
    </div>
  );
}
