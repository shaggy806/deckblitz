import { defineCard } from "../define.js";

// EDHREC rank 9711.

export default defineCard({
  name: "Maximum Overdrive",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature. It gains deathtouch and indestructible until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
});
