import { Head } from "$fresh/runtime.ts";
import SingleplayerSandboxApp from "../islands/SingleplayerSandboxApp.tsx";

export default function Home() {
    return (
      <>
        <Head>
          <title>Fresh App</title>
        </Head>
        <div style={{backgroundColor: 'black', color: 'white'}}><SingleplayerSandboxApp/></div>
      </>
    );
  }
  