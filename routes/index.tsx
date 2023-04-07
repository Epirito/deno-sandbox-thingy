import { Head } from "$fresh/runtime.ts";
import App from "../islands/App.tsx";
import Counter from "../islands/Counter.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div><App/></div>
    </>
  );
}
