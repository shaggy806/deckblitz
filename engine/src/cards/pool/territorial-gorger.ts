import { defineCard } from "../define.js";

// EDHREC rank 24835. "Whenever you get one or more {E}": a `counters-put`
// trigger with `orPlayer` and `counter: "energy"`, `who: "you"` reading the
// player who got them. Once per event however many (the ruling).
export default defineCard({
  name: "Territorial Gorger",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Gremlin"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nWhenever you get one or more {E} (energy counters), this creature gets +2/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "counters-put", who: "you", counter: "energy", orPlayer: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you get one or more {E} (energy counters), this creature gets +2/+2 until end of turn.",
    },
  ],
});
