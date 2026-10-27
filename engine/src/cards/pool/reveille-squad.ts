import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 17963.
//
// "Whenever one or more creatures attack you" fires once per declaration that attacks this
// player (`attacks-player`, `defender: "you"` — Orim's Prayer); "if this creature is untapped"
// is an intervening-if (rule 603.4), checked as it triggers and again as it resolves.

const TEXT =
  "Whenever one or more creatures attack you, if this creature is untapped, you may untap all creatures you control.";

export default defineCard({
  name: "Reveille Squad",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "you" },
      condition: { kind: "source", filter: { tapped: false } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap all creatures you control?",
        effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
