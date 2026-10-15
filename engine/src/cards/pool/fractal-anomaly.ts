import { defineCard } from "../define.js";

// EDHREC rank 16178. X is read once, as it resolves (the ruling).

export default defineCard({
  name: "Fractal Anomaly",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Create a 0/0 green and blue Fractal creature token and put X +1/+1 counters on it, where X is the number of cards you've drawn this turn.",
  effect: {
    kind: "create-token",
    token: "Fractal Token",
    count: 1,
    thenCounters: { kind: "+1/+1", amount: { turnStat: "cards-drawn", who: "you" } },
  },
});
