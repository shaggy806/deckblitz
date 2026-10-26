import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 28433. Ambush's shape for attackers.

export default defineCard({
  name: "Headlong Rush",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Attacking creatures gain first strike until end of turn.",
  effect: {
    kind: "grant-keyword-all",
    filter: { type: "creature", attacking: true },
    keyword: "first-strike",
    duration: "end-of-turn",
  },
});
