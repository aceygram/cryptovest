import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async () => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1"
    );

    const data = await res.json();

    const prices = data?.prices ?? [];

    const formatted = prices.map((item: number[]) => ({
      time: item[0] / 1000,
      value: item[1],
    }));

    return new Response(JSON.stringify(formatted), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err) {
    return new Response(JSON.stringify([]), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});