import { defineCard } from "../define.js";

// EDHREC rank 27383. Amonkhet.
export default defineCard({
  name: "Shed Weakness",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. You may remove a -1/-1 counter from it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "may",
        prompt: "Remove a -1/-1 counter from it?",
        effect: { kind: "remove-counter", target: 0, counter: "-1/-1", amount: 1 },
      },
    ],
  },
});
