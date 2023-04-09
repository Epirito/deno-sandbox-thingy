import { Head } from "$fresh/runtime.ts";
import SandboxApp from "../islands/SandboxApp.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div style={{backgroundColor: 'black', color: 'white'}}><SandboxApp/></div>
    </>
  );
}
